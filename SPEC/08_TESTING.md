# Testing and Verification Specification

## T-001 — Testing Philosophy

Test the financial-sign logic and normalization boundaries more rigorously than presentation details.

The highest-risk defects are:

- reversed position direction
- incorrect funding cash-flow sign
- wrong executable side
- malformed symbol intersection
- invalid numeric parsing
- stale-data corruption

---

## T-002 — Direction Tests

Required cases:

1. BloFin funding positive
   - BloFin LONG
   - Binance SHORT

2. BloFin funding negative
   - BloFin SHORT
   - Binance LONG

3. BloFin funding zero
   - NEUTRAL

4. Binance funding changes
   - direction remains determined only by BloFin

---

## T-003 — Funding Tests

Required cases:

- positive funding with LONG
- positive funding with SHORT
- negative funding with LONG
- negative funding with SHORT
- zero funding
- decimal-to-percent conversion
- interval normalization
- null interval
- invalid interval

---

## T-004 — Spread Tests

Required cases:

### BloFin LONG / Binance SHORT

Verify:

- entry uses `BF_ask` and `BN_bid`
- exit uses `BF_bid` and `BN_ask`

### BloFin SHORT / Binance LONG

Verify:

- entry uses `BF_bid` and `BN_ask`
- exit uses `BF_ask` and `BN_bid`

Also test:

- zero denominator
- null bid
- null ask
- negative price
- non-finite price
- crossed market anomaly

---

## T-005 — Voucher Tests

Required cases:

- 50% compensation
- 0% compensation
- 100% compensation
- negative input rejected
- compensation rate clamped or validated
- no assumed loss returns unavailable result
- position size zero handled safely

---

## T-006 — Symbol Normalization Tests

Required cases:

- `BTCUSDT` + explicit Binance assets
- `BTC-USDT` + explicit BloFin assets
- USDC excluded
- inverse contract excluded
- inactive market excluded
- similarly named assets remain distinct

---

## T-007 — Merge Tests

Required cases:

- present on both exchanges
- present only on Binance
- present only on BloFin
- funding missing on one exchange
- price missing on one exchange
- stale snapshot
- duplicate malformed instrument
- canonical collision detection

---

## T-008 — Countdown Tests

Required cases:

- future timestamp
- current timestamp
- past timestamp
- missing timestamp
- invalid timestamp
- countdown never negative

---

## T-009 — API Failure Tests

Use deterministic fixtures or mocked HTTP at the adapter boundary.

Required scenarios:

- Binance timeout
- BloFin timeout
- Binance malformed JSON
- BloFin malformed envelope
- one exchange returns 500
- both exchanges fail
- stale snapshot retained
- sanitized error returned

Runtime market data must never be mocked in production mode.

---

## T-010 — Acceptance Commands

The implementation agent must run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

All commands must pass before completion.

---

## T-011 — Live Smoke Test

After unit tests pass:

1. Start the application.
2. Call the local monitor endpoint.
3. Confirm non-empty live data when exchanges are available.
4. Confirm at least BTC/USDT if listed on both venues.
5. Verify displayed formulas against one manually checked row.
6. Confirm refresh timestamps change according to policy.

---

## T-012 — Invariants

The following invariants must always hold:

```text
I-001: BloFin direction depends only on BloFin funding sign.
I-002: Binance direction is always opposite BloFin.
I-003: No spread uses last, mark, index, or midpoint price.
I-004: Every spread uses executable bid/ask.
I-005: Countdown is never negative.
I-006: Invalid required input produces null, not a fabricated number.
I-007: One exchange failure does not crash the full UI.
I-008: Voucher compensation is never presented as guaranteed.
```
