import { GoogleGenerativeAI } from '@google/generative-ai'

const MODELS = [
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
];

let globalKeyIndex = 0;

export interface AccusedEntity {
    name: string
    designation?: string
    organization?: string
    role_category?: string // politician, bureaucrat, businessman, banker, police_admin, other
}

export interface AIAnalysisResult {
    decision_trace: {
        location_valid: boolean
        recency_valid: boolean
        corruption_type_valid: boolean
        is_in_bangladesh: boolean
        reason_for_exclusion?: string
    }
    is_corruption: boolean
    title: string
    summary: string
    location: {
        spot: string
        district: string
        raw_location_match?: string
    }
    incident_date: string | null
    raw_date_phrase?: string
    
    // Corruption Specific Fields
    financial_impact: {
        amount_bdt: number | null        // Full numeric value (e.g. 500000000)
        amount_crores: number | null     // Amount in Crores (e.g. 50.0)
        amount_formatted: string         // e.g. "৳৫০ কোটি"
        estimated: boolean
    }
    accused_entities: AccusedEntity[]
    sector_or_ministry: string          // e.g. "স্বাস্থ্য", "ব্যাংকিং", "সড়ক ও সেতু"
    investigating_agency: string        // e.g. "দুদক (ACC)", "সিআইডি (CID)", "আদালত"
    legal_status: string                // "allegation", "inquiry", "chargesheet", "arrest", "trial", "convicted", "acquitted"
    
    category: string                    // "Embezzlement", "Bribery", "Money Laundering", "Tender Fraud", "Loan Scam", "Illegal Wealth", "Power Abuse", "Land Grabbing", "Other"
    tags: string[]
    severity_score: number              // 1-10 scale based on monetary loss and impact
    confidence: number                  // 0.00 - 0.99
    evidence: string[]
    category_reasoning: string
    extraction_warnings: string[]
    url: string
    source_name: string
    failure_reason?: string
}

export async function analyzeWithAI(
    articleText: string,
    title: string,
    url: string,
    publishedAt: string,
    sourceName: string
): Promise<AIAnalysisResult | null> {
    if (!publishedAt) {
        publishedAt = new Date().toISOString().split('T')[0]
    }

    const API_KEYS = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
        process.env.GEMINI_API_KEY_6,
        process.env.GEMINI_API_KEY_7,
        process.env.GEMINI_API_KEY_8,
        process.env.GEMINI_API_KEY,
    ].filter(Boolean) as string[]

    let lastError = ''

    const prompt = `
You are a Senior Anti-Corruption & Financial Crime Intelligence Analyst for the "Bangladesh Corruption Tracker" (বাংলাদেশ দুর্নীতি ট্র্যাকার).
Your task is to analyze Bengali/English newspaper articles and extract structured, verified intelligence on incidents of corruption, financial crimes, embezzlement, and institutional irregularities in Bangladesh.

INPUT CONTEXT:
- Reference Date (Today): ${publishedAt}
- News Source: ${sourceName}
- Article URL: ${url}
- Article Title: ${title}
- Article Text: 
"""
${articleText}
"""

STRICT OUTPUT RULES:
1. Output ONLY valid, parsable JSON without markdown wrapping or code blocks.
2. Comply strictly with the JSON schema described below.

PHASE 1: FILTERING & VALIDATION
Determine if the article describes genuine corruption in Bangladesh:
INCLUDES:
- Public Fund Embezzlement & Misappropriation (সরকারি তহবিল আত্মসাৎ/লুটপাট)
- Bribery & Kickbacks (ঘুষ লেনদেন ও কমিশন বাণিজ্য)
- Money Laundering, Capital Flight & Hundi (অর্থপাচার, হুন্ডি, বিদেশে সম্পদ স্থানান্তর)
- Tender Manipulation & Procurement Irregularities (টেন্ডার কারচুপি, কেনাকাটায় ভুয়া বিল ও অনিয়ম)
- Banking Frauds, Loan Scams & Forged Letters of Credit (ব্যাংক ঋণ কেলেঙ্কারি, ভুয়া ঋণ, আর্থিক জালিয়াতি)
- Illegal & Unaccounted Wealth Accumulation (জ্ঞাত আয়বহির্ভূত সম্পদ, অবৈধ সম্পদ অর্জন)
- Land Grabbing & Property Deed Forgery by officials/influential persons (ভূমি দখল ও দলিল জালিয়াতি)
- Abuse of Official Power & Nepotism (ক্ষমতার অপব্যবহার ও স্বজনপ্রীতি)
- Anti-Corruption Commission (ACC/দুদক) actions, inquiries, chargesheets, assets freezing, or court trials related to graft.

EXCLUDES:
- General violent crime or theft/robbery with no corruption element.
- Regular traffic fines or non-corruption civil disputes.
- Political speeches/statements without specific corruption allegations/cases.
- International news outside Bangladesh.
- Historical articles describing events from years ago without new developments.

PHASE 2: DATA EXTRACTION
Extract:
1. Financial Impact:
   - amount_bdt: exact or approximate total in BDT as a number (e.g., 50000000 for 5 crore). If unknown, null.
   - amount_crores: number in crores (e.g. 5.0). If unknown, null.
   - amount_formatted: display string in Bengali e.g. "৳৫০ কোটি", "৳৮০ লক্ষ", or "অজানা".
2. Accused Entities: List of accused individuals, public officials, politicians, businessmen, or organizations.
3. Sector/Ministry: E.g., "স্বাস্থ্য" (Health), "ব্যাংকিং ও অর্থ" (Banking/Finance), "সড়ক ও সেতু" (Roads & Bridges), "শিক্ষা" (Education), "ভূমি ও গৃহায়ণ" (Land & Housing), "কাস্টমস ও রাজস্ব (এনবিআর)" (Customs/NBR), "পুলিশ ও প্রশাসন" (Police/Admin), "বিদ্যুৎ ও জ্বালানি" (Power/Energy), "রেলওয়ে" (Railways), "অন্যান্য" (Other).
4. Investigating Agency: E.g., "দুদক (ACC)", "সিআইডি (CID)", "আদালত (Court)", "বিএফআইইউ (BFIU)", "বিভাগীয় কমিটি" (Departmental Committee), "অন্যান্য".
5. Legal Status: One of "allegation", "inquiry", "investigation", "chargesheet", "arrest", "trial", "convicted", "acquitted".
6. Severity Score (1-10):
   - 1-3: Local petty corruption, small bribe (< 10 Lakh BDT).
   - 4-6: Significant institutional corruption, tender fraud (10 Lakh to 10 Crore BDT).
   - 7-10: Massive scam, high-level political/bureaucratic looting (> 10 Crore BDT, systemic damage).
7. Location: Spot and District (one of Bangladesh's 64 districts in English, e.g., "Dhaka", "Chittagong", "Sylhet").
8. Summary: Clear, factual summary in Bengali without relative time phrases.

JSON OUTPUT SCHEMA:
{
  "decision_trace": {
    "location_valid": boolean,
    "recency_valid": boolean,
    "corruption_type_valid": boolean,
    "is_in_bangladesh": boolean,
    "reason_for_exclusion": string | null
  },
  "is_corruption": boolean,
  "title": string,
  "summary": string,
  "location": {
    "spot": string,
    "district": string
  },
  "incident_date": "YYYY-MM-DD" | null,
  "financial_impact": {
    "amount_bdt": number | null,
    "amount_crores": number | null,
    "amount_formatted": string,
    "estimated": boolean
  },
  "accused_entities": [
    {
      "name": string,
      "designation": string,
      "organization": string,
      "role_category": "politician" | "bureaucrat" | "banker" | "businessman" | "police_admin" | "other"
    }
  ],
  "sector_or_ministry": string,
  "investigating_agency": string,
  "legal_status": string,
  "category": "Embezzlement" | "Bribery" | "Money Laundering" | "Tender Fraud" | "Loan Scam" | "Illegal Wealth" | "Power Abuse" | "Land Grabbing" | "Other",
  "tags": string[],
  "severity_score": number,
  "confidence": number,
  "evidence": string[],
  "category_reasoning": string,
  "extraction_warnings": string[]
}
`;

    if (API_KEYS.length === 0) {
        console.warn("⚠️ No Gemini API keys configured. Set GEMINI_API_KEY_1..8 in .env");
        return null;
    }

    // Try keys with round-robin rotation
    for (let k = 0; k < API_KEYS.length; k++) {
        const keyIndex = (globalKeyIndex + k) % API_KEYS.length;
        const currentKey = API_KEYS[keyIndex];

        for (const modelName of MODELS) {
            try {
                const genAI = new GoogleGenerativeAI(currentKey);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json",
                    }
                });

                const rawText = result.response.text();
                const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed: AIAnalysisResult = JSON.parse(cleanJson);

                parsed.url = url;
                parsed.source_name = sourceName;
                if (parsed.confidence > 0.99) parsed.confidence = 0.99;

                globalKeyIndex = keyIndex; // Remember working key
                return parsed;
            } catch (err: any) {
                lastError = err.message || String(err);
                if (lastError.includes('429') || lastError.includes('quota') || lastError.includes('RESOURCE_EXHAUSTED')) {
                    console.warn(`⏳ Key index ${keyIndex} exhausted. Trying next key.`);
                    break;
                }
            }
        }
    }

    console.error(`❌ AI Analysis failed across all keys/models. Last error: ${lastError}`);
    return null;
}

export async function checkDuplicateWithAI(
    newTitle: string,
    newSummary: string,
    existingTitle: string,
    existingSummary: string
): Promise<boolean> {
    const API_KEY = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
    if (!API_KEY) return false;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const prompt = `
Compare these two corruption/graft news reports and determine if they describe the SAME core corruption case, investigation, or scam in Bangladesh (even if one is an update, remand, inquiry, or court verdict of the other).

Report A:
Title: ${newTitle}
Summary: ${newSummary}

Report B:
Title: ${existingTitle}
Summary: ${existingSummary}

Respond ONLY with valid JSON:
{ "is_same_incident": true/false, "reason": "brief reason" }
`;

        const res = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.0, responseMimeType: "application/json" }
        });

        const data = JSON.parse(res.response.text());
        return data.is_same_incident === true;
    } catch {
        return false;
    }
}
