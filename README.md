# SHOMAAA CRYPTO — simulated Persian cryptocurrency exchange interface

Live: https://crypto.shomaaa.ir · Developed by [Tafakor Pardazan](https://tafakorpardazan.ir)

A frontend-only, production-style **simulation** of a cryptocurrency exchange UI (Persian, RTL). All prices, charts, order books,
balances, orders, deposits and withdrawals are **fictional and non-executable**. There is no real trading engine, custody,
blockchain connectivity, payment processing or market-data feed, and the app makes no regulatory or reserve claims.

## Stack
Next.js 16 (App Router, standalone output) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Radix primitives · lightweight-charts (lazy-loaded) · Zod · Zustand · Vitest · Playwright.
Design follows Adobe Spectrum's discipline (4px grid, tokens, 2px focus ring, accessible dialogs/tabs/forms) as a compatible custom system — Spectrum packages are **not** installed.
Font: Vazir v16.1.0 (bundled WOFF2 in `src/fonts`).

## Routes
`/` landing · `/markets` explorer · `/markets/[symbol]` asset detail · `/trade/[pair]` terminal · `/dashboard` · `/portfolio` · `/wallet` (deposit / withdraw / internal transfer) · `/orders` · `/account` · `/login` `/register` `/forgot-password` (demo session, no passwords) · `/simulation` (disclosure).
API (mock, `no-store` where dynamic): `/api/health`, `/api/market/{tickers,orderbook,candles,trades}`, `/api/assets`, `/api/portfolio`, `/api/account/summary`, `POST /api/orders`, `POST /api/transfers`.

## Mock-data engine
- `src/lib/market/model.ts`: one deterministic continuous price function per asset (seeded sinusoids + 3 s bucketed noise). Ticker, 24h stats, candles, order book, trades and portfolio valuation all derive from it, so every page and API agrees. No `Math.random`; no third-party API or key.
- `src/lib/engine/*`: pure account engine — market orders walk the simulated book (VWAP); limit orders lock funds and stay **pending** until the simulated price crosses (marketable limits fill immediately at ask/bid or better); fee 0.1 % of the received asset; every balance change is appended to a ledger that `reconcile()` verifies.
- Account state lives in the visitor's `localStorage` (simulation only, not a secure ledger). `POST /api/orders|transfers` run the same engine statelessly on the posted snapshot (`src/lib/services/exchange-service.ts` is the seam for a real backend).
- Timers run only while the tab is visible. Set `NEXT_PUBLIC_SIM_FIXED_TIME` to freeze the clock.

## Commands
```bash
npm ci
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck
npm test               # Vitest unit tests (engine, model, formatting)
npm run build
npm run test:e2e       # Playwright against `next start` (build first); BASE_URL=https://… tests a remote site
node scripts/build-brand.mjs                 # logo / favicon / OG image
node --env-file=<file with OPENROUTER_API_KEY> scripts/generate-images.mjs   # optional, cost-capped
```

## Environment
`NEXT_PUBLIC_SITE_URL` (default `https://crypto.shomaaa.ir`), optional `NEXT_PUBLIC_SIM_FIXED_TIME`, script-only `OPENROUTER_API_KEY`. No secrets are committed.

## Deployment (manual, no CI/CD)
Same pattern as the other projects on the k3s node: namespace `crypto`, Traefik ingress with the `le` ACME resolver, node-local image import.
```bash
deploy/deploy.sh      # docker build → ssh import into k3s → kubectl apply deploy/k8s → rollout status
curl -I https://crypto.shomaaa.ir/api/health
```
DNS: `crypto.shomaaa.ir` A → 193.151.152.230 (DNS-only). Health endpoint: `/api/health`.

## Limitations
Simulated data only; client-side state is not a ledger; authentication is a demo session; AI images (if any) are decorative (model + cost in `generated/manifest.json`).
