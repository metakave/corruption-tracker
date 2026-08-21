import puppeteer from 'puppeteer';

async function inspect() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const url = 'https://www.jugantor.com/national/1047413';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const content = await page.evaluate(() => {
        const headline = document.querySelector('h1.desktopDetailHeadline');
        if (!headline) return 'No H1 found';

        let current = headline.parentElement;
        // Go up 3 levels to find a common wrapper
        for (let i = 0; i < 3; i++) {
            if (current && current.parentElement) {
                current = current.parentElement;
            }
        }

        if (!current) return 'No upper wrapper found';

        // Now search downwards from this common wrapper for large text blocks
        // We look for any div that has substantial text length
        const candidateDivs = Array.from(current.querySelectorAll('div'));
        const textHeavyDivs = candidateDivs.filter(d => {
            // Heuristic: Has > 300 chars, isn't a script/style, and isn't the sidebar
            return d.innerText.length > 300 &&
                !d.classList.contains('sidebar') &&
                !d.classList.contains('related-stories') &&
                !d.querySelector('h1.desktopDetailHeadline'); // Don't pick the header itself
        }).map(d => ({
            className: d.className,
            id: d.id,
            textLength: d.innerText.length,
            sample: d.innerText.substring(0, 100),
            htmlSample: d.innerHTML.substring(0, 200)
        }));

        return JSON.stringify({
            wrapperClass: current.className,
            candidates: textHeavyDivs
        }, null, 2);
    });

    console.log(content);
    await browser.close();
}

inspect();
