"""Load the Zomato dataset from Hugging Face or a local processed cache."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import pyarrow.parquet as pq
from huggingface_hub import HfApi, hf_hub_download

from src.config import Settings, settings

# Columns kept for filtering / LLM context. Heavy fields like reviews_list are dropped.
KEEP_COLUMNS = [
    "name",
    "location",
    "cuisines",
    "approx_cost(for two people)",
    "rate",
    "votes",
    "rest_type",
    "dish_liked",
    "online_order",
    "book_table",
    "listed_in(type)",
    "listed_in(city)",
]

PROCESSED_FILENAME = "zomato_clean.parquet"
RAW_FILENAME = "zomato_raw.parquet"
PARQUET_REVISION = "refs/convert/parquet"


def processed_cache_path(cfg: Settings | None = None) -> Path:
    cfg = cfg or settings
    return cfg.data_processed_dir / PROCESSED_FILENAME


def raw_cache_path(cfg: Settings | None = None) -> Path:
    cfg = cfg or settings
    return cfg.data_processed_dir / RAW_FILENAME


def _select_columns(df: pd.DataFrame) -> pd.DataFrame:
    missing = [c for c in KEEP_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            "Dataset is missing required columns: "
            + ", ".join(missing)
            + f". Available: {list(df.columns)}"
        )
    return df.loc[:, KEEP_COLUMNS].copy()


def _list_parquet_shards(dataset_id: str) -> list[str]:
    api = HfApi()
    files = api.list_repo_files(
        repo_id=dataset_id,
        repo_type="dataset",
        revision=PARQUET_REVISION,
    )
    shards = sorted(
        path
        for path in files
        if path.startswith("default/train/") and path.endswith(".parquet")
    )
    if not shards:
        raise RuntimeError(
            f"No parquet shards found for '{dataset_id}' at revision '{PARQUET_REVISION}'"
        )
    return shards


def load_from_huggingface(
    dataset_id: str | None = None,
    *,
    cfg: Settings | None = None,
) -> pd.DataFrame:
    """
    Download HF auto-converted parquet shards and read only required columns.

    Column projection avoids loading huge fields such as reviews_list.
    """
    cfg = cfg or settings
    dataset_id = dataset_id or cfg.dataset_id
    cfg.data_raw_dir.mkdir(parents=True, exist_ok=True)

    frames: list[pd.DataFrame] = []
    for shard in _list_parquet_shards(dataset_id):
        local_path = hf_hub_download(
            repo_id=dataset_id,
            filename=shard,
            repo_type="dataset",
            revision=PARQUET_REVISION,
            local_dir=str(cfg.data_raw_dir),
        )
        table = pq.read_table(local_path, columns=KEEP_COLUMNS)
        frames.append(table.to_pandas())

    if not frames:
        raise RuntimeError(f"No rows returned from dataset '{dataset_id}'")

    df = pd.concat(frames, ignore_index=True)
    return _select_columns(df)


def save_dataframe(df: pd.DataFrame, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path, index=False)
    return path


def load_cached_dataframe(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Cache not found: {path}")
    return pd.read_parquet(path)


def load_raw_dataframe(
    *,
    cfg: Settings | None = None,
    force_download: bool = False,
    cache_raw: bool = True,
) -> pd.DataFrame:
    """
    Load raw (column-trimmed) restaurant data.

    Prefer local raw parquet cache; otherwise download from Hugging Face.
    """
    cfg = cfg or settings
    cache_path = raw_cache_path(cfg)

    if cache_path.exists() and not force_download:
        return load_cached_dataframe(cache_path)

    df = load_from_huggingface(cfg=cfg)
    if cache_raw:
        save_dataframe(df, cache_path)
    return df


def load_restaurants(
    *,
    cfg: Settings | None = None,
    force_download: bool = False,
    prefer_processed: bool = True,
) -> pd.DataFrame:
    """
    Public entrypoint used by later phases.

    If a cleaned cache exists, load it. Otherwise load raw data (caller should
    run preprocess + save_processed).
    """
    cfg = cfg or settings
    clean_path = processed_cache_path(cfg)

    if prefer_processed and clean_path.exists() and not force_download:
        return load_cached_dataframe(clean_path)

    return load_raw_dataframe(cfg=cfg, force_download=force_download)
