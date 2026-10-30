import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.waitForFunction(() => document.documentElement.dataset.motion !== undefined);
const result = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const all = [...document.querySelectorAll("*")];
  const offenders = all
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: el.className?.toString?.().slice(0, 120),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
      };
    })
    .filter((x) => x.right > vw + 1 || x.left < -1)
    .sort((a, b) => b.right - a.right)
    .slice(0, 25);
  return { vw, scrollWidth: document.documentElement.scrollWidth, bodyScroll: document.body.scrollWidth, offenders };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
