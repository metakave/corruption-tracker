import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function main() {
    console.log('🚀 Debugging Jugantor DOM Content (Scroll & Wait)...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to latest...');
        await page.goto('https://www.jugantor.com/latest', { waitUntil: 'domcontentloaded', timeout: 30000 });

        console.log('Scrolling...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 5000)); // Wait for lazy load

        const info = await page.evaluate(() => {
            const headlines = Array.from(document.querySelectorAll('.headline, h3, h4, div[class*="headline"]')).map(h => h.textContent?.trim().substring(0, 50));
            const detailLinks = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('details') || a.href.includes('/news/')).map(a => a.href);
            return {
                headlineCount: headlines.length,
                detailLinkCount: detailLinks.length,
                firstHeadlines: headlines.slice(0, 5)
            };
        });

        console.log('Analysis:', info);
        await page.screenshot({ path: 'jugantor_after_scroll.png' });
        console.log('Saved jugantor_after_scroll.png');

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

main();
