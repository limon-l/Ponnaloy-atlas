import { expect, test } from "@playwright/test";
import { waitForAtlas, readDemoState } from "./helpers";

test.describe("storefront", () => {
  test("home renders its editorial hero and primary navigation", async ({ page }) => {
    await page.goto("/");
    await waitForAtlas(page);

    await expect(page).toHaveTitle(/Ponnaloy Atlas/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Ponnaloy Atlas" })).toBeVisible();
  });

  test("catalogue search filters to a known object", async ({ page }) => {
    await page.goto("/products");
    await waitForAtlas(page);

    const search = page.getByRole("search").getByRole("textbox");
    await search.fill("Aria");
    await search.press("Enter");

    await expect(page).toHaveURL(/q=Aria/i);
    await expect(page.getByRole("link", { name: /Aria Over-Ear/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "All objects" })).toBeVisible();
  });

  test("product can be added to the bag, checked out and opened as an order", async ({ page }) => {
    await page.goto("/product/aria-over-ear-headphones");
    await waitForAtlas(page);

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Aria");
    await page.getByRole("button", { name: /^Add to bag/ }).click();

    await page.getByRole("button", { name: /^Open bag/ }).click();
    const bag = page.getByRole("dialog", { name: "Your bag" });
    await expect(bag).toBeVisible();
    await expect(bag.getByText("Aria Over-Ear").first()).toBeVisible();

    await bag.getByRole("link", { name: "Continue to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("heading", { name: "Details, not distractions." })).toBeVisible();

    await page.getByRole("button", { name: /^Place demo order/ }).click();

    await expect(page).toHaveURL(/\/orders\/[^/?]+\?placed=1$/);
    await expect(page.getByText(/Order .* placed|Demo order/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/PL-|ATL-/i);

    const state = await readDemoState(page);
    expect(state).not.toBeNull();
    expect(Array.isArray(state?.cart)).toBe(true);
    expect((state?.cart as unknown[]).length).toBe(0);
    expect((state?.orders as unknown[]).length).toBeGreaterThan(60);
  });

  test("comparison reaches the studio with two objects", async ({ page }) => {
    await page.goto("/products");
    await waitForAtlas(page);

    const compareButtons = page.getByRole("button", { name: "Add to comparison" });
    await compareButtons.first().click();
    await compareButtons.first().click();

    const tray = page.getByRole("region", { name: "Comparison tray" });
    await expect(tray).toBeVisible();
    await tray.getByRole("link", { name: /^Compare/ }).click();

    await expect(page).toHaveURL(/\/compare$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/differences|compared/i).first()).toBeVisible();
  });

  test("wishlist persists a saved object across a reload", async ({ page }) => {
    await page.goto("/wishlist");
    await waitForAtlas(page);
    const savedBefore = await page.locator("article").count();

    await page.goto("/products");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Save to wishlist" }).first().click();
    await page.getByRole("banner").getByRole("link", { name: /^Wishlist/ }).click();

    await expect(page).toHaveURL(/\/wishlist$/);
    await expect(page.locator("article")).toHaveCount(savedBefore + 1);

    await page.reload();
    await waitForAtlas(page);
    await expect(page.locator("article")).toHaveCount(savedBefore + 1);
  });

  test("search dialog opens from the keyboard shortcut", async ({ page }) => {
    await page.goto("/");
    await waitForAtlas(page);

    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox").fill("lamp");
    await expect(dialog.getByRole("option", { name: /Halo/i }).first()).toBeVisible();
  });
});

test.describe("responsive shell", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile header exposes the menu drawer without horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await waitForAtlas(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
  });
});
