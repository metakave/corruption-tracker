
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsSourceScraper, ScrapedArticle } from './types';
import { getRandomProxy } from './proxies';

puppeteer.use(StealthPlugin());

export class JamunaScraper implements NewsSourceScraper {
    name = 'Jamuna TV';
    source = 'Jamuna TV';
    baseUrl = 'https://jamuna.tv/latest';

    // Helper to parse Jamuna Bengali date/time: "৩০ ডিসেম্বর ২০২৫, ০৩:২৮ পিএম" or "৯ ঘণ্টা আগে"
    private parseJamunaTime(bengaliTimeStr: string): Date | null {
        try {
            const bengaliToEnglishDigits: { [key: string]: string } = {
                '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
                '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
            };
            const bengaliMonths: { [key: string]: number } = {
                'জানুয়ারি': 0, 'ফেব্রুয়ারি': 1, 'মার্চ': 2, 'এপ্রিল': 3,
                'মে': 4, 'জুন': 5, 'জুলাই': 6, 'আগস্ট': 7,
                'সেপ্টেম্বর': 8, 'অক্টোবর': 9, 'নভেম্বর': 10, 'ডিসেম্বর': 11
            };

            const toEnglish = (str: string) => str.split('').map(c => bengaliToEnglishDigits[c] || c).join('');

            // Check if it's relative time: "৯ ঘণ্টা আগে"
            if (bengaliTimeStr.includes('ঘণ্টা') || bengaliTimeStr.includes('মিনিট')) {
                const hourMatch = bengaliTimeStr.match(/([০-৯]+)\s*ঘণ্টা/);
                if (hourMatch) {
                    const hours = parseInt(toEnglish(hourMatch[1]));
                    const now = new Date();
                    return new Date(now.getTime() - hours * 60 * 60 * 1000);
                }
                return new Date(); // Recent
            }

            // Parse full date: "৩০ ডিসেম্বর ২০২৫, ০৩:২৮ পিএম"
            const match = bengaliTimeStr.match(/([০-৯]+)\s+([\u0980-\u09FF]+)\s+([০-৯]+),\s+([০-৯]+):([০-৯]+)\s+(এএম|পিএম)/);
            if (!match) {
                console.log(`[Jamuna] Failed to parse time: ${bengaliTimeStr}`);
                return null;
            }

            const day = parseInt(toEnglish(match[1]));
            const monthName = match[2];
            const year = parseInt(toEnglish(match[3]));
            let hours = parseInt(toEnglish(match[4]));
            const minutes = parseInt(toEnglish(match[5]));
            const meridiem = match[6];

            // Convert to 24h format
            if (meridiem === 'পিএম' && hours !== 12) hours += 12;
            if (meridiem === 'এএম' && hours === 12) hours = 0;

            const month = bengaliMonths[monthName];
            if (month === undefined) {
                console.log(`[Jamuna] Unknown month: ${monthName}`);
                return null;
            }

            // Jamuna times are in Bangladesh Time (UTC+6)
            const bangladeshDate = new Date(year, month, day, hours, minutes);
            const utcDate = new Date(bangladeshDate.getTime() - (6 * 60 * 60 * 1000));
            return utcDate;
        } catch (e) {
            console.log(`[Jamuna] Exception parsing time: ${bengaliTimeStr}`, e);
            return null;
        }
    }

    private isOlderThanLimit(timeStr: string, limit?: Date): boolean {
        const articleDate = this.parseJamunaTime(timeStr);
        if (!articleDate) return false;

        if (limit) {
            return articleDate < limit;
        }

        const now = new Date();
        const diffHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
        return diffHours > 24;
    }

    async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
        console.log(`[Jamuna TV] Starting scrape... Limit: ${dateLimit ? dateLimit.toISOString() : '24h'}`);
        const articles: ScrapedArticle[] = [];
        let browser: any = null;
        let page: any = null;
        let connected = false;

        // Retry loop for proxy connection
        const MAX_PROXY_ATTEMPTS = 20;

        for (let proxyAttempt = 0; proxyAttempt < MAX_PROXY_ATTEMPTS; proxyAttempt++) {
            // Attempt 0: Try DIRECT connection (no proxy) to speed up local testing
            // Attempts 1+: Use proxies
            const proxy = proxyAttempt === 0 ? null : getRandomProxy();

            console.log(`[Jamuna TV] Attempt ${proxyAttempt + 1}/${MAX_PROXY_ATTEMPTS} using ${proxy ? 'proxy: ' + proxy : 'DIRECT connection'}...`);

            const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'];
            if (proxy) args.push(`--proxy-server=${proxy}`);

            if (browser) await browser.close().catch(() => { });

            try {
                browser = await puppeteer.launch({ headless: true, args });
                page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                await page.setViewport({ width: 1920, height: 1080 });

                // Relay browser console logs to node console
                page.on('console', (msg: any) => console.log('PAGE LOG:', msg.text()));

                // Navigation
                console.log('[Jamuna TV] Navigating...');
                await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Cloudflare check
                const title = await page.title();
                if (title.includes('Just a moment') || title.includes('Attention Required')) {
                    console.log('[Jamuna TV] Cloudflare challenge detected. Waiting...');
                    await page.waitForFunction(() => !document.title.includes('Just a moment') && !document.title.includes('Attention Required'), { timeout: 30000 });
                }

                connected = true;
                break; // Success!

            } catch (e: any) {
                console.error(`[Jamuna TV] Proxy ${proxy} failed: ${e.message}`);
                if (proxyAttempt === MAX_PROXY_ATTEMPTS - 1) {
                    if (browser) await browser.close().catch(() => { });
                    throw e;
                }
            }
        }

        if (!connected) throw new Error("All proxy attempts failed.");

        try {
            // Pagination Loop
            let attempt = 0;
            // Increased max clicks for deep recovery
            const MAX_ATTEMPTS = dateLimit ? 300 : 50;

            while (attempt < MAX_ATTEMPTS) {
                // Scroll to bottom to ensure button is in DOM
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await new Promise(r => setTimeout(r, 2000));

                const currentArticleCount = await page.evaluate(() => document.querySelectorAll('a.linkOverlay').length);
                const oldestTimeStr = await page.evaluate(() => {
                    const times = Array.from(document.querySelectorAll('.desktopTime, span.time'));
                    return times.length > 0 ? times[times.length - 1].textContent?.trim() : 'N/A';
                });

                console.log(`   [Attempt ${attempt}] Articles: ${currentArticleCount}, Oldest: ${oldestTimeStr}`);

                // Check Limit
                if (oldestTimeStr && this.isOlderThanLimit(oldestTimeStr, dateLimit)) {
                    console.log(`   [Jamuna TV] Reached limit (article: ${oldestTimeStr}). Stopping.`);
                    break;
                }

                const clicked = await page.evaluate(async () => {
                    // Specific verified selector
                    const loadMore = document.querySelector('span.loadMoreButton');

                    if (loadMore) {
                        console.log('   [Browser] Found Load More button:', loadMore.tagName, loadMore.className);
                        loadMore.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Wait a tiny bit for scroll
                        await new Promise(r => setTimeout(r, 800 + Math.random() * 500)); // Random wait
                        (loadMore as HTMLElement).click();
                        return true;
                    }
                    console.log('   [Browser] Load More button NOT found.');
                    return false;
                });

                if (clicked) {
                    try {
                        // Wait a bit for network - Jamuna can be slow + Cloudflare check
                        const waitTime = 5000 + Math.random() * 3000;
                        await new Promise(r => setTimeout(r, waitTime));
                    } catch (e) { }
                } else {
                    console.log(`   [Attempt ${attempt}] Button click failed. Retrying...`);
                    await page.evaluate(() => window.scrollBy(0, -500));
                    await new Promise(r => setTimeout(r, 1000));
                }

                attempt++;
            }

            console.log('[Jamuna TV] Collecting articles...');
            const scrapedData = await page.evaluate(() => {
                const results: any[] = [];
                // Validated selector: a.linkOverlay is the clickable cover. 
                // The card data is usually in siblings or the parent container.
                const overlays = Array.from(document.querySelectorAll('a.linkOverlay'));

                overlays.forEach(overlay => {
                    const link = (overlay as HTMLAnchorElement).href;
                    // Go up to the column/card container
                    const card = overlay.closest('.col-md-4') || overlay.parentElement;
                    if (!card) return;

                    const titleEl = card.querySelector('h4.title, .title, h3, h5, img[alt]');
                    let title = titleEl?.textContent?.trim();
                    if (!title) {
                        // Fallback to image alt text if title text is missing
                        const img = card.querySelector('img');
                        if (img) title = img.alt;
                    }

                    const timeEl = card.querySelector('.time, .date, small, span.desktopTime');
                    const time = timeEl?.textContent?.trim() || 'N/A';

                    if (link && title) {
                        results.push({
                            url: link,
                            title: title,
                            time: time
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
            if (browser) await browser.close();
        }

        console.log(`[Jamuna TV] Found ${articles.length} articles via Direct Web.`);
        return articles;
    }
}
