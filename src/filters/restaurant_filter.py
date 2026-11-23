"""Deterministic restaurant filtering for hard preference constraints."""

from __future__ import annotations

from typing import Any

import pandas as pd

from src.config import Settings, settings
from src.data.preprocess import COST_COL, CUISINES_LIST_COL
from src.models.schemas import RestaurantCandidate, UserPreferences


def _location_match(series: pd.Series, location: str) -> pd.Series:
    """Case-insensitive exact or contains match on location."""
    needle = location.strip().lower()
    haystack = series.fillna("").astype(str).str.strip().str.lower()
    return (haystack == needle) | haystack.str.contains(needle, regex=False)


def _locations_match(series: pd.Series, locations: list[str]) -> pd.Series:
    """True when the row matches any requested location."""
    mask = pd.Series(False, index=series.index)
    for location in locations:
        cleaned = location.strip()
        if cleaned:
            mask |= _location_match(series, cleaned)
    return mask


def _cuisine_overlap_mask(cuisine_lists: pd.Series, wanted: list[str]) -> pd.Series:
    """True when any requested cuisine appears in the restaurant cuisine list."""
    wanted_set = {c.strip().lower() for c in wanted if c.strip()}
    if not wanted_set:
        return pd.Series([True] * len(cuisine_lists), index=cuisine_lists.index)

    def has_overlap(items: Any) -> bool:
        if items is None or (isinstance(items, float) and pd.isna(items)):
            return False
        if isinstance(items, str):
            restaurant_set = {part.strip().lower() for part in items.split(",") if part.strip()}
        else:
            restaurant_set = {str(part).strip().lower() for part in items if str(part).strip()}
        return bool(restaurant_set & wanted_set)

    return cuisine_lists.map(has_overlap)


def _single_budget_mask(costs: pd.Series, level: str, cfg: Settings) -> pd.Series:
    min_cost, max_cost = cfg.budget_band(level)
    # Missing cost cannot satisfy a budget hard-constraint.
    valid = costs.notna()
    if min_cost is not None:
        valid &= costs >= min_cost
    if max_cost is not None:
        valid &= costs <= max_cost
    return valid


def _budget_mask(costs: pd.Series, prefs: UserPreferences, cfg: Settings) -> pd.Series:
    """True when cost falls in any selected spend band."""
    mask = pd.Series(False, index=costs.index)
    for level in prefs.budget:
        label = level.value if hasattr(level, "value") else str(level)
        mask |= _single_budget_mask(costs, label, cfg)
    return mask


def filter_restaurants(
    df: pd.DataFrame,
    preferences: UserPreferences,
    *,
    cfg: Settings | None = None,
    top_n: int | None = None,
) -> pd.DataFrame:
    """
    Apply hard filters and return a bounded candidate dataframe.

    Sort order: rate desc (nulls last), then votes desc, then name asc.
    """
    cfg = cfg or settings
    limit = top_n if top_n is not None else cfg.top_n_candidates
    if limit < 1:
        raise ValueError("top_n must be >= 1")

    if df.empty:
        return df.copy()

    required = {"name", "location", COST_COL, "rate", "votes"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Dataframe missing required columns: {sorted(missing)}")

    mask = _locations_match(df["location"], preferences.location)

    if preferences.cuisine:
        cuisine_col = CUISINES_LIST_COL if CUISINES_LIST_COL in df.columns else "cuisines"
        mask &= _cuisine_overlap_mask(df[cuisine_col], preferences.cuisine)

    # Missing ratings are excluded when a minimum rating is requested.
    if preferences.min_rating > 0:
        mask &= df["rate"].notna() & (df["rate"] >= preferences.min_rating)

    mask &= _budget_mask(df[COST_COL], preferences, cfg)

    filtered = df.loc[mask].copy()
    if filtered.empty:
        return filtered

    filtered = filtered.sort_values(
        by=["rate", "votes", "name"],
        ascending=[False, False, True],
        na_position="last",
    )
    # Dataset has repeated listings; keep the strongest row per restaurant+area.
    filtered = filtered.drop_duplicates(subset=["name", "location"], keep="first")
    return filtered.head(limit).reset_index(drop=True)


def to_candidates(df: pd.DataFrame) -> list[RestaurantCandidate]:
    """Convert a filtered dataframe into RestaurantCandidate models."""
    candidates: list[RestaurantCandidate] = []
    for row in df.to_dict(orient="records"):
        candidates.append(RestaurantCandidate.model_validate(row))
    return candidates


def shortlist_restaurants(
    df: pd.DataFrame,
    preferences: UserPreferences,
    *,
    cfg: Settings | None = None,
    top_n: int | None = None,
) -> list[RestaurantCandidate]:
    """Filter + convert helper used by later orchestrator phases."""
    filtered = filter_restaurants(df, preferences, cfg=cfg, top_n=top_n)
    return to_candidates(filtered)


def assert_hard_constraints(
    candidates: list[RestaurantCandidate],
    preferences: UserPreferences,
    *,
    cfg: Settings | None = None,
) -> None:
    """Raise AssertionError if any candidate violates hard constraints."""
    cfg = cfg or settings
    location_needles = [loc.strip().lower() for loc in preferences.location if loc.strip()]
    wanted = {c.strip().lower() for c in preferences.cuisine if c.strip()}
    budget_labels = [
        level.value if hasattr(level, "value") else str(level) for level in preferences.budget
    ]

    for candidate in candidates:
        loc = (candidate.location or "").strip().lower()
        if not any(needle == loc or needle in loc for needle in location_needles):
            raise AssertionError(f"Location mismatch for {candidate.name}: {candidate.location}")

        if preferences.min_rating > 0:
            if candidate.rate is None or candidate.rate < preferences.min_rating:
                raise AssertionError(f"Rating mismatch for {candidate.name}: {candidate.rate}")

        if candidate.approx_cost is None:
            raise AssertionError(f"Missing cost for {candidate.name}")
        cost = candidate.approx_cost
        in_any_band = False
        for label in budget_labels:
            min_cost, max_cost = cfg.budget_band(label)
            if min_cost is not None and cost < min_cost:
                continue
            if max_cost is not None and cost > max_cost:
                continue
            in_any_band = True
            break
        if not in_any_band:
            raise AssertionError(f"Budget band violated for {candidate.name}")

        if wanted:
            cuisine_set = {c.strip().lower() for c in candidate.cuisines_list}
            if not (cuisine_set & wanted):
                # Fallback to comma string if list empty
                if candidate.cuisines:
                    cuisine_set = {
                        part.strip().lower()
                        for part in candidate.cuisines.split(",")
                        if part.strip()
                    }
                if not (cuisine_set & wanted):
                    raise AssertionError(f"Cuisine mismatch for {candidate.name}")
