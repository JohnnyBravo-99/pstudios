# GitHub Pages site + production API

This repo (`JohnnyBravo-99/pstudios`) is a **monorepo**:

| Part | Role | Public URL |
|------|------|------------|
| `pstudios-landingpage/` | React app (can deploy to **GitHub Pages** or custom domain) | `https://www.paradigmstudios.art` (see `package.json` → `homepage`) |
| `backend/` | Express API on **VPS** (Docker), **not** GitHub Pages | `https://api.paradigmstudios.art` |

## Alignment rules

1. **Production builds** of the landing page use `NODE_ENV=production`, so `src/config/api.js` resolves the API to **`https://api.paradigmstudios.art`** (unless `REACT_APP_API_URL` overrides it).
2. **CORS** on the API (`backend/src/index.js`) must allow the site origin (`https://www.paradigmstudios.art`, apex, and any GitHub Pages URL you still use).
3. **Contact form** hits `POST /api/contact/intake` on that API; outbound mail is configured on the **VPS** `.env` / Nodemailer (`backend/docs-archive/EMAIL_SETUP.md`).

## Deploy the marketing site (GitHub Pages)

```bash
cd pstudios-landingpage
npm ci
npm run build
npm run deploy
```

`predeploy` runs `build`; `deploy` runs `gh-pages -d build`. Ensure `homepage` in `package.json` matches the URL users open (custom domain vs `*.github.io`).

## Deploy / update the API

On the VPS: pull this repo, rebuild the `api` image if needed, and `docker compose up -d` (see `backend/docker-compose.yml` and `backend/docs-archive/`).
