import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function main() {
    console.log('🚀 Inspecting Jugantor "Load More" & Time Structure...');

    // Launch browser
    const browser = await puppeteer.launch({
        headless: true, // Use headless for script, but capture logic mimics real user
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Setup request interception to catch the AJAX call
        console.log('Setting up request interception...');
        let capturedRequest = null;
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (req.url().includes('/ajax/') || req.url().includes('latestnews')) {
                console.log('>> Captured Request URL:', req.url());
                capturedRequest = req.url();
            }
            req.continue();
        });

        console.log('Navigating to https://www.jugantor.com/latest ...');
        await page.goto('https://www.jugantor.com/latest', { waitUntil: 'networkidle2', timeout: 60000 });

        // 1. Inspect Initial Articles & Time Structure
        console.log('\n--- Initial Article Inspection ---');
        const articles = await page.evaluate(() => {
            const items: any[] = [];
            document.querySelectorAll('#loadMoreContent .col-4.pt-3, #loadMoreContent .col-6').forEach((el, index) => {
                if (items.length >= 5) return; // Just first 5
                const title = el.querySelector('.headline')?.textContent?.trim() || el.querySelector('a.text-decoration-none')?.textContent?.trim();
                const time = el.querySelector('.paper-time')?.textContent?.trim() || el.querySelector('small')?.textContent?.trim();
                items.push({ index, title, time });
            });
            return items;
        });

        console.log('Create Date Structure samples:');
        articles.forEach(a => console.log(`[${a.index}] Time: "${a.time}" | Title: ${a.title?.substring(0, 30)}...`));

        // 2. Find and Click "Load More"
        console.log('\n--- Finding Load More Button ---');
        const btnSelector = '#loadMore';
        const buttonExists = await page.$(btnSelector);

        if (buttonExists) {
            console.log('Button #loadMore FOUND.');

            // Scroll to it
            await page.evaluate((sel) => {
                document.querySelector(sel)?.scrollIntoView();
            }, btnSelector);

            await new Promise(r => setTimeout(r, 1000));

            console.log('Clicking button to trigger network request...');
            // Reset captured request
            capturedRequest = null;

            await page.click(btnSelector);

            // Wait for network request
            await new Promise(r => setTimeout(r, 3000));

            if (capturedRequest) {
                console.log('\n✅ SUCCESS: Button click triggered URL:', capturedRequest);
                console.log('We should use THIS format in the scraper.');
            } else {
                console.log('\n❌ WARNING: Button clicked but no specific /ajax/ request captured yet.');
                console.log('Printing all requests happening now...');
                // (Listener is still active, so previous logs would show)
            }

        } else {
            console.log('❌ Button #loadMore NOT found. Dumping visible buttons...');
            const buttons = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('button')).map(b => ({
                    text: b.textContent?.trim(),
                    class: b.className,
                    id: b.id
                }));
            });
            console.log(buttons);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

main();
