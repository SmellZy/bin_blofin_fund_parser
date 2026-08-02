import type { Opportunity } from "@/lib/types";

export function formatPercent(value: number | null, decimals = 4): string {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${(value * 100).toFixed(decimals)}%`;
}

export function formatSpread(value: number | null): string {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(4)}%`;
}

export function formatMoney(value: number | null, currency = ""): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${currency}${value.toLocaleString(undefined, { maximumFractionDigits: 8 })}`;
}

export function formatInterval(hours: number | null): string {
  return hours === null ? "N/A" : `every ${hours}h`;
}

export function formatCountdown(timestamp: number | null, now: number): string {
  if (timestamp === null) return "—";
  const seconds = Math.floor(Math.max(0, timestamp - now) / 1000);
  const days = Math.floor(seconds / 86_400);
  const hh = String(Math.floor((seconds % 86_400) / 3_600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3_600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return days ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

export function ageLabel(timestamp: number | null, now: number): string {
  return timestamp === null ? "Unavailable" : `${Math.max(0, Math.floor((now - timestamp) / 1000))}s`;
}

export function rowDirection(row: Opportunity): string {
  return row.blofinDirection === "NEUTRAL" ? "Neutral" : `BloFin ${row.blofinDirection} / Binance ${row.binanceDirection}`;
}
