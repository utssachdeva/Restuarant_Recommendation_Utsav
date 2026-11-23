"""CLI checkpoint for Phase 3 LLM integration.

Usage (from project root):
    # Offline mock (no API key required)
    python -m src.llm --dry-run

    # Live Groq call (requires LLM_API_KEY in .env)
    python -m src.llm
"""

from __future__ import annotations

import argparse
import json
import sys

from src.config import settings
from src.data.loader import load_restaurants
from src.data.preprocess import build_cleaned_dataset
from src.filters.restaurant_filter import shortlist_restaurants
from src.llm.client import LLMError, complete_recommendations
from src.llm.parser import ParseError, parse_recommendations
from src.models.schemas import UserPreferences


def _load_df():
    try:
        return load_restaurants(prefer_processed=True)
    except FileNotFoundError:
        return build_cleaned_dataset(save=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Phase 3 LLM ranking checkpoint")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Use mock LLM response (also enabled via LLM_DRY_RUN=true)",
    )
    args = parser.parse_args(argv)

    dry_run = bool(args.dry_run or settings.llm_dry_run)
    prefs = UserPreferences(
        location="Koramangala",
        budget="medium",
        cuisine=["italian"],
        min_rating=4.0,
        additional_preferences="casual dining, good for groups",
    )

    df = _load_df()
    candidates = shortlist_restaurants(df, prefs)

    print(f"model: {settings.llm_model}")
    print(f"dry_run: {dry_run}")
    print(
        f"prefs: location={prefs.location!r}, budget={[b.value for b in prefs.budget]}, "
        f"cuisine={prefs.cuisine}, min_rating={prefs.min_rating}"
    )
    print(f"candidate_count: {len(candidates)}")
    if not candidates:
        print("No candidates — relax filters and retry.")
        return 1

    print("candidates (top 5):")
    for idx, item in enumerate(candidates[:5], start=1):
        print(
            f"  {idx}. {item.name} | rate={item.rate} | "
            f"cost={item.approx_cost} | {item.cuisines}"
        )

    # Hallucination guard smoke-check on parser (offline).
    fake_raw = json.dumps(
        {
            "summary": "parser allowlist test",
            "recommendations": [
                {
                    "rank": 1,
                    "name": candidates[0].name,
                    "cuisine": candidates[0].cuisines or "",
                    "rating": candidates[0].rate,
                    "estimated_cost": candidates[0].approx_cost,
                    "explanation": "Real candidate kept for preference fit.",
                },
                {
                    "rank": 2,
                    "name": "Definitely Not A Real Restaurant XYZ",
                    "cuisine": "Martian",
                    "rating": 5.0,
                    "estimated_cost": 1,
                    "explanation": "Should be dropped by allowlist.",
                },
            ],
        }
    )
    guarded = parse_recommendations(fake_raw, candidates, top_k=settings.top_k_results)
    assert all(r.name != "Definitely Not A Real Restaurant XYZ" for r in guarded.recommendations)
    print(f"hallucination_filter_ok: {len(guarded.recommendations) == 1}")

    try:
        raw = complete_recommendations(prefs, candidates, dry_run=dry_run)
        parsed = parse_recommendations(raw, candidates, top_k=settings.top_k_results)
    except (LLMError, ParseError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print()
    print("=== ranked recommendations ===")
    print(json.dumps(parsed.model_dump(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
