# Zomato AI Restaurant Recommendations

Personalized restaurant recommendations using the Zomato Bangalore dataset and an LLM.

## Docs

- [Problem Statement](Docs/problemStatement.md)
- [Architecture](Docs/architecture.md)
- [Implementation Plan](Docs/implementation-plan.md)
- [Deployment Plan](Docs/deployment-plan.md) (Vercel + Railway)
- [Edge Cases](Docs/edge-case.md)

## Setup (Phase 0)

```bash
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set `LLM_API_KEY` to your [Groq API key](https://console.groq.com/keys).
Default model: `openai/gpt-oss-20b`. Use `LLM_DRY_RUN=true` for offline mock responses.

## Run the app (Zest Next.js UI)

Two processes — FastAPI backend + Next.js frontend.

**1. API** (from project root, with venv active):

```bash
uvicorn src.api:app --reload --port 8000
```

**2. Frontend** (separate terminal):

```bash
cd web
copy .env.example .env.local   # first time only
npm install
npm run dev
```

Open **http://localhost:3000**. The UI talks to `http://localhost:8000`
(`NEXT_PUBLIC_API_URL` in `web/.env.local`).

### Legacy Streamlit UI (optional)

```bash
streamlit run src/app.py
```

## Project structure

```text
Zomato/
├── Docs/
├── data/raw/
├── data/processed/
├── src/
│   ├── api.py          # FastAPI for the Next.js UI
│   ├── app.py          # Legacy Streamlit UI
│   ├── config.py
│   ├── data/
│   ├── filters/
│   ├── llm/
│   ├── services/
│   └── models/
├── web/                # Next.js Zest frontend (Stitch design)
├── stitch_table_ai_restaurant_finder/
├── .env.example
├── requirements.txt
└── README.md
```

## Data pipeline (Phase 1)

Load, clean, cache, and inspect the dataset:

```bash
python -m src.data
```

This writes:
- `data/processed/zomato_raw.parquet` — column-trimmed raw extract
- `data/processed/zomato_clean.parquet` — normalized ratings/costs/cuisines

Dataset used: [`ManikaSaini/zomato-restaurant-recommendation`](https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation)

## Filtering (Phase 2)

Run the preference filter checkpoint:

```bash
python -m src.filters
```

This validates:
- exact-match shortlist
- no-match empty result
- over-match truncation to `TOP_N_CANDIDATES`

## LLM ranking (Phase 3 — Groq)

```bash
python -m src.llm --dry-run   # offline mock, no API key
python -m src.llm             # live Groq call
```

This builds a Koramangala / Italian / medium-budget shortlist, calls Groq (or mock),
parses JSON, and drops any hallucinated restaurant names.

## Orchestrator (Phase 4)

End-to-end service without UI:

```bash
python -m src.services.recommender
python -m src.services.recommender --dry-run
python -m src.services.recommender --case empty-filter
```

`recommend(preferences)` validates prefs → filters candidates → calls Groq →
returns `RecommendationResponse` (`summary`, `recommendations`, `meta`).

## Current status

Phase 5 complete: Zest Next.js UI + FastAPI (`src/api.py`), with Streamlit kept as a legacy entry.
Next: Phase 6 hardening (LLM fallback, retries, logging).
