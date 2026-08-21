import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

async function testIttefaqPagination() {
    console.log('🔍 Testing Ittefaq Pagination URLs\n');

    const urlsToTest = [
        'https://www.ittefaq.com.bd/latest-news',
        'https://www.ittefaq.com.bd/latest-news/page/2',
        'https://www.ittefaq.com.bd/latest-news/page/3',
    ];

    for (let attempt = 0; attempt < 5; attempt++) {
        const proxy = getRandomProxy();
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Attempt ${attempt + 1} with proxy: ${proxy}`);
        console.log('='.repeat(60));

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            for (const url of urlsToTest) {
                try {
                    console.log(`\nTesting: ${url}`);
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const pageInfo = await page.evaluate(() => {
                        const articles = document.querySelectorAll('.tag_title_holder');
                        return {
                            title: document.title,
                            articleCount: articles.length,
                            has404: document.title.includes('404') || document.title.includes('Not Found'),
                            hasCloudflare: document.title.includes('Just a moment'),
                            firstArticles: Array.from(articles).slice(0, 3).map(el => {
                                const link = el.querySelector('a.link_overlay');
                                const titleEl = el.querySelector('h2.title');
                                return {
                                    title: titleEl ? titleEl.textContent.trim().substring(0, 50) : '',
                                    url: link ? link.getAttribute('href') : ''
                                };
                            })
                        };
                    });

                    console.log(`  ✓ Title: ${pageInfo.title}`);
                    console.log(`  ✓ Articles found: ${pageInfo.articleCount}`);
                    console.log(`  ✓ 404 Error: ${pageInfo.has404 ? '🚫 YES' : '✅ NO'}`);
                    console.log(`  ✓ Cloudflare: ${pageInfo.hasCloudflare ? '🚫 YES' : '✅ NO'}`);

                    if (pageInfo.articleCount > 0) {
                        console.log(`  ✓ Sample articles:`);
                        pageInfo.firstArticles.forEach((a, i) => {
                            console.log(`    ${i + 1}. ${a.title}`);
                        });
                    }

                    if (pageInfo.articleCount >= 10 && !pageInfo.has404 && !pageInfo.hasCloudflare) {
                        console.log(`\n  🎉 SUCCESS! URL works with ${pageInfo.articleCount} articles`);
                    }

                } catch (e) {
                    console.log(`  ❌ Error: ${(e as Error).message}`);
                }

                await new Promise(r => setTimeout(r, 1000));
            }

            await browser.close();

            console.log(`\n✅ Test completed successfully with proxy ${proxy}`);
            return;

        } catch (e) {
            console.log(`Proxy ${proxy} failed: ${(e as Error).message}`);
            await browser.close();
        }
    }

    console.log('\n❌ All proxy attempts failed');
}

testIttefaqPagination();
