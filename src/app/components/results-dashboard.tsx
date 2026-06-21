import { CATEGORY_LABELS } from "@/constants";
import { FootprintChart } from "@/app/components/footprint-chart";
import type { Analysis, BenchmarkVerdict } from "@/domain/types";

interface ResultsDashboardProps {
  readonly analysis: Analysis;
}

const VERDICT_LABELS: Readonly<Record<BenchmarkVerdict, string>> = {
  "well-below": "well below",
  below: "below",
  around: "around",
  above: "above",
  "well-above": "well above",
};

function tonnes(kg: number): string {
  return (kg / 1000).toFixed(2);
}

function gapText(gapToParisTonnes: number): string {
  if (gapToParisTonnes <= 0) return `${Math.abs(gapToParisTonnes).toFixed(2)} t below target`;
  return `${gapToParisTonnes.toFixed(2)} t above target`;
}

export function ResultsDashboard({ analysis }: ResultsDashboardProps) {
  const topLabel = CATEGORY_LABELS[analysis.topCategory];
  const nextAction = analysis.recommendations.find(
    (recommendation) => recommendation.id === analysis.nextBestActionId,
  );

  return (
    <section className="space-y-5" aria-labelledby="results-heading">
      <div className="rounded-lg border border-emerald-900 bg-emerald-950 p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-emerald-100">Your annual estimate</p>
        <h2 id="results-heading" className="mt-2 text-4xl font-black tracking-normal">
          {analysis.footprint.totalTonnes.toFixed(2)} t CO2e
        </h2>
        <p className="mt-3 max-w-prose text-base leading-7 text-emerald-50">{analysis.insight}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Top driver</p>
          <p className="mt-1 text-xl font-black text-slate-950">{topLabel}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">If actions stick</p>
          <p className="mt-1 text-xl font-black text-slate-950">{tonnes(analysis.projectedTotalKg)} t</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Potential cut</p>
          <p className="mt-1 text-xl font-black text-slate-950">{analysis.potentialSavingKgPerYear} kg</p>
        </div>
      </div>

      <div className="rounded-lg border border-sky-200 bg-sky-50 p-5">
        <h3 className="text-base font-bold text-slate-950">Benchmark</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This profile is {VERDICT_LABELS[analysis.benchmark.verdictVsCountry]} the{" "}
          {analysis.benchmark.countryLabel} average of {analysis.benchmark.countryAverageTonnes.toFixed(1)} t,
          compared with a global average of {analysis.benchmark.globalAverageTonnes.toFixed(1)} t and a 2030
          Paris-aligned target of {analysis.benchmark.parisTargetTonnes.toFixed(1)} t.
        </p>
        <p className="mt-2 text-sm font-bold text-sky-950">{gapText(analysis.benchmark.gapToParisTonnes)}</p>
      </div>

      {nextAction ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-base font-bold text-slate-950">Next best action</h3>
          <p className="mt-2 text-lg font-black text-amber-950">{nextAction.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{nextAction.whyThisMatters}</p>
        </div>
      ) : null}

      <FootprintChart footprint={analysis.footprint} />
    </section>
  );
}
