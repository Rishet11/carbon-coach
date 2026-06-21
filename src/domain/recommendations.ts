import { MAX_RECOMMENDATIONS, MIN_RECOMMENDATION_SAVING_KG, WEEKS_PER_YEAR } from "@/constants";
import { carKgPerKm, electricityKg, heatingKg } from "@/domain/calculator";
import {
  DIET_KG_PER_YEAR,
  DIET_LADDER,
  GOODS_KG_PER_YEAR,
  LONG_HAUL_RETURN_KG,
  SHORT_HAUL_RETURN_KG,
} from "@/domain/emission-factors";
import { roundKg } from "@/lib/num";
import type {
  CostImpact,
  DietType,
  Effort,
  Footprint,
  LifestyleProfile,
  Recommendation,
} from "@/domain/types";

type RecommendationDraft = Omit<Recommendation, "priorityScore">;

const EFFORT_WEIGHT: Readonly<Record<Effort, number>> = {
  easy: 1.25,
  moderate: 1,
  significant: 0.72,
};

const COST_WEIGHT: Readonly<Record<CostImpact, number>> = {
  "saves-money": 1.12,
  neutral: 1,
  "upfront-cost": 0.78,
};

function currentCarKg(profile: LifestyleProfile): number {
  return profile.transport.carKmPerWeek * WEEKS_PER_YEAR * carKgPerKm(profile.transport.carType, profile);
}

function evCarKg(profile: LifestyleProfile): number {
  const annualKm = profile.transport.carKmPerWeek * WEEKS_PER_YEAR;
  return annualKm * carKgPerKm("electric", profile);
}

function hasCombustionCar(profile: LifestyleProfile): boolean {
  const { carType } = profile.transport;
  return carType === "petrol" || carType === "diesel" || carType === "hybrid";
}

function nextDietStep(diet: DietType): DietType | null {
  const index = DIET_LADDER.indexOf(diet);
  const next = DIET_LADDER[index + 1];
  return next ?? null;
}

function goalWeight(draft: RecommendationDraft, profile: LifestyleProfile): number {
  if (profile.context.reductionGoal === "quick-wins") {
    return draft.effort === "easy" ? 1.25 : 0.82;
  }
  if (profile.context.reductionGoal === "save-money") {
    return draft.costImpact === "saves-money" ? 1.25 : 0.86;
  }
  return draft.savingKgPerYear >= 900 ? 1.22 : 0.92;
}

function budgetWeight(draft: RecommendationDraft, profile: LifestyleProfile): number {
  if (draft.costImpact !== "upfront-cost") return 1;
  if (profile.context.budgetSensitivity === "strict") return 0.42;
  if (profile.context.budgetSensitivity === "balanced") return 0.78;
  return 1.02;
}

function effortPreferenceWeight(draft: RecommendationDraft, profile: LifestyleProfile): number {
  if (draft.effort === profile.context.preferredEffort) return 1.14;
  if (draft.effort === "significant" && profile.context.preferredEffort === "easy") return 0.62;
  if (draft.effort === "easy" && profile.context.preferredEffort === "significant") return 0.95;
  return 1;
}

function withPriority(draft: RecommendationDraft, profile: LifestyleProfile): Recommendation {
  const weighted =
    draft.savingKgPerYear *
    EFFORT_WEIGHT[draft.effort] *
    COST_WEIGHT[draft.costImpact] *
    goalWeight(draft, profile) *
    budgetWeight(draft, profile) *
    effortPreferenceWeight(draft, profile) *
    draft.feasibility;

  return {
    ...draft,
    priorityScore: roundKg(weighted),
  };
}

function renewableTariff(profile: LifestyleProfile): RecommendationDraft | null {
  const savingKgPerYear = roundKg(electricityKg(profile) * 0.9);
  if (profile.home.renewableShare >= 0.9 || savingKgPerYear < MIN_RECOMMENDATION_SAVING_KG) return null;

  return {
    id: "renewable-tariff",
    title: "Move remaining electricity to a green tariff",
    category: "homeEnergy",
    savingKgPerYear,
    effort: "easy",
    costImpact: profile.context.budgetSensitivity === "strict" ? "neutral" : "upfront-cost",
    rationale: `Your current electricity mix still leaves about ${roundKg(electricityKg(profile))} kg CO2e a year on the grid side.`,
    whyThisMatters: "It is one of the fastest home-energy changes because it does not require renovation.",
    actionSteps: ["Check your current tariff mix", "Compare renewable electricity plans", "Switch only if the price still fits your budget"],
    feasibility: 0.88,
  };
}

function electricityTrim(profile: LifestyleProfile): RecommendationDraft | null {
  const savingKgPerYear = roundKg(electricityKg(profile) * 0.15);
  if (profile.home.electricityKwhPerMonth < 150 || savingKgPerYear < MIN_RECOMMENDATION_SAVING_KG) return null;

  return {
    id: "electricity-trim",
    title: "Cut household electricity use by 15%",
    category: "homeEnergy",
    savingKgPerYear,
    effort: "easy",
    costImpact: "saves-money",
    rationale: `${profile.home.electricityKwhPerMonth} kWh/month is a meaningful lever in your home profile.`,
    whyThisMatters: "A small reduction compounds every month and lowers bills at the same time.",
    actionSteps: ["Move cooling or heating setpoints by 1-2 degrees", "Run major appliances on full loads", "Turn off always-on electronics"],
    feasibility: 0.86,
  };
}

function heatingUpgrade(profile: LifestyleProfile): RecommendationDraft | null {
  const heating = heatingKg(profile);
  if (heating < 120) return null;

  if (profile.context.homeControl === "own") {
    return {
      id: "heat-pump-or-insulation",
      title: "Plan a heating efficiency upgrade",
      category: "homeEnergy",
      savingKgPerYear: roundKg(heating * 0.45),
      effort: "significant",
      costImpact: "upfront-cost",
      rationale: `${profile.home.heating} heating contributes about ${roundKg(heating)} kg CO2e per year for your share of the home.`,
      whyThisMatters: "Owned homes can unlock larger cuts through insulation, heat pumps, or equipment replacement.",
      actionSteps: ["Book a home energy audit", "Prioritize insulation leaks first", "Compare heat-pump incentives before replacing equipment"],
      feasibility: 0.64,
    };
  }

  return {
    id: "renter-heating-controls",
    title: "Use renter-friendly heating controls",
    category: "homeEnergy",
    savingKgPerYear: roundKg(heating * 0.12),
    effort: "easy",
    costImpact: "saves-money",
    rationale: `As a renter, smaller control changes fit your situation better than major retrofit advice.`,
    whyThisMatters: "The recommendation respects that you may not control appliances or insulation.",
    actionSteps: ["Seal obvious drafts", "Use timer schedules", "Ask the landlord about low-cost efficiency fixes"],
    feasibility: 0.9,
  };
}

function driveLess(profile: LifestyleProfile): RecommendationDraft | null {
  const carKg = currentCarKg(profile);
  if (profile.transport.carKmPerWeek < 50 || carKg < 250) return null;

  return {
    id: "drive-less",
    title: "Replace one in five car kilometres",
    category: "transport",
    savingKgPerYear: roundKg(carKg * 0.2),
    effort: "moderate",
    costImpact: "saves-money",
    rationale: `Your car travel is about ${profile.transport.carKmPerWeek} km/week, or ${roundKg(carKg)} kg CO2e a year.`,
    whyThisMatters: "Car kilometres are a direct lever you can reduce without waiting for a new vehicle.",
    actionSteps: ["Pick one recurring trip to combine or skip", "Use transit or cycling where it is realistic", "Batch errands into one route"],
    feasibility: 0.76,
  };
}

function switchToEv(profile: LifestyleProfile): RecommendationDraft | null {
  const savingKgPerYear = roundKg(currentCarKg(profile) - evCarKg(profile));
  const highMileage = profile.transport.carKmPerWeek >= 120;
  if (!hasCombustionCar(profile) || !highMileage || savingKgPerYear < MIN_RECOMMENDATION_SAVING_KG) return null;

  return {
    id: "switch-to-ev",
    title: "Make your next high-mileage car electric",
    category: "transport",
    savingKgPerYear,
    effort: "significant",
    costImpact: "upfront-cost",
    rationale: `At ${profile.transport.carKmPerWeek} km/week, vehicle choice meaningfully changes your transport footprint.`,
    whyThisMatters: "The assistant only suggests this because your driving distance is high enough for the switch to matter.",
    actionSteps: ["Compare total cost of ownership", "Check charging access", "Time the switch with your next planned vehicle change"],
    feasibility: profile.context.budgetSensitivity === "strict" ? 0.44 : 0.66,
  };
}

function longFlightReduction(profile: LifestyleProfile): RecommendationDraft | null {
  if (profile.transport.longFlightsPerYear < 1) return null;

  return {
    id: "reduce-long-flight",
    title: "Avoid or replace one long-haul return flight",
    category: "flights",
    savingKgPerYear: LONG_HAUL_RETURN_KG,
    effort: "significant",
    costImpact: "saves-money",
    rationale: `${profile.transport.longFlightsPerYear} long-haul return flight(s) add roughly ${roundKg(profile.transport.longFlightsPerYear * LONG_HAUL_RETURN_KG)} kg CO2e a year.`,
    whyThisMatters: "A single long-haul trip can outweigh several months of household energy emissions.",
    actionSteps: ["Combine trips where possible", "Replace one meeting with video", "Choose closer destinations for one holiday"],
    feasibility: 0.58,
  };
}

function shortFlightReduction(profile: LifestyleProfile): RecommendationDraft | null {
  if (profile.transport.shortFlightsPerYear < 1) return null;

  return {
    id: "swap-short-flight",
    title: "Swap one short-haul return flight",
    category: "flights",
    savingKgPerYear: SHORT_HAUL_RETURN_KG,
    effort: "moderate",
    costImpact: "neutral",
    rationale: `Your short-haul flights add about ${roundKg(profile.transport.shortFlightsPerYear * SHORT_HAUL_RETURN_KG)} kg CO2e a year.`,
    whyThisMatters: "Short flights are often the easiest air-travel category to replace with rail, coach, or fewer trips.",
    actionSteps: ["Check rail or coach options first", "Avoid positioning flights", "Cluster nearby destinations into one trip"],
    feasibility: 0.7,
  };
}

function dietShift(profile: LifestyleProfile): RecommendationDraft | null {
  const nextDiet = nextDietStep(profile.diet);
  if (!nextDiet) return null;

  const savingKgPerYear = roundKg(DIET_KG_PER_YEAR[profile.diet] - DIET_KG_PER_YEAR[nextDiet]);
  if (savingKgPerYear < MIN_RECOMMENDATION_SAVING_KG) return null;

  return {
    id: "diet-step-down",
    title: "Move one step lower on the diet footprint ladder",
    category: "food",
    savingKgPerYear,
    effort: profile.diet === "heavy-meat" ? "moderate" : "easy",
    costImpact: "saves-money",
    rationale: `Moving from ${profile.diet} toward ${nextDiet} saves about ${savingKgPerYear} kg CO2e a year.`,
    whyThisMatters: "Food impact is driven more by what you eat than by transport distance.",
    actionSteps: ["Start with two lower-carbon meals each week", "Replace beef or lamb first", "Keep meals familiar so the habit sticks"],
    feasibility: 0.82,
  };
}

function shoppingReset(profile: LifestyleProfile, footprint: Footprint): RecommendationDraft | null {
  if (profile.consumption.shopping === "minimal") return null;

  const fraction = profile.consumption.shopping === "frequent" ? 0.28 : 0.18;
  const savingKgPerYear = roundKg(footprint.categories.goods * fraction);

  return {
    id: "shopping-reset",
    title: "Buy fewer new goods for 90 days",
    category: "goods",
    savingKgPerYear,
    effort: "moderate",
    costImpact: "saves-money",
    rationale: `${profile.consumption.shopping} shopping contributes about ${footprint.categories.goods} kg CO2e a year in this estimate.`,
    whyThisMatters: "Buying less new material is usually higher impact than recycling alone.",
    actionSteps: ["Use a 30-day wait list for non-essentials", "Repair or buy used first", "Track avoided purchases for three months"],
    feasibility: 0.74,
  };
}

function recyclingHabit(profile: LifestyleProfile): RecommendationDraft | null {
  if (profile.consumption.recycles) return null;

  const savingKgPerYear = roundKg(GOODS_KG_PER_YEAR[profile.consumption.shopping] * 0.05);
  return {
    id: "recycling-baseline",
    title: "Set up a basic recycling routine",
    category: "goods",
    savingKgPerYear,
    effort: "easy",
    costImpact: "neutral",
    rationale: "You marked recycling as not yet part of your routine.",
    whyThisMatters: "This is not the biggest lever, but it is a low-friction baseline habit.",
    actionSteps: ["Create one visible sorting spot", "Check local accepted materials", "Pair recycling with trash day"],
    feasibility: 0.94,
  };
}

function buildDrafts(profile: LifestyleProfile, footprint: Footprint): readonly RecommendationDraft[] {
  return [
    renewableTariff(profile),
    electricityTrim(profile),
    heatingUpgrade(profile),
    driveLess(profile),
    switchToEv(profile),
    longFlightReduction(profile),
    shortFlightReduction(profile),
    dietShift(profile),
    shoppingReset(profile, footprint),
    recyclingHabit(profile),
  ].filter((draft): draft is RecommendationDraft => Boolean(draft));
}

export function generateRecommendations(
  profile: LifestyleProfile,
  footprint: Footprint,
): readonly Recommendation[] {
  return buildDrafts(profile, footprint)
    .filter((draft) => draft.savingKgPerYear >= MIN_RECOMMENDATION_SAVING_KG)
    .map((draft) => withPriority(draft, profile))
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, MAX_RECOMMENDATIONS);
}
