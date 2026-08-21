import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsSourceScraper, ScrapedArticle } from './types';

puppeteer.use(StealthPlugin());

export class JamunaScraper implements NewsSourceScraper {
    name = 'Jamuna TV';
    source = 'Jamuna TV';
    baseUrl = 'https://jamuna.tv/latest';

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`[Jamuna TV] Starting Direct Web scrape from ${this.baseUrl}...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'],
        });
        const page = await browser.newPage();
        const articles: ScrapedArticle[] = [];

        try {
            await page.setViewport({ width: 1920, height: 1080 });

            // Navigate and handle Cloudflare
            console.log('[Jamuna TV] Navigating and waiting for challenge...');
            await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

            // Detection for Cloudflare (similar to Prothom Alo logic)
            try {
                const title = await page.title();
                if (title.includes('Just a moment') || title.includes('Attention Required')) {
                    console.log('[Jamuna TV] Cloudflare challenge detected. Waiting...');
                    await page.waitForFunction(() => !document.title.includes('Just a moment') && !document.title.includes('Attention Required'), { timeout: 30000 });
                    console.log('[Jamuna TV] Challenge passed.');
                }
            } catch (e) { }

            // Pagination Loop
            let attempt = 0;
            const MAX_ATTEMPTS = 100;

            while (attempt < MAX_ATTEMPTS) {
                // Scroll down to find the 'Load More' button
                await page.evaluate(() => window.scrollBy(0, 1000));

                const oldestTimeStr = await page.evaluate(() => {
                    const times = Array.from(document.querySelectorAll('span, p, div')).filter(el => el.textContent?.includes('আগে'));
                    return times.length > 0 ? times[times.length - 1].textContent?.trim() : 'N/A';
                });

                console.log(`   [Attempt ${attempt}] Oldest: ${oldestTimeStr}`);
                if (oldestTimeStr?.includes('১ দিন') || oldestTimeStr?.includes('গতকাল')) break;

                const clicked = await page.evaluate(() => {
                    const loadMore = Array.from(document.querySelectorAll('span, button, div')).find(el => el.textContent?.includes('আরও পড়ুন'));
                    if (loadMore) {
                        (loadMore as HTMLElement).click();
                        return true;
                    }
                    return false;
                });

                if (!clicked) {
                    // Try another scroll
                    await page.evaluate(() => window.scrollBy(0, 2000));
                    await new Promise(r => setTimeout(r, 1000));
                    const retry = await page.evaluate(() => {
                        const b = Array.from(document.querySelectorAll('span')).find(el => el.textContent?.includes('আরও পড়ুন'));
                        if (b) { (b as HTMLElement).click(); return true; }
                        return false;
                    });
                    if (!retry) break;
                }

                await new Promise(r => setTimeout(r, 3000)); // Jamuna is slow
                attempt++;
            }

            console.log('[Jamuna TV] Collecting articles...');
            const scrapedData = await page.evaluate(() => {
                const results: any[] = [];
                // Use a.linkOverlay for Jamuna TV
                document.querySelectorAll('a.linkOverlay').forEach(el => {
                    const href = (el as HTMLAnchorElement).href;
                    // Find title - usually in the same container
                    const container = el.parentElement;
                    const titleEl = container?.querySelector('h3, h2, p.title');
                    // Find time - in a sibling or child
                    const timeEl = container?.querySelector('span'); // Adjust if needed

                    if (href && titleEl) {
                        results.push({
                            url: href,
                            title: titleEl.textContent?.trim(),
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
                    source: 'Jamuna TV',
                    time: item.time,
                    rawTime: item.time
                });
            }

        } catch (error) {
            console.error(`[Jamuna TV] Scrape error:`, error);
        } finally {
            await browser.close();
        }

        console.log(`[Jamuna TV] Found ${articles.length} articles via Direct Web.`);
        return articles;
    }
}
