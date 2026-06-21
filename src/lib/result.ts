/**
 * A single, explicit error-handling primitive used at every fallible boundary
 * (validation, storage, network). Pure domain functions operate on data that
 * has already been validated and therefore return values directly — keeping one
 * consistent contract instead of mixing `throw`, `null`, and error objects.
 */
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = string>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Returns the value on success, or the provided fallback on failure. */
export function unwrapOr<T>(result: Result<T, unknown>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
