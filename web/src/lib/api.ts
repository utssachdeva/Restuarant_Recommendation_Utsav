import type { FormOptions, RecommendationResponse, UserPreferences } from "./types";

/** Strip trailing slash so `${API_URL}/api/...` never doubles up. */
function normalizeApiUrl(raw: string): string {
  return raw.replace(/\/+$/, "");
}

/** Railway production API — used when NEXT_PUBLIC_API_URL is unset at build time. */
const DEFAULT_PRODUCTION_API_URL =
  "https://web-production-fcb9eb05.up.railway.app";

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? DEFAULT_PRODUCTION_API_URL
    : "http://localhost:8000";

export const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
);

export const IS_LOCAL_API = /localhost|127\.0\.0\.1/.test(API_URL);

/** First `/api/options` may download + clean the HF dataset on a cold Railway box. */
const OPTIONS_TIMEOUT_MS = 180_000;
/** Recommend includes filter + Groq round-trip; allow headroom after cold start. */
const RECOMMEND_TIMEOUT_MS = 120_000;

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

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Request timed out. The API may still be warming up after a cold start — please retry.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchOptions(): Promise<FormOptions> {
  const res = await fetchWithTimeout(
    `${API_URL}/api/options`,
    { cache: "no-store" },
    OPTIONS_TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<FormOptions>;
}

export async function fetchRecommendations(
  prefs: UserPreferences,
): Promise<RecommendationResponse> {
  const res = await fetchWithTimeout(
    `${API_URL}/api/recommend`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    },
    RECOMMEND_TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<RecommendationResponse>;
}
