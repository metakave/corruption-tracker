# Security & Tech Debt

This document is deliberately candid: it lists what is in place **and** the known
weaknesses, so reviewers don't have to rediscover them.

## Authentication
- Admin areas (`/admin-db`, `/admin-logs`, `/audit-dashboard`, `/api/admin/*`,
  `/monitor.html`) are gated by **HTTP Basic Auth** in [`middleware.ts`](../middleware.ts).
- ⚠️ **Credentials are hardcoded** (`admin` / a literal password) in `middleware.ts`.
  **Priority fix:** move to env vars (`ADMIN_USER` / `ADMIN_PASSWORD_HASH`) and
  compare a hash; rotate the current password.
- There is no end-user authentication — the public site is read-only.

## Secrets
- Runtime secrets belong in `.env*` only (git-ignored). `DATABASE_URL`,
  `GEMINI_API_KEY_*`, and Facebook tokens must never be committed.
- ⚠️ **Historical exposure:** the repo's `scripts/*.exp` deployment files have
  hardcoded the production root SSH password, and it exists in Git history.
  **Action:** rotate the server password, switch to SSH-key-only auth, and scrub
  the password from the `.exp` scripts (read it from an env var / untracked file).
- The provided `.gitignore` blocks `.env*`, `*.pem`, `*.key`, `*secret*`, `*.dump`.

## Network / platform
- Cloudflare fronts the origin; the origin serves plain HTTP on port 3000 behind
  the proxy. Ensure the origin is not directly reachable for admin paths.
- `next.config.ts` restricts remote images to the project's own `/photocards/**`.

## Known tech debt (not security-critical, but reviewers will notice)
- **`typescript.ignoreBuildErrors: true`** in `next.config.ts` — type errors do not
  fail the build. Re-enable strict builds once the codebase is clean.
- **Prisma client instantiation** is inconsistent: `lib/db.ts` exports a singleton,
  but several API routes do `new PrismaClient()` at module scope. Standardize on the
  singleton to avoid connection exhaustion.
- **Duplicate source files** exist at the repo root (`layout.tsx`, `Map.tsx`,
  `about/`, `admin/`, …) mirroring the canonical files under `app/`/`components/`.
  They are legacy/deploy leftovers, not imported by the app. Remove after verifying.
- **Duplicate i18n dictionary:** `context/LanguageContext.tsx` is canonical;
  `lib/LanguageContext.tsx` is a legacy copy kept in sync. Consolidate to one.
- **JSON-encoded string columns** instead of native arrays/`Json` (see
  [DATABASE.md](DATABASE.md)) — a SQLite-era legacy; migrate to `Json`/relations.
- **Deploy is scp-based**, not a Git checkout on the server — fragile and the reason
  the repo and server drifted. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Data sensitivity
- Stored data is aggregated from public news sources; no PII beyond what those
  articles already publish. The product shows a disclaimer that data is
  automatically aggregated and not an authoritative record.

## Recommended hardening checklist
1. Rotate server SSH password → SSH keys only; scrub `.exp` scripts.
2. Move admin Basic Auth creds to hashed env vars; rotate.
3. Add a billed Gemini key and store all keys in `.env` only.
4. Standardize Prisma on the `lib/db.ts` singleton.
5. Remove root-level duplicate files and the duplicate `LanguageContext`.
6. Turn off `ignoreBuildErrors` and fix the surfaced types.
7. Convert production to a Git-based deploy.
