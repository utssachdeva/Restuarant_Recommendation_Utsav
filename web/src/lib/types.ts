export type BudgetLevel = "low" | "medium" | "high";

export type UserPreferences = {
  location: string[];
  budget: BudgetLevel[];
  cuisine: string[];
  min_rating: number;
  additional_preferences: string;
};

export type RestaurantRecommendation = {
  rank: number;
  name: string;
  cuisine: string;
  rating: number | null;
  estimated_cost: number | null;
  explanation: string;
};

export type RecommendationMeta = {
  candidate_count: number;
  result_count: number;
  fallback_used: boolean;
  empty_reason: string | null;
  model: string | null;
  dry_run: boolean;
};

export type RecommendationResponse = {
  summary: string;
  recommendations: RestaurantRecommendation[];
  meta: RecommendationMeta;
};

export type FormOptions = {
  locations: string[];
  cuisines: string[];
  kitchen_count: number;
};
