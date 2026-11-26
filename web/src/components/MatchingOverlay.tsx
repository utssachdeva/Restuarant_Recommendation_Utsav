type Props = {
  location: string | string[];
};

export function MatchingOverlay({ location }: Props) {
  const locationLabel = Array.isArray(location) ? location.join(", ") : location;
  return (
    <div className="fixed inset-0 top-[76px] z-30 flex items-center justify-center bg-[#FFFBF5]/85 px-margin md:px-gutter-desktop">
      <div className="relative flex w-full max-w-xl flex-col items-center overflow-hidden rounded-[28px] border border-outline-variant bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-peach text-primary shadow-lg">
            <span className="material-symbols-outlined text-[28px]">local_dining</span>
          </span>
        </div>
        <div className="mb-6 flex max-w-md flex-col gap-2">
          <span className="text-[12px] font-bold tracking-[0.14em] text-[#B8321C]">
            RANKING PASS
          </span>
          <h2 className="font-display text-headline-md leading-tight text-on-surface">
            Finding tables in Bangalore…
          </h2>
        </div>
        <div className="mb-6 flex w-full max-w-md flex-col gap-4 rounded-[22px] bg-[#FBF5EE] p-5 text-left">
          <Step title="Cross-referencing dining rooms" detail={locationLabel} />
          <Step
            title="Matching cuisine symbols"
            detail="Pizza, dosa, dumplings, coffee — whatever you tapped"
          />
          <Step
            active
            title="Ranking diner sentiment"
            detail="Consistency, seating rhythm, table acoustics"
          />
        </div>
        <p className="max-w-xs text-body-sm font-semibold leading-relaxed text-on-surface-variant">
          Usually a few seconds — longer on a cold start.
        </p>
        <div className="absolute bottom-0 left-0 h-1.5 w-full overflow-hidden bg-surface-container-high">
          <div className="h-full w-2/3 animate-pulse bg-primary" />
        </div>
      </div>
    </div>
  );
}

function Step({
  title,
  detail,
  active = false,
}: {
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
          active ? "bg-primary" : "bg-[#E6DCCF]"
        }`}
      />
      <div>
        <p className="text-[15px] font-semibold text-on-surface">{title}</p>
        <p className="text-body-sm text-on-surface-variant">{detail}</p>
      </div>
    </div>
  );
}
