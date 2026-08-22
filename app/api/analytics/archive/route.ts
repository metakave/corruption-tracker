
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toBDDateStart, toBDDateEnd } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startParam = searchParams.get('startDate');
        const endParam = searchParams.get('endDate');

        // Default to current month if not provided (Safety for archive)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const start = startParam ? new Date(startParam) : firstDayOfMonth;
        const end = endParam ? new Date(endParam) : now;

        // Adjust for BD Timezone (consistent with report logic)
        const bdStartDate = toBDDateStart(start);
        const bdEndDate = toBDDateEnd(end);

        console.log(`📊 Archive API: Fetching from ${bdStartDate.toISOString()} to ${bdEndDate.toISOString()}`);

        const events = await prisma.corruptionEvent.findMany({
            where: {
                OR: [
                    {
                        dateOfIncident: {
                            gte: bdStartDate,
                            lte: bdEndDate
                        }
                    },
                    {
                        dateOfIncident: null,
                        publishedAt: {
                            gte: bdStartDate,
                            lte: bdEndDate
                        }
                    }
                ]
            },
            select: {
                id: true,
                title: true,
                dateOfIncident: true,
                publishedAt: true,
                district: true,
                amountInvolved: true,
                amountFormatted: true,
                sectorOrMinistry: true,
                summary: true,
                url: true,
                isCorruption: true,
                category: true,
                tags: true,
                latitude: true,
                longitude: true
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });

        const totalLoss = events.reduce((acc: number, curr: any) => acc + (curr.amountInvolved || 0), 0);

        return NextResponse.json({
            meta: {
                count: events.length,
                totalLoss,
                period: { start: bdStartDate, end: bdEndDate }
            },
            events: events.map((e: any) => {
                return {
                    id: e.id,
                    date: (e.dateOfIncident || e.publishedAt).toISOString().split('T')[0],
                    title: e.title,
                    summary: e.summary,
                    district: e.district || 'Unknown',
                    amountInvolved: e.amountInvolved || 0,
                    amountFormatted: e.amountFormatted || '',
                    sectorOrMinistry: e.sectorOrMinistry || '',
                    isCorruption: e.isCorruption,
                    url: e.url,
                    category: e.category,
                    tags: e.tags,
                    latitude: e.latitude,
                    longitude: e.longitude
                };
            })
        });

    } catch (error) {
        console.error('Archive API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch archive data' }, { status: 500 });
    }
}
