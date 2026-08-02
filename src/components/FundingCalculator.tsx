import { fundingCashFlow } from "@/lib/domain";
import { formatMoney, formatPercent } from "@/lib/formatting";
import type { Opportunity } from "@/lib/types";

type CalculatorProps = { row: Opportunity | null; positionSize: number; voucherRate: number; blofinFee: number; binanceFee: number; expectedFundingEvents: number };

export function FundingCalculator({ row, positionSize, voucherRate, blofinFee, binanceFee, expectedFundingEvents }: CalculatorProps) {
  const events = Number.isFinite(expectedFundingEvents) && expectedFundingEvents > 0 ? expectedFundingEvents : 1;
  const blofinCashFlow = row ? fundingCashFlow(row.blofinFundingRate, row.blofinDirection) : null;
  const binanceCashFlow = row ? fundingCashFlow(row.binanceFundingRate, row.binanceDirection) : null;
  const blofinFunding = blofinCashFlow === null ? null : positionSize * blofinCashFlow * events;
  const binanceFunding = binanceCashFlow === null ? null : positionSize * binanceCashFlow * events;
  const voucherCoverage = Math.min(100, Math.max(0, voucherRate)) / 100;
  const voucherOffset = blofinFunding === null ? null : Math.max(0, -blofinFunding) * voucherCoverage;
  const fundingBeforeFees = blofinFunding === null || binanceFunding === null ? null : blofinFunding + binanceFunding;
  const fees = Number.isFinite(positionSize) && positionSize > 0 ? positionSize * (2 * blofinFee + 2 * binanceFee) / 100 : null;
  const netAfterVoucherAndFees = fundingBeforeFees === null ? null : fundingBeforeFees + (voucherOffset ?? 0) - (fees ?? 0);
  const netPercent = netAfterVoucherAndFees === null || positionSize <= 0 ? null : netAfterVoucherAndFees / positionSize;
  const output = (value: number | null) => value === null ? "—" : formatMoney(value, "$ ");

  return <section className="calculator panel">
    <div className="section-heading"><div><span className="eyebrow">Funding-farm estimate</span><h2>BloFin / Binance net result</h2></div><span className="scenario-badge">{events} funding event{events === 1 ? "" : "s"}</span></div>
    <div className="calculator-grid">
      <div className="calculator-inputs"><div className="selected-row"><span>Selected pair</span><strong>{row?.id ?? "Select a table row"}</strong></div><div className="calc-note">BloFin funding: {row ? formatPercent(row.blofinFundingRate) : "—"}<br />Voucher coverage applies only to an estimated BloFin funding cost.</div></div>
      <div className="calculator-results">
        <div className="calc-output"><span>BloFin funding cash-flow</span><strong className={blofinFunding !== null && blofinFunding >= 0 ? "positive" : "negative"}>{output(blofinFunding)}</strong><small>{blofinCashFlow === null ? "—" : formatPercent(blofinCashFlow * events)}</small></div>
        <div className="calc-output"><span>Binance funding cash-flow</span><strong className={binanceFunding !== null && binanceFunding >= 0 ? "positive" : "negative"}>{output(binanceFunding)}</strong><small>{binanceCashFlow === null ? "—" : formatPercent(binanceCashFlow * events)}</small></div>
        <div className="calc-output"><span>Voucher coverage of BloFin cost</span><strong className="positive">{output(voucherOffset)}</strong><small>{blofinFunding === null ? "—" : blofinFunding < 0 ? `${voucherRate.toFixed(1)}% of BloFin funding cost` : "No BloFin funding cost"}</small></div>
        <div className="calc-output"><span>Estimated round-trip fees</span><strong className="negative">{output(fees)}</strong><small>2 executions on each venue</small></div>
        <div className="calc-output emphasis"><span>Funding before fees</span><strong className={fundingBeforeFees !== null && fundingBeforeFees >= 0 ? "positive" : "negative"}>{output(fundingBeforeFees)}</strong><small>Before voucher coverage and fees</small></div>
        <div className="calc-output emphasis"><span>Net after voucher + fees</span><strong className={netAfterVoucherAndFees !== null && netAfterVoucherAndFees >= 0 ? "positive" : "negative"}>{output(netAfterVoucherAndFees)}</strong><small>{netPercent === null ? "—" : formatPercent(netPercent)} of position size</small></div>
      </div>
    </div>
  </section>;
}
