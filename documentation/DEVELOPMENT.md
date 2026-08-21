# Development

## Prerequisites
- Node.js ≥ 20
- PostgreSQL ≥ 14 (local or remote)
- npm (the project uses `package-lock.json`)

## Setup

```bash
git clone <repo> && cd political_violence_tracker
npm install
cp .env.example .env            # fill in the variables below
npx prisma generate
npx prisma migrate deploy       # or: migrate dev (creates the schema)
npm run dev                     # http://localhost:3000
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `GEMINI_API_KEY_1` … `GEMINI_API_KEY_8` | ✅ (≥1) | Gemini keys; the pipeline rotates through them on quota errors |
| `GEMINI_API_KEY` | optional | fallback key used after `_1..8` |
| `FACEBOOK_PAGE_ID` | optional | Facebook page for social posting |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | optional | Facebook Graph API token |
| `NEXT_PUBLIC_URL` | optional | base URL for server-side fetches (default `http://localhost:3000`) |
| `NEXT_PUBLIC_CLARITY_ID` | optional | Microsoft Clarity analytics id |
| `NODE_ENV` | auto | `development` / `production` |
| `PORT`, `HOSTNAME`, `KEEP_ALIVE_TIMEOUT` | optional | used by `server.js` in production |

> Secrets live only in `.env*`, which is git-ignored. Never hardcode keys. See
> [SECURITY.md](SECURITY.md).

## npm scripts

| Script | Command | Use |
|---|---|---|
| `npm run dev` | `next dev` | local dev server |
| `npm run build` | `next build` | production build |
| `npm run start` | `next start` | serve the production build |
| `npm run lint` | `eslint` | lint |
| `npm run pipeline` | `tsx scripts/run_ai_pipeline.ts` | process the ingestion backlog |

## Useful pipeline commands

```bash
npx tsx scripts/crawler.ts        # full scrape of all sources
npm run pipeline                  # classify unprocessed RawNewsArticle rows
```

## Project conventions
- **TypeScript everywhere**; avoid `any`.
- **i18n**: never hardcode user-facing strings — add a key to
  `context/LanguageContext.tsx` (and the legacy `lib/LanguageContext.tsx`) and use
  `t('key')`. Provide both `bn` and `en`.
- **DB access** through Prisma; prefer importing the singleton from `lib/db.ts`.
- **Dates**: use the BST helpers in `lib/utils.ts` for any "today"/range logic.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the full checklist.

## Notes & caveats
- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so type errors do
  **not** fail the production build — run `tsc`/`eslint` yourself before shipping.
- Tailwind CSS is **v4** (config via `@tailwindcss/postcss`, not a JS config file).
- Puppeteer is marked as a server-external package; scraping only runs server-side.
