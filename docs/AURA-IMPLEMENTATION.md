# Ponnaloy Aura - frontend audit and implementation record

Audit date: 31 October 2026. Scope: this Atlas checkout. Existing uncommitted Aura work was present on arrival and preserved. `docs/AUDIT.md` concerns the separate original Ponnaloy repository; its findings are not a baseline for this checkout.

## A. Source-based audit

- **Stack:** package.json pins Next 15.5.20; React 19, Tailwind 3.4, Framer Motion 11, next-themes 0.4 and Radix primitives are already integrated. No additional dependency is required.
- **Design system:** globals.css and tailwind.config.ts already define HSL semantic aliases, ivory/forest surfaces, teal actions, copper accents, chart colors, typography, elevation and timing. Refine this system rather than replace it.
- **Theme:** providers.tsx has one next-themes provider using the root class, system default and `ponnaloy.atlas.theme` persistence. Root layout suppresses expected root theme hydration differences. theme-switcher.tsx uses a neutral server icon and pressed buttons in a Radix popover. Header/footer/mobile/workspace already reuse it. Account duplicated Light/Dark controls and omitted System: replaced with the shared control.
- **Shared components:** ui button/input/controls/dialog/popover/toast/tabs/skeleton; product card/grid/art; section heading/reveal; store header/footer/mobile navigation/cart/search; workspace shell/UI and charts.
- **Motion inventory:** IntersectionObserver Reveal and Stagger; MotionConfig; Framer Motion header/menu/cart interactions; CSS hover lift, image scale, icon transitions, accordion animation and shimmer. Stored full motion previously configured `never`, overriding device reduction. Reveal respected the device but omitted custom motion profiles. Both are corrected.
- **Color inconsistencies:** white foreground on teal selections and avatars lost contrast when teal became luminous in dark mode. Corrected to primary-foreground across customer, seller and admin surfaces; notification counters use accent-foreground. Product illustration palette values are data-driven artwork, not interface tokens.
- **Responsive risks:** account preference rows competed for width at 320px. Stack them before sm; make appearance full width on mobile. Shared tab lists now scroll and triggers do not shrink. Coarse pointer controls get 44px targets; form inputs use at least 16px to avoid focus zoom.
- **Accessibility risks:** reduction must remain effective with saved full motion; hidden entrance content must reveal immediately under reduced profiles. Fixed in provider, Reveal and CSS. Radix focus/keyboard contracts preserved. Existing focus-ring, skip link, form error and disabled styles retained. Automated axe coverage does not prove full WCAG conformance.
- **Performance risks:** reveal delays previously grew with list length; capped at 300ms and removed for reduced motion. CSS transform/opacity retained. Removed ambiguous arbitrary duration utilities from product/home imagery. Existing generated SVG artwork avoids new image downloads. No Core Web Vitals claim without a measured report.
- **Functional boundary:** checkout, cart mutations, API adapter, authentication, role gates, seed sources, validation schemas and payment/order logic retained. Atlas already has an explicit demo data layer; this work does not introduce a replacement data source.

Priority roadmap: P0 preserve/audit tokens and provider; P1 unify preference controls and contrast across shared/route controls; P2 repair motion and narrow layouts; P3 run production, browser regression, axe and performance checks. Further visual changes should follow observed QA evidence rather than rewrite functioning pages.

## B. Design blueprint

| Role | Light | Dark | Mapping |
|---|---|---|---|
| Canvas | ivory, near #F8FAF9 | midnight forest, near #0C1413 | canvas/background |
| Surface | pale sage | forest | surface/secondary/muted |
| Raised | white | elevated forest | surface-raised/card/popover |
| Text | deep green | pale mint | ink/foreground |
| Supporting text | muted green | desaturated sage | ink-soft/muted-foreground |
| Brand | deep teal | luminous teal | teal/primary |
| Action text | white | midnight teal | primary-foreground |
| Accent | readable copper | warm apricot | copper/accent |
| Boundaries | sage gray | forest gray | line/border, line-strong/input |
| Feedback | semantic green/amber/red/blue | brighter semantic variants | success/warning/danger/info |
| Other | theme-specific | theme-specific | ring, skeleton, overlay, shadow-color, chart-1?5 |

Actual HSL definitions in globals.css are authoritative. Primary hover and foreground are separate tokens; do not assume white text works on all brand colors. Deep editorial panels use deep/deep-foreground/deep-muted in both appearances.

Typography: retain Fraunces display, Manrope interface and IBM Plex Mono metadata through next/font. Fluid display sizing, compact uppercase eyebrows, relaxed supporting text and tabular metrics. Spacing: 4px-based rhythm, 16?24px panel padding, responsive container gutters and 1480px maximum. Elevation: whisper for resting panels, lift for overlays/hover; restrained 10?12px card radii and soft semantic borders.

Variants: existing button variants, input validation/disabled states, badge status tones, standard/compact/featured/horizontal/deal/related product cards. Preserve props and store operations. Motion: 160ms interactions, 260ms controls/overlays, 520ms section/image transitions, 55ms card staggering capped at 300ms; ease-atlas and ease-entrance. Device reduction always wins; custom reduced/minimal profiles reveal immediately.

Theme control: Light/Dark/System, shared selected state, labelled trigger, neutral hydration icon, persistent next-themes storage, 180ms user-triggered color transition and native color-scheme. No duplicate providers. Responsive contract: 320/360/390/768/1024/1440/wide, scroll dense tables/tabs, stack preference rows, coarse-pointer targets, safe areas from existing shell.

Accessibility: visible keyboard focus, semantic labels, Radix focus restoration, pressed selections, readable surface/foreground pairs, no hover-only essential actions, device motion preference. Browser tests and axe establish bounded evidence, not universal conformance.

## C. Component upgrade matrix

| Component | Classification/current issue | Enhancement | Motion | Light/Dark | Files |
|---|---|---|---|---|---|
| Tokens/type/elevation | Preserve existing Aura system | Retain semantic palette; use correct foreground pairs | Shared CSS timings | Explicit palettes | app/globals.css; tailwind.config.ts; app/layout.tsx |
| Theme engine/control | Refine duplicate account control | Reuse Light/Dark/System; storage resilience | Short color/icon changes | Shared selection | components/providers.tsx; theme-switcher.tsx; app/(store)/account/page.tsx |
| Reveal/Stagger | Refine profile override and long delays | Device preference wins; immediate reduced reveal; cap delay | Intersection observer + CSS | Neutral | components/reveal.tsx |
| Button/badge/input/checkbox/switch | Preserve/restyle foregrounds | Semantic foreground; coarse-pointer sizing | Existing feedback | Token driven | components/ui; app/globals.css |
| Tabs/accordion | Refine narrow tab strips | Scrollable list; nonshrinking triggers; disabled states | Retain accordion timing | Token driven | components/ui/tabs.tsx |
| Dialog/sheet/popover/tooltip/toast | Preserve existing Aura refinements | Keep Radix keyboard/focus behavior | Existing CSS entrance/exit | Token surfaces | components/ui |
| Header/nav/announcement | Preserve existing Aura refinement | Keep active links, dismiss and responsive drawer | Existing menu choreography | Token surfaces | components/store/header.tsx; mobile-nav.tsx |
| Footer/newsletter | Preserve existing Aura refinement | Retain groups/form and shared appearance | Existing control feedback | Deep surface | components/store/footer.tsx; newsletter.tsx |
| Product card/grid | Refine existing variants | Preserve actions; unambiguous image timing | Shared slow image transition | Semantic cards | components/product-card.tsx; product-grid.tsx |
| Section heading/home | Preserve/refine existing composition | Keep data and editorial hierarchy; image timing | Reveal and CSS | Existing tokens | section-heading.tsx; app/(store)/page.tsx |
| Account/search/notifications | Restyle/refine | Contrast-safe avatars/counts; unified preferences | Existing feedback | Correct foreground pairing | store/account-menu.tsx; search-dialog.tsx; notifications.tsx; account/page.tsx |
| Dashboard shell/KPIs/tables/charts | Preserve existing Aura foundation | Retain shared header, panels, metric styles and chart tokens | Existing CSS | Shared theme | components/workspace; charts.tsx |
| Seller/admin filter and status controls | Restyle white-on-bright selections | Primary foreground pairing | Existing hover/selection | Corrected dark contrast | app/seller; app/admin |

All main route files are inventoried below. ?Preserve shared system? means the page retains its structure and receives tokens/primitives; it is not a claim of individual visual redesign or browser verification.

| Page | Treatment | Theme/motion source | File |
|---|---|---|---|
| (store)/account | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/account/page.tsx` |
| (store)/cart | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/cart/page.tsx` |
| (store)/checkout | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/checkout/page.tsx` |
| (store)/collections/[slug] | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/collections/[slug]/page.tsx` |
| (store)/collections | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/collections/page.tsx` |
| (store)/compare | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/compare/page.tsx` |
| (store)/help | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/help/page.tsx` |
| (store)/journey | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/journey/page.tsx` |
| (store)/lab | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/lab/page.tsx` |
| (store)/orders/[id] | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/orders/[id]/page.tsx` |
| (store)/orders | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/orders/page.tsx` |
| (store) | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/page.tsx` |
| (store)/product/[slug] | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/product/[slug]/page.tsx` |
| (store)/products | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/products/page.tsx` |
| (store)/sellers/[slug] | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/sellers/[slug]/page.tsx` |
| (store)/sellers | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/sellers/page.tsx` |
| (store)/sign-in | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/sign-in/page.tsx` |
| (store)/wishlist | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/(store)/wishlist/page.tsx` |
| admin/analytics | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/analytics/page.tsx` |
| admin/audit | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/audit/page.tsx` |
| admin/customers | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/customers/page.tsx` |
| admin/finance | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/finance/page.tsx` |
| admin/merchandising | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/merchandising/page.tsx` |
| admin/moderation | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/moderation/page.tsx` |
| admin/orders | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/orders/page.tsx` |
| admin | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/page.tsx` |
| admin/products | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/products/page.tsx` |
| admin/sellers | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/sellers/page.tsx` |
| admin/settings | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/admin/settings/page.tsx` |
| seller/analytics | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/analytics/page.tsx` |
| seller/earnings | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/earnings/page.tsx` |
| seller/inventory | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/inventory/page.tsx` |
| seller/orders | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/orders/page.tsx` |
| seller | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/page.tsx` |
| seller/products | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/products/page.tsx` |
| seller/settings | Preserve shared system; refine selection contrast where used | globals/provider/shared components | `src/app/seller/settings/page.tsx` |

## D. Development batches

**Batch 1 - shared appearance and route controls.** Components enhanced: account appearance, avatars, notification badges, catalogue filters, seller/admin filters and selected states. Files: account page, store account-menu/notifications/search-dialog and route controls listed in git diff. Design/theme: semantic foreground pairing; shared System option. Animations: retain shared switcher transitions. Responsive: preferences stack before sm. Accessibility: pressed selections and labels retained. Business operations unchanged.

**Batch 2 - motion and responsive primitives.** Components enhanced: provider, Reveal, tabs, coarse-pointer controls, home/product image transitions. Files: providers.tsx, reveal.tsx, ui/tabs.tsx, globals.css, product-card.tsx, store page. Design/theme: existing identity retained. Animations: respect device reduction even with saved full profile; custom reduced/minimal reveals visible; capped staggering. Responsive: scrollable tabs, touch targets, mobile input size. Accessibility: disabled tabs and immediate reduced-motion content. Tests/results recorded in validation section after execution.

**Batch 3 - evidence-driven contrast and layout repairs.** Components enhanced: copper and success badges, deep footer surface, header account label, product detail gallery and purchase price. Files: globals.css, store/account-menu.tsx, product/[slug]/product-view.tsx. Design/theme: darker light-theme copper/success tones and independent deep editorial surface. Animations: unchanged. Responsive: account label reserved for xl; product grid children can shrink and gallery caption wraps. Accessibility: full-opacity purchase price; measured axe failures drive token changes. Initial QA found these issues; final checks below supersede those failures.

## E. Validation

See final validation entries appended after checks. Untested visuals and performance must not be interpreted as passing.

### Verification scope and limits

The initial browser run identified light-theme badge/footer contrast, tablet header width, product purchase-price contrast and narrow product-grid overflow. These are repaired in the final source. Keep the latest completed results below as authoritative; interrupted builds/test runs do not establish a pass.

Automated coverage includes representative customer pages and role-preview dashboards, checkout/cart, wishlist, search, comparison, inventory, moderation, finance returns and merchandising. Full human screen-reader review, every page/state at every viewport, and screenshot-baseline regression comparison are outside the executed checks. Existing demo behavior remains the regression baseline; no live backend/payment verification is claimed.

### Performance evidence

Final production build, headless Chromium, localhost, unthrottled CPU/network, cold context per route/profile. Concurrent local QA can affect timing. Six routes at desktop 1440px and mobile 390px: LCP 188-824ms; CLS 0-0.0346. All sampled LCP/CLS values meet the requested numeric targets in this lab configuration. This is not field/p75 evidence, and INP was NOT TESTED. Raw measurements: `artifacts/aura/performance.tsv`. Responsive overflow report: `artifacts/aura/responsive.json` (28 cases, 4 routes x 7 widths; zero overflow).

Additional preserved shared components: BrandMark/Wordmark, ProductArt/StillLifeArt, Rating, OrderStatus, EmptyState, skeleton text, role switcher and cart drawer. Their existing public interfaces and operations remain unchanged; palette and primitives propagate where consumed. No replacement or recomposition was necessary for these components.

### Final validation matrix

| Check | Status | Evidence / limitation |
|---|---|---|
| Light theme | PASS | Four explicit theme axe checks plus existing storefront axe coverage |
| Dark theme | PASS | Home/catalogue/account/checkout axe checks; home screenshot inspected |
| System theme | PASS | Device appearance changes update selected System mode |
| Theme persistence | PASS | Dark selection survives reload |
| Initial render/hydration | PASS | Neutral initial icon and root theme suppression retained; no page errors on eight explicit theme-route checks. No exhaustive hydration console audit |
| Global component consistency | PASS | Shared semantic colors/foregrounds and theme control; all shared components inventoried |
| Homepage visual quality | PASS | Light/dark screenshots inspected; source composition preserved |
| Product card behavior | PASS | Quick view variants/add-to-bag, wishlist, comparison and merchandising regression tests |
| Navigation | PASS | Desktop links, keyboard search, mobile menu and workspace role-boundary tests |
| Forms | PASS | Checkout, inventory validation and workspace settings regression tests |
| Overlays | PASS | Quick-view axe and customer/detail/confirmation/search dialog interaction tests |
| Dashboards | PASS | Role gates, settings, moderation, finance, inventory and axe tests on sampled routes |
| Mobile responsiveness | PASS | Account/product at seven widths; 28 storefront overflow checks, all zero; mobile navigation test. All pages/states not exhaustively inspected |
| Reduced-motion behavior | PASS | Device reduced preference wins over stored full; profile persistence/replay tests |
| Keyboard accessibility | PASS | Tested keyboard search, Escape dismissal, existing Radix behavior and axe checks. Full keyboard/screen-reader audit NOT TESTED |
| Visual regressions | NOT TESTED | No baseline screenshot comparison suite; representative screenshots inspected |
| TypeScript | PASS | tsc --noEmit; production type checking |
| Production build | PASS | Final Next 15.5.20 build; 35 static pages generated; built-in lint/type checks passed |
| Performance measurements | PASS | LCP/CLS lab measurements recorded above; INP and field data NOT TESTED |
| Existing functionality regression checks | PASS | 55/55 Playwright tests and 43/43 unit tests; existing demo functionality only |

Commands executed: `node node_modules/typescript/bin/tsc --noEmit`; `node node_modules/vitest/vitest.mjs run`; `node node_modules/next/dist/bin/next build`; `node node_modules/@playwright/test/cli.js test --workers=2 --reporter=list`; existing `scripts/measure-vitals.mjs`; `git diff --check`. Browser log: `artifacts/aura/browser-results.txt`. Windows PowerShell reported a native stderr warning from Playwright's NO_COLOR/FORCE_COLOR environment combination; the runner completed with **55 passed (1.4m)**. Baseline-free screenshot and field performance limits remain as stated.

No additional libraries, backend changes, database changes, authentication replacements or payment changes were introduced. Existing working-tree edits were retained. This is a refinement of the existing Aura foundation, not a claim that every route was individually recomposed.
