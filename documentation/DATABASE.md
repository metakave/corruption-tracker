# Database

- **Engine:** PostgreSQL
- **ORM:** Prisma 5 (`prisma-client-js`, binary targets `native` +
  `debian-openssl-3.0.x`)
- **Connection:** `DATABASE_URL` env var
- **Schema:** [`prisma/schema.prisma`](../prisma/schema.prisma)
- **Migrations:** `prisma/migrations/` (`init_pg_fresh` → `add_scraper_log` →
  `add_category_field`)
- **Client:** singleton in [`lib/db.ts`](../lib/db.ts) (cached on `globalThis`
  outside production)

## Models

### `PoliticalEvent` — a verified incident (the primary published entity)

| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | PK |
| `title` | String | |
| `url` | String | **unique** — dedupe / idempotency key |
| `source` | String | default `"Prothom Alo"` |
| `additionalSources` | String? | JSON array of merged-duplicate sources |
| `publishedAt` | DateTime | article publish time |
| `dateOfIncident` | DateTime? | when the incident occurred |
| `locationText`, `district` | String? | resolved location |
| `latitude`, `longitude` | Float? | geocoded coordinates |
| `politicalParties` | String? | **JSON-encoded** array |
| `victimParties`, `perpetratorParties`, `actors` | String? | **JSON-encoded** arrays |
| `injured`, `killed` | Int? | casualty counts |
| `affectedInfrastructure` | String? | **JSON-encoded** |
| `summary` | String? | Bengali summary (no relative time) |
| `severityScore` | Int? | 1–10 |
| `confidence` | Float? | 0.0–0.99 (model confidence) |
| `tags`, `images` | String? | **JSON-encoded** arrays |
| `category` | String | default `"other"`; one of the 6 categories |
| `rawText` | String? | first ~1000 chars of source body |
| `isBangladesh` | Boolean | default `true` |
| `isPoliticalViolence` | Boolean | default `false`; **true = published** to public views |
| `createdAt` / `updatedAt` | DateTime | `@default(now())` / `@updatedAt` |
| `socialMediaPosts` | SocialMediaPost[] | relation (cascade delete) |

> Public-facing queries filter on `isPoliticalViolence = true`. The admin views show
> all rows regardless of this flag.

### `RawNewsArticle` — scraped source article (ingestion queue)

| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | PK — used as the streaming cursor in exports |
| `url` | String | **unique** |
| `title`, `content` | String | |
| `publishedAt` | DateTime | |
| `scrapedAt` | DateTime | `@default(now())` |
| `isProcessed` | Boolean | default `false` — **the backlog flag** |
| `source` | String | default `"Unknown"` |

### `ScraperLog` — one row per crawl run

`id`, `runId` (unique), `startTime`, `endTime?`, `status`, `sourcesScraped?`,
`totalArticles`, `newArticles`, `duplicates`, `violenceDetected`, `errors?`,
`createdAt`.

### `SocialMediaPost` — generated Facebook photocards

`id` (cuid), `eventId` (FK → PoliticalEvent, cascade), `photocardUrl`, `caption`
(`@db.Text`), `theme`, `status` (enum), review/schedule/post timestamps,
`facebookPostId?`, engagement metrics (`likes`/`shares`/`comments`/`reach`).
Indexed on `eventId`, `status`, `createdAt`.

**Enum `PostStatus`:** `PENDING · APPROVED · REJECTED · POSTED · FAILED · SCHEDULED`.

## Conventions & gotchas

- **JSON-in-string columns.** List fields are stored as JSON strings, not native
  arrays/`Json` columns (a SQLite-era legacy carried into Postgres). Always parse
  with a guarded helper — see `parseList()` in [`lib/download.ts`](../lib/download.ts):

  ```ts
  function parseList(v: string | null): string {
    if (!v) return ''
    try { const p = JSON.parse(v); return Array.isArray(p) ? p.join('; ') : v }
    catch { return v }
  }
  ```

- **`url` is the idempotency key** on both `PoliticalEvent` and `RawNewsArticle`;
  ingestion upserts on it.
- **Accept/reject audit** joins `RawNewsArticle.url → PoliticalEvent.url`:
  match = *Published*, processed-without-match = *filtered or merged*, unprocessed
  = *Pending*. See [`/api/download?dataset=audit`](API.md).

## Common queries

```sql
-- backlog size
SELECT count(*) FROM "RawNewsArticle" WHERE "isProcessed" = false;

-- published incidents by category
SELECT category, count(*) FROM "PoliticalEvent"
WHERE "isPoliticalViolence" = true GROUP BY 1 ORDER BY 2 DESC;

-- raw coverage per day
SELECT "publishedAt"::date d, count(*) FROM "RawNewsArticle" GROUP BY 1 ORDER BY 1 DESC;
```

## Migrations

```bash
npx prisma migrate dev --name <change>   # create + apply locally
npx prisma migrate deploy                # apply in production
npx prisma generate                      # regenerate the client after schema edits
```
