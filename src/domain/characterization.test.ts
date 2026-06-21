import { describe, expect, it } from "vitest";
import { analyzeProfile } from "@/domain/coach";
import {
  DEFAULT_PROFILE,
  HIGH_CARBON_PROFILE,
  LOW_CARBON_PROFILE,
} from "@/domain/sample-profiles";
import type { LifestyleProfile } from "@/domain/types";

/**
 * Characterization (golden) snapshots that pin the exact output of the domain
 * engine for representative profiles. They exist to prove that refactors which
 * are meant to be behaviour-preserving (e.g. extracting shared helpers) do not
 * silently change any number a user would see.
 */
function snapshot(profile: LifestyleProfile) {
  const analysis = analyzeProfile(profile);
  return {
    categories: analysis.footprint.categories,
    totalKg: analysis.footprint.totalKg,
    totalTonnes: analysis.footprint.totalTonnes,
    benchmark: analysis.benchmark,
    insight: analysis.insight,
    potentialSavingKgPerYear: analysis.potentialSavingKgPerYear,
    projectedTotalKg: analysis.projectedTotalKg,
    recommendations: analysis.recommendations.map((recommendation) => ({
      id: recommendation.id,
      savingKgPerYear: recommendation.savingKgPerYear,
      priorityScore: recommendation.priorityScore,
    })),
  };
}

describe("domain engine characterization", () => {
  it("is stable for the default profile", () => {
    expect(snapshot(DEFAULT_PROFILE)).toMatchSnapshot();
  });

  it("is stable for the low-carbon profile", () => {
    expect(snapshot(LOW_CARBON_PROFILE)).toMatchSnapshot();
  });

  it("is stable for the high-carbon profile", () => {
    expect(snapshot(HIGH_CARBON_PROFILE)).toMatchSnapshot();
  });
});
