export const FREQUENT_LOCATIONS = [
  "Koramangala",
  "Indiranagar",
  "Lavelle Road",
  "Malleshwaram",
  "Whitefield",
  "Jayanagar",
  "HSR",
  "JP Nagar",
] as const;

export const FEATURED_CUISINES = [
  "south indian",
  "north indian",
  "chinese",
  "italian",
  "continental",
  "cafe",
  "biryani",
  "seafood",
] as const;

export const RATING_OPTIONS = [
  { label: "3.5+", value: 3.5, hint: "" },
  { label: "4.0+ Recommended", value: 4.0, hint: "Recommended" },
  { label: "4.5+ Exceptional", value: 4.5, hint: "Exceptional" },
] as const;

export const BUDGET_OPTIONS = [
  {
    value: "low" as const,
    label: "₹",
    marks: "₹",
    detail: "Up to ₹500",
    range: "Up to ₹500",
  },
  {
    value: "medium" as const,
    label: "₹₹",
    marks: "₹₹",
    detail: "₹501 – ₹1,000",
    range: "₹501 – ₹1,000",
  },
  {
    value: "high" as const,
    label: "₹₹₹",
    marks: "₹₹₹",
    detail: "Above ₹1,000",
    range: "Above ₹1,000",
  },
];

export const MARQUEE_ITEMS = [
  "Masala dosa",
  "Dim sum",
  "Dum biryani",
  "Wood-fired pizza",
  "Filter coffee",
  "Butter chicken",
  "Fish curry",
  "Smash burgers",
] as const;

export function titleCase(value: string): string {
  return value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function budgetDisplay(budget: string | string[]): string {
  const map: Record<string, string> = {
    low: "Up to ₹500",
    medium: "₹501 – ₹1,000",
    high: "Above ₹1,000",
  };
  const levels = Array.isArray(budget) ? budget : [budget];
  return levels.map((b) => map[b] ?? b).join(" · ");
}
