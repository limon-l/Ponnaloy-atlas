import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { waitForAtlas } from "./helpers";

test("appearance persists, follows the device, and stays synchronized", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/account");
  await waitForAtlas(page);
  const appearance = page.getByRole("group", { name: "Appearance", exact: true });
  await appearance.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(appearance.getByRole("button", { name: "Dark", exact: true })).toHaveAttribute("aria-pressed", "true");
  await appearance.getByRole("button", { name: "System", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(appearance.getByRole("button", { name: "System", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("device reduced motion overrides a saved full-motion profile", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ponnaloy.atlas.motion", "full"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForAtlas(page);
  const transforms = await page.locator('main [style*="transition-delay"]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transform));
  expect(transforms.length).toBeGreaterThan(0);
  expect(transforms.every(value => value === "none")).toBe(true);
});

for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
  test(`account and product fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/account");
    await waitForAtlas(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.goto("/product/aria-over-ear-headphones");
    await waitForAtlas(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
}
for (const mode of ["light", "dark"] as const) {
  for (const route of ["/", "/products", "/account", "/checkout"]) {
    test(`Aura ${mode} accessibility: ${route}`, async ({ page }) => {
      await page.addInitScript(theme => localStorage.setItem("ponnaloy.atlas.theme", theme), mode);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(route);
      await waitForAtlas(page);
      await expect(page.locator("html")).toHaveClass(new RegExp(mode));
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.filter(item => item.impact === "serious" || item.impact === "critical").map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
