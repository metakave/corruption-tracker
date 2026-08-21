import puppeteer from 'puppeteer';

async function debugNews24BD() {
    console.log('🔍 DEBUG: News24BD Selectors\n');

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0...');

        await page.goto('https://news24bd.tv/topic/todayall', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 3000));

        const debug = await page.evaluate(() => {
            // Try ALL possible selectors
            const selectors = {
                '.card': document.querySelectorAll('.card').length,
                'a.text-dark': document.querySelectorAll('a.text-dark').length,
                '.card-title': document.querySelectorAll('.card-title').length,
                'article': document.querySelectorAll('article').length,
                '.news-item': document.querySelectorAll('.news-item').length,
                'a[href*="/news/"]': document.querySelectorAll('a[href*="/news/"]').length,
                'a[href*="/details/"]': document.querySelectorAll('a[href*="/details/"]').length,
                'a': document.querySelectorAll('a').length,
            };

            // Get all links
            const allLinks = Array.from(document.querySelectorAll('a'));
            const newsLinks = allLinks.filter(a => {
                const href = a.getAttribute('href');
                return href && (href.includes('/news') || href.includes('/details') || href.includes('/article'));
            });

            return {
                selectors,
                totalLinks: allLinks.length,
                newsLinksCount: newsLinks.length,
                sampleNewsLinks: newsLinks.slice(0, 10).map(a => ({
                    href: a.getAttribute('href'),
                    text: a.innerText.trim().substring(0, 60),
                    classes: a.className
                })),
                bodyClasses: document.body.className,
                containerHTML: document.querySelector('main, .container, #root')?.outerHTML.substring(0, 3000)
            };
        });

        console.log('SELECTOR RESULTS:');
        console.log('='.repeat(60));
        Object.entries(debug.selectors).forEach(([sel, count]) => {
            console.log(`${sel.padEnd(25)} : ${count}`);
        });

        console.log(`\n${'='.repeat(60)}`);
        console.log(`Total links: ${debug.totalLinks}`);
        console.log(`News-related links: ${debug.newsLinksCount}`);

        console.log(`\n${'='.repeat(60)}`);
        console.log('SAMPLE NEWS LINKS:');
        console.log('='.repeat(60));
        debug.sampleNewsLinks.forEach(link => {
            console.log(`- ${link.href}`);
            console.log(`  "${link.text}"`);
            console.log(`  Classes: ${link.classes || '(none)'}\n`);
        });

        console.log('='.repeat(60));
        console.log('CONTAINER HTML (first 2000 chars):');
        console.log('='.repeat(60));
        console.log(debug.containerHTML?.substring(0, 2000));

        await browser.close();

    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        await browser.close();
    }
}

debugNews24BD();
