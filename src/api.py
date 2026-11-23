"""FastAPI layer for the Zest Next.js frontend."""

from __future__ import annotations

import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from src.config import settings
from src.data.preprocess import CUISINES_LIST_COL
from src.llm.client import LLMError
from src.llm.parser import ParseError
from src.models.schemas import RecommendationResponse, UserPreferences
from src.services.recommender import load_restaurant_frame, recommend

app = FastAPI(
    title="Zest API",
    description="Bangalore culinary recommendation API for the Zest frontend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FormOptions(BaseModel):
    locations: list[str] = Field(default_factory=list)
    cuisines: list[str] = Field(default_factory=list)
    kitchen_count: int = 0


class ErrorBody(BaseModel):
    detail: str


def _iter_cuisine_parts(value: Any) -> Iterable[str]:
    if value is None:
        return
    try:
        if value != value:  # NaN
            return
    except Exception:
        pass

    if isinstance(value, np.ndarray):
        values = value.tolist()
    elif isinstance(value, (list, tuple, set)):
        values = list(value)
    elif isinstance(value, str):
        values = value.split(",")
    else:
        try:
            values = list(value)
        except TypeError:
            values = [value]

    for part in values:
        cleaned = str(part).strip().lower()
        if cleaned and cleaned not in {"nan", "none", "null"}:
            yield cleaned


@lru_cache(maxsize=1)
def _cached_frame() -> pd.DataFrame:
    return load_restaurant_frame()


def _form_options(df: pd.DataFrame) -> FormOptions:
    locations = (
        df["location"]
        .dropna()
        .astype(str)
        .str.strip()
        .replace("", pd.NA)
        .dropna()
        .unique()
        .tolist()
    )
    locations = sorted(locations, key=str.casefold)

    cuisines: set[str] = set()
    if CUISINES_LIST_COL in df.columns:
        series = df[CUISINES_LIST_COL]
    else:
        series = df["cuisines"] if "cuisines" in df.columns else pd.Series(dtype=object)

    for items in series.dropna():
        cuisines.update(_iter_cuisine_parts(items))

    return FormOptions(
        locations=locations,
        cuisines=sorted(cuisines),
        kitchen_count=len(df),
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/options", response_model=FormOptions)
def options() -> FormOptions:
    try:
        return _form_options(_cached_frame())
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Could not load options: {exc}") from exc


@app.post(
    "/api/recommend",
    response_model=RecommendationResponse,
    responses={400: {"model": ErrorBody}, 502: {"model": ErrorBody}},
)
def recommend_endpoint(prefs: UserPreferences) -> RecommendationResponse:
    try:
        return recommend(prefs, df=_cached_frame())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (LLMError, ParseError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc
