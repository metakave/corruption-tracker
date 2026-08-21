
import { GoogleGenerativeAI } from "@google/generative-ai"
import * as dotenv from "dotenv"
dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY || ""

const articleContent = `
মাথায় গুলি করে বিএনপি নেতাকে হত্যা
যশোরে দুর্বৃত্তদের গুলিতে আলমগীর হোসেন (৫০) নামে এক বিএনপি নেতা নিহত হয়েছেন। শনিবার (৩ জানুয়ারি) সন্ধ্যা সাড়ে ৭টার দিকে যশোর শহরের শঙ্করপুর এলাকায় নয়ন কমিশনারের অফিসের সামনে এ ঘটনা ঘটে। আলমগীর শঙ্করপুর এলাকার ইন্তাজ চৌধুরীর ছেলে। তিনি যশোর পৌরসভার ৭ নাম্বার ওয়ার্ডের বিএনপির যুগ্ম সাধারণ সম্পাদক। আলমগীরের বড়ভাই জাহাঙ্গীর হোসেন জানান, শনিবার সন্ধ্যা সাড়ে ৭টার দিকে আলমগীর শঙ্করপুর এলাকায় নয়ন কাউন্সিলরের অফিসের সামনে গল্প করছিল। ওই সময় অজ্ঞাত দুর্বৃত্তরা আলমগীরের মাথার বামপাশে গুলি করে পালিয়ে যায়। পরে স্থানীয় লোকজন তাকে উদ্ধার করে চিকিৎসার জন্য যশোর জেনারেল হাসপাতালে নিয়ে যান। যশোর জেনারেল হাসপাতালের জরুরি বিভাগের চিকিৎসক বিচিত্র মল্লিক বলেন, লোকজন রক্তাক্ত অবস্থায় আলমগীরকে হাসপাতালে আনে। তার মাথায় গুলির আঘাতের চিহ্ন রয়েছে। যশোর কোতোয়ালি থানার ইন্সপেক্টর মুমিনুল হক বলেন, আমরা শুনেছি শঙ্করপুর ইসহাক সড়কে স্থানীয় বিএনপির নেতাকে গুলি করা হয়েছে। তার মাথায় গুলি লেগেছে বলে জানতে পেরেছি। পুলিশ ইতোমধ্যে ঘটনাস্থলে গিয়ে প্রকৃত ঘটনা জানতে এবং আসামি আটকে চেষ্টা করছে।
`

const publishedAt = "2026-01-03T17:43:46.880Z"
const sourceName = "Samakal"
const url = "https://example.com/killing-of-bnp-leader"

const prompt = `
You are an Industrial-Grade Intelligence Analyst for Bangladesh. Analyze the article STRICTLY for ACTIVE political/criminal violence in Bangladesh. Output ONLY valid JSON.

--- DATA CONTEXT ---
- PublishedAt: ${publishedAt} (Timezone: Asia/Dhaka)
- Source: ${sourceName}
- Url: ${url}

--- 1. RECENCY HIERARCHY (MANDATORY) ---
Reporting Date = ${publishedAt}.
1) Priority 1: Explicit Date in Text (e.g. "গত ১৮ ডিসেম্বর", "Sunday night"). Use current year (2025/2026) context.
2) Priority 2: Relative Phrases ("Today", "Yesterday", "Last Night", "Ongoing").
3) Priority 3: Ongoing verbs ("উত্তেজনা চলছে", "clashes continue").
4) Fallback: PublishedAt.
Rule: If event > 30 days old relative to Reporting Date -> is_political_violence = FALSE.

--- 2. POLITICAL ALIAS RESOLUTION ---
Resolve all wings to Parent Parties:
- BNP: [Jubo Dal, Chhatra Dal, Swechchhasebak Dal, Krishak Dal, "বিএনপির অঙ্গসংগঠন"]
- Awami League: [Chhatra League, Jubo League, Swechchhasebak League, Sramik League, Matshajibi League, "আওয়ামী লীগের সহযোগী সংগঠন"]
- Jamaat: [Jamaat-e-Islami, Shibir, Chhatra Shibir]
- Other: [Gono Odhikar Parishad, AB Party, Islami Andolon, CPB]
- State: [Police, RAB, BGB, Army, DB]

--- 3. DETERMINISTIC SEVERITY (1-10) ---
Base Score:
- 7-9: Any death (1 death=7, 2=8, 3+=9).
- 4-6: Serious injury (hospitalized), crude bombs (Koktel), firearms use, robbery/extortion with violence.
- 1-3: Scuffles, minor vandalism, threats, peaceful blockage.
Modifiers:
- +2 if firearms/explosives used.
- +1 if state actors (Police/RAB) involved.
- Max score is 10 (Mass casualties or large scale riot).

--- 4. DETERMINISTIC CONFIDENCE (0.2 - 0.95) ---
Start at 0.50.
- +0.20: Explicit incident date matches context.
- +0.15: Specific spot + District provided.
- +0.10: Direct quotes from Police/Hospital/Eyewitness.
- -0.20: Vague language ("Reportedly", "Allegedly", "rumored").
- -0.20: Single unverified source.

--- 5. RULES & SAFEGUARDS ---
- Multi-Incident: Return array ONLY if events have distinct dates OR districts. Ignore non-Bangladesh incidents.
- No-Inference: Titles/Summaries must be fact-only. No "political rivalry" guesses.
- Summary: MUST include the incident date in Bengali (e.g. "গত ১৮ ডিসেম্বর এই ঘটনা ঘটে...").
- District: Must match one of 64 districts. Else "Unknown".

--- OUTPUT SCHEMA ---
{
  "decision_trace": { "location_valid": bool, "recency_valid": bool, "violence_type_valid": bool, "is_in_bangladesh": bool, "recency_logic": "string" },
  "is_political_violence": bool,
  "incident_type": "Clash"|"Attack"|"Shooting"|"Stabbing"|"Bombing"|"Arson"|"Vandalism"|"Mob Violence"|"Custodial Death"|"Discovery of Body"|"None",
  "title": "Bengali Title",
  "summary": "Bengali Summary with date",
  "location": { "spot": "spot name", "district": "District", "raw_location_match": "string" },
  "incident_date": "YYYY-MM-DD"|null,
  "raw_date_phrase": "original text date",
  "casualties": { "killed": num, "injured": num, "estimated": bool },
  "parties_involved": ["Parent Party Only"],
  "raw_party_matches": ["Original terms used"],
  "severity_score": num (1-10),
  "evidence": ["police statement", "hospital", "media eyewitness", "unverified"],
  "confidence": num (0.2-0.95),
  "extraction_warnings": ["List of ambiguities"],
  "url": "${url}",
  "source_name": "${sourceName}"
}

If multiple_incidents is true:
{
  "multiple_incidents": true,
  "incidents": [{ same incident object as above for each incident }],
  "confidence": number(0.20-0.95)
}

--- BE CONSERVATIVE & SAFE ---
- If unsure whether the event occurred within Bangladesh or within last 30 days, mark is_political_violence = FALSE.
- Do NOT invent district names, casualty numbers, or parties.
- Keep Bengali summary brief and non-graphic; avoid emotionally charged or inflammatory wording.
- Output only valid JSON and nothing else.

ARTICLE CONTENT:
${articleContent}
`

async function test() {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    console.log("Sending prompt to Gemini...")
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
        .replace(/`|json/g, '')
        .trim()

    console.log("--- AI RESPONSE ---")
    console.log(responseText)
}

test().catch(console.error)
