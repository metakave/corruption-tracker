import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Fetching Jugantor API...');

    // Fetch offset 0
    const url = 'https://www.jugantor.com/ajax/load/latestnews/5/0/0';

    await page.goto('https://www.jugantor.com/latest', { waitUntil: 'domcontentloaded' }); // Set context

    const data = await page.evaluate(async (u) => {
        const res = await fetch(u);
        return res.json();
    }, url);

    console.log('--- API RESPONSE (First Item) ---');
    if (Array.isArray(data) && data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('No data or empty array:', data);
    }

    await browser.close();
})();
