import type { Direction, Price } from "@/lib/types";

export function determineDirection(blofinFundingRate: number | null): Direction {
  if (blofinFundingRate === null || !Number.isFinite(blofinFundingRate) || blofinFundingRate === 0) return "NEUTRAL";
  return blofinFundingRate > 0 ? "LONG" : "SHORT";
}

export function oppositeDirection(direction: Direction): Direction {
  if (direction === "LONG") return "SHORT";
  if (direction === "SHORT") return "LONG";
  return "NEUTRAL";
}

export function fundingCashFlow(rate: number | null, direction: Direction): number | null {
  if (rate === null || !Number.isFinite(rate) || direction === "NEUTRAL") return null;
  return direction === "LONG" ? -rate : rate;
}

export function calculateNetFunding(blofinRate: number | null, binanceRate: number | null, blofinDirection: Direction): number | null {
  const binanceDirection = oppositeDirection(blofinDirection);
  const blofin = fundingCashFlow(blofinRate, blofinDirection);
  const binance = fundingCashFlow(binanceRate, binanceDirection);
  return blofin === null || binance === null ? null : blofin + binance;
}

export function calculateHourlyNetFunding(
  blofinRate: number | null,
  blofinIntervalHours: number | null,
  binanceRate: number | null,
  binanceIntervalHours: number | null,
  blofinDirection: Direction,
): number | null {
  if (!blofinIntervalHours || !binanceIntervalHours || blofinIntervalHours <= 0 || binanceIntervalHours <= 0) return null;
  return calculateNetFunding(blofinRate === null ? null : blofinRate / blofinIntervalHours, binanceRate === null ? null : binanceRate / binanceIntervalHours, blofinDirection);
}

function validPrice(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

function validBook(price: Price | null): price is Price & { bid: number; ask: number } {
  return Boolean(price && validPrice(price.bid) && validPrice(price.ask) && price.ask >= price.bid);
}

export function calculateEntrySpread(blofin: Price | null, binance: Price | null, direction: Direction): number | null {
  if (!validBook(blofin) || !validBook(binance) || direction === "NEUTRAL") return null;
  return direction === "LONG"
    ? ((binance.bid - blofin.ask) / blofin.ask) * 100
    : ((blofin.bid - binance.ask) / binance.ask) * 100;
}

export function calculateExitSpread(blofin: Price | null, binance: Price | null, direction: Direction): number | null {
  if (!validBook(blofin) || !validBook(binance) || direction === "NEUTRAL") return null;
  return direction === "LONG"
    ? ((binance.ask - blofin.bid) / blofin.bid) * 100
    : ((blofin.ask - binance.bid) / binance.bid) * 100;
}

export function calculateVoucherOffset(eligibleLoss: number | null, compensationRate: number, notional: number): number | null {
  if (eligibleLoss === null || !Number.isFinite(eligibleLoss) || eligibleLoss < 0 || !Number.isFinite(compensationRate) || compensationRate < 0 || compensationRate > 1 || !Number.isFinite(notional) || notional <= 0) return null;
  return eligibleLoss * compensationRate;
}

export function remainingMilliseconds(timestamp: number | null, now = Date.now()): number | null {
  if (timestamp === null || !Number.isFinite(timestamp)) return null;
  return Math.max(0, timestamp - now);
}
