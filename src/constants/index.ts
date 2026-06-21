import type {
  BudgetSensitivity,
  CountryCode,
  FootprintCategory,
  HomeControl,
  PreferredEffort,
  ReductionGoal,
} from "@/domain/types";

export const APP_NAME = "CarbonCoach";
export const APP_TAGLINE =
  "Understand, track, and shrink your carbon footprint — with a coach that adapts to your life.";
export const APP_DESCRIPTION =
  "CarbonCoach turns your everyday choices into a personalised carbon footprint, then recommends the highest-impact, most realistic actions for you to cut it.";

export const KG_PER_TONNE = 1000;
export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_YEAR = 52;

/** Recommendations shown, and the floor below which an action is not worth surfacing. */
export const MAX_RECOMMENDATIONS = 6;
export const MIN_RECOMMENDATION_SAVING_KG = 25;
export const PARIS_ALIGNED_TONNES_2030 = 2.3;
export const GLOBAL_AVERAGE_TONNES = 4.7;

/** Inclusive numeric bounds shared by the validation schema and the UI inputs. */
export const INPUT_BOUNDS = {
  householdSize: { min: 1, max: 12 },
  electricityKwhPerMonth: { min: 0, max: 5000 },
  heatingFuelKwhPerMonth: { min: 0, max: 10000 },
  renewableShare: { min: 0, max: 1 },
  carKmPerWeek: { min: 0, max: 3000 },
  publicTransitKmPerWeek: { min: 0, max: 3000 },
  shortFlightsPerYear: { min: 0, max: 50 },
  longFlightsPerYear: { min: 0, max: 50 },
} as const;

export const CATEGORY_LABELS: Readonly<Record<FootprintCategory, string>> = {
  homeEnergy: "Home energy",
  transport: "Transport",
  flights: "Flights",
  food: "Food & diet",
  goods: "Goods & shopping",
};

export const CATEGORY_ORDER: readonly FootprintCategory[] = [
  "homeEnergy",
  "transport",
  "flights",
  "food",
  "goods",
];

export const COUNTRY_LABELS: Readonly<Record<CountryCode, string>> = {
  US: "United States",
  UK: "United Kingdom",
  IN: "India",
  DE: "Germany",
  FR: "France",
  CN: "China",
  CA: "Canada",
  AU: "Australia",
  OTHER: "Global average",
};

/**
 * Approximate annual per-person consumption footprints, tonnes CO2e.
 * Rounded for awareness benchmarking, not statutory reporting.
 */
export const COUNTRY_AVERAGE_TONNES: Readonly<Record<CountryCode, number>> = {
  US: 14.9,
  UK: 8.1,
  IN: 2.2,
  DE: 9.7,
  FR: 6.5,
  CN: 8.4,
  CA: 14.2,
  AU: 15.0,
  OTHER: GLOBAL_AVERAGE_TONNES,
};

export const GOAL_LABELS: Readonly<Record<ReductionGoal, string>> = {
  "quick-wins": "Quick wins",
  "save-money": "Save money",
  "biggest-impact": "Biggest impact",
};

export const HOME_CONTROL_LABELS: Readonly<Record<HomeControl, string>> = {
  rent: "Rent",
  own: "Own",
};

export const BUDGET_LABELS: Readonly<Record<BudgetSensitivity, string>> = {
  strict: "Strict budget",
  balanced: "Balanced",
  flexible: "Flexible",
};

export const EFFORT_LABELS: Readonly<Record<PreferredEffort, string>> = {
  easy: "Easy",
  moderate: "Moderate",
  significant: "Significant",
};
