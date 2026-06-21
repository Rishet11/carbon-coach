import { describe, expect, it, vi } from "vitest";
import { err, ok, unwrapOr } from "@/lib/result";
import { logger } from "@/lib/logger";
import { fieldErrorsFromZod, lifestyleProfileSchema } from "@/lib/schema";
import { DEFAULT_PROFILE } from "@/domain/sample-profiles";

describe("result helpers", () => {
  it("wraps success and failure values consistently", () => {
    expect(unwrapOr(ok("ready"), "fallback")).toBe("ready");
    expect(unwrapOr(err("missing"), "fallback")).toBe("fallback");
  });
});

describe("schema helpers", () => {
  it("maps zod issues to field paths", () => {
    const parsed = lifestyleProfileSchema.safeParse({ ...DEFAULT_PROFILE, householdSize: 0 });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrorsFromZod(parsed.error)).toHaveProperty("householdSize");
    }
  });
});

describe("logger", () => {
  it("emits structured info and error logs", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logger.info("test.info", { route: "/api/analyze" });
    logger.error("test.error", { reason: "unit-test" });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"test.info"'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"test.error"'));

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
