"""CLI checkpoint for Phase 2 filtering.

Usage (from project root):
    python -m src.filters
"""

from __future__ import annotations

from src.config import settings
from src.data.loader import load_restaurants
from src.data.preprocess import build_cleaned_dataset
from src.filters.restaurant_filter import (
    assert_hard_constraints,
    filter_restaurants,
    shortlist_restaurants,
)
from src.models.schemas import UserPreferences


def _load_df():
    try:
        return load_restaurants(prefer_processed=True)
    except FileNotFoundError:
        return build_cleaned_dataset(save=True)


def main() -> None:
    df = _load_df()
    cases = [
        (
            "exact-match",
            UserPreferences(
                location="Koramangala",
                budget="medium",
                cuisine=["italian"],
                min_rating=4.0,
                additional_preferences="casual dining",
            ),
        ),
        (
            "no-match",
            UserPreferences(
                location="Atlantis",
                budget="low",
                cuisine=["martian"],
                min_rating=4.9,
                additional_preferences="",
            ),
        ),
        (
            "over-match-truncation",
            UserPreferences(
                location="BTM",
                budget="low",
                cuisine=[],
                min_rating=0.0,
                additional_preferences="",
            ),
        ),
    ]

    print(f"Dataset rows: {len(df)}")
    print(f"TOP_N_CANDIDATES: {settings.top_n_candidates}")
    print()

    for label, prefs in cases:
        filtered = filter_restaurants(df, prefs)
        candidates = shortlist_restaurants(df, prefs)
        assert_hard_constraints(candidates, prefs)

        print(f"=== {label} ===")
        print(
            f"prefs: location={prefs.location!r}, budget={[b.value for b in prefs.budget]}, "
            f"cuisine={prefs.cuisine}, min_rating={prefs.min_rating}"
        )
        print(f"candidate_count: {len(candidates)}")
        if settings.top_n_candidates and label == "over-match-truncation":
            assert len(candidates) <= settings.top_n_candidates
            print(f"truncated_ok: {len(candidates) <= settings.top_n_candidates}")
        if not candidates:
            print("top_5: []")
        else:
            print("top_5:")
            for idx, item in enumerate(candidates[:5], start=1):
                print(
                    f"  {idx}. {item.name} | {item.location} | "
                    f"rate={item.rate} | cost={item.approx_cost} | {item.cuisines}"
                )
        print()


if __name__ == "__main__":
    main()
