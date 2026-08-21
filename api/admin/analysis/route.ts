
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toBDDateStart, toBDDateEnd } from '@/lib/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startParam = searchParams.get('startDate');
        const endParam = searchParams.get('endDate');

        // Default to current month if not provided
        const now = new Date();
        const start = startParam ? new Date(startParam) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endParam ? new Date(endParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Adjust for BD Timezone (consistent with report logic)
        const bdStartDate = toBDDateStart(start);
        const bdEndDate = toBDDateEnd(end);

        console.log(`📊 API Analysis: Fetching from ${bdStartDate.toISOString()} to ${bdEndDate.toISOString()}`);

        const events = await prisma.politicalEvent.findMany({
            where: {
                // Fetch ALL events that might be relevant, valid or not, for the dashboard to filter
                isPoliticalViolence: true, // STRICT FILTER to ignore summary reports
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
                killed: true,
                injured: true,
                summary: true,
                url: true,
                isPoliticalViolence: true,
                politicalParties: true
            },
            orderBy: {
                dateOfIncident: 'desc'
            }
        });

        // Basic server-side aggregation (optional, but good for validation)
        const totalKilled = events.reduce((acc: number, curr: any) => acc + (curr.killed || 0), 0);
        const totalInjured = events.reduce((acc: number, curr: any) => acc + (curr.injured || 0), 0);

        return NextResponse.json({
            meta: {
                count: events.length,
                totalKilled,
                totalInjured,
                period: { start: bdStartDate, end: bdEndDate }
            },
            events: events.map((e: any) => {
                let parsedParties: string[] = [];
                try {
                    if (e.politicalParties) {
                        // Handle cases where it might already be an object or a string
                        parsedParties = typeof e.politicalParties === 'string'
                            ? JSON.parse(e.politicalParties)
                            : e.politicalParties;
                    }
                } catch (err) {
                    console.error('Failed to parse parties for', e.id);
                    parsedParties = [];
                }

                return {
                    id: e.id,
                    date: (e.dateOfIncident || e.publishedAt).toISOString().split('T')[0],
                    title: e.title,
                    summary: e.summary,
                    district: e.district || 'Unknown',
                    killed: e.killed || 0,
                    injured: e.injured || 0,
                    isPolitical: e.isPoliticalViolence,
                    politicalParties: Array.isArray(parsedParties) ? parsedParties : [],
                    url: e.url
                };
            })
        });

    } catch (error) {
        console.error('Analysis API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analysis data' }, { status: 500 });
    }
}
