import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DISTRICTS_BN_MAP, PARTY_CATEGORIES } from '@/lib/constants'
import { toBDDateStart, toBDDateEnd } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // Filters
        const search = searchParams.get('search')
        const district = searchParams.get('district')
        const minSeverity = searchParams.get('minSeverity')
        const maxSeverity = searchParams.get('maxSeverity')
        const type = searchParams.get('type')
        const source = searchParams.get('source')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Pagination
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        // Build Where Clause
        const andConditions: any[] = []

        if (search) {
            const cleanSearch = search.trim()

            // 1. Keyword Expansion Logic
            // Check if the search term matches any known party keyword (case-insensitive)
            let expandedKeywords: string[] = [cleanSearch]

            // Find if search term matches any category's keywords
            for (const category of PARTY_CATEGORIES) {
                const match = category.keywords.some(k => k.toLowerCase() === cleanSearch.toLowerCase())
                if (match) {
                    // If matched, search for ALL keywords in that category
                    expandedKeywords = [...category.keywords]
                    break
                }
            }

            // 2. Build OR Conditions for ALL expanded keywords
            const searchConditions: any[] = []
            expandedKeywords.forEach(keyword => {
                searchConditions.push({ title: { contains: keyword } })
                searchConditions.push({ summary: { contains: keyword } })
                searchConditions.push({ politicalParties: { contains: keyword } })
                searchConditions.push({ tags: { contains: keyword } })
                searchConditions.push({ locationText: { contains: keyword } })
            })

            andConditions.push({ OR: searchConditions })
        }

        if (district && district !== 'All') {
            const bnName = DISTRICTS_BN_MAP[district] || district
            andConditions.push({
                OR: [
                    { district: { contains: district } },
                    { district: { contains: bnName } }
                ]
            })
        }

        if (minSeverity || maxSeverity) {
            const severityFilter: any = {}
            if (minSeverity) severityFilter.gte = parseInt(minSeverity)
            if (maxSeverity) severityFilter.lte = parseInt(maxSeverity)
            andConditions.push({ severityScore: severityFilter })
        }

        const partyCategory = searchParams.get('partyCategory')
        if (partyCategory && partyCategory !== 'All') {
            const category = PARTY_CATEGORIES.find(c => c.id === partyCategory)
            if (category) {
                // Filter events where politicalParties (string) contains ANY of the keywords
                // OR tags, OR title/summary contains them (broad search for safety)

                const keywordConditions: any[] = category.keywords.map(k => ({
                    politicalParties: { contains: k }
                }))

                // Add title/summary search for "Non-Party" or specialized groups that might not be in the AI array yet
                if (partyCategory === 'non_party' || partyCategory === 'extremist') {
                    category.keywords.forEach(k => {
                        keywordConditions.push({ title: { contains: k } as any })
                        keywordConditions.push({ summary: { contains: k } as any })
                    })
                }

                andConditions.push({ OR: keywordConditions })
            }
        }

        if (type && type !== 'All') {
            andConditions.push({ tags: { contains: type } })
        }

        if (source && source !== 'All') {
            andConditions.push({ source: { equals: source } })
        }



        if (startDate || endDate) {
            const dateFilterPublished: any = {}
            if (startDate) dateFilterPublished.gte = new Date(startDate)
            if (endDate) dateFilterPublished.lte = new Date(endDate)

            // Convert to Date range for dateOfIncident (DateTime field)
            const dateFilterIncident: any = {}
            if (startDate) {
                const s = new Date(startDate)
                if (!isNaN(s.getTime())) {
                    dateFilterIncident.gte = toBDDateStart(s)
                }
            }
            if (endDate) {
                const e = new Date(endDate)
                if (!isNaN(e.getTime())) {
                    dateFilterIncident.lte = toBDDateEnd(e)
                }
            }

            andConditions.push({
                OR: [
                    // Primary: Filter by Incident Date
                    { dateOfIncident: dateFilterIncident },
                    // Fallback: If Incident Date is null, filter by Published Date
                    {
                        AND: [
                            { dateOfIncident: null },
                            { publishedAt: dateFilterPublished }
                        ]
                    }
                ]
            })
        }

        const where = andConditions.length > 0 ? { AND: andConditions } : {}

        console.log('--- API DEBUG ---')
        console.log('Params:', { startDate, endDate, partyCategory, district })
        console.log('Where:', JSON.stringify(where, null, 2))

        // Execute Query
        const [total, events] = await Promise.all([
            prisma.politicalEvent.count({ where }),
            prisma.politicalEvent.findMany({
                where,
                orderBy: [
                    { dateOfIncident: 'desc' },
                    { publishedAt: 'desc' }
                ],
                skip,
                take: limit,
            })
        ])

        return NextResponse.json({
            data: events,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}
