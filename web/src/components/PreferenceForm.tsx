"use client";

import {
  BUDGET_OPTIONS,
  FREQUENT_LOCATIONS,
  RATING_OPTIONS,
} from "@/lib/constants";
import type { BudgetLevel, UserPreferences } from "@/lib/types";
import { CuisinePicker } from "./CuisinePicker";

type Props = {
  locations: string[];
  cuisines: string[];
  value: UserPreferences;
  onChange: (next: UserPreferences) => void;
  onSubmit: () => void;
  submitting?: boolean;
};

export function PreferenceForm({
  locations,
  cuisines,
  value,
  onChange,
  onSubmit,
  submitting = false,
}: Props) {
  const featuredAreas = FREQUENT_LOCATIONS.filter((loc) =>
    locations.includes(loc),
  );
  const selectedExtras = value.location.filter(
    (loc) => !(FREQUENT_LOCATIONS as readonly string[]).includes(loc),
  );
  const chipAreas = [...featuredAreas, ...selectedExtras];
  const moreAreas = locations.filter((loc) => !chipAreas.includes(loc));

  const ready = value.location.length > 0 && value.budget.length > 0;

  function toggleLocation(loc: string) {
    const selected = value.location.includes(loc)
      ? value.location.filter((l) => l !== loc)
      : [...value.location, loc];
    if (selected.length === 0) return;
    onChange({ ...value, location: selected });
  }

  function setBudget(level: BudgetLevel) {
    onChange({ ...value, budget: [level] });
  }

  function toggleCuisine(cuisine: string) {
    const selected = value.cuisine.includes(cuisine)
      ? value.cuisine.filter((c) => c !== cuisine)
      : [...value.cuisine, cuisine];
    onChange({ ...value, cuisine: selected });
  }

  return (
    <form
      className="flex flex-col gap-9 rounded-[32px] border border-outline-variant bg-white p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
        <legend className="mb-0 w-full p-0 font-display text-headline-sm text-on-surface">
          Neighbourhood
        </legend>
        <span className="text-body-sm text-on-surface-variant">Pick one or more</span>
        <div className="flex flex-wrap gap-2.5">
          {chipAreas.map((loc) => {
            const on = value.location.includes(loc);
            return (
              <button
                key={loc}
                type="button"
                aria-pressed={on}
                className={`zchip inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-[18px] py-2.5 text-[15px] font-semibold ${
                  on
                    ? "border-primary bg-primary text-on-primary"
                    : "border-[#E6DCCF] bg-white text-[#3D352E]"
                }`}
                onClick={() => toggleLocation(loc)}
              >
                {on && (
                  <svg
                    aria-hidden
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
                {loc}
              </button>
            );
          })}
        </div>
        {moreAreas.length > 0 && (
          <select
            className="h-11 w-full max-w-sm rounded-full border-[1.5px] border-[#E6DCCF] bg-white px-4 text-[15px] font-semibold text-on-surface focus:border-primary focus:outline-none"
            value=""
            onChange={(e) => {
              const next = e.target.value;
              if (next && !value.location.includes(next)) {
                onChange({ ...value, location: [...value.location, next] });
              }
            }}
          >
            <option value="">More neighbourhoods…</option>
            {moreAreas.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        )}
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
        <legend className="mb-0 p-0 font-display text-headline-sm text-on-surface">
          Spend for two
        </legend>
        <div className="grid grid-cols-3 gap-2.5 rounded-[22px] bg-[#FBF5EE] p-1.5">
          {BUDGET_OPTIONS.map((opt) => {
            const active = value.budget.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                className={`zchip flex min-h-16 flex-col items-center gap-0.5 rounded-2xl border-0 px-2 py-2.5 ${
                  active
                    ? "bg-white text-[#B8321C] shadow-[0_4px_14px_rgba(31,27,22,0.08)]"
                    : "bg-transparent text-[#3D352E]"
                }`}
                onClick={() => setBudget(opt.value as BudgetLevel)}
              >
                <span className="font-display text-[18px]">{opt.marks}</span>
                <span className="text-[13px] font-semibold">{opt.range}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <CuisinePicker
        cuisines={cuisines}
        selected={value.cuisine}
        onToggle={toggleCuisine}
        onClear={() => onChange({ ...value, cuisine: [] })}
      />

      <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
        <legend className="mb-0 p-0 font-display text-headline-sm text-on-surface">
          Minimum rating
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {RATING_OPTIONS.map((opt) => {
            const active = value.min_rating === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                aria-pressed={active}
                className={`zchip inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-[18px] py-2.5 text-[15px] font-semibold ${
                  active
                    ? "border-inverse-surface bg-inverse-surface text-inverse-on-surface"
                    : "border-[#E6DCCF] bg-white text-[#3D352E]"
                }`}
                onClick={() => onChange({ ...value, min_rating: opt.value })}
              >
                <svg
                  aria-hidden
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#F2B33D"
                  stroke="#C98A12"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                >
                  <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
                </svg>
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="zest-mood"
          className="flex items-baseline justify-between gap-3"
        >
          <span className="font-display text-headline-sm text-on-surface">
            Atmosphere or cravings
          </span>
          <span className="text-body-sm text-on-surface-variant">Optional</span>
        </label>
        <textarea
          id="zest-mood"
          className="resize-y rounded-[18px] border-[1.5px] border-[#E6DCCF] bg-[#FFFBF5] px-[18px] py-4 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
          rows={3}
          placeholder="Quiet courtyard, sourdough pizza, dinner with friends…"
          value={value.additional_preferences}
          onChange={(e) =>
            onChange({ ...value, additional_preferences: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={submitting || !ready}
          className={`zest-btn flex min-h-[60px] w-full items-center justify-center gap-2.5 px-6 text-[17px] font-bold disabled:cursor-not-allowed ${
            ready && !submitting
              ? "bg-primary text-on-primary"
              : "bg-[#E9DFD3] text-[#6B625A]"
          }`}
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              <span>Ranking tables…</span>
            </>
          ) : ready ? (
            <>
              <span>Get my shortlist</span>
              <svg
                aria-hidden
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          ) : (
            <span>Pick an area and a spend</span>
          )}
        </button>
        <p className="text-center text-body-sm text-on-surface-variant">
          Shortlist from the live Bangalore ledger.
        </p>
      </div>
    </form>
  );
}
