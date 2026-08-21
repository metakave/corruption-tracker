import puppeteer from 'puppeteer'
import { NewsSourceScraper, ScrapedArticle } from './types'

export class AjkerPatrikaScraper implements NewsSourceScraper {
    name = 'Ajker Patrika'
    baseUrl = 'https://www.ajkerpatrika.com/latest-news'

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper...`)
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        })
        const page = await browser.newPage()
        await page.setViewport({ width: 1280, height: 1080 })

        try {
            console.log(`Navigating to ${this.baseUrl}...`)
            await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })

            // Wait for initial load
            await page.waitForSelector('a.group', { timeout: 30000 });

            // Pagination Loop (Aiming for high yield)
            let attempt = 0
            const MAX_ATTEMPTS = 150 // Increased to ensure 100+ articles

            while (attempt < MAX_ATTEMPTS) {
                // Extract last article time to check if we hit 24h
                const oldestTimeStr = await page.evaluate(() => {
                    const items = Array.from(document.querySelectorAll('a.group'));
                    const lastItem = items[items.length - 1];
                    if (!lastItem) return 'N/A';
                    const timeSpan = Array.from(lastItem.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('আগে'));
                    return timeSpan?.textContent?.trim() || 'N/A';
                });

                console.log(`   [Attempt ${attempt}] Oldest article: ${oldestTimeStr}`);

                // Stopping condition: If we see "1 day ago" or similar
                if (oldestTimeStr.includes('১ দিন') || oldestTimeStr.includes('২ দিন') || oldestTimeStr.includes('গতকাল')) {
                    console.log(`   ✅ Reached 24h limit. Stopping.`);
                    break;
                }

                // Scroll and Click Load More
                const clicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const loadMore = buttons.find(b => b.textContent?.includes('আরও দেখুন') || b.textContent?.includes('লোড হচ্ছে'));
                    if (loadMore && !(loadMore as HTMLButtonElement).disabled) {
                        loadMore.scrollIntoView();
                        (loadMore as HTMLElement).click();
                        return true;
                    }
                    return false;
                });

                if (!clicked) {
                    // Try one more scroll
                    await page.evaluate(() => window.scrollBy(0, 500));
                    await new Promise(r => setTimeout(r, 1000));
                    const retryClicked = await page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const loadMore = buttons.find(b => b.textContent?.includes('আরও দেখুন'));
                        if (loadMore) { (loadMore as HTMLElement).click(); return true; }
                        return false;
                    });
                    if (!retryClicked) {
                        console.log("   ❌ No more articles to load.");
                        break;
                    }
                }

                await new Promise(r => setTimeout(r, 2000)); // Wait for batch load
                attempt++;
            }

            console.log("Collecting articles...");
            const articles = await page.evaluate(() => {
                const results: any[] = [];
                document.querySelectorAll('a.group').forEach((el) => {
                    if ((el as HTMLAnchorElement).href.includes('epaper')) return;

                    const titleEl = el.querySelector('h2');
                    const timeSpan = Array.from(el.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('আগে'));

                    if (el instanceof HTMLAnchorElement && el.href && titleEl) {
                        results.push({
                            url: el.href,
                            title: titleEl.textContent?.trim(),
                            time: timeSpan?.textContent?.trim() || 'N/A',
                            source: 'Ajker Patrika'
                        });
                    }
                });
                return results;
            });

            console.log(`Found ${articles.length} articles from ${this.name}`);
            return articles;

        } catch (error) {
            console.error(`Error scraping ${this.name}:`, error);
            return [];
        } finally {
            await browser.close()
        }
    }
}
