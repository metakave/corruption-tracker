import puppeteer from 'puppeteer';

async function inspectCategoryPage() {
    console.log('🔬 Inspecting BdNews24 Category Page: /samagrabangladesh\n');

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0...');

        await page.goto('https://bangla.bdnews24.com/samagrabangladesh', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const data = await page.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a'));
            const linksByPattern = new Map();

            allLinks.forEach(a => {
                const href = a.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    const path = href.split('?')[0];
                    const parts = path.split('/');
                    if (parts.length > 3) {
                        const pattern = parts.slice(0, -1).join('/');
                        if (!linksByPattern.has(pattern)) {
                            linksByPattern.set(pattern, []);
                        }
                        linksByPattern.get(pattern).push({
                            href: href,
                            text: a.innerText.trim().substring(0, 60)
                        });
                    }
                }
            });

            return {
                title: document.title,
                patterns: Array.from(linksByPattern.entries())
                    .map(([pattern, links]) => ({
                        pattern,
                        count: links.length,
                        examples: links.slice(0, 3)
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 15)
            };
        });

        console.log(`Title: ${data.title}\n`);
        console.log('TOP LINK PATTERNS:\n' + '='.repeat(60));
        data.patterns.forEach((p, i) => {
            console.log(`\n${i + 1}. Pattern: ${p.pattern}`);
            console.log(`   Count: ${p.count}`);
            console.log(`   Examples:`);
            p.examples.forEach(ex => {
                console.log(`   - ${ex.href}`);
                console.log(`     "${ex.text}"`);
            });
        });

        await browser.close();

    } catch (error) {
        console.log(`Error: ${(error as Error).message}`);
        await browser.close();
    }
}

inspectCategoryPage();
