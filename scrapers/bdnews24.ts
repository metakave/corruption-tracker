
import puppeteer from 'puppeteer';
import { NewsSourceScraper, ScrapedArticle } from './types';
import { getRandomProxy } from './proxies';

export class BdNews24Scraper implements NewsSourceScraper {
    name = 'BdNews24';
    baseUrl = 'https://bangla.bdnews24.com/samagrabangladesh'; // Changed from /archive to actual category page

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper...`);

        // NO PROXY - direct connection works better for BdNews24
        const MAX_ATTEMPTS = 3; // Reduced attempts since direct connection is reliable
        let attempt = 0;

        while (attempt < MAX_ATTEMPTS) {
            attempt++;
            console.log(`[${this.name}] Attempt ${attempt}/${MAX_ATTEMPTS} (direct connection)...`);

            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                    // NO PROXY - direct connection works
                ]
            });

            try {
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                // Navigate to the base URL first
                console.log(`[${this.name}] Navigating to base URL: ${this.baseUrl}`);
                await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                const initialTitle = await page.title();

                if (initialTitle.includes('Just a moment') || initialTitle.includes('Attention Required')) {
                    console.log(`[${this.name}] Initial page blocked by Cloudflare. Retrying with new proxy.`);
                    await browser.close();
                    continue; // Skip to the next attempt with a new proxy
                }

                // Load More button clicking strategy (similar to Prothom Alo)
                console.log(`[${this.name}] Starting article collection with Load More...`);

                const articlesFound: any[] = [];

                // Click Load More up to 10 times to get ~100 articles
                for (let click = 0; click < 10; click++) {
                    // Scrape current visible articles
                    const currentArticles = await page.evaluate(() => {
                        const items: any[] = [];
                        const links = Array.from(document.querySelectorAll('a'));
                        links.forEach(a => {
                            const href = a.href;
                            // BdNews24 uses /samagrabangladesh/2026/01/... format
                            if (href && href.includes('/samagrabangladesh/20')) {
                                const title = a.innerText.trim();
                                if (title && title.length > 10) {
                                    items.push({ title, url: href, time: 'Today' });
                                }
                            }
                        });
                        return items;
                    });

                    articlesFound.push(...currentArticles);
                    console.log(`[${this.name}] Click ${click + 1}: Found ${currentArticles.length} new articles (total: ${articlesFound.length})`);

                    // Try to click Load More
                    const loadMoreClicked = await page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button, a.btn, a'));
                        const btn = buttons.find(b => {
                            const text = (b as HTMLElement).innerText?.toLowerCase() || '';
                            return text.includes('load more') || text.includes('আরও') || text.includes('more');
                        });

                        if (btn) {
                            (btn as HTMLElement).click();
                            return true;
                        }
                        return false;
                    });

                    if (!loadMoreClicked) {
                        console.log(`[${this.name}] No Load More button found, stopping`);
                        break;
                    }

                    // Wait for new content
                    await new Promise(r => setTimeout(r, 2000));
                }

                // Deduplicate
                const unique = new Map();
                articlesFound.forEach(i => unique.set(i.url, i));
                const articles = Array.from(unique.values());

                if (articles.length > 0) {
                    console.log(`[${this.name}] Found ${articles.length} unique articles. Fetching content for top 30...`);

                    const detailedArticles: ScrapedArticle[] = [];
                    // Process top 30 articles
                    const articlesToProcess = articles.slice(0, 30);

                    for (const article of articlesToProcess) {
                        try {
                            console.log(`[${this.name}] Fetching content for: ${article.title}`);
                            await page.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                            const details = await page.evaluate(() => {
                                // Remove Clutter
                                const clutterSelectors = [
                                    '.share-buttons', '.related-stories', '.advertisement', '.sidebar',
                                    'header', 'footer', '.menu', '.nav', '.comments', '.video-player',
                                    '.floating-ad-left', '.floating-ad-right', '.floating-ad-bottom'
                                ];
                                clutterSelectors.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));

                                // Attempt to find main content safely
                                // 1. Try 'article' tag
                                let contentEl = document.querySelector('article');
                                // 2. Try generic 'main'
                                if (!contentEl) contentEl = document.querySelector('main');
                                // 3. Try standard ID/Class
                                if (!contentEl) contentEl = document.querySelector('#content') || document.querySelector('.story-content');

                                const text = contentEl ? (contentEl as HTMLElement).innerText.trim() : '';

                                // Extract Images
                                const imgs: string[] = [];
                                if (contentEl) {
                                    contentEl.querySelectorAll('img').forEach(img => {
                                        if (img.src && !img.src.includes('logo') && !img.src.includes('icon')) {
                                            imgs.push(img.src);
                                        }
                                    });
                                }
                                // Fallback image check
                                if (imgs.length === 0) {
                                    const feat = document.querySelector('img[class*="featured"], img[class*="main"]');
                                    if (feat) imgs.push((feat as HTMLImageElement).src);
                                }

                                return { text, imgs: [...new Set(imgs)] };
                            });

                            if (details.text.length > 50) {
                                detailedArticles.push({
                                    source: this.name,
                                    url: article.url,
                                    title: article.title,
                                    time: new Date().toISOString(),
                                    rawTime: 'Today',
                                    content: details.text,
                                    images: details.imgs
                                });
                            }
                        } catch (err) {
                            console.error(`[${this.name}] Failed to fetch content for ${article.url}: ${err}`);
                        }
                    }

                    await browser.close();
                    return detailedArticles;
                } else {
                    console.log(`[${this.name}] 0 articles found. Retrying...`);
                }

            } catch (error) {
                console.log(`[${this.name}] Attempt failed: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                await browser.close();
            }
        }

        console.error(`[${this.name}] Failed after ${MAX_ATTEMPTS} attempts.`);
        return [];
    }
}
