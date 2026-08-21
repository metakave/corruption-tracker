import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function main() {
    console.log('🚀 Debugging Jugantor API Density (V3 - Large Batch)...');

    // Launch args
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to Jugantor...');
        await page.goto('https://www.jugantor.com/latest', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Fetch 100 items at once
        const limit = 100;
        const offset = 0;
        const apiUrl = `https://www.jugantor.com/ajax/load/latestnews/${limit}/${offset}/0`;

        console.log(`Fetching 100 items from: ${apiUrl}`);

        const articles = await page.evaluate(async (url) => {
            try {
                const res = await fetch(url);
                if (!res.ok) return null;
                const text = await res.text();
                return JSON.parse(text);
            } catch (e) {
                return null;
            }
        }, apiUrl);

        if (!articles || !Array.isArray(articles)) {
            console.log('Failed to fetch articles.');
            return;
        }

        console.log(`\nFetched ${articles.length} articles.`);

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        let within24h = 0;

        console.log('\nID       | Date             | Ago (h) | Headline');
        console.log('---------|------------------|---------|-------------------');

        for (const art of articles) {
            const d = new Date(art.created_at);
            const diffMs = now.getTime() - d.getTime();
            const diffH = diffMs / (1000 * 60 * 60);

            if (d > oneDayAgo) within24h++;

            // Print every 10th item or if gap detected
            // Or just print first 50
            if (articles.indexOf(art) < 40) {
                console.log(`${art.id.padEnd(8)} | ${d.toISOString().slice(0, 16)} | ${diffH.toFixed(1).padEnd(7)} | ${art.headline.slice(0, 30)}...`);
            }
        }

        console.log('\n--- Analysis ---');
        console.log(`Total Within 24h: ${within24h}`);
        console.log(`Current Time (UTC): ${now.toISOString()}`);
        console.log(`Threshold (UTC):    ${oneDayAgo.toISOString()}`);
        console.log(`First Article ID: ${articles[0].id}`);
        console.log(`Last Article ID:  ${articles[articles.length - 1].id}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

main();
