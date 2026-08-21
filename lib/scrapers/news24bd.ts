
import puppeteer from 'puppeteer';
import { NewsSourceScraper, ScrapedArticle } from './types';
import { getRandomProxy } from './proxies';

export class News24BDScraper implements NewsSourceScraper {
    name = 'News24BD';
    baseUrl = 'https://news24bd.tv/topic/todayall';

    async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper... Limit: ${dateLimit ? dateLimit.toISOString() : '24h'}`);

        const MAX_ATTEMPTS = 20;
        let attempt = 0;

        while (attempt < MAX_ATTEMPTS) {

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
            // Increase timeout for slow proxies
            page.setDefaultNavigationTimeout(60000);

            try {
                // Set viewport to desktop to ensure full content loading
                await page.setViewport({ width: 1280, height: 800 });
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                console.log(`[${this.name}] Navigating to ${this.baseUrl}...`);
                await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded' });

                console.log(`[${this.name}] Starting infinite scroll to load all articles...`);

                // Infinite Scroll Logic
                let previousHeight = 0;
                let noChangeCount = 0;
                const maxScrolls = 20; // 20 scrolls usually gives 100+ articles
                let scrolls = 0;

                while (scrolls < maxScrolls) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await new Promise(r => setTimeout(r, 4000)); // Wait for content load

                    // Check if new content loaded
                    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
                    const articleCount = await page.evaluate(() => document.querySelectorAll('.card').length);

                    console.log(`[${this.name}] Scroll ${scrolls + 1}: ${articleCount} articles`);

                    if (currentHeight === previousHeight) {
                        noChangeCount++;
                        console.log(`[${this.name}] No new articles after scroll, waiting longer...`);
                        await new Promise(r => setTimeout(r, 5000)); // Extra wait
                        if (noChangeCount >= 2) {
                            console.log(`[${this.name}] No more articles loading, stopping at ${articleCount}`);
                            break;
                        }
                    } else {
                        noChangeCount = 0;
                    }

                    previousHeight = currentHeight;
                    scrolls++;
                }

                // Extract Feed Items (Metadata Only - Standard Engineering Practice)
                const articles = await page.evaluate(() => {
                    const items: any[] = [];
                    const cards = document.querySelectorAll('.card');

                    cards.forEach(card => {
                        const linkEl = card.querySelector('a.text-dark');
                        const titleEl = card.querySelector('h5.card-title');

                        if (linkEl && titleEl) {
                            const href = linkEl.getAttribute('href');
                            const fullUrl = href?.startsWith('http') ? href : `https://news24bd.tv${href}`;

                            items.push({
                                title: titleEl.textContent?.trim() || 'No Title',
                                url: fullUrl,
                                time: 'Today',
                                source: 'News24BD',
                                rawTime: 'Today',
                                publishedAt: new Date().toISOString()
                            });
                        }
                    });

                    // Deduplicate
                    const unique = new Map();
                    items.forEach(i => unique.set(i.url, i));
                    return Array.from(unique.values());
                });

                console.log(`[${this.name}] Found ${articles.length} articles.`);
                await browser.close();

                if (articles.length > 0) {
                    return articles; // Standard: Return List, let pipeline handle content
                } else {
                    console.log(`[${this.name}] 0 articles found. Retrying...`);
                }

            } catch (error) {
                console.log(`[${this.name}] Error with proxy ${proxy}:`, error);
                try { await browser.close(); } catch (e) { }
            }
        }

        return [];
    }
}
