import { budgetDisplay, titleCase } from "@/lib/constants";
import type { RecommendationResponse, UserPreferences } from "@/lib/types";

type Props = {
  prefs: UserPreferences;
  response: RecommendationResponse;
  onReset: () => void;
};

export function EmptyState({ prefs, response, onReset }: Props) {
  const chips = [
    prefs.location.join(" · "),
    budgetDisplay(prefs.budget),
    ...(prefs.cuisine.length
      ? [prefs.cuisine.slice(0, 3).map(titleCase).join(", ")]
      : []),
    `Rating ≥ ${prefs.min_rating.toFixed(1)}`,
  ];

  return (
    <div className="flex w-full flex-col">
      <div className="mb-space-xl w-full rounded-lg bg-surface-container-low p-space-md sm:p-space-lg">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-center">
          <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:gap-space-md">
            <span className="flex shrink-0 items-center gap-1.5 text-label-sm uppercase tracking-widest text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Active Criteria
            </span>
            <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded bg-surface-container-highest px-3 py-1 text-label-md text-on-surface-variant"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-left text-label-sm uppercase tracking-wider text-tertiary underline underline-offset-4 transition-colors hover:text-primary md:text-right"
          >
            Clear All
          </button>
        </div>
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center py-space-lg text-center sm:py-space-xl">
        <div className="relative mb-space-lg flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
          <div className="absolute inset-0 rounded-full bg-surface-container opacity-60" />
          <div className="absolute inset-2 rounded-full bg-surface-container-low opacity-80" />
          <span className="material-symbols-outlined relative text-[64px] text-secondary opacity-70">
            restaurant
          </span>
        </div>
        <span className="mb-space-xs text-label-sm uppercase tracking-widest text-tertiary">
          Gazette Archive Notice · Volume XIV
        </span>
        <h1 className="mb-space-md max-w-2xl font-display text-headline-lg tracking-tight text-on-surface sm:text-display-lg">
          No exact tables match these specific criteria
        </h1>
        <p className="mb-space-xl max-w-xl text-body-lg leading-relaxed text-tertiary">
          {response.summary ||
            "Bangalore has rich culinary diversity, but few venues match this exact combination. Relaxing one or two filters will unlock great options."}
        </p>
        <div className="mb-space-xl flex w-full flex-col items-center gap-space-sm">
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Suggested Adjustments
          </span>
          <div className="flex max-w-2xl flex-wrap items-center justify-center gap-space-xs sm:gap-space-sm">
            {[
              "Expand search radius to nearby neighbourhoods",
              "Adjust rating threshold lower",
              "Try fewer cuisine filters",
            ].map((tip) => (
              <span
                key={tip}
                className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 text-label-md text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  tune
                </span>
                {tip}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors duration-200 hover:bg-primary-container"
        >
          Reset all filters
        </button>
      </section>
    </div>
  );
}
