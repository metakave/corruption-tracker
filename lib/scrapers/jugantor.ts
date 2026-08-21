import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsSourceScraper, ScrapedArticle } from './types';
import { getRandomProxy } from './proxies';

puppeteer.use(StealthPlugin());

export class JugantorScraper implements NewsSourceScraper {
    name = 'Jugantor';
    baseUrl = 'https://www.jugantor.com/latest';

    async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper (DOM + Precise Selectors)...`);

        const MAX_PROXY_ATTEMPTS = 20;
        let proxyAttempt = 0;
        let allArticles: ScrapedArticle[] = [];

        while (proxyAttempt < MAX_PROXY_ATTEMPTS && allArticles.length === 0) {
            proxyAttempt++;
            const useProxy = proxyAttempt <= 3;
            const proxy = useProxy ? getRandomProxy() : null;

            console.log(`[${this.name}] Attempt ${proxyAttempt}/${MAX_PROXY_ATTEMPTS} using ${useProxy ? `proxy: ${proxy}` : 'DIRECT CONNECTION'}...`);

            const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800'];
            if (proxy) args.push(`--proxy-server=${proxy}`);

            const browser = await puppeteer.launch({
                headless: true,
                args
            });
            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(60000);

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            try {
                console.log(`[${this.name}] Navigating to ${this.baseUrl}...`);
                await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Allow some rendering time
                await new Promise(r => setTimeout(r, 5000));

                const parseBengaliDate = (timeStr: string): Date | null => {
                    try {
                        const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
                        const convertDigits = (str: string) => str.split('').map(c => {
                            const idx = banglaDigits.indexOf(c);
                            return idx >= 0 ? idx : c;
                        }).join('');

                        let cleanStr = convertDigits(timeStr);
                        cleanStr = cleanStr.replace(/,/g, ' ').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
                        const parts = cleanStr.split(' ');

                        // "02 January 2026 06:04 AM"
                        // Parts roughly: [02, Month, 2026, 06:04, AM]

                        let yearIndex = -1;
                        for (let i = 0; i < parts.length; i++) {
                            if (parts[i].length === 4 && /^20\d\d$/.test(parts[i])) {
                                yearIndex = i;
                                break;
                            }
                        }

                        if (yearIndex === -1) return null;

                        const year = parseInt(parts[yearIndex]);
                        if (yearIndex < 2) return null;

                        const monthName = parts[yearIndex - 1]; // Before year
                        const day = parseInt(parts[yearIndex - 2]); // Before month

                        // Time: Look for colon
                        let timeIndex = -1;
                        for (let i = 0; i < parts.length; i++) {
                            if (parts[i].includes(':')) {
                                timeIndex = i;
                                break;
                            }
                        }

                        // AM/PM
                        let amPm = 'এএম'; // Default to AM logic if missing (rare)
                        if (timeIndex !== -1 && timeIndex + 1 < parts.length) {
                            amPm = parts[timeIndex + 1];
                        }

                        const months: Record<string, number> = {
                            'জানুয়ারি': 0, 'ফেব্রুয়ারি': 1, 'মার্চ': 2, 'এপ্রিল': 3, 'মে': 4, 'জুন': 5,
                            'জুলাই': 6, 'আগস্ট': 7, 'সেপ্টেম্বর': 8, 'অক্টোবর': 9, 'নভেম্বর': 10, 'ডিসেম্বর': 11
                        };

                        const month = months[monthName];
                        if (month === undefined) return null;

                        let hour = 0; let minute = 0;
                        if (timeIndex !== -1) {
                            const [hStr, mStr] = parts[timeIndex].split(':');
                            hour = parseInt(hStr);
                            minute = parseInt(mStr);

                            if (amPm === 'পিএম' && hour < 12) hour += 12;
                            if (amPm === 'এএম' && hour === 12) hour = 0;
                        }

                        return new Date(year, month, day, hour, minute);
                    } catch (e) { return null; }
                };

                const scrapeCurrentArticles = async () => {
                    return await page.evaluate(() => {
                        const items: any[] = [];
                        // Verified Selectors from Dump:
                        // Container: .media.positionRelative (inside .desktopSectionListMedia)
                        // Title: h4.title10
                        // Link: a.linkOverlay (href)
                        // Time: p.desktopTime (textContent)

                        const cards = document.querySelectorAll('.media.positionRelative');

                        cards.forEach(card => {
                            const titleEl = card.querySelector('h4.title10');
                            const linkEl = card.querySelector('a.linkOverlay');
                            const timeEl = card.querySelector('p.desktopTime');

                            const title = titleEl ? titleEl.textContent?.trim() : '';
                            const href = linkEl ? linkEl.getAttribute('href') : '';
                            const timeStr = timeEl ? timeEl.textContent?.trim() : '';

                            if (title && href && timeStr) {
                                items.push({
                                    title,
                                    url: href,
                                    time: timeStr
                                });
                            }
                        });

                        return items;
                    });
                };

                let currentArticles = await scrapeCurrentArticles();
                console.log(`[${this.name}] Initial load: ${currentArticles.length} articles`);

                let loadMoreAttempts = 0;
                const MAX_CLICKS = dateLimit ? 350 : 50;
                let consecutiveErrors = 0;
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                while (loadMoreAttempts < MAX_CLICKS) {
                    const previousCount = currentArticles.length;

                    try {
                        // Click ".loadMoreButton" (Verified class)
                        const clickSuccess = await page.evaluate(() => {
                            const btn = document.querySelector('.loadMoreButton') as HTMLElement;
                            if (btn && btn.offsetParent !== null) { // Check visibility
                                btn.click();
                                return true;
                            }
                            return false;
                        });

                        if (clickSuccess) {
                            console.log(`[${this.name}] Clicked 'আরও পড়ুন' (Attempt ${loadMoreAttempts + 1})`);

                            // Wait for article count increase
                            await page.waitForFunction((prev) => {
                                const count = document.querySelectorAll('.media.positionRelative').length;
                                return count > prev;
                            }, { timeout: 15000 }, previousCount);

                            consecutiveErrors = 0;
                        } else {
                            // Try scrolling to trigger if button is below fold/lazy
                            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                            await new Promise(r => setTimeout(r, 1000));
                            // Try generic text match if class fails?
                            const xpathClick = await page.evaluate(() => {
                                const xpath = "//span[contains(text(), 'আরও পড়ুন')]";
                                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                                const node = result.singleNodeValue as HTMLElement;
                                if (node) { node.click(); return true; }
                                return false;
                            });

                            if (xpathClick) {
                                console.log(`[${this.name}] Clicked via XPath text match.`);
                                await new Promise(r => setTimeout(r, 3000));
                            } else {
                                throw new Error("Load more button not found/clickable.");
                            }
                        }

                    } catch (e) {
                        console.log(`[${this.name}] Click/Wait failed:`, e instanceof Error ? e.message : e);
                        consecutiveErrors++;
                        if (consecutiveErrors >= 3) {
                            console.log(`[${this.name}] Too many errors. Stopping.`);
                            break;
                        }
                    }

                    loadMoreAttempts++;
                    currentArticles = await scrapeCurrentArticles();

                    // Check date limit
                    if (currentArticles.length > 50) {
                        // Check last 5 articles
                        let exceeded = false;
                        for (let i = currentArticles.length - 1; i >= Math.max(0, currentArticles.length - 5); i--) {
                            const a = currentArticles[i];
                            const d = parseBengaliDate(a.time);

                            if (d) {
                                if (dateLimit) {
                                    if (d < dateLimit) {
                                        exceeded = true;
                                        console.log(`[${this.name}] Reached date limit (${dateLimit.toISOString()}). Article: ${a.time}. Stopping.`);
                                        break;
                                    }
                                } else {
                                    if (d < oneDayAgo) {
                                        exceeded = true;
                                        console.log(`[${this.name}] Reached 24h limit (Article: ${a.time}). Stopping.`);
                                        break;
                                    }
                                }
                            }
                        }
                        if (exceeded) break;
                    }
                }

                // Filtering
                allArticles = [];
                for (const item of currentArticles) {
                    const date = parseBengaliDate(item.time);
                    let isValid = false;

                    if (date) {
                        if (dateLimit) {
                            isValid = date >= dateLimit;
                        } else {
                            isValid = date > oneDayAgo;
                        }
                    }

                    if (isValid) {
                        allArticles.push({
                            title: item.title,
                            url: item.url,
                            time: item.time,
                            source: 'Jugantor',
                            rawTime: item.time,
                            publishedAt: date!.toISOString() // date is confirmed valid here
                        });
                    }
                }

                console.log(`[${this.name}] Total valid articles (24h): ${allArticles.length}`);
                await browser.close();

                if (allArticles.length > 30) return allArticles;
                console.log(`[${this.name}] Proxy ${proxy} yielded < 30 articles. Retrying...`);
                allArticles = [];

            } catch (error) {
                console.log(`[${this.name}] Proxy ${proxy} failed:`, error);
                await browser.close();
            }
        }

        return allArticles;
    }
}
