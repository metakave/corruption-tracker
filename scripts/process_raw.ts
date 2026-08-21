
import { PrismaClient } from '@prisma/client'
import { analyzeWithAI } from '../lib/ai-analysis'
import { geocodeLocation } from '../lib/geocoding'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function processRawData() {
    console.log("🚀 Starting Raw Data Processor...")

    // Fetch unprocessed articles
    const rawArticles = await prisma.rawNewsArticle.findMany({
        where: { isProcessed: false },
        take: 50 // Process in batches
    })

    console.log(`📊 Found ${rawArticles.length} unprocessed articles.`)

    if (rawArticles.length === 0) {
        console.log("   Nothing to process.")
        return
    }

    let processed = 0
    let violenceFound = 0

    for (const article of rawArticles) {
        console.log(`\n🔍 Analyzing [${article.id}]: ${article.title.substring(0, 50)}...`)

        try {
            const analysis = await analyzeWithAI(
                article.content,
                article.title,
                article.url,
                article.publishedAt.toISOString()
            )

            if (analysis && analysis.is_political_violence) {
                console.log(`   🔴 VIOLENCE DETECTED (Score: ${analysis.severity_score}/10)`)

                // Geocode
                const geoData = analysis.location.district ? geocodeLocation(analysis.location.district) : null

                // Save to PoliticalEvent
                await prisma.politicalEvent.create({
                    data: {
                        title: article.title,
                        url: article.url,
                        source: article.source,
                        publishedAt: article.publishedAt,
                        dateOfIncident: new Date(), // AI extraction removed from prompt

                        locationText: analysis.location.spot,
                        district: analysis.location.district || geoData?.district,
                        latitude: geoData?.lat || 23.8103,
                        longitude: geoData?.lng || 90.4125,

                        politicalParties: JSON.stringify(analysis.parties_involved || []),
                        actors: null,

                        injured: analysis.casualties?.injured || 0,
                        killed: analysis.casualties?.killed || 0,
                        affectedInfrastructure: null,

                        summary: analysis.summary,
                        severityScore: analysis.severity_score || 1,
                        confidence: analysis.confidence || 0.5,
                        tags: JSON.stringify([analysis.incident_type]),

                        images: '[]', // Raw crawler didn't save images, default empty
                        rawText: article.content.slice(0, 1000),

                        isBangladesh: true,
                        isPoliticalViolence: true
                    }
                })
                violenceFound++
            } else {
                console.log(`   ⚪ Non-violent or skipped.`)
            }

            // Mark as processed
            await prisma.rawNewsArticle.update({
                where: { id: article.id },
                data: { isProcessed: true }
            })
            processed++

        } catch (error) {
            console.error(`   ❌ Error processing article ${article.id}:`, error)
        }
    }

    console.log(`\n✅ Batch Complete!`)
    console.log(`   Processed: ${processed}`)
    console.log(`   Violence Found: ${violenceFound}`)
}

processRawData()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
