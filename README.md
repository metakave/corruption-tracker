# Bangladesh Violence Tracker

Real-time monitoring of political and social violence in Bangladesh. The platform
scrapes major Bengali news outlets, uses an LLM to classify and structure each
incident, geocodes it, and publishes a searchable, mappable, multilingual dataset
at **[violencetracker.org](https://violencetracker.org)**.

> **Status:** Production. The public site is live; the AI processing pipeline is
> currently rate-limited by Gemini free-tier quota (see the
> [runbook](documentation/DEPLOYMENT.md#runbook)).

---

## What it does

1. **Ingest** — Puppeteer-based scrapers pull the latest articles from major
   Bengali news sources several times a day.
2. **Classify** — Each article is sent to Google Gemini, which decides whether it
   describes real violence, extracts structured fields (location, casualties,
   parties, severity, category), and filters out noise (accidents, old news,
   fiction, simple arrests).
3. **Deduplicate & geocode** — Follow-up reports are merged into existing
   incidents; districts are resolved to coordinates from a local gazetteer.
4. **Publish** — Verified incidents power a dashboard, interactive map, analytics,
   a searchable table, a research-grade export tool, and monthly reports — all
   bilingual (বাংলা / English).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| Styling | Tailwind CSS v4 · Radix UI primitives · lucide-react |
| Data | PostgreSQL · Prisma 5 ORM |
| AI | Google Gemini (`@google/generative-ai`) |
| Scraping | Puppeteer (+ stealth) · Cheerio · proxy rotation |
| Maps & charts | Leaflet (+ heat) · Chart.js |
| Hosting | Single VPS · PM2 process manager · Cloudflare CDN |

The application is a **single Next.js codebase** that serves the UI, the public
JSON/file APIs, and (via standalone scripts) the background ingestion pipeline.

## Repository layout

```
app/                 Next.js App Router — pages + API routes (app/api/**)
components/           React components (Sidebar, Navbar, Map, data-table, …)
context/             React context providers (LanguageContext = i18n source of truth)
lib/                 Core logic: db, ai-analysis, event-processor, geocoding,
                       scrapers/, download, services/
prisma/              schema.prisma + migrations/
scripts/             Pipeline entrypoints (run_ai_pipeline.ts), data-fix & ops scripts
public/              Static assets, photocards
documentation/       Architecture, API, DB, deployment, security docs
```

> **Note for reviewers:** several legacy duplicate files exist at the repo root
> (e.g. `layout.tsx`, `Map.tsx`, `about/`, `admin/`) that mirror their canonical
> versions under `app/` and `components/`. They are not imported by the running
> app and are tracked as tech debt — see [SECURITY & tech debt](documentation/SECURITY.md).

## Quick start

```bash
# 1. Install
npm install

# 2. Configure (see documentation/DEVELOPMENT.md for all vars)
cp .env.example .env          # then fill DATABASE_URL, GEMINI_API_KEY_1..8, …

# 3. Database
npx prisma generate
npx prisma migrate deploy

# 4. Run
npm run dev                   # http://localhost:3000
```

Run the ingestion pipeline manually:

```bash
npm run pipeline              # tsx scripts/run_ai_pipeline.ts (processes backlog)
npx tsx scripts/crawler.ts    # full scrape of all sources
```

## Documentation

| Doc | Contents |
|---|---|
| [ARCHITECTURE](documentation/ARCHITECTURE.md) | System design, components, request & data flow |
| [DATA_PIPELINE](documentation/DATA_PIPELINE.md) | Scrape → AI → dedup → geocode → store |
| [DATABASE](documentation/DATABASE.md) | Prisma schema, models, relations, conventions |
| [API](documentation/API.md) | All public & admin HTTP endpoints |
| [DEVELOPMENT](documentation/DEVELOPMENT.md) | Local setup, env vars, scripts |
| [DEPLOYMENT](documentation/DEPLOYMENT.md) | Production topology, deploy steps, runbook |
| [ML_CARD](documentation/ML_CARD.md) | Model card for the Gemini classifier |
| [SECURITY](documentation/SECURITY.md) | Auth, secrets, known risks & tech debt |
| [CONTRIBUTING](documentation/CONTRIBUTING.md) | Conventions, workflow, code style |

## License

Proprietary — © Bangladesh Violence Tracker. All rights reserved.
>>>>>>> aa427a4 (Fix process is not defined ReferenceError in layout Clarity script)
