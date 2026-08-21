
import { prisma } from '@/lib/db'

async function main() {
    console.log("🔍 Diagnosing Political Parties Data...")

    // unique parties
    const allEvents = await prisma.politicalEvent.findMany({
        where: { isPoliticalViolence: true },
        select: { id: true, title: true, politicalParties: true }
    })

    console.log(`Total Events: ${allEvents.length}`)

    let withParties = 0
    let withoutParties = 0
    const partyCounts: Record<string, number> = {}

    allEvents.forEach(e => {
        if (withParties < 5) {
            console.log(`ID: ${e.id} | Type: ${typeof e.politicalParties} | Value: ${JSON.stringify(e.politicalParties)}`)
        }

        let parties: string[] = []
        if (Array.isArray(e.politicalParties)) {
            parties = e.politicalParties
        } else if (typeof e.politicalParties === 'string') {
            // Try parsing if it looks like JSON or CSV
            try {
                parties = JSON.parse(e.politicalParties)
            } catch {
                parties = [e.politicalParties]
            }
        }

        if (parties && parties.length > 0) {
            withParties++
            parties.forEach((p: string) => {
                partyCounts[p] = (partyCounts[p] || 0) + 1
            })
        } else {
            withoutParties++
        }
    })

    console.log(`\nStats:`)
    console.log(`Events WITH parties: ${withParties}`)
    console.log(`Events WITHOUT parties: ${withoutParties}`)

    console.log(`\nTop Identified Parties:`)
    Object.entries(partyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([p, c]) => console.log(`- ${p}: ${c}`))

}

main().catch(console.error)
