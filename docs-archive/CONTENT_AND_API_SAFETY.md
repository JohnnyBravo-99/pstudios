# Content & API safety (blog, portfolio, deployments)

This runbook explains **why things “disappear”** and how to **stop it from happening again**.

## 1. Separate “code” from “database” and “uploads”

| What | Where it lives | Git push affects it? |
|------|----------------|----------------------|
| React app, API **source code** | Git (`main`, `gh-pages`, `backend-setup`) | Yes — only files tracked by Git |
| **Portfolio & blog documents** | MongoDB (VPS Docker volume or Atlas) | **No** — Git never edits MongoDB |
| **Uploaded images/videos** | Server disk (`uploads/`, often a Docker volume) | **No** — unless you delete volumes or redeploy without mounts |

**Principle:** Losing portfolio **entries** after a deploy usually means the API pointed at an **empty or different database**, a **seed script** overwrote data, or a **Docker volume** was recreated without a restore — **not** because someone ran `git pull`.

## 2. “CORS error” + `502 Bad Gateway` (portfolio / blog fetch)

If DevTools shows **both**:

- `blocked by CORS policy: No 'Access-Control-Allow-Origin' header`
- `net::ERR_FAILED 502 (Bad Gateway)`

then the **primary failure is usually not CORS** — it is the **reverse proxy (Caddy) returning 502** because **nothing healthy is listening** on the upstream (e.g. Docker `api` container crashed, wrong port, or MongoDB unreachable so Node exits).

Browsers only add CORS complaints when the response **lacks** `Access-Control-Allow-Origin`. **Express adds those headers** on normal responses; **Caddy’s bare 502 page often does not**, so the console blames CORS while the real fix is **restore the API process**.

**On the VPS, check (replace paths/user as on your server):**

```bash
cd ~/mernvps/backend   # or wherever docker-compose.yml lives
docker compose ps
docker compose logs api --tail 80
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/health
```

Restart if needed: `docker compose up -d api` (or `docker compose up -d --build api` after code changes).

**Principle:** **502 from the proxy** can **masquerade as a CORS error**; fix **upstream health** first.

Optional: extend **Caddy** with `handle_errors` so even error responses include `Access-Control-Allow-Origin` — see comments in `backend/configs/Caddyfile` (template).

---

## 3. Why the home blog looked “broken”

The home page loads posts from:

`GET {API_BASE_URL}/api/blog`

Typical failures:

- Wrong **`API_BASE_URL`** in dev (e.g. backend not running on `3001`, or `REACT_APP_API_URL` typo).
- API **down**, **rate limited**, or **500** from MongoDB connection issues.
- **CORS** blocking the browser (check Network tab: failed/blocked request).

The UI now surfaces **errors and a Retry** instead of failing silently with a blank feed.

**Principle:** **Observability** — always show or log failure; silent empty state looks like “no content” when it’s actually “request failed.”

## 4. Safe deployment habits (VPS / Docker)

1. **Never run `seed` or destructive scripts against production** without a named backup and a dry run.
2. **Verify `DATABASE_URL` / `MONGO_*`** in production env files — one typo points the API at a **new empty DB**.
3. After deploy: **`curl https://api.paradigmstudios.art/api/health`** and spot-check **`/api/blog`** and **`/api/portfolio`** counts.
4. Keep **automated `mongodump`** (cron) and periodically **test a restore** on a scratch server.

## 5. Safe Git habits (avoid wiping your working tree)

- **`git reset --hard`** on a branch that **doesn’t contain** `pstudios-landingpage` will **remove those files from disk** until you `checkout main` again. It does **not** delete GitHub or MongoDB.
- For “backend-only” updates locally, prefer:  
  `git checkout main -- backend/path/to/file`  
  instead of resetting the whole repo onto `backend-setup`.

## 6. Optional hardening (backlog)

- **Admin “export portfolio JSON”** — one-click backup before risky operations.
- **CI smoke test** — build + hit public API URLs in GitHub Actions after deploy.
- **Uptime + synthetic check** — ping `/api/health` and `/api/blog` from outside the VPS.

---

*Last updated: aligns with Home blog fetch error handling and operational separation of code vs data.*
