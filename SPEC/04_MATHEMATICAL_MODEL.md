# Mathematical Model

## 1. Notation

For one shared instrument, define:

```text
BF = BloFin
BN = Binance
```

Prices:

```text
BF_bid = BloFin executable bid
BF_ask = BloFin executable ask
BN_bid = Binance executable bid
BN_ask = Binance executable ask
```

Funding rates in decimal API form:

```text
f_BF
f_BN
```

Funding rates displayed as percentages:

```text
F_BF = f_BF × 100
F_BN = f_BN × 100
```

Position notional:

```text
N
```

Voucher compensation assumption:

```text
v ∈ [0, 1]
```

---

## 2. Direction Function

Define BloFin direction:

```text
if F_BF > 0: BloFin = LONG
if F_BF < 0: BloFin = SHORT
if F_BF = 0: BloFin = NEUTRAL
```

Define Binance direction as the exact opposite for non-neutral cases.

This function must depend only on `F_BF`.

---

## 3. Funding Cash-Flow Sign Convention

Positive result means cash received.

Negative result means cash paid.

For a venue funding percentage `F`:

### LONG Position

```text
fundingCashFlowPercent = -F
```

### SHORT Position

```text
fundingCashFlowPercent = +F
```

This convention correctly handles both positive and negative funding.

Example:

```text
F = +0.30%
LONG result = -0.30%
SHORT result = +0.30%
```

Example:

```text
F = -0.50%
LONG result = +0.50%
SHORT result = -0.50%
```

---

## 4. Strategy Funding Result

For the selected BloFin/Binance directions:

```text
blofinFundingResultPercent =
  fundingResult(F_BF, blofinDirection)

binanceFundingResultPercent =
  fundingResult(F_BN, binanceDirection)

netFundingResultPercent =
  blofinFundingResultPercent +
  binanceFundingResultPercent
```

Dollar estimate:

```text
netFundingResultAmount =
  N × netFundingResultPercent / 100
```

This is an estimate for one funding settlement unless explicitly normalized otherwise.

---

## 5. Funding Intervals

Each exchange funding rate must be shown together with its own interval.

Do not directly compare rates from different intervals as though they represent equal time horizons.

Optional hourly normalization:

```text
hourlyFundingPercent = fundingPercent / intervalHours
```

Only calculate when:

```text
intervalHours > 0
```

If both intervals are known:

```text
hourlyNetFundingResultPercent =
  fundingResult(F_BF / BF_intervalHours, blofinDirection)
  +
  fundingResult(F_BN / BN_intervalHours, binanceDirection)
```

Label normalized values clearly.

---

## 6. Entry Spread

Use executable prices only.

### Case A — BloFin LONG / Binance SHORT

Open:

- buy BloFin at `BF_ask`
- sell Binance at `BN_bid`

Define:

```text
entrySpreadPercent =
  ((BN_bid - BF_ask) / BF_ask) × 100
```

### Case B — BloFin SHORT / Binance LONG

Open:

- sell BloFin at `BF_bid`
- buy Binance at `BN_ask`

Define:

```text
entrySpreadPercent =
  ((BF_bid - BN_ask) / BN_ask) × 100
```

Interpretation:

- positive value: short venue is priced above long venue
- negative value: short venue is priced below long venue

---

## 7. Current Exit Spread

### Case A — Existing BloFin LONG / Binance SHORT

Close:

- sell BloFin long at `BF_bid`
- buy back Binance short at `BN_ask`

Define:

```text
exitSpreadPercent =
  ((BN_ask - BF_bid) / BF_bid) × 100
```

### Case B — Existing BloFin SHORT / Binance LONG

Close:

- buy back BloFin short at `BF_ask`
- sell Binance long at `BN_bid`

Define:

```text
exitSpreadPercent =
  ((BF_ask - BN_bid) / BN_bid) × 100
```

The implementation must use one consistent convention and document it in the UI tooltip.

---

## 8. Spread Convergence Estimate

For a position entered at a known entry spread:

```text
grossSpreadResultPercent =
  entrySpreadAtOpenPercent -
  currentExitSpreadPercent
```

For a scanner that has not stored the user's actual entry spread, this cannot represent realized or unrealized PnL.

Therefore:

- do not claim current entry and exit spread alone equal actual PnL
- label them as current executable opening and closing conditions
- allow optional manual entry-spread input only if useful

---

## 9. Trading Fees

Let:

```text
fee_BF = BloFin fee percentage per execution
fee_BN = Binance fee percentage per execution
```

Estimated round-trip fee percentage:

```text
roundTripFeesPercent =
  2 × fee_BF + 2 × fee_BN
```

This assumes one open and one close execution on each exchange.

For entry-only analysis:

```text
entryFeesPercent =
  fee_BF + fee_BN
```

The UI must state whether displayed fees are entry-only or round-trip.

---

## 10. Voucher Compensation Model

Actual voucher compensation depends on exchange terms and realized eligible BloFin loss.

The application must not infer a guaranteed future loss from funding alone.

Define a scenario variable:

```text
eligibleBlofinRealizedLossAmount ≥ 0
```

Estimated compensation:

```text
estimatedVoucherCompensationAmount =
  eligibleBlofinRealizedLossAmount × v
```

Equivalent percentage relative to notional:

```text
estimatedVoucherCompensationPercent =
  estimatedVoucherCompensationAmount / N × 100
```

If no user-supplied or defensibly derived eligible realized loss exists, voucher compensation must be shown as unavailable rather than fabricated.

---

## 11. Optional Scenario Estimate

The application may provide a scenario calculator where the user enters:

- expected BloFin realized loss
- or expected BloFin loss percentage
- voucher compensation rate
- position size
- expected number of funding events
- fee rates
- expected exit spread

Then:

```text
estimatedNetScenarioAmount =
  estimatedBlofinPnLAmount
  + estimatedBinancePnLAmount
  + totalFundingAmount
  + estimatedVoucherCompensationAmount
  - estimatedFeesAmount
```

The calculator must label every user-supplied variable as an assumption.

---

## 12. Breakeven Metric

A breakeven spread may only be calculated from a fully specified scenario.

Example general form:

```text
maximumAdverseSpreadCostPercent =
  expectedFundingBenefitPercent
  + expectedVoucherCompensationPercent
  - expectedFeesPercent
```

Do not display a breakeven value when required inputs are missing.

---

## 13. Nullability

Every calculated metric returns `null` when any required input is:

- missing
- non-finite
- zero where used as denominator
- negative where a positive market price is required
- structurally inconsistent

The UI renders `null` as:

```text
—
```
