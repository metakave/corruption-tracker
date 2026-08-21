import puppeteer, { ElementHandle } from 'puppeteer';
import { NewsSourceScraper, ScrapedArticle } from './types';

export class DhakaPostScraper implements NewsSourceScraper {
  name = 'Dhaka Post';
  source = 'Dhaka Post';
  baseUrl = 'https://www.dhakapost.com';
  listUrl = 'https://www.dhakapost.com/latest-news';

  async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
    console.log(`[Dhaka Post] Starting scrape...`);
    if (dateLimit) {
      console.log(`[Dhaka Post] Deep Recovery Mode: Fetching until ${dateLimit.toISOString()}`);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const articles: ScrapedArticle[] = [];

    try {
      await page.goto(this.listUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Pagination Loop
      let hasMore = true;
      let clickCount = 0;
      const MAX_CLICKS = dateLimit ? 200 : 50; // More clicks for deep recovery
      const TWENTY_FOUR_HOURS_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Bengali Maps
      const bnToEnDigits = (str: string) => str.replace(/[০-৯]/g, (d) => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);
      const monthMap: { [key: string]: string } = {
        'জানুয়ারি': 'January', 'জানুয়ারি': 'January',
        'ফেব্রুয়ারি': 'February', 'ফেব্রুয়ারি': 'February',
        'মার্চ': 'March', 'এপ্রিল': 'April',
        'মে': 'May', 'জুন': 'June', 'জুলাই': 'July', 'আগস্ট': 'August',
        'সেপ্টেম্বর': 'September', 'অক্টোবর': 'October', 'নভেম্বর': 'November', 'ডিসেম্বর': 'December'
      };

      while (hasMore && clickCount < MAX_CLICKS) {
        // Parse visible articles
        const newArticles = await page.evaluate((baseUrl) => {
          const items = Array.from(document.querySelectorAll('a.group'));
          return items.map((item) => {
            const linkElement = item as HTMLAnchorElement;
            const titleElement = item.querySelector('h2');

            // Time is typically in the second <p> tag or the first if only one exists
            const pTags = item.querySelectorAll('p');
            const timeElement = pTags.length > 1 ? pTags[1] : pTags[0];

            if (!linkElement || !titleElement) return null;

            const timeText = timeElement ? (timeElement as HTMLElement).innerText : '';
            const url = linkElement.href.startsWith('http') ? linkElement.href : baseUrl + linkElement.getAttribute('href');

            return {
              url,
              title: titleElement.innerText.trim(),
              source: 'Dhaka Post',
              publishedAt: '',
              rawTime: timeText
            };
          }).filter((a) => a !== null) as any[];
        }, this.baseUrl);

        let foundOldArticle = false;
        let addedCount = 0;

        for (const article of newArticles) {
          if (!articles.find(a => a.url === article.url)) {

            // PARSE DATE: "৩১ ডিসেম্বর ২০২৫, ১৩:৪১"
            let dateObj: Date | undefined;
            try {
              let cleanTime = article.rawTime.trim();
              if (cleanTime) {
                // 1. Convert Digits
                cleanTime = bnToEnDigits(cleanTime);
                // 2. Month Names
                for (const [bn, en] of Object.entries(monthMap)) {
                  cleanTime = cleanTime.replace(bn, en);
                }
                // 3. Remove commas
                cleanTime = cleanTime.replace(/,/g, '');
                // Result: "31 December 2025 13:41" (Parseable by Date)

                const parsed = new Date(cleanTime);
                if (!isNaN(parsed.getTime())) {
                  dateObj = parsed;
                }
              }
            } catch (e) {
              console.error(`[Dhaka Post] Date parse error for '${article.rawTime}':`, e);
            }

            if (!dateObj) {
              // If parsing failed, Log and Skip (or handle downstream)
              // For now, let's skip adding it if we can't date it?
              // Or set it to empty string and let crawler handle it.
              // Better to skip here or return empty.
              console.warn(`[Dhaka Post] Could not parse date: '${article.rawTime}'. Skipping.`);
              continue;
            }

            article.publishedAt = dateObj.toISOString();

            // Logic Switch: 24h OR DateLimit
            let isOld = false;

            if (dateLimit) {
              // Strict check: Is article older than limit?
              isOld = dateObj < dateLimit;
              if (isOld) {
                console.log(`[Dhaka Post] Article (${dateObj.toISOString()}) is older than limit (${dateLimit.toISOString()}).`);
              }
            } else {
              // Default 24h check
              isOld = dateObj < TWENTY_FOUR_HOURS_AGO;
            }

            if (isOld) {
              foundOldArticle = true;
              // Strict cut-off: don't add matching "old" articles
            } else {
              articles.push(article);
              addedCount++;
            }
          }
        }

        console.log(`[Dhaka Post] Parsed ${newArticles.length} items. Added ${addedCount} new. Total: ${articles.length}`);

        if (foundOldArticle) {
          console.log('[Dhaka Post] Found article exceeding age limit. Stopping.');
          hasMore = false;
          break;
        }

        // --- SUBAGENT PROVEN CLICK LOGIC ---
        // 1. Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 1000));

        // 2. Sophisticated Find & Click
        const clicked = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('button, a, div, span'));
          // Find element with exact text 'আরও দেখুন' that is visible
          const target = elements.find(el => el.textContent?.trim() === 'আরও দেখুন' && (el as HTMLElement).offsetParent !== null);

          if (target) {
            // Try to find a button inside or the div itself, or closest button
            const clickable = target.closest('button') || target.querySelector('button') || target;
            (clickable as HTMLElement).click();
            return true;
          }
          return false;
        });

        if (clicked) {
          // Wait longer for network/DOM update
          await new Promise(r => setTimeout(r, 4000));
          clickCount++;
          console.log(`[Dhaka Post] Clicked load more (${clickCount}).`);
        } else {
          console.log('[Dhaka Post] Load more button not found.');
          hasMore = false;
        }
      }

    } catch (error) {
      console.error('[Dhaka Post] Scrape error:', error);
    } finally {
      await browser.close();
    }

    console.log(`[Dhaka Post] Found ${articles.length} articles.`);
    return articles;
  }
}
