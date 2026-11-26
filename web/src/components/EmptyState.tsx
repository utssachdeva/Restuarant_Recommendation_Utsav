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
    <div className="flex w-full flex-col" data-enter>
      <div className="mb-10 w-full rounded-xl border border-outline-variant bg-surface-container-low p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[12px] text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Active criteria
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full bg-surface-container-highest px-3 py-1 text-label-md text-on-surface-variant"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-left text-label-sm text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary md:text-right"
          >
            Clear all
          </button>
        </div>
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center py-8 text-center sm:py-12">
        <div className="relative mb-6 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
          <div className="absolute inset-0 rounded-full bg-surface-container opacity-60" />
          <div className="absolute inset-2 rounded-full bg-surface-container-low opacity-80" />
          <span className="material-symbols-outlined relative text-[56px] text-secondary opacity-70">
            restaurant
          </span>
        </div>
        <span className="mb-2 font-mono text-[12px] text-on-surface-variant">
          No match · try a wider pass
        </span>
        <h1 className="mb-4 max-w-2xl font-display text-headline-lg tracking-tight text-on-surface sm:text-display-lg">
          No tables match these exact criteria
        </h1>
        <p className="mb-10 max-w-xl text-body-lg leading-relaxed text-on-surface-variant">
          {response.summary ||
            "Bangalore has plenty of tables — few match this exact mix. Relax one or two filters to open the shortlist."}
        </p>
        <div className="mb-10 flex w-full flex-col items-center gap-3">
          <span className="font-mono text-[12px] text-on-surface-variant">
            Suggested adjustments
          </span>
          <div className="flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {[
              "Add a nearby neighbourhood",
              "Lower the rating threshold",
              "Drop a cuisine filter",
            ].map((tip) => (
              <span
                key={tip}
                className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2.5 text-label-md text-on-surface"
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
          className="zest-btn bg-primary px-6 text-[16px] font-medium text-on-primary"
        >
          Reset all filters
        </button>
      </section>
    </div>
  );
}
