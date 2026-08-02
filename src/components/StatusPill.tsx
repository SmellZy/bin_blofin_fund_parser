type StatusPillProps = { label: string; ok: boolean; stale: boolean };

export function StatusPill({ label, ok, stale }: StatusPillProps) {
  const state = ok && !stale ? "live" : stale ? "stale" : "error";
  return <span className={`status-pill ${state}`}><span className="status-dot" aria-hidden="true" />{label} {ok && !stale ? "live" : stale ? "stale" : "error"}</span>;
}
