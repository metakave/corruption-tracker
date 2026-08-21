import puppeteer from 'puppeteer';

async function debugNews24BDContent() {
    console.log('🔍 Debugging News24BD Content Extraction\n');

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Test with a specific article
    const testUrl = 'https://news24bd.tv/details/259713';
    console.log(`Testing URL: ${testUrl}\n`);

    try {
        await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        const debug = await page.evaluate(() => {
            // Try the current selector
            const contentEl1 = document.querySelector('div[class*="details_articleArea"]');

            // Try alternative selectors
            const contentEl2 = document.querySelector('.details_articleArea__t7HvD');
            const contentEl3 = document.querySelector('article');
            const contentEl4 = document.querySelector('.article-content');

            return {
                selector1: {
                    found: !!contentEl1,
                    text: contentEl1 ? (contentEl1 as HTMLElement).innerText.substring(0, 200) : '',
                    length: contentEl1 ? (contentEl1 as HTMLElement).innerText.length : 0
                },
                selector2: {
                    found: !!contentEl2,
                    text: contentEl2 ? (contentEl2 as HTMLElement).innerText.substring(0, 200) : '',
                    length: contentEl2 ? (contentEl2 as HTMLElement).innerText.length : 0
                },
                selector3: {
                    found: !!contentEl3,
                    text: contentEl3 ? (contentEl3 as HTMLElement).innerText.substring(0, 200) : '',
                    length: contentEl3 ? (contentEl3 as HTMLElement).innerText.length : 0
                },
                selector4: {
                    found: !!contentEl4,
                    text: contentEl4 ? (contentEl4 as HTMLElement).innerText.substring(0, 200) : '',
                    length: contentEl4 ? (contentEl4 as HTMLElement).innerText.length : 0
                },
                bodyHTML: document.body.innerHTML.substring(0, 1000)
            };
        });

        console.log('Selector Results:');
        console.log('='.repeat(60));
        console.log(`\n1. div[class*="details_articleArea"]:`);
        console.log(`   Found: ${debug.selector1.found}`);
        console.log(`   Length: ${debug.selector1.length}`);
        console.log(`   Text: "${debug.selector1.text}..."`);

        console.log(`\n2. .details_articleArea__t7HvD:`);
        console.log(`   Found: ${debug.selector2.found}`);
        console.log(`   Length: ${debug.selector2.length}`);
        console.log(`   Text: "${debug.selector2.text}..."`);

        console.log(`\n3. article:`);
        console.log(`   Found: ${debug.selector3.found}`);
        console.log(`   Length: ${debug.selector3.length}`);
        console.log(`   Text: "${debug.selector3.text}..."`);

        console.log(`\n4. .article-content:`);
        console.log(`   Found: ${debug.selector4.found}`);
        console.log(`   Length: ${debug.selector4.length}`);
        console.log(`   Text: "${debug.selector4.text}..."`);

        console.log('\n' + '='.repeat(60));
        console.log('Body HTML sample:');
        console.log('='.repeat(60));
        console.log(debug.bodyHTML);

    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
    }

    await browser.close();
}

debugNews24BDContent();
