# Exchange Integration Specification

## 1. Source Authority

Before implementation, verify current official API documentation for both exchanges.

Do not rely solely on remembered endpoint names.

Document the final endpoint set in the README.

---

## 2. Binance USDⓈ-M Futures

Expected base URL:

```text
https://fapi.binance.com
```

Candidate public endpoints:

```text
GET /fapi/v1/exchangeInfo
GET /fapi/v1/premiumIndex
GET /fapi/v1/ticker/bookTicker
```

The implementation agent must verify these endpoints against current official Binance documentation and live responses.

### Required Binance Fields

Instrument metadata:

- symbol
- baseAsset
- quoteAsset
- contractType
- status

Funding:

- symbol
- lastFundingRate
- nextFundingTime

Price:

- symbol
- bidPrice
- askPrice
- time, when available

### Binance Inclusion Rules

Include only records where:

- `contractType` is perpetual
- `quoteAsset` is USDT
- trading status is active
- bid and ask are valid when price metrics are calculated

---

## 3. BloFin Futures

Expected base URL:

```text
https://openapi.blofin.com
```

Candidate public endpoints:

```text
GET /api/v1/market/instruments
GET /api/v1/market/funding-rate
GET /api/v1/market/tickers
```

The implementation agent must verify exact query parameters, response envelopes, field names, and pagination behavior against current official BloFin documentation and live responses.

### Required BloFin Fields

Instrument metadata:

- instrument identifier
- base currency
- quote currency
- settlement currency
- instrument type
- contract type
- state

Funding:

- instrument identifier
- funding rate
- funding time
- funding interval
- funding interval unit

Price:

- instrument identifier
- bid price
- ask price
- timestamp

### BloFin Inclusion Rules

Include only records where:

- instrument type is perpetual swap
- contract type is linear
- quote currency is USDT
- settlement currency is USDT
- state is live

---

## 4. Symbol Normalization

The two exchanges may represent the same market differently.

Example:

```text
Binance: BTCUSDT
BloFin:  BTC-USDT
Canonical: BTC/USDT
```

Create a canonical identity:

```ts
type CanonicalInstrumentId = `${string}/USDT`;
```

Normalization must use explicit base and quote fields whenever available.

Do not derive identity by blindly stripping suffixes when authoritative fields exist.

---

## 5. No Asset Collisions

The implementation must not merge:

- USDT and USDC contracts
- similarly named but distinct assets
- spot and futures instruments
- linear and inverse contracts
- active and inactive instruments

---

## 6. Numeric Parsing

All numeric strings must be parsed explicitly.

A parsed number is valid only when:

```text
Number.isFinite(value)
```

Additional price requirements:

```text
bid > 0
ask > 0
```

If `ask < bid`, preserve the raw normalized record for diagnostics but do not calculate spread metrics from it without clearly marking the anomaly.

---

## 7. Timestamp Handling

All exchange timestamps must be normalized to Unix milliseconds.

The implementation must handle:

- millisecond timestamps
- second timestamps, if officially documented
- numeric strings
- missing timestamps

Never use local timezone arithmetic for funding countdowns.

---

## 8. Request Policy

Each upstream request must have:

- bounded timeout
- sanitized errors
- no secret headers
- descriptive user agent only if appropriate
- no unlimited retries

At most one conservative retry may be used for transient network or 5xx failures if justified.

---

## 9. Rate-Limit Discipline

Prefer bulk endpoints.

Do not issue one request per symbol when a batch endpoint exists.

The implementation must document:

- number of upstream requests per refresh cycle
- selected polling intervals
- why they remain within official limits

---

## 10. Partial Data

A symbol may temporarily have:

- funding but no price
- price but no funding
- metadata but no funding
- stale data on one venue

Such symbols may remain visible if useful, but unavailable metrics must be `null` and rendered as `—`.

Never invent fallback prices or funding rates.
