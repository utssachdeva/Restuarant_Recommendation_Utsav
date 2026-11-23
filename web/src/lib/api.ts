import type { FormOptions, RecommendationResponse, UserPreferences } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string | { msg?: string }[] };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg ?? JSON.stringify(d)).join("; ");
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

export async function fetchOptions(): Promise<FormOptions> {
  const res = await fetch(`${API_URL}/api/options`, { cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<FormOptions>;
}

export async function fetchRecommendations(
  prefs: UserPreferences,
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<RecommendationResponse>;
}
