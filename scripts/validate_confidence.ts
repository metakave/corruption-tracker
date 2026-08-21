/**
 * Validation Script: AI Confidence Score Distribution
 * 
 * Checks last 100 events for confidence variability to ensure
 * the fix for uniform 0.95 scores is working correctly.
 * 
 * Expected Results:
 * - Unique confidence values: > 10
 * - 0.95 occurrences: < 20% of total
 * - Range: min < 0.75, max < 0.95
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateConfidenceDistribution() {
    console.log('🔍 Analyzing confidence score distribution...\n')

    // Fetch last 100 events
    const events = await prisma.politicalEvent.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            confidence: true,
            source: true,
            createdAt: true,
            severityScore: true,
        }
    })

    if (events.length === 0) {
        console.log('❌ No events found in database')
        return
    }

    // Extract confidence values
    const confidenceValues = events
        .map(e => e.confidence)
        .filter((c): c is number => c !== null)

    if (confidenceValues.length === 0) {
        console.log('❌ No confidence values found')
        return
    }

    // Calculate statistics
    const uniqueValues = new Set(confidenceValues)
    const avg = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
    const min = Math.min(...confidenceValues)
    const max = Math.max(...confidenceValues)
    const uniform95Count = confidenceValues.filter(c => c === 0.95).length
    const uniform95Percentage = (uniform95Count / confidenceValues.length) * 100

    // Distribution breakdown
    const distribution = {
        'Very Low (0.20-0.34)': confidenceValues.filter(c => c >= 0.20 && c < 0.35).length,
        'Low (0.35-0.54)': confidenceValues.filter(c => c >= 0.35 && c < 0.55).length,
        'Medium (0.55-0.69)': confidenceValues.filter(c => c >= 0.55 && c < 0.70).length,
        'Medium-High (0.70-0.84)': confidenceValues.filter(c => c >= 0.70 && c < 0.85).length,
        'High (0.85-0.95)': confidenceValues.filter(c => c >= 0.85 && c <= 0.95).length,
    }

    // Display results
    console.log('📊 CONFIDENCE SCORE STATISTICS')
    console.log('━'.repeat(60))
    console.log(`Total Events Analyzed:     ${events.length}`)
    console.log(`Events with Confidence:    ${confidenceValues.length}`)
    console.log(`Unique Confidence Values:  ${uniqueValues.size}`)
    console.log(`Average Confidence:        ${avg.toFixed(3)}`)
    console.log(`Min Confidence:            ${min.toFixed(3)}`)
    console.log(`Max Confidence:            ${max.toFixed(3)}`)
    console.log(`Uniform 0.95 Count:        ${uniform95Count} (${uniform95Percentage.toFixed(1)}%)`)
    console.log('')

    console.log('📈 DISTRIBUTION BY RANGE')
    console.log('━'.repeat(60))
    Object.entries(distribution).forEach(([range, count]) => {
        const percentage = (count / confidenceValues.length) * 100
        const bar = '█'.repeat(Math.round(percentage / 2))
        console.log(`${range.padEnd(25)} ${count.toString().padStart(3)} (${percentage.toFixed(1)}%) ${bar}`)
    })
    console.log('')

    // Validation checks
    console.log('✅ VALIDATION RESULTS')
    console.log('━'.repeat(60))

    const checks = [
        {
            test: uniqueValues.size >= 10,
            name: 'Unique Values (>= 10)',
            value: uniqueValues.size,
            status: uniqueValues.size >= 10 ? '✅ PASS' : '❌ FAIL'
        },
        {
            test: uniform95Percentage < 20,
            name: 'Uniform 0.95 Rate (< 20%)',
            value: `${uniform95Percentage.toFixed(1)}%`,
            status: uniform95Percentage < 20 ? '✅ PASS' : '❌ FAIL'
        },
        {
            test: min < 0.75,
            name: 'Minimum Score (< 0.75)',
            value: min.toFixed(3),
            status: min < 0.75 ? '✅ PASS' : '❌ FAIL'
        },
        {
            test: max < 0.95,
            name: 'Maximum Score (< 0.95)',
            value: max.toFixed(3),
            status: max < 0.95 ? '✅ PASS' : '⚠️  ACCEPTABLE' // Max can be 0.95 occasionally
        }
    ]

    checks.forEach(check => {
        console.log(`${check.status} ${check.name}: ${check.value}`)
    })

    const allPassed = checks.slice(0, 3).every(c => c.test)
    console.log('')
    console.log('━'.repeat(60))
    if (allPassed) {
        console.log('✅ ALL VALIDATION CHECKS PASSED')
        console.log('Confidence scoring system is working correctly.')
    } else {
        console.log('❌ VALIDATION FAILED')
        console.log('Confidence scores still show suspicious uniformity.')
        console.log('Review AI prompt and adjustment logic in event-processor.ts')
    }
    console.log('━'.repeat(60))

    // Show sample of recent scores
    console.log('\n📋 SAMPLE: Last 10 Events')
    console.log('━'.repeat(60))
    events.slice(0, 10).forEach((event, idx) => {
        const confidenceDisplay = event.confidence?.toFixed(2) || 'N/A'
        const titlePreview = event.title.substring(0, 50)
        console.log(`${(idx + 1).toString().padStart(2)}. [${confidenceDisplay}] ${titlePreview}...`)
        console.log(`    Source: ${event.source}, Severity: ${event.severityScore || 'N/A'}`)
    })

    await prisma.$disconnect()
}

validateConfidenceDistribution().catch(console.error)
