import { titleCase } from "@/lib/constants";
import type { RestaurantRecommendation } from "@/lib/types";

type Props = {
  item: RestaurantRecommendation;
};

export function RecommendationCard({ item }: Props) {
  const rating =
    typeof item.rating === "number" ? item.rating.toFixed(1) : "—";
  const cost =
    typeof item.estimated_cost === "number"
      ? `₹${Math.round(item.estimated_cost).toLocaleString()} for two`
      : "—";
  const cuisine = item.cuisine ? titleCase(item.cuisine) : "Bangalore";

  return (
    <article className="zest-card rounded-[24px] border border-outline-variant bg-white p-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-peach font-display text-[15px] text-[#B8321C]">
              {item.rank}
            </span>
            <div className="flex items-center gap-1.5 rounded-full border border-[#E6DCCF] bg-[#FBF5EE] px-2.5 py-1">
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="#F2B33D"
                stroke="#C98A12"
                strokeWidth="1.5"
                strokeLinejoin="round"
              >
                <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
              </svg>
              <span className="text-[13px] font-semibold text-on-surface">{rating}</span>
            </div>
          </div>
          <h2 className="font-display text-headline-md text-on-surface">{item.name}</h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-[#5E554D]">
            <span>{cuisine}</span>
            <span aria-hidden>•</span>
            <span className="font-semibold text-[#B8321C]">{cost}</span>
          </div>
        </div>
        <div className="rounded-[18px] border-l-[3px] border-primary/40 bg-[#FBF5EE] p-4">
          <p className="text-body-md leading-relaxed text-on-surface">
            “{item.explanation}”
          </p>
        </div>
      </div>
    </article>
  );
}
