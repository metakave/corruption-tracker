import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

async function inspectJugantor() {
    console.log('🔍 Inspecting Jugantor Load More Mechanism\n');

    for (let attempt = 0; attempt < 5; attempt++) {
        const proxy = getRandomProxy();
        console.log(`\nAttempt ${attempt + 1} with proxy: ${proxy}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            await page.goto('https://www.jugantor.com/latest', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            console.log('✓ Page loaded');

            // Click Load More multiple times
            for (let click = 0; click < 15; click++) {
                const beforeCount = await page.evaluate(() => document.querySelectorAll('div.media').length);

                const buttonInfo = await page.evaluate(() => {
                    const btn = document.querySelector('.clickLoadMore') as HTMLButtonElement;
                    if (btn) {
                        return {
                            exists: true,
                            visible: btn.offsetParent !== null,
                            disabled: btn.disabled,
                            text: btn.innerText,
                            classes: btn.className
                        };
                    }
                    return { exists: false };
                });

                console.log(`\nClick ${click + 1}:`);
                console.log(`  Articles: ${beforeCount}`);
                console.log(`  Button: ${JSON.stringify(buttonInfo)}`);

                if (!buttonInfo.exists || !buttonInfo.visible) {
                    console.log('  ❌ Button not available, stopping');
                    break;
                }

                await page.click('.clickLoadMore');
                await new Promise(r => setTimeout(r, 3000));

                const afterCount = await page.evaluate(() => document.querySelectorAll('div.media').length);
                console.log(`  ✓ New count: ${afterCount} (+${afterCount - beforeCount})`);

                if (afterCount === beforeCount) {
                    console.log('  ⚠️  No new articles loaded');
                    break;
                }
            }

            const finalCount = await page.evaluate(() => document.querySelectorAll('div.media').length);
            console.log(`\n✅ SUCCESS! Final article count: ${finalCount}`);

            await browser.close();
            return;

        } catch (error) {
            console.log(`❌ Proxy ${proxy} failed: ${(error as Error).message}`);
            await browser.close();
        }
    }

    console.log('\n❌ All attempts failed');
}

inspectJugantor();
