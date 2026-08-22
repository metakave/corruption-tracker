import { callOpenRouter } from './openrouter'

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

function safeParseJSON<T>(text: string): T {
    let clean = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
    try {
        return JSON.parse(clean)
    } catch {
        // Fix bad unicode or invalid escape characters commonly outputted by LLMs
        clean = clean
            .replace(/\\u(?![0-9a-fA-F]{4})/gi, '\\\\u')
            .replace(/\\[^"\\\/bfnrtu]/g, (match) => match.slice(1))
        
        const firstBrace = clean.indexOf('{')
        const lastBrace = clean.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1) {
            clean = clean.substring(firstBrace, lastBrace + 1)
        }
        return JSON.parse(clean)
    }
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

    const systemPrompt = `You are a Senior Anti-Corruption & Financial Crime Intelligence Analyst for the "Bangladesh Corruption Tracker" (বাংলাদেশ দুর্নীতি ট্র্যাকার).
Your task is to analyze Bengali/English newspaper articles and extract structured, verified intelligence on incidents of corruption, financial crimes, embezzlement, and institutional irregularities in Bangladesh.

STRICT OUTPUT RULES:
1. Output ONLY valid, parsable JSON without markdown wrapping or code blocks.
2. Comply strictly with the JSON schema.

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
}`

    const userPrompt = `INPUT CONTEXT:
- Reference Date (Today): ${publishedAt}
- News Source: ${sourceName}
- Article URL: ${url}
- Article Title: ${title}
- Article Text: 
"""
${articleText}
"""`

    try {
        const responseText = await callOpenRouter([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], {
            responseFormatJson: true,
            temperature: 0.1,
            timeoutMs: 45000
        })

        const parsed: AIAnalysisResult = safeParseJSON<AIAnalysisResult>(responseText)

        parsed.url = url
        parsed.source_name = sourceName
        if (parsed.confidence > 0.99) parsed.confidence = 0.99

        return parsed
    } catch (err: any) {
        console.error(`❌ OpenRouter AI Analysis failed for URL ${url}:`, err.message || err)
        return null
    }
}

export async function checkDuplicateWithAI(
    newTitle: string,
    newSummary: string,
    existingTitle: string,
    existingSummary: string
): Promise<boolean> {
    try {
        const prompt = `Compare these two corruption/graft news reports and determine if they describe the SAME core corruption case, investigation, or scam in Bangladesh (even if one is an update, remand, inquiry, or court verdict of the other).

Report A:
Title: ${newTitle}
Summary: ${newSummary}

Report B:
Title: ${existingTitle}
Summary: ${existingSummary}

Respond ONLY with valid JSON:
{ "is_same_incident": true/false, "reason": "brief reason" }`

        const responseText = await callOpenRouter([
            { role: 'user', content: prompt }
        ], {
            responseFormatJson: true,
            temperature: 0.0,
            timeoutMs: 30000
        })

        const data = safeParseJSON<{ is_same_incident?: boolean }>(responseText)
        return data?.is_same_incident === true
    } catch {
        return false
    }
}
