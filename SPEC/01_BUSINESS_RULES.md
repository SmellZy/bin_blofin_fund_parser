# Business Rules

## BR-001 — Primary Venue

BloFin is the primary strategy venue.

Binance exists only as the opposite-direction hedge.

This invariant must never be violated by ranking, optimization, filtering, or presentation logic.

---

## BR-002 — BloFin Direction

The BloFin position is determined exclusively by the sign of the BloFin funding rate.

### Positive BloFin Funding

If:

```text
blofinFundingRate > 0
```

then:

```text
BloFin position = LONG
Binance position = SHORT
```

Rationale: positive funding means longs pay shorts.

### Negative BloFin Funding

If:

```text
blofinFundingRate < 0
```

then:

```text
BloFin position = SHORT
Binance position = LONG
```

Rationale: negative funding means shorts pay longs.

### Zero BloFin Funding

If:

```text
blofinFundingRate == 0
```

then:

```text
Direction = NEUTRAL
```

No preferred position shall be shown.

---

## BR-003 — Direction Independence

The application must not compare Binance and BloFin funding rates to decide position direction.

The Binance funding rate affects estimated funding cash flow, but not trade direction.

---

## BR-004 — Opposite Hedge

For every non-neutral opportunity:

```text
Binance position = opposite(BloFin position)
```

Allowed combinations:

- BloFin LONG / Binance SHORT
- BloFin SHORT / Binance LONG

Disallowed combinations:

- both LONG
- both SHORT
- BloFin position without a Binance hedge
- Binance position selected independently

---

## BR-005 — Voucher Assumption

The application may estimate a user-configurable compensation amount under the assumption that a percentage of eligible realized BloFin trading loss is compensated.

Default analytical value:

```text
voucherCompensationRate = 50%
```

This is an assumption only.

The interface must make clear that actual eligibility, limits, exclusions, settlement rules, timing, and campaign restrictions are controlled by BloFin's applicable terms.

---

## BR-006 — No Guaranteed Compensation

The application must never label estimated voucher compensation as:

- guaranteed
- confirmed
- withdrawable
- earned
- approved

Preferred wording:

- Estimated voucher offset
- Assumed compensation
- Voucher-adjusted estimate

---

## BR-007 — Configurability

The user must be able to change:

- position size
- voucher compensation rate
- Binance fee rate
- BloFin fee rate
- expected number of funding settlements, if such a feature is implemented
- optional expected exit spread, if manual scenario analysis is implemented

Settings may be stored in browser local storage.

No database is required.

---

## BR-008 — Ranking

The default ranking must prioritize the strategy-specific estimated result, not generic funding-rate difference.

The primary rank field should be one of:

```text
Estimated Voucher-Adjusted Result
```

or:

```text
Estimated Net Edge
```

The exact name must remain mathematically honest.

If the full result cannot be calculated because the future realized BloFin loss is unknown, the application must not fabricate it. In that case it shall rank by measurable components and clearly label scenario-based metrics.

---

## BR-009 — Measured vs Assumed Values

Every displayed metric belongs to one of these classes:

### Measured

Directly obtained from live public exchange data:

- funding rate
- funding interval
- next funding time
- bid
- ask
- instrument status

### Derived

Calculated deterministically from measured data:

- direction
- entry spread
- current exit spread
- funding cash flow estimate
- countdown

### Assumed

Provided by user configuration or scenario modeling:

- voucher compensation rate
- position size
- trading fee rate
- future exit spread
- number of funding events
- future BloFin realized loss

The UI must not visually blur these categories.

---

## BR-010 — Informational Use

The application is a decision-support interface only.

It must not:

- submit orders
- connect to private accounts
- claim trade suitability
- claim legal or campaign eligibility
- guarantee profitability
