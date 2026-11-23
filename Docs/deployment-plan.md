# Deployment Plan — Zest (Vercel + Railway)

Free production deploy for this monorepo:

| Layer | Service | Role |
| --- | --- | --- |
| Frontend | [Vercel](https://vercel.com) | Next.js app in `web/` |
| Backend | [Railway](https://railway.app) | FastAPI app (`src.api:app`) |
| LLM | [Groq](https://console.groq.com) | Ranking / explanations (existing free API key) |
| Data | [Hugging Face](https://huggingface.co) | Dataset download on first backend cold start |

```text
Browser ──▶ Vercel (Next.js)
                │
                │  NEXT_PUBLIC_API_URL
                ▼
           Railway (FastAPI / uvicorn)
                ├── Hugging Face dataset (first load → parquet cache)
                └── Groq API (LLM)
```

---

## 0. Prerequisites

1. GitHub (or GitLab/Bitbucket) repo with this project pushed.
2. Accounts: [Vercel](https://vercel.com/signup), [Railway](https://railway.app), [Groq](https://console.groq.com/keys).
3. Groq API key ready (`LLM_API_KEY` or `GROQ_API_KEY`).
4. Local sanity check before deploying:

```bash
# Backend
uvicorn src.api:app --reload --port 8000

# Frontend (other terminal)
cd web && npm run build
```

---

## 1. Pre-deploy code changes (done in repo)

### 1.1 CORS — allow the Vercel origin ✅

`CORS_ORIGINS` is loaded in `src/config.py` and applied in `src/api.py`.

- Default: `http://localhost:3000,http://127.0.0.1:3000`
- After Vercel gives you a URL, set on Railway e.g.  
  `CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000`

### 1.2 Bind to Railway’s `PORT` ✅

Root `Procfile` starts uvicorn on `$PORT` (injected by Railway). Do not hardcode `8000` in production.

```text
web: uvicorn src.api:app --host 0.0.0.0 --port $PORT
```

(Windows note: `$PORT` is for the Linux container on Railway, not local PowerShell.)

### 1.3 Do **not** commit secrets

Keep `.env` and `web/.env.local` out of git (already in `.gitignore`). Set secrets only in Railway / Vercel dashboards.

---

## 2. Deploy backend on Railway

### 2.1 Create the service

1. Open [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Select this repository.
3. Railway will detect a Python app from `requirements.txt`.

### 2.2 Root / build settings

| Setting | Value |
| --- | --- |
| Root directory | Repository root (not `web/`) |
| Build | Default (pip install from `requirements.txt`) |
| Watch paths (optional) | `src/**`, `requirements.txt`, `data/**` |

If Railway offers a Dockerfile and you don’t have one, use **Nixpacks** / Railpack (default) instead.

### 2.3 Environment variables (Railway)

Set these in **Variables** for the API service:

| Variable | Required | Example / notes |
| --- | --- | --- |
| `LLM_API_KEY` | Yes* | Groq key (`GROQ_API_KEY` also accepted) |
| `LLM_MODEL` | No | Default: `openai/gpt-oss-20b` |
| `LLM_DRY_RUN` | No | `false` in production |
| `DATASET_ID` | No | `ManikaSaini/zomato-restaurant-recommendation` |
| `TOP_N_CANDIDATES` | No | `20` |
| `TOP_K_RESULTS` | No | `5` |
| `BUDGET_LOW_MAX` | No | `500` |
| `BUDGET_MED_MAX` | No | `1000` |
| `REQUEST_TIMEOUT` | No | `30` (consider `60` if cold starts + LLM are slow) |
| `CORS_ORIGINS` | Yes (after §1.1) | `https://<your-vercel-app>.vercel.app,http://localhost:3000` |

\*Required unless `LLM_DRY_RUN=true` (demo-only; not useful for real recommendations).

`PORT` is provided by Railway — do not set it yourself unless you know you need to.

### 2.4 Start command

In **Settings → Deploy → Custom Start Command**:

```bash
uvicorn src.api:app --host 0.0.0.0 --port $PORT
```

### 2.5 Public networking

1. **Settings → Networking → Generate Domain** (e.g. `https://zest-api-production.up.railway.app`).
2. Save this URL — Vercel needs it as `NEXT_PUBLIC_API_URL` (no trailing slash).

### 2.6 First-request / cold-start behavior

Processed parquet under `data/processed/` is gitignored. On a fresh Railway volume:

1. First `/api/options` or `/api/recommend` call downloads the HF dataset and builds the cleaned cache.
2. That first call can take **1–3+ minutes** and may time out in the browser once.
3. Retry after the cache is built; later requests are much faster.

Optional hardening (later): bake `data/processed/zomato_clean.parquet` into the image or a Railway volume so the first request is instant. Not required for an MVP free deploy.

### 2.7 Backend health check

```bash
curl https://<your-railway-domain>/api/health
# → {"status":"ok"}
```

Also open `/docs` on the Railway URL to confirm Swagger loads.

---

## 3. Deploy frontend on Vercel

### 3.1 Import the project

1. [Vercel Dashboard](https://vercel.com/new) → **Import** the same GitHub repo.
2. Configure the project:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `web` |
| Build Command | `npm run build` (default) |
| Output Directory | default (`.next`) |
| Install Command | `npm install` (default) |

### 3.2 Environment variables (Vercel)

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://<your-railway-domain>` (no trailing slash) |

Important:

- `NEXT_PUBLIC_*` is baked in at **build** time. After changing it, trigger a **Redeploy**.
- Do not put the Groq key in Vercel — only the backend needs it.

### 3.3 Deploy

1. Click **Deploy**.
2. Note the production URL: `https://<project>.vercel.app`.
3. Go back to Railway and set / update `CORS_ORIGINS` to include that exact origin (scheme + host, no path).
4. Redeploy Railway if the variable change does not hot-reload middleware (usually restart is enough).

### 3.4 Custom domain (optional)

Vercel → Project → Domains. After adding a custom domain, append it to Railway `CORS_ORIGINS`.

---

## 4. Wire-up checklist (order matters)

1. Push CORS + any start-config changes to GitHub.
2. Deploy **Railway** → get public API URL → verify `/api/health`.
3. Deploy **Vercel** with `NEXT_PUBLIC_API_URL` = Railway URL → get frontend URL.
4. Set Railway `CORS_ORIGINS` to the Vercel URL (+ localhost if desired).
5. Restart / redeploy Railway if needed.
6. Open the Vercel site and run an end-to-end recommendation.

```text
Deploy API  →  note API URL
     ↓
Deploy UI   →  point UI at API URL
     ↓
Allow UI origin on API CORS
     ↓
Smoke-test full flow
```

---

## 5. Smoke tests

| Step | Action | Expected |
| --- | --- | --- |
| 1 | `GET /api/health` on Railway | `{"status":"ok"}` |
| 2 | `GET /api/options` on Railway | Locations + cuisines JSON (may be slow first time) |
| 3 | Open Vercel site | Form loads; options populate |
| 4 | Submit prefs (e.g. Koramangala / Italian / medium) | Ranked cards + summary |
| 5 | Browser DevTools → Network | Calls go to Railway host, status 200; no CORS errors |

Failure modes:

| Symptom | Likely cause |
| --- | --- |
| Browser CORS error | `CORS_ORIGINS` missing Vercel origin |
| Options empty / 500 on first load | HF download still running or failed; check Railway logs |
| 502 on recommend | Bad/missing Groq key, model name, or timeout |
| UI still hits `localhost:8000` | `NEXT_PUBLIC_API_URL` not set or deploy not rebuilt |

---

## 6. Free-tier notes

| Platform | What to expect |
| --- | --- |
| **Railway** | Free/trial credits; services may sleep or stop when credits run out. Cold starts add latency. |
| **Vercel Hobby** | Free for personal projects; bandwidth / build limits apply. |
| **Groq** | Free rate limits; burst traffic may return 429 → surface as API 502. |
| **Hugging Face** | Public dataset download on cold start; no key required for this public dataset. |

Keep `LLM_DRY_RUN=false` and a valid key in production so demos show real rankings.

---

## 7. Local vs production env summary

**Railway (backend)** — mirrors `.env.example`:

```env
LLM_API_KEY=...
LLM_MODEL=openai/gpt-oss-20b
LLM_DRY_RUN=false
DATASET_ID=ManikaSaini/zomato-restaurant-recommendation
TOP_N_CANDIDATES=20
TOP_K_RESULTS=5
BUDGET_LOW_MAX=500
BUDGET_MED_MAX=1000
REQUEST_TIMEOUT=30
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

**Vercel (frontend)** — mirrors `web/.env.example`:

```env
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```

---

## 8. Rollback / iterate

- Prefer Git-based deploys: fix → push → auto-redeploy on both platforms.
- Vercel: **Deployments** → promote a previous successful build.
- Railway: **Deployments** → redeploy a prior successful commit.
- Never rotate secrets in git; rotate only in dashboards.

---

## 9. Post-MVP improvements (optional)

1. Persist `data/processed/` on a Railway volume to skip HF download every new instance.
2. Add a Railway health-check path: `/api/health`.
3. Raise frontend fetch timeouts for the first recommendation after a cold start.
4. Restrict CORS to exact production + preview URLs (Vercel preview deployments need their origins listed or a wildcard policy you accept).
5. Add simple rate limiting on `/api/recommend` if the public demo gets abused.

---

## 10. Definition of done

- [ ] Railway serves `/api/health` on a public HTTPS URL  
- [ ] Vercel serves the Zest UI on a public HTTPS URL  
- [ ] `NEXT_PUBLIC_API_URL` points at Railway  
- [ ] `CORS_ORIGINS` includes the Vercel origin  
- [ ] End-to-end recommend works from the live UI with a live Groq key  
- [ ] No secrets committed to the repository  
