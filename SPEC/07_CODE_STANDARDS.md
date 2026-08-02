# Code Standards

## CR-001 — Language

Use TypeScript in strict mode.

Avoid `any`.

When unavoidable, isolate and justify it.

---

## CR-002 — External Data

All external payloads are `unknown` until validated.

No exchange-specific raw object may cross into the domain layer.

---

## CR-003 — Pure Calculations

All mathematical calculations must be pure functions.

Examples:

- determineDirection
- fundingResultForPosition
- calculateEntrySpread
- calculateExitSpread
- calculateNetFunding
- calculateVoucherEstimate
- calculateFees

---

## CR-004 — Naming

Use explicit domain names.

Preferred:

```text
blofinFundingRatePercent
binanceAskPrice
estimatedVoucherCompensationAmount
```

Avoid:

```text
val
data2
x
tmp
```

except for tightly scoped mathematical code where notation is documented.

---

## CR-005 — Function Size

Prefer functions under approximately 50 logical lines.

A longer function is acceptable only when splitting it would reduce clarity.

---

## CR-006 — Error Handling

Do not swallow errors silently.

Convert low-level errors into sanitized domain errors.

Never expose stack traces in API responses.

---

## CR-007 — Comments

Comments should explain:

- non-obvious exchange behavior
- formula sign conventions
- validation rationale
- cache behavior

Do not comment obvious syntax.

---

## CR-008 — Constants

Named constants must be used for:

- refresh intervals
- request timeouts
- stale thresholds
- default fee rates
- default voucher compensation rate
- numeric formatting precision

---

## CR-009 — Null Handling

Use `null` for unavailable calculated values.

Do not use:

- `0` as missing data
- empty string as missing numeric data
- arbitrary sentinel numbers

---

## CR-010 — Formatting

Use project-standard formatting and linting.

The project must expose scripts for:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

## CR-011 — UI State

Do not duplicate server-derived market state unnecessarily.

User-configurable settings may remain client-side.

---

## CR-012 — No Secret Storage

No exchange API key, private key, or secret shall exist in:

- source code
- environment examples
- tests
- logs
- screenshots
- README

---

## CR-013 — Minimal Dependencies

Before adding a package, verify that platform APIs or existing dependencies cannot solve the problem clearly.

---

## CR-014 — No Core TODOs

Core functionality must not be left as:

- TODO
- FIXME
- placeholder
- mock
- fake response

Non-critical future enhancements may be documented separately.

---

## CR-015 — Repository Hygiene

Do not commit:

- build artifacts
- local caches
- editor-specific noise
- secrets
- large captured exchange responses unless intentionally minimized as test fixtures
