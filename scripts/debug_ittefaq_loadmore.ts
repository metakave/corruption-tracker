import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

const URL = 'https://www.ittefaq.com.bd/latest-news';

async function debugLoadMore() {
    console.log(`🔍 Debugging Ittefaq Load More Mechanism`);

    for (let attempt = 0; attempt < 5; attempt++) {
        const proxy = getRandomProxy();
        console.log(`\nAttempt ${attempt + 1} with proxy: ${proxy}`);

        const browser = await puppeteer.launch({
            headless: false, // Visual debugging
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

            console.log('Initial article count:');
            let count = await page.evaluate(() => document.querySelectorAll('.tag_title_holder').length);
            console.log(`  - ${count} articles`);

            // Try clicking Load More
            for (let click = 0; click < 5; click++) {
                console.log(`\nClick attempt ${click + 1}:`);

                const buttonInfo = await page.evaluate(() => {
                    const btn = document.querySelector('.ajax_load_btn');
                    if (!btn) return { exists: false };

                    return {
                        exists: true,
                        text: (btn as HTMLElement).innerText,
                        visible: (btn as HTMLElement).offsetParent !== null,
                        disabled: (btn as HTMLButtonElement).disabled
                    };
                });

                console.log(`  Button state:`, buttonInfo);

                if (!buttonInfo.exists) {
                    console.log('  ❌ Button not found');
                    break;
                }

                // Click and wait
                await page.click('.ajax_load_btn');
                console.log('  ✓ Clicked');

                await page.waitForTimeout(3000);

                const newCount = await page.evaluate(() => document.querySelectorAll('.tag_title_holder').length);
                console.log(`  Article count: ${count} → ${newCount}`);

                if (newCount === count) {
                    console.log('  ⚠️  No new articles loaded');
                    break;
                }

                count = newCount;
            }

            console.log(`\n✅ Final count: ${count} articles`);
            await browser.close();
            return;

        } catch (e) {
            console.log(`Failed: ${(e as Error).message}`);
            await browser.close();
        }
    }
}

debugLoadMore();
