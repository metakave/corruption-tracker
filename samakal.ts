import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsSourceScraper, ScrapedArticle } from './types';
import * as cheerio from 'cheerio';

puppeteer.use(StealthPlugin());

export class SamakalScraper implements NewsSourceScraper {
    name = 'Samakal';
    source = 'Samakal';
    baseUrl = 'https://samakal.com';
    listUrl = 'https://samakal.com/rss';

    async scrape(): Promise<ScrapedArticle[]> {
        console.log(`[Samakal] Starting RSS scrape from ${this.listUrl}...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        const articles: ScrapedArticle[] = [];

        try {
            await page.setViewport({ width: 1280, height: 800 });

            // Navigate and wait for potential Cloudflare challenge
            console.log('[Samakal] Navigating and waiting for challenge...');
            await page.goto(this.listUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Detect Cloudflare
            const title = await page.title();
            if (title.includes('Just a moment') || title.includes('Attention Required')) {
                console.log('[Samakal] Cloudflare challenge detected. Waiting...');
                try {
                    await page.waitForFunction(() => !document.title.includes('Just a moment') && !document.title.includes('Attention Required'), { timeout: 30000 });
                    console.log('[Samakal] Cloudflare challenge passed (Title changed).');
                } catch (e) {
                    console.log('[Samakal] Timeout waiting for challenge pass.');
                }
            }

            // Get content - for RSS it might be displayed as text or XML tree in Chrome
            // We use page.content() to get the DOM serialization
            const content = await page.content();
            // console.log(`[Samakal] Content preview: ${content.substring(0, 200)}`);

            const $ = cheerio.load(content, { xmlMode: true });

            let count = 0;
            $('item').each((i, item) => {
                const title = $(item).find('title').text();
                const link = $(item).find('link').text();
                const pubDate = $(item).find('pubDate').text();

                if (title && link) {
                    articles.push({
                        url: link.trim(),
                        title: title.trim(),
                        source: 'Samakal',
                        time: pubDate,
                        rawTime: pubDate
                    });
                    count++;
                }
            });

            // If 0 articles found via XML parsing, maybe it rendered as HTML?
            if (count === 0) {
                console.log('[Samakal] No items found via generic XML. Checks for HTML text...');
                // Sometimes Chrome wraps RSS in 'pre' or 'div'
                const bodyText = await page.evaluate(() => document.body.innerText);
                // Try parsing body text as XML if it looks like it
                if (bodyText.includes('<rss') || bodyText.includes('<item>')) {
                    const $2 = cheerio.load(bodyText, { xmlMode: true });
                    $2('item').each((i, item) => {
                        const title = $2(item).find('title').text();
                        const link = $2(item).find('link').text();
                        const pubDate = $2(item).find('pubDate').text();
                        if (title && link) {
                            articles.push({ url: link.trim(), title: title.trim(), source: 'Samakal', time: pubDate, rawTime: pubDate });
                        }
                    });
                }
            }

        } catch (error) {
            console.error(`[Samakal] RSS Scrape error:`, error);
        } finally {
            await browser.close();
        }

        console.log(`[Samakal] Found ${articles.length} articles via RSS.`);
        return articles;
    }
}
