import puppeteer from 'puppeteer';

async function verifyUI() {
    console.log('🖥️ CHECKING LIVE UI ROBUSTNESS...\n');
    const url = 'http://46.224.92.166:3000';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // 1. Check Title
        const title = await page.title();
        console.log(`✅ Title: ${title}`);

        // 2. Check for Critical Elements
        const checks = [
            { name: 'Navbar', selector: 'nav' },
            { name: 'Stats Cards', selector: '.grid.grid-cols-2' }, // Usually where stats are
            { name: 'Feed/Table', selector: 'table, .feed-item' },
            { name: 'Footer', selector: 'footer' }
        ];

        for (const check of checks) {
            const el = await page.$(check.selector);
            if (el) console.log(`✅ ${check.name} found`);
            else console.log(`❌ ${check.name} NOT FOUND`);
        }

        // 3. Take Screenshot
        await page.screenshot({ path: 'live_ui_check.png' });
        console.log('📸 Screenshot saved to live_ui_check.png');

    } catch (e) {
        console.log('❌ UI Check Failed:', e);
    } finally {
        await browser.close();
    }
}

verifyUI();
