import type { CarType, CountryCode, DietType, ShoppingHabit } from "@/domain/types";

/**
 * Emission factors (kg CO₂e) used by the calculator.
 *
 * Sources (all figures rounded to a sensible precision for an awareness tool):
 * - Electricity grid intensity: IEA / Ember 2023–24 country grid averages.
 * - Fuels (natural gas, heating oil), cars, public transport: UK DEFRA 2024
 *   greenhouse gas conversion factors.
 * - Aviation: DEFRA per-passenger factors uplifted ~1.9x for non-CO₂ radiative
 *   forcing; expressed per return trip.
 * - Diet: Scarborough et al. (2023) and Our World in Data dietary footprints.
 *
 * These are estimates for guidance, not a certified inventory — see README.
 */

/** kg CO₂e per kWh of grid electricity, by country. */
export const GRID_INTENSITY_KG_PER_KWH: Readonly<Record<CountryCode, number>> = {
  US: 0.37,
  UK: 0.21,
  IN: 0.71,
  DE: 0.35,
  FR: 0.06,
  CN: 0.58,
  CA: 0.12,
  AU: 0.66,
  OTHER: 0.48,
};

export const NATURAL_GAS_KG_PER_KWH = 0.183;
export const HEATING_OIL_KG_PER_KWH = 0.268;

/** kg CO₂e per km for combustion/hybrid cars (tailpipe + upstream fuel). */
export const CAR_KG_PER_KM: Readonly<Record<"petrol" | "diesel" | "hybrid", number>> = {
  petrol: 0.17,
  diesel: 0.164,
  hybrid: 0.11,
};

/** Electric-car energy use; combined with grid intensity for a contextual factor. */
export const EV_KWH_PER_KM = 0.19;

export const PUBLIC_TRANSIT_KG_PER_KM = 0.06;

/** Per return trip, including a radiative-forcing uplift. */
export const SHORT_HAUL_RETURN_KG = 460;
export const LONG_HAUL_RETURN_KG = 1800;

/** Annual food footprint by dietary pattern, kg CO₂e. */
export const DIET_KG_PER_YEAR: Readonly<Record<DietType, number>> = {
  "heavy-meat": 3300,
  "medium-meat": 2500,
  "low-meat": 2000,
  pescatarian: 1700,
  vegetarian: 1500,
  vegan: 1100,
};

/** Diet patterns ordered from highest to lowest footprint. */
export const DIET_LADDER: readonly DietType[] = [
  "heavy-meat",
  "medium-meat",
  "low-meat",
  "pescatarian",
  "vegetarian",
  "vegan",
];

/** Annual footprint from buying goods, by shopping intensity, kg CO₂e. */
export const GOODS_KG_PER_YEAR: Readonly<Record<ShoppingHabit, number>> = {
  minimal: 700,
  average: 1500,
  frequent: 3000,
};

/** Multiplier applied to goods emissions when the household recycles. */
export const RECYCLING_RETENTION_FACTOR = 0.95;

/** Cars that consume liquid fuel (used to type combustion-only logic). */
export const COMBUSTION_CAR_TYPES: readonly CarType[] = ["petrol", "diesel", "hybrid"];
