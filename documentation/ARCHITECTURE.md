# Architecture

## Overview

The Violence Tracker is a **modular monolith**: one Next.js 16 codebase contains
three logically separate concerns that share a single PostgreSQL database via
Prisma.

```
                       ┌─────────────────────────────────────────┐
                       │            PostgreSQL (Prisma)            │
                       │  PoliticalEvent · RawNewsArticle ·        │
                       │  ScraperLog · SocialMediaPost             │
                       └───────────────▲──────────────▲───────────┘
                                       │              │
          writes (events)             │              │  reads
   ┌───────────────────────────┐      │              │      ┌────────────────────────┐
   │  INGESTION (batch/cron)    │──────┘              └──────│  WEB APP (Next.js)     │
   │                            │                            │                        │
   │  scripts/crawler.ts        │                            │  app/  pages           │
   │  scripts/run_ai_pipeline   │                            │  app/api/**  JSON+file │
   │   ↳ lib/scrapers/*         │                            │  components/  UI       │
   │   ↳ lib/event-processor    │                            │  context/  i18n        │
   │   ↳ lib/ai-analysis (LLM)  │                            └───────────┬────────────┘
   │   ↳ lib/geocoding          │                                        │
   └───────────────────────────┘                                        │ HTTPS
                                                              ┌──────────▼───────────┐
                                                              │  Cloudflare CDN      │
                                                              │  → violencetracker.org│
                                                              └──────────────────────┘
```

## The three concerns

### 1. Web application (`app/`, `components/`, `context/`)
- **App Router** with a mix of Server Components (initial data via Prisma) and
  Client Components (interactive map, filters, downloads).
- **API routes** under `app/api/**` expose read-only JSON (`/api/events`,
  `/api/stats`) and file exports (`/api/download`). See [API.md](API.md).
- **i18n**: `context/LanguageContext.tsx` is the single source of truth for
  Bengali/English strings (`t(key)` + `language`), persisted to `localStorage`.
  Default language is Bengali. A duplicate `lib/LanguageContext.tsx` exists for
  legacy imports and is kept in sync — see [tech debt](SECURITY.md).
- **Layout**: `app/layout.tsx` wraps everything in `ThemeProvider` +
  `LanguageProvider`, and renders `components/ui/Sidebar.tsx` (primary nav) and
  `components/ui/Navbar.tsx` (top bar / mobile nav).

### 2. Ingestion pipeline (`scripts/`, `lib/`)
A set of Node/TSX scripts run by cron + PM2, **not** part of the HTTP server.
Full detail in [DATA_PIPELINE.md](DATA_PIPELINE.md). Summary:
`crawler.ts` (scrape) → `RawNewsArticle` → `run_ai_pipeline.ts` →
`event-processor.ts` (orchestrate) → `ai-analysis.ts` (Gemini classify + dedup)
→ `geocoding.ts` → `PoliticalEvent`.

### 3. Data layer (`prisma/`, `lib/db.ts`)
- PostgreSQL accessed only through Prisma.
- `lib/db.ts` exports a **singleton** `prisma` client (cached on `globalThis` in
  non-production) and aggregate helpers like `getStats()`.
- ⚠️ Some API routes instantiate `new PrismaClient()` directly instead of importing
  the singleton — a known inconsistency ([tech debt](SECURITY.md)).

## Request flow (read path)

1. Browser → Cloudflare → Next.js server (PM2, port 3000).
2. `middleware.ts` runs first; it gates `/admin*`, `/api/admin/*`,
   `/audit-dashboard`, `/monitor.html` behind HTTP Basic Auth.
3. Page (Server Component) queries Prisma for initial data, or a Client Component
   calls an internal `/api/*` route.
4. Export requests stream from `/api/download` (CSV/JSON streamed via DB cursor,
   Excel/GeoJSON built in memory with a row cap).

## Key cross-cutting conventions

- **Time zone**: all "today"/range logic is normalized to Bangladesh Standard Time
  (UTC+6) via helpers in `lib/utils.ts`.
- **JSON-in-string columns**: list-like fields (`politicalParties`, `tags`,
  `images`, …) are stored as JSON-encoded strings, parsed at the app layer
  (`parseList()` in `lib/download.ts`). See [DATABASE.md](DATABASE.md).
- **Caching**: data routes use `export const dynamic = 'force-dynamic'`; the site
  is otherwise cached at the Cloudflare edge.

## Why a monolith?

The project is operated by a very small team on a single VPS. Co-locating the UI,
API, and pipeline keeps deployment to one `npm run build` + `pm2 restart` and lets
all three share one Prisma schema and type set. The boundaries above are clean
enough to split into separate services later if scale demands it.
