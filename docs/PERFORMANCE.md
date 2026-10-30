# Performance report

**Status: lab measurements only. No field data. No deployment.**

All numbers below were produced on the production build (`pnpm build` + `next start`) on this machine, using headless Chromium through Playwright. They are **not** Core Web Vitals p75 field results, and they are **not** comparable to CrUX or Lighthouse scores from other environments.

---

## Measurement method

- Script: `scripts/measure-vitals.mjs` (checked in, reproducible)
- Server: `pnpm start -p 3100` against a completed production build
- Browser: Playwright Chromium, fresh context per route and profile
- Cache: cold per context; no service worker
- Network/CPU throttling: **none**
- Profiles: desktop 1440×900 @1x; mobile 390×844 @2x, touch, mobile viewport
- LCP/CLS: `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`), sampled 1.2 s after `load`
- Transfer: sum of `transferSize` for all resource entries plus the navigation document; JS transfer counts `.js` resources only
- Run: single sample per route/profile. Variance of ±100 ms LCP and ±0.02 CLS was observed between runs.

```bash
pnpm build
pnpm start -p 3100
node scripts/measure-vitals.mjs
```

---

## Results (final run)

| Profile | Route | LCP (ms) | CLS | DCL (ms) | Load (ms) | Transfer (kB) | JS transfer (kB) | Requests |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | `/` | 408 | 0.0033 | 375 | 548 | 496 | 298 | 42 |
| Desktop | `/products` | 652 | 0.0007 | 59 | 357 | 498 | 298 | 46 |
| Desktop | `/product/aria-over-ear-headphones` | 476 | 0.0014 | 427 | 622 | 513 | 310 | 44 |
| Desktop | `/compare` | 252 | 0.0013 | 66 | 395 | 511 | 308 | 43 |
| Desktop | `/checkout` | 216 | 0.0014 | 60 | 356 | 553 | 345 | 47 |
| Desktop | `/lab` | 360 | 0.0282 | 310 | 511 | 495 | 298 | 40 |
| Mobile | `/` | 340 | 0 | 471 | 489 | 464 | 283 | 34 |
| Mobile | `/products` | 628 | 0 | 64 | 328 | 458 | 280 | 36 |
| Mobile | `/product/aria-over-ear-headphones` | 328 | 0 | 132 | 509 | 475 | 293 | 36 |
| Mobile | `/compare` | 212 | 0 | 66 | 329 | 472 | 291 | 35 |
| Mobile | `/checkout` | 184 | 0 | 56 | 320 | 502 | 316 | 37 |
| Mobile | `/lab` | 344 | 0 | 335 | 524 | 470 | 289 | 34 |

### Against the stated targets

| Metric | Target | Worst observed (lab) | Verdict |
| --- | --- | --- | --- |
| LCP | ≤ 2.5 s | 652 ms | Within target **in this lab run**; field/p75 unverified |
| CLS | ≤ 0.1 | 0.0282 (`/lab`) | Within target in this run |
| INP | ≤ 200 ms | not measured | **NOT TESTED** |

**Do not read this table as a Core Web Vitals pass.** LCP on localhost with no throttling is not evidence for a 4G mobile user. INP requires scripted interactions and has not been measured.

---

## Layout-shift work (before → after)

The first measurement found a real defect: **CLS 0.1165 on the home page** (desktop, cold font load). Tracing with the `layout-shift` observer showed the display fallback wrapping the hero headline onto three lines, then Fraunces swapping to two, shrinking the bento/hero row and moving the page below it by 64 px.

Two corrections were made:

1. `src/app/layout.tsx` — disable metric-adjusted fallback for Fraunces. The adjusted fallback was wider than the selected display face at 104 px; the unadjusted serif fallback keeps the same two-line break.
2. `src/app/(store)/lab/lab-view.tsx` — reserve two display lines (`min-h-[1.96em]`) on the lab hero heading, whose fallback rendered one line and the loaded face two.

Measured after the fix:

| Route | Before | After |
| --- | ---: | ---: |
| `/` (desktop) | 0.1165 | 0.0033 |
| `/lab` (desktop) | 0.1597 | 0.0282 |

This is the only performance claim in this project supported by a before/after measurement.

---

## Build output (Next.js report, `pnpm build`)

```text
First Load JS shared by all        103 kB
  chunks/3982                      46.5 kB
  chunks/f7d70d25                  54.2 kB
  other shared chunks              2.01 kB

Route first-load ranges            141 kB – 219 kB
Largest route bundle               /lab          48.6 kB route, 219 kB first load
Checkout                           /checkout     33.3 kB route, 187 kB first load
Compare studio                     /compare      10.0 kB route, 179 kB first load
Product detail                     /product/[slug] 7.3 kB route, 196 kB first load
```

The 35 prerendered pages plus dynamic product/collection/seller/order routes total 37 routes.

### Budgets

| Budget | Value | Current |
| --- | ---: | --- |
| Shared first-load JS | ≤ 110 kB | 103 kB (pass) |
| Single route JS | ≤ 60 kB | 48.6 kB `/lab` (pass) |
| First-load JS per route | ≤ 230 kB | 219 kB `/lab` (pass) |
| Image requests on storefront hero | 0 | 0 (local SVG) |
| Continuous animation loops | 0 | 0 |

These budgets were set from the measured baseline, not invented before measurement. `/lab` is permitted to be the heaviest route because it is a developer reference surface and is intentionally code-split; it is not part of the purchase path.

### Why network JS transfer exceeds "First Load JS"

Next's report counts route/shared chunks; the browser measurement also includes fonts, CSS, the document and any lazily fetched chunks for interactive surfaces (search dialog, drawers). The mobile transfer is lower because fewer route chunks are required for the initial view. Neither number is gzipped-equivalent to a CDN edge measurement.

---

## Performance engineering decisions

- **No photography on the storefront.** Hero and product art are inline SVG; there is no contest between LCP image bytes and layout stability.
- **Font discipline.** Three self-hosted families, preloaded by `next/font`; `swap` retained, but fallback metrics corrected after measurement.
- **Charts without a chart runtime.** `src/components/charts.tsx` renders SVG paths and CSS bars; no 50–150 kB chart dependency.
- **Route-level splitting.** Workspace and lab code do not ship to the storefront; `/lab` is the only route above 40 kB.
- **Motion cost control.** Transform/opacity only; `MotionConfig` disables travel under reduced/minimal; CSS media queries neutralise transitions; no scroll listeners for animation.
- **No polling or timers** for marketplace data in demo mode; state changes are event-driven.
- **Aspect-ratio containers** for art prevent image-driven shift.
- **No virtualization yet.** Tables are at most a few dozen rows in the demo; virtualization would be premature. The admin customer/order tables are the first candidates if data volume grows.

---

## Not measured

| Item | Reason |
| --- | --- |
| Field Core Web Vitals / CrUX | No deployment or real traffic |
| Lighthouse score | Not run in this environment |
| INP / long tasks under interaction | No interaction trace harness was built |
| Throttled mobile (Slow 4G, 4× CPU) | Not run; lab numbers use unthrottled localhost |
| Bundle analyzer treemap | No analyzer configured; build report used instead |
| CDN/caching behaviour | No deployment |
| Server response time under load | No load test, no live backend |

These are honest gaps, not passes. The next performance step would be a Lighthouse CI run with mobile throttling on a deployed preview, followed by an interaction trace for checkout and the compare studio.
