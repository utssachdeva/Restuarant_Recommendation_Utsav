"use client";

import type { UserPreferences } from "@/lib/types";
import { CoverHero } from "./CoverHero";
import { PreferenceForm } from "./PreferenceForm";
import { TicketPanel } from "./TicketPanel";

type Props = {
  locations: string[];
  cuisines: string[];
  kitchenCount: number;
  prefs: UserPreferences;
  onPrefsChange: (next: UserPreferences) => void;
  onSubmit: () => void;
  submitting: boolean;
};

const STEPS = [
  {
    n: "1",
    title: "Tap a craving",
    body: "Neighbourhood, spend and cuisine — picked by tapping, not typing.",
    bg: "#FFE9E2",
    fg: "#B8321C",
  },
  {
    n: "2",
    title: "We cut the ledger",
    body: "Bangalore kitchens filtered to what fits before any ranking happens.",
    bg: "#FFF1C9",
    fg: "#8A5A00",
  },
  {
    n: "3",
    title: "Shortlist lands",
    body: "Five tables, each with a plain reason why it's the one for tonight.",
    bg: "#E3F3E8",
    fg: "#2E7D4F",
  },
] as const;

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
      <CoverHero kitchenCount={kitchenCount} />

      <section
        id="how"
        className="mx-auto w-full max-w-[1240px] scroll-mt-24 px-margin pb-12 pt-20 md:px-gutter-desktop md:pb-12 md:pt-28"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="zest-card flex flex-col gap-3.5 rounded-[28px] border border-outline-variant bg-white p-7"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-[20px]"
                style={{ background: step.bg, color: step.fg }}
              >
                {step.n}
              </span>
              <h2 className="m-0 font-display text-headline-md text-on-surface">
                {step.title}
              </h2>
              <p className="m-0 text-body-md text-[#5E554D]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="desk"
        className="mx-auto w-full max-w-[1240px] scroll-mt-24 px-margin pb-16 pt-12 md:px-gutter-desktop"
      >
        <div className="mb-8 flex flex-col gap-2">
          <span className="text-[13px] font-bold tracking-[0.14em] text-[#B8321C]">
            PREFERENCE DESK
          </span>
          <h2 className="m-0 font-display text-headline-lg text-on-surface">
            What are we eating tonight?
          </h2>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-0 flex-[999_1_560px]">
            <PreferenceForm
              locations={locations}
              cuisines={cuisines}
              value={prefs}
              onChange={onPrefsChange}
              onSubmit={onSubmit}
              submitting={submitting}
            />
          </div>
          <div id="ledger" className="min-w-0 flex-[1_1_320px]">
            <TicketPanel prefs={prefs} kitchenCount={kitchenCount} />
          </div>
        </div>
      </section>
    </div>
  );
}
