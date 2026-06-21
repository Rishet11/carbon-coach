/**
 * Shared numeric rounding helpers. Centralised so every module applies the same
 * rounding rule instead of redefining it (one definition, no drift).
 */

/** Round to a non-negative whole kilogram. */
export function roundKg(value: number): number {
  return Math.max(0, Math.round(value));
}

/** Round to two decimal places (e.g. tonnes shown in the UI). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
