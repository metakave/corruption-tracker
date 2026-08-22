import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
    try {
        const requests = await prisma.downloadRequest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 500,
        })
        const total = await prisma.downloadRequest.count()

        return NextResponse.json({
            total,
            requests,
        })
    } catch (err: any) {
        console.error('[admin/download-requests] failed:', err)
        return NextResponse.json({ error: 'failed to fetch download requests' }, { status: 500 })
    }
}
