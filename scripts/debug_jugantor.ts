import puppeteer from 'puppeteer'

const URL = 'https://www.jugantor.com/tp-news/1048007'

async function inspectJugantor() {
    console.log(`🔍 Inspecting Jugantor URL: ${URL}\n`)

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    })
    const page = await browser.newPage()

    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    try {
        await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 })

        // Check for content selectors
        const selectors = [
            '.desktopDetailBody',
            '#myText',
            '.news-element-text',
            'article',
            'div[itemprop="articleBody"]'
        ]

        console.log('--- Selector Check ---')
        for (const sel of selectors) {
            const exists = await page.$(sel) // .$(sel) returns ElementHandle or null
            const content = exists ? await page.$eval(sel, el => (el as HTMLElement).innerText.substring(0, 100)) : 'N/A'
            console.log(`[${exists ? '✅' : '❌'}] ${sel}: ${content}...`)
        }

        // Extract full content similar to production logic
        const data = await page.evaluate(() => {
            const clutterSelectors = [
                '.relatedNewsWidgetDesktop1', '.popularNewsWidgetDesktop', '.categoryNewsWidgetDesktop1', '.marginB20',
                '.related-stories', '.advertisement', '.sidebar'
            ]
            clutterSelectors.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()))

            const contentEl = document.querySelector('.desktopDetailBody') ||
                document.querySelector('#myText') ||
                document.querySelector('article')

            return {
                title: document.title,
                text: (contentEl as HTMLElement)?.innerText || 'No Content Found',
                html: (contentEl as HTMLElement)?.innerHTML?.substring(0, 200) || ''
            }
        })

        console.log('\n--- Extraction Result ---')
        console.log(`Title: ${data.title}`)
        console.log(`Content Length: ${data.text.length}`)
        console.log(`Content Preview: ${data.text.substring(0, 300)}...`)

    } catch (e) {
        console.error(`❌ Error: ${e}`)
    } finally {
        await browser.close()
    }
}

inspectJugantor()
