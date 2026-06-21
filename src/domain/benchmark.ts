import {
  COUNTRY_AVERAGE_TONNES,
  COUNTRY_LABELS,
  GLOBAL_AVERAGE_TONNES,
  PARIS_ALIGNED_TONNES_2030,
} from "@/constants";
import { round2 } from "@/lib/num";
import type { Benchmark, BenchmarkVerdict, CountryCode, Footprint } from "@/domain/types";

function verdict(totalTonnes: number, averageTonnes: number): BenchmarkVerdict {
  const ratio = totalTonnes / averageTonnes;

  if (ratio <= 0.65) return "well-below";
  if (ratio <= 0.9) return "below";
  if (ratio <= 1.1) return "around";
  if (ratio <= 1.4) return "above";
  return "well-above";
}

export function benchmarkFootprint(footprint: Footprint, country: CountryCode): Benchmark {
  const countryAverageTonnes = COUNTRY_AVERAGE_TONNES[country];

  return {
    countryAverageTonnes,
    countryLabel: COUNTRY_LABELS[country],
    globalAverageTonnes: GLOBAL_AVERAGE_TONNES,
    parisTargetTonnes: PARIS_ALIGNED_TONNES_2030,
    verdictVsCountry: verdict(footprint.totalTonnes, countryAverageTonnes),
    gapToParisTonnes: round2(footprint.totalTonnes - PARIS_ALIGNED_TONNES_2030),
  };
}
