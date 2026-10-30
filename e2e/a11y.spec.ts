import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { waitForAtlas } from "./helpers";

const SERIOUS = ["serious", "critical"] as const;

async function audit(page: Page) {
  // Entrance choreography fades content in. Audit the settled interface rather
  // than a mid-transition frame (motion itself is covered by separate tests).
  await page
    .waitForFunction(
      () => {
        const animated = Array.from(document.querySelectorAll<HTMLElement>("main [style*='opacity']"));
        return animated.every((node) => Number(getComputedStyle(node).opacity) > 0.99);
      },
      undefined,
      { timeout: 4000 }
    )
    .catch(() => undefined);
  await page.waitForTimeout(150);
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
}

function seriousViolations(results: Awaited<ReturnType<typeof audit>>) {
  return results.violations
    .filter((violation) => SERIOUS.includes(violation.impact as (typeof SERIOUS)[number]))
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({
        target: node.target.join(" "),
        html: node.html.slice(0, 220),
        summary: node.failureSummary,
      })),
    }));
}

const routes = [
  ["home", "/"],
  ["catalogue", "/products"],
  ["product", "/product/aria-over-ear-headphones"],
  ["collections", "/collections"],
  ["compare", "/compare"],
  ["help", "/help"],
  ["journey", "/journey"],
  ["lab", "/lab"],
] as const;

for (const [name, path] of routes) {
  test(`axe: ${name} has no serious or critical WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await waitForAtlas(page);
    const results = await audit(page);
    expect(seriousViolations(results)).toEqual([]);
  });
}

test("axe: admin command centre passes after role preview", async ({ page }) => {
  await page.goto("/admin");
  await waitForAtlas(page);
  await page.getByRole("button", { name: "Preview as administrator" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Command centre" })).toBeVisible();

  const results = await audit(page);
  expect(seriousViolations(results)).toEqual([]);
});

const adminRoutes = [
  ["admin customers", "/admin/customers", "People behind the orders"],
  ["admin finance", "/admin/finance", "Payments, returns and fees"],
  ["admin merchandising", "/admin/merchandising", "The homepage is a decision"],
] as const;

for (const [name, path, heading] of adminRoutes) {
  test(`axe: ${name} passes after role preview`, async ({ page }) => {
    await page.goto(path);
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();

    const results = await audit(page);
    expect(seriousViolations(results)).toEqual([]);
  });
}

test("axe: seller inventory passes after role preview", async ({ page }) => {
  await page.goto("/seller/inventory");
  await waitForAtlas(page);
  await page.getByRole("button", { name: "Preview as seller" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Stock, without guesswork" })).toBeVisible();

  const results = await audit(page);
  expect(seriousViolations(results)).toEqual([]);
});

test("axe: product quick view dialog passes", async ({ page }) => {
  await page.goto("/products");
  await waitForAtlas(page);
  await page.getByRole("button", { name: "Quick view Aria Over-Ear" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const results = await audit(page);
  expect(seriousViolations(results)).toEqual([]);
});
