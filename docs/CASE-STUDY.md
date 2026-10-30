# Case study: building Ponnaloy Atlas

## The starting point

The existing Ponnaloy repository was a working pnpm/Turborepo marketplace: Next.js 15 storefront, Fastify + Prisma + MongoDB API, Stripe integration points, seller and admin routes, a deny-by-default permission catalogue, and 54 passing API tests. It was functional but conventional. The storefront looked like a marketplace template, seller surfaces were thin, there was no comparison experience, no cross-role story, no design-system reference, and no web-side test gate.

Two documented "known issues" turned out to be stale when verified: the API type-checks cleanly, and the admin dashboard now fetches `/api/admin/stats` rather than rendering hardcoded numbers. The token-in-`localStorage` issue was real, as was the lack of a frontend verification baseline.

**Constraint:** MongoDB, Redis and Docker were unavailable. The API could be read and type-checked, but not run end-to-end. Any honest build had to separate the verified API contract from an explicitly labelled demo data layer.

## The brief

Build five connected surfaces — storefront, exploration studio, command centre, connected journey, design lab — with one original design language, real interactions, role-aware navigation, accessible motion, measured quality, and portfolio-grade documentation. Do not rewrite the backend or pretend it is connected.

## Design problem

The hard part was not making one beautiful page. It was making an editorial luxury storefront and a dense operations console feel like the same product without making either compromise:

- The storefront needs large type, slow rhythm and quiet surfaces.
- The workspace needs compact type, visible status colour, tables and fast scanning.
- Both must share tokens, focus behaviour, radii, motion and voice.

The resolution was **two registers, one system**: the same semantic palette and type families, with a display register (`display-*`, Fraunces italic accents, generous spacing) for commerce storytelling and a utility register (Manrope at small sizes, mono labels, dense panels) for operations. Copper is reserved for editorial emphasis; teal carries action; status colours are never decorative.

A second design problem was **trust**. A demo marketplace that looks like it takes payments is a liability. Every relevant surface states that data is synthetic, checkout is prefilled with a test card and no payment is processed. The role switcher is framed as a preview, not authentication.

## Architecture decisions

### Preserve the backend contract, build a new frontend slice

Atlas is a standalone Next.js app that reuses the **verified domain shapes** (money in cents, order/payment/moderation statuses, seller scoping) rather than forking the monorepo. The baseline repository remains unmodified. This kept the audit honest and avoided a risky migration while the API could not run.

Tradeoff: Atlas is not wired into the monorepo build. A production integration would move the shared types into `packages/` and replace the demo store with server data.

### One external store, deliberately narrow

`src/lib/store.ts` owns marketplace state that must survive navigation: role, cart, wishlist, compare selection, orders, notifications, edits, settings and audit. It uses `useSyncExternalStore` with a versioned `localStorage` snapshot. Ephemeral UI state stays local; filters live in the URL.

No Redux/Zustand was added. The state is a single serialisable marketplace document; an external store with explicit mutations is enough and keeps reads synchronous.

### Demo state is versioned, and hydration is guarded

Two real bugs surfaced during E2E work:

1. **Seed snapshot clobbered saved state.** A child mount effect could mutate before the store hydrated. `setState()` now hydrates first. `store.test.ts` seeds storage, mutates immediately, and asserts saved role and sibling variants survive.
2. **Variant edits reverted siblings.** `updateStock` merged against the seed product. It now merges against the edited variant array. An E2E proves the storefront reflects the edit, and a unit test locks the merge behaviour.

These are the kind of defects that only appear when persistence and cross-surface reads are exercised together.

### Role gating at the shell, with an explicit forbidden state

`WorkspaceShell` owns the allowed-role map for seller and admin, renders a "Role required" explanation instead of a broken page, and provides a preview action. Seller analytics and queues are scoped by `sellerId`. The UI repeats that preview is not a security boundary; the API remains authoritative.

### Accessible charts without a chart library

`src/components/charts.tsx` implements trend lines, bar lists, donuts and sparklines in SVG/CSS. Each chart has a text summary and a data-table alternative. This avoids a heavy runtime and keeps charts themeable with tokens. Tradeoff: no zoom/brush interactions; those were not needed for the demo datasets.

### Motion as a contract, not decoration

Three persisted profiles (`full`, `reduced`, `minimal`) drive both CSS (`data-motion`) and Framer Motion (`MotionConfig`). The OS preference selects `reduced` by default when the user has not chosen. Entrances animate transform/opacity only. The lab can replay the same specimen under each profile, which makes the contract reviewable rather than implicit.

## Accessibility work

The axe gate started at 13 failures, all the same rule: `label-content-name-mismatch` on the account trigger. The trigger had an `aria-label` ("Amara account menu…") that omitted the visible initials "AO". Hiding the initials from assistive tech did not satisfy the rule because the visible text still existed.

The fix was structural: remove the overriding `aria-label`, keep the visible initials and first name, and add an `sr-only` sentence for role/session context. The accessible name now contains the visible text. A separate search-trigger mismatch (visible `Search ⌘K`, label `Search`) was fixed the same way.

Automated scans then exposed a transient contrast failure on `/lab`: axe sampled a 10 px label mid-fade at 0.55 opacity. Rather than darkening the settled colour (which already passed), the audit helper now waits for entrance animations to settle. Motion remains covered by dedicated tests. This is a deliberate distinction between a painted frame and the readable interface.

Manual keyboard, screen-reader-oriented, zoom and reduced-motion procedures are documented in `docs/TESTING.md`.

## Performance work

The production build was measured with a checked-in Playwright script. The first run found **CLS 0.1165** on the desktop home page. Tracing `layout-shift` sources showed the cause: the metric-adjusted Fraunces fallback wrapped the hero headline onto three lines; when Fraunces loaded, it became two lines, the hero shrank and the page below moved 64 px.

Two changes fixed it:

- Disable `adjustFontFallback` for the display face. The unadjusted serif fallback wraps like Fraunces at display sizes.
- Reserve two lines on the lab hero heading, where the fallback rendered one line and the loaded face two.

After: home CLS **0.0033**, lab **0.0282**. LCP in the local lab run ranged 184–652 ms; INP and field CWV are **not measured**. These are lab results, not p75 field data.

Other decisions: no storefront photography (inline SVG art), no chart runtime, route-level splitting, transform/opacity motion only, no polling.

## Testing strategy

- **Vitest** covers pure domain logic and the two store regressions. 43 tests.
- **Playwright** covers the purchase journey, search, wishlist, compare, mobile shell, role boundaries, moderation, policy propagation, inventory persistence and lab motion. 38 tests against a production build.
- **axe** gates 14 states on serious/critical violations.
- Manual procedures cover what automation cannot: keyboard traversal, focus restoration, screen-reader semantics, 200%/400% zoom, theme contrast and motion preferences.

The suite is intentionally journey-focused. Component-render tests, visual regression and cross-browser runs are documented gaps, not implied coverage.

## Tradeoffs

| Decision | Cost |
| --- | --- |
| Demo data layer instead of running the API | No verified end-to-end integration; adapter is implemented but unexercised |
| Standalone app rather than monorepo integration | Duplicated contract types until a shared package is extracted |
| `localStorage` demo persistence | Not a production session model; explicit reset is required |
| `sessionStorage` token in the live adapter | Narrower than `localStorage`, still not httpOnly |
| Original SVG art | No photographic realism or CDN image pipeline |
| Hand-built charts | Fewer chart interactions than a library |
| `/lab` instead of Storybook | Less tooling, but a real route using production components |
| Chromium-only E2E | Cross-browser behaviour unverified |

## What I would do next

1. Run the API with MongoDB/Redis in Docker and replace the demo adapter with server data behind the same typed hooks.
2. Move tokens/types into a shared package and integrate Atlas into the Turbo pipeline.
3. Add httpOnly cookie auth at the API edge and remove client token storage.
4. Add Lighthouse CI with mobile throttling and an INP interaction trace for checkout and compare.
5. Add WebKit/Firefox projects to Playwright and a small visual-regression baseline for the design system.
6. Virtualise admin tables only when real data volume justifies it.

## What this project demonstrates

Original art direction with a documented token system; strict TypeScript across domain, state and UI; a persisted state layer with regression tests; role-aware shells and honest security boundaries; accessible charts and overlays; measured layout-shift debugging with a before/after; a production-build E2E suite and an axe gate; and documentation that separates what was verified from what was not.
