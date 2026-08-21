import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // Get the latest scraper run
        const latestRun = await prisma.scraperLog.findFirst({
            orderBy: { startTime: 'desc' }
        });

        // Get statistics by source from RawNewsArticle
        const sourceStats = await prisma.rawNewsArticle.groupBy({
            by: ['source'],
            _count: {
                id: true
            },
            _max: {
                scrapedAt: true
            }
        });

        // NEW: Get Violence statistics by source (Primary + Secondary from additionalSources)
        const allEvents = await prisma.politicalEvent.findMany({
            select: {
                source: true,
                additionalSources: true
            }
        });

        const violenceBySource: Record<string, number> = {};

        allEvents.forEach(event => {
            // Count primary source
            const primary = event.source;
            violenceBySource[primary] = (violenceBySource[primary] || 0) + 1;

            // Count additional sources
            if (event.additionalSources) {
                try {
                    const additional = JSON.parse(event.additionalSources);
                    if (Array.isArray(additional)) {
                        additional.forEach((src: any) => {
                            const name = src.source || 'Unknown';
                            violenceBySource[name] = (violenceBySource[name] || 0) + 1;
                        });
                    }
                } catch (e) {
                    // ignore json parse error
                }
            }
        });

        // Get overall statistics
        const totalArticles = await prisma.rawNewsArticle.count();
        const totalViolence = await prisma.politicalEvent.count();
        const firstArticle = await prisma.rawNewsArticle.findFirst({
            orderBy: { scrapedAt: 'asc' },
            select: { scrapedAt: true }
        });
        const lastUpdate = await prisma.rawNewsArticle.findFirst({
            orderBy: { scrapedAt: 'desc' },
            select: { scrapedAt: true }
        });

        // Get recent logs (last 10 runs)
        const recentLogs = await prisma.scraperLog.findMany({
            orderBy: { startTime: 'desc' },
            take: 10
        });

        // Format the response
        const bySource: Record<string, { total: number; violence: number; lastScraped: string | null }> = {};

        // Initialize with scraping stats
        sourceStats.forEach(stat => {
            bySource[stat.source] = {
                total: stat._count.id,
                violence: violenceBySource[stat.source] || 0,
                lastScraped: stat._max.scrapedAt?.toISOString() || null
            };
        });

        // Add any sources that have violence but no raw articles (edge case, but good for data integrity)
        Object.keys(violenceBySource).forEach(source => {
            if (!bySource[source]) {
                bySource[source] = {
                    total: 0,
                    violence: violenceBySource[source],
                    lastScraped: null
                };
            }
        });

        const response = {
            lastRun: latestRun ? {
                timestamp: latestRun.startTime.toISOString(),
                status: latestRun.status,
                duration: latestRun.endTime
                    ? Math.round((latestRun.endTime.getTime() - latestRun.startTime.getTime()) / 1000)
                    : null,
                articlesFound: latestRun.totalArticles,
                violenceDetected: latestRun.violenceDetected,
                runId: latestRun.runId
            } : null,
            bySource,
            overall: {
                totalArticles,
                totalViolence,
                firstDataDate: firstArticle?.scrapedAt?.toISOString() || null,
                lastUpdate: lastUpdate?.scrapedAt?.toISOString() || null
            },
            recentLogs: recentLogs.map(log => ({
                runId: log.runId,
                startTime: log.startTime.toISOString(),
                endTime: log.endTime?.toISOString() || null,
                status: log.status,
                totalArticles: log.totalArticles,
                violenceDetected: log.violenceDetected,
                sourcesScraped: log.sourcesScraped ? JSON.parse(log.sourcesScraped) : null,
                errors: log.errors ? JSON.parse(log.errors) : null
            }))
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching scraper stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scraper statistics' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
