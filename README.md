# BloFin Voucher-Aware Funding Monitor

A compact, local, read-only monitor for shared Binance USDⓈ-M and BloFin USDT-linear perpetual markets. It uses public endpoints only; it cannot authenticate, retrieve balances, or place trades.

## Run

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Verified public endpoints

Live bounded requests were validated against these endpoints during implementation:

- Binance: `GET https://fapi.binance.com/fapi/v1/exchangeInfo`
- Binance: `GET https://fapi.binance.com/fapi/v1/premiumIndex`
- Binance: `GET https://fapi.binance.com/fapi/v1/ticker/bookTicker`
- Binance: `GET https://fapi.binance.com/fapi/v1/fundingInfo`
- BloFin: `GET https://openapi.blofin.com/api/v1/market/instruments?instType=SWAP`
- BloFin: `GET https://openapi.blofin.com/api/v1/market/funding-rate` (one bulk request with `instId` omitted)
- BloFin: `GET https://openapi.blofin.com/api/v1/market/tickers?instType=SWAP`

The app filters to active USDT, linear, perpetual/swap instruments and intersects them by explicit base/quote fields. External responses are validated before entering calculations.

## Business invariant

Direction is determined **only** from BloFin funding:

- BloFin funding above zero: **BloFin LONG / Binance SHORT**
- BloFin funding below zero: **BloFin SHORT / Binance LONG**
- BloFin funding equal to zero: **NEUTRAL**

Binance funding affects the funding cash-flow estimate but never changes direction.

## Calculations

API funding rates are decimal rates and are displayed as percentages. A long has cash flow `-rate`; a short has cash flow `+rate`. Net funding is the sum of the two direction-specific cash flows.

Executable entry and current exit spreads use bid/ask sides only:

- BloFin LONG / Binance SHORT entry: `(BN bid − BF ask) / BF ask`
- BloFin SHORT / Binance LONG entry: `(BF bid − BN ask) / BN ask`
- Exit sides reverse the respective executable legs.

No last, mark, index, or midpoint price is used as an executable quote. Invalid/crossed books yield unavailable spread metrics.

## Refresh policy and request counts

Each dataset has an independent cache containing data, fetch time, last successful time, stale state, sanitized error, and an in-flight promise:

- Prices: every 5 seconds — one Binance book-ticker request and one BloFin ticker request.
- Funding: every 60 seconds — one Binance premium-index request plus one Binance funding-info request, and exactly one BloFin bulk funding request with `instId` omitted.
- Instruments: every 10 minutes — one Binance exchange-info request and one BloFin instruments request.
- Browser monitor polling: 5 seconds.
- Local countdown: 1 second.
- Upstream request timeout: 8 seconds.

A normal full refresh therefore uses 2 price requests, 4 funding requests (2 Binance + 1 BloFin plus the Binance funding-info companion counted separately), and 2 metadata requests. There are no requests proportional to the number of instruments. If a refresh fails, the last successful dataset remains available and only that dataset is marked stale. No per-symbol BloFin fallback is attempted.

Binance premium index supplies current funding and next funding time. Binance fundingInfo supplies `fundingIntervalHours` only for symbols returned by that endpoint; absent symbols remain `N/A` rather than being assumed to use eight hours. BloFin funding records include interval and unit, normalized to hours.

## Voucher assumption and limitations

Voucher compensation is a configurable analytical assumption. Actual eligibility, exclusions, campaign limits, timing, settlement, and compensation are controlled by applicable BloFin terms. The monitor does not show a voucher offset without an explicit eligible realized-loss scenario, and never represents an offset as guaranteed, confirmed, earned, approved, or withdrawable.

Market data can be delayed, unavailable, malformed, or stale. The server retains each last successful dataset in process memory and exposes separate exchange/dataset statuses on later failures. This is informational software, not trading, investment, legal, tax, or campaign-eligibility advice.
