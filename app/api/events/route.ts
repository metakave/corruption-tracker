import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search')
        const district = searchParams.get('district')
        const sector = searchParams.get('sector')
        const category = searchParams.get('category')
        const status = searchParams.get('status')
        const source = searchParams.get('source')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const minAmount = searchParams.get('minAmount')
        const maxAmount = searchParams.get('maxAmount')

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        const andConditions: any[] = [
            { isCorruption: true }
        ]

        if (search) {
            const clean = search.trim()
            andConditions.push({
                OR: [
                    { title: { contains: clean, mode: 'insensitive' } },
                    { summary: { contains: clean, mode: 'insensitive' } },
                    { accusedEntities: { contains: clean, mode: 'insensitive' } },
                    { sectorOrMinistry: { contains: clean, mode: 'insensitive' } },
                    { investigatingAgency: { contains: clean, mode: 'insensitive' } },
                    { locationText: { contains: clean, mode: 'insensitive' } },
                ]
            })
        }

        if (district && district !== 'All') {
            andConditions.push({ district })
        }

        if (sector && sector !== 'All') {
            andConditions.push({ sectorOrMinistry: sector })
        }

        if (category && category !== 'All') {
            andConditions.push({ category })
        }

        if (status && status !== 'All') {
            andConditions.push({ legalStatus: status })
        }

        if (source && source !== 'All') {
            andConditions.push({ source })
        }

        if (startDate) {
            andConditions.push({ publishedAt: { gte: new Date(startDate) } })
        }
        if (endDate) {
            andConditions.push({ publishedAt: { lte: new Date(endDate) } })
        }

        if (minAmount) {
            andConditions.push({ amountInvolved: { gte: parseFloat(minAmount) } })
        }
        if (maxAmount) {
            andConditions.push({ amountInvolved: { lte: parseFloat(maxAmount) } })
        }

        const where = { AND: andConditions }

        const [events, total] = await Promise.all([
            prisma.corruptionEvent.findMany({
                where,
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.corruptionEvent.count({ where })
        ])

        return NextResponse.json({
            events,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error: any) {
        console.error('Error fetching corruption events:', error)
        return NextResponse.json({ error: 'Failed to fetch corruption events', details: error.message }, { status: 500 })
    }
}
