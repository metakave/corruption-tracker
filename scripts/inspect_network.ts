import puppeteer from 'puppeteer';

async function inspectNetwork() {
    console.log('🕵️ NETWORK INSPECTION STARTED\n');

    const targets = [
        {
            name: 'Jugantor',
            url: 'https://www.jugantor.com/latest',
            action: async (page: any) => {
                const btn = await page.$('.clickLoadMore');
                if (btn) {
                    console.log('[Jugantor] Clicking Load More...');
                    await btn.click();
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    console.log('[Jugantor] Load More button not found');
                }
            }
        },
        {
            name: 'Ittefaq',
            url: 'https://www.ittefaq.com.bd/latest-news',
            action: async (page: any) => {
                const btn = await page.$('.ajax_load_btn');
                if (btn) {
                    console.log('[Ittefaq] Clicking Load More...');
                    await btn.click();
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    console.log('[Ittefaq] Load More button not found');
                }
            }
        },
        {
            name: 'News24BD',
            url: 'https://news24bd.tv/topic/todayall',
            action: async (page: any) => {
                console.log('[News24BD] Scrolling to bottom...');
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    ];

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    for (const target of targets) {
        console.log(`\n--- Inspecting ${target.name} ---`);
        const page = await browser.newPage();

        // Capture XHR/Fetch requests
        const apiRequests: any[] = [];
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['xhr', 'fetch'].includes(req.resourceType())) {
                apiRequests.push({
                    url: req.url(),
                    method: req.method(),
                    postData: req.postData()
                });
            }
            req.continue();
        });

        page.on('response', async (res) => {
            const req = res.request();
            if (['xhr', 'fetch'].includes(req.resourceType())) {
                try {
                    const contentType = res.headers()['content-type'] || '';
                    if (contentType.includes('json') || contentType.includes('html')) {
                        // Check if it corresponds to one of our captured requests
                        const matchingReq = apiRequests.find(r => r.url === req.url());
                        if (matchingReq) {
                            // Log it (abbreviated)
                            console.log(`[API?] ${req.method()} ${req.url()}`);
                            if (matchingReq.postData) console.log(`       Data: ${matchingReq.postData}`);
                        }
                    }
                } catch (e) { }
            }
        });

        try {
            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 30000 });
            console.log(`[${target.name}] Page Loaded.`);

            // Clear initial requests
            apiRequests.length = 0;
            console.log(`[${target.name}] Triggering action to find pagination API...`);

            await target.action(page);

            // Wait a bit
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            console.log(`[${target.name}] Error:`, e);
        } finally {
            await page.close();
        }
    }

    await browser.close();
}

inspectNetwork();
