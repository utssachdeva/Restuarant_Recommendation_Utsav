# Implementation Plan

## AI-Powered Restaurant Recommendation System (Zomato Use Case)

Phase-wise plan for building the project described in [`problemStatement.md`](./problemStatement.md) and [`architecture.md`](./architecture.md).

**Approach:** deliver a working vertical slice early, then harden filters, LLM quality, UI polish, and reliability.

---

## Plan Overview

| Phase | Name | Goal | Suggested duration |
| --- | --- | --- | --- |
| 0 | Project setup | Repo, env, dependencies, skeleton | 0.5 day |
| 1 | Data ingestion & preprocessing | Clean, usable restaurant dataset | 1 day |
| 2 | Preference schema & filtering | Deterministic candidate shortlist | 1 day |
| 3 | LLM integration | Ranked recommendations + explanations | 1–1.5 days |
| 4 | Orchestrator wiring | End-to-end service without polished UI | 0.5 day |
| 5 | UI / presentation | Streamlit (or Gradio) app | 1 day |
| 6 | Hardening & fallbacks | Reliability, validation, edge cases | 0.5–1 day |
| 7 | Docs, demo & polish | README, sample flows, final checks | 0.5 day |

**Total estimate:** ~5–7 days for a solid bootcamp MVP.

```text
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
   │         │         │         │         │         │         │         │
 setup     data     filters     LLM     wire E2E     UI     harden    ship
```

---

## Phase 0 — Project Setup

### Objective
Create a runnable project skeleton aligned with the architecture folder structure.

### Tasks
- [x] Initialize Git repository (if not already)
- [x] Create folder structure:

```text
Zomato/
├── Docs/
├── data/raw/
├── data/processed/
├── src/
│   ├── data/
│   ├── filters/
│   ├── llm/
│   ├── services/
│   └── models/
├── .env.example
├── requirements.txt
└── README.md
```

- [x] Add `requirements.txt` with baseline deps:
  - `pandas`, `datasets`, `python-dotenv`, `pydantic`
  - LLM SDK (e.g. `openai` / provider SDK)
  - `streamlit` (or `gradio`)
- [x] Create `.env.example` with placeholders:
  - `LLM_API_KEY`
  - `LLM_MODEL`
  - `DATASET_ID`
  - `TOP_N_CANDIDATES`
  - `TOP_K_RESULTS`
- [x] Add `src/config.py` for loading env + constants (budget bands, top-N)
- [x] Smoke-test: empty `src/app.py` launches without crash

### Deliverables
- Project skeleton
- Dependency install works
- Config loading works

### Exit criteria
- `pip install -r requirements.txt` succeeds
- App entrypoint can start
- No secrets committed

---

## Phase 1 — Data Ingestion & Preprocessing

### Objective
Load the Hugging Face Zomato dataset and produce a clean in-memory / cached table for filtering.

### Tasks
- [x] Implement `src/data/loader.py`
  - Load from Hugging Face dataset ID in config
  - Optionally save a local cache under `data/processed/`
- [x] Implement `src/data/preprocess.py`
  - Keep relevant columns: name, location, cuisines, cost, rate, votes, rest_type, dish_liked, etc.
  - Normalize rating (`"4.1/5"` → `4.1`)
  - Normalize cost (strip commas → numeric)
  - Normalize cuisines (lowercase, split to list/string for matching)
  - Handle missing values for rate / cost / cuisines / location
- [x] Add a small script or notebook cell / CLI path to inspect:
  - row count
  - null rates
  - unique locations / sample cuisines
- [x] Cache cleaned dataset (CSV or Parquet) for faster reloads

### Deliverables
- `loader.py`, `preprocess.py`
- Cleaned dataset available in memory and optionally on disk
- Quick data-quality summary

### Exit criteria
- Dataset loads successfully
- Key fields are numeric/normalized where required
- Cleaning is idempotent and documented in code comments / README snippet

### Checkpoint demo
Print 5 sample cleaned restaurants with name, location, cuisine, rating, cost.

---

## Phase 2 — Preference Schema & Filtering

### Objective
Accept user preferences and deterministically produce a short candidate list.

### Tasks
- [x] Define Pydantic models in `src/models/schemas.py`
  - `UserPreferences` (location, budget, cuisine, min_rating, additional_preferences)
  - `RestaurantCandidate` (fields needed by LLM + UI)
- [x] Implement budget mapping in config/filter:
  - Low ≤ 500
  - Medium 501–1000
  - High > 1000
  - (tune after inspecting data distribution)
- [x] Implement `src/filters/restaurant_filter.py`
  - Filter by location
  - Filter by cuisine overlap
  - Filter by min rating
  - Filter by budget band
  - Sort by rating / votes
  - Cap to `TOP_N_CANDIDATES`
- [x] Add unit-style checks / manual test cases:
  - exact match case
  - no-match case
  - over-match truncation case

### Deliverables
- Preference schema
- Working filter engine
- Candidate shortlist function

### Exit criteria
- Given sample preferences, filter returns a bounded, valid candidate list
- No-match path returns empty list cleanly
- Hard constraints are never violated by the filter output

### Checkpoint demo
Run 3 preference sets and print candidate counts + top 5 names.

---

## Phase 3 — LLM Integration

### Objective
Turn candidates + preferences into ranked recommendations with explanations.

### Tasks
- [x] Implement `src/llm/prompts.py`
  - System prompt: recommend only from provided candidates
  - User prompt: preferences + compact candidate payload
  - Required JSON output schema (rank, name, cuisine, rating, estimated_cost, explanation, optional summary)
- [x] Implement `src/llm/client.py` (Groq SDK)
  - Read model/API key from config
  - Send chat/completion request
  - Handle timeout / API errors
- [x] Implement `src/llm/parser.py`
  - Parse JSON from model response
  - Validate against Pydantic schema
  - Drop recommendations whose names are not in the candidate set
- [x] Add a local dry-run mode (optional): mock LLM response for offline UI work

### Deliverables
- Prompt templates
- Groq LLM client
- Response parser + validation

### Exit criteria
- LLM returns parseable JSON for a real candidate shortlist
- Explanations reference user preferences
- Hallucinated restaurant names are filtered out

### Checkpoint demo
```bash
python -m src.llm --dry-run   # offline mock
python -m src.llm             # live Groq (needs LLM_API_KEY)
```
For one preference set, print ranked JSON with explanations.

---

## Phase 4 — Orchestrator (End-to-End Service)

### Objective
Wire validation → filter → prompt → LLM → parse into one service function.

### Tasks
- [x] Implement `src/services/recommender.py`
  - `recommend(preferences) -> RecommendationResponse`
  - Steps:
    1. Validate preferences
    2. Filter candidates
    3. Early-return empty-state if none
    4. Build prompt
    5. Call LLM
    6. Parse + validate
    7. Return top-K results
- [x] Define response model:
  - `summary`
  - `recommendations[]`
  - `meta` (candidate_count, fallback_used, etc.)
- [x] Add simple CLI or Python entry to call the service without UI

### Deliverables
- Working orchestrator
- Typed request/response contract

### Exit criteria
- One function call produces full recommendation output
- Empty-filter and happy-path both handled
- Service is UI-agnostic

### Checkpoint demo
```bash
python -m src.services.recommender
python -m src.services.recommender --dry-run
python -m src.services.recommender --case happy-path
```

---

## Phase 5 — UI / Presentation Layer

### Objective
Build a user-friendly interface for preferences and results.

### Tasks
- [x] Implement `src/app.py` (Streamlit recommended)
  - Preference form:
    - Location (dropdown from dataset if possible)
    - Budget (low / medium / high)
    - Cuisine (multiselect or text)
    - Minimum rating (slider)
    - Additional preferences (text area)
  - Submit button → call orchestrator
  - Loading state while LLM runs
- [x] Results view:
  - Summary text
  - Cards/rows for each recommendation:
    - name, cuisine, rating, estimated cost, explanation
  - Empty-state guidance (“try relaxing filters”)
- [x] Basic UX polish:
  - Input validation messages
  - Disable submit when required fields missing
  - Show candidate count / fallback notice if useful

### Deliverables
- Runnable web app
- Clear input + output experience

### Exit criteria
- Non-technical user can submit preferences and understand results
- Output matches problem-statement display fields
- App recovers gracefully from empty results

### Checkpoint demo
```bash
streamlit run src/app.py
```
Live walkthrough: enter preferences → view top recommendations with explanations.

---

## Phase 6 — Hardening & Fallbacks

### Objective
Make the system reliable for demo and repeated use.

### Tasks
- [ ] Deterministic fallback ranking when LLM fails / times out
  - Sort candidates by rating (then votes)
  - Use template explanation text
- [ ] Retry once on invalid JSON, then fallback
- [ ] Guardrails:
  - Max candidate payload size
  - Request timeout
  - Strip unexpected fields from LLM output
- [ ] Logging:
  - filter match counts
  - LLM latency
  - parse success/failure
  - fallback used
- [ ] Cache cleaned dataset on startup to avoid reload delay
- [ ] Add a few regression fixtures (sample prefs → expected non-empty / empty behavior)

### Deliverables
- Fallback path
- Validation + logging
- Faster startup via cache

### Exit criteria
- App still returns useful results if LLM is unavailable
- No crashes on common bad inputs
- Demo path is stable

---

## Phase 7 — Documentation, Demo & Polish

### Objective
Package the project so it can be run, explained, and evaluated easily.

### Tasks
- [ ] Write / update `README.md`
  - What the project does
  - Architecture summary (link to Docs)
  - Setup steps
  - How to run
  - Example preference queries
- [ ] Ensure Docs are consistent:
  - `problemStatement.md`
  - `architecture.md`
  - `implementation-plan.md`
- [ ] Prepare 3 demo scenarios:
  1. Happy path (clear matches)
  2. Tight filters (few/no matches)
  3. Soft preferences (e.g., family-friendly / quiet)
- [ ] Final cleanup:
  - Remove debug prints
  - Confirm `.env` is gitignored
  - Verify requirements are complete
- [ ] Optional stretch:
  - Simple evaluation notes (manual quality rubric)
  - Screenshot of UI for README

### Deliverables
- Complete README
- Demo script / sample queries
- Clean runnable project

### Exit criteria
- Fresh clone/setup instructions work
- Demo scenarios run successfully
- Project clearly maps to problem statement success criteria

---

## Cross-Phase Definition of Done (MVP)

The project is done when all of the following are true:

1. Dataset loads and is preprocessed into usable fields.
2. User preferences are collected via UI.
3. Hard filters produce a grounded candidate set.
4. LLM ranks candidates and explains each pick.
5. UI shows name, cuisine, rating, cost, and explanation.
6. Empty results and LLM failures are handled without crashing.
7. README + Docs explain how to run and how the system works.

---

## Suggested Build Order (Week View)

| Day | Focus |
| --- | --- |
| Day 1 | Phase 0 + Phase 1 (setup + clean data) |
| Day 2 | Phase 2 (filters) + start Phase 3 (prompts) |
| Day 3 | Finish Phase 3 + Phase 4 (LLM + orchestrator) |
| Day 4 | Phase 5 (UI) |
| Day 5 | Phase 6 + Phase 7 (harden, docs, demo) |

---

## Risk Register & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hugging Face dataset ID / schema mismatch | Blocks Phase 1 | Inspect columns early; adapt preprocessor; keep local sample CSV |
| Cost field distribution breaks budget bands | Weak filtering | Calibrate thresholds from percentile analysis |
| LLM returns non-JSON / hallucinated names | Broken results | Strict parser + candidate allowlist + fallback ranking |
| High latency on demo | Poor UX | Cache data; limit top-N; show loading state |
| API key / quota issues | Demo failure | Dry-run mock mode + deterministic fallback |
| Too many filter matches | Noisy LLM context | Cap candidates; prefer rating/votes sort |

---

## Optional Stretch Goals (After MVP)

Only after Phases 0–7 are complete:

| Stretch item | Notes |
| --- | --- |
| Embedding-based retrieval | Semantic shortlisting before LLM |
| Multi-turn chat refinement | “Something cheaper” / “more casual” |
| Review summarization | Pros/cons from `reviews_list` if available |
| REST API (`/recommend`) | Decouple UI from service |
| Evaluation harness | Offline scoring of ranking quality |

---

## Traceability Matrix

| Problem Statement requirement | Implementation phase |
| --- | --- |
| Data ingestion from Hugging Face | Phase 1 |
| Collect user preferences | Phase 2 schemas + Phase 5 UI |
| Filter + prepare data for LLM | Phase 2 + Phase 3 prompts |
| LLM ranking + explanations | Phase 3 + Phase 4 |
| User-friendly output display | Phase 5 |
| Reliable end-to-end experience | Phase 6 + Phase 7 |

---

## Immediate Next Step

**Phase 5 complete.** Start **Phase 6**: hardening, deterministic LLM fallback, logging.
