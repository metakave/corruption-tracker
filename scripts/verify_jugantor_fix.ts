import puppeteer from 'puppeteer';

async function verify() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const url = 'https://www.jugantor.com/national/1047413';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const result = await page.evaluate(() => {
        // Updated Logic from event-processor.ts for testing

        // 1. Clutter Removal
        const clutterSelectors = [
            '.related-stories', '.advertisement', '.sidebar', '.latest-news', '.most-read', 'footer', 'header',
            '.more-news', '#MoreNews', '.tab-content', '.editor-picked', '.alert', '.cookie-banner',
            // Jugantor specific clutter
            '.relatedNewsWidgetDesktop1', '.popularNewsWidgetDesktop', '.categoryNewsWidgetDesktop1', '.marginB20'
        ];
        clutterSelectors.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));

        // 2. Content Selection
        const contentEl = document.querySelector('.desktopDetailBody') || // Jugantor Specific (Best)
            document.querySelector('.r-content') ||
            document.body;

        return (contentEl as HTMLElement).innerText.trim();
    });

    console.log(`\n--- EXTRACTED CONTENT (${result.length} chars) ---`);
    console.log(result.substring(0, 500) + '...');

    // Assertions
    const unwantedPhrase = "সম্পর্কিত খবর";
    if (result.includes(unwantedPhrase)) {
        console.error(`\n❌ TEST FAILED: Found unwanted phrase "${unwantedPhrase}"`);
    } else if (result.length > 2000) {
        console.error(`\n❌ TEST FAILED: Content too long (${result.length}), likely includes clutter.`);
    } else {
        console.log(`\n✅ TEST PASSED: Clean content extracted.`);
    }

    await browser.close();
}

verify();
