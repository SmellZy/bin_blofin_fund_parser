# Implementation Tasks

The implementation agent must keep this file updated.

Use:

```text
[ ] not started
[-] in progress
[x] complete
[!] blocked
```

---

## Phase 1 — Verification

- [x] Read all specification files.
- [x] Inspect repository structure.
- [x] Verify current Binance official API documentation.
- [x] Verify current BloFin official API documentation.
- [x] Confirm endpoint response envelopes with live requests.
- [x] Record final endpoint decisions.

---

## Phase 2 — Project Bootstrap

- [x] Create Next.js TypeScript project.
- [x] Configure compact dark CSS interface.
- [x] Enable strict TypeScript.
- [x] Add lint script.
- [x] Add typecheck script.
- [x] Add test runner.
- [x] Add build script.
- [x] Confirm app runs.

---

## Phase 3 — Domain Types

- [x] Define exchange identifiers.
- [x] Define canonical instrument type.
- [x] Define normalized market-data types.
- [x] Define monitor response types.
- [x] Define user settings types.
- [x] Define nullable calculation outputs.

---

## Phase 4 — Binance Adapter

- [x] Implement HTTP client.
- [x] Implement timeout.
- [x] Validate exchange info.
- [x] Validate premium index and fundingInfo responses.
- [x] Validate book ticker response.
- [x] Normalize Binance instruments.
- [x] Add tests.

---

## Phase 5 — BloFin Adapter

- [x] Implement HTTP client.
- [x] Implement timeout.
- [x] Validate instruments response.
- [x] Validate one-call bulk funding response.
- [x] Validate tickers response.
- [x] Normalize BloFin instruments.
- [x] Add bulk-request count test.

---

## Phase 6 — Domain Calculations

- [x] Implement BloFin-driven direction.
- [x] Implement funding cash-flow sign.
- [x] Implement net funding.
- [x] Implement interval normalization.
- [x] Implement entry spread.
- [x] Implement exit spread.
- [x] Implement voucher scenario calculation.
- [x] Implement deterministic ranking.
- [x] Add tests.

---

## Phase 7 — Aggregation Engine

- [x] Implement independent instrument, price, and funding caches per exchange.
- [x] Implement in-flight deduplication.
- [x] Implement differentiated refresh policy.
- [x] Implement stale snapshot retention.
- [x] Implement shared-symbol merge.
- [x] Implement dataset-specific status response.
- [x] Add bulk funding request-count test.

---

## Phase 8 — API Route

- [x] Add monitor route.
- [x] Return typed response.
- [x] Return partial data on partial failure.
- [x] Avoid stack trace leakage.
- [x] Verify live response.

---

## Phase 9 — User Interface

- [x] Build header.
- [x] Build dataset-specific exchange status indicators.
- [x] Build settings panel.
- [x] Build top opportunities summary.
- [x] Build main table.
- [x] Add ranking.
- [x] Add filtering.
- [x] Add local countdown.
- [x] Add separate price/funding freshness.
- [x] Add responsive overflow.
- [x] Add disclaimer.

---

## Phase 10 — Client Refresh

- [x] Implement non-overlapping polling.
- [x] Implement abortable requests.
- [x] Preserve previous data during refresh.
- [x] Add manual refresh.
- [x] Handle stale and error states.

---

## Phase 11 — Validation

- [x] Run lint.
- [x] Run typecheck.
- [x] Run tests.
- [x] Run production build.
- [x] Run repeated live smoke test.
- [x] Manually verify BTC/USDT direction and intervals.

---

## Phase 12 — Documentation

- [x] Write README.
- [x] Document endpoints and Binance fundingInfo merge.
- [x] Document formulas.
- [x] Document independent refresh intervals and request counts.
- [x] Document assumptions.
- [x] Document voucher limitations.
- [x] Document run commands.
- [x] Remove obsolete per-symbol funding behavior.
