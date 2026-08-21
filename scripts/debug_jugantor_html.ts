import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function main() {
    console.log('🚀 Debugging Jugantor HTML (Waiting for Ajax)...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating...');
        await page.goto('https://www.jugantor.com/latest', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Waiting for network idle...');
        // Wait for Ajax content
        try {
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        } catch (e) { console.log('Network idle wait timeout (expected if no nav)'); }

        // Explicit wait for a likely article selector
        try {
            console.log('Waiting for .headline...');
            await page.waitForSelector('.headline', { timeout: 10000 });
        } catch (e) {
            console.log('Warning: .headline not found in 10s');
        }

        const content = await page.content();
        fs.writeFileSync('jugantor_dump.html', content);
        console.log('Saved jugantor_dump.html');

        const count = await page.evaluate(() => document.querySelectorAll('.headline').length);
        console.log(`Found ${count} .headline elements.`);

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('details'));
        });
        console.log(`Found ${links.length} details links.`);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

main();
