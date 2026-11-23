"use client";

import type { UserPreferences } from "@/lib/types";
import { PreferenceForm } from "./PreferenceForm";
import { SpotlightPanel } from "./SpotlightPanel";

type Props = {
  locations: string[];
  cuisines: string[];
  kitchenCount: number;
  prefs: UserPreferences;
  onPrefsChange: (next: UserPreferences) => void;
  onSubmit: () => void;
  submitting: boolean;
};

export function HomeDiscovery({
  locations,
  cuisines,
  kitchenCount,
  prefs,
  onPrefsChange,
  onSubmit,
  submitting,
}: Props) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center justify-between pb-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span className="text-label-sm uppercase tracking-widest text-secondary">
            Gazette Edition No. 42 · Autumn Registry
          </span>
        </div>
        <div className="hidden items-center gap-space-sm text-tertiary sm:flex">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span className="text-body-sm">Curation updated from live Bangalore tables</span>
        </div>
      </div>

      <section className="relative pb-space-lg pt-space-xs">
        <div className="flex max-w-3xl flex-col gap-space-xs">
          <div className="inline-flex w-fit items-center gap-space-xs rounded-full bg-surface-container-high px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-label-sm text-on-surface-variant">
              Bangalore dining engine
            </span>
          </div>
          <h1 className="mt-space-xs font-display text-[34px] leading-[42px] tracking-tight text-on-surface md:text-display-lg md:leading-[56px]">
            Where shall we eat tonight?
          </h1>
          <p className="max-w-xl text-body-lg text-tertiary">
            Find where to eat — preferences in, recommendations out. An unhurried survey
            of tables, moods, and regional terroir across the garden city.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:col-span-7">
          <PreferenceForm
            locations={locations}
            cuisines={cuisines}
            value={prefs}
            onChange={onPrefsChange}
            onSubmit={onSubmit}
            submitting={submitting}
          />
        </div>
        <div className="lg:col-span-5">
          <SpotlightPanel kitchenCount={kitchenCount} />
        </div>
      </div>
    </div>
  );
}
