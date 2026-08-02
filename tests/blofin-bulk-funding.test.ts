import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/http", () => ({
  getJson: vi.fn(async (url: string) => {
    expect(url).toBe("https://openapi.blofin.com/api/v1/market/funding-rate");
    return { code: "0", msg: "success", data: [{ instId: "BTC-USDT", fundingRate: "0.001", fundingTime: "1700000000000", fundingInterval: "8", fundingIntervalUnit: "hour" }] };
  }),
  array: (value: unknown) => Array.isArray(value) ? value : null,
  finiteNumber: (value: unknown) => { const parsed = typeof value === "string" || typeof value === "number" ? Number(value) : Number.NaN; return Number.isFinite(parsed) ? parsed : null; },
  record: (value: unknown) => typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null,
  timestampMs: (value: unknown) => typeof value === "string" || typeof value === "number" ? Number(value) : null,
}));

import { getJson } from "../src/lib/http";
import { fetchBlofinFunding } from "../src/lib/exchanges";

describe("BloFin bulk funding", () => {
  it("performs exactly one request without instId regardless of instrument count", async () => {
    const instruments = Array.from({ length: 500 }, (_, index) => ({ id: `ASSET${index}/USDT` as `${string}/USDT`, nativeSymbol: `ASSET${index}-USDT`, base: `ASSET${index}`, quote: "USDT" as const }));
    instruments[0] = { id: "BTC/USDT", nativeSymbol: "BTC-USDT", base: "BTC", quote: "USDT" };
    const funding = await fetchBlofinFunding(instruments);
    expect(getJson).toHaveBeenCalledTimes(1);
    expect(funding.get("BTC/USDT")?.intervalHours).toBe(8);
  });
});
