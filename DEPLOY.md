# Deploying LK Student Space

## How the app loads

1. **Instant open** — The client always starts from `public/fallback-bundle.json` (bundled safe database). No loading screen.
2. **Background sync (optional)** — On `localhost` or your LAN IP (`npm run dev`), the app may fetch `/api/local-db/read` to merge project `database/` files. This never blocks login.
3. **Vercel / production** — Sync is **off** by default. The bundled JSON is the single source of truth until Supabase is wired.

To force sync in any environment, set:

```bash
NEXT_PUBLIC_ENABLE_DB_SYNC=true
```

## Vercel

1. Import the repo in Vercel.
2. Framework preset: **Next.js**
3. Build command: `npm run build`
4. Output: default (Next.js App Router)
5. **Do not** rely on `POST /api/local-db/write` in production — it returns 403 on Vercel. Use Super Admin **export** and commit an updated `fallback-bundle.json`, or run `npm run db:generate` locally and push.

### Environment variables (optional)

| Variable | Purpose |
|----------|--------|
| `NEXT_PUBLIC_ENABLE_DB_SYNC` | `true` to enable background read on production (not recommended until `/database` is deployed intentionally) |

### Updating demo data for production

```bash
# Edit files under database/
npm run db:generate   # writes public/fallback-bundle.json
git add public/fallback-bundle.json database/
git commit -m "Refresh bundled database"
```

## Local development (Mac + iPhone on Wi‑Fi)

```bash
npm install
npm run dev
```

The script prints URLs like:

- Mac: `http://localhost:3000`
- iPhone: `http://192.168.x.x:3000` (use the **printed IP**, not `0.0.0.0`)

**Important:** Next.js 16 blocks dev assets from LAN IPs unless `allowedDevOrigins` is set — this repo configures that in `next.config.js`. After changing config, restart `npm run dev`.

If the page is blank on iPhone:

1. Confirm the dev terminal is still running.
2. Mac and iPhone on the **same Wi‑Fi** (not guest network).
3. macOS **Firewall** → allow incoming connections for **Node**.
4. Do not use `http://0.0.0.0:3000` on the phone.

## PWA

- `manifest.json` and icons are under `public/`.
- Add to Home Screen on iOS uses `viewport-fit=cover` and safe-area CSS.

## Super Admin (platform owner)

| Field | Value |
|-------|--------|
| Name | אלון בליטי |
| Phone | `0501110000` |
| Password | `creator2026` |

Super Admin tools: **More → מערכת** (database export/import, users, feature flags, system status).

## Health check

After deploy, open `/api/health` — should return JSON OK.
