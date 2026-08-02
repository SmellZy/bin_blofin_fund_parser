# BloFin Voucher-Aware Funding Monitor

## 1. Document Purpose

This repository defines and implements a small, local, read-only market-monitoring application for two derivatives venues:

- Binance USDⓈ-M Futures
- BloFin USDT Linear Perpetual Futures

The application is intended for short-term personal use. It must remain deliberately simple, but its calculations, data handling, and failure behavior must be technically correct.

This document is the primary project charter. All other documents under `SPEC/` refine this specification.

---

## 2. Engineering Role

The implementation agent shall operate as a PhD-level software engineer with expertise in:

- TypeScript
- React
- Next.js
- exchange-market data integration
- quantitative calculations
- fault-tolerant application design
- testing and software verification

The agent must reason rigorously, prefer official documentation, validate assumptions, and keep the repository runnable throughout implementation.

---

## 3. Product Objective

Build a lightweight web application that:

1. Reads public perpetual-futures market data from Binance and BloFin.
2. Finds instruments available on both exchanges.
3. Displays funding rates, funding intervals, next-funding countdowns, executable bid/ask prices, and cross-exchange spreads.
4. Determines the required position direction from the sign of the BloFin funding rate.
5. Estimates strategy metrics under a configurable BloFin loss-compensation assumption.
6. Refreshes market data at frequencies selected by the implementation agent according to data volatility, official rate limits, and operational usefulness.
7. Never places trades and never requires exchange credentials.

---

## 4. Non-Goals

The application must not implement:

- order creation
- order cancellation
- account authentication
- balance retrieval
- private exchange endpoints
- automated trading
- portfolio management
- database persistence
- user registration
- multi-user access
- cloud deployment
- microservices
- event-driven infrastructure
- unnecessary WebSocket complexity
- production-grade observability infrastructure

---

## 5. Technology Constraints

Preferred stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- native `fetch`
- minimal testing tooling
- no Redux
- no database
- no Docker unless strictly required by the local environment

The project must run with:

```bash
npm install
npm run dev
```

The implementation agent may select the current stable versions of required packages.

---

## 6. Data Scope

Only instruments satisfying all of the following may appear:

- perpetual or swap contracts
- linear contracts
- USDT quote currency
- USDT settlement currency where applicable
- active/live trading state
- present on both Binance and BloFin

Spot markets, delivery futures, inverse contracts, USDC contracts, and inactive instruments must be excluded.

---

## 7. Primary User Interface

The application shall provide a single primary page titled:

**BloFin Voucher-Aware Funding Monitor**

The page shall include:

- exchange connectivity status
- funding-data freshness
- price-data freshness
- number of shared instruments
- manual refresh control
- configurable position size
- configurable voucher compensation rate
- configurable trading fees
- sortable and filterable opportunity table
- top opportunities summary

---

## 8. Core Principle

BloFin is the primary strategy venue.

Binance is the hedge venue.

The required BloFin position direction is determined only by the sign of the BloFin funding rate:

- positive BloFin funding → BloFin LONG, Binance SHORT
- negative BloFin funding → BloFin SHORT, Binance LONG
- zero BloFin funding → NEUTRAL

The application must not reverse this rule based on the funding rate observed on Binance.

---

## 9. Safety and Compliance Boundary

The application is an informational analytics tool only.

It must:

- display assumptions clearly
- avoid claims of guaranteed profit
- state that voucher eligibility and compensation depend on the applicable BloFin campaign terms
- avoid automated execution
- avoid encouraging circumvention of platform rules
- treat voucher compensation as a user-configurable analytical assumption, not a guaranteed entitlement

---

## 10. Completion Standard

The project is complete only when:

- live public data is displayed
- shared instruments are correctly identified
- funding and spread calculations are tested
- refresh behavior is stable
- partial exchange failures do not crash the application
- lint passes
- typecheck passes
- tests pass
- production build succeeds
- README is complete
- no core TODO remains
