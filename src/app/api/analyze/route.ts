import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { analyzeProfile } from "@/domain/coach";
import { logger } from "@/lib/logger";
import { fieldErrorsFromZod, lifestyleProfileSchema } from "@/lib/schema";

const MAX_BODY_BYTES = 20_000;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

type ErrorCode = "payload_too_large" | "invalid_json" | "invalid_profile" | "analysis_failed";

interface ErrorResponse {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly fields?: Readonly<Record<string, string>>;
  };
}

function jsonError(status: number, code: ErrorCode, message: string, fields?: Readonly<Record<string, string>>) {
  const body: ErrorResponse = { error: { code, message, fields } };
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function contentLengthTooLarge(request: NextRequest): boolean {
  const header = request.headers.get("content-length");
  if (!header) return false;
  return Number(header) > MAX_BODY_BYTES;
}

async function readJson(request: NextRequest): Promise<unknown> {
  return request.json() as Promise<unknown>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (contentLengthTooLarge(request)) {
    return jsonError(413, "payload_too_large", "Profile payload is too large.");
  }

  try {
    const payload = await readJson(request);
    const profile = lifestyleProfileSchema.parse(payload);
    const analysis = analyzeProfile(profile);
    return NextResponse.json(analysis, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(400, "invalid_profile", "Profile values are outside the supported range.", fieldErrorsFromZod(error));
    }

    if (error instanceof SyntaxError) {
      return jsonError(400, "invalid_json", "Request body must be valid JSON.");
    }

    logger.error("api.analyze.failed", { error });
    return jsonError(500, "analysis_failed", "Unable to analyse this profile.");
  }
}
