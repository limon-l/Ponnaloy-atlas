# Architecture

## 1. Route map (verified from `pnpm build`)

```text
Customer / public — src/app/(store)
  /                                   editorial home
  /products                           catalogue + URL-synchronised filters
  /product/[slug]                     product detail + quick view target
  /collections                        collection index
  /collections/[slug]                 collection story + products
  /sellers                            studio directory
  /sellers/[slug]                     studio storefront
  /compare                            product exploration studio
  /cart                               bag
  /checkout                           validated demo checkout
  /orders                             customer order history
  /orders/[id]                        order timeline, tracking, returns
  /account                            account overview
  /wishlist                           saved objects
  /help                               support topics
  /sign-in                            demo authentication surface
  /journey                            cross-role connected commerce tour
  /lab                                design & motion lab

Seller workspace — src/app/seller (role-gated)
  /seller                             overview: revenue, orders, stock alerts
  /seller/orders                      scoped fulfilment queue
  /seller/products                    catalogue CRUD
  /seller/inventory                   inline variant stock editing
  /seller/analytics                   trend and distribution charts
  /seller/earnings                    commission, payouts, settlements
  /seller/settings                    storefront and policy settings

Admin command centre — src/app/admin (role-gated)
  /admin                              operational dashboard
  /admin/moderation                   listing approvals/rejections
  /admin/orders                       all orders, returns and refunds
  /admin/products                     catalogue oversight
  /admin/sellers                      seller lifecycle
  /admin/customers                    customer directory + detail panel
  /admin/finance                      payment/refund ledger
  /admin/merchandising                homepage curation
  /admin/analytics                    marketplace trends
  /admin/audit                        audit trail
  /admin/settings                     platform policy + demo controls
```

Next.js reports 37 routes (35 prerendered static pages plus dynamic product, collection, seller and order routes).

## 2. Module boundaries

```text
src/app
  (store)/        route composition only; heavy views in *-view.tsx files
  seller/         workspace pages; guarded by seller/layout.tsx
  admin/          workspace pages; guarded by admin/layout.tsx
  layout.tsx      fonts, metadata, providers, skip link
  globals.css     semantic tokens, motion profiles, base styles

src/components
  ui/             primitives: button, badge, input/select, dialog, popover,
                  tabs/accordion, toast, skeleton, controls
  store/          global shell: header, mega menu, mobile nav, search dialog,
                  cart drawer, compare tray, account menu, notifications,
                  role switcher, newsletter, footer
  workspace/      workspace shell (role gates + nav), PageHeader, Panel,
                  WorkspaceNote, metric and table helpers
  charts.tsx      accessible SVG charts (trend, bar list, donut, sparkline)
  product-*.tsx   product card, grid, original SVG product art
  still-life.tsx  editorial vector compositions
  reveal.tsx      motion-aware reveal/stagger wrappers
  providers.tsx   theme, toast, motion level, demo-store hydration

src/lib
  types.ts        authoritative domain contracts (money in cents)
  seed.ts         25 products, 7 sellers, 60 orders, audit seed, state v3
  store.ts        external demo store + all mutations
  catalog.ts      catalogue queries, filtering, pricing, stock
  comparison.ts   comparison row building and grouping
  analytics.ts    revenue series, status breakdown, seller scoping
  validations.ts  Zod schemas for checkout, product, seller, return forms
  api.ts          live transport + typed error, sessionStorage token
  hooks.ts        useCatalog, useSellers, useSessionOrders
  utils.ts        cn, formatMoney, initials, CSV download, dates
```

**Boundary rule:** routes compose features; features depend on `lib` and `components/ui`; `lib` never imports route files. Cross-surface behaviour changes once, in `store.ts` or `analytics.ts`, not per page.

## 3. Server/client boundary

- Every page is a Server Component that exports metadata and renders a client view component (`products/page.tsx` → `products-view.tsx`, `lab/page.tsx` → `lab-view.tsx`).
- The interactive view carries `"use client"` only where state, events or browser APIs are required.
- `RootLayout` is a Server Component; `Providers` is the single client boundary for theme, toast, motion and store hydration.
- No secrets, tokens or server-only environment values are imported into client modules. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_ATLAS_DATA_MODE` are the only public configuration values.

## 4. State architecture

```text
                     ┌────────────────────────────┐
                     │ AtlasState (version 3)     │
                     │ role, sellerId, cart,      │
                     │ wishlist, compare, orders, │
                     │ notifications, settings,   │
                     │ product/seller edits, audit│
                     └─────────────┬──────────────┘
                                   │
                 useSyncExternalStore(subscribe, getSnapshot)
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
   storefront views          workspace views             admin views
   cart, wishlist,           seller-scoped orders,       moderation, finance,
   compare, checkout         stock, earnings             analytics, policy
                                   │
                          localStorage v1 key
                          (demo persistence)
```

- **One external store** (`src/lib/store.ts`) for marketplace state that must survive navigation and reloads.
- **`localStorage` key** `ponnaloy.atlas.state.v1` with `version: 3`. Snapshots from older versions are discarded rather than migrated.
- **Hydration guard.** Any mutation hydrates saved state before applying, so a child mount effect cannot persist the seed snapshot over saved edits. This was a real regression, covered by `src/lib/store.test.ts`.
- **Ephemeral UI state** (open menus, drawer, filter drafts) stays local to components.
- **Catalogue filters** live in URL search params, so `/products?q=…&category=…` is shareable and back-button correct.
- **No global state for derived data.** `useCatalog()` applies seller/admin edits with `useMemo`; analytics are computed from the same orders the customer creates.

### Mutation contract

Every mutation returns `StoreResult` (`{ ok: true } | { ok: false, error }`). UI surfaces display the returned error rather than assuming success. Stock edits validate whole numbers, returns validate eligibility, and checkout validation runs through Zod before `placeOrder`.

### Cross-surface effects of one order

`placeOrder()` writes a single `Order` plus:

- a customer notification,
- a seller notification,
- an admin-visible ledger entry (the order itself),
- an audit entry.

The seller queue, admin orders page and customer order history all read the same record. Status changes from the seller workspace are immediately visible to the customer timeline and admin oversight.

## 5. Data-fetching strategy

| Mode | Behaviour |
| --- | --- |
| Demo (default) | Seed data + persisted local edits. Instant, deterministic, explicitly labelled. No network. |
| Live (`NEXT_PUBLIC_ATLAS_DATA_MODE=live`) | `src/lib/api.ts` calls the verified Fastify routes through a typed `request<T>()` wrapper with `ApiError`, bearer token and JSON handling. |

Live mode is **implemented but unverified** in this environment. MongoDB, Redis and Docker are unavailable, so no claim is made that the adapter works end-to-end. The demo layer is not a mock of the network; it is the product's explicit offline data source.

## 6. API integration

```text
products     GET  /api/products?limit=100
product      GET  /api/products/:slug
categories   GET  /api/categories
sellers      GET  /api/sellers
orders       GET  /api/orders
order        GET  /api/orders/:id
sign-in      POST /api/auth/sign-in
```

The adapter mirrors the baseline route names verified in `Ponnaloy-e-com/apps/api/src/routes`. It unwraps `{ data }`, surfaces `{ error, message, code }`, and keeps the token in `sessionStorage`. Production must replace this with httpOnly cookies or a BFF; that is documented as a limitation rather than hidden.

## 7. Role-aware navigation

```text
CUSTOMER     storefront, cart, checkout, own orders, wishlist, account
SELLER       storefront + /seller/* scoped to one demo studio
ADMIN        storefront + /admin/* operations
SUPER_ADMIN  modelled in the type system; no separate demo surface
```

- `src/components/workspace/shell.tsx` owns the allowed-role map and renders a **Role required** screen instead of the workspace when the current demo role is not permitted.
- Switching into a workspace through the preview control changes the demo role; it does not grant API permissions. The UI states this explicitly.
- Seller data is scoped by `sellerId` in `analytics.ts` and the seller pages, so Seller A never sees Seller B's orders in the demo.
- **Frontend gating is usability, not security.** The Fastify API must independently enforce RBAC/ABAC; the baseline already has a deny-by-default permission catalogue and seller middleware.

## 8. Error handling

- Zod validation for checkout, product editor, seller settings and return requests, with field-level messages wired to `aria-describedby`.
- `ApiError` carries HTTP status and API code in live mode.
- Store mutations return typed failures; UI shows a toast or inline error.
- Empty states are purposeful (`EmptyState` with a next action) rather than blank grids.
- Unknown routes render `src/app/not-found.tsx`.
- A product that is no longer present renders a recovery state in the product view rather than crashing.

## 9. Testing architecture

```text
Vitest (jsdom)         domain logic: catalog, cart, comparison, analytics,
                       validation; store hydration and versioning
Playwright (Chromium)  customer purchase, search, wishlist, compare, mobile shell,
                       role gates, moderation, policy propagation, lab motion
axe-core               WCAG A/AA scans on 14 states (serious/critical gate)
```

E2E runs against a **production build** (`next start`) to avoid first-compile timeouts and to test what ships. See `docs/TESTING.md`.

## 10. Performance strategy

- Original SVG artwork means the storefront hero and product cards make **no image requests**; layout is dimensioned by aspect-ratio containers.
- Fonts are self-hosted by `next/font` with preload and `display: swap`. The display fallback is intentionally unadjusted because the metric-adjusted fallback triggered a one-line headline change and a measured 0.116 CLS on the home page.
- Route-level code splitting is the default. The heaviest route is `/lab` (48.6 kB route JS), which is a developer surface; checkout is 33.3 kB because of form validation code.
- Charts are hand-built SVG/CSS with no chart runtime.
- Motion animates transform/opacity, uses `MotionConfig` to reduce or disable travel, and never blocks input or scrolling.
- Shared first-load JS is 103 kB; route bundles range from 141 kB to 219 kB first load.
- No polling, no timers for data refresh, no client-side waterfall in demo mode.

Measured lab numbers and limitations: `docs/PERFORMANCE.md`.
