import { News24BDScraper } from '../lib/scrapers/news24bd';
import { IttefaqScraper } from '../lib/scrapers/ittefaq';
import { JugantorScraper } from '../lib/scrapers/jugantor';

async function finalTest() {
    console.log('🔬 FINAL COMPREHENSIVE TEST\n');
    console.log('='.repeat(70));

    const scrapers = [
        { name: 'News24BD', scraper: new News24BDScraper(), target: 100 },
        { name: 'Ittefaq', scraper: new IttefaqScraper(), target: 100 },
        { name: 'Jugantor', scraper: new JugantorScraper(), target: 100 }
    ];

    const results: any[] = [];

    for (const { name, scraper, target } of scrapers) {
        console.log(`\n📊 Testing ${name}...`);
        console.log('-'.repeat(70));

        const start = Date.now();
        const articles = await scraper.scrape();
        const duration = ((Date.now() - start) / 1000).toFixed(1);

        const status = articles.length >= target ? '✅' : '❌';

        results.push({
            name,
            count: articles.length,
            target,
            duration,
            status,
            sample: articles.slice(0, 2).map(a => a.title)
        });

        console.log(`${status} ${name}: ${articles.length} articles (target: ${target}+) in ${duration}s`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL RESULTS SUMMARY');
    console.log('='.repeat(70));

    results.forEach(r => {
        console.log(`\n${r.status} ${r.name}:`);
        console.log(`   Articles: ${r.count}/${r.target}+ (${r.duration}s)`);
        if (r.sample.length > 0) {
            console.log(`   Sample: "${r.sample[0].substring(0, 50)}..."`);
        }
    });

    const allPassed = results.every(r => r.count >= r.target);

    console.log('\n' + '='.repeat(70));
    if (allPassed) {
        console.log('✅ ALL TESTS PASSED - READY FOR DEPLOYMENT');
    } else {
        console.log('❌ SOME TESTS FAILED - NEEDS FIXES');
    }
    console.log('='.repeat(70));
}

finalTest();
