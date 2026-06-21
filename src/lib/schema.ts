import { z } from "zod";
import { INPUT_BOUNDS } from "@/constants";

const countrySchema = z.enum(["US", "UK", "IN", "DE", "FR", "CN", "CA", "AU", "OTHER"]);
const heatingSchema = z.enum(["gas", "oil", "electric", "heat-pump", "none"]);
const carSchema = z.enum(["none", "petrol", "diesel", "hybrid", "electric"]);
const dietSchema = z.enum([
  "heavy-meat",
  "medium-meat",
  "low-meat",
  "pescatarian",
  "vegetarian",
  "vegan",
]);
const shoppingSchema = z.enum(["minimal", "average", "frequent"]);
const goalSchema = z.enum(["quick-wins", "save-money", "biggest-impact"]);
const homeControlSchema = z.enum(["rent", "own"]);
const budgetSchema = z.enum(["strict", "balanced", "flexible"]);
const effortSchema = z.enum(["easy", "moderate", "significant"]);

function boundedNumber(key: keyof typeof INPUT_BOUNDS): z.ZodNumber {
  const bounds = INPUT_BOUNDS[key];
  return z.number().min(bounds.min).max(bounds.max);
}

export const lifestyleProfileSchema = z.object({
  country: countrySchema,
  householdSize: boundedNumber("householdSize").int(),
  context: z.object({
    reductionGoal: goalSchema,
    homeControl: homeControlSchema,
    budgetSensitivity: budgetSchema,
    preferredEffort: effortSchema,
  }),
  home: z.object({
    electricityKwhPerMonth: boundedNumber("electricityKwhPerMonth"),
    heating: heatingSchema,
    heatingFuelKwhPerMonth: boundedNumber("heatingFuelKwhPerMonth"),
    renewableShare: boundedNumber("renewableShare"),
  }),
  transport: z.object({
    carType: carSchema,
    carKmPerWeek: boundedNumber("carKmPerWeek"),
    publicTransitKmPerWeek: boundedNumber("publicTransitKmPerWeek"),
    shortFlightsPerYear: boundedNumber("shortFlightsPerYear").int(),
    longFlightsPerYear: boundedNumber("longFlightsPerYear").int(),
  }),
  diet: dietSchema,
  consumption: z.object({
    shopping: shoppingSchema,
    recycles: z.boolean(),
  }),
});

export type LifestyleProfileInput = z.infer<typeof lifestyleProfileSchema>;

export function fieldErrorsFromZod(error: z.ZodError): Readonly<Record<string, string>> {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const key = issue.path.join(".");
    errors[key || "profile"] = issue.message;
    return errors;
  }, {});
}
