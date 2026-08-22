import { prisma } from '@/lib/db'
import { ScrapedArticle } from './scrapers/types'
import { analyzeWithAI, checkDuplicateWithAI, AIAnalysisResult } from './ai-analysis'
import { geocodeLocation } from './geocoding'
import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'
import axios from 'axios'

const AUDIT_LOG_PATH = path.join(process.cwd(), 'logs', 'audit_trail.csv')

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

    const asDate = new Date(text)
    if (!isNaN(asDate.getTime()) && text.includes('-')) {
        return asDate
    }

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
    if (cleanText.includes('দিন') || cleanText.includes('day')) {
        const match = cleanText.match(/(\d+)/)
        const days = match ? parseInt(match[1]) : 0
        return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }
    if (cleanText.includes('গতকাল') || cleanText.toLowerCase().includes('yesterday')) {
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
    if (cleanText.includes('আজ') || cleanText.toLowerCase().includes('today')) {
        return now
    }

    for (const [bnMonth, monthNum] of Object.entries(bnMonths)) {
        if (text.includes(bnMonth)) {
            const yearMatch = cleanText.match(/(\d{4})/)
            let year = yearMatch ? parseInt(yearMatch[1]) : now.getFullYear()
            const textWithoutYear = yearMatch ? cleanText.replace(yearMatch[0], '') : cleanText
            const dayMatch = textWithoutYear.match(/(\d{1,2})/)
            const day = dayMatch ? parseInt(dayMatch[1]) : 1
            return new Date(year, monthNum - 1, day, 12, 0, 0)
        }
    }

    return now
}

export async function fetchArticleBody(url: string): Promise<string> {
    try {
        const res = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        })
        const $ = cheerio.load(res.data)
        $('script, style, nav, footer, header, .advertisement, .ad-box').remove()
        const text = $('article p, .story-element p, .content-details p, .detail-content p, p')
            .map((_: number, el: any) => $(el).text().trim())
            .get()
            .join('\n')
        return text || ''
    } catch {
        return ''
    }
}

export async function processArticleMetadata(scraped: ScrapedArticle) {
    const publishedAt = parseDateFromText(scraped.time)
    return await prisma.rawNewsArticle.upsert({
        where: { url: scraped.url },
        update: {
            title: scraped.title,
            publishedAt,
            source: scraped.source || 'Unknown'
        },
        create: {
            url: scraped.url,
            title: scraped.title,
            content: scraped.content || '',
            publishedAt,
            source: scraped.source || 'Unknown',
            isProcessed: false
        }
    })
}

export async function processArticle(rawArticle: {
    id?: number
    url: string
    title: string
    content?: string
    publishedAt?: Date | string
    time?: string
    rawTime?: string
    source: string
}) {
    let bodyText = rawArticle.content || ''
    if (!bodyText || bodyText.length < 100) {
        bodyText = await fetchArticleBody(rawArticle.url)
        if (bodyText && rawArticle.id) {
            await prisma.rawNewsArticle.update({
                where: { id: rawArticle.id },
                data: { content: bodyText }
            }).catch(() => {})
        }
    }

    const fullText = `${rawArticle.title}\n\n${bodyText}`
    const pubDate = rawArticle.publishedAt
        ? (rawArticle.publishedAt instanceof Date ? rawArticle.publishedAt : new Date(rawArticle.publishedAt))
        : (rawArticle.time ? parseDateFromText(rawArticle.time) : (rawArticle.rawTime ? parseDateFromText(rawArticle.rawTime) : new Date()))

    const validPubDate = !isNaN(pubDate.getTime()) ? pubDate : new Date()
    const publishedStr = validPubDate.toISOString().split('T')[0]

    const aiResult = await analyzeWithAI(
        fullText,
        rawArticle.title,
        rawArticle.url,
        publishedStr,
        rawArticle.source
    )

    if (!aiResult) {
        console.warn(`[AI Skipped] Could not analyze article: ${rawArticle.url}`)
        return { success: false, reason: 'AI analysis failed/skipped' }
    }

    if (!aiResult.is_corruption) {
        try {
            await prisma.rawNewsArticle.update({
                where: rawArticle.id ? { id: rawArticle.id } : { url: rawArticle.url },
                data: { isProcessed: true }
            })
        } catch {}
        return { success: true, isCorruption: false }
    }

    // Geocoding
    const coords = geocodeLocation(aiResult.location.district || aiResult.location.spot || '')

    // Check duplicates against existing CorruptionEvents
    const recentEvents = await prisma.corruptionEvent.findMany({
        where: {
            isCorruption: true,
            district: coords?.district || aiResult.location.district
        },
        take: 10,
        orderBy: { publishedAt: 'desc' }
    })

    let matchedEventId: string | null = null
    for (const existing of recentEvents) {
        const isDupe = await checkDuplicateWithAI(
            aiResult.title,
            aiResult.summary,
            existing.title,
            existing.summary || ''
        )
        if (isDupe) {
            matchedEventId = existing.id
            break
        }
    }

    if (matchedEventId) {
        const existing = await prisma.corruptionEvent.findUnique({ where: { id: matchedEventId } })
        let sources: string[] = []
        try {
            sources = existing?.additionalSources ? JSON.parse(existing.additionalSources) : []
        } catch {}
        if (!sources.includes(rawArticle.url)) sources.push(rawArticle.url)

        await prisma.corruptionEvent.update({
            where: { id: matchedEventId },
            data: { additionalSources: JSON.stringify(sources) }
        })

        try {
            await prisma.rawNewsArticle.update({
                where: rawArticle.id ? { id: rawArticle.id } : { url: rawArticle.url },
                data: { isProcessed: true }
            })
        } catch {}

        return { success: true, merged: true, eventId: matchedEventId }
    }

    // Create New CorruptionEvent
    const newEvent = await prisma.corruptionEvent.create({
        data: {
            title: aiResult.title || rawArticle.title,
            url: rawArticle.url,
            source: rawArticle.source,
            publishedAt: validPubDate,
            dateOfIncident: aiResult.incident_date ? new Date(aiResult.incident_date) : validPubDate,
            locationText: aiResult.location.spot,
            district: coords?.district || aiResult.location.district,
            latitude: coords?.lat || null,
            longitude: coords?.lng || null,
            accusedEntities: JSON.stringify(aiResult.accused_entities || []),
            sectorOrMinistry: aiResult.sector_or_ministry,
            amountInvolved: aiResult.financial_impact.amount_bdt,
            amountFormatted: aiResult.financial_impact.amount_formatted,
            investigatingAgency: aiResult.investigating_agency,
            legalStatus: aiResult.legal_status || 'allegation',
            summary: aiResult.summary,
            severityScore: aiResult.severity_score || 5,
            confidence: aiResult.confidence,
            category: aiResult.category || 'Other',
            tags: JSON.stringify(aiResult.tags || []),
            rawText: bodyText.slice(0, 1500),
            isBangladesh: true,
            isCorruption: true
        }
    })

    try {
        await prisma.rawNewsArticle.update({
            where: rawArticle.id ? { id: rawArticle.id } : { url: rawArticle.url },
            data: { isProcessed: true }
        })
    } catch {}

    return { success: true, created: true, eventId: newEvent.id }
}
