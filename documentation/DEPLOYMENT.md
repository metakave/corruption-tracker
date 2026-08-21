# Deployment & Operations

## Production topology

| Component | Detail |
|---|---|
| Host | Single Ubuntu VPS (`46.224.92.166`) |
| App path | `/var/www/political_violence_tracker` |
| Process manager | **PM2** |
| Web process | `political-violence-tracker` → `npm start` (Next.js) on **port 3000** |
| Scraper process | `auto-scraper` → `tsx scripts/crawler.ts`, cron-triggered |
| Database | PostgreSQL on the same host (`political_violence`) |
| Edge / DNS | **Cloudflare** in front of `violencetracker.org` |

> The VPS is the **source of truth** for what is running. The Git repo mirrors it;
> when they drift, reconcile toward the server. (A separate Docker host,
> `89.167.59.65` / `tracker.musfiqurtuhin.me`, runs an **unrelated** project — do
> not deploy this app there.)

## Deploy (current process)

The server is not a Git checkout; deploys are file-sync + rebuild:

```bash
# 1. copy changed files to the server
scp <files> root@46.224.92.166:/var/www/political_violence_tracker/<path>

# 2. build + restart on the server
ssh root@46.224.92.166 '
  cd /var/www/political_violence_tracker &&
  npm run build &&
  pm2 restart political-violence-tracker --update-env
'
```

`npm run build` also acts as the type/compile gate. After restart, verify:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/        # 200
```

> **Improvement worth making:** convert the server to a Git checkout so deploys
> become `git pull && npm ci && npm run build && pm2 restart`. Today's scp flow is
> error-prone and is why the repo and server drifted historically.

## Scheduled jobs

- **PM2 cron** (`ecosystem.config.js`): `auto-scraper` at `0 5,8,13,17 * * *` UTC.
- **crontab** (`crontab.txt`): `run_scheduler.sh` on the same windows, plus daily
  `maintain.sh` (04:00 UTC) and `backup_db.sh` (05:00 UTC).
- Times are UTC; Bangladesh is UTC+6 (11:00, 14:00, 19:00, 23:00 BST).

## Runbook

### Check health
```bash
ssh root@46.224.92.166 'pm2 list; pm2 logs political-violence-tracker --lines 50 --nostream'
```

### Backlog not draining (most common issue)
Symptom: `RawNewsArticle.isProcessed=false` count keeps rising; `backlog-pipeline`
logs show `429 Too Many Requests` / `RESOURCE_EXHAUSTED`.

Cause: **Gemini free-tier quota** (≈20 requests/day per key per model) exhausted
across all `GEMINI_API_KEY_*`.

Fix: add a billed Gemini key (or more keys) to the server `.env`, then restart the
pipeline process. Inspect:
```sql
SELECT count(*) FROM "RawNewsArticle" WHERE "isProcessed" = false;
```

### Restart services
```bash
pm2 restart political-violence-tracker     # web
pm2 restart auto-scraper                    # scraper (normally cron-driven)
```

### Database backup / restore
```bash
# backup (custom format)
pg_dump -h localhost -U pvt_user -d political_violence -F c -f backup.dump
# restore
pg_restore -h localhost -U pvt_user -d political_violence --clean backup.dump
```
A verified local backup convention lives in `live-server-backup-<date>/`
(DB dump + source archive).

### Logs
PM2 logs under `~/.pm2/logs/`; application logs under
`/var/www/political_violence_tracker/logs/` (large — excluded from Git/backups).

## CDN cache
The public site is fronted by Cloudflare. After a deploy, content updates are
near-immediate for dynamic routes; for cached assets use a cache purge or a
`?v=<timestamp>` cache-buster when verifying.
