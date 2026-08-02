import { array, finiteNumber, getJson, record, timestampMs } from "./http";
import type { Funding, Instrument, Price } from "./types";

const BINANCE_BASE_URL = "https://fapi.binance.com";
const BLOFIN_BASE_URL = "https://openapi.blofin.com";

function canonical(base: string, quote: string): `${string}/USDT` | null {
  return quote === "USDT" && base.length > 0 ? `${base}/USDT` : null;
}

function priceFrom(value: Record<string, unknown>, bidField: string, askField: string, timeField: string): Price {
  const bid = finiteNumber(value[bidField]);
  const ask = finiteNumber(value[askField]);
  return { bid: bid !== null && bid > 0 ? bid : null, ask: ask !== null && ask > 0 ? ask : null, timestamp: timestampMs(value[timeField]) };
}

function blofinData(payload: unknown): unknown[] {
  const envelope = record(payload);
  if (envelope?.code !== "0") throw new Error("BloFin returned a non-success envelope");
  const data = array(envelope.data);
  if (!data) throw new Error("BloFin returned an invalid data envelope");
  return data;
}

export async function fetchBinanceInstruments(): Promise<Instrument[]> {
  const payload = record(await getJson(`${BINANCE_BASE_URL}/fapi/v1/exchangeInfo`));
  const instruments: Instrument[] = [];
  for (const item of array(payload?.symbols) ?? []) {
    const row = record(item);
    const nativeSymbol = typeof row?.symbol === "string" ? row.symbol : null;
    const base = typeof row?.baseAsset === "string" ? row.baseAsset : null;
    const quote = typeof row?.quoteAsset === "string" ? row.quoteAsset : null;
    if (!row || !nativeSymbol || !base || !quote || row.contractType !== "PERPETUAL" || row.status !== "TRADING") continue;
    const id = canonical(base, quote);
    if (id) instruments.push({ id, nativeSymbol, base, quote: "USDT" });
  }
  return instruments;
}

export async function fetchBinancePrices(instruments: Instrument[]): Promise<Map<string, Price>> {
  const nativeToCanonical = new Map(instruments.map((instrument) => [instrument.nativeSymbol, instrument.id]));
  const prices = new Map<string, Price>();
  for (const item of array(await getJson(`${BINANCE_BASE_URL}/fapi/v1/ticker/bookTicker`)) ?? []) {
    const row = record(item);
    const nativeSymbol = typeof row?.symbol === "string" ? row.symbol : null;
    const id = nativeSymbol ? nativeToCanonical.get(nativeSymbol) : undefined;
    if (row && id) prices.set(id, priceFrom(row, "bidPrice", "askPrice", "time"));
  }
  return prices;
}

export async function fetchBinanceFunding(instruments: Instrument[]): Promise<Map<string, Funding>> {
  const nativeToCanonical = new Map(instruments.map((instrument) => [instrument.nativeSymbol, instrument.id]));
  const [premiumIndex, fundingInfo] = await Promise.all([getJson(`${BINANCE_BASE_URL}/fapi/v1/premiumIndex`), getJson(`${BINANCE_BASE_URL}/fapi/v1/fundingInfo`)]);
  const intervals = new Map<string, number>();
  for (const item of array(fundingInfo) ?? []) {
    const row = record(item);
    const symbol = typeof row?.symbol === "string" ? row.symbol : null;
    const intervalHours = finiteNumber(row?.fundingIntervalHours);
    if (symbol && intervalHours !== null && intervalHours > 0) intervals.set(symbol, intervalHours);
  }
  const funding = new Map<string, Funding>();
  for (const item of array(premiumIndex) ?? []) {
    const row = record(item);
    const nativeSymbol = typeof row?.symbol === "string" ? row.symbol : null;
    const id = nativeSymbol ? nativeToCanonical.get(nativeSymbol) : undefined;
    const rate = finiteNumber(row?.lastFundingRate);
    if (id && rate !== null && nativeSymbol) funding.set(id, { rate, nextFundingAt: timestampMs(row?.nextFundingTime), intervalHours: intervals.get(nativeSymbol) ?? null });
  }
  return funding;
}

export async function fetchBlofinInstruments(): Promise<Instrument[]> {
  const instruments: Instrument[] = [];
  for (const item of blofinData(await getJson(`${BLOFIN_BASE_URL}/api/v1/market/instruments?instType=SWAP`))) {
    const row = record(item);
    const nativeSymbol = typeof row?.instId === "string" ? row.instId : null;
    const base = typeof row?.baseCurrency === "string" ? row.baseCurrency : null;
    const quote = typeof row?.quoteCurrency === "string" ? row.quoteCurrency : null;
    if (!row || !nativeSymbol || !base || !quote || row.instType !== "SWAP" || row.contractType !== "linear" || row.state !== "live" || row.settleCurrency !== "USDT") continue;
    const id = canonical(base, quote);
    if (id) instruments.push({ id, nativeSymbol, base, quote: "USDT" });
  }
  return instruments;
}

export async function fetchBlofinPrices(instruments: Instrument[]): Promise<Map<string, Price>> {
  const nativeToCanonical = new Map(instruments.map((instrument) => [instrument.nativeSymbol, instrument.id]));
  const prices = new Map<string, Price>();
  for (const item of blofinData(await getJson(`${BLOFIN_BASE_URL}/api/v1/market/tickers?instType=SWAP`))) {
    const row = record(item);
    const nativeSymbol = typeof row?.instId === "string" ? row.instId : null;
    const id = nativeSymbol ? nativeToCanonical.get(nativeSymbol) : undefined;
    if (row && id) prices.set(id, priceFrom(row, "bidPrice", "askPrice", "ts"));
  }
  return prices;
}

function normalizeIntervalHours(value: number | null, unit: unknown): number | null {
  if (value === null || value <= 0 || typeof unit !== "string") return null;
  if (unit.toLowerCase() === "hour") return value;
  if (unit.toLowerCase() === "minute") return value / 60;
  if (unit.toLowerCase() === "day") return value * 24;
  return null;
}

/** Exactly one bulk request: omitted instId returns all current funding records. */
export async function fetchBlofinFunding(instruments: Instrument[]): Promise<Map<string, Funding>> {
  const nativeToCanonical = new Map(instruments.map((instrument) => [instrument.nativeSymbol, instrument.id]));
  const funding = new Map<string, Funding>();
  for (const item of blofinData(await getJson(`${BLOFIN_BASE_URL}/api/v1/market/funding-rate`))) {
    const row = record(item);
    const nativeSymbol = typeof row?.instId === "string" ? row.instId : null;
    const id = nativeSymbol ? nativeToCanonical.get(nativeSymbol) : undefined;
    const rate = finiteNumber(row?.fundingRate);
    const interval = finiteNumber(row?.fundingInterval);
    if (id && rate !== null) funding.set(id, { rate, nextFundingAt: timestampMs(row?.fundingTime), intervalHours: normalizeIntervalHours(interval, row?.fundingIntervalUnit) });
  }
  return funding;
}
