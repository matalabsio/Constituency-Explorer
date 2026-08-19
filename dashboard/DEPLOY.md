# Deploy Constituency Explorer to Vercel

This guide deploys the **Next.js dashboard only**. The Python collector stays on your machine.

## What Vercel will host

- Kurupam, Dhone, and Pattikonda explorer pages
- Read-only Kurupam SQLite data (`dashboard/data/kurupam.db`)
- Public map embeds and charts

## What Vercel will not host

- The crawler (`collector/`)
- Snapshot HTML files under `data/storage/`
- Review writes (approve/reject). The database is opened read-only on Vercel.

---

## Before you deploy (checklist)

1. **GitHub repo**  
   This project already has `origin`: `https://github.com/matalabsio/Constituency-Explorer.git`

2. **Commit the current UI work**  
   A lot of landing/sidebar/map/tooltip work is still uncommitted. Vercel builds from GitHub, so push `main` first.

3. **Bundle the Kurupam database**  
   From `dashboard/`:

   ```bash
   node scripts/copy-db.mjs
   ```

   Confirm `dashboard/data/kurupam.db` exists (~2 MB). Commit that file. Without it, Kurupam pages show empty; Dhone and Pattikonda still work.

4. **Local production build** (optional but recommended)

   ```bash
   cd dashboard
   npm install
   npm run build
   ```

5. **Vercel account**  
   Sign in at [vercel.com](https://vercel.com) with the GitHub account that can access `matalabsio/Constituency-Explorer`.

---

## Deploy steps

1. Open [vercel.com/new](https://vercel.com/new)
2. Import **Constituency-Explorer**
3. Set **Root Directory** to `dashboard` (important: this is a monorepo)
4. Framework Preset: **Next.js** (auto)
5. Leave Build Command as `npm run build` (the `prebuild` script copies the db if a sibling `data/` folder exists)
6. Leave Output Directory empty
7. Install Command: `npm install`
8. Node.js: **20.x**
9. Click **Deploy**

No environment variables are required for a first public deploy.

Optional env vars (only if you change paths later):

| Name | When to set |
|---|---|
| `KURUPAM_DB_PATH` | Absolute path to sqlite, if not using `dashboard/data/kurupam.db` |
| `KURUPAM_DATA_DIR` | Folder that contains `kurupam.db` |
| `SQLITE_READONLY` | Set to `1` to force read-only locally |

---

## After deploy

- Open the `.vercel.app` URL
- Check `/` (Kurupam), `/dhone`, `/pattikonda`
- Mandals, villages, maps, booths, chart hover
- `/review` can still *display* records, but saving a review status will fail by design

The site currently sends `robots: noindex`. Search engines should stay out. Say if you want it indexable.

---

## Custom domain (optional)

Vercel project → Settings → Domains → add `yourdomain.com` → set the DNS records Vercel shows.

---

## Updating data later

1. Run the collector locally
2. `cd dashboard && node scripts/copy-db.mjs`
3. Commit `dashboard/data/kurupam.db`
4. Push `main` (Vercel redeploys)

---

## If the Vercel build fails

- **better-sqlite3 / node-gyp**: Vercel must use Node 20. Retry the deploy once.
- **Kurupam empty**: `kurupam.db` was not committed under `dashboard/data/`.
- **Wrong pages / 404**: Root Directory is not `dashboard`.
- **Google Maps iframes blank**: ad blockers or Google blocking the embed; VillageMap links still work.
