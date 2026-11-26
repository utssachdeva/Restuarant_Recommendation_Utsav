"use client";

import { budgetDisplay, titleCase } from "@/lib/constants";
import { FoodGlyph, cuisineIconFor } from "@/lib/cuisineIcons";
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
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12" data-enter>
      <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
        <div className="relative overflow-hidden rounded-[28px] border border-outline-variant bg-white p-7">
          <div className="flex items-center justify-between gap-3 pb-1">
            <span className="font-display text-[22px] tracking-[-0.02em] text-on-surface">
              Tonight&apos;s ticket
            </span>
            <span className="rounded-full bg-[#E3F3E8] px-2.5 py-1.5 text-[12px] font-bold tracking-[0.1em] text-[#1D5C38]">
              LIVE
            </span>
          </div>
          <div className="relative mx-[-28px] my-4 border-t-2 border-dashed border-[#EADFD1]">
            <span className="absolute -left-3 -top-3 block h-[22px] w-[22px] rounded-full border-r border-outline-variant bg-[#FFFBF5]" />
            <span className="absolute -right-3 -top-3 block h-[22px] w-[22px] rounded-full border-l border-outline-variant bg-[#FFFBF5]" />
          </div>
          <div className="space-y-5">
            <div>
              <span className="block text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
                WHERE
              </span>
              <p className="mt-1 text-[16px] font-semibold text-on-surface">
                {prefs.location.join(" · ")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
                  SPEND
                </span>
                <p className="mt-1 text-[16px] font-semibold text-on-surface">
                  {budgetDisplay(prefs.budget)}
                </p>
              </div>
              <div>
                <span className="block text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
                  RATING
                </span>
                <p className="mt-1 text-[16px] font-semibold text-on-surface">
                  {prefs.min_rating.toFixed(1)}+
                </p>
              </div>
            </div>
            <div>
              <span className="block text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
                CRAVING
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(prefs.cuisine.length ? prefs.cuisine : ["any"]).map((c) => {
                  if (c === "any") {
                    return (
                      <span
                        key={c}
                        className="rounded-full bg-secondary-container px-3 py-1.5 text-[14px] font-semibold text-on-secondary-container"
                      >
                        Surprise me
                      </span>
                    );
                  }
                  const icon = cuisineIconFor(c);
                  return (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-[14px] font-semibold text-on-surface"
                      style={{ background: icon.tint }}
                    >
                      <span className="block h-7 w-7">
                        <FoodGlyph kind={icon.kind} />
                      </span>
                      {titleCase(c)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-5">
            <button
              type="button"
              onClick={onModify}
              className="group flex items-center gap-1.5 text-[14px] font-semibold text-[#B8321C]"
            >
              <span>Modify criteria</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                tune
              </span>
            </button>
          </div>
        </div>
        <div className="rounded-[28px] bg-mint p-6">
          <p className="text-[15px] leading-relaxed text-[#2C4A38]">
            Tables checked against weekend noise, kitchen pace, and how well soft
            preferences match the room.
          </p>
        </div>
      </aside>

      <main className="flex flex-col gap-8 lg:col-span-8">
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
            <h1 className="font-display text-headline-lg tracking-tight text-on-surface">
              Your shortlist
            </h1>
            <span className="text-[14px] text-on-surface-variant">
              {meta.result_count} picks · from {meta.candidate_count} tables
            </span>
          </div>
          <div className="rounded-[24px] border border-outline-variant bg-white p-6">
            <p className="text-body-lg leading-relaxed text-[#5E554D]">
              {response.summary ||
                "A shortlist ranked for your neighbourhood, budget, and soft preferences."}
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          {response.recommendations.map((item) => (
            <RecommendationCard key={`${item.rank}-${item.name}`} item={item} />
          ))}
        </section>

        {(meta.model || meta.dry_run || meta.fallback_used) && (
          <p className="text-[12px] text-on-surface-variant">
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
