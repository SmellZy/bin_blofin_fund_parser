# Acceptance Criteria

## AC-001 — Startup

The application starts locally using:

```bash
npm install
npm run dev
```

---

## AC-002 — Live Data

When both exchanges are available, the application displays live public data from Binance and BloFin.

No production mock data is permitted.

---

## AC-003 — Shared Instruments

Only active linear USDT perpetual instruments available on both exchanges appear by default.

---

## AC-004 — Direction

For every row:

```text
BloFin funding > 0
→ BloFin LONG / Binance SHORT

BloFin funding < 0
→ BloFin SHORT / Binance LONG

BloFin funding = 0
→ NEUTRAL
```

No other direction logic is accepted.

---

## AC-005 — Funding

The UI displays:

- BloFin funding percentage
- Binance funding percentage
- each venue's funding interval
- each venue's next-funding countdown
- strategy funding cash flow
- net funding estimate

---

## AC-006 — Prices

The UI displays:

- BloFin bid
- BloFin ask
- Binance bid
- Binance ask

No last, mark, index, or midpoint price may substitute for executable prices.

---

## AC-007 — Spreads

The application calculates direction-specific entry and exit spreads from the exact bid/ask sides defined in `04_MATHEMATICAL_MODEL.md`.

---

## AC-008 — Refresh

The application uses separate refresh policies for:

- prices
- funding
- instruments

Countdown updates locally every second.

---

## AC-009 — Resilience

If one exchange fails:

- the application remains rendered
- stale data remains visible when available
- the affected exchange is marked stale or error
- no stack trace is shown

---

## AC-010 — Settings

The user can configure at least:

- position size
- voucher compensation rate
- Binance fee rate
- BloFin fee rate

---

## AC-011 — Voucher Honesty

Voucher compensation is:

- clearly labeled as estimated
- based on explicit assumptions
- never represented as guaranteed
- unavailable when required inputs are missing

---

## AC-012 — Quality Gates

All must pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

## AC-013 — Documentation

README includes:

- project purpose
- installation
- startup
- exchange endpoints
- refresh policy
- direction rule
- funding formulas
- spread formulas
- fee assumptions
- voucher assumptions
- limitations
- risk disclaimer

---

## AC-014 — No Core Incompleteness

The final repository contains no core:

- TODO
- FIXME
- mock API
- placeholder table
- fake data
- unimplemented calculation
