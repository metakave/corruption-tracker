import puppeteer from 'puppeteer'
import { NewsSourceScraper, ScrapedArticle } from './types'

export class ProthomAloScraper implements NewsSourceScraper {
    name = 'Prothom Alo'
    baseUrl = 'https://www.prothomalo.com/collection/latest'

    async scrape(dateLimit?: Date): Promise<ScrapedArticle[]> {
        console.log(`🚀 Starting ${this.name} Scraper... Limit: ${dateLimit ? dateLimit.toISOString() : '24h'}`)
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()
        await page.setViewport({ width: 1280, height: 800 })

        try {
            await page.goto(this.baseUrl, { waitUntil: 'networkidle0', timeout: 60000 })

            console.log("Initial content loaded, starting pagination...\n")

            // Load more articles until 24+ hours
            let attempt = 0
            const MAX_ATTEMPTS = dateLimit ? 300 : 30; // Increased for deep recovery

            // Helper to parse date for Prothom Alo specifically
            const parseDateFromText = (text: string): Date => {
                const now = new Date()
                if (!text || text === 'N/A') return now
                const bnToEn: { [key: string]: string } = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' }
                const cleanText = text.replace(/[০-৯]/g, (d) => bnToEn[d])

                if (cleanText.includes('মিনিট') || cleanText.includes('সেকেন্ড')) {
                    const match = cleanText.match(/(\d+)/)
                    const mins = match ? parseInt(match[1]) : 0
                    return new Date(now.getTime() - mins * 60 * 1000)
                }
                if (cleanText.includes('ঘণ্টা')) {
                    const match = cleanText.match(/(\d+)/)
                    const hours = match ? parseInt(match[1]) : 0
                    return new Date(now.getTime() - hours * 60 * 60 * 1000)
                }
                if (cleanText.includes('দিন')) {
                    const match = cleanText.match(/(\d+)/)
                    const days = match ? parseInt(match[1]) : 0
                    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
                }
                // If it's a full date (e.g. 30 Dec 2025), we'd need more logic, 
                // but currently Prothom Alo mostly shows relative time for recent list. 
                // For deep history, if it changes to date, we might need a parser update. 
                // Assuming it keeps "x days ago" style or similar.
                return now
            }

            while (attempt < MAX_ATTEMPTS) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
                await new Promise(r => setTimeout(r, 1500))

                const statsBefore = await page.evaluate(() => {
                    const articles = document.querySelectorAll('h3.headline-title')
                    const times = Array.from(document.querySelectorAll('time.published-at, time.published-time'))
                    const oldestTimeStr = times.length > 0 ? times[times.length - 1]?.textContent?.trim() || 'N/A' : 'N/A'
                    return { count: articles.length, oldest: oldestTimeStr }
                })

                const clicked = await page.evaluate(() => {
                    const button = document.querySelector('.load-more-content')
                    if (button) {
                        (button as HTMLElement).click()
                        return true
                    }
                    return false
                })

                if (!clicked) {
                    console.log("❌ No 'আরও' button - end of content\n")
                    break
                }

                attempt++
                console.log(`[${attempt}] Clicked 'আরও', waiting...`)
                await new Promise(r => setTimeout(r, 4000))

                const statsAfter = await page.evaluate(() => {
                    const articles = document.querySelectorAll('h3.headline-title')
                    const times = Array.from(document.querySelectorAll('time.published-at, time.published-time'))
                    const oldestTimeStr = times.length > 0 ? times[times.length - 1]?.textContent?.trim() || 'N/A' : 'N/A'
                    return { count: articles.length, oldest: oldestTimeStr }
                })

                const newArticles = statsAfter.count - statsBefore.count
                console.log(`   📊 Articles: ${statsBefore.count} → ${statsAfter.count} (+${newArticles})`)
                console.log(`   🕐 Oldest: ${statsAfter.oldest}`)

                const oldestDate = parseDateFromText(statsAfter.oldest)

                if (dateLimit) {
                    if (oldestDate < dateLimit) {
                        console.log(`   ✅ Reached date limit (${dateLimit.toISOString()}) - STOPPING\n`)
                        break
                    }
                } else {
                    const oldestHours = (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60)
                    if (oldestHours >= 24) {
                        console.log(`   ✅ Reached ${oldestHours.toFixed(1)} hours - STOPPING\n`)
                        break
                    }
                }
            }

            const articles = await page.evaluate(() => {
                const items: any[] = []
                document.querySelectorAll('h3.headline-title').forEach((h3) => {
                    const a = h3.querySelector('a')
                    let timeEl: Element | null = null
                    const parentCard = h3.closest('.story-card, .wide-story-card, .story-element, article')
                    if (parentCard) {
                        timeEl = parentCard.querySelector('time, .published-at, .published-time, .time, span[class*="time"]')
                    }
                    if (!timeEl && h3.parentElement) {
                        timeEl = h3.parentElement.querySelector('time, .published-at, .published-time')
                    }
                    const timeText = timeEl?.textContent?.trim() || timeEl?.getAttribute('datetime') || 'N/A'
                    if (a && a.href) {
                        items.push({
                            url: (a as HTMLAnchorElement).href,
                            title: a.textContent?.trim(),
                            time: timeText,
                            source: 'Prothom Alo'
                        })
                    }
                })
                return items
            })

            console.log(`Found ${articles.length} articles from ${this.name}`)

            return articles.map((a: any) => ({
                ...a,
                rawTime: a.time,
                publishedAt: parseDateFromText(a.time).toISOString()
            }))

        } catch (error) {
            console.error(`Error scraping ${this.name}:`, error)
            return []
        } finally {
            await browser.close()
        }
    }
}
