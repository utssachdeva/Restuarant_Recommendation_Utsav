"""Pydantic schemas for preferences and restaurant candidates."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


class BudgetLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class UserPreferences(BaseModel):
    """Structured + free-text preferences collected from the user."""

    location: list[str] = Field(
        ...,
        min_length=1,
        description="One or more localities / area names",
    )
    budget: list[BudgetLevel] = Field(
        ...,
        min_length=1,
        description="One or more spend bands; empty not allowed",
    )
    cuisine: list[str] = Field(
        default_factory=list,
        description="Desired cuisines; empty means no cuisine hard-filter",
    )
    min_rating: float = Field(default=0.0, ge=0.0, le=5.0)
    additional_preferences: str = Field(
        default="",
        description="Soft preferences for the LLM (e.g. family-friendly)",
    )

    @field_validator("location", mode="before")
    @classmethod
    def normalize_location(cls, value: Any) -> list[str]:
        if value is None:
            raise ValueError("location must not be empty")
        if isinstance(value, str):
            cleaned = value.strip()
            if not cleaned:
                raise ValueError("location must not be empty")
            return [cleaned]
        if isinstance(value, (list, tuple, set)):
            parts = [str(item).strip() for item in value if str(item).strip()]
            if not parts:
                raise ValueError("location must not be empty")
            # Preserve order, drop duplicates (case-insensitive)
            seen: set[str] = set()
            unique: list[str] = []
            for part in parts:
                key = part.casefold()
                if key not in seen:
                    seen.add(key)
                    unique.append(part)
            return unique
        raise TypeError("location must be a string or list of strings")

    @field_validator("budget", mode="before")
    @classmethod
    def normalize_budget(cls, value: Any) -> list[Any]:
        if value is None or value == "":
            raise ValueError("budget must not be empty")
        if isinstance(value, BudgetLevel):
            return [value]
        if isinstance(value, str):
            return [value.strip().lower()]
        if isinstance(value, (list, tuple, set)):
            levels = []
            for item in value:
                if isinstance(item, BudgetLevel):
                    levels.append(item)
                else:
                    cleaned = str(item).strip().lower()
                    if cleaned:
                        levels.append(cleaned)
            if not levels:
                raise ValueError("budget must not be empty")
            # Deduplicate while preserving order
            seen: set[str] = set()
            unique: list[Any] = []
            for level in levels:
                key = level.value if isinstance(level, BudgetLevel) else str(level)
                if key not in seen:
                    seen.add(key)
                    unique.append(level)
            return unique
        raise TypeError("budget must be a budget level or list of levels")

    @field_validator("cuisine", mode="before")
    @classmethod
    def normalize_cuisine(cls, value: Any) -> list[str]:
        if value is None or value == "":
            return []
        if isinstance(value, str):
            parts = [part.strip().lower() for part in value.split(",")]
            return [part for part in parts if part]
        if isinstance(value, (list, tuple, set)):
            return [str(item).strip().lower() for item in value if str(item).strip()]
        raise TypeError("cuisine must be a string or list of strings")

    @field_validator("additional_preferences", mode="before")
    @classmethod
    def normalize_additional(cls, value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()


class RestaurantCandidate(BaseModel):
    """Filtered restaurant row prepared for LLM prompting and UI display."""

    name: str
    location: str | None = None
    cuisines: str | None = None
    cuisines_list: list[str] = Field(default_factory=list)
    approx_cost: float | None = None
    rate: float | None = None
    votes: int = 0
    rest_type: str | None = None
    dish_liked: str | None = None
    online_order: str | None = None
    book_table: str | None = None
    listed_in_type: str | None = Field(default=None, alias="listed_in(type)")
    listed_in_city: str | None = Field(default=None, alias="listed_in(city)")

    model_config = {
        "populate_by_name": True,
        "extra": "ignore",
    }

    @model_validator(mode="before")
    @classmethod
    def coerce_nullish(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        cleaned = dict(data)
        for key, value in list(cleaned.items()):
            if value is None:
                continue
            # pandas NaN → None
            try:
                if value != value:  # noqa: PLR0124 - NaN check
                    cleaned[key] = None
            except Exception:
                pass
        return cleaned


class RestaurantRecommendation(BaseModel):
    """Single ranked recommendation produced by the LLM (post-validation)."""

    rank: int = Field(..., ge=1)
    name: str = Field(..., min_length=1)
    cuisine: str = ""
    rating: float | None = None
    estimated_cost: float | None = None
    explanation: str = Field(..., min_length=1)

    model_config = {"extra": "ignore"}

    @field_validator("name", "cuisine", "explanation", mode="before")
    @classmethod
    def strip_strings(cls, value: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, str):
            return value.strip()
        return value


class LLMRecommendationResponse(BaseModel):
    """Parsed LLM JSON payload before orchestrator meta enrichment."""

    summary: str = ""
    recommendations: list[RestaurantRecommendation] = Field(default_factory=list)

    model_config = {"extra": "ignore"}

    @field_validator("summary", mode="before")
    @classmethod
    def normalize_summary(cls, value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()


class RecommendationMeta(BaseModel):
    """Orchestrator diagnostics returned alongside recommendations."""

    candidate_count: int = 0
    result_count: int = 0
    fallback_used: bool = False
    empty_reason: str | None = None
    model: str | None = None
    dry_run: bool = False


class RecommendationResponse(BaseModel):
    """UI/API-facing recommendation payload from the orchestrator."""

    summary: str = ""
    recommendations: list[RestaurantRecommendation] = Field(default_factory=list)
    meta: RecommendationMeta = Field(default_factory=RecommendationMeta)
