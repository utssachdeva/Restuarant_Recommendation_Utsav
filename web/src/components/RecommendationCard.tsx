import { titleCase } from "@/lib/constants";
import type { RestaurantRecommendation } from "@/lib/types";

type Props = {
  item: RestaurantRecommendation;
};

export function RecommendationCard({ item }: Props) {
  const rank = String(item.rank).padStart(2, "0");
  const rating =
    typeof item.rating === "number" ? item.rating.toFixed(1) : "—";
  const cost =
    typeof item.estimated_cost === "number"
      ? `₹${Math.round(item.estimated_cost).toLocaleString()} for two`
      : "—";
  const cuisine = item.cuisine ? titleCase(item.cuisine) : "Bangalore";

  return (
    <article className="rounded-lg bg-surface-container-lowest p-space-lg shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col space-y-space-sm">
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-headline text-headline-sm font-normal text-tertiary">
              {rank}
            </span>
            <div className="flex items-center gap-1 rounded bg-surface-container-high px-2 py-0.5">
              <span
                className="material-symbols-outlined text-[14px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-label-sm font-semibold text-on-surface">
                {rating}
              </span>
            </div>
          </div>
          <h2 className="font-headline text-headline-md text-on-surface">
            {item.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-on-surface-variant">
            <span>{cuisine}</span>
            <span className="text-tertiary">•</span>
            <span className="font-medium text-secondary">{cost}</span>
          </div>
        </div>
        <div className="rounded-lg border-l-2 border-secondary bg-surface-container-low p-space-sm">
          <p className="text-body-md italic leading-relaxed text-on-surface">
            “{item.explanation}”
          </p>
        </div>
      </div>
    </article>
  );
}
