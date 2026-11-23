import { SPOTLIGHT_IMAGE } from "@/lib/constants";

type Props = {
  kitchenCount: number;
};

export function SpotlightPanel({ kitchenCount }: Props) {
  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-label-sm uppercase tracking-wider text-secondary">
            Table Moods · Bangalore South
          </span>
          <span className="text-body-sm text-tertiary">Issue 42</span>
        </div>
        <div className="relative h-52 w-full overflow-hidden rounded-lg bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SPOTLIGHT_IMAGE}
            alt="Sunlit Bangalore courtyard cafe"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 left-3 rounded bg-surface/90 px-3 py-1 text-on-surface backdrop-blur-sm">
            <span className="text-label-sm tracking-wide">CANOPY &amp; FILTER COFFEE</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2 text-tertiary">
            <span className="text-body-sm">Koramangala 3rd Block</span>
            <span>•</span>
            <span className="text-body-sm">Artisan Bistro</span>
          </div>
          <h2 className="font-headline text-headline-sm text-on-surface">
            The courtyard sanctuary index
          </h2>
          <p className="text-body-md text-tertiary">
            Bangalore’s temperate evenings invite slow dining under rain trees. When you
            request outdoor courtyards, our catalog balances canopy density with quieter
            tables across the garden city.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-lg">
        <div className="flex items-center gap-space-xs text-primary">
          <span className="material-symbols-outlined text-[20px]">local_cafe</span>
          <span className="text-label-md">Local Provenance Tracker</span>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Featuring estate coffees from Chikmagalur, sourdough fermented with native
          Karnataka yeast cultures, and coastal Byadgi chili preparations.
        </p>
        <div className="flex items-center justify-between pt-2 text-tertiary">
          <span className="text-body-sm">
            {kitchenCount.toLocaleString()} active kitchens analyzed tonight
          </span>
          <span className="text-label-sm text-primary">Explore the ledger →</span>
        </div>
      </div>
    </div>
  );
}
