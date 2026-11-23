"""Prompt templates for Groq-backed restaurant ranking."""

from __future__ import annotations

import json
from typing import Any

from src.models.schemas import RestaurantCandidate, UserPreferences

SYSTEM_PROMPT = """\
You are a restaurant recommendation assistant for Bangalore (Zomato data).

Hard rules:
1. Recommend ONLY restaurants from the provided candidate list.
2. Do NOT invent restaurants, ratings, cuisines, or costs.
3. Use user preferences to rank candidates and write short explanations.
4. Prefer higher rating / better preference fit when candidates are similar.
5. Return ONLY valid JSON matching the required schema — no markdown fences,
   no commentary outside JSON.

Required JSON schema:
{
  "summary": "short overall summary tied to the user's preferences",
  "recommendations": [
    {
      "rank": 1,
      "name": "exact restaurant name from candidates",
      "cuisine": "cuisine string from candidates",
      "rating": 4.2,
      "estimated_cost": 800,
      "explanation": "1-2 sentences referencing user preferences"
    }
  ]
}
"""


def _candidate_payload(candidate: RestaurantCandidate) -> dict[str, Any]:
    """Compact row for the prompt; keeps token use low."""
    return {
        "name": candidate.name,
        "location": candidate.location,
        "cuisines": candidate.cuisines,
        "approx_cost": candidate.approx_cost,
        "rating": candidate.rate,
        "votes": candidate.votes,
        "rest_type": candidate.rest_type,
        "dish_liked": candidate.dish_liked,
        "online_order": candidate.online_order,
        "book_table": candidate.book_table,
    }


def build_user_prompt(
    preferences: UserPreferences,
    candidates: list[RestaurantCandidate],
    *,
    top_k: int,
) -> str:
    """Build the user message with preferences + compact candidate JSON."""
    prefs_block = {
        "location": preferences.location,
        "budget": [
            level.value if hasattr(level, "value") else str(level)
            for level in preferences.budget
        ],
        "cuisine": preferences.cuisine,
        "min_rating": preferences.min_rating,
        "additional_preferences": preferences.additional_preferences or None,
    }
    payload = [_candidate_payload(c) for c in candidates]
    return (
        "Rank the best restaurants for this user.\n\n"
        f"User preferences:\n{json.dumps(prefs_block, ensure_ascii=False, indent=2)}\n\n"
        f"Candidate restaurants (JSON array, {len(payload)} items):\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        f"Return at most {top_k} recommendations, ranked best-first.\n"
        "Use each restaurant's exact `name` from the candidate list.\n"
        "Explanations must mention how the pick fits the preferences."
    )


def build_messages(
    preferences: UserPreferences,
    candidates: list[RestaurantCandidate],
    *,
    top_k: int,
) -> list[dict[str, str]]:
    """Chat messages for the Groq chat-completions API."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": build_user_prompt(preferences, candidates, top_k=top_k),
        },
    ]
