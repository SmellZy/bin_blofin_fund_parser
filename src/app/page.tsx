"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ageLabel } from "@/lib/formatting";
import type { MonitorResponse, Opportunity } from "@/lib/types";
import { FilterToolbar } from "@/components/FilterToolbar";
import { FundingCalculator } from "@/components/FundingCalculator";
import { FundingTable } from "@/components/FundingTable";
import type { TableSortKey } from "@/components/FundingTable";
import { StatusPill } from "@/components/StatusPill";
import { StrategyExplanation } from "@/components/StrategyExplanation";

const DEFAULTS = { positionSize: 1_000, voucherRate: 50, blofinFee: 0.04, binanceFee: 0.04, expectedFundingEvents: 1, search: "", sign: "all" as "all" | "positive" | "negative", side: "all" as "all" | "LONG" | "SHORT", minFunding: 0, minEntrySpread: -100, favoritesOnly: false, showingAll: false };
type Settings = typeof DEFAULTS;
const SETTINGS_KEY = "monitor-settings";
const FAVORITES_KEY = "monitor-favorites";

export default function Home() {
  const [monitor, setMonitor] = useState<MonitorResponse | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedRow, setSelectedRow] = useState<Opportunity | null>(null);
  const [now, setNow] = useState(Date.now());
  const [sortKey, setSortKey] = useState<TableSortKey>("spread8h");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const controller = new AbortController();
    try {
      const response = await fetch("/api/monitor", { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`Monitor returned HTTP ${response.status}`);
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !Array.isArray((payload as { data?: unknown }).data)) throw new Error("Monitor returned an invalid response");
      const nextMonitor = payload as MonitorResponse;
      setMonitor(nextMonitor);
      setSelectedRow((current) => current ? nextMonitor.data.find((row) => row.id === current.id) ?? current : nextMonitor.data[0] ?? null);
      setError(null);
    } catch (caught) { if (caught instanceof Error && caught.name !== "AbortError") setError(caught.message); }
    finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { try { const saved = localStorage.getItem(SETTINGS_KEY); if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) as Partial<Settings> }); const savedFavorites = localStorage.getItem(FAVORITES_KEY); if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites) as string[])); } catch { setError("Some local preferences could not be loaded"); } }, []);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 5_000); return () => window.clearInterval(timer); }, [load]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 5_000); return () => window.clearInterval(timer); }, []);

  const filteredRows = useMemo(() => (monitor?.data ?? []).filter((row) => {
    const search = settings.search.trim().toLowerCase();
    const signMatch = settings.sign === "all" || (settings.sign === "positive" && (row.blofinFundingRate ?? 0) > 0) || (settings.sign === "negative" && (row.blofinFundingRate ?? 0) < 0);
    const sideMatch = settings.side === "all" || row.blofinDirection === settings.side;
    const favoriteMatch = !settings.favoritesOnly || favorites.has(row.id);
    return (!search || `${row.id} ${row.blofinSymbol} ${row.binanceSymbol}`.toLowerCase().includes(search)) && signMatch && sideMatch && favoriteMatch && Math.abs(row.blofinFundingRate ?? 0) * 100 >= settings.minFunding && (row.entrySpreadPercent ?? -Infinity) >= settings.minEntrySpread;
  }).sort((a, b) => Math.abs(b.netFundingPercent ?? 0) - Math.abs(a.netFundingPercent ?? 0)), [favorites, monitor, settings]);
  const sortedRows = useMemo(() => [...filteredRows].sort((left, right) => {
    const value = (row: Opportunity): string | number => {
      switch (sortKey) {
        case "token": return row.id;
        case "binanceFunding": return row.binanceFundingRate ?? Number.NEGATIVE_INFINITY;
        case "binancePrice": return row.binancePrice?.bid ?? Number.NEGATIVE_INFINITY;
        case "blofinFunding": return row.blofinFundingRate ?? Number.NEGATIVE_INFINITY;
        case "blofinPrice": return row.blofinPrice?.bid ?? Number.NEGATIVE_INFINITY;
        case "spread8h": return row.hourlyNetFundingPercent === null ? Number.NEGATIVE_INFINITY : row.hourlyNetFundingPercent * 8;
      }
    };
    const a = value(left); const b = value(right);
    const order = typeof a === "string" && typeof b === "string" ? a.localeCompare(b) : Number(a) - Number(b);
    return sortDirection === "asc" ? order : -order;
  }), [filteredRows, sortDirection, sortKey]);
  const rankedRows = sortedRows;
  const visibleRows = settings.showingAll ? rankedRows : rankedRows.slice(0, 60);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((previous) => ({ ...previous, [key]: value }));
  const changeSort = (key: TableSortKey) => { if (key === sortKey) setSortDirection((direction) => direction === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDirection(key === "token" ? "asc" : "desc"); } };
  const toggleFavorite = (symbol: string) => setFavorites((previous) => { const next = new Set(previous); if (next.has(symbol)) next.delete(symbol); else next.add(symbol); return next; });
  const datasetStatus = (exchange: "blofin" | "binance", dataset: "prices" | "funding") => monitor?.status[exchange][dataset];
  const sharedCount = monitor?.data.length ?? 0;
  const lastUpdate = monitor?.generatedAt ? new Date(monitor.generatedAt).toLocaleTimeString() : "—";

  return <main className="app-shell">
    <header className="page-header">
      <div className="brand-mark" aria-hidden="true">BF</div>
      <div className="header-copy"><h1>BloFin Funding Radar</h1><p>Live BloFin and Binance perpetual-futures funding, executable prices, and voucher-aware strategy metrics.</p><div className="status-line"><span>Updated {lastUpdate}</span><span>·</span><span>{sharedCount} shared pairs</span><span>·</span><StatusPill label="BloFin" ok={datasetStatus("blofin", "prices")?.ok === true && datasetStatus("blofin", "funding")?.ok === true} stale={datasetStatus("blofin", "prices")?.stale === true || datasetStatus("blofin", "funding")?.stale === true} /><StatusPill label="Binance" ok={datasetStatus("binance", "prices")?.ok === true && datasetStatus("binance", "funding")?.ok === true} stale={datasetStatus("binance", "prices")?.stale === true || datasetStatus("binance", "funding")?.stale === true} /><span className="auto-refresh"><span className="pulse" />Auto-refresh 5s</span></div></div>
      <button className="header-refresh" onClick={() => void load()} aria-label="Refresh market data">↻</button>
    </header>
    <StrategyExplanation />
    <section className="calculator-input-panel panel"><div className="section-heading"><div><span className="eyebrow">Inputs</span><h2>Funding-farm assumptions</h2></div><span className="muted">Persisted locally</span></div><div className="assumption-grid"><label>Position size, USDT<input type="number" min="0" value={settings.positionSize} onChange={(event) => update("positionSize", Number(event.target.value))} /></label><label>Voucher coverage of BloFin cost, %<input type="number" min="0" max="100" value={settings.voucherRate} onChange={(event) => update("voucherRate", Number(event.target.value))} /></label><label>BloFin fee, %<input type="number" min="0" value={settings.blofinFee} onChange={(event) => update("blofinFee", Number(event.target.value))} /></label><label>Binance fee, %<input type="number" min="0" value={settings.binanceFee} onChange={(event) => update("binanceFee", Number(event.target.value))} /></label><label>Expected funding events<input type="number" min="1" step="1" value={settings.expectedFundingEvents} onChange={(event) => update("expectedFundingEvents", Number(event.target.value))} /></label></div><p className="assumption-note">The calculator reads the selected pair’s live BloFin and Binance funding rates. Voucher coverage is an analytical assumption, not a guaranteed settlement.</p></section>
    <FundingCalculator row={selectedRow} positionSize={settings.positionSize} voucherRate={settings.voucherRate} blofinFee={settings.blofinFee} binanceFee={settings.binanceFee} expectedFundingEvents={settings.expectedFundingEvents} />
    <FilterToolbar search={settings.search} sign={settings.sign} side={settings.side} minFunding={settings.minFunding} minEntrySpread={settings.minEntrySpread} favoritesOnly={settings.favoritesOnly} showingAll={settings.showingAll} total={filteredRows.length} onSearch={(value) => update("search", value)} onSign={(value) => update("sign", value)} onSide={(value) => update("side", value)} onMinFunding={(value) => update("minFunding", value)} onMinEntrySpread={(value) => update("minEntrySpread", value)} onFavoritesOnly={(value) => update("favoritesOnly", value)} onShowingAll={(value) => update("showingAll", value)} onRefresh={() => void load()} />
    {error && <div className="warning-banner" role="status">Refresh warning: {error}</div>}
    <div className="table-meta"><span>Showing <strong>{visibleRows.length}</strong> of {filteredRows.length} filtered / {sharedCount} shared pairs</span><span>BloFin prices {ageLabel(datasetStatus("blofin", "prices")?.lastSuccessfulAt ?? null, now)} · funding {ageLabel(datasetStatus("blofin", "funding")?.lastSuccessfulAt ?? null, now)}</span></div>
    <FundingTable rows={visibleRows} now={now} favorites={favorites} sortKey={sortKey} sortDirection={sortDirection} onSort={changeSort} onToggleFavorite={toggleFavorite} onSelect={setSelectedRow} />
  </main>;
}

