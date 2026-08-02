# Engine and Runtime Specification

## E-001 — Aggregation Cycle

The monitor engine shall independently manage:

1. Instrument metadata refresh
2. Funding-data refresh
3. Price-data refresh

These datasets may have separate cache timestamps and refresh intervals.

---

## E-002 — Refresh Interval Selection

The implementation agent must select final intervals after verifying:

- Binance request weights
- BloFin rate limits
- endpoint response size
- practical latency
- whether values change between calls

The selected intervals must be recorded in code constants and README.

Avoid magic numbers.

---

## E-003 — Recommended Initial Intervals

Initial values for validation:

```text
Price refresh: 5 seconds
Funding refresh: 60 seconds
Instrument refresh: 10 minutes
Browser polling: 5 seconds
Countdown tick: 1 second
```

The implementation agent may adjust these values with justification.

---

## E-004 — In-Flight Deduplication

If a refresh for a dataset is already running, additional callers should reuse the same promise or receive the current cached snapshot.

Do not start duplicate upstream refreshes.

---

## E-005 — Cache Model

Each exchange dataset cache shall include:

```ts
type Snapshot<T> = {
  data: T;
  fetchedAt: number;
  lastSuccessfulAt: number;
  stale: boolean;
  error: string | null;
};
```

The exact type may vary, but equivalent semantics are required.

---

## E-006 — Merge Semantics

The merged monitor output must:

- use canonical instrument identity
- include only shared active instruments by default
- retain native symbols
- attach funding and price freshness separately
- calculate metrics only after validation

---

## E-007 — API Response Shape

Recommended response:

```ts
type MonitorResponse = {
  data: FundingOpportunity[];
  generatedAt: number;
  refreshPolicy: {
    pricesMs: number;
    fundingMs: number;
    instrumentsMs: number;
  };
  status: {
    binance: ExchangeStatus;
    blofin: ExchangeStatus;
  };
};
```

Where:

```ts
type ExchangeStatus = {
  ok: boolean;
  stale: boolean;
  priceUpdatedAt: number | null;
  fundingUpdatedAt: number | null;
  instrumentsUpdatedAt: number | null;
  error: string | null;
};
```

---

## E-008 — Timeout Policy

Every upstream request must use `AbortController`.

Suggested timeout:

```text
5–10 seconds
```

The final value must be appropriate for local use and documented.

---

## E-009 — Retry Policy

Avoid aggressive retries.

Allowed:

- zero retries
- or one short retry for transient 5xx/network failure

Disallowed:

- infinite retries
- unbounded exponential backoff
- retry storms
- per-symbol retries

---

## E-010 — Logging

Use concise server logs for:

- refresh failures
- validation anomalies
- stale-cache fallback
- selected refresh policy

Do not log:

- entire exchange payloads
- repeated success noise every few seconds
- private user data
- API keys

---

## E-011 — Client Request Behavior

The client must:

- request `/api/monitor`
- prevent overlapping fetches
- preserve previous data while loading
- abort on unmount
- expose manual refresh
- handle malformed local responses defensively

---

## E-012 — Determinism

Given identical normalized exchange snapshots and identical user settings, all calculated outputs must be identical.

No random scoring is allowed.

---

## E-013 — Performance

The application should remain responsive with several hundred shared instruments.

Use memoization for:

- filtered rows
- sorted rows
- derived summary lists

Avoid premature micro-optimization.

---

## E-014 — Data Age

Each row should be capable of reporting:

- age of BloFin price
- age of Binance price
- age of BloFin funding
- age of Binance funding

A metric derived from mixed snapshots must carry the age of its oldest required input.
