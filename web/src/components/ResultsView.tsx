"use client";

import { budgetDisplay, titleCase } from "@/lib/constants";
import type { RecommendationResponse, UserPreferences } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { RecommendationCard } from "./RecommendationCard";

type Props = {
  prefs: UserPreferences;
  response: RecommendationResponse;
  onModify: () => void;
};

export function ResultsView({ prefs, response, onModify }: Props) {
  if (!response.recommendations.length) {
    return <EmptyState prefs={prefs} response={response} onReset={onModify} />;
  }

  const { meta } = response;

  return (
    <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12 lg:gap-gutter-desktop">
      <aside className="space-y-space-lg lg:sticky lg:top-24 lg:col-span-4">
        <div className="rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="text-label-sm font-semibold uppercase tracking-widest text-secondary">
              Active Ledger
            </span>
            <span className="text-body-sm text-tertiary">Session · live</span>
          </div>
          <div className="mt-space-md space-y-space-md">
            <div>
              <span className="block text-label-sm uppercase tracking-wider text-tertiary">
                Neighborhoods
              </span>
              <p className="mt-0.5 text-title-md text-on-surface">
                {prefs.location.join(" · ")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              <div>
                <span className="block text-label-sm uppercase tracking-wider text-tertiary">
                  Price Level
                </span>
                <p className="mt-0.5 text-body-md font-medium text-on-surface">
                  {budgetDisplay(prefs.budget)}
                </p>
              </div>
              <div>
                <span className="block text-label-sm uppercase tracking-wider text-tertiary">
                  Threshold
                </span>
                <p className="mt-0.5 text-body-md font-medium text-on-surface">
                  {prefs.min_rating.toFixed(1)}+ Rating
                </p>
              </div>
            </div>
            <div>
              <span className="block text-label-sm uppercase tracking-wider text-tertiary">
                Palette Focus
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(prefs.cuisine.length ? prefs.cuisine : ["any"]).map((c) => (
                  <span
                    key={c}
                    className="rounded bg-secondary-container px-2 py-0.5 text-label-sm text-on-secondary-container"
                  >
                    {c === "any" ? "Any cuisine" : titleCase(c)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-space-md flex items-center justify-between pt-space-lg">
            <button
              type="button"
              onClick={onModify}
              className="group flex items-center gap-1.5 text-label-md text-primary transition-colors duration-150 hover:text-primary-container"
            >
              <span>Modify criteria</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                tune
              </span>
            </button>
            <span className="text-body-sm text-tertiary">Real-time sync</span>
          </div>
        </div>
        <div className="space-y-2 rounded-lg bg-surface-container p-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              verified
            </span>
            <span className="text-label-sm font-medium text-on-surface">
              Field Evaluator Note
            </span>
          </div>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">
            Tables were vetted against weekend acoustic levels, kitchen cadence, and
            ingredient integrity against your soft preferences.
          </p>
        </div>
      </aside>

      <main className="flex flex-col space-y-space-xl lg:col-span-8">
        <section className="space-y-space-md">
          <div className="flex flex-col justify-between gap-space-xs sm:flex-row sm:items-baseline">
            <h1 className="font-headline text-headline-lg font-medium tracking-tight text-on-surface">
              Curated for your evening
            </h1>
            <span className="text-body-sm font-medium text-tertiary">
              {meta.result_count} picks · distilled from {meta.candidate_count} evaluated
              Bangalore tables
            </span>
          </div>
          <div className="space-y-space-sm rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center gap-2 text-label-sm uppercase tracking-wider text-secondary">
              <span className="material-symbols-outlined text-[16px]">
                temp_preferences_custom
              </span>
              Sensory Synthesis
            </div>
            <p className="text-body-lg font-normal leading-relaxed text-on-surface-variant">
              {response.summary ||
                "A shortlist ranked for your neighbourhood, budget, and soft preferences."}
            </p>
          </div>
        </section>

        <section className="flex flex-col space-y-space-lg">
          {response.recommendations.map((item) => (
            <RecommendationCard key={`${item.rank}-${item.name}`} item={item} />
          ))}
        </section>

        {(meta.model || meta.dry_run || meta.fallback_used) && (
          <p className="text-body-sm text-tertiary">
            {[
              meta.model ? `Model: ${meta.model}` : null,
              meta.dry_run ? "Dry-run mode" : null,
              meta.fallback_used ? "Fallback ranking used" : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </main>
    </div>
  );
}
