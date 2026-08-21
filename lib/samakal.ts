import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsSourceScraper, ScrapedArticle } from './types';

puppeteer.use(StealthPlugin());

export class SamakalScraper implements NewsSourceScraper {
    name = 'Samakal';
    source = 'Samakal';
    baseUrl = 'https://samakal.com';
    listUrl = 'https://samakal.com/latest/news';

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`[Samakal] Starting Direct Web scrape from ${this.listUrl}...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'],
        });
        const page = await browser.newPage();
        const articles: ScrapedArticle[] = [];

        try {
            await page.setViewport({ width: 1920, height: 1080 });

            console.log('[Samakal] Navigating and waiting for challenge...');
            await page.goto(this.listUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

            // Cloudflare Detection
            try {
                const title = await page.title();
                if (title.includes('Just a moment') || title.includes('Attention Required')) {
                    console.log('[Samakal] Cloudflare challenge detected. Waiting...');
                    await page.waitForFunction(() => !document.title.includes('Just a moment') && !document.title.includes('Attention Required'), { timeout: 30000 });
                }
            } catch (e) { }

            // Pagination Loop
            let attempt = 0;
            const MAX_ATTEMPTS = 100;

            while (attempt < MAX_ATTEMPTS) {
                await page.evaluate(() => window.scrollBy(0, 1000));

                const oldestTimeStr = await page.evaluate(() => {
                    const times = Array.from(document.querySelectorAll('.publishTime'));
                    if (times.length === 0) return 'N/A';
                    return times[times.length - 1].textContent?.trim() || 'N/A';
                });

                console.log(`   [Attempt ${attempt}] Oldest: ${oldestTimeStr}`);

                // Samakal Format: "০১ জানুয়ারি ২০২৬ | ০০:১১"
                // Stopping condition: If it's a different day than "০১ জানুয়ারি ২০২৬" (today)
                // We'll rely on our main crawler's time parsing later, but for pagination, we stop if we hit yesterday's date
                if (oldestTimeStr.includes('৩১ ডিসেম্বর') || oldestTimeStr.includes('৩০ ডিসেম্বর')) {
                    console.log('   ✅ Reached previous day. Stopping.');
                    break;
                }

                const clicked = await page.evaluate(() => {
                    const loadMore = Array.from(document.querySelectorAll('a, button, span')).find(el => el.textContent?.trim() === 'আরও দেখুন');
                    if (loadMore) {
                        (loadMore as HTMLElement).click();
                        return true;
                    }
                    return false;
                });

                if (!clicked) break;

                await new Promise(r => setTimeout(r, 2000));
                attempt++;
            }

            console.log('[Samakal] Collecting articles...');
            const scrapedData = await page.evaluate(() => {
                const results: any[] = [];
                // Samakal structure: rows with class .CatListContainer
                document.querySelectorAll('.CatListhead h3').forEach(h3 => {
                    const card = h3.closest('a');
                    const timeEl = card?.parentElement?.querySelector('.publishTime');

                    if (card && card.href && h3.textContent) {
                        results.push({
                            url: card.href,
                            title: h3.textContent.trim(),
                            time: timeEl?.textContent?.trim() || 'N/A'
                        });
                    }
                });
                return results;
            });

            for (const item of scrapedData) {
                articles.push({
                    url: item.url,
                    title: item.title,
                    source: 'Samakal',
                    time: item.time,
                    rawTime: item.time
                });
            }

        } catch (error) {
            console.error(`[Samakal] Scrape error:`, error);
        } finally {
            await browser.close();
        }

        console.log(`[Samakal] Found ${articles.length} articles via Direct Web.`);
        return articles;
    }
}
