/**
 * COMPREHENSIVE EVENT CLEANING & DEDUPLICATION PIPELINE
 * 
 * This script implements a sophisticated multi-stage pipeline to:
 * 1. Normalize text and structured fields
 * 2. Extract/resolve locations with fuzzy matching
 * 3. Detect and merge duplicate events
 * 4. Recompute confidence and severity scores
 * 5. Track full provenance and flag items for review
 * 6. Generate audit reports
 */

import { PrismaClient } from '@prisma/client'
import stringSimilarity from 'string-similarity'

const prisma = new PrismaClient()

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
    SIMILARITY_THRESHOLD: 0.80,
    DATE_DISTANCE_DAYS: 1,
    FUZZY_DISTRICT_THRESHOLD: 0.80,
    MIN_CONFIDENCE: 0.20,
    MAX_CONFIDENCE: 0.95,
    REVIEW_THRESHOLD: 0.35
}

// Canonical 64 Districts (Bangla → English mapping)
const CANONICAL_DISTRICTS: { [key: string]: string } = {
    'ঢাকা': 'Dhaka',
    'গাজীপুর': 'Gazipur',
    'নারায়ণগঞ্জ': 'Narayanganj',
    'মানিকগঞ্জ': 'Manikganj',
    'মুন্সীগঞ্জ': 'Munshiganj',
    'টাঙ্গাইল': 'Tangail',
    'কিশোরগঞ্জ': 'Kishoreganj',
    'মাদারীপুর': 'Madaripur',
    'শরীয়তপুর': 'Shariatpur',
    'ফরিদপুর': 'Faridpur',
    'গোপালগঞ্জ': 'Gopalganj',
    'রাজবাড়ী': 'Rajbari',
    'নরসিংদী': 'Narsingdi',
    'চট্টগ্রাম': 'Chattogram',
    'কক্সবাজার': 'Cox\'s Bazar',
    'রাঙ্গামাটি': 'Rangamati',
    'বান্দরবান': 'Bandarban',
    'খাগড়াছড়ি': 'Khagrachhari',
    'ফেনী': 'Feni',
    'লক্ষ্মীপুর': 'Lakshmipur',
    'কুমিল্লা': 'Cumilla',
    'নোয়াখালী': 'Noakhali',
    'ব্রাহ্মণবাড়ীয়া': 'Brahmanbaria',
    'চাঁদপুর': 'Chandpur',
    // ... (include all 64 districts)
}

// Canonical Political Parties
const CANONICAL_PARTIES = [
    'Awami League',
    'BNP',
    'Jamaat-e-Islami',
    'Jatiya Party',
    'Police',
    'Army',
    'Students',
    'Civilians',
    'Mob',
    'Unknown'
]

// Evidence types
const EVIDENCE_TYPES = [
    'police_statement',
    'hospital_report',
    'eyewitness',
    'photo_video',
    'multiple_sources',
    'single_source'
]

// ============================================================================
// INTERFACES
// ============================================================================

interface ProcessedEvent {
    id: string
    url: string
    title: string
    summary: string
    publishedAt: Date
    incidentDate: Date | null
    district: string | null
    spot: string | null
    latitude: number | null
    longitude: number | null
    killed: number
    injured: number
    parties: string[]
    severityScore: number
    confidence: number
    evidence: string[]
    sources: Array<{
        id: string
        url: string
        source: string
        confidence: number
    }>
    needsReview: boolean
    locationUncertain: boolean
    casualtyConflict: boolean
    multipleIncidents: boolean
}

interface MergeGroup {
    primaryEvent: ProcessedEvent
    mergedEvents: ProcessedEvent[]
    mergeReason: string
    confidenceBefore: number
    confidenceAfter: number
    fieldsChanged: string[]
}

interface ChangeReport {
    timestamp: Date
    totalProcessed: number
    merged: number
    updated: number
    flaggedForReview: number
    mergeGroups: MergeGroup[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize text: lowercase, remove excess whitespace, keep Bangla
 */
function normalizeText(text: string): string {
    if (!text) return ''
    return text
        .toLowerCase()
        .replace(/[^\u0980-\u09FF\w\s]/g, ' ') // Keep Bangla and alphanumeric
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Fuzzy match district name to canonical list
 */
function fuzzyMatchDistrict(input: string): { district: string | null, confidence: number } {
    if (!input || input === 'Unknown') return { district: null, confidence: 0 }

    const normalized = normalizeText(input)
    const matches = stringSimilarity.findBestMatch(
        normalized,
        Object.keys(CANONICAL_DISTRICTS)
    )

    const bestMatch = matches.bestMatch
    if (bestMatch.rating >= CONFIG.FUZZY_DISTRICT_THRESHOLD) {
        return {
            district: bestMatch.target,
            confidence: bestMatch.rating
        }
    }

    return { district: null, confidence: bestMatch.rating }
}

/**
 * Calculate text similarity between two events
 */
function calculateSimilarity(event1: ProcessedEvent, event2: ProcessedEvent): number {
    const title1 = normalizeText(event1.title)
    const title2 = normalizeText(event2.title)
    const summary1 = normalizeText(event1.summary || '')
    const summary2 = normalizeText(event2.summary || '')

    const titleSim = stringSimilarity.compareTwoStrings(title1, title2)
    const summarySim = stringSimilarity.compareTwoStrings(summary1, summary2)

    return (titleSim * 0.7 + summarySim * 0.3) // Weighted average
}

/**
 * Check if two dates are within threshold
 */
function datesWithinThreshold(date1: Date, date2: Date, daysThreshold: number): boolean {
    const diffMs = Math.abs(date1.getTime() - date2.getTime())
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays <= daysThreshold
}

/**
 * Recompute confidence score using deterministic rules
 */
function recomputeConfidence(event: ProcessedEvent): number {
    let confidence = 0.50 // Base

    // +0.20 for explicit recent date
    if (event.incidentDate && event.publishedAt) {
        const daysDiff = Math.abs(
            (event.incidentDate.getTime() - event.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysDiff <= 30) {
            confidence += 0.20
        }
    }

    // +0.15 for explicit location
    if (event.district && event.spot) {
        confidence += 0.15
    }

    // +0.10 for strong evidence
    const hasStrongEvidence = event.evidence.some(e =>
        ['police_statement', 'hospital_report', 'photo_video'].includes(e)
    )
    if (hasStrongEvidence) {
        confidence += 0.10
    }

    // +0.05 for explicit casualties
    if (event.killed > 0 || event.injured > 0) {
        confidence += 0.05
    }

    // -0.20 for single unverified source
    if (event.evidence.includes('single_source') && event.sources.length === 1) {
        confidence -= 0.20
    }

    // If multiple sources, probabilistic fusion
    if (event.sources.length > 1) {
        const sourceConfidences = event.sources.map(s => s.confidence || 0.5)
        const combinedConf = 1 - sourceConfidences.reduce((acc, c) => acc * (1 - c), 1)
        confidence = Math.max(confidence, combinedConf)
    }

    // Clamp
    return Math.max(CONFIG.MIN_CONFIDENCE, Math.min(CONFIG.MAX_CONFIDENCE, confidence))
}

/**
 * Recompute severity score
 */
function recomputeSeverity(event: ProcessedEvent): number {
    // Any death → ≥7
    if (event.killed > 0) {
        if (event.killed >= 5) return 10
        if (event.killed >= 2) return 9
        return 7
    }

    // Multiple hospitalized → 4-6
    if (event.injured >= 10) return 6
    if (event.injured >= 5) return 5
    if (event.injured >= 1) return 4

    // Minor → 1-3
    return 2
}

// ============================================================================
// MAIN PIPELINE STAGES
// ============================================================================

/**
 * Stage 1: Load and normalize existing events
 */
async function loadAndNormalizeEvents(): Promise<ProcessedEvent[]> {
    console.log('\n📥 Stage 1: Loading existing events...')

    const events = await prisma.politicalEvent.findMany({
        orderBy: { createdAt: 'desc' }
    })

    console.log(`   Found ${events.length} existing events`)

    const processed: ProcessedEvent[] = events.map(event => ({
        id: event.id,
        url: event.url,
        title: event.title,
        summary: event.summary || '',
        publishedAt: event.publishedAt,
        incidentDate: event.dateOfIncident,
        district: event.district,
        spot: event.locationText,
        latitude: event.latitude,
        longitude: event.longitude,
        killed: event.killed || 0,
        injured: event.injured || 0,
        parties: event.politicalParties ? JSON.parse(event.politicalParties) : [],
        severityScore: event.severityScore || 1,
        confidence: event.confidence || 0.5,
        evidence: [],
        sources: [{
            id: event.id,
            url: event.url,
            source: event.source,
            confidence: event.confidence || 0.5
        }],
        needsReview: false,
        locationUncertain: false,
        casualtyConflict: false,
        multipleIncidents: false
    }))

    return processed
}

/**
 * Stage 2: Fix and resolve locations
 */
async function fixLocations(events: ProcessedEvent[]): Promise<void> {
    console.log('\n📍 Stage 2: Fixing locations...')

    let fixed = 0
    let uncertain = 0

    for (const event of events) {
        if (!event.district || event.district === 'Unknown') {
            const match = fuzzyMatchDistrict(event.spot || event.title)

            if (match.district) {
                event.district = match.district
                fixed++
            } else {
                event.locationUncertain = true
                uncertain++
            }
        }
    }

    console.log(`   Fixed: ${fixed}, Uncertain: ${uncertain}`)
}

/**
 * Stage 3: Detect and merge duplicates
 */
async function detectAndMergeDuplicates(events: ProcessedEvent[]): Promise<{
    merged: ProcessedEvent[],
    groups: MergeGroup[]
}> {
    console.log('\n🔄 Stage 3: Detecting duplicates...')

    const mergeGroups: MergeGroup[] = []
    const processed = new Set<string>()
    const merged: ProcessedEvent[] = []

    for (let i = 0; i < events.length; i++) {
        if (processed.has(events[i].id)) continue

        const group: ProcessedEvent[] = [events[i]]
        processed.add(events[i].id)

        for (let j = i + 1; j < events.length; j++) {
            if (processed.has(events[j].id)) continue

            const sim = calculateSimilarity(events[i], events[j])
            const sameDistrict = events[i].district === events[j].district ||
                events[i].district === null ||
                events[j].district === null

            const sameDate = events[i].incidentDate && events[j].incidentDate &&
                datesWithinThreshold(events[i].incidentDate, events[j].incidentDate, CONFIG.DATE_DISTANCE_DAYS)

            if (sim >= CONFIG.SIMILARITY_THRESHOLD && sameDistrict && (sameDate || !events[i].incidentDate || !events[j].incidentDate)) {
                group.push(events[j])
                processed.add(events[j].id)
            }
        }

        if (group.length > 1) {
            const mergedEvent = mergeEventGroup(group)
            merged.push(mergedEvent)

            mergeGroups.push({
                primaryEvent: mergedEvent,
                mergedEvents: group,
                mergeReason: 'high_similarity_same_district_date',
                confidenceBefore: group[0].confidence,
                confidenceAfter: mergedEvent.confidence,
                fieldsChanged: ['sources', 'casualties', 'confidence']
            })
        } else {
            merged.push(events[i])
        }
    }

    console.log(`   Found ${mergeGroups.length} duplicate groups`)
    console.log(`   Merged ${events.length} → ${merged.length} events`)

    return { merged, groups: mergeGroups }
}

/**
 * Merge a group of duplicate events
 */
function mergeEventGroup(events: ProcessedEvent[]): ProcessedEvent {
    // Sort by confidence (highest first)
    const sorted = [...events].sort((a, b) => b.confidence - a.confidence)
    const primary = sorted[0]

    // Union sources
    const allSources = events.flatMap(e => e.sources)

    // Sum casualties
    const totalKilled = events.reduce((sum, e) => sum + e.killed, 0)
    const totalInjured = events.reduce((sum, e) => sum + e.injured, 0)

    // Check casualty conflict
    const casualtyConflict = new Set(events.map(e => e.killed)).size > 1 ||
        new Set(events.map(e => e.injured)).size > 1

    // Union parties
    const allParties = Array.from(new Set(events.flatMap(e => e.parties)))

    // Union evidence
    const allEvidence = Array.from(new Set(events.flatMap(e => e.evidence)))

    // Pick best location
    const bestLocation = sorted.find(e => e.district && e.district !== 'Unknown') || primary

    const merged: ProcessedEvent = {
        ...primary,
        killed: totalKilled,
        injured: totalInjured,
        parties: allParties,
        evidence: allEvidence,
        sources: allSources,
        district: bestLocation.district,
        spot: bestLocation.spot,
        casualtyConflict,
        needsReview: casualtyConflict || events.length > 3
    }

    // Recompute confidence and severity
    merged.confidence = recomputeConfidence(merged)
    merged.severityScore = recomputeSeverity(merged)

    return merged
}

/**
 * Stage 4: Recompute all scores
 */
async function recomputeScores(events: ProcessedEvent[]): Promise<void> {
    console.log('\n📊 Stage 4: Recomputing scores...')

    for (const event of events) {
        event.confidence = recomputeConfidence(event)
        event.severityScore = recomputeSeverity(event)

        if (event.confidence < CONFIG.REVIEW_THRESHOLD) {
            event.needsReview = true
        }
    }

    const needsReview = events.filter(e => e.needsReview).length
    console.log(`   Flagged ${needsReview} events for review`)
}

/**
 * Stage 5: Generate change report
 */
function generateReport(
    original: number,
    final: ProcessedEvent[],
    groups: MergeGroup[]
): ChangeReport {
    return {
        timestamp: new Date(),
        totalProcessed: original,
        merged: original - final.length,
        updated: final.length,
        flaggedForReview: final.filter(e => e.needsReview).length,
        mergeGroups: groups
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    console.log('='.repeat(60))
    console.log('   COMPREHENSIVE EVENT CLEANING & DEDUPLICATION PIPELINE')
    console.log('='.repeat(60))

    try {
        // Stage 1: Load and normalize
        const events = await loadAndNormalizeEvents()

        // Stage 2: Fix locations
        await fixLocations(events)

        // Stage 3: Detect and merge duplicates
        const { merged, groups } = await detectAndMergeDuplicates(events)

        // Stage 4: Recompute scores
        await recomputeScores(merged)

        // Stage 5: Generate report
        const report = generateReport(events.length, merged, groups)

        // Display summary
        console.log('\n' + '='.repeat(60))
        console.log('PIPELINE COMPLETE')
        console.log('='.repeat(60))
        console.log(`Total Processed: ${report.totalProcessed}`)
        console.log(`After Merge: ${report.updated}`)
        console.log(`Duplicates Merged: ${report.merged}`)
        console.log(`Flagged for Review: ${report.flaggedForReview}`)

        // Save report
        const reportPath = `./logs/cleanup_report_${Date.now()}.json`
        const fs = await import('fs/promises')
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
        console.log(`\n📄 Report saved: ${reportPath}`)

        // TODO: Write merged events back to database
        // (Implementation depends on whether you want to create new records or update in place)

    } catch (error) {
        console.error('❌ Pipeline error:', error)
        throw error
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
