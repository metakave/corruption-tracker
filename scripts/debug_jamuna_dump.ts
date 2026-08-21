
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getRandomProxy } from '../lib/scrapers/proxies';

puppeteer.use(StealthPlugin());

async function main() {
    const proxy = getRandomProxy();
    console.log(`[Jamuna Dump] Using proxy: ${proxy}`);

    const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'];
    if (proxy) args.push(`--proxy-server=${proxy}`);

    const browser = await puppeteer.launch({ headless: true, args });
    const page = await browser.newPage();
    try {
        await page.goto('https://jamuna.tv/latest', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Find ANY link that looks like a news article
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/news/')).slice(0, 5).map(a => ({
                href: a.href,
                parentClass: a.parentElement?.className,
                grandParentClass: a.parentElement?.parentElement?.className,
                text: a.textContent?.trim()
            }));
        });
        console.log("Found Links:", JSON.stringify(links, null, 2));

        // Dump generic classes
        const divs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('div')).slice(0, 20).map(d => d.className).filter(c => c);
        });
        console.log("Top Div Classes:", divs);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}
main();
