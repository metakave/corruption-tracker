
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getRandomProxy } from '../lib/scrapers/proxies';

puppeteer.use(StealthPlugin());

async function main() {
    const proxy = getRandomProxy();
    console.log(`[Jamuna Verify] Using proxy: ${proxy}`);

    const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'];
    if (proxy) args.push(`--proxy-server=${proxy}`);

    const browser = await puppeteer.launch({ headless: true, args });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        console.log("Navigating to https://jamuna.tv/latest");
        await page.goto('https://jamuna.tv/latest', { waitUntil: 'domcontentloaded', timeout: 60000 });

        const title = await page.title();
        console.log("Page Title:", title);

        // Check selectors
        const cardCount = await page.evaluate(() => document.querySelectorAll('.latest-news-grid .card').length);
        console.log("Cards found (.latest-news-grid .card):", cardCount);

        const cardDetails = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.latest-news-grid .card')).slice(0, 3);
            return cards.map(c => ({
                html: c.outerHTML.substring(0, 100) + "...",
                title: c.querySelector('h5.title')?.textContent?.trim(),
                link: c.querySelector('a')?.href,
                time: c.querySelector('.time')?.textContent?.trim()
            }));
        });

        console.log("Sample Cards:", JSON.stringify(cardDetails, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
}

main();
