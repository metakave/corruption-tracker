
import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

const BASE_URL = 'https://bangla.bdnews24.com/archive';

async function testPagination() {
    console.log(`🔍 Inspecting BdNews24 Pagination...`);

    // Try page 2 url pattern blindly first
    const page2Url = `${BASE_URL}?page=2`;
    console.log(`Testing hypothesized URL: ${page2Url}`);

    const MAX_ATTEMPTS = 10;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const proxy = getRandomProxy();
        console.log(`\nAttempt ${i + 1}/${MAX_ATTEMPTS} using proxy: ${proxy}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Shorter timeout to fail fast on bad proxies
            await page.goto(page2Url, { waitUntil: 'domcontentloaded', timeout: 20000 });

            // Check title to see if we were blocked or if page exists
            const title = await page.title();
            if (title.includes('Just a moment') || title.includes('Attention Required')) {
                console.log('Blocked by Cloudflare');
                await browser.close();
                continue;
            }

            const data = await page.evaluate(() => {
                const articles = document.querySelectorAll('a');
                // Filter for likely story links
                const found = Array.from(articles).filter(a => a.href && (a.href.includes('/story') || a.href.includes('/news') || a.href.includes('/politics')));
                const unique = new Set(found.map(a => a.href));

                return {
                    title: document.title,
                    articleCount: found.length,
                    uniqueCount: unique.size,
                    url: window.location.href,
                    linksPreview: Array.from(unique).slice(0, 3)
                };
            });

            console.log('✅ SUCCESS');
            console.log(JSON.stringify(data, null, 2));

            await browser.close();
            return; // Exit on success

        } catch (e) {
            console.log(`Failed: ${e.message}`);
            await browser.close();
        }
    }
}

testPagination();
