const puppeteer = require('puppeteer');

async function verify() {
    console.log("🚀 Starting standalone verification (Direct Connection)...");

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // Test Prothom Alo
        console.log("\n--- Testing Prothom Alo (Direct) ---");
        await page.goto('https://www.prothomalo.com/collection/latest', { waitUntil: 'networkidle2', timeout: 60000 });
        const paTitles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h3.headline-title')).map(el => el.innerText.trim()).slice(0, 3);
        });
        console.log(`✅ Prothom Alo: Found ${paTitles.length} articles.`);
        paTitles.forEach(t => console.log(`   - ${t}`));

        // Test Dhaka Post
        console.log("\n--- Testing Dhaka Post (Direct) ---");
        await page.goto('https://www.dhakapost.com/latest-news', { waitUntil: 'domcontentloaded', timeout: 60000 });
        const dpTitles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a.group h2')).map(el => el.innerText.trim()).slice(0, 3);
        });
        console.log(`✅ Dhaka Post: Found ${dpTitles.length} articles.`);
        dpTitles.forEach(t => console.log(`   - ${t}`));

    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    } finally {
        await browser.close();
        console.log("\n✨ Verification Finished.");
    }
}

verify();
