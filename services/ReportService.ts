
import { prisma } from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as cheerio from 'cheerio'
import axios from 'axios'

export interface ReportEvent {
    id: string
    date: string
    title: string
    url: string
    summary: string
    district: string
    killed: number
    injured: number
    severity: number
    category: 'Political' | 'Gender' | 'Communal' | 'Other' | 'Review'
    verified: boolean
}

export class ReportService {
    private genAI: GoogleGenerativeAI

    constructor() {
        // Use a rotational key strategy or the best available key
        const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY || ''
        if (!apiKey) throw new Error("API Key missing")
        this.genAI = new GoogleGenerativeAI(apiKey)
    }

    /**
     * Fetch raw data for the reporting period
     */
    async fetchEvents(startDate: Date, endDate: Date): Promise<any[]> {
        console.log(`Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`)

        return await prisma.politicalEvent.findMany({
            where: {
                isPoliticalViolence: true, // Base filter
                OR: [
                    {
                        dateOfIncident: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    {
                        dateOfIncident: null,
                        publishedAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                ]
            },
            orderBy: {
                dateOfIncident: 'asc'
            }
        })
    }

    /**
     * Filter out generic summary reports (like MSF, ASK reports)
     * to avoid double counting statistics.
     */
    isSummaryReport(title: string, summary: string): boolean {
        const summaryKeywords = [
            'প্রতিবেদন প্রকাশ',
            'মানবাধিকার লঙ্ঘন',
            'মাসিক প্রতিবেদন',
            'তথ্য বিবরণী',
            'MSF', 'ASK', 'Odhibikar',
            'নিহত হয়েছে বলে জানিয়েছে',
            'report says',
            'according to report'
        ]

        const combined = (title + " " + summary).toLowerCase()
        return summaryKeywords.some(k => combined.includes(k.toLowerCase()))
    }

    /**
     * AI Categorization using Gemini
     */
    async categorizeEvent(event: any): Promise<RequestType['category']> {
        // Fast path for obvious ones using tags/parties if available
        // But for high-quality report, let's use AI lightly.

        const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        const prompt = `
        Analyze this violence incident and categorize it into ONE of these categories:
        1. Political (Party clashes, election violence, power struggles)
        2. Gender (Rape, domestic violence, harassment, dowry)
        3. Communal (Religious attacks, temple vandalism)
        4. Other (Mob justice, unknown motive, general crime)

        Input:
        Title: ${event.title}
        Summary: ${event.summary}
        Parties: ${event.politicalParties}

        Output only the Category Name.
        `

        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text().trim().toLowerCase()

            if (text.includes('political')) return 'Political'
            if (text.includes('gender')) return 'Gender'
            if (text.includes('communal')) return 'Communal'
            return 'Other'
        } catch (e) {
            return 'Other'
        }
    }

    /**
     * Verify Link Status (Basic Connect Check)
     */
    async verifyLink(url: string): Promise<boolean> {
        try {
            const controller = new AbortController()
            const id = setTimeout(() => controller.abort(), 2000) // 2s timeout

            const res = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReportBot/1.0)' }
            })
            clearTimeout(id)
            return res.status >= 200 && res.status < 400
        } catch (e) {
            return false
        }
    }

    /**
     * Fetch full article text using Cheerio
     */
    async fetchArticleText(url: string): Promise<string | null> {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
                timeout: 5000
            })
            const $ = cheerio.load(data)

            // Remove scripts, styles, and ads
            $('script, style, iframe, nav, footer, header, .advertisement, .related-posts').remove()

            // Extract text from common content containers
            // This is a heuristic list for generic news sites
            let text = $('article').text() || $('.content').text() || $('.post-body').text() || $('main').text() || $('body').text()

            return text.replace(/\s+/g, ' ').trim().substring(0, 10000) // Limit to 10k chars
        } catch (e) {
            console.log(`Failed to fetch content for ${url}: ${e}`)
            return null
        }
    }

    /**
     * Deep Verification with AI
     */
    async verifyContentWithAI(event: any, articleText: string): Promise<{ isAccurate: boolean, discrepancy: string }> {
        if (!articleText) return { isAccurate: false, discrepancy: "Could not fetch article text" }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        const prompt = `
        Compare the DATABASE RECORD vs the ACTUAL ARTICLE TEXT.
        
        DATABASE RECORD:
        - Title: ${event.title}
        - Summary: ${event.summary}
        - District: ${event.district}
        - Killed: ${event.killed}
        - Injured: ${event.injured}

        ACTUAL ARTICLE TEXT:
        """
        ${articleText.substring(0, 5000)}
        """

        TASK:
        Verify if the Database Record accurately reflects the Article Text.
        Focus on:
        1. Casualty Count (Killed/Injured mismatch?)
        2. Location (Wrong district?)
        3. Event Type (Is it actually political violence?)

        OUTPUT JSON ONLY:
        {
            "isAccurate": boolean,
            "discrepancy": "Brief explanation of mismatch if any, or 'None'"
        }
        `

        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            return JSON.parse(text)
        } catch (e) {
            return { isAccurate: true, discrepancy: "AI Verification Failed" } // Default to "True" to avoid false alarms on API error
        }
    }

    /**
     * Generate CSV content
     */
    toCSV(events: ReportEvent[]): string {
        const header = ['ID', 'Date', 'Category', 'District', 'Title', 'Killed', 'Injured', 'Severity', 'URL', 'Verified']
        const rows = events.map(e => [
            e.id,
            e.date,
            e.category,
            e.district,
            `"${e.title.replace(/"/g, '""')}"`, // Escape quotes
            e.killed,
            e.injured,
            e.severity,
            e.url,
            e.verified ? 'Yes' : 'No'
        ])

        return [header.join(','), ...rows.map(r => r.join(','))].join('\n')
    }
}

type RequestType = {
    category: 'Political' | 'Gender' | 'Communal' | 'Other' | 'Review'
}
