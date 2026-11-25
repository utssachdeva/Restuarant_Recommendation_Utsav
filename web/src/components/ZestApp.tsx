"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, IS_LOCAL_API, fetchOptions, fetchRecommendations } from "@/lib/api";
import type {
  FormOptions,
  RecommendationResponse,
  UserPreferences,
} from "@/lib/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HomeDiscovery } from "./HomeDiscovery";
import { MatchingOverlay } from "./MatchingOverlay";
import { ResultsView } from "./ResultsView";

function defaultPrefs(locations: string[]): UserPreferences {
  const location =
    locations.find((l) => l === "Koramangala") ?? locations[0] ?? "";
  return {
    location: location ? [location] : [],
    budget: ["medium"],
    cuisine: [],
    min_rating: 4.0,
    additional_preferences: "",
  };
}

export function ZestApp() {
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOptions();
        if (cancelled) return;
        setOptions(data);
        setPrefs(defaultPrefs(data.locations));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load form options. Is the FastAPI server running?",
          );
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = useCallback(async () => {
    if (!prefs?.location.length || !prefs.budget.length) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await fetchRecommendations(prefs);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recommendation failed");
    } finally {
      setSubmitting(false);
    }
  }, [prefs]);

  const onModify = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      <Header />
      <main className="w-full bg-surface pt-16">
        <div className="mx-auto max-w-[1180px] px-margin py-space-xl md:px-gutter-desktop">
          {loadingOptions && (
            <p className="text-body-md text-tertiary">Loading Bangalore ledger…</p>
          )}

          {error && !submitting && (
            <div className="mb-space-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-space-md text-body-md text-error">
              {error}
              <p className="mt-1 text-body-sm text-tertiary">
                {IS_LOCAL_API ? (
                  <>
                    Start the API with{" "}
                    <code className="text-on-surface">
                      uvicorn src.api:app --reload --port 8000
                    </code>
                  </>
                ) : (
                  <>
                    Could not reach the API at{" "}
                    <code className="text-on-surface">{API_URL}</code>. If
                    the backend just woke up, wait a moment and refresh.
                  </>
                )}
              </p>
            </div>
          )}

          {response && prefs ? (
            <ResultsView prefs={prefs} response={response} onModify={onModify} />
          ) : (
            options &&
            prefs && (
              <HomeDiscovery
                locations={options.locations}
                cuisines={options.cuisines}
                kitchenCount={options.kitchen_count}
                prefs={prefs}
                onPrefsChange={setPrefs}
                onSubmit={onSubmit}
                submitting={submitting}
              />
            )
          )}
        </div>
      </main>
      <Footer />
      {submitting && prefs && <MatchingOverlay location={prefs.location} />}
    </div>
  );
}
