import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/constants";
import type { Footprint } from "@/domain/types";

interface FootprintChartProps {
  readonly footprint: Footprint;
}

function percent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function FootprintChart({ footprint }: FootprintChartProps) {
  const maxValue = Math.max(...CATEGORY_ORDER.map((category) => footprint.categories[category]), 1);

  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-5">
      <figcaption className="text-base font-bold text-slate-950">Annual footprint by category</figcaption>
      <svg
        className="mt-4 h-72 w-full"
        role="img"
        viewBox="0 0 520 300"
        aria-labelledby="footprint-chart-title footprint-chart-desc"
      >
        <title id="footprint-chart-title">Carbon footprint category chart</title>
        <desc id="footprint-chart-desc">
          Bar chart showing home energy, transport, flights, food, and goods emissions in kilograms CO2e per year.
        </desc>
        {CATEGORY_ORDER.map((category, index) => {
          const value = footprint.categories[category];
          const width = Math.max(8, (value / maxValue) * 300);
          const y = 22 + index * 52;
          return (
            <g key={category}>
              <text x="0" y={y + 17} className="fill-slate-700 text-[13px] font-semibold">
                {CATEGORY_LABELS[category]}
              </text>
              <rect x="138" y={y} width="300" height="24" rx="6" className="fill-slate-100" />
              <rect x="138" y={y} width={width} height="24" rx="6" className="fill-emerald-700" />
              <text x="454" y={y + 17} className="fill-slate-900 text-[13px] font-bold">
                {value} kg
              </text>
              <text x="454" y={y + 34} className="fill-slate-500 text-[11px]">
                {percent(value, footprint.totalKg)}%
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
