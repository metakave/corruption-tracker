
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

async function main() {
    console.log("🔍 STARTING AJKER PATRIKA DEBUG")
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080']
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1080 })

    try {
        console.log("Navigating...")
        await page.goto('https://www.ajkerpatrika.com/latest-news', { waitUntil: 'domcontentloaded', timeout: 60000 })

        const title = await page.title()
        console.log(`📄 Page Title: ${title}`)

        // Wait a bit
        await new Promise(r => setTimeout(r, 5000));

        // Dump buttons
        const debugInfo = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
                tag: 'button',
                text: b.textContent?.trim(),
                visible: (b as HTMLElement).offsetParent !== null,
                classes: b.className
            }));

            const spans = Array.from(document.querySelectorAll('span')).filter(s => s.textContent?.includes('আরও')).map(s => ({
                tag: 'span',
                text: s.textContent?.trim(),
                visible: (s as HTMLElement).offsetParent !== null,
                classes: s.className
            }));

            const divs = Array.from(document.querySelectorAll('div')).filter(s => s.textContent?.includes('আরও')).map(s => ({
                tag: 'div',
                text: s.textContent?.trim(), // might be too long
                classes: s.className
            })).slice(0, 5); // limit output

            return { buttons, spans, divs };
        });

        console.log("--- BUTTONS FOUND ---")
        debugInfo.buttons.forEach(b => console.log(JSON.stringify(b)));
        console.log("--- SPANS WITH 'আরও' ---")
        debugInfo.spans.forEach(s => console.log(JSON.stringify(s)));

    } catch (e) {
        console.error("❌ ERROR:", e)
    } finally {
        await browser.close()
    }
}

main()
