# Contributing

## Workflow
1. Branch from `main` (`feat/…`, `fix/…`, `chore/…`).
2. Make focused commits using Conventional Commits:
   `type(scope): summary` — `feat`, `fix`, `refactor`, `chore`, `docs`.
3. Before pushing: `npm run lint` and `npm run build` must pass (the build is the
   type gate because `ignoreBuildErrors` is on — see [SECURITY.md](SECURITY.md)).
4. Open a PR; keep diffs reviewable.
5. Append a dated entry to `CHANGELOG.md`.

## Code standards
- **TypeScript strict.** No `any` except at untyped third-party boundaries
  (document why).
- **Error handling.** Every fallible call handles its error — no silent catches.
- **One responsibility per file/function.** Keep UI, logic, and data access
  separable.
- **No dead code / placeholders / unused imports.**

## Domain conventions
- **i18n is mandatory.** User-facing text goes through `t('key')`. Add the key to
  `context/LanguageContext.tsx` *and* the legacy `lib/LanguageContext.tsx`, with both
  `bn` and `en` values. Bengali is the default and primary language — write natural
  Bengali, not literal translations.
- **Database** access via Prisma; import the singleton from `lib/db.ts` (do not
  `new PrismaClient()` in routes).
- **Dates** use the BST helpers in `lib/utils.ts`.
- **List fields** stored as JSON strings must be read with a guarded parser
  (`parseList`), never `JSON.parse` directly.
- **Exports**: large datasets must stream (cursor) — see `app/api/download/route.ts`
  for the pattern; never load the full raw corpus into memory.

## Where things live
| You want to… | Edit |
|---|---|
| Add/adjust a page | `app/<route>/page.tsx` |
| Add an API endpoint | `app/api/<name>/route.ts` |
| Change the data model | `prisma/schema.prisma` (+ migration) |
| Touch the scraper/AI pipeline | `lib/scrapers/*`, `lib/event-processor.ts`, `lib/ai-analysis.ts` |
| Add a nav item | `components/ui/Sidebar.tsx` (+ `Navbar.tsx` for mobile) |
| Add a translation | `context/LanguageContext.tsx` (+ `lib/LanguageContext.tsx`) |

## Testing & verification
There is no automated test suite yet. Until one exists, verify changes against the
running app: build, restart, and hit the affected page/endpoint (a representative
`curl` for API changes). New non-trivial logic should ship with at least a manual
verification note in the PR.

## Documentation
Keep `documentation/` in sync with behavior — especially [API.md](API.md),
[DATABASE.md](DATABASE.md), and [DEPLOYMENT.md](DEPLOYMENT.md) — whenever the
corresponding surface changes.
