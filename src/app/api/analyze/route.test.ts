import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { DEFAULT_PROFILE } from "@/domain/sample-profiles";
import { POST } from "@/app/api/analyze/route";

function requestFor(body: unknown, headers?: HeadersInit): NextRequest {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }) as NextRequest;
}

describe("POST /api/analyze", () => {
  it("returns an analysis for a valid profile", async () => {
    const response = await POST(requestFor(DEFAULT_PROFILE));
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).toMatchObject({
      benchmark: { countryLabel: "India" },
      nextBestActionId: expect.any(String),
    });
  });

  it("returns field errors for invalid profile values", async () => {
    const response = await POST(requestFor({ ...DEFAULT_PROFILE, householdSize: 0 }));
    const body: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "invalid_profile",
        fields: { householdSize: expect.any(String) },
      },
    });
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(requestFor("{"));
    const body: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ error: { code: "invalid_json" } });
  });

  it("rejects oversized payloads before parsing", async () => {
    const response = await POST(requestFor(DEFAULT_PROFILE, { "content-length": "999999" }));
    const body: unknown = await response.json();

    expect(response.status).toBe(413);
    expect(body).toMatchObject({ error: { code: "payload_too_large" } });
  });
});
