import { KG_PER_TONNE, MONTHS_PER_YEAR, WEEKS_PER_YEAR } from "@/constants";
import {
  CAR_KG_PER_KM,
  EV_KWH_PER_KM,
  GOODS_KG_PER_YEAR,
  GRID_INTENSITY_KG_PER_KWH,
  HEATING_OIL_KG_PER_KWH,
  LONG_HAUL_RETURN_KG,
  NATURAL_GAS_KG_PER_KWH,
  PUBLIC_TRANSIT_KG_PER_KM,
  RECYCLING_RETENTION_FACTOR,
  SHORT_HAUL_RETURN_KG,
  DIET_KG_PER_YEAR,
} from "@/domain/emission-factors";
import { round2, roundKg } from "@/lib/num";
import type {
  CarType,
  CategoryBreakdown,
  Footprint,
  LifestyleProfile,
  TransportProfile,
} from "@/domain/types";

export function electricityKg(profile: LifestyleProfile): number {
  const annualKwh = profile.home.electricityKwhPerMonth * MONTHS_PER_YEAR;
  const gridFactor = GRID_INTENSITY_KG_PER_KWH[profile.country];
  const gridShare = 1 - profile.home.renewableShare;
  return (annualKwh * gridFactor * gridShare) / profile.householdSize;
}

export function heatingKg(profile: LifestyleProfile): number {
  const annualKwh = profile.home.heatingFuelKwhPerMonth * MONTHS_PER_YEAR;
  const householdShare = annualKwh / profile.householdSize;

  if (profile.home.heating === "gas") return householdShare * NATURAL_GAS_KG_PER_KWH;
  if (profile.home.heating === "oil") return householdShare * HEATING_OIL_KG_PER_KWH;
  return 0;
}

export function carKgPerKm(carType: CarType, profile: LifestyleProfile): number {
  if (carType === "electric") {
    return EV_KWH_PER_KM * GRID_INTENSITY_KG_PER_KWH[profile.country];
  }
  if (carType === "petrol" || carType === "diesel" || carType === "hybrid") {
    return CAR_KG_PER_KM[carType];
  }
  return 0;
}

export function carEmissionsKg(profile: LifestyleProfile): number {
  return profile.transport.carKmPerWeek * WEEKS_PER_YEAR * carKgPerKm(profile.transport.carType, profile);
}

function publicTransitKg(transport: TransportProfile): number {
  return transport.publicTransitKmPerWeek * WEEKS_PER_YEAR * PUBLIC_TRANSIT_KG_PER_KM;
}

function flightKg(transport: TransportProfile): number {
  return (
    transport.shortFlightsPerYear * SHORT_HAUL_RETURN_KG +
    transport.longFlightsPerYear * LONG_HAUL_RETURN_KG
  );
}

function goodsKg(profile: LifestyleProfile): number {
  const base = GOODS_KG_PER_YEAR[profile.consumption.shopping];
  return profile.consumption.recycles ? base * RECYCLING_RETENTION_FACTOR : base;
}

export function calculateFootprint(profile: LifestyleProfile): Footprint {
  const categories: CategoryBreakdown = {
    homeEnergy: roundKg(electricityKg(profile) + heatingKg(profile)),
    transport: roundKg(carEmissionsKg(profile) + publicTransitKg(profile.transport)),
    flights: roundKg(flightKg(profile.transport)),
    food: roundKg(DIET_KG_PER_YEAR[profile.diet]),
    goods: roundKg(goodsKg(profile)),
  };

  const totalKg = Object.values(categories).reduce((sum, value) => sum + value, 0);

  return {
    categories,
    totalKg,
    totalTonnes: round2(totalKg / KG_PER_TONNE),
  };
}
