import { describe, expect, it } from "vitest";
import { calculateEntrySpread, calculateExitSpread, calculateHourlyNetFunding, calculateNetFunding, calculateVoucherOffset, determineDirection, fundingCashFlow, oppositeDirection, remainingMilliseconds } from "../src/lib/domain";

const blofin = { bid: 100, ask: 101, timestamp: 1 };
const binance = { bid: 103, ask: 104, timestamp: 1 };

describe("BloFin-driven direction", () => {
  it("uses only the BloFin funding sign", () => {
    expect(determineDirection(0.001)).toBe("LONG");
    expect(oppositeDirection(determineDirection(0.001))).toBe("SHORT");
    expect(determineDirection(-0.001)).toBe("SHORT");
    expect(oppositeDirection(determineDirection(-0.001))).toBe("LONG");
    expect(determineDirection(0)).toBe("NEUTRAL");
    expect(determineDirection(0.001)).toBe("LONG"); // Binance funding never participates.
  });
});

describe("funding sign convention", () => {
  it("handles both positions and signs", () => {
    expect(fundingCashFlow(0.003, "LONG")).toBe(-0.003);
    expect(fundingCashFlow(0.003, "SHORT")).toBe(0.003);
    expect(fundingCashFlow(-0.005, "LONG")).toBe(0.005);
    expect(fundingCashFlow(-0.005, "SHORT")).toBe(-0.005);
    expect(calculateNetFunding(0.003, 0.001, "LONG")).toBe(-0.002);
    expect(calculateHourlyNetFunding(0.008, 8, 0.004, 4, "LONG")).toBe(0);
    expect(calculateHourlyNetFunding(0.008, null, 0.004, 4, "LONG")).toBeNull();
  });
});

describe("executable spreads", () => {
  it("uses required bid and ask sides", () => {
    expect(calculateEntrySpread(blofin, binance, "LONG")).toBeCloseTo(((103 - 101) / 101) * 100);
    expect(calculateExitSpread(blofin, binance, "LONG")).toBeCloseTo(((104 - 100) / 100) * 100);
    expect(calculateEntrySpread(blofin, binance, "SHORT")).toBeCloseTo(((100 - 104) / 104) * 100);
    expect(calculateExitSpread(blofin, binance, "SHORT")).toBeCloseTo(((101 - 103) / 103) * 100);
    expect(calculateEntrySpread({ bid: 100, ask: 99, timestamp: 1 }, binance, "LONG")).toBeNull();
    expect(calculateExitSpread(null, binance, "LONG")).toBeNull();
  });
});

describe("voucher and countdown safety", () => {
  it("requires an explicit eligible loss and valid assumptions", () => {
    expect(calculateVoucherOffset(100, 0.5, 1_000)).toBe(50);
    expect(calculateVoucherOffset(100, 0, 1_000)).toBe(0);
    expect(calculateVoucherOffset(100, 1, 1_000)).toBe(100);
    expect(calculateVoucherOffset(null, 0.5, 1_000)).toBeNull();
    expect(calculateVoucherOffset(-1, 0.5, 1_000)).toBeNull();
    expect(calculateVoucherOffset(1, 1.2, 1_000)).toBeNull();
    expect(calculateVoucherOffset(1, 0.5, 0)).toBeNull();
    expect(remainingMilliseconds(1_000, 2_000)).toBe(0);
    expect(remainingMilliseconds(null)).toBeNull();
  });
});
