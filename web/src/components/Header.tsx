"use client";

import { FoodGlyph } from "@/lib/cuisineIcons";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-[#FFFBF5]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-margin py-5 md:px-gutter-desktop">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>

        <a href="#top" className="flex items-center gap-3 text-on-surface no-underline">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-peach">
            <span className="block h-[34px] w-[34px]">
              <FoodGlyph kind="italian" />
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[24px] tracking-[-0.02em] text-on-surface">
              Zest
            </span>
            <span className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant">
              BANGALORE NIGHTS
            </span>
          </span>
        </a>

        <nav
          className="flex flex-wrap items-center gap-5 text-[15px] font-medium md:gap-7"
          aria-label="Main"
        >
          <a
            href="#how"
            className="hidden text-[#4A423B] no-underline transition-colors hover:text-primary sm:inline"
          >
            How it works
          </a>
          <a
            href="#desk"
            className="hidden text-[#4A423B] no-underline transition-colors hover:text-primary sm:inline"
          >
            Cuisines
          </a>
          <a
            href="#desk"
            className="zest-btn inline-flex h-auto items-center justify-center bg-primary px-[22px] py-3 text-[15px] font-semibold text-on-primary"
          >
            Find a table
          </a>
        </nav>
      </div>
    </header>
  );
}
