"use client";

import { useEffect, useMemo, useState } from "react";
import { Methodology } from "@/app/components/methodology";
import { ProfileForm } from "@/app/components/profile-form";
import { RecommendationList } from "@/app/components/recommendation-list";
import { ResultsDashboard } from "@/app/components/results-dashboard";
import { TrackerPanel } from "@/app/components/tracker-panel";
import { analyzeProfile } from "@/domain/coach";
import { DEFAULT_PROFILE } from "@/domain/sample-profiles";
import type { Analysis, LifestyleProfile } from "@/domain/types";

const STORAGE_KEY = "carboncoach.adopted-actions.v1";

type FieldErrors = Readonly<Record<string, string>>;

function parseStoredIds(value: string | null): readonly string[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

function filterCurrentAdopted(ids: readonly string[], analysis: Analysis): readonly string[] {
  const currentIds = new Set(analysis.recommendations.map((recommendation) => recommendation.id));
  return ids.filter((id) => currentIds.has(id));
}

export function CarbonCoachApp() {
  const initialAnalysis = useMemo(() => analyzeProfile(DEFAULT_PROFILE), []);
  const [profile, setProfile] = useState<LifestyleProfile>(DEFAULT_PROFILE);
  const [analysis, setAnalysis] = useState<Analysis>(initialAnalysis);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [adoptedIds, setAdoptedIds] = useState<readonly string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    window.queueMicrotask(() => {
      if (!mounted) return;
      try {
        setAdoptedIds(parseStoredIds(window.localStorage.getItem(STORAGE_KEY)));
      } catch {
        setAdoptedIds([]);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(adoptedIds));
  }, [adoptedIds]);

  function applyAnalysis(nextAnalysis: Analysis): void {
    setAnalysis(nextAnalysis);
    setAdoptedIds((current) => filterCurrentAdopted(current, nextAnalysis));
  }

  function submitProfile(): void {
    setIsSubmitting(true);
    setFieldErrors({});
    setStatusMessage("");

    const nextAnalysis = analyzeProfile(profile);
    applyAnalysis(nextAnalysis);
    setStatusMessage("Plan updated locally.");
    setIsSubmitting(false);
  }

  function toggleAdopted(id: string): void {
    setAdoptedIds((current) =>
      current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-emerald-900 focus:shadow-lg"
        href="#main"
      >
        Skip to calculator
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-emerald-800">CarbonCoach</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              Carbon footprint awareness platform
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Calculate a personal annual footprint, compare it with benchmarks, and get a ranked action plan that adapts
            to your lifestyle.
          </p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="form-heading">
            <h2 id="form-heading" className="text-2xl font-black tracking-normal text-slate-950">
              Lifestyle profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter rough monthly and weekly habits. The estimate updates through the validated analysis route.
            </p>
            <div className="mt-6">
              <ProfileForm
                profile={profile}
                errors={fieldErrors}
                isSubmitting={isSubmitting}
                onProfileChange={setProfile}
                onSubmit={() => {
                  void submitProfile();
                }}
              />
            </div>
            {statusMessage ? (
              <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-700" role="status">
                {statusMessage}
              </p>
            ) : null}
          </section>

          <ResultsDashboard analysis={analysis} />
        </div>

        <TrackerPanel analysis={analysis} adoptedIds={adoptedIds} />
        <RecommendationList
          recommendations={analysis.recommendations}
          adoptedIds={adoptedIds}
          onToggle={toggleAdopted}
        />
        <Methodology />
      </main>
    </div>
  );
}
