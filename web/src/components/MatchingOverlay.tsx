type Props = {
  location: string | string[];
};

export function MatchingOverlay({ location }: Props) {
  const locationLabel = Array.isArray(location) ? location.join(", ") : location;
  return (
    <div className="fixed inset-0 top-16 z-30 flex items-center justify-center bg-surface/60 px-margin backdrop-blur-[2px] md:px-gutter-desktop">
      <div className="relative flex w-full max-w-xl flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-xl sm:p-space-xl">
        <div className="relative mb-space-lg flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/5 opacity-75 duration-1000" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined animate-pulse text-[28px] text-primary">
              local_dining
            </span>
          </div>
        </div>
        <div className="mb-space-lg flex max-w-md flex-col gap-space-xs">
          <span className="text-label-sm uppercase tracking-widest text-secondary">
            Autonomous Gastronomic Filter
          </span>
          <h2 className="font-headline text-headline-md font-medium leading-tight text-on-surface">
            Finding your ideal tables in Bangalore…
          </h2>
        </div>
        <div className="mb-space-lg flex w-full max-w-md flex-col gap-space-md rounded-lg bg-surface-container-low p-space-md text-left">
          <Step title="Cross-referencing dining rooms" detail={locationLabel} />
          <Step
            title="Filtering for courtyard dining & craft pours"
            detail="Botanical terraces, micro-lot roasters, low-intervention cellars"
          />
          <Step
            active
            title="Synthesizing recent diner sentiment & critiques"
            detail="Reviewing kitchen consistency, host seating rhythms, table acoustics"
          />
        </div>
        <p className="max-w-xs text-body-sm leading-relaxed text-tertiary">
          Matching recommendations with your specific criteria. Usually takes a few
          seconds.
        </p>
        <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-surface-container-high">
          <div className="h-full w-2/3 animate-pulse bg-primary" />
        </div>
      </div>
    </div>
  );
}

function Step({
  title,
  detail,
  active,
}: {
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-space-sm">
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          active
            ? "animate-spin bg-primary text-on-primary"
            : "bg-secondary text-on-secondary"
        }`}
        style={active ? { animationDuration: "2.5s" } : undefined}
      >
        <span className="material-symbols-outlined text-[14px]">
          {active ? "sync" : "check"}
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className={`text-body-md font-medium ${
            active ? "text-primary" : "text-on-surface"
          }`}
        >
          {title}
        </span>
        <span className="text-body-sm text-tertiary">{detail}</span>
      </div>
    </div>
  );
}
