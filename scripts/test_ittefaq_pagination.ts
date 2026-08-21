import puppeteer from 'puppeteer';

async function testIttefaqPagination() {
    console.log('Testing Ittefaq Pagination...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Test page 2
    const url = 'https://www.ittefaq.com.bd/latest-news?page=2';
    console.log(`Navigating to ${url}...`);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const titles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.tag_title_holder')).map(el => el.textContent?.trim());
    });

    console.log(`Found ${titles.length} articles on Page 2`);
    if (titles.length > 0) {
        console.log('Sample:', titles.slice(0, 3));
    } else {
        console.log('No articles found (Pagination might not work with query param)');
    }

    // Try URL segment pagination: https://www.ittefaq.com.bd/latest-news/2
    const url2 = 'https://www.ittefaq.com.bd/latest-news/2';
    console.log(`\nNavigating to ${url2}...`);

    await page.goto(url2, { waitUntil: 'domcontentloaded' });

    const titles2 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.tag_title_holder')).map(el => el.textContent?.trim());
    });

    console.log(`Found ${titles2.length} articles on Page 2 (segment)`);
    if (titles2.length > 0) {
        console.log('Sample:', titles2.slice(0, 3));
    }

    await browser.close();
}

testIttefaqPagination();
