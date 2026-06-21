import { describe, expect, it } from "vitest";
import { fieldErrorsFromZod, lifestyleProfileSchema } from "@/lib/schema";
import {
  DEFAULT_PROFILE,
  HIGH_CARBON_PROFILE,
  LOW_CARBON_PROFILE,
} from "@/domain/sample-profiles";

describe("lifestyleProfileSchema", () => {
  it("accepts every shipped sample profile", () => {
    for (const profile of [DEFAULT_PROFILE, LOW_CARBON_PROFILE, HIGH_CARBON_PROFILE]) {
      expect(lifestyleProfileSchema.safeParse(profile).success).toBe(true);
    }
  });

  it("rejects out-of-range input and maps zod issues to field paths", () => {
    const parsed = lifestyleProfileSchema.safeParse({ ...DEFAULT_PROFILE, householdSize: 0 });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrorsFromZod(parsed.error)).toHaveProperty("householdSize");
    }
  });
});
