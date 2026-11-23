"""Runtime configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def _as_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return int(raw)


def _as_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return float(raw)


def _as_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


_DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"


def _as_csv_list(name: str, default: str) -> tuple[str, ...]:
    raw = os.getenv(name)
    text = default if raw is None or raw.strip() == "" else raw
    return tuple(part.strip() for part in text.split(",") if part.strip())


@dataclass(frozen=True)
class Settings:
    """Application settings for data, filtering, and LLM calls."""

    llm_api_key: str
    llm_model: str
    llm_dry_run: bool
    dataset_id: str
    top_n_candidates: int
    top_k_results: int
    budget_low_max: float
    budget_med_max: float
    request_timeout: int
    cors_origins: tuple[str, ...]
    project_root: Path = PROJECT_ROOT

    @property
    def data_raw_dir(self) -> Path:
        return self.project_root / "data" / "raw"

    @property
    def data_processed_dir(self) -> Path:
        return self.project_root / "data" / "processed"

    def budget_band(self, budget: str) -> tuple[float | None, float | None]:
        """Return (min_cost, max_cost) inclusive bounds for a budget label."""
        label = budget.strip().lower()
        if label == "low":
            return (None, self.budget_low_max)
        if label == "medium":
            return (self.budget_low_max + 1, self.budget_med_max)
        if label == "high":
            return (self.budget_med_max + 1, None)
        raise ValueError("budget must be one of: low, medium, high")

    def validate(self) -> None:
        """Fail fast on unsafe configuration values."""
        if self.top_n_candidates < 1:
            raise ValueError("TOP_N_CANDIDATES must be >= 1")
        if self.top_k_results < 1:
            raise ValueError("TOP_K_RESULTS must be >= 1")
        if self.top_k_results > self.top_n_candidates:
            raise ValueError("TOP_K_RESULTS cannot exceed TOP_N_CANDIDATES")
        if self.budget_low_max <= 0 or self.budget_med_max <= 0:
            raise ValueError("Budget thresholds must be positive")
        if self.budget_low_max >= self.budget_med_max:
            raise ValueError("BUDGET_LOW_MAX must be < BUDGET_MED_MAX")
        if self.request_timeout < 1:
            raise ValueError("REQUEST_TIMEOUT must be >= 1")
        if not self.cors_origins:
            raise ValueError("CORS_ORIGINS must include at least one origin")


def load_settings() -> Settings:
    """Load and validate settings from environment variables."""
    # Prefer project LLM_API_KEY; accept GROQ_API_KEY as a convenience alias.
    api_key = (os.getenv("LLM_API_KEY") or os.getenv("GROQ_API_KEY") or "").strip()
    settings = Settings(
        llm_api_key=api_key,
        # llama-3.3-70b-versatile is retired on free/dev; gpt-oss-20b is available.
        llm_model=os.getenv("LLM_MODEL", "openai/gpt-oss-20b").strip(),
        llm_dry_run=_as_bool("LLM_DRY_RUN", False),
        dataset_id=os.getenv(
            "DATASET_ID",
            # Working HF dataset (problem-statement ID does not exist on the Hub).
            "ManikaSaini/zomato-restaurant-recommendation",
        ),
        top_n_candidates=_as_int("TOP_N_CANDIDATES", 20),
        top_k_results=_as_int("TOP_K_RESULTS", 5),
        budget_low_max=_as_float("BUDGET_LOW_MAX", 500.0),
        budget_med_max=_as_float("BUDGET_MED_MAX", 1000.0),
        request_timeout=_as_int("REQUEST_TIMEOUT", 30),
        cors_origins=_as_csv_list("CORS_ORIGINS", _DEFAULT_CORS_ORIGINS),
    )
    settings.validate()
    return settings


settings = load_settings()
