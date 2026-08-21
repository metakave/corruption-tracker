import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsSourceScraper, ScrapedArticle } from './types';
import { getRandomProxy } from './proxies';

puppeteer.use(StealthPlugin());

export class SamakalScraper implements NewsSourceScraper {
    name = 'Samakal';
    baseUrl = 'https://samakal.com/latest/news';

    // Helper to parse Samakal Bengali date/time: "প্রকাশিতঃ ০১ জানুয়ারি ২০২৬ | ০২:৫৬"
    private parseSamakalTime(bengaliTimeStr: string): Date | null {
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

            // Convert Bengali digits to English
            const toEnglish = (str: string) => str.split('').map(c => bengaliToEnglishDigits[c] || c).join('');

            // More robust regex that matches any Bengali characters: "০১ জানুয়ারি ২০২৬ | ০২:৫৬"
            // Using \u0980-\u09FF for all Bengali Unicode range
            const match = bengaliTimeStr.match(/([০-৯]+)\s+([\u0980-\u09FF]+)\s+([০-৯]+)\s+\|\s+([০-৯:]+)/);
            if (!match) {
                // console.log(`[Samakal] Failed to parse time: ${bengaliTimeStr}`);
                return null;
            }

            const day = parseInt(toEnglish(match[1]));
            const monthName = match[2];
            const year = parseInt(toEnglish(match[3]));
            const timeStr = toEnglish(match[4]); // "02:56"
            const [hours, minutes] = timeStr.split(':').map(Number);

            const month = bengaliMonths[monthName];
            if (month === undefined) {
                console.log(`[Samakal] Unknown month: ${monthName}`);
                return null;
            }

            const parsedDate = new Date(year, month, day, hours, minutes);
            // IMPORTANT: Samakal times are in Bangladesh Time (UTC+6)
            // Subtract 6 hours to get the correct UTC time
            const utcDate = new Date(parsedDate.getTime() - (6 * 60 * 60 * 1000));
            // console.log(`[Samakal] Parsed: "${bengaliTimeStr}" → ${utcDate.toISOString()}`);
            return utcDate;
        } catch (e) {
            console.log(`[Samakal] Exception parsing time: ${bengaliTimeStr}`, e);
            return null;
        }
    }

    private isOlderThanLimit(timeStr: string, limitDate?: Date): boolean {
        const articleDate = this.parseSamakalTime(timeStr);
        if (!articleDate) {
            // console.log(`[Samakal] WARNING: Could not parse date "${timeStr}", continuing...`);
            return false; // If can't parse, don't stop
        }

        if (limitDate) {
            // Strict date check: Is article OLDER than the limit date?
            // e.g. Limit = Dec 30. Article = Dec 29. 
            // articleDate < limitDate => true (stop)
            const isOlder = articleDate < limitDate;
            if (isOlder) {
                console.log(`[Samakal] Article (${articleDate.toISOString()}) is older than limit (${limitDate.toISOString()}).`);
            }
            return isOlder;
        } else {
            // Default 24h check
            const now = new Date();
            const diffHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
            const isOld = diffHours > 24;
            if (isOld) {
                // console.log(`[Samakal] Article is ${diffHours.toFixed(1)}h old (>24h).`);
            }
            return isOld;
        }
    }

    async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper...`);
        if (dateLimit) {
            console.log(`📅 Deep Recovery Mode: Fetching until ${dateLimit.toISOString()}`);
        } else {
            console.log(`🕒 Standard Mode: Fetching last 24h`);
        }

        const MAX_PROXY_ATTEMPTS = 20;
        let proxyAttempt = 0;
        let allArticles: ScrapedArticle[] = [];

        while (proxyAttempt < MAX_PROXY_ATTEMPTS && allArticles.length === 0) {
            const proxy = getRandomProxy();
            proxyAttempt++;
            console.log(`[${this.name}] Attempt ${proxyAttempt}/${MAX_PROXY_ATTEMPTS} using proxy: ${proxy}...`);

            const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080', '--disable-blink-features=AutomationControlled'];
            if (proxy) args.push(`--proxy-server=${proxy}`);

            const browser = await puppeteer.launch({
                headless: true,
                args
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 1080 });

            try {
                // console.log(`[${this.name}] Phase 1: Loading initial articles...`);
                await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Check for Cloudflare challenge
                try {
                    const title = await page.title();
                    if (title.includes('Just a moment') || title.includes('Attention Required')) {
                        console.log(`[${this.name}] Cloudflare challenge detected. Waiting...`);
                        await page.waitForFunction(
                            () => !document.title.includes('Just a moment') && !document.title.includes('Attention Required'),
                            { timeout: 30000 }
                        );
                    }
                } catch (e) {
                    // console.log(`[${this.name}] Cloudflare check timeout, continuing anyway...`);
                }

                await new Promise(r => setTimeout(r, 2000)); // Let page settle

                // Extract CSRF token and initial articles
                const { token, initialArticles } = await page.evaluate(() => {
                    // Extract CSRF token from page scripts
                    const tokenMatch = document.documentElement.outerHTML.match(/'_token':\s*'([^']+)'/);
                    const csrfToken = tokenMatch ? tokenMatch[1] : null;

                    // Extract initial articles
                    const articles: any[] = [];
                    document.querySelectorAll('.CatListhead h3').forEach(h3 => {
                        const card = h3.closest('a');
                        const timeEl = card?.parentElement?.querySelector('.publishTime');

                        if (card && (card as HTMLAnchorElement).href && h3.textContent) {
                            articles.push({
                                url: (card as HTMLAnchorElement).href,
                                title: h3.textContent.trim(),
                                time: timeEl?.textContent?.trim() || 'N/A'
                            });
                        }
                    });

                    return { token: csrfToken, initialArticles: articles };
                });

                if (!token) {
                    console.log(`[${this.name}] Failed to extract CSRF token. Switching proxy...`);
                    await browser.close();
                    continue;
                }

                // console.log(`[${this.name}] Phase 1 Complete: Found ${initialArticles.length} initial articles.`);
                allArticles = initialArticles.map((a: any) => ({
                    ...a,
                    source: 'Samakal',
                    rawTime: a.time,
                    publishedAt: this.parseSamakalTime(a.time)?.toISOString()
                }));

                // Phase 2: Fetch more articles via POST API
                console.log(`[${this.name}] Phase 2: Fetching additional pages via POST API...`);
                let currentPage = 2;
                const MAX_API_PAGES = 200; // Increased for Deep Recovery

                while (currentPage <= MAX_API_PAGES) {
                    if (currentPage % 5 === 0) console.log(`[${this.name}] Fetching Page ${currentPage}...`);

                    try {
                        const apiResponse = await page.evaluate(async (pageNum, csrfToken) => {
                            try {
                                const response = await fetch(`/latest/load-more?page=${pageNum}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'XMLHttpRequest'
                                    },
                                    body: `_token=${csrfToken}`
                                });

                                if (!response.ok) {
                                    return { error: `HTTP ${response.status}`, status: response.status };
                                }

                                const data = await response.json();
                                return { success: true, data };
                            } catch (e) {
                                return { error: (e as Error).message };
                            }
                        }, currentPage, token);

                        if (apiResponse.error) {
                            console.log(`[${this.name}] API Error on page ${currentPage}: ${apiResponse.error}`);
                            if (apiResponse.status === 404 || apiResponse.status === 403 || apiResponse.status === 422) {
                                console.log(`[${this.name}] CSRF or permission error. Stopping.`);
                                break;
                            }
                            currentPage++;
                            continue;
                        }

                        const htmlSnippet = apiResponse.data.html || '';
                        if (!htmlSnippet || htmlSnippet.length < 50) {
                            console.log(`[${this.name}] Empty response on page ${currentPage}. Stopping.`);
                            break;
                        }

                        // Parse HTML snippet
                        const parsedArticles = await page.evaluate((html) => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const articles: any[] = [];

                            doc.querySelectorAll('.CatListhead h3').forEach(h3 => {
                                const card = h3.closest('a');
                                const timeEl = card?.parentElement?.querySelector('.publishTime');

                                if (card && (card as HTMLAnchorElement).href && h3.textContent) {
                                    articles.push({
                                        url: (card as HTMLAnchorElement).href,
                                        title: h3.textContent.trim(),
                                        time: timeEl?.textContent?.trim() || 'N/A'
                                    });
                                }
                            });

                            return articles;
                        }, htmlSnippet);

                        if (parsedArticles.length === 0) {
                            console.log(`[${this.name}] No articles found in page ${currentPage}. Stopping.`);
                            break;
                        }

                        // Check limits
                        let shouldStop = false;
                        for (const item of parsedArticles) {
                            const timeStr = item.time || '';

                            // Check against limit
                            if (this.isOlderThanLimit(timeStr, dateLimit)) {
                                shouldStop = true;
                                console.log(`[${this.name}] Reached date limit at page ${currentPage} (article: ${timeStr}). Stopping.`);
                                break;
                            }

                            allArticles.push({
                                url: item.url,
                                title: item.title,
                                time: item.time,
                                source: 'Samakal',
                                rawTime: item.time,
                                publishedAt: this.parseSamakalTime(item.time)?.toISOString()
                            });
                        }

                        if (shouldStop) break;

                        currentPage++;
                        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

                    } catch (error) {
                        console.log(`[${this.name}] Exception fetching page ${currentPage}:`, error);
                        currentPage++;
                    }
                }

                console.log(`[${this.name}] Total articles collected: ${allArticles.length}`);
                await browser.close();

                if (allArticles.length > 0) {
                    return allArticles;
                }
                console.log(`[${this.name}] Proxy ${proxy} failed - 0 articles. Retrying...`);

            } catch (error) {
                console.log(`[${this.name}] Proxy ${proxy} failed:`, error);
            } finally {
                await browser.close();
            }
        }

        if (allArticles.length === 0) {
            console.error(`[${this.name}] All ${MAX_PROXY_ATTEMPTS} proxy attempts failed.`);
        }
        return allArticles;
    }
}

