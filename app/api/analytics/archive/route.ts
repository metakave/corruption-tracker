
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

        const events = await prisma.politicalEvent.findMany({
            where: {
                // Fetch ALL events for all violence categories
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
                politicalParties: true,
                victimParties: true,
                perpetratorParties: true,
                category: true, // Needed for dashboard stats
                tags: true, // Needed for advanced filtering
                latitude: true, // For map visualization
                longitude: true // For map visualization
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
                const parseJSON = (str: string | null) => {
                    if (!str) return [];
                    try {
                        const parsed = JSON.parse(str);
                        return Array.isArray(parsed) ? parsed : [str];
                    } catch {
                        return [str];
                    }
                };

                return {
                    id: e.id,
                    date: (e.dateOfIncident || e.publishedAt).toISOString().split('T')[0],
                    title: e.title,
                    summary: e.summary,
                    district: e.district || 'Unknown',
                    killed: e.killed || 0,
                    injured: e.injured || 0,
                    isPolitical: e.isPoliticalViolence,
                    politicalParties: parseJSON(e.politicalParties),
                    victimParties: parseJSON(e.victimParties),
                    perpetratorParties: parseJSON(e.perpetratorParties),
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
