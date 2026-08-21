import puppeteer from 'puppeteer';

async function inspectNews24BD() {
    console.log('🔍 Inspecting News24BD (news24bd.tv) for pagination/scaling\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://news24bd.tv/topic/todayall';
        console.log(`Loading: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const pageInfo = await page.evaluate(() => {
            // Check for articles
            const articles = document.querySelectorAll('.title a, article a, .post a, .item a');

            // Check for Load More buttons
            const loadMoreButtons = Array.from(document.querySelectorAll('button, a.btn, .load-more')).filter(el => {
                const text = (el as HTMLElement).innerText?.toLowerCase() || '';
                return text.includes('load') || text.includes('more') || text.includes('আরও');
            });

            // Check for pagination
            const pagination = document.querySelectorAll('.pagination a, .page-numbers a, nav a');

            return {
                title: document.title,
                articleCount: articles.length,
                sampleArticles: Array.from(articles).slice(0, 5).map(a => ({
                    text: (a as HTMLElement).innerText.trim().substring(0, 50),
                    href: (a as HTMLAnchorElement).href
                })),
                loadMoreButtons: loadMoreButtons.map(btn => ({
                    tag: btn.tagName,
                    text: (btn as HTMLElement).innerText.trim(),
                    classes: btn.className
                })),
                paginationLinks: Array.from(pagination).slice(0, 5).map(a => ({
                    text: (a as HTMLElement).innerText.trim(),
                    href: (a as HTMLAnchorElement).href
                })),
                bodyHTML: document.body.innerHTML.substring(0, 2000)
            };
        });

        console.log('='.repeat(60));
        console.log('PAGE INFO:');
        console.log('='.repeat(60));
        console.log(`Title: ${pageInfo.title}`);
        console.log(`Articles found: ${pageInfo.articleCount}`);

        console.log(`\nSample articles:`);
        pageInfo.sampleArticles.forEach((a, i) => {
            console.log(`${i + 1}. ${a.text}`);
            console.log(`   ${a.href}`);
        });

        console.log(`\n${'='.repeat(60)}`);
        console.log('LOAD MORE BUTTONS:');
        console.log('='.repeat(60));
        if (pageInfo.loadMoreButtons.length > 0) {
            pageInfo.loadMoreButtons.forEach(btn => {
                console.log(`- ${btn.tag}: "${btn.text}" (class: ${btn.classes})`);
            });
        } else {
            console.log('⚠️  No Load More buttons found');
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('PAGINATION:');
        console.log('='.repeat(60));
        if (pageInfo.paginationLinks.length > 0) {
            pageInfo.paginationLinks.forEach(link => {
                console.log(`- "${link.text}" → ${link.href}`);
            });
        } else {
            console.log('⚠️  No pagination links found');
        }

        console.log('\n' + '='.repeat(60));
        console.log('HTML SAMPLE (first 1000 chars):');
        console.log('='.repeat(60));
        console.log(pageInfo.bodyHTML.substring(0, 1000));

        await browser.close();

    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        await browser.close();
    }
}

inspectNews24BD();
