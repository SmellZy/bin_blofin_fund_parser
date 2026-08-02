export type Direction = "LONG" | "SHORT" | "NEUTRAL";
export type CanonicalInstrumentId = `${string}/USDT`;

export type Instrument = {
  id: CanonicalInstrumentId;
  nativeSymbol: string;
  base: string;
  quote: "USDT";
};

export type Funding = {
  rate: number;
  nextFundingAt: number | null;
  intervalHours: number | null;
};

export type Price = {
  bid: number | null;
  ask: number | null;
  timestamp: number | null;
};

export type DatasetStatus = {
  ok: boolean;
  stale: boolean;
  fetchedAt: number | null;
  lastSuccessfulAt: number | null;
  error: string | null;
};

export type ExchangeStatus = {
  instruments: DatasetStatus;
  prices: DatasetStatus;
  funding: DatasetStatus;
};

export type Opportunity = {
  id: CanonicalInstrumentId;
  blofinSymbol: string;
  binanceSymbol: string;
  blofinDirection: Direction;
  binanceDirection: Direction;
  blofinFundingRate: number | null;
  binanceFundingRate: number | null;
  blofinFundingIntervalHours: number | null;
  binanceFundingIntervalHours: number | null;
  blofinNextFundingAt: number | null;
  binanceNextFundingAt: number | null;
  netFundingPercent: number | null;
  hourlyNetFundingPercent: number | null;
  entrySpreadPercent: number | null;
  exitSpreadPercent: number | null;
  blofinPrice: Price | null;
  binancePrice: Price | null;
  priceUpdatedAt: number | null;
  fundingUpdatedAt: number | null;
};

export type MonitorResponse = {
  data: Opportunity[];
  generatedAt: number;
  refreshPolicy: { pricesMs: number; fundingMs: number; instrumentsMs: number };
  status: { binance: ExchangeStatus; blofin: ExchangeStatus };
};
