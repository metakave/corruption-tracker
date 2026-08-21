import { GoogleGenerativeAI } from '@google/generative-ai'

const MODELS = [
    'gemini-3-flash-preview',   // Latest (Dec 2025): Balanced speed & frontier intelligence
    'gemini-3-pro-preview',     // Latest (Nov 2025): Complex reasoning & agents
    'gemini-2.5-flash-lite',    // Stable (July 2025): Fastest, high throughput
    'gemini-2.5-flash',         // Stable (June 2025): Price-performance workhorse
    'gemini-2.5-pro'            // Stable (June 2025): Deep reasoning fallback
];


export interface AIAnalysisResult {
    decision_trace: {
        location_valid: boolean
        recency_valid: boolean
        violence_type_valid: boolean
        is_in_bangladesh: boolean
        reason_for_exclusion?: string // Why was this marked as not political violence?
    }
    is_political_violence: boolean
    incident_type: string
    title: string
    summary: string
    location: {
        spot: string
        district: string
        raw_location_match?: string
    }
    incident_date: string | null
    raw_date_phrase?: string
    casualties: {
        killed: number
        injured: number
        estimated: boolean
    }
    parties_involved: string[]
    raw_party_matches?: string[]
    severity_score: number // Deterministic 1-10
    evidence: string[]
    confidence: number // Deterministic calculation
    extraction_warnings: string[]
    url: string
    source_name: string
    multiple_incidents?: boolean
    incidents?: AIAnalysisResult[]
}

/**
 * Robust AI analysis with multiple API keys and model fallbacks
 */
export async function analyzeWithAI(
    articleText: string,
    title: string,
    url: string,
    publishedAt: string,
    sourceName: string
): Promise<AIAnalysisResult | null> {
    // Defensive Fallback: If publishedAt is missing/undefined, use Today
    if (!publishedAt) {
        publishedAt = new Date().toISOString().split('T')[0]
    }

    const today = new Date().toISOString().split('T')[0]

    // API Keys (from .env) - Defined here to ensure environment variables are loaded
    const API_KEYS = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
        process.env.GEMINI_API_KEY_6,
        process.env.GEMINI_API_KEY_7,
        process.env.GEMINI_API_KEY_8,
    ].filter(Boolean) as string[]

    const prompt = `
You are an expert Intelligence Analyst for the "Bangladesh Violence Tracker." Your mission is to analyze news articles and extract structured intelligence on incidents of violence.

INPUT CONTEXT:
- Reference Date (Today): ${publishedAt}
- Source: ${sourceName}
- Article URL: ${url}
- Article Text: 
"""
${articleText}
"""

STRICT OUTPUT RULES:
1. Output ONLY valid JSON. Do not include markdown formatting (short code blocks), preambles, or explanations.
2. The JSON must adhere strictly to the schema defined below.

PHASE 1: ANALYSIS & FILTERING
Before extracting details, evaluate the article against these criteria:

A. DEFINITION OF RELEVANT VIOLENCE
   INCLUDES:
   - Physical Clashes: Factional fights, political rivalries, student wing clashes.
   - Attacks: Shootings, stabbings, severe beatings, hacking.
   - Destructive Acts: Vandalism, Arson (burning buses/homes), Explosions (cocktails/crude bombs).
   - Fatalities: Murder or discovery of bodies (if potentially linked to conflict/crime).
   EXCLUDES:
   - Road accidents (unless confirmed deliberate/attack/blockade).
   - Natural deaths, suicides, drownings, electrocution.
   - Peaceful protests/processions with NO physical altercation.
   - Court verdicts, press briefings, or threats without action.
   - SIMPLE ARRESTS: Police arresting someone WITHOUT a physical clash or shootout.
   - FICTIONAL CONTENT: Stories, novels, literature reviews, or "Onnoalo" segments.
   - HISTORICAL ACCOUNTS: Events explicitly described as happening "1 year ago", "10 years ago", "in 2014", etc.

B. RECENCY RULE (STRICT 14-DAY WINDOW)
   - Reference Date: ${publishedAt}
   - CURRENT CONTEXT: Today is ${publishedAt}. The year is 2026.
   - Logic: 
     - "Today", "Yesterday", "Last night" = VALID (Relative to ${publishedAt}).
     - Specific dates within 14 days of Reference Date = VALID.
     - No date mentioned = Assume VALID (Recent).
     - Explicit dates older than 14 days = INVALID (mark as historic).
     - Phrases like "one year ago", "five years ago", "back in time" = INVALID (mark as historic).

PHASE 2: DATA EXTRACTION
If the event is VALID, extract the following. If INVALID, set "is_political_violence": false and leave detail fields null.

- Incident Date: Convert "Yesterday/Last Friday" to YYYY-MM-DD.
- Location: 
    - "Spot": Specific area (e.g., "Shahbagh", "Press Club").
    - "District": Must be the English name of the 64 districts (e.g., "Dhaka", "Comilla").
- Parties: Map specific wings (e.g., "Chhatra League" -> "AL", "Chhatra Dal" -> "BNP", "Shibir" -> "Jamaat").
- Severity (1-10):
    - 1-3: Chase/Counter-chase, minor unrest.
    - 4-6: Injuries, arson, cocktail explosions.
    - 7-10: Deaths, bullet wounds, massive riots.

JSON SCHEMA:
{
  "decision_trace": {
    "recency_valid": boolean,
    "violence_type_valid": boolean,
    "is_in_bangladesh": boolean,
    "reason_for_exclusion": "Brief reason if false, otherwise null"
  },
  "is_political_violence": boolean, // TRUE only if all decision_trace flags are true
  "title": "Concise Bengali Title (max 10 words)",
  "summary": "Verified summary in Bengali. If date is mentioned as 'Monday' or 'Yesterday', calculate the EXACT date relative to ${publishedAt} (2026). DO NOT HALLUCINATE 2023 or 2024. Max 2 sentences.",
  "incident_date": "YYYY-MM-DD (If not explicitly mentioned, use the Reference Date: ${publishedAt})",
  "location": {
    "spot": "Spot Name (English or Bengali)",
    "district": "District Name (English Only)"
  },
  "incident_type": "Clash" | "Attack" | "Murder" | "Vandalism" | "Arson" | "Other",
  "casualties": {
    "killed": number, // CRITICAL WARNING: Distinguish clearly between DATES (e.g., '3rd January', '3 तारीख') and CASUALTY COUNTS. Do NOT infer casualty numbers from dates. If text says 'died on 3rd Jan', killed is 1, NOT 3.
    "injured": number,
    "estimated": boolean
  },
  "parties_involved": ["Party 1", "Party 2"],
  "severity_score": number,
  "confidence": number, // Float between 0.0 and 0.99 (MAXIMUM 99%, NEVER 1.0/100%)
  "evidence": ["Short quote 1", "Short quote 2"],
  "url": "${url}",
  "source_name": "${sourceName}"
}
`;

    // Try each API key with each model
    for (let apiKeyIndex = 0; apiKeyIndex < API_KEYS.length; apiKeyIndex++) {
        const apiKey = API_KEYS[apiKeyIndex]

        for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
            const modelName = MODELS[modelIndex]

            try {
                console.log(`   🔄 Trying API Key ${apiKeyIndex + 1}, Model: ${modelName} `)

                const genAI = new GoogleGenerativeAI(apiKey)
                const model = genAI.getGenerativeModel({ model: modelName })

                const result = await model.generateContent(prompt)
                let responseText = result.response.text()
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim()

                // Remove any text before first { and after last }
                const firstBrace = responseText.indexOf('{')
                const lastBrace = responseText.lastIndexOf('}')
                if (firstBrace !== -1 && lastBrace !== -1) {
                    responseText = responseText.substring(firstBrace, lastBrace + 1)
                }

                const parsed: AIAnalysisResult = JSON.parse(responseText)

                // 4. AI Confidence Score Cap (99%)
                if (parsed.confidence) {
                    parsed.confidence = Math.min(parsed.confidence, 0.99)
                }

                // 5. Clean AI Summary (Remove relative time)
                if (parsed.summary) {
                    const relativeWords = ["আজ", "গতকাল", "গত সোমবার", "গত মঙ্গলবার", "গত বুধবার", "গত বৃহস্পতিবার", "গত শুক্রবার", "গত শনিবার", "গত রবিবার", "আজকের", "গতকালের"];
                    let cleanSummary = parsed.summary;
                    relativeWords.forEach(word => {
                        const regex = new RegExp(word + "(\\s+|\\b)", "g");
                        cleanSummary = cleanSummary.replace(regex, "");
                    });

                    // 6. PERMANENT FIX: Enforce Year Consistency
                    // If Published Year is 2026, forcefully replace 2023/2024 in SUMMARY
                    const pubYear = publishedAt.split('-')[0]
                    if (pubYear === '2026') {
                        // Replace 2024 with 2026 in text (often a typo in source or AI hallucination for current events)
                        cleanSummary = cleanSummary.replace(/২০২৪/g, "২০২৬").replace(/2024/g, "2026");
                        // 2023 -> 2025 mappings removed as they might be risky. 
                        // Better to rely on the extracted date.
                    }

                    // Remove leading/trailing space/punctuation that might be left over
                    parsed.summary = cleanSummary.trim().replace(/^[,।\s]+/, '').trim();
                }

                console.log(`   ✅ Success with API Key ${apiKeyIndex + 1}, Model: ${modelName}`)

                // Fallback: If AI fails to extract date, use published date
                // But first check if the extracted date makes it "Old"
                if (parsed.incident_date) {
                    let incDate = new Date(parsed.incident_date);
                    const pubDate = new Date(publishedAt);

                    // 1. FUTURE DATE CLAMP (The Fix for "June" hallucination)
                    // If incident date is IN THE FUTURE relative to published date (allowing 24h buffer for timezone diffs)
                    // Then it is definitely wrong/hallucinated.
                    const oneDayBuffer = new Date(pubDate);
                    oneDayBuffer.setDate(oneDayBuffer.getDate() + 1);

                    if (incDate > oneDayBuffer) {
                        console.log(`   ⚠️ Future Date Detected: Incident (${parsed.incident_date}) > Published (${publishedAt}). Clamping to Published Date.`);
                        parsed.incident_date = publishedAt.split('T')[0];
                        incDate = new Date(parsed.incident_date); // Update for next check
                    }

                    // 2. RECENCY CHECK (Old Item Filter)
                    const diffTime = Math.abs(pubDate.getTime() - incDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    // Safety Net: if AI says it's violence but the date is > 30 days old, INVALIDATE IT.
                    // This catches cases where AI ignored the "Recency Rule" in the prompt.
                    if (diffDays > 30) {
                        console.log(`   ⚠️ Date Safety Net: Article describes event from ${parsed.incident_date} (${diffDays} days ago). Marking as NOT violence.`);
                        parsed.is_political_violence = false;
                        parsed.decision_trace.recency_valid = false;
                        parsed.decision_trace.reason_for_exclusion = `Event is ${diffDays} days old (Strict Filter)`;
                        return parsed;
                    }
                } else {
                    parsed.incident_date = publishedAt.split('T')[0]
                }

                return parsed

            } catch (error: any) {
                const errorMsg = error?.message || String(error)
                console.error(`   ❌ Failed API Key ${apiKeyIndex + 1}, Model ${modelName}: ${errorMsg.substring(0, 100)}`)

                // If quota exceeded or API error, try next combination
                if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
                    console.log(`   ⚠️  Quota exceeded, trying next API key...`)
                    break // Try next API key
                }

                // If model not found, try next model with same API key
                if (errorMsg.includes('not found') || errorMsg.includes('404')) {
                    console.log(`   ⚠️  Model not found, trying next model...`)
                    continue
                }

                // For other errors, continue to next combination
                continue
            }
        }
    }

    console.error(`   💥 All API keys and models failed`)
    return null
}

/**
 * RAG-Lite: Check if a new article matches any existing events
 */
export async function checkDuplicateWithAI(
    newArticle: { title: string, summary: string, date: string, source: string },
    candidates: { id: string, title: string, summary: string, date: Date, district: string }[]
): Promise<string | null> {
    if (candidates.length === 0) return null

    // API Keys (Reuse same keys)
    const API_KEYS = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
        process.env.GEMINI_API_KEY_6,
        process.env.GEMINI_API_KEY_7,
        process.env.GEMINI_API_KEY_8,
    ].filter(Boolean) as string[]

    const candidateList = candidates.map((c, i) =>
        `ID: ${c.id}
         Title: ${c.title}
         Summary: ${c.summary}
         Date: ${c.date.toISOString().split('T')[0]}
         District: ${c.district}`
    ).join('\n\n')

    const prompt = `
You are an expert Intelligence Analyst. Your task is to determine if a NEW report describes the SAME physical incident as any of the EXISTING events.

NEW REPORT:
Title: ${newArticle.title}
Summary: ${newArticle.summary}
Date Ref: ${newArticle.date}
Source: ${newArticle.source}

EXISTING CANDIDATE EVENTS (Same District):
${candidateList}

INSTRUCTIONS:
1. Compare the core facts: Who (Names), What (Incident Type), Where (Location), When (Time).
2. Allow for conflicting reporting on details (e.g., "Businessman" vs "Drug dealer", "3 injured" vs "5 injured").
3. Focus on the underlying EVENT. If the name (e.g., "Khokon") and fate (e.g., "Hacked/Killed") match in the same location/time, it IS the same event.
4. CRITICAL: If the VICTIMS are different people (e.g. "Schoolgirl" vs "Politician", or "Rahim" vs "Karim"), DO NOT MERGE. Return NULL.
5. If it matches, return the ID of the existing event.
6. If it is a distinct, separate incident, return NULL.

OUTPUT FORMAT:
Return ONLY the ID string of the matching event, or the word "NULL". Do not output anything else.
`

    for (const apiKey of API_KEYS) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }) // Use latest fast model

            const result = await model.generateContent(prompt)
            let text = result.response.text().trim().replace(/['"`]/g, '')

            if (text.toUpperCase().includes('NULL')) return null
            if (text.includes('ID:')) text = text.replace('ID:', '').trim()

            if (text === 'NULL') return null
            // Verify the ID exists in our candidates to be safe
            if (candidates.some(c => c.id === text)) {
                return text
            }
            return null
        } catch (e) {
            continue
        }
    }
    return null
}
