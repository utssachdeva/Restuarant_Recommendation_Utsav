"use client";

import { budgetDisplay } from "@/lib/constants";
import { FoodGlyph, cuisineIconFor } from "@/lib/cuisineIcons";
import type { UserPreferences } from "@/lib/types";

type Props = {
  prefs: UserPreferences;
  kitchenCount: number;
};

export function TicketPanel({ prefs, kitchenCount }: Props) {
  const ready = prefs.location.length > 0 && prefs.budget.length > 0;
  const statusBg = ready ? "#E3F3E8" : "#FFF1C9";
  const statusFg = ready ? "#1D5C38" : "#7A5000";
  const statusLabel = ready ? "READY" : "ALMOST";

  return (
    <aside aria-label="Your picks so far" className="flex flex-col gap-5">
      <div className="relative flex flex-col gap-[18px] overflow-hidden rounded-[28px] border border-outline-variant bg-white p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-[22px] tracking-[-0.02em] text-on-surface">
            Tonight&apos;s ticket
          </span>
          <span
            className="rounded-full px-2.5 py-1.5 text-[12px] font-bold tracking-[0.1em]"
            style={{ background: statusBg, color: statusFg }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="relative mx-[-28px] border-t-2 border-dashed border-[#EADFD1]">
          <span className="absolute -left-3 -top-3 block h-[22px] w-[22px] rounded-full border-r border-outline-variant bg-[#FFFBF5]" />
          <span className="absolute -right-3 -top-3 block h-[22px] w-[22px] rounded-full border-l border-outline-variant bg-[#FFFBF5]" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
            WHERE
          </span>
          <span className="text-[16px] font-semibold leading-snug text-on-surface">
            {prefs.location.length ? prefs.location.join(" · ") : "Pick a neighbourhood"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
            SPEND FOR TWO
          </span>
          <span className="text-[16px] font-semibold text-on-surface">
            {prefs.budget.length ? budgetDisplay(prefs.budget) : "Pick a spend"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
            CRAVING
          </span>
          {prefs.cuisine.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {prefs.cuisine.map((c) => {
                const icon = cuisineIconFor(c);
                return (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-[14px] font-semibold"
                    style={{ background: icon.tint }}
                  >
                    <span className="block h-7 w-7">
                      <FoodGlyph kind={icon.kind} />
                    </span>
                    {icon.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-[16px] font-semibold text-on-surface-variant">
              Surprise me
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold tracking-[0.1em] text-on-surface-variant">
            RATING
          </span>
          <span className="text-[16px] font-semibold text-on-surface">
            {prefs.min_rating.toFixed(1)}+
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3.5 rounded-[28px] bg-mint p-6">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white">
          <span className="block h-10 w-10">
            <FoodGlyph kind="cafe" />
          </span>
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="text-[16px] font-bold text-[#1D4F32]">Tonight&apos;s pulse</span>
          <span className="text-[15px] leading-relaxed text-[#2C4A38]">
            Courtyards, craft pours and loud happy hours all live in the same ledger —
            we just cut to your cravings and spend.
          </span>
          <span className="mt-1 text-[12px] font-bold tracking-wide text-[#1D5C38]">
            {kitchenCount.toLocaleString()} kitchens scored
          </span>
        </div>
      </div>
    </aside>
  );
}
