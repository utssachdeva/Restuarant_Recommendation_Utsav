"""Application services (orchestrators).

Import from `src.services.recommender` directly, or use:
    from src.services import recommend
"""

from __future__ import annotations

from typing import Any

__all__ = ["recommend"]


def __getattr__(name: str) -> Any:
    # Lazy export avoids runpy warning for `python -m src.services.recommender`.
    if name == "recommend":
        from src.services.recommender import recommend

        return recommend
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
