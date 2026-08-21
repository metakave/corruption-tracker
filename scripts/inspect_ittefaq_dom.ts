import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to Ittefaq...');
    await page.goto('https://www.ittefaq.com.bd/latest-news', { waitUntil: 'networkidle2' });

    console.log('Extracting Pagination/Button Info...');

    const info = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText,
            class: b.className,
            id: b.id
        }));

        const links = Array.from(document.querySelectorAll('a')).filter(a => {
            const t = a.innerText?.toLowerCase() || '';
            const h = a.href || '';
            // Check for pagination keywords
            return t.includes('next') || t.includes('load') || t.includes('more') ||
                t.includes('পরবর্তী') || t.includes('আরও') ||
                a.className.includes('page') || a.parentElement?.className.includes('pagination');
        }).map(a => ({
            text: a.innerText,
            href: a.href,
            class: a.className,
            rel: a.getAttribute('rel')
        }));

        // Check standard classes
        const paginationHTML = document.querySelector('.pagination')?.outerHTML || 'No .pagination found';
        const loadMoreHTML = document.querySelector('.load-more')?.outerHTML ||
            document.querySelector('#load-more')?.outerHTML || 'No .load-more found';

        return { buttons, links, paginationHTML, loadMoreHTML };
    });

    console.log('--- BUTTONS ---');
    console.log(info.buttons.filter(b => b.text.length > 0)); // Filter empty

    console.log('\n--- POTENTIAL PAGINATION LINKS ---');
    console.log(info.links);

    console.log('\n--- HTML SNIPPETS ---');
    console.log('Pagination:', info.paginationHTML);
    console.log('Load More:', info.loadMoreHTML);

    await browser.close();
})();
