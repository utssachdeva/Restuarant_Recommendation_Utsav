export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-surface-container-highest bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-margin md:px-gutter-desktop">
        <div className="flex items-center gap-space-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
            <span className="material-symbols-outlined text-[18px]">eco</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-headline-sm leading-none tracking-tight text-on-surface">
              Zest
            </span>
            <span className="mt-0.5 hidden text-label-sm uppercase tracking-wide text-tertiary sm:inline">
              Bangalore Culinary Intelligence
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-lg">
          <nav className="hidden items-center gap-space-md md:flex md:gap-space-lg">
            <span className="text-body-md text-on-surface-variant">How it works</span>
            <span className="text-title-md text-primary">Bangalore Curations</span>
            <span className="text-body-md text-on-surface-variant">Saved Places</span>
          </nav>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="material-symbols-outlined text-[18px] text-on-primary">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
