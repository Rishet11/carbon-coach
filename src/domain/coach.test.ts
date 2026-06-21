import { describe, expect, it } from "vitest";
import { benchmarkFootprint } from "@/domain/benchmark";
import { calculateFootprint } from "@/domain/calculator";
import { analyzeProfile } from "@/domain/coach";
import { HIGH_CARBON_PROFILE, LOW_CARBON_PROFILE } from "@/domain/sample-profiles";
import type { LifestyleProfile } from "@/domain/types";

function ids(profile: LifestyleProfile): readonly string[] {
  return analyzeProfile(profile).recommendations.map((recommendation) => recommendation.id);
}

describe("calculateFootprint", () => {
  it("calculates a non-zero annual footprint split across categories", () => {
    const footprint = calculateFootprint(HIGH_CARBON_PROFILE);

    expect(footprint.totalKg).toBeGreaterThan(12_000);
    expect(footprint.categories.homeEnergy).toBeGreaterThan(0);
    expect(footprint.categories.transport).toBeGreaterThan(0);
    expect(footprint.categories.flights).toBeGreaterThan(0);
    expect(footprint.totalTonnes).toBeCloseTo(footprint.totalKg / 1000, 2);
  });

  it("uses country grid intensity for electric driving", () => {
    const indiaEv = calculateFootprint({
      ...LOW_CARBON_PROFILE,
      country: "IN",
      transport: { ...LOW_CARBON_PROFILE.transport, carType: "electric", carKmPerWeek: 200 },
    });
    const franceEv = calculateFootprint({
      ...LOW_CARBON_PROFILE,
      country: "FR",
      transport: { ...LOW_CARBON_PROFILE.transport, carType: "electric", carKmPerWeek: 200 },
    });

    expect(indiaEv.categories.transport).toBeGreaterThan(franceEv.categories.transport);
  });
});

describe("benchmarkFootprint", () => {
  it("marks high footprints as above country average and above the Paris target", () => {
    const footprint = calculateFootprint(HIGH_CARBON_PROFILE);
    const benchmark = benchmarkFootprint(footprint, HIGH_CARBON_PROFILE.country);

    expect(["above", "well-above"]).toContain(benchmark.verdictVsCountry);
    expect(benchmark.gapToParisTonnes).toBeGreaterThan(0);
  });
});

describe("analyzeProfile", () => {
  it("creates a contextual insight, projected footprint, and next best action", () => {
    const analysis = analyzeProfile(HIGH_CARBON_PROFILE);

    expect(analysis.insight).toContain("Flights");
    expect(analysis.nextBestActionId).toBe(analysis.recommendations[0]?.id);
    expect(analysis.projectedTotalKg).toBeLessThan(analysis.footprint.totalKg);
  });

  it("changes recommendations for contrasting personas", () => {
    const lowIds = ids(LOW_CARBON_PROFILE);
    const highIds = ids(HIGH_CARBON_PROFILE);

    expect(highIds).toContain("reduce-long-flight");
    expect(highIds).toContain("switch-to-ev");
    expect(highIds).toContain("diet-step-down");
    expect(lowIds).not.toContain("switch-to-ev");
    expect(lowIds).not.toContain("diet-step-down");
    expect(lowIds).not.toContain("reduce-long-flight");
  });

  it("respects renter context for heating recommendations", () => {
    const renter: LifestyleProfile = {
      ...HIGH_CARBON_PROFILE,
      context: { ...HIGH_CARBON_PROFILE.context, homeControl: "rent" },
      transport: {
        carType: "none",
        carKmPerWeek: 0,
        publicTransitKmPerWeek: 0,
        shortFlightsPerYear: 0,
        longFlightsPerYear: 0,
      },
      diet: "vegan",
      consumption: { shopping: "minimal", recycles: true },
    };

    expect(ids(renter)).toContain("renter-heating-controls");
    expect(ids(renter)).not.toContain("heat-pump-or-insulation");
  });
});
