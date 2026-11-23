"""Streamlit UI for Zest — Bangalore culinary recommendations (Stitch design)."""

from __future__ import annotations

import html
import sys
from pathlib import Path
from typing import Any, Iterable

# Streamlit runs this file with `src/` on sys.path, not the project root.
# Add the repo root so `import src...` works from any working directory.
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

import numpy as np
import pandas as pd
import streamlit as st

from src.config import settings
from src.data.preprocess import CUISINES_LIST_COL
from src.llm.client import LLMError
from src.llm.parser import ParseError
from src.models.schemas import BudgetLevel, RecommendationResponse, UserPreferences
from src.services.recommender import load_restaurant_frame, recommend

DEFAULT_LOCATION = "Koramangala"
FREQUENT_LOCATIONS = (
    "Koramangala",
    "Indiranagar",
    "Lavelle Road",
    "Malleshwaram",
    "Whitefield",
    "Jayanagar",
)
FEATURED_CUISINES = (
    "south indian",
    "north indian",
    "chinese",
    "italian",
    "continental",
    "cafe",
    "biryani",
    "seafood",
)
RATING_OPTIONS = {
    "3.5+": 3.5,
    "4.0+ Recommended": 4.0,
    "4.5+ Exceptional": 4.5,
}
SPOTLIGHT_IMAGE = (
    "https://lh3.googleusercontent.com/aida-public/"
    "AB6AXuAKyu6bwAr1rbQ6l7q5HJQGcBE3DP144RD4Lg6r3DFDrX9rw3fvA_8xI5FK6x38SC7TtUhZZ-"
    "kDSNduG_gc1EW-VJpsvK6KJWLAw7Tn2crpg-qvgrDmMKWIWyTKVwpltMKN4HCEizy1YVL93-dzIFCqht"
    "V1BYzmimGHDQuDtQGmO4JyryajFM4fuSwGcDAsYwdprDaddAcybmAlGuNw9nMHPJxCqxeofst5RNuWVaA"
)
CARD_IMAGES = (
    "https://lh3.googleusercontent.com/aida-public/"
    "AB6AXuAZVbjmcu-FY6kTObNLpr_Ob-WPlzpSreV_dwVIdx454Ct9h5Ew31S61DFgqZgtzPdPe8VjRrhy"
    "qmIJDjwwGk56L-JltmbfAqoaZvM8SaZ0LJp0nVZhMNWF21XnQtLg9zQN3nb5CIpbdAXh_kg_mcKdzLoq0"
    "CMoq-Ftde5M9nacGiQmKcMMFoJ6TMvow6KdmXoC2BHIhuMn53QT0LeC180ScoSvkfuPV454-Oja0vI",
    "https://lh3.googleusercontent.com/aida-public/"
    "AB6AXuCmRHoO-bBaBj2TaaKYRZzh1EAIjfGiVh1PJbl3uHfRVMyRnCXwUbb6801sAnjC-1yhkogWPIkB"
    "CgU9leUUra0VD9hmROrelc_VAYdAAbaLpG79nRJ1t4497UimlhvzLv3clQ17sZate6lv4JXhFdcfBKVW"
    "pVdLfI-MEXL6f2FJ9iSKwQ4KlT3SF1Rkb04XZrUSngw-RSenR4h2pu7NuDUL5NhWN_qXwjmvJnkuEuA",
    "https://lh3.googleusercontent.com/aida-public/"
    "AB6AXuBUptnK-QVa6vakX0862Qw-cRuU4GsENCe-kqxjZQdoEYn2NE4jXExUmgvUY1Y5DqVCUYxpBZWw"
    "wBGH7pKEUk1jfXY2IF4J_rXfzBGxcxYNswZt2Cq75Mh7WZFHlj-8156Ppcq2vjoGsyZ2-dl307dFl0tv"
    "Xv_voFq7MyQ1d24SHT1tAKyvfRkt-wW5lZoRSDD0gMFFsmXDFxzSAfGLwvihv24xT3gocvSoriXVe4o",
)

# Warm Editorial Dining — tokens from stitch_table_ai_restaurant_finder/DESIGN.md
_APP_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --surface: #fff8f4;
  --surface-low: #faf2ed;
  --surface-container: #f4ece7;
  --surface-high: #eee7e2;
  --surface-highest: #e8e1dc;
  --white: #ffffff;
  --on-surface: #1e1b18;
  --on-variant: #59413c;
  --tertiary: #5e5c57;
  --primary: #ab2d17;
  --primary-hover: #cd462d;
  --secondary: #52634c;
  --secondary-container: #d5e8cb;
  --outline: #e1bfb8;
  --border: #ece7df;
  --inverse: #33302d;
}

html, body, [class*="css"], .stApp, .stMarkdown, p, label, span, div {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}

.stApp {
  background: var(--surface) !important;
  color: var(--on-surface);
}

/* Hide Streamlit chrome */
#MainMenu, footer, header[data-testid="stHeader"] { visibility: hidden; height: 0; }
[data-testid="stToolbar"], [data-testid="stDecoration"] { display: none !important; }
[data-testid="stSidebar"] { display: none !important; }

.block-container {
  padding-top: 0.5rem !important;
  padding-bottom: 3rem !important;
  max-width: 1180px !important;
  padding-left: 1.25rem !important;
  padding-right: 1.25rem !important;
}

h1, h2, h3, .zest-serif {
  font-family: 'Newsreader', Georgia, serif !important;
  letter-spacing: -0.015em;
  font-weight: 500 !important;
  color: var(--on-surface) !important;
}

/* —— Brand chrome —— */
.zest-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0 0.85rem;
  border-bottom: 1px solid var(--surface-highest);
  margin-bottom: 1.5rem;
}
.zest-brand {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.zest-brand-name {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--on-surface);
  line-height: 1;
}
.zest-brand-sub {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tertiary);
}
.zest-nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.9rem;
  color: var(--on-variant);
}
.zest-nav .active {
  color: var(--primary);
  font-weight: 600;
}
.zest-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.zest-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.zest-edition {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--secondary);
}
.zest-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
  display: inline-block;
}
.zest-updated {
  font-size: 0.75rem;
  color: var(--tertiary);
}

.zest-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--surface-high);
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--on-variant);
  margin-bottom: 0.55rem;
}
.zest-hero-title {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400 !important;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 0.55rem 0 !important;
  color: var(--on-surface) !important;
}
.zest-hero-sub {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--tertiary);
  max-width: 36rem;
  margin: 0 0 1.5rem 0;
}

/* —— Panels —— */
.zest-panel {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.35rem 1.4rem 1.1rem;
  margin-bottom: 1rem;
}
.zest-panel-muted {
  background: var(--surface-low);
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 1.15rem 1.25rem;
}
.zest-label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--on-surface);
  margin-bottom: 0.35rem;
}
.zest-hint {
  font-size: 0.75rem;
  color: var(--tertiary);
}
.zest-spotlight-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.35rem;
  display: block;
  margin: 0.75rem 0;
}
.zest-spotlight-cap {
  display: inline-block;
  background: rgba(255,248,244,0.92);
  padding: 0.25rem 0.55rem;
  border-radius: 0.25rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: -2.6rem;
  margin-left: 0.65rem;
  margin-bottom: 1rem;
  position: relative;
}
.zest-meter-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.zest-meter-track {
  height: 6px;
  background: var(--surface-high);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}
.zest-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--secondary);
}
.zest-meter-fill.primary { background: var(--primary); }

/* —— Form widgets —— */
div[data-testid="stSelectbox"] label,
div[data-testid="stRadio"] label,
div[data-testid="stMultiSelect"] label,
div[data-testid="stTextArea"] label,
div[data-testid="stSlider"] label {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.03em !important;
  color: var(--on-surface) !important;
}

div[data-baseweb="select"] > div,
div[data-baseweb="input"] > div,
textarea, .stTextInput input {
  border-radius: 0.35rem !important;
  border-color: var(--border) !important;
  background: var(--surface-low) !important;
  color: var(--on-surface) !important;
}

div[data-baseweb="select"] > div:focus-within,
textarea:focus {
  border-color: var(--on-surface) !important;
  box-shadow: none !important;
}

div[data-testid="stRadio"] > div {
  background: var(--surface-low);
  border-radius: 0.5rem;
  padding: 0.35rem;
  gap: 0.35rem !important;
}
div[data-testid="stRadio"] label[data-baseweb="radio"] {
  background: transparent;
  border-radius: 0.3rem;
  padding: 0.45rem 0.7rem !important;
}
div[data-testid="stRadio"] label[data-baseweb="radio"][aria-checked="true"] {
  background: var(--white) !important;
  box-shadow: 0 1px 2px rgba(30,27,24,0.06);
}

.stButton > button[kind="primary"],
.stButton > button[data-testid="baseButton-primary"] {
  background: var(--primary) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  letter-spacing: 0.04em !important;
  border-radius: 0.35rem !important;
  padding: 0.7rem 1.25rem !important;
  box-shadow: none !important;
}
.stButton > button[kind="primary"]:hover {
  background: var(--primary-hover) !important;
}
.stButton > button[kind="secondary"],
.stButton > button[data-testid="baseButton-secondary"] {
  background: var(--surface-container) !important;
  border: 1px solid var(--border) !important;
  color: var(--tertiary) !important;
  border-radius: 0.25rem !important;
  font-size: 0.78rem !important;
  font-weight: 500 !important;
  padding: 0.25rem 0.65rem !important;
}

.stAlert { border-radius: 0.5rem !important; }

/* —— Results —— */
.reco-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0.5rem 0 1rem;
}
.reco-header h2 {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: 1.85rem !important;
  margin: 0 !important;
}
.reco-count {
  font-size: 0.8rem;
  color: var(--tertiary);
  font-weight: 500;
}
.sensory-box {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.25rem;
}
.sensory-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--secondary);
  margin-bottom: 0.45rem;
}
.sensory-copy {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--on-variant);
  margin: 0;
}

.reco-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.15rem 1.25rem;
  margin: 0 0 1rem 0;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1.1rem;
}
@media (max-width: 720px) {
  .reco-card { grid-template-columns: 1fr; }
}
.reco-img-wrap {
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
  background: var(--surface-container);
  min-height: 140px;
}
.reco-img-wrap img {
  width: 100%;
  height: 100%;
  min-height: 140px;
  object-fit: cover;
  display: block;
}
.reco-loc-badge {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  background: rgba(255,248,244,0.92);
  padding: 0.2rem 0.45rem;
  border-radius: 0.2rem;
  font-size: 0.68rem;
  font-weight: 600;
}
.reco-rank {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: 1.15rem;
  color: var(--tertiary);
}
.reco-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.reco-title {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: 1.35rem;
  font-weight: 500;
  margin: 0.2rem 0 0.35rem;
  color: var(--on-surface);
}
.reco-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--surface-high);
  border-radius: 0.25rem;
  padding: 0.15rem 0.45rem;
  font-size: 0.75rem;
  font-weight: 600;
}
.reco-rating .star { color: var(--primary); }
.reco-meta {
  font-size: 0.8rem;
  color: var(--on-variant);
  margin-bottom: 0.65rem;
}
.reco-meta .cost { color: var(--secondary); font-weight: 600; }
.reco-quote {
  background: var(--surface-low);
  border-left: 2px solid var(--secondary);
  border-radius: 0.35rem;
  padding: 0.7rem 0.85rem;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--on-surface);
  line-height: 1.5;
  margin: 0;
}

.ledger-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.1rem 1.2rem;
  margin-bottom: 1rem;
}
.ledger-eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--secondary);
}
.ledger-row {
  margin-top: 0.85rem;
}
.ledger-k {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--tertiary);
}
.ledger-v {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--on-surface);
  margin-top: 0.15rem;
}
.chip {
  display: inline-block;
  background: var(--secondary-container);
  color: #3b4b36;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  margin: 0.2rem 0.25rem 0 0;
}

.empty-stage {
  text-align: center;
  padding: 2.5rem 1rem 1.5rem;
  max-width: 40rem;
  margin: 0 auto;
}
.empty-stage h2 {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: 2rem !important;
  margin: 0.5rem 0 0.75rem !important;
}
.empty-stage p {
  color: var(--tertiary);
  line-height: 1.6;
  font-size: 1rem;
}
.empty-criteria {
  background: var(--surface-low);
  border-radius: 0.5rem;
  padding: 1rem 1.15rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}
.criteria-chip {
  background: var(--surface-highest);
  color: var(--on-variant);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 0.25rem;
}

.matching-box {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
  max-width: 28rem;
  margin: 2rem auto;
}
.matching-box .eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--secondary);
}
.matching-box h3 {
  font-family: 'Newsreader', Georgia, serif !important;
  margin: 0.5rem 0 0.75rem !important;
}
.matching-box p { color: var(--tertiary); font-size: 0.85rem; }

.zest-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-highest);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--tertiary);
  font-size: 0.8rem;
}
.zest-footer strong {
  font-family: 'Newsreader', Georgia, serif !important;
  font-size: 1.05rem;
  color: var(--on-surface);
  display: block;
  margin-bottom: 0.25rem;
}

.trust-line {
  text-align: center;
  font-size: 0.78rem;
  color: var(--tertiary);
  margin-top: 0.55rem;
}
</style>
"""


@st.cache_data(show_spinner="Loading restaurant data…")
def _cached_restaurants() -> pd.DataFrame:
    return load_restaurant_frame()


def _iter_cuisine_parts(value: Any) -> Iterable[str]:
    """Yield cuisine tokens from list / ndarray / comma string values."""
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


@st.cache_data
def _form_options() -> tuple[list[str], list[str]]:
    """Return (locations, cuisines) without hashing a full DataFrame arg."""
    df = _cached_restaurants()
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

    return locations, sorted(cuisines)


def _budget_label(level: str) -> str:
    low = settings.budget_low_max
    med = settings.budget_med_max
    if level == BudgetLevel.LOW.value:
        return f"Under ₹{low:.0f} for two"
    if level == BudgetLevel.MEDIUM.value:
        return f"₹{low + 1:.0f} – ₹{med:.0f} for two"
    return f"Above ₹{med:.0f} for two"


def _budget_display(level: Any) -> str:
    marks = {"low": "₹ (Low)", "medium": "₹₹ (Medium)", "high": "₹₹₹ (High)"}

    def _one(item: Any) -> str:
        key = item.value if hasattr(item, "value") else str(item)
        return marks.get(key, str(key).capitalize())

    if isinstance(level, (list, tuple)):
        return " · ".join(_one(item) for item in level)
    return _one(level)


def _location_display(location: Any) -> str:
    if isinstance(location, (list, tuple)):
        return " · ".join(str(part) for part in location)
    return str(location)


def _escape(value: Any) -> str:
    return html.escape(str(value if value is not None else ""))


def _render_header() -> None:
    st.markdown(
        """
        <div class="zest-header">
          <div class="zest-brand">
            <span class="zest-brand-name">Zest</span>
            <span class="zest-brand-sub">Bangalore Culinary Intelligence</span>
          </div>
          <div class="zest-nav">
            <span>How it works</span>
            <span class="active">Bangalore Curations</span>
            <span>Saved Places</span>
            <span class="zest-avatar">Z</span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_footer() -> None:
    st.markdown(
        """
        <div class="zest-footer">
          <div>
            <strong>Zest</strong>
            An unhurried culinary gazette recording taste, provenance,
            and table atmospheres across Bangalore.
          </div>
          <div style="text-align:right;">
            <div style="letter-spacing:0.08em;font-weight:600;font-size:0.7rem;">BANGALORE — IND</div>
            <div style="margin-top:0.35rem;">© 2026 Zest Culinary Press</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_spotlight(kitchen_count: int) -> None:
    st.markdown(
        f"""
        <div class="zest-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="ledger-eyebrow">Table Moods · Bangalore South</span>
            <span class="zest-hint">Issue 42</span>
          </div>
          <img class="zest-spotlight-img" src="{SPOTLIGHT_IMAGE}"
               alt="Courtyard cafe in Bangalore" />
          <span class="zest-spotlight-cap">Canopy &amp; filter coffee</span>
          <div class="zest-hint" style="margin-top:0.5rem;">
            Koramangala 3rd Block · Artisan Bistro
          </div>
          <h3 class="zest-serif" style="margin:0.35rem 0 0.4rem;font-size:1.15rem;">
            The courtyard sanctuary index
          </h3>
          <p class="zest-hint" style="line-height:1.55;margin:0 0 0.9rem;">
            Bangalore’s temperate evenings invite slow dining under rain trees.
            When you request outdoor courtyards, our catalog balances canopy
            density with acoustic comfort.
          </p>
          <div class="zest-panel-muted" style="padding:0.85rem 1rem;margin:0;">
            <div class="zest-meter-label">
              <span style="color:var(--tertiary);">Acoustics</span>
              <span style="color:var(--secondary);">Intimate / Courtyard</span>
            </div>
            <div class="zest-meter-track"><div class="zest-meter-fill" style="width:75%;"></div></div>
            <div class="zest-meter-label">
              <span style="color:var(--tertiary);">Pacing</span>
              <span style="color:var(--primary);">Unhurried (90+ mins)</span>
            </div>
            <div class="zest-meter-track"><div class="zest-meter-fill primary" style="width:80%;"></div></div>
          </div>
        </div>
        <div class="zest-panel-muted">
          <div style="color:var(--primary);font-weight:600;font-size:0.85rem;margin-bottom:0.4rem;">
            Local Provenance Tracker
          </div>
          <p style="margin:0;color:var(--on-variant);font-size:0.9rem;line-height:1.55;">
            Featuring estate coffees from Chikmagalur, sourdough fermented with
            native Karnataka yeast cultures, and coastal Byadgi chili preparations.
          </p>
          <div style="display:flex;justify-content:space-between;margin-top:0.75rem;
                      font-size:0.78rem;color:var(--tertiary);">
            <span>{kitchen_count} kitchens in tonight’s ledger</span>
            <span style="color:var(--primary);font-weight:600;">Explore the ledger →</span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_active_ledger(prefs: UserPreferences) -> None:
    cuisine_html = (
        "".join(f'<span class="chip">{_escape(c.title())}</span>' for c in prefs.cuisine)
        if prefs.cuisine
        else '<span class="chip">Any cuisine</span>'
    )
    st.markdown(
        f"""
        <div class="ledger-card">
          <div style="display:flex;justify-content:space-between;">
            <span class="ledger-eyebrow">Active Ledger</span>
            <span class="zest-hint">Session · live</span>
          </div>
          <div class="ledger-row">
            <div class="ledger-k">Neighborhood</div>
            <div class="ledger-v">{_escape(_location_display(prefs.location))}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;" class="ledger-row">
            <div>
              <div class="ledger-k">Price Level</div>
              <div class="ledger-v">{_escape(_budget_display(prefs.budget))}</div>
            </div>
            <div>
              <div class="ledger-k">Threshold</div>
              <div class="ledger-v">{prefs.min_rating:.1f}+ Rating</div>
            </div>
          </div>
          <div class="ledger-row">
            <div class="ledger-k">Palette Focus</div>
            <div style="margin-top:0.35rem;">{cuisine_html}</div>
          </div>
        </div>
        <div class="zest-panel-muted">
          <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.35rem;">
            <span style="color:var(--secondary);font-weight:600;font-size:0.75rem;">
              Field Evaluator Note
            </span>
          </div>
          <p style="margin:0;font-size:0.82rem;color:var(--on-variant);line-height:1.55;">
            Tables were vetted against kitchen cadence, reviewer consensus,
            and your soft preferences for atmosphere.
          </p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_recommendation(item: dict[str, Any], image_url: str) -> None:
    rank = item.get("rank") or 0
    rating = item.get("rating")
    cost = item.get("estimated_cost")
    rating_text = f"{rating:.1f}" if isinstance(rating, (int, float)) else "—"
    cost_text = f"₹{cost:.0f} for two" if isinstance(cost, (int, float)) else "—"
    cuisine = item.get("cuisine") or "any"
    name = item.get("name") or "Unknown"
    explanation = item.get("explanation") or ""
    rank_label = f"{int(rank):02d}" if isinstance(rank, (int, float)) else "—"

    st.markdown(
        f"""
        <article class="reco-card">
          <div class="reco-img-wrap">
            <img src="{image_url}" alt="{_escape(name)}" />
            <span class="reco-loc-badge">{_escape(cuisine.title() if cuisine != "any" else "Bangalore")}</span>
          </div>
          <div>
            <div class="reco-title-row">
              <span class="reco-rank">{rank_label}</span>
              <span class="reco-rating"><span class="star">★</span> {rating_text}</span>
            </div>
            <h3 class="reco-title">{_escape(name)}</h3>
            <div class="reco-meta">
              {_escape(str(cuisine).title())}
              <span style="color:var(--tertiary);"> · </span>
              <span class="cost">{_escape(cost_text)}</span>
            </div>
            <p class="reco-quote">“{_escape(explanation)}”</p>
          </div>
        </article>
        """,
        unsafe_allow_html=True,
    )


def _render_empty(response: RecommendationResponse, prefs: UserPreferences) -> None:
    chips = [
        _location_display(prefs.location),
        _budget_display(prefs.budget),
    ]
    if prefs.cuisine:
        chips.append(", ".join(c.title() for c in prefs.cuisine[:3]))
    chips.append(f"Rating ≥ {prefs.min_rating:.1f}")
    chip_html = "".join(f'<span class="criteria-chip">{_escape(c)}</span>' for c in chips)

    st.markdown(
        f"""
        <div class="empty-criteria">
          <span class="ledger-eyebrow" style="margin-right:0.5rem;">Active Criteria</span>
          {chip_html}
        </div>
        <section class="empty-stage">
          <span class="ledger-eyebrow">Gazette Archive Notice · Volume XIV</span>
          <h2>No exact tables match these specific criteria</h2>
          <p>{_escape(response.summary or "Bangalore has rich culinary diversity, but few venues match this exact combination. Relaxing one or two filters will unlock great options.")}</p>
        </section>
        """,
        unsafe_allow_html=True,
    )


def _render_results(response: RecommendationResponse, prefs: UserPreferences) -> None:
    meta = response.meta

    if not response.recommendations:
        _render_empty(response, prefs)
        return

    left, right = st.columns([4, 8], gap="large")
    with left:
        _render_active_ledger(prefs)
        if st.button("Modify criteria", type="secondary", use_container_width=True):
            st.session_state.pop("last_response", None)
            st.session_state.pop("last_prefs", None)
            st.rerun()

    with right:
        st.markdown(
            f"""
            <div class="reco-header">
              <h2>Curated for your evening</h2>
              <span class="reco-count">
                {meta.result_count} picks · distilled from {meta.candidate_count} evaluated tables
              </span>
            </div>
            <div class="sensory-box">
              <div class="sensory-eyebrow">Sensory Synthesis</div>
              <p class="sensory-copy">
                {_escape(response.summary or "A shortlist ranked for your neighbourhood, budget, and soft preferences.")}
              </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        for idx, item in enumerate(response.recommendations):
            _render_recommendation(
                item.model_dump(),
                CARD_IMAGES[idx % len(CARD_IMAGES)],
            )

        meta_bits = []
        if meta.model:
            meta_bits.append(f"Model: {_escape(meta.model)}")
        if meta.dry_run:
            meta_bits.append("Dry-run mode")
        if meta.fallback_used:
            meta_bits.append("Fallback ranking used")
        if meta_bits:
            st.caption(" · ".join(meta_bits))


def _cuisine_defaults(all_cuisines: list[str]) -> list[str]:
    return [c for c in FEATURED_CUISINES if c in all_cuisines][:3]


def main() -> None:
    st.set_page_config(
        page_title="Zest · Bangalore Culinary Intelligence",
        page_icon="🍊",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    st.markdown(_APP_CSS, unsafe_allow_html=True)
    _render_header()

    try:
        df = _cached_restaurants()
        locations, cuisines = _form_options()
    except Exception as exc:  # noqa: BLE001 - show friendly startup error
        st.error(f"Could not load restaurant data: {exc}")
        st.stop()

    if not locations:
        st.error("No locations found in the dataset.")
        st.stop()

    # Restore last search results (Stitch recommendations state)
    if st.session_state.get("last_response") and st.session_state.get("last_prefs"):
        _render_results(st.session_state["last_response"], st.session_state["last_prefs"])
        _render_footer()
        return

    st.markdown(
        """
        <div class="zest-meta-row">
          <div class="zest-edition">
            <span class="zest-dot"></span>
            Gazette Edition No. 42 · Autumn Registry
          </div>
          <div class="zest-updated">Curation updated from live Bangalore tables</div>
        </div>
        <div class="zest-badge">
          <span class="zest-dot"></span>
          Bangalore dining engine
        </div>
        <h1 class="zest-hero-title">Where shall we eat tonight?</h1>
        <p class="zest-hero-sub">
          Find where to eat — preferences in, recommendations out.
          An unhurried survey of tables, moods, and regional terroir across the garden city.
        </p>
        """,
        unsafe_allow_html=True,
    )

    default_location_index = (
        locations.index(DEFAULT_LOCATION) if DEFAULT_LOCATION in locations else 0
    )
    if "location_choice" not in st.session_state:
        st.session_state.location_choice = locations[default_location_index]

    form_col, side_col = st.columns([7, 5], gap="large")

    with form_col:
        st.markdown('<div class="zest-panel">', unsafe_allow_html=True)

        st.markdown(
            '<div class="zest-label">Neighborhood / Area '
            '<span class="zest-hint" style="float:right;font-weight:400;">Locality radius</span></div>',
            unsafe_allow_html=True,
        )

        # Frequent area chips (only those present in data)
        chip_locs = [loc for loc in FREQUENT_LOCATIONS if loc in locations]
        if chip_locs:
            chip_cols = st.columns(len(chip_locs))
            for col, loc in zip(chip_cols, chip_locs):
                with col:
                    if st.button(loc, key=f"freq_{loc}", use_container_width=True):
                        st.session_state.location_choice = loc
                        st.rerun()

        try:
            loc_index = locations.index(st.session_state.location_choice)
        except ValueError:
            loc_index = default_location_index

        location = st.selectbox(
            "Neighborhood / Area",
            options=locations,
            index=loc_index,
            label_visibility="collapsed",
            help="Bangalore locality from the Zomato dataset",
        )
        st.session_state.location_choice = location

        budget = st.radio(
            "Spend Index",
            options=[level.value for level in BudgetLevel],
            index=1,
            format_func=lambda value: {
                "low": "Low · ₹",
                "medium": "Medium · ₹₹",
                "high": "High · ₹₹₹",
            }.get(value, value),
            horizontal=True,
            help=_budget_label("medium"),
        )
        st.caption(_budget_label(budget))

        cuisine_options = cuisines
        default_cuisines = _cuisine_defaults(cuisine_options)
        selected_cuisines = st.multiselect(
            "Cuisine & Expression",
            options=cuisine_options,
            default=default_cuisines,
            placeholder="Select multiple — or leave empty for any",
            help="Optional. Leave empty to match any cuisine.",
        )
        if not cuisines:
            st.warning("Cuisine list failed to load from the dataset.")

        rating_label = st.radio(
            "Minimum Patron & Critic Score",
            options=list(RATING_OPTIONS.keys()),
            index=1,
            horizontal=True,
        )
        min_rating = RATING_OPTIONS[rating_label]

        additional = st.text_area(
            "Atmosphere or Specific Cravings",
            value="",
            placeholder=(
                "e.g. Quiet outdoor courtyard, sourdough pizza, "
                "natural light, pet-friendly dinner with friends…"
            ),
            help="Soft preferences used by the LLM for ranking and explanations",
        )

        submitted = st.button(
            "Get recommendations →",
            type="primary",
            use_container_width=True,
        )
        st.markdown(
            '<p class="trust-line">Powered by curated Bangalore culinary signals, '
            "reviewer consensus, and chef notes.</p>",
            unsafe_allow_html=True,
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with side_col:
        _render_spotlight(kitchen_count=len(df))

    if not submitted:
        _render_footer()
        return

    if not location or not str(location).strip():
        st.error("Please choose a location.")
        return

    prefs = UserPreferences(
        location=str(location),
        budget=budget,
        cuisine=list(selected_cuisines or []),
        min_rating=float(min_rating),
        additional_preferences=additional or "",
    )

    st.markdown(
        """
        <div class="matching-box">
          <div class="eyebrow">Autonomous Gastronomic Filter</div>
          <h3>Finding your ideal tables in Bangalore…</h3>
          <p>Matching recommendations with your criteria. Usually takes a few seconds.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.spinner("Synthesizing diner sentiment & critiques…"):
        try:
            response = recommend(prefs, df=df)
        except (LLMError, ParseError, ValueError) as exc:
            st.error(f"Recommendation failed: {exc}")
            st.caption(
                "Check your Groq API key / model in `.env`, or set `LLM_DRY_RUN=true`."
            )
            return
        except Exception as exc:  # noqa: BLE001
            st.error(f"Unexpected error: {exc}")
            return

    st.session_state["last_response"] = response
    st.session_state["last_prefs"] = prefs
    st.rerun()


if __name__ == "__main__":
    main()
