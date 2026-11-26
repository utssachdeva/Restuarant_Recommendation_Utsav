"use client";

import type { CSSProperties } from "react";
import { MARQUEE_ITEMS } from "@/lib/constants";
import { COVER_TILES, FoodGlyph } from "@/lib/cuisineIcons";

type Props = {
  kitchenCount: number;
};

export function CoverHero({ kitchenCount }: Props) {
  const marquee = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <>
      <section
        className="relative mx-auto flex min-h-[560px] max-w-[1240px] flex-col items-center justify-center px-margin py-[72px] text-center md:px-gutter-desktop md:pb-24"
        data-enter
        aria-label="Zest cover"
      >
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
          {COVER_TILES.map((tile, i) => {
            const isRight = i >= 3;
            return (
              <div
                key={tile.kind}
                className="zf"
                style={
                  {
                    left: isRight ? "auto" : tile.x,
                    right: isRight
                      ? i === 3
                        ? "5%"
                        : i === 4
                          ? "13%"
                          : "2%"
                      : "auto",
                    top: tile.y,
                    width: tile.size,
                    height: tile.size,
                    borderRadius: tile.size > 110 ? 40 : tile.size > 90 ? 36 : 28,
                    background: tile.tint,
                    ["--r" as string]: tile.r,
                    animationDelay: tile.delay,
                  } as CSSProperties
                }
              >
                <span style={{ width: tile.glyph, height: tile.glyph }} className="block">
                  <FoodGlyph kind={tile.kind} />
                </span>
              </div>
            );
          })}
        </div>

        <div className="zrise relative z-10 flex max-w-[720px] flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[#EFE6DA] bg-white px-4 py-2 text-[14px] font-semibold text-[#3D352E]">
            <span className="zdot block h-2 w-2 rounded-full bg-[#2E7D4F]" />
            {kitchenCount.toLocaleString()} kitchens · Bangalore
          </span>

          <h1 className="m-0 font-display text-display-lg text-on-surface">
            Tonight&apos;s table,{" "}
            <span className="relative whitespace-nowrap text-primary">
              sorted.
              <svg
                aria-hidden
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute bottom-[-10px] left-0 h-4 w-full"
              >
                <path
                  d="M4 14 Q40 2 76 12 T150 10 T224 10 T296 8"
                  fill="none"
                  stroke="#F2B33D"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="m-0 max-w-[540px] text-body-lg text-[#5E554D]">
            Tap a craving, pick a spend, get a shortlist. Playful picks for hungry
            Bangalore evenings — no photo clutter, just flavour.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#desk"
              className="zest-btn inline-flex h-auto items-center gap-2.5 bg-primary px-7 py-4 text-[16px] font-semibold text-on-primary"
            >
              Find a table
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
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a
              href="#how"
              className="zest-btn inline-flex h-auto items-center border-[1.5px] border-[#E6DCCF] bg-white px-7 py-4 text-[16px] font-semibold text-on-surface"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      <div
        aria-hidden
        className="my-2 -mx-5 overflow-hidden bg-inverse-surface py-4 text-[#FFFBF5]"
        style={{ transform: "rotate(-1.2deg)" }}
      >
        <div className="zmarq flex w-max gap-10 whitespace-nowrap font-display text-[22px] font-semibold tracking-tight">
          {marquee.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-10">
              {item}
              <span className="text-sun">✺</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
