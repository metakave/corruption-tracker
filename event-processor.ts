import { PrismaClient } from '@prisma/client'
import { ScrapedArticle } from './scrapers/types'
import { analyzeWithAI, checkDuplicateWithAI } from './ai-analysis'
import { geocodeLocation } from './geocoding'
import { getRandomProxy } from './scrapers/proxies'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()
const AUDIT_LOG_PATH = path.join(process.cwd(), 'logs', 'audit_trail.csv')

// Bengali string helpers
const bnToEn: { [key: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

const bnMonths: { [key: string]: number } = {
    'জানুয়ারি': 1, 'ফেব্রুয়ারি': 2, 'মার্চ': 3, 'এপ্রিল': 4,
    'মে': 5, 'জুন': 6, 'জুলাই': 7, 'আগস্ট': 8,
    'সেপ্টেম্বর': 9, 'অক্টোবর': 10, 'নভেম্বর': 11, 'ডিসেম্বর': 12
}

export function parseDateFromText(text: string): Date {
    const now = new Date()
    if (!text || text === 'N/A') return now

    // Check if it's already a valid ISO string or standard date
    const asDate = new Date(text)
    if (!isNaN(asDate.getTime()) && text.includes('-')) {
        return asDate
    }

    const cleanText = text.replace(/[০-৯]/g, (d) => bnToEn[d])

    // Relative times
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
    if (cleanText.includes('দিন') || cleanText.includes('day')) {
        const match = cleanText.match(/(\d+)/)
        const days = match ? parseInt(match[1]) : 0
        return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }

    // Explicit Relative Days
    if (cleanText.includes('গতকাল') || cleanText.toLowerCase().includes('yesterday')) {
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
    if (cleanText.includes('আজ') || cleanText.toLowerCase().includes('today')) {
        return now
    }

    // Absolute dates
    for (const [bnMonth, monthNum] of Object.entries(bnMonths)) {
        if (text.includes(bnMonth)) {
            // Extract Year first
            const yearMatch = cleanText.match(/(\d{4})/)
            let year = yearMatch ? parseInt(yearMatch[1]) : null

            // Remove year from text to avoid conflicting with day match
            const textWithoutYear = yearMatch ? cleanText.replace(yearMatch[0], '') : cleanText

            // Extract Day (look for 1-2 digits in the remaining text)
            const dayMatch = textWithoutYear.match(/(\d{1,2})/)
            const day = dayMatch ? parseInt(dayMatch[1]) : 1

            // Try to extract time (HH:mm)
            const timeMatch = cleanText.match(/(\d{1,2}):(\d{2})/)
            let hour = 12
            let min = 0

            if (timeMatch) {
                hour = parseInt(timeMatch[1])
                min = parseInt(timeMatch[2])

                // Handle PM/AM logic for Jugantor style
                if (cleanText.includes('পিএম') && hour < 12) {
                    hour += 12
                } else if (cleanText.includes('এএম') && hour === 12) {
                    hour = 0
                }
            }

            // Fallback logic for year
            if (!year) {
                // If no year found, default to current year.
                // BUT, if the resulting date is in the future, it's likely from last year.
                year = now.getFullYear()
                const putativeDate = new Date(year, monthNum - 1, day, hour, min, 0)

                // If date is more than 2 days in the future, assume last year
                if (putativeDate.getTime() > now.getTime() + (2 * 24 * 60 * 60 * 1000)) {
                    year -= 1
                }
            }

            return new Date(year, monthNum - 1, day, hour, min, 0)
        }
    }
    return now
}

// String Similarity (Levenshtein)
function getSimilarity(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) { track[0][i] = i; }
    for (let j = 0; j <= str2.length; j += 1) { track[j][0] = j; }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator,
            );
        }
    }
    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
}

// Helper: Token-based Jaccard Similarity (Word Overlap)
function getWordOverlap(str1: string, str2: string): number {
    const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    if (set1.size === 0 || set2.size === 0) return 0;
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

// Ensure log directory exists
if (!fs.existsSync(path.dirname(AUDIT_LOG_PATH))) {
    fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true })
}
if (!fs.existsSync(AUDIT_LOG_PATH)) {
    fs.writeFileSync(AUDIT_LOG_PATH, 'Timestamp,Title,URL,Decision,Reason,Severity\n')
}

// Helper to save metadata immediately
export async function processArticleMetadata(article: ScrapedArticle) {
    const bnToEn: { [key: string]: string } = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    }
    const bnMonths: { [key: string]: number } = {
        'জানুয়ারি': 1, 'ফেব্রুয়ারি': 2, 'মার্চ': 3, 'এপ্রিল': 4,
        'মে': 5, 'জুন': 6, 'জুলাই': 7, 'আগস্ট': 8,
        'সেপ্টেম্বর': 9, 'অক্টোবর': 10, 'নভেম্বর': 11, 'ডিসেম্বর': 12
    }

    function parseTime(text: string): Date {
        const now = new Date()
        if (!text || text === 'N/A') return now
        const cleanText = text.replace(/[০-৯]/g, (d) => bnToEn[d])
        // Basic parsing or fallback to now (full parsing is in shared logic but this is quick)
        return now;
    }

    // Use the shared parser or a simplified version since we just want to dump data
    // Actually, we can assume the one in event-processor is robust, but we can't easily import "parseDateFromText" if it's not exported. 
    // Let's just use new Date() for now or specific parsing if 'rawTime' is absolute. 
    // Ideally we export `parseDateFromText` from event-processor.

    await prisma.rawNewsArticle.upsert({
        where: { url: article.url },
        update: {
            title: article.title,
            source: article.source,
            // We might not have content yet
        },
        create: {
            url: article.url,
            title: article.title,
            content: "", // Content fetched later
            publishedAt: new Date(), // Placeholder until processed
            source: article.source,
            scrapedAt: new Date()
        }
    })
}



export async function processArticle(article: ScrapedArticle, forceUpdate: boolean = false) {
    console.log(`\n🔍 Processing: ${article.title.substring(0, 50)}...`)

    // Pre-filter
    if (
        article.url.includes('/world/') ||
        article.url.includes('/international/') ||
        article.url.includes('/stories/') ||
        article.url.includes('/onnoalo/') ||
        article.url.includes('/fiction/') ||
        article.url.includes('/literature/')
    ) {
        console.log(`   ⏭️  Non-news/Fiction content, skipping`)
        return false
    }

    // Check exact URL match first
    const existingEventByUrl = await prisma.politicalEvent.findUnique({ where: { url: article.url } })

    if (existingEventByUrl && !forceUpdate) {
        console.log(`   ⏭️  Already in database (Exact URL), skipping`)
        return false
    }

    if (existingEventByUrl && forceUpdate) {
        console.log(`   🔄 Event exists, forcing UPDATE with new AI Title...`)
    }

    // Fetch full content
    let fullContent = article.content || ''
    let images: string[] = article.images || []

    // If content is already provided (e.g. from News24BD scraper), skip fetching
    if (fullContent) {
        console.log(`   ✅ Using pre-fetched content (${fullContent.length} chars)`)
    } else {
        // Launch browser for full content (with retries)
        let retryCount = 0;
        const MAX_RETRIES = 20;

        while (retryCount < MAX_RETRIES) {
            retryCount++;
            const proxy = getRandomProxy();
            const args = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080'
            ];
            if (proxy) args.push(`--proxy-server=${proxy}`);

            let browser;
            try {
                browser = await puppeteer.launch({
                    headless: true,
                    args: args
                });
                const page = await browser.newPage();
                if (proxy) console.log(`   🌐 Using Proxy (Attempt ${retryCount}): ${proxy}`);

                // Set User Agent
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

                await page.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Handle Quantcast Consent (Ajker Patrika)
                try {
                    const consentBtn = await page.$('#qc-cmp2-ui button[mode="primary"], button.css-47sehv');
                    if (consentBtn) {
                        console.log(`   🍪 Handling Consent Popup...`);
                        await consentBtn.click();
                        await new Promise(r => setTimeout(r, 2000));
                    }
                } catch (e) { /* Ignore */ }

                const data = await page.evaluate(() => {
                    const clutterSelectors = [
                        '.related-stories', '.advertisement', '.sidebar', '.latest-news', '.most-read', 'footer', 'header',
                        '.more-news', '#MoreNews', '.tab-content', '.editor-picked', '.alert', '.cookie-banner',
                        // Jugantor specific clutter
                        '.relatedNewsWidgetDesktop1', '.popularNewsWidgetDesktop', '.categoryNewsWidgetDesktop1', '.marginB20',
                        // News24BD specific clutter (wildcards for CSS modules)
                        'div[class*="details_moreNewsDetails"]', 'div[class*="details_catName"]', 'div[class*="details_author"]'
                    ];
                    clutterSelectors.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));

                    const contentEl = document.querySelector('div[class*="details_articleArea"] article') || // News24BD
                        document.querySelector('.desktopDetailBody') || // Jugantor
                        document.querySelector('div[itemprop="articleBody"]') ||
                        document.querySelector('article') || // Generic
                        document.querySelector('.story-content') ||
                        document.querySelector('.content-details') || // Prothom Alo
                        document.querySelector('.description') || // Samakal
                        document.querySelector('.story-details') || // Ajker Patrika (Primary)
                        document.querySelector('.block-full_richtext') || // Ajker Patrika (Fallback)
                        document.querySelector('#content-details') ||
                        document.body;

                    const text = (contentEl as HTMLElement).innerText;
                    const imgs = Array.from(document.querySelectorAll('main img')).map(img => (img as HTMLImageElement).src);
                    return { text, imgs };
                });

                fullContent = data.text.replace(/\s+/g, ' ').trim();
                images = data.imgs.filter(src => src && !src.includes('logo'));

                await browser.close();
                break; // Success, exit loop

            } catch (e) {
                console.error(`   ❌ Failed to fetch content (Attempt ${retryCount}): ${e instanceof Error ? e.message : String(e)}`);
                if (browser) await browser.close();
                if (retryCount === MAX_RETRIES) {
                    console.log(`   ⏭️  Skipping article after ${MAX_RETRIES} failed attempts.`);
                    return false;
                }
            }
        } // End While Loop
    }

    if (fullContent.length < 50) { // Lowered threshold slightly
        console.log(`   ⏭️  Content too short (<50 chars)`)
        return false
    }

    // SAVE RAW DATA (Before AI Filtering)
    try {
        await prisma.rawNewsArticle.upsert({
            where: { url: article.url },
            update: {
                title: article.title,
                content: fullContent,
                publishedAt: parseDateFromText(article.rawTime),
                source: article.source,
                scrapedAt: new Date()
            },
            create: {
                url: article.url,
                title: article.title,
                content: fullContent,
                publishedAt: parseDateFromText(article.rawTime),
                source: article.source,
                scrapedAt: new Date()
            }
        })
        // console.log(`   💾 Saved raw article to DB.`);
    } catch (e) {
        console.error(`   ⚠️ Failed to save raw article: ${e}`);
    }

    // AI Analysis
    const parsedDate = parseDateFromText(article.time)
    // FIX: Pass standardized ISO Date string to prevent "undefined reading split" and Invalid Date errors in AI logic
    const refDateForAI = parsedDate ? parsedDate.toISOString() : new Date().toISOString()
    const analysis = await analyzeWithAI(fullContent, article.title, article.url, refDateForAI, article.source)

    // Audit Log
    const decision = (analysis && analysis.is_political_violence) ? 'VIOLENCE' : 'SKIPPED'
    const trace = analysis?.decision_trace
        ? `L:${analysis.decision_trace.location_valid} R:${analysis.decision_trace.recency_valid} V:${analysis.decision_trace.violence_type_valid} BD:${analysis.decision_trace.is_in_bangladesh} EX:${analysis.decision_trace.reason_for_exclusion || 'None'}`
        : 'Analysis Failed'
    fs.appendFileSync(AUDIT_LOG_PATH, `"${new Date().toISOString()}","${article.title.replace(/"/g, '""')}","${article.url}","${decision}","${trace}","${analysis?.severity_score || 0}"\n`)

    // ALWAYS MARK AS PROCESSED (regardless of verdict)
    try {
        await prisma.rawNewsArticle.update({
            where: { url: article.url },
            data: { isProcessed: true }
        })
    } catch (e) {
        // Ignore update errors (e.g. if record missing)
    }

    if (!analysis || !analysis.is_political_violence) {
        console.log(`   ⚪ Not violence.`)
        return false
    }

    console.log(`   🔴 VIOLENCE DETECTED (${analysis.severity_score}/10)`)

    // DUPLICATE CHECK & MERGING
    // parsedDate is already defined above

    // 3. District-Level Geocoding (Force centroid)
    const geoData = analysis.location.district ? geocodeLocation(analysis.location.district) : null
    const district = geoData?.district || analysis.location.district

    // Priority: Always use district level coordinates from the map (Centroids)
    const lat = geoData?.lat || 23.8103
    const lng = geoData?.lng || 90.4125

    if (district) {
        const eventDate = analysis.incident_date ? new Date(analysis.incident_date) : (parsedDate || new Date())
        const threeDaysAgo = new Date(eventDate)
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        const threeDaysFuture = new Date(eventDate)
        threeDaysFuture.setDate(threeDaysFuture.getDate() + 3)

        // 2. Follow-up News Merging (Keywords like Arrest, Case, Remand)
        const followUpKeywords = ["গ্রেপ্তার", "গ্রেফতার", "মামলা", "রিমান্ড", "আটক", "হাজত", "কারাগার", "আদালত"];
        const isFollowUp = followUpKeywords.some(k => article.title.includes(k) || (analysis.summary && analysis.summary.includes(k)));

        // Hybrid Search: Recency + Text Search
        const extractKeywords = (text: string) => text.split(/\s+/).filter(w => w.length > 4 && !['Bangladesh', 'Dhaka'].includes(w)).slice(0, 3)
        const titleKeywords = extractKeywords(article.title)

        const recentEvents = await prisma.politicalEvent.findMany({
            where: {
                district: district,
                OR: [
                    {
                        // 1. Strict Recency (7 days)
                        dateOfIncident: {
                            gte: isFollowUp ? new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000) : threeDaysAgo,
                            lte: threeDaysFuture
                        }
                    },
                    {
                        // 2. Text Search (Any Time) - Catch long-tail followups
                        OR: titleKeywords.map(k => ({
                            title: { contains: k, mode: 'insensitive' }
                        }))
                    }
                ]
            },
            take: 10, // Limit candidates
            orderBy: { dateOfIncident: 'desc' }
        })

        // RAG-Lite: Ask AI if any of these are duplicates
        let aiMatchId: string | null = null
        try {
            const candidates = recentEvents.map(e => ({
                id: e.id,
                title: e.title,
                summary: e.summary || '',
                date: e.dateOfIncident || e.publishedAt,
                district: e.district || ''
            }))

            console.log(`   🔎 Sending ${candidates.length} candidates to AI...`)
            candidates.forEach(c => console.log(`      - [${c.id}] ${c.date.toISOString().split('T')[0]} : ${c.title}`))

            aiMatchId = await checkDuplicateWithAI({
                title: analysis.title || article.title,
                summary: analysis.summary,
                date: analysis.incident_date || parsedDate.toISOString(),
                source: article.source
            }, candidates)

            if (aiMatchId) {
                console.log(`   🤖 AI identified duplicate event ID: ${aiMatchId}`)
            }
        } catch (e) {
            console.error(`   ⚠️ AI Dedup Error: ${e}`)
        }

        for (const event of recentEvents) {
            const titleSim = getSimilarity(article.title, event.title)
            const spotSim = getSimilarity(analysis.location.spot || '', event.locationText || '')

            // Check Summary Similarity (if available)
            let summarySim = 0
            if (analysis.summary && event.summary) {
                summarySim = getWordOverlap(analysis.summary, event.summary)
            }

            // Check for Actor/Party Overlap
            let partyOverlap = 0
            try {
                const newParties = (analysis.parties_involved || []).map(p => p.toLowerCase())
                const existingParties = event.politicalParties ?
                    JSON.parse(event.politicalParties).map((p: string) => p.toLowerCase()) : []

                if (newParties.length > 0 && existingParties.length > 0) {
                    const commonParties = newParties.filter(p => existingParties.includes(p))
                    partyOverlap = commonParties.length / Math.max(newParties.length, existingParties.length)
                }
            } catch (e) { /* Ignore */ }

            const isSameSource = article.source === event.source
            const isSameDay = Math.abs(eventDate.getTime() - (event.dateOfIncident?.getTime() || eventDate.getTime())) < 24 * 60 * 60 * 1000

            const shouldMerge =
                (aiMatchId === event.id) || // AI Match overrides everything
                (titleSim > 0.45) || // Increased from 0.35
                (isFollowUp && (titleSim > 0.25 || isSameDay)) ||
                summarySim > 0.45 ||
                // STRICTER SPOT MATCH: Must satisfy ALL: High Similarity + Same Type + Same Day + NOT Generic Spot
                (spotSim > 0.8 &&
                    event.tags?.includes(analysis.incident_type) &&
                    isSameDay &&
                    !['dhaka', 'bangladesh', 'chittagong', 'unknown', 'capital'].includes(analysis.location.spot.toLowerCase())) ||
                (isSameSource && isSameDay && partyOverlap > 0.3) ||
                (partyOverlap > 0.5 && isSameDay);

            if (shouldMerge) {
                console.log(`   🔄 MERGING ${isFollowUp ? 'FOLLOW-UP' : 'DUPLICATE'} with existing event: "${event.title.substring(0, 40)}..."`)
                console.log(`      Metrics: TitleSim: ${titleSim.toFixed(2)}, SummarySim: ${summarySim.toFixed(2)}, PartyOverlap: ${partyOverlap.toFixed(2)}, SameSource: ${isSameSource}`)

                const currentSources = event.additionalSources ? JSON.parse(event.additionalSources) : []
                if (article.url === event.url || article.source === event.source) {
                    console.log(`   ⏭️ Source outlet "${article.source}" already exists as primary, skipping additionalSources entry`)
                    return true
                }

                const exists = currentSources.find((s: any) => s.url === article.url || s.source === article.source);
                if (!exists) {
                    currentSources.push({ url: article.url, source: article.source, title: article.title })
                    await prisma.politicalEvent.update({
                        where: { id: event.id },
                        data: { additionalSources: JSON.stringify(currentSources) }
                    })
                    console.log(`   ✅ Merged source successfully.`)
                } else {
                    console.log(`   ⚠️ Source already merged.`)
                }
                return true
            }
        }
    }

    // 4. AI Confidence Score Cap (Implemented in analyzer, but safeguard here too)
    let finalConfidence = Math.min(analysis.confidence || 0.50, 0.99)
    console.log(`   📊 Using Industrial Intelligence confidence: ${finalConfidence.toFixed(2)} (Capped at 0.99)`)

    // UPSERT or CREATE based on forceUpdate
    if (existingEventByUrl && forceUpdate) {
        await prisma.politicalEvent.update({
            where: { id: existingEventByUrl.id },
            data: {
                title: (analysis.title && analysis.title.length > 5) ? analysis.title : article.title,
                summary: analysis.summary,
                // 1. Prioritize Incident Date
                dateOfIncident: analysis.incident_date ? new Date(analysis.incident_date) : parsedDate,
                severityScore: analysis.severity_score || 1,
                confidence: finalConfidence,
                tags: JSON.stringify([analysis.incident_type]),
                politicalParties: JSON.stringify(analysis.parties_involved || []),
                injured: analysis.casualties?.injured || 0,
                killed: analysis.casualties?.killed || 0,
                // 3. Force District Coordinates
                district: district || existingEventByUrl.district,
                locationText: analysis.location.spot || existingEventByUrl.locationText,
                isPoliticalViolence: true,
                updatedAt: new Date()
            }
        })
        console.log(`   ✅ UPDATED existing event with new AI analysis.`)
        return true
    }

    // CREATE NEW EVENT
    await prisma.politicalEvent.create({
        data: {
            title: (analysis.title && analysis.title.length > 5) ? analysis.title : article.title,
            url: article.url,
            source: article.source,
            publishedAt: parsedDate,
            // 1. Prioritize Incident Date
            dateOfIncident: analysis.incident_date ? new Date(analysis.incident_date) : parsedDate,
            locationText: analysis.location.spot,
            district: district,
            // 3. Force District Coordinates
            latitude: lat,
            longitude: lng,
            politicalParties: JSON.stringify(analysis.parties_involved || []),
            injured: analysis.casualties?.injured || 0,
            killed: analysis.casualties?.killed || 0,
            summary: analysis.summary,
            severityScore: analysis.severity_score || 1,
            confidence: finalConfidence,
            tags: JSON.stringify([
                analysis.incident_type,
                (analysis.incident_date && new Date(analysis.incident_date).getTime() < parsedDate.getTime() - (2 * 24 * 60 * 60 * 1000)) ? 'Backdated' : null
            ].filter(Boolean)),
            images: JSON.stringify(images),
            rawText: fullContent.slice(0, 1000),
            isBangladesh: true,
            isPoliticalViolence: true
        }
    })

    console.log(`   ✅ Created new event.`)
    return true
}
