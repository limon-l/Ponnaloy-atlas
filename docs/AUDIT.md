# Baseline audit — original Ponnaloy repository

**Audited repository:** `C:\All Files\Lab\Web Development\Projects\codealpha\Ponnaloy-e-com` (unmodified)
**Audit date:** 30 October 2026
**Method:** source inspection plus fresh `tsc --noEmit` and API test runs. The repository's running web/API processes were left untouched.

> This audit distinguishes **verified findings** from **documented claims**. Two of the project's documented issues were no longer true when checked.

---

## 1. Existing architecture (verified)

Ponnaloy is a pnpm + Turborepo monorepo:

```text
apps/web    Next.js 15 App Router storefront, seller and admin surfaces
apps/api    Fastify + Prisma + MongoDB API, Redis and Meilisearch integrations
packages/   shared packages
```

Evidence:

- `package.json` — `turbo dev --filter=@ponnaloy/web --filter=@ponnaloy/api`, `db:*` scripts, `docker:up`
- `apps/web/src/app/(shop)/*` — 20 storefront routes including product detail, sellers, cart, checkout and policy pages
- `apps/web/src/app/(auth)/*` — sign-in, sign-up, forgot/reset password
- `apps/web/src/app/seller/*` — overview, products, orders, analytics, storefront, apply
- `apps/web/src/app/admin/*` — overview, products, orders, moderation, sellers, customers, analytics, banners, categories, settings
- `apps/api/src/routes/*` — 27 route modules (`auth`, `products`, `cart`, `orders`, `payments`, `seller`, `admin`, `upload`, `search`, `wishlist`, `notifications`, `webhooks`, …)
- `apps/api/src/lib/permissions.ts` — deny-by-default `resource:action:scope` permission catalogue
- `apps/api/src/middleware/auth.ts`, `middleware/seller.ts` — token verification and seller scoping
- `apps/api/prisma/schema.prisma` — users, sellers, products, variants, orders, order items, payments, coupons, banners, notifications

### Verified quality baseline

| Check | Command | Result |
| --- | --- | --- |
| API type check | `pnpm --filter @ponnaloy/api typecheck` | **PASS** |
| Web type check | `pnpm --filter @ponnaloy/web typecheck` | **PASS** |
| API tests | `pnpm --filter @ponnaloy/api test` | **PASS** — 5 files, 54 tests |
| Web build | not run | **NOT TESTED** — a web server was already running against `.next`; a build would have invalidated it |

The documented "API TypeScript diagnostics" issue is **resolved** in the current source. It should not be repeated as an open defect without re-verification.

---

## 2. Verified functional features

- **Authentication** — sign-in, sign-up, password reset routes; `AuthProvider` restores a session from storage; Fastify `requireAuth` middleware protects account routes.
- **Catalogue** — product listing/detail, categories, collections, brands, reviews, search (Meilisearch integration point), coupons.
- **Commerce** — cart, wishlist, addresses, checkout, orders, notifications, newsletter.
- **Payments** — Stripe is integrated conditionally (`apps/api/src/lib/stripe.ts`, `routes/payments.ts`, `routes/webhooks.ts`). The API creates a hosted Checkout Session and resolves order ownership/amount from the database rather than the request body.
- **Seller** — application flow, own products, own orders, storefront and analytics routes, seller middleware and permission constants.
- **Admin** — dashboard stats endpoint (`/api/admin/stats`), products, orders, moderation, sellers, customers, banners, categories, analytics, settings.
- **Uploads** — `routes/upload.ts` + `lib/storage.ts` validate MIME type and a 10 MB limit and write to a configurable local directory behind an HTTP API; the storage driver is deliberately separable from the route.
- **Accessibility/quality foundation** — semantic components, focus styles, reduced-motion utilities in the web app, Playwright configured in `apps/web/playwright.config.ts`.

### Documented issues re-checked

| Documented issue | Verified status |
| --- | --- |
| Database connectivity | **Not verifiable here.** MongoDB/Redis/Docker are not installed in this environment. The code paths exist; runtime connection is unverified. |
| API TypeScript diagnostics | **Resolved.** `tsc --noEmit` passes for `apps/api`. |
| Hardcoded admin dashboard | **Resolved in the current source.** `apps/web/src/app/admin/page.tsx` calls `/api/admin/stats` and renders loading/error states. |
| Token storage security | **Still present.** `apps/web/src/contexts/auth-context.tsx` stores the bearer token and user in `localStorage` (`ponnaloy_token`, `ponnaloy_user`), widening the XSS persistence window. |
| Placeholder image uploads | **Not a placeholder.** `apps/api/src/lib/storage.ts` performs real disk writes with MIME/size validation and a documented path to object storage. |
| Incomplete financial integrations | **Partially verified.** Stripe integration and webhook route exist; they cannot be exercised without credentials and a reachable database. Treat as unverified, not as broken. |

---

## 3. Reusable modules

- Permission catalogue and middleware (`permissions.ts`, `middleware/auth.ts`, `middleware/seller.ts`) — the strongest reusable backend contract.
- Prisma schema and shared types (`packages/`, `apps/web/src/types`).
- Web UI primitives and layout components under `apps/web/src/components`.
- Playwright configuration and e2e folder in the web app.

These were **reused as contracts and reference**, not copied wholesale. Atlas deliberately keeps the original repository untouched.

---

## 4. Current visual design (baseline)

- shadcn-style component vocabulary: cards, buttons, inputs, dialogs, skeletons.
- Standard marketplace hierarchy: hero, category strips, product grids, promotional banners.
- Functional admin tables and cards; seller pages are thinner than admin.
- Typography and spacing are conventional rather than a documented design system.

**Assessment:** serviceable and consistent enough to preserve, but not distinctive. It lacks an editorial voice, a motion language, a comparison experience, and a documented token system with contrast evidence.

---

## 5. UI/UX weaknesses (verified by inspection)

1. No product comparison experience; comparison is a missing signature interaction.
2. No connected, cross-role story. Customer, seller and admin surfaces do not visibly share one order narrative.
3. Seller surfaces expose only basic CRUD/analytics; no inventory thresholds, settlement view or commission context.
4. Admin navigation is broad but not organised around an operations model (moderation → orders → finance → audit).
5. Empty/error/loading states exist in places but are not systematic across surfaces.
6. No design-system reference page; component behaviour and states are undocumented.
7. No command search or keyboard-first navigation across the marketplace.
8. No motion specification, reduced-motion profile or motion QA.

---

## 6. Animation gaps

- No shared duration/easing tokens.
- No entrance choreography or stagger system; transitions are utility-level.
- No explicit reduced-motion strategy beyond incidental CSS.
- No chart or number animation.
- No documented motion purpose or performance review.

---

## 7. Responsive gaps

- Desktop-first admin tables with limited mobile strategy.
- Seller navigation and dense tables not designed for narrow viewports.
- No tested 320 px contract, no documented safe-area or text-zoom behaviour.
- Product discovery relies on conventional grids; filters are not URL-synchronised drawers on mobile.

---

## 8. Accessibility risks

- Icon-only controls without a consistency guarantee.
- Focus restoration across dialogs/drawers not systematically verified.
- Charts and data visualisations (where present) lack accessible summaries.
- Contrast is not documented per token.
- `localStorage` bearer tokens increase the impact of any XSS.

---

## 9. Performance risks

- No bundle budget or analysis.
- No image strategy for responsive art direction (baseline uses remote images).
- No explicit server/client boundary policy; client components can pull large dependency graphs.
- No measurement of LCP/CLS/INP, no throttled mobile profile.
- Meilisearch/Redis integration points can hide request waterfalls if used per-component.

---

## 10. Backend integration issues

- Frontend cannot be exercised against the API here: no MongoDB, Redis or Docker.
- Auth token storage is client-readable.
- Role checks exist on the server, but the web client's role-aware rendering is not uniformly centralised.
- Stripe/webhook paths require credentials and a database; unverified at runtime.
- Upload storage is single-instance local disk unless an object-storage driver is supplied.

---

## 11. Missing tests

- No web unit/component test script in `apps/web/package.json`.
- E2E suite exists but could not be run without a database-backed API.
- No accessibility automation gate.
- No visual regression or performance budget enforcement.
- No tests for seller/admin permission isolation at the UI boundary.

---

## 12. Critical fixes and decisions carried into Atlas

1. **Do not rewrite the API or Prisma schema.** Atlas consumes the verified route shapes as contracts and documents the mapping; it does not pretend the backend is connected.
2. **Make demo mode explicit.** Every surface states that data is synthetic and no payment is processed.
3. **Do not repeat stale audit claims.** The admin dashboard and API type checks were re-verified before being reported.
4. **Treat tokens as a security boundary.** Atlas keeps demo tokens in `sessionStorage` (narrower persistence) and documents the httpOnly-cookie requirement.
5. **Centralise role-aware navigation.** One workspace shell owns role gates and forbidden states.
6. **Establish a real design system and motion contract.** Semantic tokens, contrast-checked colours, three motion profiles, and a living `/lab` reference.
7. **Verify with automation.** Strict TypeScript, lint, unit tests, a production-build E2E suite and an axe gate.

---

## 13. Recommended development strategy (executed)

| Phase | Decision |
| --- | --- |
| 00 | Audit baseline; preserve repository; record verified vs documented |
| 01 | Stabilise the new app: strict TS, ESLint, Vitest, Playwright |
| 02–03 | Token system, primitives, global shell, themes, motion provider |
| 04–07 | Storefront, discovery, comparison studio, customer commerce |
| 08–10 | Seller and admin workspaces, connected journey, role gates |
| 11–13 | Motion polish, lab, accessible charts |
| 14–15 | Axe scans, CLS/font correction, E2E regression |
| 16 | Documentation, measured performance report, portfolio package |

**Known strategic limitation:** because the backend cannot run here, Atlas is a **frontend vertical slice with a verified adapter and an explicit demo layer**, not a deployed commerce system. That limitation is stated in the README, the case study, and the release report.
