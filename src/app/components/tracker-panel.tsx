import type { Analysis } from "@/domain/types";

interface TrackerPanelProps {
  readonly analysis: Analysis;
  readonly adoptedIds: readonly string[];
}

function sumAdoptedSavings(analysis: Analysis, adoptedIds: readonly string[]): number {
  return analysis.recommendations
    .filter((recommendation) => adoptedIds.includes(recommendation.id))
    .reduce((sum, recommendation) => sum + recommendation.savingKgPerYear, 0);
}

export function TrackerPanel({ analysis, adoptedIds }: TrackerPanelProps) {
  const adoptedSavingKg = sumAdoptedSavings(analysis, adoptedIds);
  const trackedTotalKg = Math.max(0, analysis.footprint.totalKg - adoptedSavingKg);

  return (
    <aside className="rounded-lg border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="tracker-heading">
      <h2 id="tracker-heading" className="text-lg font-black text-emerald-950">
        Tracked progress
      </h2>
      <p className="mt-2 text-sm leading-6 text-emerald-950">
        Adopted actions are saved in this browser only. Nothing is sent to an account or database.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Actions adopted</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{adoptedIds.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Tracked cut</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{adoptedSavingKg} kg</p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Tracked total</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{(trackedTotalKg / 1000).toFixed(2)} t</p>
        </div>
      </div>
    </aside>
  );
}
