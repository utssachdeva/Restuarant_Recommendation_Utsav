"""Parse and validate LLM recommendation JSON against the candidate allowlist."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from pydantic import ValidationError

from src.models.schemas import (
    LLMRecommendationResponse,
    RestaurantCandidate,
    RestaurantRecommendation,
)

logger = logging.getLogger(__name__)

_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


class ParseError(ValueError):
    """Raised when the model response cannot be parsed into valid recommendations."""


def _extract_json_text(raw: str) -> str:
    """Pull JSON object text from a raw model string (fences / leading prose)."""
    text = (raw or "").strip()
    if not text:
        raise ParseError("Empty LLM response")

    fenced = _FENCE_RE.search(text)
    if fenced:
        text = fenced.group(1).strip()

    if text.startswith("{") and text.endswith("}"):
        return text

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ParseError("No JSON object found in LLM response")
    return text[start : end + 1]


def _normalize_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def _candidate_index(
    candidates: list[RestaurantCandidate],
) -> dict[str, RestaurantCandidate]:
    """Map normalized name → first matching candidate."""
    index: dict[str, RestaurantCandidate] = {}
    for candidate in candidates:
        key = _normalize_name(candidate.name)
        if key and key not in index:
            index[key] = candidate
    return index


def _fill_from_candidate(
    rec: RestaurantRecommendation,
    candidate: RestaurantCandidate,
) -> RestaurantRecommendation:
    """Prefer LLM explanation/rank; backfill cuisine/rating/cost from dataset row."""
    return RestaurantRecommendation(
        rank=rec.rank,
        name=candidate.name,  # canonical spelling from dataset
        cuisine=rec.cuisine or candidate.cuisines or "",
        rating=rec.rating if rec.rating is not None else candidate.rate,
        estimated_cost=(
            rec.estimated_cost if rec.estimated_cost is not None else candidate.approx_cost
        ),
        explanation=rec.explanation,
    )


def parse_recommendations(
    raw: str,
    candidates: list[RestaurantCandidate],
    *,
    top_k: int | None = None,
) -> LLMRecommendationResponse:
    """
    Parse JSON, validate schema, drop hallucinated names, re-rank, and truncate.

    Hallucinated restaurant names (not in the candidate allowlist) are dropped.
    """
    json_text = _extract_json_text(raw)
    try:
        payload: Any = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise ParseError(f"Invalid JSON from LLM: {exc}") from exc

    try:
        parsed = LLMRecommendationResponse.model_validate(payload)
    except ValidationError as exc:
        raise ParseError(f"LLM JSON failed schema validation: {exc}") from exc

    allowlist = _candidate_index(candidates)
    kept: list[RestaurantRecommendation] = []
    seen: set[str] = set()

    for item in parsed.recommendations:
        key = _normalize_name(item.name)
        if key not in allowlist:
            logger.warning("Dropping hallucinated recommendation name=%r", item.name)
            continue
        if key in seen:
            logger.warning("Dropping duplicate recommendation name=%r", item.name)
            continue
        if not item.explanation:
            logger.warning("Dropping recommendation without explanation name=%r", item.name)
            continue
        seen.add(key)
        kept.append(_fill_from_candidate(item, allowlist[key]))

    # Stable re-rank after drops: keep relative order, rewrite rank 1..n
    kept.sort(key=lambda r: r.rank)
    renumbered = [
        RestaurantRecommendation(
            rank=idx,
            name=item.name,
            cuisine=item.cuisine,
            rating=item.rating,
            estimated_cost=item.estimated_cost,
            explanation=item.explanation,
        )
        for idx, item in enumerate(kept, start=1)
    ]

    if top_k is not None and top_k > 0:
        renumbered = renumbered[:top_k]

    if not renumbered:
        raise ParseError("No valid recommendations remained after allowlist filtering")

    return LLMRecommendationResponse(
        summary=parsed.summary,
        recommendations=renumbered,
    )
