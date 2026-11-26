"use client";

import { titleCase } from "@/lib/constants";
import {
  FEATURED_CUISINE_ICONS,
  FoodGlyph,
  cuisineIconFor,
} from "@/lib/cuisineIcons";

type Props = {
  cuisines: string[];
  selected: string[];
  onToggle: (cuisine: string) => void;
  onClear: () => void;
};

export function CuisinePicker({
  cuisines,
  selected,
  onToggle,
  onClear,
}: Props) {
  const featuredIds = new Set(FEATURED_CUISINE_ICONS.map((c) => c.id));
  const featuredResolved = FEATURED_CUISINE_ICONS.map((icon) => {
    const match =
      cuisines.find((c) => c.toLowerCase() === icon.id) ??
      cuisines.find((c) => c.toLowerCase().includes(icon.id.split(" ")[0]));
    return match ? { ...icon, id: match.toLowerCase(), apiId: match } : null;
  }).filter(Boolean) as Array<(typeof FEATURED_CUISINE_ICONS)[number] & { apiId: string }>;

  const used = new Set(featuredResolved.map((c) => c.apiId.toLowerCase()));
  const extras = cuisines.filter(
    (c) => !used.has(c.toLowerCase()) && !featuredIds.has(c.toLowerCase()),
  );

  const tiles =
    featuredResolved.length > 0
      ? featuredResolved
      : FEATURED_CUISINE_ICONS.map((f) => ({ ...f, apiId: f.id }));

  return (
    <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
      <legend className="mb-0 p-0 font-display text-headline-sm text-on-surface">
        Cuisine
      </legend>
      <div className="flex items-center justify-between gap-3">
        <span className="text-body-sm text-on-surface-variant">
          Optional — tap as many as you like
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="border-0 bg-transparent p-2 text-[14px] font-semibold text-[#B8321C]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((icon) => {
          const active = selected.some(
            (s) => s.toLowerCase() === icon.apiId.toLowerCase() || s.toLowerCase() === icon.id,
          );
          return (
            <button
              key={icon.apiId}
              type="button"
              data-active={active}
              aria-pressed={active}
              onClick={() => onToggle(icon.apiId)}
              className={`cuisine-tile relative flex flex-col items-center gap-2.5 rounded-[22px] border-2 px-2 py-[18px] pb-4 text-[14px] font-semibold text-on-surface ${
                active
                  ? "border-primary bg-[#FFF6F2]"
                  : "border-transparent bg-[#FBF5EE] hover:border-[#E6DCCF] hover:bg-white"
              }`}
            >
              <span
                className="cuisine-tile__glyph flex h-[76px] w-[76px] items-center justify-center rounded-[24px]"
                style={{ background: icon.tint }}
              >
                <span className="block h-[62px] w-[62px]">
                  <FoodGlyph kind={icon.kind} />
                </span>
              </span>
              {icon.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {extras.length > 0 && (
        <select
          className="mt-1 h-12 w-full rounded-full border-[1.5px] border-[#E6DCCF] bg-white px-4 text-body-sm font-semibold text-on-surface focus:border-primary focus:outline-none"
          value=""
          onChange={(e) => {
            const next = e.target.value;
            if (next && !selected.includes(next)) onToggle(next);
          }}
        >
          <option value="">More cuisines…</option>
          {extras
            .filter((c) => !selected.includes(c))
            .map((c) => {
              const icon = cuisineIconFor(c);
              return (
                <option key={c} value={c}>
                  {icon.label || titleCase(c)}
                </option>
              );
            })}
        </select>
      )}
    </fieldset>
  );
}
