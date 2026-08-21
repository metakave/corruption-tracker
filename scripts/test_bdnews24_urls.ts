import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

async function testBdNews24Archive() {
    console.log('🔍 Testing BdNews24 Archive Structure');

    // Test different URL patterns
    const urlsToTest = [
        'https://bangla.bdnews24.com/archive',
        'https://bangla.bdnews24.com/archive?page=1',
        'https://bangla.bdnews24.com/archive?page=2',
        'https://bangla.bdnews24.com/archive/2',
        'https://bangla.bdnews24.com/archive/page/2',
    ];

    for (let attempt = 0; attempt < 10; attempt++) {
        const proxy = getRandomProxy();
        console.log(`\nAttempt ${attempt + 1} with proxy: ${proxy}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            for (const url of urlsToTest) {
                try {
                    console.log(`\n  Testing: ${url}`);
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const info = await page.evaluate(() => {
                        const title = document.title;
                        const storyLinks = document.querySelectorAll('a[href*="/story"], a[href*="/news"]').length;
                        const allLinks = document.querySelectorAll('a').length;

                        // Check for pagination elements
                        const pagination = document.querySelector('.pagination, .pager, nav[aria-label="pagination"]');
                        const hasLoadMore = !!document.querySelector('.load-more, button:has-text("আরও")');

                        return {
                            title,
                            storyLinks,
                            allLinks,
                            hasPagination: !!pagination,
                            hasLoadMore,
                            url: window.location.href
                        };
                    });

                    console.log(`    ✓ Title: ${info.title}`);
                    console.log(`    ✓ Story links: ${info.storyLinks}`);
                    console.log(`    ✓ Total links: ${info.allLinks}`);
                    console.log(`    ✓ Has pagination: ${info.hasPagination}`);
                    console.log(`    ✓ Has load more: ${info.hasLoadMore}`);
                    console.log(`    ✓ Final URL: ${info.url}`);

                    if (info.storyLinks > 0) {
                        console.log(`\n✅ SUCCESS: Found ${info.storyLinks} story links at ${url}`);
                    }

                } catch (e) {
                    console.log(`    ❌ Failed: ${(e as Error).message}`);
                }

                await new Promise(r => setTimeout(r, 1000));
            }

            await browser.close();
            return;

        } catch (e) {
            console.log(`  Proxy failed: ${(e as Error).message}`);
            await browser.close();
        }
    }
}

testBdNews24Archive();
