/**
 * Domain vocabulary for CarbonCoach.
 *
 * These literal unions and interfaces are the single source of truth for the
 * shape of a user's lifestyle and the analysis derived from it. The validation
 * schema (`lib/schema.ts`) is kept structurally in sync with `LifestyleProfile`.
 */

export type CountryCode = "US" | "UK" | "IN" | "DE" | "FR" | "CN" | "CA" | "AU" | "OTHER";

export type HeatingType = "gas" | "oil" | "electric" | "heat-pump" | "none";

export type CarType = "none" | "petrol" | "diesel" | "hybrid" | "electric";

export type DietType =
  | "heavy-meat"
  | "medium-meat"
  | "low-meat"
  | "pescatarian"
  | "vegetarian"
  | "vegan";

export type ShoppingHabit = "minimal" | "average" | "frequent";

export type FootprintCategory = "homeEnergy" | "transport" | "flights" | "food" | "goods";

export type ReductionGoal = "quick-wins" | "save-money" | "biggest-impact";

export type HomeControl = "rent" | "own";

export type BudgetSensitivity = "strict" | "balanced" | "flexible";

export type PreferredEffort = "easy" | "moderate" | "significant";

export interface HomeProfile {
  /** Whole-household electricity use, kWh per month. */
  readonly electricityKwhPerMonth: number;
  readonly heating: HeatingType;
  /** Gas/oil heating energy, kWh per month (ignored for electric heating). */
  readonly heatingFuelKwhPerMonth: number;
  /** Fraction of electricity from a renewable/green tariff, 0..1. */
  readonly renewableShare: number;
}

export interface TransportProfile {
  readonly carType: CarType;
  readonly carKmPerWeek: number;
  readonly publicTransitKmPerWeek: number;
  /** Return trips under ~3 hours, per year. */
  readonly shortFlightsPerYear: number;
  /** Return trips over ~6 hours, per year. */
  readonly longFlightsPerYear: number;
}

export interface ConsumptionProfile {
  readonly shopping: ShoppingHabit;
  readonly recycles: boolean;
}

export interface LifestyleContext {
  readonly reductionGoal: ReductionGoal;
  readonly homeControl: HomeControl;
  readonly budgetSensitivity: BudgetSensitivity;
  readonly preferredEffort: PreferredEffort;
}

export interface LifestyleProfile {
  readonly country: CountryCode;
  /** People sharing the home's energy use; home emissions are split across them. */
  readonly householdSize: number;
  readonly context: LifestyleContext;
  readonly home: HomeProfile;
  readonly transport: TransportProfile;
  readonly diet: DietType;
  readonly consumption: ConsumptionProfile;
}

/** Annual emissions per category, in kg CO₂e. */
export type CategoryBreakdown = Readonly<Record<FootprintCategory, number>>;

export interface Footprint {
  readonly categories: CategoryBreakdown;
  readonly totalKg: number;
  readonly totalTonnes: number;
}

export type Effort = "easy" | "moderate" | "significant";

export type CostImpact = "saves-money" | "neutral" | "upfront-cost";

export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly category: FootprintCategory;
  readonly savingKgPerYear: number;
  readonly effort: Effort;
  readonly costImpact: CostImpact;
  /** Personalised explanation that references the user's own numbers. */
  readonly rationale: string;
  /** Why the assistant selected this action for this specific profile. */
  readonly whyThisMatters: string;
  /** Practical next steps, short enough to act on. */
  readonly actionSteps: readonly string[];
  /** 0..1 estimate of how realistic the action is for this user's context. */
  readonly feasibility: number;
  /** Ranking score: saving weighted by how feasible the action is. */
  readonly priorityScore: number;
}

export type BenchmarkVerdict = "well-below" | "below" | "around" | "above" | "well-above";

export interface Benchmark {
  readonly countryAverageTonnes: number;
  readonly countryLabel: string;
  readonly globalAverageTonnes: number;
  readonly parisTargetTonnes: number;
  readonly verdictVsCountry: BenchmarkVerdict;
  /** Tonnes above the Paris-aligned target (negative means already below it). */
  readonly gapToParisTonnes: number;
}

export interface Analysis {
  readonly footprint: Footprint;
  readonly benchmark: Benchmark;
  readonly recommendations: readonly Recommendation[];
  readonly topCategory: FootprintCategory;
  readonly insight: string;
  readonly nextBestActionId: string | null;
  readonly potentialSavingKgPerYear: number;
  /** Projected annual footprint if every recommendation is adopted. */
  readonly projectedTotalKg: number;
}
