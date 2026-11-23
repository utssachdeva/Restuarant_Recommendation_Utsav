"""End-to-end recommendation orchestrator (Phase 4).

Pipeline: validate prefs → filter → LLM rank/explain → parse → top-K response.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from typing import Any

import pandas as pd
from pydantic import ValidationError

from src.config import Settings, settings
from src.data.loader import load_restaurants, processed_cache_path
from src.data.preprocess import build_cleaned_dataset
from src.filters.restaurant_filter import shortlist_restaurants
from src.llm.client import LLMError, complete_recommendations
from src.llm.parser import ParseError, parse_recommendations
from src.models.schemas import (
    RecommendationMeta,
    RecommendationResponse,
    UserPreferences,
)

logger = logging.getLogger(__name__)

EMPTY_SUMMARY = (
    "No restaurants matched your filters. "
    "Try a different location, cuisine, budget, or lower the minimum rating."
)


def load_restaurant_frame(cfg: Settings | None = None) -> pd.DataFrame:
    """Load cleaned restaurants from cache, building it on first use."""
    cfg = cfg or settings
    if processed_cache_path(cfg).exists():
        return load_restaurants(cfg=cfg, prefer_processed=True)
    logger.info("Processed cache missing; building cleaned dataset")
    return build_cleaned_dataset(cfg=cfg, save=True)


def _coerce_preferences(preferences: UserPreferences | dict[str, Any]) -> UserPreferences:
    if isinstance(preferences, UserPreferences):
        return preferences
    return UserPreferences.model_validate(preferences)


def recommend(
    preferences: UserPreferences | dict[str, Any],
    *,
    df: pd.DataFrame | None = None,
    cfg: Settings | None = None,
    top_n: int | None = None,
    top_k: int | None = None,
    dry_run: bool | None = None,
) -> RecommendationResponse:
    """
    Run the full recommendation pipeline and return a typed response.

    Empty hard-filter matches return an empty recommendation list with guidance.
    LLM / parse failures raise LLMError or ParseError (fallback lands in Phase 6).
    """
    cfg = cfg or settings
    limit_k = top_k if top_k is not None else cfg.top_k_results
    use_dry_run = cfg.llm_dry_run if dry_run is None else dry_run

    try:
        prefs = _coerce_preferences(preferences)
    except ValidationError as exc:
        raise ValueError(f"Invalid preferences: {exc}") from exc

    frame = df if df is not None else load_restaurant_frame(cfg)
    candidates = shortlist_restaurants(frame, prefs, cfg=cfg, top_n=top_n)
    candidate_count = len(candidates)

    meta = RecommendationMeta(
        candidate_count=candidate_count,
        result_count=0,
        fallback_used=False,
        model=cfg.llm_model,
        dry_run=bool(use_dry_run),
    )

    if not candidates:
        logger.info(
            "No candidates for location=%r budget=%s cuisine=%s min_rating=%s",
            prefs.location,
            [b.value for b in prefs.budget],
            prefs.cuisine,
            prefs.min_rating,
        )
        meta.empty_reason = "no_filter_matches"
        return RecommendationResponse(summary=EMPTY_SUMMARY, recommendations=[], meta=meta)

    raw = complete_recommendations(
        prefs,
        candidates,
        cfg=cfg,
        top_k=limit_k,
        dry_run=use_dry_run,
    )
    parsed = parse_recommendations(raw, candidates, top_k=limit_k)

    meta.result_count = len(parsed.recommendations)
    logger.info(
        "recommend ok candidates=%s results=%s dry_run=%s",
        candidate_count,
        meta.result_count,
        use_dry_run,
    )
    return RecommendationResponse(
        summary=parsed.summary,
        recommendations=parsed.recommendations,
        meta=meta,
    )


def _demo_cases() -> list[tuple[str, UserPreferences]]:
    return [
        (
            "happy-path",
            UserPreferences(
                location="Koramangala",
                budget="medium",
                cuisine=["italian"],
                min_rating=4.0,
                additional_preferences="casual dining, good for groups",
            ),
        ),
        (
            "empty-filter",
            UserPreferences(
                location="Atlantis",
                budget="low",
                cuisine=["martian"],
                min_rating=4.9,
                additional_preferences="",
            ),
        ),
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Phase 4 recommendation orchestrator CLI")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Use mock LLM response (also enabled via LLM_DRY_RUN=true)",
    )
    parser.add_argument(
        "--case",
        choices=["happy-path", "empty-filter", "all"],
        default="all",
        help="Which demo preference set to run",
    )
    args = parser.parse_args(argv)

    dry_run = bool(args.dry_run or settings.llm_dry_run)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    print(f"model: {settings.llm_model}")
    print(f"dry_run: {dry_run}")
    print(f"top_k: {settings.top_k_results}")
    print()

    frame = load_restaurant_frame()
    cases = _demo_cases()
    if args.case != "all":
        cases = [(label, prefs) for label, prefs in cases if label == args.case]

    exit_code = 0
    for label, prefs in cases:
        print(f"=== {label} ===")
        print(
            f"prefs: location={prefs.location!r}, "
            f"budget={[b.value for b in prefs.budget]}, "
            f"cuisine={prefs.cuisine}, min_rating={prefs.min_rating}"
        )
        try:
            response = recommend(prefs, df=frame, dry_run=dry_run)
        except (LLMError, ParseError, ValueError) as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            exit_code = 1
            print()
            continue

        print(json.dumps(response.model_dump(), ensure_ascii=False, indent=2))
        print()

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
