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

  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const goHome = useCallback(() => {
    setResponse(null);
    setError(null);
    setScrollTarget("top");
  }, []);

  const goHowItWorks = useCallback(() => {
    setResponse(null);
    setError(null);
    setScrollTarget("how");
  }, []);

  const goFindRestaurant = useCallback(() => {
    setResponse(null);
    setError(null);
    setScrollTarget("desk");
  }, []);

  useEffect(() => {
    if (!scrollTarget || response) return;

    const id = scrollTarget;
    let cancelled = false;
    let attempts = 0;
    let retryTimer = 0;

    const finish = () => {
      if (!cancelled) setScrollTarget(null);
    };

    const run = () => {
      if (cancelled) return;

      if (id === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        finish();
        return;
      }

      const el = document.getElementById(id);
      if (el) {
        // Use window scroll — root overflow-x-hidden can break scrollIntoView.
        const headerOffset = 96;
        const top =
          el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        finish();
        return;
      }

      attempts += 1;
      if (attempts < 20) {
        retryTimer = window.setTimeout(run, 50);
        return;
      }
      finish();
    };

    // Wait one frame so HomeDiscovery can mount after leaving results.
    const frame = window.requestAnimationFrame(run);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(retryTimer);
    };
  }, [scrollTarget, response, options, prefs]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface font-sans text-on-surface antialiased">
      <Header
        onHome={goHome}
        onHowItWorks={goHowItWorks}
        onFindRestaurant={goFindRestaurant}
      />
      <main id="top" className="w-full bg-surface">
        {loadingOptions && (
          <div
            className="mx-auto flex max-w-xl flex-col items-center gap-4 px-margin py-24 text-center"
            data-enter
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container" />
            <p className="text-[14px] font-semibold text-on-surface-variant">
              Loading Bangalore ledger…
            </p>
            <div className="h-3 w-48 rounded-full bg-surface-container" />
            <div className="h-3 w-32 rounded-full bg-surface-container-low" />
          </div>
        )}

        {error && !submitting && (
          <div className="mx-auto max-w-[1240px] px-margin py-6 md:px-gutter-desktop">
            <div className="rounded-[22px] border border-outline-variant bg-white p-5 text-body-md text-error">
              {error}
              <p className="mt-2 text-body-sm text-on-surface-variant">
                {IS_LOCAL_API ? (
                  <>
                    Start the API with{" "}
                    <code className="font-mono text-on-surface">
                      uvicorn src.api:app --reload --port 8000
                    </code>
                  </>
                ) : (
                  <>
                    Could not reach the API at{" "}
                    <code className="font-mono text-on-surface">{API_URL}</code>.
                    If the backend just woke up, wait a moment and refresh.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {response && prefs ? (
          <div className="mx-auto max-w-[1240px] px-margin py-10 md:px-gutter-desktop">
            <ResultsView prefs={prefs} response={response} onModify={onModify} />
          </div>
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
      </main>
      <Footer />
      {submitting && prefs && <MatchingOverlay location={prefs.location} />}
    </div>
  );
}
