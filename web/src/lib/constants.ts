export const FREQUENT_LOCATIONS = [
  "Koramangala",
  "Indiranagar",
  "Lavelle Road",
  "Malleshwaram",
  "Whitefield",
  "Jayanagar",
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
  { value: "low" as const, label: "Low", marks: "₹", detail: "Under ₹500 for two" },
  {
    value: "medium" as const,
    label: "Medium",
    marks: "₹₹",
    detail: "₹501 – ₹1,000 for two",
  },
  { value: "high" as const, label: "High", marks: "₹₹₹", detail: "Above ₹1,000 for two" },
];

export const SPOTLIGHT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAKyu6bwAr1rbQ6l7q5HJQGcBE3DP144RD4Lg6r3DFDrX9rw3fvA_8xI5FK6x38SC7TtUhZZ-kDSNduG_gc1EW-VJpsvK6KJWLAw7Tn2crpg-qvgrDmMKWIWyTKVwpltMKN4HCEizy1YVL93-dzIFCqhtV1BYzmimGHDQuDtQGmO4JyryajFM4fuSwGcDAsYwdprDaddAcybmAlGuNw9nMHPJxCqxeofst5RNuWVaA";

export function titleCase(value: string): string {
  return value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function budgetDisplay(budget: string | string[]): string {
  const map: Record<string, string> = {
    low: "₹ (Low)",
    medium: "₹₹ (Medium)",
    high: "₹₹₹ (High)",
  };
  const levels = Array.isArray(budget) ? budget : [budget];
  return levels.map((b) => map[b] ?? b).join(" · ");
}
