# Architecture Specification

## A-001 — Architectural Style

Use a compact modular monolith.

The application shall consist of:

1. Exchange adapters
2. Validation and normalization layer
3. Domain calculation layer
4. Aggregation service
5. Next.js server endpoint
6. React presentation layer

No distributed system is required.

---

## A-002 — Suggested Directory Structure

```text
src/
  app/
    api/
      monitor/
        route.ts
    page.tsx
    layout.tsx
    globals.css

  components/
    MonitorHeader.tsx
    SettingsPanel.tsx
    OpportunityTable.tsx
    OpportunitySummary.tsx
    StatusBadge.tsx
    Countdown.tsx

  lib/
    exchanges/
      binance/
        client.ts
        schemas.ts
        normalize.ts
      blofin/
        client.ts
        schemas.ts
        normalize.ts

    domain/
      direction.ts
      funding.ts
      spreads.ts
      voucher.ts
      ranking.ts
      merge.ts

    server/
      monitorService.ts
      cache.ts
      http.ts

    formatting/
      numbers.ts
      time.ts

  types/
    exchange.ts
    monitor.ts
    settings.ts

tests/
  direction.test.ts
  funding.test.ts
  spreads.test.ts
  voucher.test.ts
  normalization.test.ts
  merge.test.ts
```

The implementation agent may modify this structure when a simpler, more coherent design is justified.

---

## A-003 — Module Boundaries

### Exchange Layer

Responsible for:

- calling public endpoints
- request timeout
- response decoding
- runtime validation
- exchange-specific field mapping
- returning normalized exchange data

Must not contain UI logic.

### Domain Layer

Responsible for:

- position direction
- funding cash-flow calculations
- spread calculations
- voucher scenario calculations
- ranking
- merging exchange datasets

Must consist mainly of pure functions.

### Server Layer

Responsible for:

- orchestration
- parallel exchange requests
- caching
- stale snapshot retention
- sanitized status reporting
- API response construction

### UI Layer

Responsible for:

- rendering
- polling the local Next.js endpoint
- local countdown updates
- user settings
- sorting
- filtering
- formatting

Must not directly call Binance or BloFin from the browser.

---

## A-004 — Runtime Validation

All external JSON must be treated as `unknown`.

No external response may enter the domain layer without validation and normalization.

Acceptable approaches:

- explicit type guards
- Zod, if the dependency is judged worthwhile

The implementation must reject malformed critical fields without crashing the full response.

---

## A-005 — Error Isolation

Binance and BloFin requests must be independent.

Use:

```text
Promise.allSettled
```

or equivalent behavior.

Failure of one exchange must not automatically discard valid data from the other.

---

## A-006 — Snapshot Retention

Maintain the last successful normalized snapshot for each exchange in server memory.

If a later refresh fails:

- retain the last successful data
- mark it stale
- expose the sanitized error
- preserve the timestamp of the last successful update

This cache is process-local and intentionally non-persistent.

---

## A-007 — Refresh Separation

Price data and funding data have different volatility.

The implementation agent shall choose and document separate refresh intervals.

Recommended starting points:

- bid/ask: about 3–10 seconds
- funding data: about 30–120 seconds
- instrument metadata: about 5–30 minutes

The final values must be selected according to official rate limits and verified endpoint behavior.

---

## A-008 — Browser Polling

The browser shall poll only the local application endpoint.

Polling must:

- avoid overlapping requests
- use abortable requests
- retain prior successful UI data during refresh
- expose last successful refresh
- stop on component unmount
- avoid duplicate timers in React strict mode

---

## A-009 — No Premature WebSockets

Do not add WebSockets unless REST polling is shown to be insufficient.

For a one-week local tool, simplicity has priority over theoretical low latency.

---

## A-010 — Dependency Discipline

Every dependency must provide clear value.

Avoid:

- state-management frameworks
- large component libraries
- ORM packages
- message queues
- telemetry stacks
- generic exchange frameworks

Prefer platform and framework primitives.
