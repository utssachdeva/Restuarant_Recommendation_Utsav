"""Groq LLM client for ranking restaurant candidates."""

from __future__ import annotations

import json
import logging
from typing import Any

from groq import APIConnectionError, APIStatusError, APITimeoutError, Groq, RateLimitError

from src.config import Settings, settings
from src.llm.prompts import build_messages
from src.models.schemas import RestaurantCandidate, UserPreferences

logger = logging.getLogger(__name__)


class LLMError(RuntimeError):
    """Raised when the Groq API call fails or returns an empty response."""


def _mock_completion(
    preferences: UserPreferences,
    candidates: list[RestaurantCandidate],
    *,
    top_k: int,
) -> str:
    """Deterministic offline response for dry-run / UI work without an API key."""
    selected = candidates[:top_k]
    cuisine_hint = ", ".join(preferences.cuisine) if preferences.cuisine else "any cuisine"
    extras = preferences.additional_preferences or "general preference fit"
    recommendations = []
    for idx, item in enumerate(selected, start=1):
        recommendations.append(
            {
                "rank": idx,
                "name": item.name,
                "cuisine": item.cuisines or "",
                "rating": item.rate,
                "estimated_cost": item.approx_cost,
                "explanation": (
                    f"Fits {'/'.join(b.value for b in preferences.budget)} budget in "
                    f"{', '.join(preferences.location)} "
                    f"for {cuisine_hint}; rating {item.rate}. Soft prefs: {extras}."
                ),
            }
        )
    payload = {
        "summary": (
            f"Top matches in {', '.join(preferences.location)} for {cuisine_hint} "
            f"on a {'/'.join(b.value for b in preferences.budget)} budget (dry-run)."
        ),
        "recommendations": recommendations,
    }
    return json.dumps(payload, ensure_ascii=False)


def create_client(cfg: Settings | None = None) -> Groq:
    """Build a Groq client from settings."""
    cfg = cfg or settings
    if not cfg.llm_api_key:
        raise LLMError(
            "Missing LLM_API_KEY (or GROQ_API_KEY). "
            "Set it in .env, or enable LLM_DRY_RUN=true."
        )
    return Groq(api_key=cfg.llm_api_key, timeout=float(cfg.request_timeout))


def complete_recommendations(
    preferences: UserPreferences,
    candidates: list[RestaurantCandidate],
    *,
    cfg: Settings | None = None,
    top_k: int | None = None,
    dry_run: bool | None = None,
) -> str:
    """
    Call Groq chat completions and return raw response text (JSON string).

    When dry_run is True (or settings.llm_dry_run), returns a mock JSON payload
    without contacting the API.
    """
    cfg = cfg or settings
    limit = top_k if top_k is not None else cfg.top_k_results
    use_dry_run = cfg.llm_dry_run if dry_run is None else dry_run

    if not candidates:
        raise LLMError("Cannot call LLM with an empty candidate list")
    if limit < 1:
        raise ValueError("top_k must be >= 1")

    if use_dry_run:
        logger.info("LLM dry-run enabled; returning mock recommendations")
        return _mock_completion(preferences, candidates, top_k=limit)

    messages = build_messages(preferences, candidates, top_k=limit)
    client = create_client(cfg)

    try:
        completion = client.chat.completions.create(
            model=cfg.llm_model,
            messages=messages,
            temperature=0.2,
            max_completion_tokens=2048,
            response_format={"type": "json_object"},
        )
    except APITimeoutError as exc:
        raise LLMError(f"Groq request timed out after {cfg.request_timeout}s") from exc
    except RateLimitError as exc:
        raise LLMError("Groq rate limit exceeded; retry later") from exc
    except APIConnectionError as exc:
        raise LLMError(f"Groq connection error: {exc}") from exc
    except APIStatusError as exc:
        raise LLMError(f"Groq API error {exc.status_code}: {exc.message}") from exc
    except Exception as exc:  # noqa: BLE001 - surface provider failures cleanly
        raise LLMError(f"Groq request failed: {exc}") from exc

    choice = completion.choices[0] if completion.choices else None
    content = choice.message.content if choice and choice.message else None
    if not content or not str(content).strip():
        raise LLMError("Groq returned an empty completion")

    text = str(content).strip()
    logger.info(
        "Groq completion ok model=%s candidates=%s top_k=%s",
        cfg.llm_model,
        len(candidates),
        limit,
    )
    return text


def completion_meta(raw_text: str) -> dict[str, Any]:
    """Small helper for debugging / logging raw response size."""
    return {"chars": len(raw_text), "preview": raw_text[:120]}
