# Senior frontend interview notes

Short, evidence-based answers for a hiring-panel review. Each answer points to code or a measured result.

---

## 1. "Walk me through the architecture."

Atlas is a Next.js 15 App Router app split into route composition (`src/app`), shared primitives (`src/components/ui`), global shells (`components/store`, `components/workspace`), and a domain layer (`src/lib`) of types, seed data, store, catalogue, comparison, analytics, validation and API transport.

Pages are Server Components that export metadata and render a client view only where interaction is required. There is one client provider boundary for theme, toast, motion and store hydration.

State is deliberately narrow: one external store for persisted marketplace state, local state for ephemeral UI, URL params for catalogue filters, and memoised derivations from the same orders. No second state library, no client-side secrets.

The backend was preserved: Atlas consumes the verified Fastify route shapes through a typed adapter, but runs on a labelled demo layer because MongoDB/Redis/Docker are unavailable here.

## 2. "What makes the motion technically challenging?"

Not the easing curves — the coordination:

- Three profiles drive both CSS (`html[data-motion]`) and Framer Motion (`MotionConfig`), including the OS preference as a default rather than a hard override.
- Overlays use Radix focus management; animation must not break focus restoration or leave a hidden focus target.
- Entrance animation must not create layout shift. The audit helper waits for animations to settle; the CLS work showed that font swap, not motion, was the real shift source.
- Reduced motion preserves feedback (opacity) while removing travel, rather than disabling the interaction.

The lab can replay the same specimen under each profile, so the contract is testable, not just described.

## 3. "How did you protect rendering performance?"

- Storefront art is inline SVG, so the hero and product cards make no image requests and cannot shift from image loading.
- Fonts are self-hosted and preloaded. I measured a font-swap CLS of **0.1165** on the home page, traced the `layout-shift` source to the display fallback wrapping the headline onto an extra line, disabled metric-adjusted fallback for that face, and re-measured **0.0033**. The lab hero needed a reserved two-line block for the same reason.
- Charts are hand-built SVG/CSS, avoiding a chart runtime.
- Route bundles are split; the shared first-load JS is **103 kB**, the heaviest route (`/lab`, a developer surface) is 48.6 kB route JS.
- Motion uses transform/opacity only; there are no scroll listeners for animation and no polling.

What I did **not** do: field CWV, throttled Lighthouse, or INP tracing. Those are listed as not tested.

## 4. "How is role-aware data isolated?"

Two layers:

- **UI:** `WorkspaceShell` owns the allowed-role map for seller/admin and renders a "Role required" state. Seller pages filter analytics and orders by the demo `sellerId`, so Seller A cannot read Seller B's rows in the demo.
- **Contract:** the UI states that preview is not authentication. The baseline Fastify API has deny-by-default permissions (`permissions.ts`) and seller middleware; production enforcement lives there, not in React.

The honest answer is that frontend gating is a usability feature. I would not sell it as a security boundary.

## 5. "How do you handle complex asynchronous state?"

In demo mode, operations are synchronous but follow the same contract: every mutation returns a typed `StoreResult`, and UI surfaces render the error rather than assuming success. Checkout runs Zod validation before creating an order. `placeOrder` writes one order plus customer/seller notifications and an audit entry, so every surface sees the same record.

The live adapter (`src/lib/api.ts`) wraps fetch with a typed `ApiError`, bearer handling, JSON serialisation and response unwrapping. It is implemented but not exercised against a running API — I do not claim otherwise.

For production I would add optimistic updates only where rollback is well-defined (wishlist, cart quantity), keep server mutations authoritative, and use React Query or server actions for cache invalidation rather than inventing a client cache.

## 6. "How did you test responsive and accessible interactions?"

- Playwright at 360 px asserts the mobile drawer opens and the page has no horizontal overflow.
- Dialog and quick-view tests verify variant selection, hidden state after close, and focus behaviour through Radix.
- Compare tests exercise difference mode, variant choice and removal; inventory tests exercise inline stock editing and invalid input.
- Fourteen axe scans gate serious/critical WCAG A/AA violations across storefront, lab, seller and admin states.
- Manual procedures cover keyboard traversal, focus restoration, screen-reader semantics, 200%/400% zoom, theme contrast and reduced motion.

The axe work found a real `label-content-name-mismatch` on the account trigger: the `aria-label` omitted the visible initials. The fix was to stop overriding the accessible name and add `sr-only` context. Hiding the initials from assistive tech did not satisfy the rule.

## 7. "What tradeoffs were necessary?"

| Tradeoff | Why |
| --- | --- |
| Demo layer instead of a running backend | Infrastructure unavailable; a fake "connected" claim would be dishonest |
| Standalone app instead of monorepo integration | Avoided a risky migration while preserving the baseline |
| `localStorage` demo state | Makes cross-role flows demonstrable without a database; explicitly resettable |
| `sessionStorage` bearer token in the live adapter | Narrower than `localStorage`, still not the httpOnly-cookie answer |
| Hand-built charts | Removes a heavy dependency and keeps token theming; fewer interactions |
| Chromium-only E2E | Fast, focused gate; cross-browser is a documented gap |
| `/lab` instead of Storybook | A real route using production components; less tooling |

## 8. "What would break first at scale?"

1. **Data layer.** `localStorage` and a single serialisable document do not survive multi-user concurrency. The first change is server data with proper cache invalidation.
2. **Admin tables.** They render all rows; at thousands of orders they need server-side pagination and virtualisation. In the demo, 60 orders do not justify that complexity.
3. **Auth.** Client token storage must become httpOnly cookies or a BFF; role checks must stay server-side.
4. **Charts.** Hand-built SVG is fine for dozens of points; a time-series brush/zoom product would justify a chart library or a canvas renderer.
5. **Media.** SVG art scales beautifully but is not a photography pipeline. A real catalogue needs responsive images, a CDN and art direction.
6. **Cross-browser.** Radix and CSS should port, but WebKit/Firefox are untested.

## 9. "What are you most and least happy with?"

**Most:** the storefront and workspace feel like one product while serving different densities, and the layout-shift investigation produced a real before/after (0.1165 → 0.0033) rather than a claimed score. The hydration and variant-merge bugs are also good examples of tests catching cross-surface state defects.

**Least:** the backend is not connected. The adapter is a promise, not evidence. I would not present Atlas as a deployed commerce system, and the documentation says so repeatedly.

## 10. "How would you take this to production in two weeks?"

- Days 1–3: run the API with MongoDB/Redis in Docker; replace demo reads with server data behind the existing hooks; verify auth and seller scoping.
- Days 4–6: httpOnly cookie sessions, CSRF strategy, server-side permission tests for seller A/B isolation.
- Days 7–8: Lighthouse CI with mobile throttling, INP traces for checkout and compare; fix the top three long tasks.
- Days 9–10: WebKit/Firefox Playwright projects; visual-regression baseline for `/lab` and key commerce states.
- Days 11–12: pagination/virtualisation for admin orders and customers; error/retry states for live failures.
- Days 13–14: deploy a preview, run field instrumentation (web-vitals), write the runbook and rollback plan.

---

## Resume-ready description

> **Ponnaloy Atlas — Commerce & Marketplace Frontend** — Designed and built a five-surface marketplace frontend (editorial storefront, product comparison studio, seller workspace, admin command centre, design/motion lab) in Next.js 15, React 19 and strict TypeScript. Created an original token-driven design system with light/dark themes and three motion profiles; implemented role-aware navigation, persisted cross-surface order state, accessible SVG charts and validated checkout. Verified with 43 domain tests, 38 production-build Playwright tests and 14 axe accessibility scans; traced and fixed a font-swap CLS defect from 0.1165 to 0.0033.

---

## 60-second summary

> "Atlas is a commerce frontend built as one system with two registers: an editorial storefront and an operations console. I preserved the existing Fastify/Prisma backend contract but could not run it here, so the app ships with an explicit demo layer and a typed live adapter that is not claimed as verified. The interesting engineering is in the state boundary — one versioned external store with hydration and variant-merge regressions covered by tests — and in the measured quality work: a production-build E2E suite, an axe gate that caught a real accessible-name bug, and a CLS investigation that took the home page from 0.1165 to 0.0033. The limitations are documented as clearly as the results."
