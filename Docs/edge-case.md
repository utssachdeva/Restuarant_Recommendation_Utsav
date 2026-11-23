# Edge Cases & Corner Scenarios

## AI-Powered Restaurant Recommendation System (Zomato Use Case)

Catalog of edge cases and corner scenarios derived from [`architecture.md`](./architecture.md) and [`implementation-plan.md`](./implementation-plan.md).

Use this document during Phase 2 (filters), Phase 3–4 (LLM + orchestrator), Phase 5 (UI), and Phase 6 (hardening).

---

## How to Read This Doc

| Column | Meaning |
| --- | --- |
| ID | Stable edge-case identifier |
| Scenario | What goes wrong / unusual |
| Layer | Component that should handle it |
| Expected behavior | Correct system response |
| Severity | `P0` crash/demo-breaking · `P1` wrong results · `P2` UX/quality · `P3` rare/nice-to-have |
| Phase | Implementation phase that owns coverage |

---

## 1. Data Ingestion & Preprocessing

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| D-01 | Hugging Face dataset ID invalid / renamed / private | Data Loader | Clear startup error; optionally fall back to local `data/processed/` cache | P0 | 1, 6 |
| D-02 | Network unavailable while loading remote dataset | Data Loader | Use local cache if present; else show actionable offline error | P0 | 1, 6 |
| D-03 | Dataset schema differs from expected column names | Preprocess | Fail fast with missing-column report; adapt mapping if aliases known | P0 | 1 |
| D-04 | Rating values like `"NEW"`, `"-"`, `"4.1/5"`, blank | Preprocess | Parse numeric rates; treat non-numeric as missing | P1 | 1 |
| D-05 | Cost values like `"1,200"`, `"-"`, blank, outliers | Preprocess | Strip commas → numeric; mark invalid as missing | P1 | 1 |
| D-06 | Cuisines missing, empty string, or messy separators | Preprocess | Normalize to empty list / skip cuisine match for that row carefully | P1 | 1 |
| D-07 | Duplicate restaurant rows (same name + location) | Preprocess / Filter | Deduplicate or keep highest-voted/rated row before shortlisting | P2 | 1, 2 |
| D-08 | Restaurant name missing / blank | Preprocess | Drop row; never send nameless candidates to LLM/UI | P1 | 1 |
| D-09 | Extremely long `dish_liked` / review-like fields | Preprocess / Prompt | Truncate enrichment fields before prompt construction | P2 | 1, 3 |
| D-10 | Local cache corrupted or partially written | Data Loader | Detect read failure; re-download / rebuild cache | P1 | 1, 6 |
| D-11 | Dataset much larger than expected (memory pressure) | Data Layer | Keep only needed columns; prefer Parquet; avoid full raw reload every request | P1 | 1, 6 |
| D-12 | Location spelling variants (`"Koramangala 5th Block"` vs `"Koramangala"`) | Preprocess / Filter | Decide match strategy (exact vs contains); document behavior | P1 | 1, 2 |

### Corner notes — Data
- Cleaning must be **idempotent**: re-running preprocess on cleaned data should not break types.
- Missing cost/rating rows should not crash filters; define whether they are excluded or treated as non-matching.

---

## 2. User Input & Preference Validation

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| U-01 | Required fields empty (no location / budget) | Validator / UI | Block submit; show field-level validation messages | P0 | 2, 5 |
| U-02 | Invalid budget value (not low/medium/high) | Validator | Reject with clear error before filtering | P1 | 2 |
| U-03 | Minimum rating out of range (`-1`, `6`, `NaN`) | Validator | Clamp to `[0, 5]` or reject with message | P1 | 2, 5 |
| U-04 | Cuisine string with typos / odd casing (`"italian "`, `"CHINESE"`) | Filter | Case-insensitive trim/normalize before match | P1 | 2 |
| U-05 | Multiple cuisines selected with no overlap in dataset | Filter | Return empty candidates + relax-filters guidance | P1 | 2, 5 |
| U-06 | Additional preferences empty | Orchestrator / Prompt | Allow; omit soft-preference section or pass empty string safely | P2 | 3, 4 |
| U-07 | Additional preferences extremely long / spammy | Validator / Prompt | Truncate to max char limit before LLM call | P2 | 3, 6 |
| U-08 | Conflicting preferences (e.g., low budget + fine dining) | LLM / UI | Still filter hard constraints; let LLM explain tradeoffs among valid candidates | P2 | 3, 5 |
| U-09 | Location not present in dataset | Filter | Empty result + suggest nearby/available locations if possible | P1 | 2, 5 |
| U-10 | Special characters / injection-like text in free-text prefs | Prompt | Treat as plain text; do not execute; escape/serialize safely in prompt JSON | P1 | 3, 6 |
| U-11 | Non-English or emoji-only additional preferences | LLM / UI | Attempt best-effort; if unusable, ignore soft prefs and rank on structured fields | P3 | 3, 5 |
| U-12 | Rapid repeated submits with same/different prefs | UI / Service | Disable button while in-flight; avoid duplicate concurrent LLM calls if possible | P2 | 5, 6 |

---

## 3. Filtering Layer

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| F-01 | No restaurants match all hard filters | Filter / Orchestrator | Return empty list; UI shows relax-constraints message; **do not call LLM** | P0 | 2, 4, 5 |
| F-02 | Too many matches (thousands) | Filter | Sort by rating/votes; truncate to `TOP_N_CANDIDATES` | P0 | 2, 6 |
| F-03 | Exact boundary budget values (`500`, `1000`) | Filter | Apply inclusive band rules consistently (`≤500` low, `501–1000` medium) | P1 | 2 |
| F-04 | Restaurant cost missing after cleaning | Filter | Exclude from budget-constrained queries (default) or document alternate policy | P1 | 2 |
| F-05 | Restaurant rating missing | Filter | Exclude when `min_rating` is set; include only if policy explicitly allows | P1 | 2 |
| F-06 | Cuisine partial match (`"North Indian"` vs `"Indian"`) | Filter | Define overlap rule (substring vs token); avoid false positives if too loose | P1 | 2 |
| F-07 | Multi-cuisine restaurant should match if any cuisine overlaps | Filter | Match on any overlap, not all | P1 | 2 |
| F-08 | Location contains-match too broad (`"Bangalore"` matches everything) | Filter | Prefer locality field; if city-wide selected, still cap top-N | P1 | 2 |
| F-09 | All matching rows have identical rating | Filter | Use votes (then name) as stable tie-breaker | P2 | 2 |
| F-10 | `TOP_N_CANDIDATES` configured as `0` or negative | Config / Filter | Fail validation at startup or coerce to safe minimum (e.g., 1) | P1 | 0, 6 |
| F-11 | Filters individually pass but intersection is empty | Filter / UI | Empty-state should hint which constraint is likely too strict if easy to detect | P2 | 2, 5 |
| F-12 | Only 1 candidate survives filters | Orchestrator / LLM | Still return 1 recommendation; summary should not imply a large comparison set | P2 | 3, 4 |

### Corner notes — Filtering
- Hard constraints must never be “softened” by the LLM.
- Candidate cap is mandatory for cost/latency control even when matches are excellent.

---

## 4. Prompt Construction

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| P-01 | Candidate payload too large for model context | Prompt Builder | Enforce max N + compact fields only; truncate long text fields | P0 | 3, 6 |
| P-02 | Candidate fields contain quotes/newlines breaking prompt format | Prompt Builder | Serialize as JSON (not fragile string concat) | P1 | 3 |
| P-03 | Soft preferences contradict hard-filtered candidate attributes | Prompt | Instruct model to rank within candidates only; explain imperfect fit honestly | P2 | 3 |
| P-04 | Missing optional enrichment fields (`dish_liked`, `rest_type`) | Prompt | Omit nulls; do not invent values in the candidate payload | P1 | 3 |
| P-05 | Prompt accidentally includes full dataset | Prompt / Guardrail | Hard assert candidate count ≤ `TOP_N_CANDIDATES` before API call | P0 | 3, 6 |

---

## 5. LLM Client, Parsing & Ranking

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| L-01 | Missing / invalid `LLM_API_KEY` | LLM Client | Fail clearly at call time; trigger deterministic fallback if enabled | P0 | 3, 6 |
| L-02 | API quota exceeded / rate limited (429) | LLM Client | Retry with backoff once (optional) then fallback ranking | P0 | 3, 6 |
| L-03 | LLM timeout | LLM Client | Abort per `REQUEST_TIMEOUT`; fallback ranking | P0 | 3, 6 |
| L-04 | Provider 5xx / network error | LLM Client | Fallback ranking; log error without exposing secrets | P0 | 3, 6 |
| L-05 | Response is prose, not JSON | Parser | Retry once with stricter instruction; then fallback | P0 | 3, 6 |
| L-06 | JSON wrapped in markdown fences (` ```json `) | Parser | Strip fences before `json.loads` | P1 | 3 |
| L-07 | JSON valid but missing required fields | Parser | Reject schema; retry/fallback | P1 | 3, 6 |
| L-08 | Extra unexpected fields in JSON | Parser | Ignore extras; keep known schema fields | P2 | 3, 6 |
| L-09 | Hallucinated restaurant names not in candidates | Parser | Drop invalid rows; keep only allowlisted names | P0 | 3, 4 |
| L-10 | LLM returns restaurants that violate hard filters | Parser / Orchestrator | Prefer candidate snapshot values for rating/cost/cuisine; drop if name unknown | P0 | 3, 4 |
| L-11 | Duplicate names in LLM output | Parser | Dedupe by name; keep best/first rank | P2 | 3 |
| L-12 | Empty `recommendations` array from LLM despite candidates | Parser / Orchestrator | Treat as failure → fallback deterministic ranking | P1 | 3, 4 |
| L-13 | Rank numbers missing, non-sequential, or conflicting | Parser | Reassign ranks by list order after validation | P2 | 3 |
| L-14 | Explanations empty / generic / copy-pasted | Quality / UI | Accept for MVP; optionally regenerate once if all blank | P2 | 3, 6 |
| L-15 | LLM returns more than `TOP_K_RESULTS` | Orchestrator | Truncate to top-K after validation | P2 | 4 |
| L-16 | LLM returns fewer than available good candidates | Orchestrator | Accept; optionally backfill from leftover candidates via fallback templates | P2 | 4, 6 |
| L-17 | Model alters rating/cost values | Orchestrator | Overwrite display metrics from source candidate record | P1 | 4 |
| L-18 | Dry-run / mock mode enabled | LLM Client | Return fixture JSON; no external network call | P2 | 3, 6 |

### Corner notes — LLM
- Grounding rule: **candidates-only**. Anything outside the shortlist is invalid.
- One retry max on parse failure to control cost (per architecture/implementation plan).

---

## 6. Orchestrator / End-to-End Service

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| O-01 | Happy path: matches found + valid LLM JSON | Orchestrator | Return ranked recommendations + summary + meta | P0 | 4 |
| O-02 | No candidates after filter | Orchestrator | Early return empty-state; skip LLM | P0 | 4 |
| O-03 | Candidates found + LLM fails | Orchestrator | Deterministic top-N by rating/votes + template explanations; `fallback_used=true` | P0 | 4, 6 |
| O-04 | Partial valid LLM rows (some hallucinated) | Orchestrator | Return sanitized subset; if none remain, fallback | P1 | 4 |
| O-05 | Exception thrown mid-pipeline | Orchestrator | Catch, log, return controlled error payload (no stack trace in UI) | P0 | 4, 6 |
| O-06 | `TOP_K_RESULTS` > candidate count | Orchestrator | Return only available candidates | P2 | 4 |
| O-07 | Meta fields missing in response model | Schemas | Always include `candidate_count`, `fallback_used` | P2 | 4 |
| O-08 | Concurrent recommendation requests | Service | Thread-safe read of shared dataset cache; no cross-request state bleed | P1 | 4, 6 |

---

## 7. UI / Presentation

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| UI-01 | Empty results | UI | Friendly message + suggestions to relax location/budget/rating/cuisine | P0 | 5 |
| UI-02 | LLM call in progress | UI | Loading indicator; disable submit to prevent duplicate sends | P1 | 5 |
| UI-03 | Fallback used | UI | Optional subtle notice that results are rating-based fallback | P2 | 5, 6 |
| UI-04 | Very long explanation text | UI | Wrap/clamp with readable layout; no horizontal overflow | P2 | 5 |
| UI-05 | Missing optional summary | UI | Hide summary section; still show recommendation rows | P2 | 5 |
| UI-06 | Dropdown location list huge | UI | Searchable select / typeahead if needed | P2 | 5 |
| UI-07 | User clears form after results shown | UI | Reset results or keep last results intentionally; avoid stale mismatch confusion | P2 | 5 |
| UI-08 | App start before dataset finished loading | UI | Show startup loading / disable form until data ready | P0 | 5, 6 |
| UI-09 | Display of `null` rating/cost slips through | UI | Render “N/A” rather than blank/crash | P1 | 5 |
| UI-10 | Browser refresh mid-request | UI | Safe remount; no corrupted session state | P2 | 5 |

---

## 8. Configuration, Secrets & Environment

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| C-01 | `.env` missing | Config | Use defaults where safe; fail clearly if API key required and fallback disabled | P0 | 0, 6 |
| C-02 | Secrets accidentally printed in logs | Observability | Never log API keys; redact sensitive env values | P0 | 6 |
| C-03 | Invalid numeric config (`TOP_N`, timeouts) | Config | Validate at startup; refuse unsafe values | P1 | 0, 6 |
| C-04 | Budget thresholds mis-ordered (`LOW_MAX` ≥ `MED_MAX`) | Config | Startup validation error | P1 | 0, 2 |
| C-05 | Wrong model name configured | LLM Client | Surface provider error; fallback if enabled | P1 | 3, 6 |
| C-06 | `DATASET_ID` points to wrong dataset | Data Loader | Schema checks catch mismatch early | P0 | 1 |

---

## 9. Performance, Cost & Reliability

| ID | Scenario | Layer | Expected behavior | Severity | Phase |
| --- | --- | --- | --- | --- | --- |
| R-01 | Cold start reloads full dataset every time | Data Layer | Cache cleaned frame in memory / local processed file | P1 | 1, 6 |
| R-02 | Demo latency feels too high | UI / LLM | Show spinner; keep candidate N small; compact prompt | P1 | 5, 6 |
| R-03 | Accidental retry storms to LLM | Client | Cap retries (max 1 parse retry); no unbounded loops | P0 | 6 |
| R-04 | Token cost spike from verbose candidate fields | Prompt | Send only required columns; truncate long strings | P1 | 3, 6 |
| R-05 | Fallback path itself fails (empty candidates somehow) | Orchestrator | Return empty-state, not a secondary crash | P0 | 6 |
| R-06 | Logging volume too noisy for demo | Observability | Structured concise logs: filter counts, latency, parse/fallback flags | P3 | 6 |

---

## 10. Demo Scenarios (Must Cover)

These map to Phase 7 demo preparation and should be rehearsed explicitly:

| Demo | Preference setup | Expected outcome |
| --- | --- | --- |
| Happy path | Popular location + common cuisine + moderate rating/budget | Non-empty ranked list with coherent explanations |
| Tight filters | Rare cuisine + high min rating + low budget + niche location | Empty or very few results; clear relax guidance; no crash |
| Soft preferences | Valid hard filters + “family-friendly / quiet” text | Candidates obey hard filters; explanations reference soft prefs |
| LLM outage drill | Disconnect key / mock provider failure | Fallback ranking still returns usable results |
| Hallucination drill | Fixture LLM response with unknown restaurant names | Parser drops fakes; valid rows remain or fallback triggers |

---

## 11. Expected Handling Matrix (Architecture Alignment)

| Architecture edge case | Primary handling | Fallback |
| --- | --- | --- |
| No restaurants match filters | Early empty return; skip LLM | UI guidance to relax constraints |
| Too many matches | Truncate top-N by rating/votes | N/A (must truncate) |
| LLM timeout / error | Catch in client | Deterministic rating/votes ranking |
| Invalid LLM JSON | One retry | Deterministic ranking |
| Hallucinated restaurant names | Allowlist filter vs candidates | If none left → deterministic ranking |
| Altered metrics from LLM | Overwrite from source candidate data | Keep source-of-truth fields |

---

## 12. Suggested Test Checklist (Quick)

Use as a Phase 6 regression list:

- [ ] D-04 / D-05 dirty rating & cost values clean without crash
- [ ] U-01 empty required fields blocked in UI
- [ ] F-01 no-match returns empty and does not call LLM
- [ ] F-02 over-match truncates to `TOP_N_CANDIDATES`
- [ ] F-03 budget boundaries inclusive as documented
- [ ] L-05 non-JSON response retries then falls back
- [ ] L-09 hallucinated names removed
- [ ] L-17 displayed rating/cost match dataset values
- [ ] O-03 LLM failure still returns recommendations
- [ ] UI-01 empty-state copy is shown
- [ ] UI-08 form disabled until data loaded
- [ ] C-02 API key never appears in logs

---

## 13. Priority Order for Implementation

Handle in this order while building:

1. **P0 correctness/reliability:** F-01, F-02, L-01–L-05, L-09, O-02, O-03, UI-01, UI-08  
2. **P1 data/filter truthfulness:** D-04–D-06, U-03–U-05, F-03–F-08, L-10, L-17  
3. **P2 UX/quality:** explanations, summaries, truncation, notices, tie-breaks  
4. **P3 rare polish:** emoji/non-English soft prefs, log noise tuning

---

## 14. Traceability

| Source | Edge-case coverage |
| --- | --- |
| `architecture.md` §4.6 Orchestrator table | F-01, F-02, L-03, L-05, L-09 |
| `architecture.md` Reliability / grounding rules | L-09, L-10, L-17, O-03 |
| `implementation-plan.md` Phase 2 tests | F-01, F-02, exact/no-match/over-match |
| `implementation-plan.md` Phase 6 hardening | L-01–L-06, O-03, R-01–R-03 |
| `implementation-plan.md` Risk register | D-01, D-03, F-03 budget calibration, L-09, R-02, L-01 |
| `implementation-plan.md` Demo scenarios | Section 10 above |

---

## Immediate Use

When implementing Phase 6, turn **Section 12** into automated/manual regression fixtures and keep this file updated if new failure modes appear during testing.
