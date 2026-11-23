export function Footer() {
  return (
    <footer className="mt-space-xl w-full border-t border-surface-container-highest bg-surface-container-low">
      <div className="mx-auto max-w-[1180px] px-margin py-space-xl md:px-gutter-desktop">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-center">
          <div className="flex flex-col gap-space-xs">
            <span className="font-headline text-headline-sm text-on-surface">Zest</span>
            <p className="max-w-md text-body-sm text-tertiary">
              An unhurried culinary gazette recording taste, provenance, and table
              atmospheres across Bangalore.
            </p>
          </div>
          <div className="flex flex-col gap-space-md sm:flex-row sm:items-center sm:gap-space-lg">
            <span className="text-label-sm uppercase tracking-widest text-secondary">
              Bangalore · IND
            </span>
            <span className="text-body-sm text-tertiary">
              © 2026 Zest Culinary Press. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
