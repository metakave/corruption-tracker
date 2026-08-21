
import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

const URL = 'https://bangla.bdnews24.com/archive';

async function inspectBdNews24LoadMore() {
    console.log(`🔍 Inspecting BdNews24 Load More: ${URL}`);

    // Use loop for reliability
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

            await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const data = await page.evaluate(() => {
                // Check specifically for Load More buttons
                const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a.btn, a'));
                const loadMoreCandidates = buttons.filter(b => {
                    const text = (b as HTMLElement).innerText?.toLowerCase() || '';
                    return text.includes('load more') || text.includes('more') || text.includes('আরও');
                }).map(b => ({
                    text: (b as HTMLElement).innerText,
                    className: b.className,
                    tagName: b.tagName
                })).slice(0, 5); // Limit output

                return {
                    title: document.title,
                    articleCount: document.querySelectorAll('a[href*="/story"], a[href*="/news"]').length,
                    loadMoreButtons: loadMoreCandidates
                };
            });

            console.log('--- BDNEWS24 DATA ---');
            console.log(JSON.stringify(data, null, 2));

            await browser.close();
            return;

        } catch (e) {
            console.log(`Failed: ${e.message}`);
            await browser.close();
        }
    }
}

inspectBdNews24LoadMore();
