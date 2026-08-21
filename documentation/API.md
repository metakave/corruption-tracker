# API Reference

All endpoints are Next.js App Router route handlers under `app/api/**`.
Base URL: `https://violencetracker.org` (locally `http://localhost:3000`).

- **Public** endpoints need no auth.
- **Admin** endpoints (`/api/admin/*`) require HTTP Basic Auth, enforced by
  [`middleware.ts`](../middleware.ts). See [SECURITY.md](SECURITY.md).
- Data routes are `dynamic = 'force-dynamic'` (never statically cached at build).

---

## Public

### `GET /api/events`
Paginated, filterable list of published incidents (`isPoliticalViolence = true`).

| Query param | Type | Description |
|---|---|---|
| `search` | string | full-text over title/summary (with party-alias expansion) |
| `district` | string | filter by district |
| `minSeverity` / `maxSeverity` | int | severity range |
| `type` | string | incident type / category |
| `source` | string | news source |
| `startDate` / `endDate` | `YYYY-MM-DD` | date range |
| `page` / `limit` | int | pagination (default page 1) |

Returns `{ events: [...], total, page, limit }` (shape per route).

### `GET /api/stats`
Homepage summary: total incidents, today's count, party groupings, deadliest event
(last 7 days), highest-risk district. No params; uses BST date logic.

### `GET /api/download`
Streaming/file export. Full contract in [the download section](#download-api).

### `GET /api/download/options`
Filter metadata for the export UI: `{ districts[], categories[], sources[],
parties[], counts: { events, raw, rawUnprocessed } }`.

### `GET /api/export-csv`
Quick one-shot CSV of all events (legacy; superseded by `/api/download`).

### `GET /api/scraper-stats`
Recent scraper-run metrics (from `ScraperLog`).

### Social (content generation)
- `POST /api/social/generate` — generate a Facebook caption/photocard for an event
- `POST /api/social/approve` — approve a queued post
- `POST /api/social/reject` — reject / regenerate

---

## Admin (HTTP Basic Auth)

Protected prefixes: `/admin-db`, `/admin-logs`, `/audit-dashboard`,
`/api/admin/*`, `/monitor.html`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/analysis` | Full analysis across all rows (not just published) |
| GET | `/api/admin/events/[id]` | Single event by id |
| POST/GET | `/api/admin/export` | Full database export |
| POST/GET | `/api/admin/export-logs` | Export audit/scraper logs |

---

## Download API

`GET /api/download` — exports data as a file attachment.

### Parameters

| Param | Values | Applies to |
|---|---|---|
| `dataset` | `events` (default) · `raw` · `stats` · `audit` | — |
| `format` | `csv` (default) · `xlsx` · `json` · `geojson` | `geojson`: events only |
| `from`, `to` | `YYYY-MM-DD` | all (filters `publishedAt`) |
| `district`, `category`, `party` | string | events, stats |
| `minKilled`, `minSeverity` | int | events, stats (`minSeverity` API-only) |
| `source` | string | raw, audit |
| `processed` | `processed` · `unprocessed` | raw, audit |
| `by` | `day` (default) · `category` · `district` | stats |
| `cols` | comma-separated column keys | events, raw, audit |

### Datasets

- **`events`** — verified incidents. Includes an **`aiReasoning`** column: a
  data-grounded explanation of the accept decision (confidence, severity,
  casualties, parties, basis) synthesized from stored fields (no live AI call).
- **`raw`** — the full raw-article corpus (132k+ rows).
- **`stats`** — aggregated counts (events/killed/injured) grouped by `by`.
- **`audit`** — **accept/reject decision audit**: every raw article joined to its
  published event, with a `decision` (`Published` / `Processed — not published` /
  `Pending`) and an AI `reasoning` string.

### Performance & limits
- `raw`/`audit` CSV and JSON are **streamed via an `id` cursor** → constant memory
  regardless of size.
- `xlsx`/`geojson` are built in memory and **capped at 50,000 rows**; when the cap
  is hit the response carries an `X-Row-Cap: 50000` header.
- Excel is emitted as **SpreadsheetML XML** (`.xls`) — opens natively in
  Excel/LibreOffice, no server-side dependency.

### Examples
```
/api/download?dataset=events&format=geojson&cols=id,district,killed
/api/download?dataset=audit&format=csv&from=2026-06-01&to=2026-06-27
/api/download?dataset=stats&format=xlsx&by=district
/api/download?dataset=raw&format=csv&source=Prothom%20Alo&processed=unprocessed
```
