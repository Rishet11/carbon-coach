/**
 * Minimal structured logger — the only module permitted to touch the console.
 *
 * Emits a single JSON object per line so logs stay machine-parseable in any
 * environment. `debug` is suppressed in production to avoid noise.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Readonly<Record<string, unknown>>;

const isProduction = process.env.NODE_ENV === "production";

function emit(level: LogLevel, message: string, fields?: LogFields): void {
  if (level === "debug" && isProduction) return;

  const entry = JSON.stringify({
    level,
    message,
    ...fields,
    timestamp: new Date().toISOString(),
  });

  if (level === "error") {
    console.error(entry);
    return;
  }
  if (level === "warn") {
    console.warn(entry);
    return;
  }
  console.log(entry);
}

export const logger = {
  debug: (message: string, fields?: LogFields): void => emit("debug", message, fields),
  info: (message: string, fields?: LogFields): void => emit("info", message, fields),
  warn: (message: string, fields?: LogFields): void => emit("warn", message, fields),
  error: (message: string, fields?: LogFields): void => emit("error", message, fields),
} as const;
