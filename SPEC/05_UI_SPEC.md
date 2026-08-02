# User Interface Specification

## UI-001 — General Style

Create a simple desktop-first interface.

Required visual characteristics:

- dark theme
- compact spacing
- readable numeric alignment
- minimal decoration
- no complex animation
- no oversized cards
- horizontal scrolling on narrow screens
- consistent positive/negative formatting

---

## UI-002 — Header

The header shall display:

- application title
- Binance status
- BloFin status
- last price refresh
- last funding refresh
- shared instrument count
- manual refresh button

Statuses:

- Live
- Stale
- Error
- Loading

---

## UI-003 — Settings Panel

Provide compact controls for:

- position size in USDT
- voucher compensation rate
- Binance fee rate
- BloFin fee rate
- minimum absolute BloFin funding
- minimum entry spread
- symbol search

Optional:

- expected funding event count
- expected BloFin realized loss
- expected exit spread

Persist user preferences in local storage.

---

## UI-004 — Top Opportunities

Show a compact summary of the best opportunities according to the selected ranking mode.

Each summary item should include:

- symbol
- BloFin direction
- Binance direction
- BloFin funding
- Binance funding
- net funding estimate
- entry spread
- data freshness

Do not show a voucher-adjusted score unless all required scenario inputs are available.

---

## UI-005 — Main Table Columns

Minimum columns:

1. Pair
2. BloFin Position
3. Binance Position
4. BloFin Funding
5. BloFin Interval
6. BloFin Next Funding
7. Binance Funding
8. Binance Interval
9. Binance Next Funding
10. Net Funding Result
11. Entry Spread
12. Exit Spread
13. BloFin Bid / Ask
14. Binance Bid / Ask
15. Price Freshness
16. Funding Freshness

Optional scenario columns:

17. Estimated Fees
18. Estimated Voucher Offset
19. Estimated Net Scenario

---

## UI-006 — Direction Labels

Use explicit labels:

```text
BloFin LONG
Binance SHORT
```

or:

```text
BloFin SHORT
Binance LONG
```

Do not use generic labels such as “Direction A” or “Arbitrage Side.”

---

## UI-007 — Funding Formatting

Display funding as percentage with at least four decimal places.

Examples:

```text
+0.3000%
-0.5000%
```

Positive and negative values may use distinct colors, but color must not be the only signal.

---

## UI-008 — Countdown

Display next funding countdown as:

```text
HH:MM:SS
```

For intervals longer than 24 hours, allow:

```text
1d 03:12:44
```

Countdown updates locally every second.

It must never become negative.

---

## UI-009 — Data Freshness

Show separate freshness indicators for:

- price snapshot
- funding snapshot

Suggested states:

- fresh
- delayed
- stale
- unavailable

Thresholds should reflect selected polling intervals.

---

## UI-010 — Sorting

Support sorting by:

- absolute BloFin funding
- net funding result
- entry spread
- next BloFin funding time
- symbol
- optional voucher-adjusted scenario result

Default sort:

1. user-selected strategy metric
2. otherwise absolute BloFin funding descending

---

## UI-011 — Filtering

Required filters:

- symbol search
- minimum absolute BloFin funding
- positive-only or negative-only BloFin funding
- long-BloFin only
- short-BloFin only
- minimum or maximum entry spread
- hide rows with missing executable prices

---

## UI-012 — Warnings

Display a persistent but compact disclaimer:

> Estimates are informational. Funding, fees, slippage, voucher eligibility, campaign limits, and realized losses may differ from displayed assumptions.

---

## UI-013 — Error Presentation

Do not replace the full page with an error screen when stale data exists.

Show:

- stale values
- exchange-specific warning
- timestamp of last success
- retry action

Never expose stack traces.
