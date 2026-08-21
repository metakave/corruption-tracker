# Changelog

## 2026-06-27 — Documentation, Source-of-Truth Sync, AI Decision Reasoning

- **Documentation overhaul** (`documentation/`): added ARCHITECTURE, DATA_PIPELINE, DATABASE, DEVELOPMENT, DEPLOYMENT, ML_CARD, SECURITY, CONTRIBUTING and a real root `README.md`; rewrote API.md for this project; removed unrelated/legacy content.
- **Source-of-truth sync:** adopted the live server's real `package.json`/`package-lock.json` (Next 16.1.1, React 19.2.3, Prisma 5.22, Tailwind 4) and config; removed monorepo pollution (`apps/`, `packages/`, `pnpm-*`); hardened `.gitignore`.
- **Download — AI accept/reject reasoning:** new `aiReasoning` column on the events export and a new **Decision Audit** dataset classifying every raw article as Published / Processed-not-published / Pending with data-grounded reasoning.
- Took a verified local backup of the live server (DB dump + source archive).

## 2026-06-27 — Download Data Page (Researcher Export Suite)

- Added a **Download Data** sidebar/nav item and `/download` page for public data export.
- Datasets: **verified events**, **raw news archive** (132k+), **aggregated statistics** (by day/category/district).
- Formats: **CSV, Excel (SpreadsheetML, zero-dependency), JSON, GeoJSON** (GeoJSON for events with coordinates).
- Filters: date range, district, category, min severity, min killed, party/actor, source, processed/unprocessed; plus per-dataset **column selection**.
- New routes `app/api/download/route.ts` (streamed CSV/JSON for the raw corpus via id cursor; capped in-memory XLSX/GeoJSON) and `app/api/download/options/route.ts`.
- bn/en translations added in `context/LanguageContext.tsx` and `lib/LanguageContext.tsx`. Deployed live to violencetracker.org.

## 2026-06-27 — Header Status Switched Back to Live

- Updated the header status indicator to reflect that the system is live again. Changed `live` translation from `বন্ধ`/`PAUSED` to `লাইভ`/`LIVE`, and `tracking_sources` from `সিস্টেম বন্ধ — ফান্ডিং নেই`/`System offline — no funding` to `সিস্টেম সচল — সক্রিয় ট্র্যাকিং`/`System live — actively tracking`.
- Applied in both `context/LanguageContext.tsx` (used by the active `components/ui/Navbar.tsx`) and `lib/LanguageContext.tsx` for consistency. Completes the 2026-06-24 "system restored" change, where the funding banner was removed but the header status text was left on the offline message.

## 2026-06-24 — System Restored: 8-Key Gemini Fallback Pool & Funding Banner Removed

- **System restored to live** after API quota exhaustion — expanded Gemini API key fallback pool from 4 keys to **8 sequential fallback keys** (`GEMINI_API_KEY_1` through `GEMINI_API_KEY_8`) in `.env`, `lib/ai-analysis.ts`, and root `ai-analysis.ts`.
- Removed the **"SYSTEM OFFLINE / Funding Exhausted"** sticky header banner (`FundingBanner` component) from `app/layout.tsx` — site is fully operational again.
- Pulled latest code from live server (`root@89.167.59.65:/opt/tracker`), patched server `.env` with all 8 new keys, and triggered a full `docker compose --build` rebuild.
- All containers confirmed running: `docker-web`, `docker-api`, `docker-postgres`, `docker-redis`, `docker-meilisearch`.



- Executed a comprehensive technical, performance, architectural, and SEO audit for **https://podiumtutoring.com/**, identifying critical head-level element title overrides, blank sitemaps/robots.txt files, WCAG heading-level skip errors, and static asset pipeline issues. Compiled and synced the final detailed [podium_tutoring_audit_report.md](file:///Users/musfiqurtuhin/Documents/WorkSpace/tracker/documentation/podium_tutoring_audit_report.md) under the `/documentation` directory.
- Overhauled the Finance layout by transforming all quick entry/modifier forms (Transactions, Scheduled Commitments, and Escape Targets) from high-density, space-consuming inline boxes into elegant, right-aligned **slide-out overlay drawers** featuring backdrop blur overlays, smooth slide transitions, and clear step-by-step layout segmentation.
- Implemented full CRUD capabilities for **Finance Accounts / Wallets** (e.g. *Salary*, *Cash*, *Bank Card*, etc.) allowing users to fully **Add, Edit, Update, and Delete** accounts/wallets directly in the web app.
- Created and exposed two new backend REST API endpoints: `PATCH /finance/accounts/:id` (Account update) and `DELETE /finance/accounts/:id` (Account delete with transaction cascade to prevent database foreign key constraint errors).
- Built a premium inline hover-activated **Edit Pencil Icon (`Edit3`)** on wallet cards that slide into view seamlessly on hover.
- Overhauled the wallet modal popover to dynamically support both create and edit modes, including real-time validation, automatic field prepopulation, and a sleek rose-red deletion button.
- Implemented **Dynamic Custom Categories Manager** in the Finance quick entry grid, allowing users to dynamically add custom categories (e.g., *Metamorphosis*, *NDB*) inline directly inside the interface for both Income and Expense flows.
- Added dynamic icon fallbacks using Lucide icons (`DollarSign` for custom income, `Tag` for custom expenses) and inline category deletion tags to clean up unused user-defined categories.
- Synced custom categories seamlessly to LocalStorage, ensuring dynamic persistence and auto-propagation to budget commitment dropdowns.
- Overhauled the Finance Terminal quick transaction entry dock to make Category and Subcategory inputs exceptionally clear, structural, and interactive.

- Replaced the simple category tag clouds with a structured, step-by-step layout labeled explicitly: Flow Type switcher, Core Metrics box (Amount in BDT, Payment Wallet, Date selection with shortcut buttons), Visual Category card grid with custom Lucide icons (🏠 Rent, 🍔 Food, 🚗 Transport, 👥 Family, ☕ Social, 🔥 Smoke, 🌿 Weed, 🍹 Alcohol, 🧾 Fee, 💼 Salary, 💻 Independent, 🎁 Gift, 📈 Bonus).
- Built a contextual Subcategory suggestion panel that dynamically populates based on the active category (e.g. Uber/CNG for Transport, Cigarette/Vape for Smoke, Eidi/Birthday for Gift), accompanied by a custom subcategory text input, completely demystifying Category vs Subcategory utilization.
- Replaced basic ledger badges with unified joined pill tags displaying both Category and Subcategory side-by-side in high contrast.
- Added `connect-server.sh` script in the root directory for interactive production server SSH sessions and diagnostics.
- Added automated server handshake verification using local SSH key (`~/.ssh/id_ed25519_server_reset`).
- Designed a CLI menu providing options to launch an interactive SSH shell, tail Docker container logs (`api` and `web`), stream real-time CPU/memory/disk stats, check Nginx status, and run safe rolling restarts.
- Updated `documentation/Setup.md` to document the Live Server Gateway tool usage.
- Implemented chronological relative sorting in Today's Schedule (starting with "Wake Up" first and putting "Sleep" last) across both the Today dashboard page and the main Command Center dashboard.
- Enhanced `loadDefaultRoutine` script to automatically purge existing planned blocks for the selected day before copying the default template, preventing duplicate time-blocking inputs.
- Fixed time-block sorting calculation by implementing robust 12-hour AM/PM string parsing in `timeToMinutes` to correctly sort blocks like `02:00 PM` and `01:00 AM` relative to the wake-up time.
- Integrated an intelligent **Automatic Classification Rules Engine** allowing users to configure keyword-based matching patterns (e.g. *Bkash*, *Netflix*, *Uber*) to instantly classify transactions into custom categories.
- Built a **World-Class Bank Statement CSV Importer** permitting dynamic file uploads with dynamic column-header mapping (Date, Amount, Description columns parsed on-the-fly) and preview staging.
- Designed an interactive parsed ledger staging table allowing users to inline-edit categories, select transactions, and bulk-import statement history into target cash wallets seamlessly.
- Added advanced **Liquidity Forecasting Metrics** on the Analysis tab calculating real-time **Runway Forecast (Months)** and **Monthly Savings Rate (%)** based on active cash reserve balances and current monthly burn rate.



## 2026-05-16 — Full module CRUD + HCI/UX overhaul

- Goals: fixed userId isolation in controller/service; full CRUD page (create/edit modal, progress slider, status cycle, tag filter)
- Habits: added PATCH/DELETE/logs-recent endpoints; full CRUD page with 7-day tracking grid, sleep log modal, streak counters
- Notes: added limit query param; full CRUD page (create/edit modal, full-text search, tag filter, note viewer)
- Dashboard: wired all 8 modules with real data (Projects, Habits, Goals, Notes fully live)
- AppShell: added ⌘K command palette with keyboard navigation (arrows + enter + esc), mobile search button
- HCI principle applied: command palette reduces navigation cognitive load; no need to remember module paths
- UX: progress bars on dashboard goals, completion ratio on schedule card, cross-module data visible at a glance

## 2026-05-16 — Notion Data Seed Script & Deploy

- Added idempotent seed script in `packages/db/prisma/seed.ts` with extracted Notion data (Projects, Tasks, Routine).
- Configured `prisma.seed` in `packages/db/package.json` to use `npx tsx`.
- Updated `.github/workflows/deploy.yml` to run `prisma db seed` on deployment.

## 2026-05-16 — Notion Data Import

- Imported 19 tasks from Notion to the tracker system via API.
- Imported 12 projects from Notion to the tracker system via API.
- Imported 11 time blocks from Notion to the tracker system via API.
- Created temporary user `test@example.com` to perform imports.


## 2026-05-16 — Escape plan rich vector details + full seeding

- Added 7 new fields to EscapeVector schema: officialUrl, applyUrl, applicationDeadline, nextDeadlineDate, processingTime, costToApply, monthlyLiving
- Ran `prisma db push` on production to apply schema changes
- Updated create/update vector DTOs with new fields + class-validator decorators
- Updated escape.service.ts to handle new fields in createVector/updateVector
- Vector detail page ([vectorId]/page.tsx) now shows rich collapsible Details panel: deadline badge (red/yellow/green based on urgency), application window, processing time, cost, monthly living cost, angle, requirements, Official Source + Apply Now links
- Vector edit form now includes all 7 new fields with labeled inputs
- Seeded P5 (Digital Nomad Fast Exit): Georgia, Albania, Malaysia DE Rantau, Serbia, Montenegro, Hungary White Card, North Macedonia — with tasks
- Seeded P6 (PR/Immigration Express): Canada Express Entry, Australia 189, NZ Skilled, Canada AIP, Portugal D8 — with tasks
- Seeded P7 (Must-Do Admin): IELTS, Transcripts, Police Clearance, Passport, Wise/Payoneer, Academic CV, Europass CV, LinkedIn, HaorGrix Pitch Deck, Cold Email Templates — with tasks
- Rebuilt and redeployed API + web containers

## 2026-05-16 — Full application build

- Full auth module: register, login, refresh token rotation, logout, current user
- Finance module: accounts, transactions (CRUD), balance calculation, income/expense summary by category
- Tasks module: full CRUD, status transitions, hour logging, stats by status
- Projects module: full CRUD with task counts and associations
- Habits module: habit creation, daily log with upsert, streak calculation (current + longest)
- Sleep module: daily sleep log, 30-day stats and average
- Goals module: CRUD with progress (0–100) and status tracking
- Notes module: full CRUD with full-text search and tag filtering
- Events module: structured event creation + natural language ingest parser
- Workflows module: rule CRUD, enable/disable toggle, event evaluation engine
- Files module: attachment metadata CRUD
- Universal input engine: keyword-based NLP parser (finance, sleep, work, tasks)
- Frontend: dark-themed Next.js 15 app with Sidebar navigation
- Pages: dashboard (today view with stats), finance, tasks, projects, habits, goals, notes, events, login
- Docker Compose: dev (Postgres + Redis + Meilisearch) + prod (full stack + Nginx)
- GitHub Actions: SSH-based auto-deploy to Hetzner on push to main
- Documentation: Setup.md, API.md
- Deployment: Fixed API build errors (TS strictPropertyInitialization) and triggered production deployment.
- Deployment: Transitioned to Docker-based hosting on shared VPS, configured custom ports and host Nginx proxy.
## 2026-05-16
- Complete Midnight & Silver Premium UI Redesign (Dashboard, Notes, Goals, Tasks, Projects, Events, Habits, Finance)
- Restrict login to musfiqurrahmantuhin@gmail.com
- Fix duplicate return statements in habits and notes pages causing typecheck errors
- Ensure data preservation logic documentation (logout simply clears JWT, data remains in Prisma/DB via /escape paths)
2026-05-16: Rebranded IELTS to Escape, purged old projects, and updated daily routine structure.
2026-05-16: Added Quick Log and Log Now features to Today page for time-based task tracking.
2026-05-16: Removed Quick Log feature as requested.
2026-05-16: Optimized Today dashboard: removed Pomodoros tracking, automated Logged Hours calculation from start/end times, and restricted categories to Finance module only (removed from TimeBlocks and Projects). Cleaned up execution logger modal by removing redundant inputs.
