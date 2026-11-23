"use client";

import {
  BUDGET_OPTIONS,
  FEATURED_CUISINES,
  FREQUENT_LOCATIONS,
  RATING_OPTIONS,
  titleCase,
} from "@/lib/constants";
import type { BudgetLevel, UserPreferences } from "@/lib/types";

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
  const frequent = FREQUENT_LOCATIONS.filter((loc) => locations.includes(loc));
  const featured = FEATURED_CUISINES.filter((c) =>
    cuisines.includes(c),
  ) as string[];

  const budgetDetail = value.budget
    .map((b) => BUDGET_OPTIONS.find((opt) => opt.value === b)?.detail)
    .filter(Boolean)
    .join(" · ");

  function toggleLocation(loc: string) {
    const selected = value.location.includes(loc)
      ? value.location.filter((l) => l !== loc)
      : [...value.location, loc];
    if (selected.length === 0) return;
    onChange({ ...value, location: selected });
  }

  function toggleBudget(level: BudgetLevel) {
    const selected = value.budget.includes(level)
      ? value.budget.filter((b) => b !== level)
      : [...value.budget, level];
    if (selected.length === 0) return;
    onChange({ ...value, budget: selected });
  }

  function toggleCuisine(cuisine: string) {
    const selected = value.cuisine.includes(cuisine)
      ? value.cuisine.filter((c) => c !== cuisine)
      : [...value.cuisine, cuisine];
    onChange({ ...value, cuisine: selected });
  }

  function clearCuisines() {
    onChange({ ...value, cuisine: [] });
  }

  return (
    <form
      className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:p-space-xl"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-space-xs">
        <label className="flex items-center justify-between text-label-md text-on-surface">
          <span>Neighborhood / Area</span>
          <span className="text-body-sm font-normal text-tertiary">
            Select multiple
          </span>
        </label>

        {value.location.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {value.location.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => toggleLocation(loc)}
                className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-label-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                title="Remove neighborhood"
              >
                {loc}
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[18px] text-tertiary">
            location_on
          </span>
          <select
            className="w-full rounded-lg bg-surface-container-low py-2.5 pl-10 pr-4 text-body-md text-on-surface transition-all duration-150 focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-on-surface"
            value=""
            onChange={(e) => {
              const next = e.target.value;
              if (next && !value.location.includes(next)) {
                onChange({ ...value, location: [...value.location, next] });
              }
            }}
          >
            <option value="">Add a neighborhood…</option>
            {locations
              .filter((loc) => !value.location.includes(loc))
              .map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
          </select>
        </div>
        {frequent.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 text-label-sm text-tertiary">Frequent:</span>
            {frequent.map((loc) => {
              const active = value.location.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  className={`rounded px-2 py-0.5 text-body-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "bg-surface-container text-tertiary hover:text-on-surface"
                  }`}
                  onClick={() => toggleLocation(loc)}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-space-xs">
        <label className="flex items-center justify-between text-label-md text-on-surface">
          <span>Spend Index</span>
          <span className="text-body-sm font-normal text-secondary">
            {budgetDetail || "Select one or more"}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-space-xs rounded-lg bg-surface-container-low p-1">
          {BUDGET_OPTIONS.map((opt) => {
            const active = value.budget.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className={`flex flex-col items-center rounded px-3 py-2 text-center text-label-md transition-all duration-150 ${
                  active
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-tertiary"
                }`}
                onClick={() => toggleBudget(opt.value as BudgetLevel)}
              >
                <span className={active ? "font-semibold text-primary" : ""}>
                  {opt.label}
                </span>
                <span className="text-body-sm font-normal opacity-80">{opt.marks}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <label className="text-label-md text-on-surface">Cuisine &amp; Expression</label>
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-tertiary">Optional · tap to toggle</span>
            {value.cuisine.length > 0 && (
              <button
                type="button"
                onClick={clearCuisines}
                className="text-label-sm text-primary underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {value.cuisine.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {value.cuisine.map((cuisine) => (
              <button
                key={`selected-${cuisine}`}
                type="button"
                onClick={() => toggleCuisine(cuisine)}
                className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-label-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                title="Remove cuisine"
              >
                {titleCase(cuisine)}
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {featured.map((cuisine) => {
            const selected = value.cuisine.includes(cuisine);
            return (
              <button
                key={cuisine}
                type="button"
                className={`rounded-full px-3 py-1.5 text-label-sm transition-all duration-150 ${
                  selected
                    ? "bg-primary/10 font-semibold text-primary"
                    : "bg-surface-container-low text-tertiary hover:text-on-surface"
                }`}
                onClick={() => toggleCuisine(cuisine)}
              >
                {titleCase(cuisine)}
              </button>
            );
          })}
        </div>
        {cuisines.length > featured.length && (
          <select
            className="mt-1 w-full rounded-lg bg-surface-container-low px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-on-surface"
            value=""
            onChange={(e) => {
              const next = e.target.value;
              if (next && !value.cuisine.includes(next)) {
                onChange({ ...value, cuisine: [...value.cuisine, next] });
              }
            }}
          >
            <option value="">Add another cuisine…</option>
            {cuisines
              .filter((c) => !value.cuisine.includes(c))
              .map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <label className="text-label-md text-on-surface">
            Minimum Patron &amp; Critic Score
          </label>
          <span className="text-body-sm text-tertiary">Verified dining log</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {RATING_OPTIONS.map((opt) => {
            const active = value.min_rating === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-label-md transition-all duration-150 ${
                  active
                    ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                    : "bg-surface-container-low text-tertiary hover:text-on-surface"
                }`}
                onClick={() => onChange({ ...value, min_rating: opt.value })}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    active ? "text-secondary-container" : ""
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  star
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-space-xs">
        <label className="flex items-center justify-between text-label-md text-on-surface">
          <span>Atmosphere or Specific Cravings</span>
          <span className="text-label-sm font-normal text-tertiary">Optional nuances</span>
        </label>
        <textarea
          className="resize-none rounded-lg bg-surface-container-low p-3.5 text-body-md text-on-surface placeholder:text-tertiary/60 transition-all duration-150 focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-on-surface"
          rows={3}
          placeholder="e.g. Quiet outdoor courtyard, sourdough pizza, natural light, pet-friendly dinner with friends..."
          value={value.additional_preferences}
          onChange={(e) =>
            onChange({ ...value, additional_preferences: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-space-sm pt-space-xs">
        <button
          type="submit"
          disabled={submitting || value.location.length === 0 || value.budget.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-label-md text-on-primary shadow-sm transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              <span>Filtering Bangalore signals…</span>
            </>
          ) : (
            <>
              <span>Get recommendations</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
        <p className="text-center text-body-sm leading-relaxed text-tertiary">
          Powered by curated Bangalore culinary signals, reviewer consensus, and chef
          notes.
        </p>
      </div>
    </form>
  );
}
