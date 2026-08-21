import puppeteer from 'puppeteer';

async function deepInspect() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Set explicit Desktop User Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://www.jugantor.com/national/1047413';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const result = await page.evaluate(() => {
        const candidates = [];
        const allDivs = document.querySelectorAll('div');

        for (const div of allDivs) {
            // calculated text length (excluding script/style)
            const text = (div as HTMLElement).innerText;
            if (text.length > 200 && text.length < 5000) { // arbitrary sanity limits
                // Filter out obviously bad ones (sidebar) IF they have explicit class
                // But let's keep it broad for now
                candidates.push({
                    tagName: div.tagName,
                    id: div.id,
                    className: div.className,
                    textSnippet: text.substring(0, 100).replace(/\n/g, ' '),
                    textLength: text.length
                });
            }
        }
        return candidates;
    });

    console.log(JSON.stringify(result, null, 2));
    await browser.close();
}

deepInspect();
