
import puppeteer from 'puppeteer';
import { getRandomProxy } from '../lib/scrapers/proxies';

const URL = 'https://www.ittefaq.com.bd/latest-news';

async function inspectIttefaqPagination() {
    console.log(`🔍 Inspecting Ittefaq Pagination: ${URL}`);

    const MAX_ATTEMPTS = 10;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const proxy = getRandomProxy();
        console.log(`\nAttempt ${i + 1}/${MAX_ATTEMPTS} using proxy: ${proxy}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', `--proxy-server=${proxy}`]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

            const data = await page.evaluate(() => {
                // Check for Load More button
                const buttons = Array.from(document.querySelectorAll('button, a.btn, .load-more, .read-more'));
                const loadMoreCandidates = buttons.filter(b =>
                    b.innerText.toLowerCase().includes('more') ||
                    b.innerText.toLowerCase().includes('আরো') ||
                    b.className.includes('load')
                ).map(b => ({
                    text: b.innerText,
                    className: b.className,
                    tagName: b.tagName
                }));

                // Check for Pagination links
                const pagination = document.querySelectorAll('.pagination a, .nav-links a');
                const pageLinks = Array.from(pagination).map(a => a.href);

                return {
                    title: document.title,
                    articleCount: document.querySelectorAll('.tag_title_holder').length,
                    loadMoreButtons: loadMoreCandidates,
                    paginationLinks: pageLinks.slice(0, 5)
                };
            });

            console.log('--- PAGINATION DATA ---');
            console.log(JSON.stringify(data, null, 2));

            await browser.close();
            return;

        } catch (e) {
            console.log(`Failed: ${e.message}`);
            await browser.close();
        }
    }
}

inspectIttefaqPagination();
