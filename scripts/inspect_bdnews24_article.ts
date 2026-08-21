
import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

// Sample URL found in previous test
const URL = 'https://bangla.bdnews24.com/politics/fb1f04a42369';

async function inspectArticle() {
    console.log(`🔍 Inspecting BdNews24 Article: ${URL}`);

    // Try up to 10 proxies
    for (let i = 0; i < 10; i++) {
        const proxy = getRandomProxy();
        console.log(`Attempt ${i + 1} with proxy: ${proxy}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const data = await page.evaluate(() => {
                // Find potential content containers
                // Common candidates: article, .story, .content, main
                const candidates = [
                    { sel: 'article', el: document.querySelector('article') },
                    { sel: '#content', el: document.querySelector('#content') },
                    { sel: '.story-content', el: document.querySelector('.story-content') },
                    { sel: '.main-content', el: document.querySelector('.main-content') },
                    { sel: 'div[itemprop="articleBody"]', el: document.querySelector('div[itemprop="articleBody"]') }
                ];

                const result = candidates.map(c => {
                    if (!c.el) return null;
                    return {
                        selector: c.sel,
                        className: c.el.className,
                        id: c.el.id,
                        textLength: (c.el as HTMLElement).innerText.length,
                        preview: (c.el as HTMLElement).innerText.substring(0, 100)
                    };
                }).filter(r => r !== null);

                // Return class list of body and main too
                return {
                    bodyClass: document.body.className,
                    foundContainers: result,
                    allDivClasses: Array.from(document.querySelectorAll('div')).map(d => d.className).slice(0, 50)
                };
            });

            console.log('--- INSPECTION DATA ---');
            console.log(JSON.stringify(data, null, 2));

            await browser.close();
            return; // Success

        } catch (e) {
            console.log(`Failed: ${e.message}`);
            await browser.close();
        }
    }
}

inspectArticle();
