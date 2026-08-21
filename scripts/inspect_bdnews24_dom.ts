import puppeteer from 'puppeteer';

async function inspectBdNews24DOM() {
    console.log('🔬 Inspecting BdNews24 Archive DOM Structure\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        console.log('Loading https://bangla.bdnews24.com/archive...');
        await page.goto('https://bangla.bdnews24.com/archive', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Take screenshot for reference
        await page.screenshot({ path: '/tmp/bdnews24_archive.png', fullPage: true });
        console.log('✓ Screenshot saved to /tmp/bdnews24_archive.png\n');

        const domAnalysis = await page.evaluate(() => {
            // Find all unique link patterns
            const linkPatterns = new Map();
            document.querySelectorAll('a').forEach(a => {
                const href = a.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    const pattern = href.split('/').slice(0, 4).join('/');
                    const current = linkPatterns.get(pattern) || { count: 0, examples: [] };
                    current.count++;
                    if (current.examples.length < 3) {
                        current.examples.push({
                            href,
                            text: a.innerText.trim().substring(0, 50)
                        });
                    }
                    linkPatterns.set(pattern, current);
                }
            });

            // Find article containers
            const containerClasses = new Set();
            document.querySelectorAll('article, [class*="article"], [class*="story"], [class*="item"], [class*="card"]').forEach(el => {
                if (el.className) containerClasses.add(el.className);
            });

            return {
                title: document.title,
                linkPatterns: Array.from(linkPatterns.entries())
                    .map(([pattern, data]) => ({ pattern, ...data }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10),
                containerClasses: Array.from(containerClasses).slice(0, 20),
                totalLinks: document.querySelectorAll('a').length,
                bodyHTML: document.body.innerHTML.substring(0, 5000)
            };
        });

        console.log('='.repeat(60));
        console.log('TOP 10 LINK PATTERNS:');
        console.log('='.repeat(60));
        domAnalysis.linkPatterns.forEach((p, i) => {
            console.log(`\n${i + 1}. Pattern: ${p.pattern}`);
            console.log(`  Count: ${p.count}`);
            console.log(`  Examples:`);
            p.examples.forEach(ex => {
                console.log(`    - ${ex.href}`);
                console.log(`      "${ex.text}"`);
            });
        });

        console.log(`\n${'='.repeat(60)}`);
        console.log('CONTAINER CLASSES:');
        console.log('='.repeat(60));
        console.log(domAnalysis.containerClasses.join('\n'));

        console.log(`\n${'='.repeat(60)}`);
        console.log('HTML SAMPLE:');
        console.log('='.repeat(60));
        console.log(domAnalysis.bodyHTML.substring(0, 1000));

        await browser.close();

    } catch (error) {
        console.log(`❌ Error: ${(error as Error).message}`);
        await browser.close();
    }
}

inspectBdNews24DOM();
