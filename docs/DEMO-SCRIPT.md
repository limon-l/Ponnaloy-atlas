# Demo video storyboard

**Target length:** 4–5 minutes
**Format:** 1440×900 screen capture with a short mobile segment (390×844)
**Narration:** calm, specific, no marketing superlatives. Every claim should be visible on screen.
**Preparation:** `pnpm build && pnpm start`; clear site data once, then reload so the demo state is seeded. Confirm `/admin/settings → Reset demo` is available. Do not record dev-server overlays.

---

## 0:00–0:25 — Opening

**Screen:** `/` (light theme), hover nothing for two seconds.

**Action:** slow scroll from the hero into the standards strip and featured edit.

**Narration:**
> "Ponnaloy Atlas is a multi-vendor commerce frontend built as five connected surfaces: a living storefront, a comparison studio, a seller workspace, an admin command centre, and a design lab. It runs on an explicit demo data layer because the original backend needs MongoDB and Redis, which are not available here. No payment is processed anywhere in this demo."

**On-screen evidence:** the demo strip under the hero ("Demo marketplace · synthetic catalogue…").

---

## 0:25–1:05 — Storefront and discovery

**Screen:** `/products`.

1. Type `aria` in the catalogue search; pause on the filtered result.
2. Clear search; open a category filter and show the URL updating.
3. Open **Quick view** on Aria Over-Ear.
4. Switch finish from Graphite to **Sand**; point at the stock line changing to `1 available`.
5. Add to bag; let the toast and cart count animate.

**Narration:**
> "Filters are URL-synchronised, so a filtered view is shareable and the back button behaves. Quick view is a real variant selector, not a static modal: stock and price are resolved per variant, and the add-to-cart action uses the selected option."

---

## 1:05–1:50 — Exploration studio

**Screen:** `/compare` (arrive with two objects from the compare tray).

1. Toggle **Differences only**; show the row count drop and the table reflow.
2. Change a variant on one product; show the comparison updating.
3. Reorder a product with the keyboard (focus the control, use the keyboard, not the mouse).
4. Add the chosen variant to the bag.
5. Remove a product; show the empty-state recovery suggestion.

**Narration:**
> "The studio is keyboard-operable: removal and reordering work without drag. Difference-only mode filters attribute rows, and each product keeps its own variant choice. The comparison never requires WebGL."

---

## 1:50–2:35 — Purchase to fulfilment

**Screen:** `/cart` → `/checkout`.

1. Show the line items, seller split and delivery estimate.
2. Submit the prefilled demo checkout; point at the "Demo — no real payment" badge before submitting.
3. On the confirmation, open the order.
4. Show the timeline, then the seller notification in the header.

**Screen:** switch to **Seller** via the account menu (or the seller preview).

5. `/seller/orders`: open the new order, advance it to **Shipped**, add carrier and tracking.
6. `/seller/inventory`: change a variant's stock inline; show validation rejecting a negative value first.

**Narration:**
> "One order record drives every surface. The customer's confirmation, the seller queue and the admin ledger read the same order. Role preview is a demo convenience; the note on screen is deliberate — the API would remain authoritative."

---

## 2:35–3:15 — Customer timeline and admin oversight

**Screen:** switch back to **Customer**; open `/orders/[id]`.

1. Show the status change and tracking number the seller just added.
2. Request a return with a reason.
3. Switch to **Admin** → `/admin/finance`; approve the return; show the ledger and status update.
4. Open `/admin/audit`; show the recorded action.
5. `/admin/merchandising`: change the featured collection; switch to the storefront and show it immediately.

**Narration:**
> "Returns are an eligibility-checked request, not a button that pretends to refund. Approval updates the ledger and the audit trail, and the merchandising edit is visible on the storefront without a rebuild."

---

## 3:15–3:50 — Design and motion lab

**Screen:** `/lab`.

1. Show the token swatches; copy one token and show the toast.
2. Show the type specimens and the component inventory.
3. Replay the entrance specimen under **Full**.
4. Switch to **Reduced**, replay; switch to **Minimal**, replay.
5. Point at `<html data-motion>` via DevTools (optional) and at the chart gallery summary.

**Narration:**
> "Motion is a contract with three profiles. Reduced removes travel; Minimal removes transitions. The profile persists and follows the OS preference by default. Charts are hand-built SVG with text summaries, not a chart runtime."

---

## 3:50–4:20 — Mobile and accessibility evidence

**Screen:** resize to 390×844 (or use device emulation).

1. Open the mobile menu drawer; navigate to a collection; close it.
2. Open search; type; open a result.
3. Show the sticky purchase action on a product page.
4. Tab through the header to show the visible focus ring and skip link.
5. Run the axe scan? Do not run tooling on camera; show the terminal result instead:
   `pnpm exec playwright test e2e/a11y.spec.ts --reporter=list` → 14 passed.

**Narration:**
> "The shell is tested at 360 pixels without horizontal overflow. Keyboard focus is visible, dialogs trap and restore focus, and fourteen axe scans pass with no serious or critical WCAG A/AA violations. Automated scans are not a conformance claim; manual keyboard and screen-reader checks are documented."

---

## 4:20–4:40 — Engineering evidence and close

**Screen:** terminal and editor.

1. Show `pnpm typecheck`, `pnpm lint`, `pnpm test` → 43 passed, `pnpm build` → 37 routes, `pnpm exec playwright test` → 38 passed.
2. Open `src/lib/store.ts` around the hydration guard and `docs/PERFORMANCE.md` around the CLS before/after (0.1165 → 0.0033).

**Narration:**
> "The project ships with 43 domain tests, 38 production-build end-to-end tests and an accessibility gate. The one performance claim with a before/after is a real font-swap layout shift: 0.1165 CLS on the home page, traced and fixed to 0.0033. Field Core Web Vitals, the live API and deployment are not verified, and the README says so."

**End card:** repository URL, `/lab` route, documentation index.

---

## Capture checklist

- [ ] Fresh production build; no dev overlay, no HMR badge
- [ ] Demo state reset; notifications show the seeded items
- [ ] Theme: light for the storefront, dark for one workspace segment (optional)
- [ ] Motion: Full for the opening; Reduced/Minimal only in the lab segment
- [ ] Cursor movement slow and deliberate; no rapid hovering
- [ ] No real personal data; the demo identity is synthetic
- [ ] Terminal font size readable at 1080p
- [ ] Captions for narration; no claims that are not on screen
