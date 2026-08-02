const REQUEST_TIMEOUT_MS = 8_000;

export async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstream returned HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

export function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function timestampMs(value: unknown): number | null {
  const parsed = finiteNumber(value);
  if (parsed === null || parsed <= 0) return null;
  return parsed < 100_000_000_000 ? parsed * 1_000 : parsed;
}

export function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function array(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}
