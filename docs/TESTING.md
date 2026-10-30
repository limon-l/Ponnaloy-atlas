# Testing and quality engineering

## Verification commands

```bash
pnpm typecheck      # tsc --noEmit, strict
pnpm lint           # next lint (ESLint)
pnpm test           # Vitest, 6 files / 43 tests
pnpm build          # production build, 37 routes
pnpm e2e:ci         # build + Playwright against `next start`
pnpm e2e            # Playwright against an existing server on :3000
```

Playwright is configured with `reuseExistingServer: true` locally and `webServer.command = "pnpm start"`, so the suite exercises the **production build**, not the dev server. This avoids first-compile timeouts and catches production-only behaviour. CI should use `pnpm e2e:ci` with a clean `.next`.

Current results (measured in this environment):

| Gate | Result |
| --- | --- |
| TypeScript | PASS — no errors |
| ESLint | PASS — no warnings or errors |
| Vitest | PASS — 6 files, 43 tests |
| Next build | PASS — 35 static pages / 37 routes |
| Playwright | PASS — 38 tests, Chromium |
| axe serious/critical | PASS — 14 scans |

---

## Unit and domain tests (Vitest + jsdom)

| File | Tests | Covers |
| --- | ---: | --- |
| `src/lib/catalog.test.ts` | 12 | filtering, search, price/stock resolution, discount, related products, seller scoping |
| `src/lib/cart.test.ts` | 8 | line merging, quantity changes, totals, coupon application, commission-ready line prices |
| `src/lib/comparison.test.ts` | 5 | comparison rows, difference detection, grouping, limits |
| `src/lib/analytics.test.ts` | 8 | revenue series, status breakdown, seller-scoped analytics, date windows |
| `src/lib/validations.test.ts` | 8 | checkout, product editor, seller policy and return schemas |
| `src/lib/store.test.ts` | 2 | hydration-before-mutation regression; stale state-version rejection |

### Regressions these tests lock down

1. **Saved demo state was being clobbered.** A product-page mount effect (`recordView`) could run before the store hydration effect; the first mutation persisted the seed snapshot over saved edits. Fix: `setState()` hydrates before applying any mutation. The test seeds `localStorage`, calls `updateStock` before hydration, and asserts the saved sibling variant and role survive.
2. **Variant stock edits reverted siblings.** `updateStock` merged against the seed product instead of the edited variant list, so changing Graphite reverted Sand and Moss. Fix: merge against `current.productEdits[productId]?.variants ?? product.variants`. The persistence E2E now verifies the storefront reflects the edited stock.
3. **Invalid stock accepted.** The store now rejects non-integer or negative values and the UI surfaces the error.

---

## End-to-end tests (Playwright, Chromium)

### `e2e/storefront.spec.ts` — customer commerce

- Home renders the editorial hero and primary navigation.
- Catalogue search filters to a known object.
- Add to bag → checkout → order confirmation → order detail.
- Compare tray reaches `/compare` with two objects.
- Wishlist survives a reload.
- Search dialog opens from `⌘K` / `Ctrl+K`.
- Mobile header opens the drawer and the page has no horizontal overflow at 360 px.

### `e2e/experience.spec.ts` — exploration and operations

- Quick view switches variant and adds the selected option (variant stock reflected in the dialog).
- Comparison difference-only mode and variant-specific add-to-cart.
- Empty comparison offers a starting pair.
- Previewing the seller workspace does not unlock the admin workspace.
- Inline stock edit persists and changes storefront availability.
- Invalid stock is rejected without mutating the catalogue.
- Admin customer directory searches, filters, opens a detail panel, and exports the filtered rows as CSV.
- A customer return is approved from the finance ledger.
- Merchandising curation changes the storefront edit immediately.

### `e2e/workspace.spec.ts` — role gates and policy

- Admin routes require a role and unlock after preview.
- Seller surfaces stay scoped to the demo studio.
- Approving a pending listing updates moderation and persists.
- A saved low-stock policy changes the shared workspace threshold.
- Motion profile switch updates `<html data-motion>` and persists.
- Replaying the entrance specimen is announced and repeatable.
- Token swatches copy their CSS variable.

### `e2e/a11y.spec.ts` — accessibility gate

Axe scans with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` on:

1. `/`
2. `/products`
3. `/product/aria-over-ear-headphones`
4. `/collections`
5. `/compare`
6. `/help`
7. `/journey`
8. `/lab`
9. `/admin` after role preview
10. `/admin/customers`
11. `/admin/finance`
12. `/admin/merchandising`
13. `/seller/inventory` after role preview
14. Product quick-view dialog open

The gate fails on `serious` and `critical` violations only. It reports the axe rule id, target selector, HTML snippet and failure summary so failures are actionable.

The audit helper waits for entrance animations to settle before scanning. A transient frame during a fade is not the interface a user reads; motion behaviour is covered by its own tests.

### Accessibility fixes made because of the gate

- Account menu: removed `aria-label` that omitted the visible initials/name; the accessible name now includes the visible text plus an `sr-only` context sentence. This cleared `label-content-name-mismatch` on every storefront and workspace route.
- Search trigger: `aria-label` now matches the visible label including the `⌘K` hint, and exposes `aria-keyshortcuts`.
- Contrast tokens darkened (`--ink-faint`, `--copper`, `--warning`) rather than disabling the contrast rule.
- Lab motion specimen: reserved line height to remove the font-swap CLS found during performance measurement.

---

## Manual review procedures

Automation does not prove accessibility. The following checks are documented for a human reviewer:

### Keyboard-only pass

1. Tab from page load: skip link → announcement links → brand → primary nav → search → wishlist → cart → account.
2. Open the mega menu with Enter/Space; traverse with arrows/Tab; close with Escape; focus returns to the trigger.
3. Open search with `⌘K`/`Ctrl+K`; type a query; move through results with arrows; Enter opens; Escape closes and restores focus.
4. Open quick view; confirm focus is trapped, Escape closes, focus returns to the product card button.
5. Add to bag; open the cart drawer; confirm focus enters the drawer and returns to the cart trigger on close.
6. On `/compare`, remove and reorder products with the keyboard; confirm difference-only toggle is operable and announced.
7. In workspaces, tab through the sidebar, tables, inline stock editors, policy switches and confirmation dialogs.
8. Confirm a visible focus ring at every step and that no focus is lost to `body`.

### Screen-reader-oriented pass

- One `h1` per page and a logical heading outline.
- Landmarks announced (`banner`, `navigation` with names, `main`, `contentinfo`).
- Table headers associated; sortable columns announced.
- Chart summaries and data-table alternatives announced.
- Toasts announced politely; errors connected via `aria-describedby`.
- Cart count and wishlist changes announced without stealing focus.

### Zoom and reflow

- 200% text zoom at 390 px and 1440 px: no clipped essential content, no horizontal page scroll.
- 400% zoom equivalent (320 px CSS width): navigation remains operable; tables scroll inside their region.
- Landscape mobile: sticky purchase actions do not cover content.

### Motion and preference

- OS reduced motion → `data-motion="reduced"`; entrances shorten, no travel.
- Explicit Minimal → CSS animations/transitions disabled.
- Explicit Full overrides the OS preference only when the user chooses it; the choice persists.
- Confirm no scroll hijacking and no animation blocks input.

### Theme

- Light and dark themes at AA contrast for body text, controls and status.
- Focus rings visible in both themes.
- No flash of incorrect theme on first paint.

---

## Test gaps (honest)

| Gap | Impact |
| --- | --- |
| Chromium only | WebKit/Firefox not run. Radix and CSS should be portable, but this is unverified. |
| No component-render tests | Interaction coverage is E2E rather than unit-level component tests. RTL is installed but not used for component suites. |
| No visual regression | No screenshot baseline service; layout regressions rely on E2E assertions and review. |
| No live API tests | Backend unavailable (no MongoDB/Redis/Docker). |
| No load/performance assertions in CI | Perf measured manually via `scripts/measure-vitals.mjs`. |
| No session-expiry test | Demo mode has no real session; live auth is unverified. |
| No screen-reader automation | Manual procedure only; no NVDA/VoiceOver run recorded. |
| No Storybook interaction tests | `/lab` is the living reference; Storybook was not added. |

---

## Reproducing a failure

Playwright writes `test-results/<test>/error-context.md` with the page snapshot and the exact axe payload. For a11y failures, the report includes rule id, selector, HTML and failure summary. Use `pnpm exec playwright test e2e/a11y.spec.ts --reporter=list` for the focused gate.

If `next start` reports a missing build, run `pnpm build` first. On Windows, a concurrent `next dev` writing `.next` can corrupt the build; stop the dev server and rebuild.
