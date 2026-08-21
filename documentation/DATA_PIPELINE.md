# Data Pipeline

How a raw news article becomes a verified, mappable incident.

```
 cron / PM2
     │
     ▼
 scripts/crawler.ts ──► lib/scrapers/*  (Puppeteer + stealth + proxy rotation)
     │                       scrapes: Ajker Patrika, Prothom Alo, Jugantor,
     │                       Samakal, Dhaka Post (+ others, some disabled)
     ▼
 RawNewsArticle  (isProcessed = false)        ◄── upsert by unique url
     │
     ▼
 scripts/run_ai_pipeline.ts  (npm run pipeline)
     │   fetch where isProcessed = false, newest first
     ▼
 lib/event-processor.ts  processArticle()
     │  1. URL/section filters (skip sports, world, opinion…)
     │  2. fetch full body (Puppeteer) if not already present
     ▼
 lib/ai-analysis.ts  analyzeWithAI()          ◄── Google Gemini
     │  decides violence? extracts location, casualties, parties,
     │  severity (1–10), category (6 types), confidence (≤0.99)
     ▼
 lib/ai-analysis.ts  checkDuplicateWithAI()  +  string-similarity heuristics
     │  merge follow-ups / duplicate reports into existing events
     ▼
 lib/geocoding.ts  geocodeLocation()          ◄── local district gazetteer
     │  district/spot → { lat, lng, englishDistrict }
     ▼
 PoliticalEvent  (created or updated)  ──► mark RawNewsArticle.isProcessed = true
```

## Stages in detail

### 1. Scrape (`lib/scrapers/*.ts`)
- One class per source (`SamakalScraper`, `ProthomAloScraper`, `JugantorScraper`,
  `AjkerPatrikaScraper`, `DhakaPostScraper`, …).
- Uses **Puppeteer** with the stealth plugin and **rotating proxies**
  (`lib/scrapers/proxies.ts`) to avoid blocks; Ajker Patrika also uses a JSON API.
- Each scraper parses that source's Bengali/relative date format.
- Output: `{ url, title, time, source, content?, images? }[]`.
- `scripts/crawler.ts` orchestrates the run and writes a `ScraperLog` row.

### 2. Store raw (`lib/event-processor.ts → processArticleMetadata`)
- `prisma.rawNewsArticle.upsert({ where: { url } })` — URL is the dedupe key.
- New rows start `isProcessed = false` → this **is** the backlog.

### 3. Classify (`lib/ai-analysis.ts → analyzeWithAI`)
- Model: **Google Gemini**, primary `gemini-flash-latest` with fallbacks
  `gemini-2.0-flash-lite`, `gemini-2.5-flash` (see [ML_CARD.md](ML_CARD.md)).
- **8-key rotation**: `GEMINI_API_KEY_1..8` (+ `GEMINI_API_KEY` fallback). On a 429
  quota error the code advances to the next key; on 404 it tries the next model;
  on exhaustion it sleeps 65 s and throws (the article stays in the backlog).
- The prompt runs a 3-phase analysis: **filter** (recency ≤14 days, real violence,
  in Bangladesh), **extract** (date, location, casualties, parties, severity), and
  **categorize** into one of: Political Violence, Criminal Violence,
  Mob Justice / Lynchings, Gender-Based Violence, Terrorism / Extremist Attacks,
  Communal / Religious Violence.
- Output is strict JSON; the app applies safety post-processing (confidence capped
  at 0.99, future/old dates clamped, relative-time words stripped from summaries).

### 4. Deduplicate (`lib/ai-analysis.ts` + `lib/event-processor.ts`)
- Candidate events = same district within a 3–7 day window, plus title-keyword
  matches for long-tail follow-ups (arrest, court, remand…).
- `checkDuplicateWithAI()` asks the model if two reports describe the **same**
  physical incident; heuristics (`string-similarity` Levenshtein on title/spot,
  Jaccard on summary, party overlap) provide a fallback.
- On a match, the new source is appended to the event's `additionalSources` and no
  new event is created.

### 5. Geocode (`lib/geocoding.ts`)
- A built-in gazetteer of all 64 districts (Bengali + English + variations +
  upazilas) maps a location string to `{ lat, lng, district }`.
- Falls back to the Dhaka centroid when nothing matches.

### 6. Persist
- `prisma.politicalEvent.create/update` writes the structured incident; list fields
  are `JSON.stringify`-ed. The source article is marked `isProcessed = true`.

## The backlog (`isProcessed`)

`RawNewsArticle.isProcessed` is the queue flag. Articles are collected by the
scraper continuously but only become events when the pipeline processes them.
When Gemini quota is exhausted the backlog grows — this is the system's main
operational bottleneck. Inspect it with:

```sql
SELECT count(*) FROM "RawNewsArticle" WHERE "isProcessed" = false;  -- backlog size
```

## Scheduling

- **PM2** (`ecosystem.config.js`): `auto-scraper` runs `scripts/crawler.ts` on
  `cron_restart: '0 5,8,13,17 * * *'` (UTC) = 11:00, 14:00, 19:00, 23:00 BST.
- **crontab** (`crontab.txt`) additionally calls `run_scheduler.sh` on the same
  windows plus daily `maintain.sh` and `backup_db.sh`.
- Manual: `npm run pipeline` (drain backlog) or `npx tsx scripts/crawler.ts`.
