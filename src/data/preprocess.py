"""Clean and normalize Zomato restaurant records.

Cleaning is idempotent: re-running `preprocess_restaurants` on an already-cleaned
frame should not change dtypes or values in a breaking way.
"""

from __future__ import annotations

import re
from typing import Any

import pandas as pd

from src.config import Settings, settings
from src.data.loader import (
    load_raw_dataframe,
    processed_cache_path,
    save_dataframe,
)

COST_COL_RAW = "approx_cost(for two people)"
COST_COL = "approx_cost"
CUISINES_LIST_COL = "cuisines_list"

# Non-numeric rating tokens commonly found in the Zomato Bangalore dump.
INVALID_RATES = {"", "-", "NEW", "new", "nan", "none", "null"}


def _as_clean_str(value: Any) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none", "null"}:
        return None
    return text


def normalize_rating(value: Any) -> float | None:
    """Convert values like '4.1/5' to 4.1; return None for NEW/- /blank."""
    text = _as_clean_str(value)
    if text is None or text in INVALID_RATES:
        return None

    # Already numeric or numeric string
    try:
        rating = float(text)
        return rating if 0.0 <= rating <= 5.0 else None
    except ValueError:
        pass

    match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*5", text)
    if match:
        rating = float(match.group(1))
        return rating if 0.0 <= rating <= 5.0 else None

    match = re.search(r"(\d+(?:\.\d+)?)", text)
    if match:
        rating = float(match.group(1))
        return rating if 0.0 <= rating <= 5.0 else None

    return None


def normalize_cost(value: Any) -> float | None:
    """Convert values like '1,200' to 1200.0."""
    text = _as_clean_str(value)
    if text is None or text in {"-", "NEW"}:
        return None

    cleaned = re.sub(r"[^\d.]", "", text.replace(",", ""))
    if not cleaned:
        return None
    try:
        cost = float(cleaned)
    except ValueError:
        return None
    return cost if cost >= 0 else None


def normalize_cuisines(value: Any) -> list[str]:
    """Split cuisine string into a lowercase trimmed list."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return []
    # Idempotent for already-processed list values (e.g. reloaded parquet).
    if isinstance(value, (list, tuple, set)):
        return [str(item).strip().lower() for item in value if str(item).strip()]
    text = _as_clean_str(value)
    if text is None:
        return []
    parts = [p.strip().lower() for p in text.split(",")]
    return [p for p in parts if p]


def preprocess_restaurants(df: pd.DataFrame) -> pd.DataFrame:
    """
    Return a cleaned restaurant dataframe.

    - Drops rows with missing restaurant names
    - Normalizes rate → float `rate`
    - Normalizes cost → float `approx_cost`
    - Adds `cuisines_list` while keeping original `cuisines` string (lowercased)
    - Trims location / rest_type / dish_liked
    """
    out = df.copy()

    # Ensure expected raw cost column can be reprocessed from either name.
    if COST_COL in out.columns and COST_COL_RAW not in out.columns:
        out[COST_COL_RAW] = out[COST_COL]

    if "name" not in out.columns:
        raise ValueError("Input dataframe must include a 'name' column")

    out["name"] = out["name"].map(_as_clean_str)
    out = out.dropna(subset=["name"]).reset_index(drop=True)

    out["location"] = out.get("location", pd.Series([None] * len(out))).map(_as_clean_str)
    out["rest_type"] = out.get("rest_type", pd.Series([None] * len(out))).map(_as_clean_str)
    out["dish_liked"] = out.get("dish_liked", pd.Series([None] * len(out))).map(_as_clean_str)
    out["online_order"] = out.get("online_order", pd.Series([None] * len(out))).map(_as_clean_str)
    out["book_table"] = out.get("book_table", pd.Series([None] * len(out))).map(_as_clean_str)
    out["listed_in(type)"] = out.get("listed_in(type)", pd.Series([None] * len(out))).map(
        _as_clean_str
    )
    out["listed_in(city)"] = out.get("listed_in(city)", pd.Series([None] * len(out))).map(
        _as_clean_str
    )

    rate_source = out["rate"] if "rate" in out.columns else pd.Series([None] * len(out))
    # If already numeric from a previous clean, keep values; still map through normalizer.
    out["rate"] = rate_source.map(normalize_rating)

    cost_source = (
        out[COST_COL_RAW]
        if COST_COL_RAW in out.columns
        else out.get(COST_COL, pd.Series([None] * len(out)))
    )
    out[COST_COL] = cost_source.map(normalize_cost)

    cuisine_source = out["cuisines"] if "cuisines" in out.columns else pd.Series([None] * len(out))
    out[CUISINES_LIST_COL] = cuisine_source.map(normalize_cuisines)
    out["cuisines"] = out[CUISINES_LIST_COL].map(
        lambda items: ", ".join(items) if items else None
    )

    if "votes" in out.columns:
        out["votes"] = pd.to_numeric(out["votes"], errors="coerce").fillna(0).astype(int)
    else:
        out["votes"] = 0

    # Stable column order for cache / downstream filters.
    ordered = [
        "name",
        "location",
        "cuisines",
        CUISINES_LIST_COL,
        COST_COL,
        "rate",
        "votes",
        "rest_type",
        "dish_liked",
        "online_order",
        "book_table",
        "listed_in(type)",
        "listed_in(city)",
    ]
    return out.loc[:, ordered]


def build_cleaned_dataset(
    *,
    cfg: Settings | None = None,
    force_download: bool = False,
    save: bool = True,
) -> pd.DataFrame:
    """Load raw data, preprocess, and optionally persist parquet cache."""
    cfg = cfg or settings
    raw = load_raw_dataframe(cfg=cfg, force_download=force_download)
    cleaned = preprocess_restaurants(raw)
    if save:
        save_dataframe(cleaned, processed_cache_path(cfg))
    return cleaned


def summarize_dataset(df: pd.DataFrame) -> dict[str, Any]:
    """Return a compact data-quality summary for CLI / docs."""
    null_rates = {
        col: float(df[col].isna().mean())
        for col in ["name", "location", "cuisines", COST_COL, "rate", "votes"]
        if col in df.columns
    }
    sample_cuisines: list[str] = []
    if CUISINES_LIST_COL in df.columns:
        for items in df[CUISINES_LIST_COL].dropna().head(200):
            for cuisine in items:
                if cuisine not in sample_cuisines:
                    sample_cuisines.append(cuisine)
                if len(sample_cuisines) >= 15:
                    break
            if len(sample_cuisines) >= 15:
                break

    locations = (
        sorted(df["location"].dropna().astype(str).unique().tolist())
        if "location" in df.columns
        else []
    )

    return {
        "row_count": int(len(df)),
        "null_rates": null_rates,
        "unique_locations": len(locations),
        "sample_locations": locations[:10],
        "sample_cuisines": sample_cuisines,
        "rate_min": float(df["rate"].min()) if "rate" in df.columns else None,
        "rate_max": float(df["rate"].max()) if "rate" in df.columns else None,
        "cost_median": float(df[COST_COL].median()) if COST_COL in df.columns else None,
    }
