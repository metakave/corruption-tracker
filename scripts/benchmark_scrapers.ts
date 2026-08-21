
import { AjkerPatrikaScraper } from '../lib/scrapers/ajkerpatrika';
import { BdNews24Scraper } from '../lib/scrapers/bdnews24';
import { DhakaPostScraper } from '../lib/scrapers/dhakapost';
import { IttefaqScraper } from '../lib/scrapers/ittefaq';
import { JamunaScraper } from '../lib/scrapers/jamuna';
import { JugantorScraper } from '../lib/scrapers/jugantor';
import { News24BDScraper } from '../lib/scrapers/news24bd';
import { ProthomAloScraper } from '../lib/scrapers/prothomalo';
import { SamakalScraper } from '../lib/scrapers/samakal';
import { ScrapedArticle } from '../lib/scrapers/types';

async function benchmark() {
    console.log('🏁 Starting Comprehensive 9-Source Benchmark...');

    const scrapers = [
        new AjkerPatrikaScraper(),
        new BdNews24Scraper(),
        new DhakaPostScraper(),
        new IttefaqScraper(),
        new JamunaScraper(),
        new JugantorScraper(),
        new News24BDScraper(),
        new ProthomAloScraper(),
        new SamakalScraper()
    ];

    const results: any[] = [];

    // Run sequentially to avoid crushing CPU/Network and getting distorted stats
    for (const scraper of scrapers) {
        console.log(`\n⏳ Benchmarking ${scraper.name}...`);
        const start = Date.now();
        let articles: ScrapedArticle[] = [];
        let error = null;

        try {
            // Run scraper
            // For Jamuna/others that take a dateLimit, passing undefined usually means 24h or default
            articles = await scraper.scrape();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
            console.error(`❌ ${scraper.name} Failed:`, error);
        }

        const end = Date.now();
        const durationSec = (end - start) / 1000;

        // Quality Checks
        const validDates = articles.filter(a => a.publishedAt && !isNaN(new Date(a.publishedAt).getTime())).length;
        const distinctTimes = new Set(articles.map(a => a.time || a.rawTime || 'N/A')).size;

        results.push({
            name: scraper.name,
            count: articles.length,
            duration: durationSec.toFixed(2) + 's',
            speed: (articles.length / (durationSec || 1) * 60).toFixed(0) + ' articles/min',
            validDates: `${validDates}/${articles.length}`,
            timeVariety: distinctTimes, // Low variety = suspect (e.g. all "Today")
            status: error ? 'FAILED' : 'OK',
            error: error
        });

        console.log(`✅ ${scraper.name}: ${articles.length} articles in ${durationSec.toFixed(1)}s`);
    }

    console.table(results);

    // Suggestion Logic
    console.log('\n🧠 Analysis & Recommendations:');
    const sorted = [...results].sort((a, b) => b.count - a.count);
    sorted.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} (${r.count} arts, ${r.speed}) - Status: ${r.status}`);
    });
}

benchmark();
