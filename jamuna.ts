import puppeteer, { ElementHandle } from 'puppeteer';
import { NewsSourceScraper, ScrapedArticle } from './types';

export class JamunaScraper implements NewsSourceScraper {
    name = 'Jamuna TV';
    source = 'Jamuna TV';
    baseUrl = 'https://jamuna.tv';
    listUrl = 'https://jamuna.tv/latest';

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`[Jamuna TV] Starting scrape...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        const articles: ScrapedArticle[] = [];

        try {
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(this.listUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for Cloudflare challenge to pass
            try {
                await page.waitForFunction(() => !document.title.includes('Just a moment'), { timeout: 15000 });
                console.log('[Jamuna TV] Cloudflare challenge passed (Title changed).');
            } catch (e) {
                console.log('[Jamuna TV] Timeout waiting for title change. Might be stuck on Cloudflare.');
            }

            // Wait for content (generic body or specific header)
            try {
                await page.waitForSelector('a', { timeout: 10000 });
            } catch (e) {
                console.log('[Jamuna TV] No links found after wait.');
            }


            let hasMore = true;
            let clickCount = 0;
            const MAX_CLICKS = 10;

            while (hasMore && clickCount < MAX_CLICKS) {
                // 1. Parse current visible articles
                const newArticles = await page.evaluate(() => {
                    const cards = Array.from(document.querySelectorAll('a'));
                    return cards.map(link => {
                        const href = link.href;
                        // Filter for news links
                        if (href && (href.includes('/news/') || href.includes('/details/'))) {
                            const title = link.innerText.trim();
                            if (title.length > 10) {
                                // Try to find time nearby
                                let timeText = '';
                                const parent = link.closest('div');
                                if (parent) {
                                    const timeEl = parent.querySelector('time, span, small');
                                    if (timeEl) timeText = (timeEl as HTMLElement).innerText;
                                }
                                return {
                                    url: href,
                                    title: title,
                                    rawTime: timeText,
                                    source: 'Jamuna TV'
                                };
                            }
                        }
                        return null;
                    }).filter(a => a !== null);
                });

                // Add unique articles
                for (const article of newArticles) {
                    if (article && !articles.find(a => a.url === article.url)) {
                        articles.push(article as ScrapedArticle);
                    }
                }

                // 2. Click Load More
                // Use XPath to find button with text "আরও পড়ুন"
                const loadMoreButton = await page.waitForSelector('text/আরও পড়ুন', { timeout: 2000 }).catch(() => null);

                if (loadMoreButton) {
                    try {
                        await (loadMoreButton as ElementHandle).click();
                        await new Promise(r => setTimeout(r, 3000)); // Wait for content
                        clickCount++;
                        console.log(`[Jamuna TV] Clicked load more (${clickCount}). Total count: ${articles.length}`);
                    } catch (e) {
                        console.log("Error clicking load more:", e);
                        hasMore = false;
                    }
                } else {
                    // Try JS click on any button containing the text
                    const clicked = await page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button, a'));
                        const btn = buttons.find(b => (b as HTMLElement).innerText.includes('আরও পড়ুন'));
                        if (btn) {
                            (btn as HTMLElement).click();
                            return true;
                        }
                        return false;
                    });

                    if (clicked) {
                        await new Promise(r => setTimeout(r, 3000));
                        clickCount++;
                    } else {
                        hasMore = false;
                    }
                }
            }

        } catch (error) {
            console.error('[Jamuna TV] Scrape error:', error);
        } finally {
            await browser.close();
        }

        console.log(`[Jamuna TV] Found ${articles.length} articles.`);
        return articles;
    }
}
