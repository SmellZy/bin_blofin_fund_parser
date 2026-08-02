import { calculateEntrySpread, calculateExitSpread, calculateHourlyNetFunding, calculateNetFunding, determineDirection, oppositeDirection } from "@/lib/domain";
import { fetchBinanceFunding, fetchBinanceInstruments, fetchBinancePrices, fetchBlofinFunding, fetchBlofinInstruments, fetchBlofinPrices } from "@/lib/exchanges";
import type { DatasetStatus, ExchangeStatus, Funding, Instrument, MonitorResponse, Opportunity, Price } from "@/lib/types";

export const REFRESH_POLICY = { pricesMs: 5_000, fundingMs: 60_000, instrumentsMs: 600_000 } as const;

type Cache<T> = { data: T | null; fetchedAt: number | null; lastSuccessfulAt: number | null; error: string | null; inFlight: Promise<T> | null };
type ExchangeCaches = { instruments: Cache<Instrument[]>; prices: Cache<Map<string, Price>>; funding: Cache<Map<string, Funding>> };

function cache<T>(): Cache<T> { return { data: null, fetchedAt: null, lastSuccessfulAt: null, error: null, inFlight: null }; }
const binance: ExchangeCaches = { instruments: cache(), prices: cache(), funding: cache() };
const blofin: ExchangeCaches = { instruments: cache(), prices: cache(), funding: cache() };

function isExpired<T>(entry: Cache<T>, ttl: number, now: number): boolean {
  return entry.lastSuccessfulAt === null || now - entry.lastSuccessfulAt >= ttl;
}

async function refresh<T>(entry: Cache<T>, loader: () => Promise<T>): Promise<void> {
  if (entry.inFlight) return entry.inFlight.then(() => undefined).catch(() => undefined);
  entry.inFlight = loader();
  try {
    entry.data = await entry.inFlight;
    entry.fetchedAt = Date.now();
    entry.lastSuccessfulAt = entry.fetchedAt;
    entry.error = null;
  } catch (error) {
    entry.fetchedAt = Date.now();
    entry.error = error instanceof Error ? error.message : "Upstream request failed";
  } finally {
    entry.inFlight = null;
  }
}

function datasetStatus<T>(entry: Cache<T>, ttl: number, now: number): DatasetStatus {
  return { ok: entry.data !== null && entry.error === null, stale: entry.data === null || entry.error !== null || isExpired(entry, ttl, now), fetchedAt: entry.fetchedAt, lastSuccessfulAt: entry.lastSuccessfulAt, error: entry.error };
}

function status(caches: ExchangeCaches, now: number): ExchangeStatus {
  return {
    instruments: datasetStatus(caches.instruments, REFRESH_POLICY.instrumentsMs, now),
    prices: datasetStatus(caches.prices, REFRESH_POLICY.pricesMs, now),
    funding: datasetStatus(caches.funding, REFRESH_POLICY.fundingMs, now),
  };
}

async function refreshExchange(caches: ExchangeCaches, loaders: { instruments: () => Promise<Instrument[]>; prices: (instruments: Instrument[]) => Promise<Map<string, Price>>; funding: (instruments: Instrument[]) => Promise<Map<string, Funding>> }, now: number): Promise<void> {
  if (isExpired(caches.instruments, REFRESH_POLICY.instrumentsMs, now)) await refresh(caches.instruments, loaders.instruments);
  const instruments = caches.instruments.data;
  if (!instruments) return;
  const refreshes: Promise<void>[] = [];
  if (isExpired(caches.prices, REFRESH_POLICY.pricesMs, now)) refreshes.push(refresh(caches.prices, () => loaders.prices(instruments)));
  if (isExpired(caches.funding, REFRESH_POLICY.fundingMs, now)) refreshes.push(refresh(caches.funding, () => loaders.funding(instruments)));
  await Promise.all(refreshes);
}

function oldest(...timestamps: Array<number | null>): number | null {
  const valid = timestamps.filter((timestamp): timestamp is number => timestamp !== null);
  return valid.length ? Math.min(...valid) : null;
}

function merge(binanceCaches: ExchangeCaches, blofinCaches: ExchangeCaches): Opportunity[] {
  const binanceInstruments = new Map((binanceCaches.instruments.data ?? []).map((instrument) => [instrument.id, instrument]));
  const binanceFunding = binanceCaches.funding.data ?? new Map<string, Funding>();
  const blofinFunding = blofinCaches.funding.data ?? new Map<string, Funding>();
  const binancePrices = binanceCaches.prices.data ?? new Map<string, Price>();
  const blofinPrices = blofinCaches.prices.data ?? new Map<string, Price>();
  return (blofinCaches.instruments.data ?? []).flatMap((blofinInstrument) => {
    const binanceInstrument = binanceInstruments.get(blofinInstrument.id);
    if (!binanceInstrument) return [];
    const bfFunding = blofinFunding.get(blofinInstrument.id) ?? null;
    const bnFunding = binanceFunding.get(blofinInstrument.id) ?? null;
    const bfPrice = blofinPrices.get(blofinInstrument.id) ?? null;
    const bnPrice = binancePrices.get(blofinInstrument.id) ?? null;
    const direction = determineDirection(bfFunding?.rate ?? null);
    return [{ id: blofinInstrument.id, blofinSymbol: blofinInstrument.nativeSymbol, binanceSymbol: binanceInstrument.nativeSymbol, blofinDirection: direction, binanceDirection: oppositeDirection(direction), blofinFundingRate: bfFunding?.rate ?? null, binanceFundingRate: bnFunding?.rate ?? null, blofinFundingIntervalHours: bfFunding?.intervalHours ?? null, binanceFundingIntervalHours: bnFunding?.intervalHours ?? null, blofinNextFundingAt: bfFunding?.nextFundingAt ?? null, binanceNextFundingAt: bnFunding?.nextFundingAt ?? null, netFundingPercent: calculateNetFunding(bfFunding?.rate ?? null, bnFunding?.rate ?? null, direction), hourlyNetFundingPercent: calculateHourlyNetFunding(bfFunding?.rate ?? null, bfFunding?.intervalHours ?? null, bnFunding?.rate ?? null, bnFunding?.intervalHours ?? null, direction), entrySpreadPercent: calculateEntrySpread(bfPrice, bnPrice, direction), exitSpreadPercent: calculateExitSpread(bfPrice, bnPrice, direction), blofinPrice: bfPrice, binancePrice: bnPrice, priceUpdatedAt: oldest(bfPrice?.timestamp ?? null, bnPrice?.timestamp ?? null), fundingUpdatedAt: oldest(blofinCaches.funding.lastSuccessfulAt, binanceCaches.funding.lastSuccessfulAt) }];
  });
}

export async function getMonitor(): Promise<MonitorResponse> {
  const now = Date.now();
  await Promise.all([
    refreshExchange(binance, { instruments: fetchBinanceInstruments, prices: (instruments) => fetchBinancePrices(instruments), funding: (instruments) => fetchBinanceFunding(instruments) }, now),
    refreshExchange(blofin, { instruments: fetchBlofinInstruments, prices: (instruments) => fetchBlofinPrices(instruments), funding: (instruments) => fetchBlofinFunding(instruments) }, now),
  ]);
  const generatedAt = Date.now();
  return { data: merge(binance, blofin), generatedAt, refreshPolicy: REFRESH_POLICY, status: { binance: status(binance, generatedAt), blofin: status(blofin, generatedAt) } };
}
