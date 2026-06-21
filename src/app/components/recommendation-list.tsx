import { CATEGORY_LABELS } from "@/constants";
import type { Recommendation } from "@/domain/types";

interface RecommendationListProps {
  readonly recommendations: readonly Recommendation[];
  readonly adoptedIds: readonly string[];
  readonly onToggle: (id: string) => void;
}

function effortLabel(value: Recommendation["effort"]): string {
  return value[0]?.toUpperCase() + value.slice(1);
}

function costLabel(value: Recommendation["costImpact"]): string {
  return value.replace("-", " ");
}

export function RecommendationList({
  recommendations,
  adoptedIds,
  onToggle,
}: RecommendationListProps) {
  return (
    <section className="space-y-4" aria-labelledby="recommendations-heading">
      <div>
        <h2 id="recommendations-heading" className="text-2xl font-black tracking-normal text-slate-950">
          Personalized action plan
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Ranked by estimated saving, feasibility, budget fit, preferred effort, and your stated goal.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
          This profile is already low-impact across the tracked categories. Keep the habits that are working and
          revisit the calculator after major travel, housing, or vehicle changes.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {recommendations.map((recommendation, index) => {
          const adopted = adoptedIds.includes(recommendation.id);
          return (
            <article
              key={recommendation.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              aria-labelledby={`${recommendation.id}-title`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-800">
                    #{index + 1} · {CATEGORY_LABELS[recommendation.category]}
                  </p>
                  <h3 id={`${recommendation.id}-title`} className="mt-2 text-lg font-black text-slate-950">
                    {recommendation.title}
                  </h3>
                </div>
                <button
                  className="min-h-10 rounded-lg border border-emerald-800 px-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  type="button"
                  aria-pressed={adopted}
                  onClick={() => onToggle(recommendation.id)}
                >
                  {adopted ? "Adopted" : "Track"}
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">{recommendation.rationale}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{recommendation.whyThisMatters}</p>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">Saving</dt>
                  <dd className="mt-1 font-black text-slate-950">{recommendation.savingKgPerYear} kg</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">Effort</dt>
                  <dd className="mt-1 font-black text-slate-950">{effortLabel(recommendation.effort)}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">Cost</dt>
                  <dd className="mt-1 font-black capitalize text-slate-950">{costLabel(recommendation.costImpact)}</dd>
                </div>
              </dl>

              <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {recommendation.actionSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
