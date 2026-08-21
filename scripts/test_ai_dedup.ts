
import { checkDuplicateWithAI } from '../lib/ai-analysis'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    console.log("Testing AI Semantic Deduplication (RAG-Lite)...")

    // Scenario 1: Semantic Match
    console.log("\n--- Scenario 1: Semantic Duplicate ---")
    const newArticle = {
        title: "Drug dealer hacked to death in Shariatpur",
        summary: "A local businessman named Khokon was hacked and burned by miscreants on Friday night. He died later.",
        date: "2025-01-03",
        source: "Daily Star"
    }

    const candidates = [
        {
            id: "event-123",
            title: "BNP rally in Dhaka",
            summary: "Big rally held at Naya Paltan.",
            date: new Date("2025-01-01"),
            district: "Dhaka"
        },
        {
            id: "target-match-id",
            title: "Businessman killed in Damudya attack",
            summary: "Khokon Chandra Das died after being attacked with sharp weapons and petrol bomb.",
            date: new Date("2025-01-03"),
            district: "Shariatpur"
        },
        {
            id: "event-789",
            title: "Road accident in Shariatpur",
            summary: "Bus collided with truck.",
            date: new Date("2025-01-03"),
            district: "Shariatpur"
        }
    ]

    const matchId = await checkDuplicateWithAI(newArticle, candidates)
    if (matchId === "target-match-id") {
        console.log("✅ PASSED: Correctly identified semantic match 'target-match-id'")
    } else {
        console.log(`❌ FAILED: Expected 'target-match-id', got '${matchId}'`)
    }

    // Scenario 2: Distinct Event
    console.log("\n--- Scenario 2: Distinct Event ---")
    const distinctArticle = {
        title: "New clash in Gosairhat",
        summary: "Two groups clashed over land dispute in Gosairhat, Shariatpur. 5 injured.",
        date: "2025-01-05",
        source: "Prothom Alo"
    }

    const matchId2 = await checkDuplicateWithAI(distinctArticle, candidates)
    if (matchId2 === null) {
        console.log("✅ PASSED: Correctly identified as NEW event (NULL)")
    } else {
        console.log(`❌ FAILED: Expected NULL, got '${matchId2}'`)
    }
}

main().catch(console.error)
