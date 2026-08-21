
import puppeteer from 'puppeteer';
import fs from 'fs';

async function main() {
    const url = 'https://www.ajkerpatrika.com/ajpywx03miwcj';
    console.log(`Checking DOM for ${url}...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 1080 });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait a bit
        await new Promise(r => setTimeout(r, 5000));

        const html = await page.content();
        fs.writeFileSync('ajker_dump.html', html);
        console.log(`Saved HTML to ajker_dump.html (${html.length} bytes)`);

        // Check selectors
        const hasStoryDetails = await page.$('.story-details');
        console.log(`.story-details found: ${!!hasStoryDetails}`);

        const hasRichtext = await page.$('.block-full_richtext');
        console.log(`.block-full_richtext found: ${!!hasRichtext}`);

        const privacyText = await page.evaluate(() => document.body.innerText.includes('We value your privacy'));
        console.log(`"We value your privacy" found: ${privacyText}`);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

main();
