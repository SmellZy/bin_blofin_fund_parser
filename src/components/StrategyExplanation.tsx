"use client";

import { useState } from "react";

export function StrategyExplanation() {
  const [expanded, setExpanded] = useState(false);
  return <section className="explanation panel">
    <button className="disclosure" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      <span><span className="eyebrow">Method</span><strong>How the strategy works</strong></span><span className="disclosure-icon" aria-hidden="true">{expanded ? "−" : "+"}</span>
    </button>
    {expanded && <div className="explanation-copy">
      <p>BloFin is the strategy venue and Binance is the opposite-direction hedge.</p>
      <p><b className="positive">BloFin funding above zero</b> → BloFin LONG / Binance SHORT.</p>
      <p><b className="negative">BloFin funding below zero</b> → BloFin SHORT / Binance LONG.</p>
      <p>Binance funding contributes to cash-flow estimates but never determines direction. Voucher compensation is an assumption only; funding, spreads, fees, slippage, campaign eligibility, and realized losses can differ.</p>
    </div>}
  </section>;
}
