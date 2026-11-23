"""CLI for Phase 1 data ingestion / inspection.

Usage (from project root):
    python -m src.data
    python -m src.data --force-download
"""

from __future__ import annotations

import argparse
import json

from src.data.loader import processed_cache_path, raw_cache_path
from src.data.preprocess import build_cleaned_dataset, summarize_dataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Load, clean, cache, and inspect the Zomato dataset."
    )
    parser.add_argument(
        "--force-download",
        action="store_true",
        help="Ignore local raw cache and re-download from Hugging Face.",
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Skip writing processed parquet cache.",
    )
    parser.add_argument(
        "--sample",
        type=int,
        default=5,
        help="Number of sample rows to print (default: 5).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cleaned = build_cleaned_dataset(
        force_download=args.force_download,
        save=not args.no_save,
    )
    summary = summarize_dataset(cleaned)

    print("=== Data quality summary ===")
    print(json.dumps(summary, indent=2))
    print()
    print(f"Raw cache:       {raw_cache_path()}")
    print(f"Processed cache: {processed_cache_path()}")
    print()
    print(f"=== Sample restaurants (top {args.sample}) ===")
    cols = ["name", "location", "cuisines", "rate", "approx_cost"]
    print(cleaned.loc[:, cols].head(args.sample).to_string(index=False))


if __name__ == "__main__":
    main()
