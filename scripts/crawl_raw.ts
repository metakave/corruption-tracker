
import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const BASE_URL = 'https://www.prothomalo.com/collection/latest'

async function startRawCrawl() {
    console.log("🚀 Starting Raw Data Crawler...")

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()

    try {
        console.log(`Navigating to ${BASE_URL}...`)
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 })

        // Auto-load more content
        let attempt = 0
        const MAX_ATTEMPTS = 50 // Crawl deep to get 200-300 articles

        // Store all unique URLs encountered
        const allArticles = new Map<string, string>() // URL -> Title

        while (attempt < MAX_ATTEMPTS) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

            // Extract links from current view
            const currentLinks = await page.evaluate(() => {
                const feedItems = Array.from(document.querySelectorAll('.story-element-view-news-element .headline-title a, .card-with-image-zoom a, a.card-link_card-link__2-622'))
                // Fallback
                const links = feedItems.length ? feedItems : Array.from(document.querySelectorAll('a[href^="/bangladesh/"]'))

                return links.map(el => ({
                    url: (el as HTMLAnchorElement).href,
                    title: (el as HTMLElement).innerText,
                }))
            })

            // Add to collection
            currentLinks.forEach(item => {
                if (item.url && item.title) {
                    allArticles.set(item.url, item.title)
                }
            })

            process.stdout.write(`\r[${attempt + 1}/${MAX_ATTEMPTS}] Loaded. Total Unique: ${allArticles.size}. Loading more...`)

            try {
                const buttonClicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('span, div, button'))
                    const loadMore = buttons.find(el => el.textContent?.trim() === 'আরও')
                    if (loadMore) {
                        (loadMore as HTMLElement).click()
                        return true
                    }
                    return false
                })

                if (buttonClicked) {
                    await new Promise(r => setTimeout(r, 3000))
                } else {
                    // Try waiting a bit more or scrolling up/down
                }

            } catch (e) {
                // Ignore click errors
            }
            attempt++
        }
        console.log("\nFinished loading content.")

        const uniqueArticles = Array.from(allArticles.entries()).map(([url, title]) => ({ url, title }))

        console.log(`📊 Found ${uniqueArticles.length} unique articles. Processing...`)

        let successCount = 0
        let skipCount = 0

        for (const article of uniqueArticles) {
            // Check if exists in DB
            const existing = await prisma.rawNewsArticle.findUnique({
                where: { url: article.url }
            })

            if (existing) {
                process.stdout.write('.')
                skipCount++
                continue
            }

            // Visit article to get content
            const articlePage = await browser.newPage()
            try {
                await articlePage.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 30000 })

                // Extract Content (Strict Only Body)
                const data = await articlePage.evaluate(() => {
                    // Remove clutter
                    const clutterSelectors = ['.related-stories', '.advertisement', '.sidebar', '.print-only', '.comments-section']
                    clutterSelectors.forEach((sel) => document.querySelectorAll(sel).forEach((el) => el.remove()))

                    const contentSelectors = ['div[itemprop="articleBody"]', '.story-content', 'article']
                    let contentEl = null
                    for (const sel of contentSelectors) {
                        contentEl = document.querySelector(sel)
                        if (contentEl) break
                    }

                    const timeEl = document.querySelector('time')
                    const timeText = timeEl ? timeEl.innerText : ''

                    return {
                        content: (contentEl as HTMLElement)?.innerText || document.body.innerText,
                        timeText
                    }
                })

                if (data.content.length < 100) {
                    // Too short, skip
                    await articlePage.close()
                    continue
                }

                await prisma.rawNewsArticle.create({
                    data: {
                        url: article.url,
                        title: article.title,
                        content: data.content,
                        publishedAt: new Date(), // We could parse data.timeText if needed, but 'now' is fine for crawl time
                        isProcessed: false
                    }
                })

                process.stdout.write('S') // Saved
                successCount++

            } catch (err) {
                process.stdout.write('E') // Error
            } finally {
                await articlePage.close()
            }
        }

        console.log(`\n\n✅ Crawl Complete!`)
        console.log(`   Saved: ${successCount}`)
        console.log(`   Skipped: ${skipCount}`)

    } catch (error) {
        console.error('Fatal Error:', error)
    } finally {
        await browser.close()
        await prisma.$disconnect()
    }
}

startRawCrawl()
