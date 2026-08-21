
import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

// URL to inspect
const URL = 'https://bangla.bdnews24.com/archive';

async function inspect() {
    console.log(`🔍 Inspecting ${URL}...`);
    const proxy = getRandomProxy();
    console.log(`Using proxy: ${proxy}`);

    const browser = await puppeteer.launch({
        headless: true, // Try headless first, but Cloudflare might catch it. 
        // Real browser usage often needs headless: false or stealth plugin
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--proxy-server=${proxy}`
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating...');
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Dump HTML structure to understand selectors
        const data = await page.evaluate(() => {
            // Try to find articles
            // Common selectors: row, article, card
            const links = Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText,
                href: a.href,
                class: a.className
            })).filter(a => a.href.includes('/story') || a.href.includes('/news') || a.href.length > 50);

            return {
                title: document.title,
                links: links.slice(0, 20),
                bodyClasses: document.body.className,
                htmlPreview: document.body.innerHTML.substring(0, 500)
            };
        });

        console.log('--- PAGE DATA ---');
        console.log('Title:', data.title);
        console.log('Body Classes:', data.bodyClasses);
        console.log('HTML Preview:', data.htmlPreview);
        console.log('Found Links:', JSON.stringify(data.links, null, 2));

    } catch (err) {
        console.error('Failed:', err);
    } finally {
        await browser.close();
    }
}

inspect();
