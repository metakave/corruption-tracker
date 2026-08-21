import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

async function testBdNews24Isolated() {
    console.log('🔬 ISOLATED TEST: BdNews24 Scraper Diagnosis\n');

    const testScenarios = [
        { name: 'No Proxy', proxy: null },
        { name: 'With Proxy (5 attempts)', proxy: true, attempts: 5 }
    ];

    for (const scenario of testScenarios) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`SCENARIO: ${scenario.name}`);
        console.log('='.repeat(60));

        const maxAttempts = scenario.attempts || 1;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const proxy = scenario.proxy ? getRandomProxy() : null;

            if (proxy) {
                console.log(`\nAttempt ${attempt + 1}/${maxAttempts} - Proxy: ${proxy}`);
            } else {
                console.log(`\nAttempt ${attempt + 1}/${maxAttempts} - Direct connection (no proxy)`);
            }

            const launchOptions: any = {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };

            if (proxy) {
                launchOptions.args.push(`--proxy-server=${proxy}`);
            }

            const browser = await puppeteer.launch(launchOptions);

            try {
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                const baseUrl = 'https://bangla.bdnews24.com/archive';
                console.log(`  → Navigating to: ${baseUrl}`);

                const startTime = Date.now();
                await page.goto(baseUrl, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });
                const loadTime = Date.now() - startTime;

                const pageInfo = await page.evaluate(() => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        hasCloudflare: document.title.includes('Just a moment') ||
                            document.title.includes('Attention Required') ||
                            document.body.innerHTML.includes('Cloudflare'),
                        storyLinks: document.querySelectorAll('a[href*="/story"]').length,
                        newsLinks: document.querySelectorAll('a[href*="/news"]').length,
                        allLinks: document.querySelectorAll('a').length,
                        bodyText: document.body.innerText.substring(0, 200)
                    };
                });

                console.log(`  ✓ Loaded in ${loadTime}ms`);
                console.log(`  ✓ Title: ${pageInfo.title}`);
                console.log(`  ✓ Final URL: ${pageInfo.url}`);
                console.log(`  ✓ Cloudflare detected: ${pageInfo.hasCloudflare ? '🚫 YES' : '✅ NO'}`);
                console.log(`  ✓ Story links: ${pageInfo.storyLinks}`);
                console.log(`  ✓ News links: ${pageInfo.newsLinks}`);
                console.log(`  ✓ Total links: ${pageInfo.allLinks}`);
                console.log(`  ✓ Body preview: ${pageInfo.bodyText.substring(0, 100)}...`);

                if (!pageInfo.hasCloudflare && (pageInfo.storyLinks > 0 || pageInfo.newsLinks > 0)) {
                    console.log(`\n  🎉 SUCCESS! Found ${pageInfo.storyLinks + pageInfo.newsLinks} article links`);

                    // Test pagination
                    console.log(`\n  Testing pagination...`);
                    const page2Url = `${baseUrl}?page=2`;
                    await page.goto(page2Url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const page2Info = await page.evaluate(() => ({
                        title: document.title,
                        storyLinks: document.querySelectorAll('a[href*="/story"]').length,
                        hasCloudflare: document.title.includes('Just a moment') || document.title.includes('Attention Required')
                    }));

                    console.log(`  Page 2 - Story links: ${page2Info.storyLinks}, Cloudflare: ${page2Info.hasCloudflare ? 'YES' : 'NO'}`);

                    await browser.close();

                    console.log(`\n✅ BdNews24 CAN be scraped with this configuration!`);
                    console.log(`   Recommendation: ${proxy ? `Use proxy: ${proxy}` : 'Use direct connection (no proxy)'}`);
                    return;
                }

                await browser.close();

            } catch (error) {
                console.log(`  ❌ Error: ${(error as Error).message}`);
                await browser.close();
            }
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('❌ All scenarios failed. BdNews24 appears to be heavily protected.');
    console.log('='.repeat(60));
}

testBdNews24Isolated();
