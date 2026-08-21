import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function main() {
    console.log('🚀 Inspecting Jugantor Menus & "All News"...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://www.jugantor.com', { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract links
        const links = await page.evaluate(() => {
            const items: any[] = [];
            document.querySelectorAll('a').forEach(a => {
                const text = a.textContent?.trim() || '';
                const href = a.href;
                if (
                    text.includes('সব') ||
                    text.includes('খবর') ||
                    text.includes('Latest') ||
                    text.includes('All') ||
                    text.includes('Archive') ||
                    text.includes('Todays') ||
                    href.includes('all-news') ||
                    href.includes('latest') ||
                    href.includes('archive') ||
                    href.includes('todays-paper')
                ) {
                    items.push({ text, href });
                }
            });
            return items;
        });

        console.log('Found Links:');
        links.forEach(l => console.log(`- [${l.text}] ${l.href}`));

        // Check if there is a Load More button on /latest
        console.log('\nChecking /latest page structure...');
        await page.goto('https://www.jugantor.com/latest', { waitUntil: 'domcontentloaded' });

        const loadMoreBtn = await page.evaluate(() => {
            const btn = document.querySelector('#loadMore') || document.querySelector('.load-more') || document.querySelector('button');
            return btn ? {
                id: btn.id,
                class: btn.className,
                text: btn.textContent,
                onclick: btn.getAttribute('onclick')
            } : null;
        });

        console.log('Load More Button on /latest:', loadMoreBtn);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

main();
