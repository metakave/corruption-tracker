import puppeteer from 'puppeteer';
import fs from 'fs';

async function dump() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const url = 'https://www.jugantor.com/national/1047413';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const html = await page.evaluate(() => {
        const headline = document.querySelector('h1.desktopDetailHeadline');
        if (!headline) return '<h1>Headline NOT FOUND</h1>';

        // Go up to the row col container (usually 2-3 levels up)
        let container = headline.parentElement;
        if (container && container.parentElement) container = container.parentElement;
        if (container && container.parentElement) container = container.parentElement;

        return container ? container.outerHTML : '<h1>Container NOT FOUND</h1>';
    });

    fs.writeFileSync('jugantor_dump.html', html);
    console.log('Dumped HTML to jugantor_dump.html');
    await browser.close();
}

dump();
