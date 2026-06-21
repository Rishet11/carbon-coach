import type { LifestyleProfile } from "@/domain/types";

export const DEFAULT_PROFILE: LifestyleProfile = {
  country: "IN",
  householdSize: 3,
  context: {
    reductionGoal: "biggest-impact",
    homeControl: "rent",
    budgetSensitivity: "balanced",
    preferredEffort: "moderate",
  },
  home: {
    electricityKwhPerMonth: 260,
    heating: "none",
    heatingFuelKwhPerMonth: 0,
    renewableShare: 0.15,
  },
  transport: {
    carType: "petrol",
    carKmPerWeek: 95,
    publicTransitKmPerWeek: 35,
    shortFlightsPerYear: 2,
    longFlightsPerYear: 1,
  },
  diet: "medium-meat",
  consumption: {
    shopping: "average",
    recycles: true,
  },
};

export const LOW_CARBON_PROFILE: LifestyleProfile = {
  country: "FR",
  householdSize: 2,
  context: {
    reductionGoal: "quick-wins",
    homeControl: "rent",
    budgetSensitivity: "strict",
    preferredEffort: "easy",
  },
  home: {
    electricityKwhPerMonth: 110,
    heating: "heat-pump",
    heatingFuelKwhPerMonth: 0,
    renewableShare: 0.9,
  },
  transport: {
    carType: "none",
    carKmPerWeek: 0,
    publicTransitKmPerWeek: 80,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
  },
  diet: "vegan",
  consumption: {
    shopping: "minimal",
    recycles: true,
  },
};

export const HIGH_CARBON_PROFILE: LifestyleProfile = {
  country: "US",
  householdSize: 1,
  context: {
    reductionGoal: "biggest-impact",
    homeControl: "own",
    budgetSensitivity: "flexible",
    preferredEffort: "significant",
  },
  home: {
    electricityKwhPerMonth: 820,
    heating: "gas",
    heatingFuelKwhPerMonth: 520,
    renewableShare: 0,
  },
  transport: {
    carType: "diesel",
    carKmPerWeek: 360,
    publicTransitKmPerWeek: 0,
    shortFlightsPerYear: 4,
    longFlightsPerYear: 3,
  },
  diet: "heavy-meat",
  consumption: {
    shopping: "frequent",
    recycles: false,
  },
};
