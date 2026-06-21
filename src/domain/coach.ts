import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/constants";
import { benchmarkFootprint } from "@/domain/benchmark";
import { calculateFootprint } from "@/domain/calculator";
import { generateRecommendations } from "@/domain/recommendations";
import type { Analysis, Footprint, FootprintCategory, LifestyleProfile } from "@/domain/types";

function topCategory(footprint: Footprint): FootprintCategory {
  return CATEGORY_ORDER.reduce((current, candidate) =>
    footprint.categories[candidate] > footprint.categories[current] ? candidate : current,
  );
}

function tonnesLabel(kg: number): string {
  return `${(kg / 1000).toFixed(1)} t`;
}

function insightFor(profile: LifestyleProfile, analysis: Pick<Analysis, "footprint" | "topCategory">): string {
  const categoryKg = analysis.footprint.categories[analysis.topCategory];
  const share = Math.round((categoryKg / analysis.footprint.totalKg) * 100);

  if (analysis.topCategory === "flights") {
    return `Flights are your biggest lever: ${profile.transport.longFlightsPerYear + profile.transport.shortFlightsPerYear} return trip(s) create ${share}% of this footprint.`;
  }

  if (analysis.topCategory === "transport") {
    return `Transport is your main lever at ${tonnesLabel(categoryKg)} per year; reducing recurring kilometres will move the total fastest.`;
  }

  return `${CATEGORY_LABELS[analysis.topCategory]} leads your profile at ${tonnesLabel(categoryKg)} per year, about ${share}% of the total.`;
}

function potentialSavingKg(analysis: Pick<Analysis, "footprint" | "recommendations">): number {
  const rawSaving = analysis.recommendations.reduce(
    (sum, recommendation) => sum + recommendation.savingKgPerYear,
    0,
  );
  return Math.min(rawSaving, Math.round(analysis.footprint.totalKg * 0.85));
}

export function analyzeProfile(profile: LifestyleProfile): Analysis {
  const footprint = calculateFootprint(profile);
  const benchmark = benchmarkFootprint(footprint, profile.country);
  const recommendations = generateRecommendations(profile, footprint);
  const strongestCategory = topCategory(footprint);
  const partial = { footprint, topCategory: strongestCategory, recommendations };
  const savingKg = potentialSavingKg(partial);

  return {
    footprint,
    benchmark,
    recommendations,
    topCategory: strongestCategory,
    insight: insightFor(profile, partial),
    nextBestActionId: recommendations[0]?.id ?? null,
    potentialSavingKgPerYear: savingKg,
    projectedTotalKg: Math.max(0, footprint.totalKg - savingKg),
  };
}
