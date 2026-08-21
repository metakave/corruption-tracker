import puppeteer from 'puppeteer';

async function inspectIttefaq() {
    console.log('🕵️ ITTEFAQ INSPECTION STARTED\n');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Capture XHR/Fetch requests
    const apiRequests: any[] = [];
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['xhr', 'fetch'].includes(req.resourceType())) {
            // Log essential details immediately to stdout
            const url = req.url();
            if (url.includes('ittefaq.com.bd') || !url.includes('google')) { // Filter noise
                console.log(`[REQ] ${req.method()} ${url}`);
                if (req.method() === 'POST' && req.postData()) {
                    console.log(`      Payload: ${req.postData()}`);
                }
            }
        }
        req.continue();
    });

    try {
        console.log('Navigating...');
        await page.goto('https://www.ittefaq.com.bd/latest-news', { waitUntil: 'networkidle2', timeout: 30000 });

        // Find and click load more
        const btn = await page.$('.ajax_load_btn');
        if (btn) {
            console.log('Found button, clicking...');
            await btn.click();
            await new Promise(r => setTimeout(r, 5000));
        } else {
            console.log('Button not found');
        }

    } catch (e) {
        console.log('Error:', e);
    } finally {
        await browser.close();
    }
}

inspectIttefaq();
