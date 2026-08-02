import { formatCountdown, formatInterval, formatMoney, formatPercent, formatSpread } from "@/lib/formatting";
import type { Opportunity } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";

export type TableSortKey = "token" | "binanceFunding" | "binancePrice" | "blofinFunding" | "blofinPrice" | "spread8h";
type SortDirection = "asc" | "desc";
type FundingTableProps = { rows: Opportunity[]; now: number; favorites: Set<string>; sortKey: TableSortKey; sortDirection: SortDirection; onSort: (key: TableSortKey) => void; onToggleFavorite: (symbol: string) => void; onSelect: (row: Opportunity) => void };

function PriceCell({ row, venue }: { row: Opportunity; venue: "blofin" | "binance" }) {
  const price = venue === "blofin" ? row.blofinPrice : row.binancePrice;
  return <div className="price-cell"><span>Bid <b>{formatMoney(price?.bid ?? null, "$")}</b></span><span>Ask <b>{formatMoney(price?.ask ?? null, "$")}</b></span></div>;
}

function FundingCell({ rate, interval, nextFundingAt, now }: { rate: number | null; interval: number | null; nextFundingAt: number | null; now: number }) {
  return <div className="funding-cell"><strong className={rate !== null && rate >= 0 ? "positive" : "negative"}>{formatPercent(rate)}</strong><span>{formatInterval(interval)} · {formatCountdown(nextFundingAt, now)}</span></div>;
}

function SortHeader({ label, sortKey, activeKey, direction, onSort, title }: { label: string; sortKey: TableSortKey; activeKey: TableSortKey; direction: SortDirection; onSort: (key: TableSortKey) => void; title?: string }) {
  const active = activeKey === sortKey;
  return <th scope="col" aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"} title={title}><button className={`sort-header ${active ? "active" : ""}`} onClick={() => onSort(sortKey)}>{label}<span aria-hidden="true">{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>;
}

export function FundingTable({ rows, now, favorites, sortKey, sortDirection, onSort, onToggleFavorite, onSelect }: FundingTableProps) {
  return <div className="table-shell"><table className="funding-table"><caption className="sr-only">Shared perpetual-futures funding opportunities</caption><thead><tr><SortHeader label="Token" sortKey="token" activeKey={sortKey} direction={sortDirection} onSort={onSort} /><SortHeader label="Binance funding" sortKey="binanceFunding" activeKey={sortKey} direction={sortDirection} onSort={onSort} /><SortHeader label="Binance price" sortKey="binancePrice" activeKey={sortKey} direction={sortDirection} onSort={onSort} /><SortHeader label="BloFin funding" sortKey="blofinFunding" activeKey={sortKey} direction={sortDirection} onSort={onSort} /><SortHeader label="BloFin price" sortKey="blofinPrice" activeKey={sortKey} direction={sortDirection} onSort={onSort} /><SortHeader label="Spread / 8h" sortKey="spread8h" activeKey={sortKey} direction={sortDirection} onSort={onSort} title="Executable entry spread and normalized eight-hour net funding estimate" /></tr></thead><tbody>{rows.map((row) => { const holding8h = row.hourlyNetFundingPercent === null ? null : row.hourlyNetFundingPercent * 8 * 100; return <tr key={row.id} onClick={() => onSelect(row)}><td className="col-token"><div className="token-cell"><FavoriteButton favorite={favorites.has(row.id)} symbol={row.id} onToggle={() => onToggleFavorite(row.id)} /><div><strong>{row.id.replace("/USDT", "")}</strong><small>{row.blofinSymbol} · {row.binanceSymbol}</small></div></div></td><td><FundingCell rate={row.binanceFundingRate} interval={row.binanceFundingIntervalHours} nextFundingAt={row.binanceNextFundingAt} now={now} /></td><td><PriceCell row={row} venue="binance" /></td><td><FundingCell rate={row.blofinFundingRate} interval={row.blofinFundingIntervalHours} nextFundingAt={row.blofinNextFundingAt} now={now} /></td><td><PriceCell row={row} venue="blofin" /></td><td><div className="spread-8h-cell"><strong className={row.entrySpreadPercent !== null && row.entrySpreadPercent >= 0 ? "positive" : "negative"}>Spread {formatSpread(row.entrySpreadPercent)}</strong><small className={holding8h !== null && holding8h >= 0 ? "positive" : "negative"}>{holding8h === null ? "8h —" : `8h ${holding8h >= 0 ? "+" : ""}${holding8h.toFixed(4)}%`}</small></div></td></tr>; })}</tbody>{rows.length === 0 && <tfoot><tr><td colSpan={6} className="empty-state">No opportunities match the current filters.</td></tr></tfoot>}</table></div>;
}
