import puppeteer from 'puppeteer';
import { NewsSourceScraper, ScrapedArticle } from './types';
import { getRandomProxy } from './proxies';

export class IttefaqScraper implements NewsSourceScraper {
    name = 'Ittefaq';
    baseUrl = 'https://www.ittefaq.com.bd/latest-news';

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper (Ajax Load More)...`);

        const MAX_ATTEMPTS = 20;
        let attempt = 0;
        let allArticles: ScrapedArticle[] = [];

        while (attempt < MAX_ATTEMPTS && allArticles.length === 0) {
            attempt++;

            // Fallback: After 5 proxy failures, try direct connection
            const useProxy = attempt <= 5;
            const proxy = useProxy ? getRandomProxy() : null;

            console.log(`[${this.name}] Attempt ${attempt}/${MAX_ATTEMPTS} using ${useProxy ? `proxy: ${proxy}` : 'DIRECT CONNECTION'}...`);

            const args = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ];
            if (proxy) args.push(`--proxy-server=${proxy}`);

            const browser = await puppeteer.launch({
                headless: true,
                args
            });
            const page = await browser.newPage();
            // Increase timeout aggressively for slow live network
            page.setDefaultNavigationTimeout(90000); // 90s

            try {
                // Set viewport
                await page.setViewport({ width: 1280, height: 800 });
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                console.log(`[${this.name}] Navigating to ${this.baseUrl}...`);
                await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 90000 });

                // Initial Scrape
                const scrapeArticles = async () => {
                    return await page.evaluate(() => {
                        const items: any[] = [];
                        const cards = document.querySelectorAll('.tag_title_holder');

                        cards.forEach(card => {
                            const linkTag = card.closest('a') || card.querySelector('a');
                            const timeTag = card.closest('.each_tag_news')?.querySelector('.tag_news_time');

                            if (linkTag) {
                                let href = linkTag.getAttribute('href');
                                if (href) {
                                    if (href.startsWith('//')) {
                                        href = 'https:' + href;
                                    } else if (!href.startsWith('http')) {
                                        if (!href.startsWith('/')) href = '/' + href;
                                        href = 'https://www.ittefaq.com.bd' + href;
                                    }
                                }

                                items.push({
                                    title: card.textContent?.trim() || 'No Title',
                                    url: href,
                                    time: timeTag?.textContent?.trim() || 'N/A'
                                });
                            }
                        });
                        return items;
                    });
                };

                let currentArticles = await scrapeArticles();
                console.log(`[${this.name}] Initial load: ${currentArticles.length} articles`);

                let loadMoreAttempts = 0;
                const MAX_CLICKS = 15;
                let consecutiveErrors = 0;

                while (loadMoreAttempts < MAX_CLICKS && currentArticles.length < 150) {
                    try {
                        const previousCount = currentArticles.length;

                        // Select button: .ajax_load_btn
                        const buttonSelector = '.ajax_load_btn';

                        // Wait for button (with retry)
                        try {
                            await page.waitForSelector(buttonSelector, { timeout: 10000 });
                        } catch (e) {
                            console.log(`[${this.name}] Button not found (timeout), trying to scroll...`);
                            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                            await new Promise(r => setTimeout(r, 2000));
                            if (await page.$(buttonSelector) === null) {
                                console.log(`[${this.name}] Button definitely gone. Stopping.`);
                                break;
                            }
                        }

                        // Scroll to button
                        await page.evaluate((sel) => {
                            const el = document.querySelector(sel);
                            if (el) el.scrollIntoView();
                        }, buttonSelector);

                        await new Promise(r => setTimeout(r, 2000));

                        console.log(`[${this.name}] Clicking 'Load More' (Attempt ${loadMoreAttempts + 1})...`);

                        // Try clicking up to 3 times if count doesn't increase
                        let clickedSuccessfully = false;
                        for (let clickTry = 0; clickTry < 3; clickTry++) {
                            // Js Click
                            await page.evaluate((sel) => {
                                const btn = document.querySelector(sel);
                                if (btn) (btn as HTMLElement).click();
                            }, buttonSelector);

                            // Wait for count increase (60s timeout)
                            try {
                                await page.waitForFunction((prevCount) => {
                                    const count = document.querySelectorAll('.tag_title_holder').length;
                                    return count > prevCount;
                                }, { timeout: 60000 }, previousCount);
                                clickedSuccessfully = true;
                                break;
                            } catch (waitError) {
                                console.log(`[${this.name}] Click try ${clickTry + 1} timed out. Retrying click...`);
                                // Scroll up and down to trigger UI refresh?
                                await page.evaluate(() => window.scrollBy(0, -100));
                                await new Promise(r => setTimeout(r, 1000));
                            }
                        }

                        if (!clickedSuccessfully) {
                            throw new Error("Failed to load new articles after 3 click attempts.");
                        }

                        // Short settle
                        await new Promise(r => setTimeout(r, 2000));

                        currentArticles = await scrapeArticles();
                        console.log(`[${this.name}] Load More success. Total: ${currentArticles.length}`);

                        loadMoreAttempts++;
                        consecutiveErrors = 0; // Reset error count

                        // Date check
                        const last = currentArticles[currentArticles.length - 1];
                        if (last && (last.time.includes('২ দিন') || last.time.includes('৩ দিন'))) {
                            console.log(`[${this.name}] Reached old articles. Stopping.`);
                            break;
                        }

                    } catch (e) {
                        console.log(`[${this.name}] Load More failed or button gone:`, e instanceof Error ? e.message : e);
                        consecutiveErrors++;
                        if (consecutiveErrors >= 2) {
                            console.log(`[${this.name}] Too many consecutive errors. Stopping.`);
                            break;
                        }
                    }
                }

                const parseIttefaqDate = (text: string): Date => {
                    const now = new Date();
                    if (!text || text === 'N/A') return now;
                    const bnToEn: { [key: string]: string } = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
                    const cleanText = text.replace(/[০-৯]/g, (d) => bnToEn[d]);

                    if (cleanText.includes('মিনিট')) {
                        const match = cleanText.match(/(\d+)/);
                        const mins = match ? parseInt(match[1]) : 0;
                        return new Date(now.getTime() - mins * 60 * 1000);
                    }
                    if (cleanText.includes('ঘণ্টা')) {
                        const match = cleanText.match(/(\d+)/);
                        const hours = match ? parseInt(match[1]) : 0;
                        return new Date(now.getTime() - hours * 60 * 60 * 1000);
                    }
                    if (cleanText.includes('দিন')) {
                        const match = cleanText.match(/(\d+)/);
                        const days = match ? parseInt(match[1]) : 0;
                        return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                    }
                    return now;
                };

                allArticles = [];
                for (const item of currentArticles) {
                    allArticles.push({
                        title: item.title,
                        url: item.url,
                        source: 'Ittefaq',
                        time: item.time,
                        rawTime: item.time,
                        publishedAt: parseIttefaqDate(item.time).toISOString()
                    });
                }

                console.log(`[${this.name}] Total articles collected: ${allArticles.length}`);
                await browser.close();

                // CRITICAL ROBUSTNESS CHECK:
                // Relaxed: If we found > 0 articles, return them. Don't indefinitely retry on slow connections.
                if (allArticles.length === 0) {
                    // Only retry if we got absolutely nothing
                    continue;
                }

                if (allArticles.length < 50) {
                    console.log(`[${this.name}] Partial success (${allArticles.length} articles). Returning what we have.`);
                }
                return allArticles;

                if (allArticles.length > 0) return allArticles;

            } catch (error) {
                console.log(`[${this.name}] Proxy ${proxy} failed:`, error);
                await browser.close();
            }
        }

        return allArticles;
    }
}
