import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { NewsSourceScraper, ScrapedArticle } from './types'
import { getRandomProxy } from './proxies'

puppeteer.use(StealthPlugin())

export class AjkerPatrikaScraper implements NewsSourceScraper {
    name = 'Ajker Patrika'
    baseUrl = 'https://www.ajkerpatrika.com/latest-news'
    apiUrl = 'https://api.ajkerpatrika.com/api/v2/home/'

    async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper (Hybrid Browser+API)... Limit: ${dateLimit ? dateLimit.toISOString() : '24h'}`)

        const MAX_PROXY_ATTEMPTS = 2;
        let proxyAttempt = 0;
        let allArticles: ScrapedArticle[] = [];

        while (proxyAttempt < MAX_PROXY_ATTEMPTS && allArticles.length === 0) {
            const proxy = getRandomProxy();
            proxyAttempt++;
            console.log(`[${this.name}] Attempt ${proxyAttempt}/${MAX_PROXY_ATTEMPTS} using proxy: ${proxy}...`);

            const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'];
            if (proxy) args.push(`--proxy-server=${proxy}`);

            const browser = await puppeteer.launch({
                headless: true,
                args
            });
            const page = await browser.newPage();
            // Increase timeout for slow proxies
            page.setDefaultNavigationTimeout(60000);

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 1080 });

            try {
                console.log(`[${this.name}] Phase 1: Loading initial articles from DOM...`);
                await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Wait for initial articles to load
                await page.waitForSelector('a.grid', { timeout: 30000 });
                await new Promise(r => setTimeout(r, 2000)); // Let page settle

                // Extract initial 16 articles from DOM
                const initialArticles = await page.evaluate(() => {
                    const results: any[] = [];
                    document.querySelectorAll('a.grid.grid-cols-5').forEach((el) => {
                        if ((el as HTMLAnchorElement).href.includes('epaper')) return;

                        const titleEl = el.querySelector('h2');
                        const timeSpan = Array.from(el.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('আগে'));

                        if (el instanceof HTMLAnchorElement && el.href && titleEl) {
                            results.push({
                                url: el.href,
                                title: titleEl.textContent?.trim(),
                                time: timeSpan?.textContent?.trim() || 'N/A',
                                source: 'Ajker Patrika',
                                rawTime: timeSpan?.textContent?.trim() || 'N/A',
                                publishedAt: new Date().toISOString()
                            });
                        }
                    });
                    return results;
                });

                console.log(`[${this.name}] Phase 1 Complete: Found ${initialArticles.length} initial articles`);
                allArticles = [...initialArticles];

                // Check if we should continue (check oldest article time from Phase 1)
                // Note: DOM time is relative ("2 hours ago"), so we trust it if it says "1 day ago" etc.
                if (initialArticles.length > 0) {
                    const oldestTime = initialArticles[initialArticles.length - 1].time;
                    if (oldestTime.includes('১ দিন') || oldestTime.includes('২ দিন') || oldestTime.includes('গতকাল')) {
                        console.log(`[${this.name}] Initial articles already exceed 24h. Stopping.`);
                        await browser.close();
                        return allArticles;
                    }
                }

                // Phase 2: Fetch more articles via API
                console.log(`[${this.name}] Phase 2: Fetching additional pages via API...`);
                let currentPage = 3; // Pages 1-2 are already loaded in DOM
                const MAX_API_PAGES = 50;

                while (currentPage <= MAX_API_PAGES) {
                    const apiUrlWithPage = `${this.apiUrl}?page=${currentPage}&page_size=8`;
                    console.log(`[${this.name}] Fetching API page ${currentPage}...`);

                    let apiResponse: any = null;
                    let retryCount = 0;
                    const MAX_RETRIES = 3;

                    // Retry logic for fetch
                    while (retryCount < MAX_RETRIES) {
                        try {
                            apiResponse = await page.evaluate(async (url) => {
                                try {
                                    const response = await fetch(url);
                                    if (!response.ok) {
                                        return { error: `HTTP ${response.status}`, status: response.status };
                                    }
                                    const data = await response.json();
                                    return { success: true, data };
                                } catch (e) {
                                    return { error: (e as Error).message };
                                }
                            }, apiUrlWithPage);

                            if (apiResponse.error) {
                                throw new Error(apiResponse.error); // Trigger retry
                            }
                            break; // Success
                        } catch (e) {
                            retryCount++;
                            console.log(`[${this.name}] API Page ${currentPage} fetch failed (Attempt ${retryCount}/${MAX_RETRIES}): ${e instanceof Error ? e.message : e}`);
                            await new Promise(r => setTimeout(r, 2000 * retryCount)); // Exponential backoff: 2s, 4s, 6s
                        }
                    }

                    if (!apiResponse || apiResponse.error) {
                        console.log(`[${this.name}] Failed to fetch page ${currentPage} after ${MAX_RETRIES} attempts. Skipping.`);
                        // Check if it was 404/403 which means end of feed
                        if (apiResponse && (apiResponse.status === 404 || apiResponse.status === 403)) {
                            console.log(`[${this.name}] No more pages available (404/403). Stopping.`);
                            break;
                        }
                        currentPage++;
                        continue;
                    }

                    const results = apiResponse.data.results || [];
                    if (results.length === 0) {
                        console.log(`[${this.name}] No more articles on page ${currentPage}. Stopping.`);
                        break;
                    }

                    console.log(`[${this.name}] API page ${currentPage}: Found ${results.length} articles`);

                    // Parse API response
                    let shouldStop = false;
                    for (const item of results) {
                        const articleUrl = `https://www.ajkerpatrika.com/${item.news_slug || ''}`;
                        const title = item.title || 'N/A';

                        let relativeTime = 'N/A';
                        const publishedAt = item.meta?.first_published_at || item.meta?.last_published_at;

                        if (publishedAt) {
                            try {
                                const createdDate = new Date(publishedAt);
                                const now = new Date();
                                const diffMs = now.getTime() - createdDate.getTime();
                                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                const diffHours = Math.floor(diffMinutes / 60);
                                const diffDays = Math.floor(diffHours / 24);

                                const toBengaliNumber = (num: number): string => {
                                    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
                                    return String(num).split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
                                };

                                if (dateLimit) {
                                    if (createdDate < dateLimit) {
                                        shouldStop = true;
                                    }
                                } else {
                                    if (diffDays >= 2) {
                                        relativeTime = `${toBengaliNumber(diffDays)} দিন আগে`;
                                        shouldStop = true;
                                    } else if (diffDays >= 1) {
                                        relativeTime = `১ দিন আগে`;
                                        if (diffHours >= 24) shouldStop = true;
                                    } else if (diffHours > 0) {
                                        relativeTime = `${toBengaliNumber(diffHours)} ঘণ্টা আগে`;
                                    } else if (diffMinutes > 0) {
                                        relativeTime = `${toBengaliNumber(diffMinutes)} মিনিট আগে`;
                                    } else {
                                        relativeTime = 'এখনই';
                                    }
                                }
                            } catch (e) {
                                console.log(`[${this.name}] Error parsing date: ${publishedAt}`);
                            }
                        }

                        if (publishedAt) {
                            allArticles.push({
                                url: articleUrl,
                                title: title,
                                time: relativeTime,
                                source: 'Ajker Patrika',
                                rawTime: relativeTime,
                                publishedAt: new Date(publishedAt).toISOString()
                            });
                        } else {
                            // Fallback if no specific time metadata
                            allArticles.push({
                                url: articleUrl,
                                title: title,
                                time: relativeTime,
                                source: 'Ajker Patrika',
                                rawTime: relativeTime,
                                publishedAt: new Date().toISOString() // Default to now if missing
                            });
                        }

                        if (shouldStop) {
                            console.log(`[${this.name}] Reached 24h limit at page ${currentPage}. Stopping.`);
                            break;
                        }
                    }

                    if (shouldStop) break;

                    currentPage++;
                    await new Promise(r => setTimeout(r, 1000)); // Delay
                }

                console.log(`[${this.name}] Total articles collected: ${allArticles.length}`);
                await browser.close();

                if (allArticles.length > 50) {
                    return allArticles;
                }
                console.log(`[${this.name}] Proxy ${proxy} yielded < 50 articles (${allArticles.length}). Retrying...`);
                // Reset if retry
                // allArticles = []; // Actually, we should allow retry to overwrite allArticles
                // But wait, if Phase 1 succeeded (16 articles) and Phase 2 failed completely, we get 16.
                // We want > 50.
                allArticles = [];

            } catch (error) {
                console.log(`[${this.name}] Proxy ${proxy} failed:`, error);
                await browser.close();
            }
        }

        console.error(`[${this.name}] All ${MAX_PROXY_ATTEMPTS} proxy attempts failed.`);
        return allArticles;
    }
}
