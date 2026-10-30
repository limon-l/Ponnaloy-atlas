/**
 * Lab performance measurement for the production build.
 *
 * This is a local, lab-only measurement: headless Chromium, no network or CPU
 * throttling, one cold cache per route per profile. It is not field data and
 * must not be presented as a Core Web Vitals p75 result.
 *
 * Usage:
 *   pnpm start -p 3100
 *   node scripts/measure-vitals.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const ROUTES = [
  "/",
  "/products",
  "/product/aria-over-ear-headphones",
  "/compare",
  "/checkout",
  "/lab",
];
const PROFILES = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const INIT = () => {
  window.__atlasVitals = { lcp: 0, cls: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__atlasVitals.lcp = entry.startTime;
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__atlasVitals.cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
};

const browser = await chromium.launch();
const rows = [];

for (const profile of PROFILES) {
  for (const route of ROUTES) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      isMobile: profile.isMobile,
      hasTouch: Boolean(profile.hasTouch),
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.addInitScript(INIT);
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      const transfer = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      const js = resources
        .filter((entry) => entry.name.endsWith(".js"))
        .reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      return {
        lcp: Math.round(window.__atlasVitals.lcp),
        cls: Number(window.__atlasVitals.cls.toFixed(4)),
        dcl: Math.round(nav?.domContentLoadedEventEnd ?? 0),
        load: Math.round(nav?.loadEventEnd ?? 0),
        transferKb: Math.round(transfer / 1024),
        jsKb: Math.round(js / 1024),
        requests: resources.length + 1,
      };
    });

    rows.push({ profile: profile.name, route, ...metrics });
    await context.close();
  }
}

await browser.close();

const header = ["profile", "route", "lcp_ms", "cls", "dcl_ms", "load_ms", "transfer_kb", "js_kb", "requests"];
console.log(header.join("\t"));
for (const row of rows) {
  console.log(
    [row.profile, row.route, row.lcp, row.cls, row.dcl, row.load, row.transferKb, row.jsKb, row.requests].join("\t")
  );
}
