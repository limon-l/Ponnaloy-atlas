import { expect, test } from "@playwright/test";
import { readDemoState, waitForAtlas } from "./helpers";

test.describe("role-gated workspaces", () => {
  test("admin surfaces require a role and unlock after preview", async ({ page }) => {
    await page.goto("/admin");
    await waitForAtlas(page);

    await expect(page.getByRole("heading", { name: "This is the admin command centre" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to storefront" })).toBeVisible();

    await page.getByRole("button", { name: "Preview as administrator" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Command centre" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Admin command centre navigation" })).toBeVisible();

    const state = await readDemoState(page);
    expect(state?.role).toBe("ADMIN");
  });

  test("seller surfaces stay scoped to the demo studio", async ({ page }) => {
    await page.goto("/seller");
    await waitForAtlas(page);

    await expect(page.getByRole("heading", { name: "This is the seller workspace" })).toBeVisible();
    await page.getByRole("button", { name: "Preview as seller" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Studio overview" })).toBeVisible();
    await expect(page.getByText(/Kestrel Audio/).first()).toBeVisible();
  });

  test("approving a pending listing updates moderation and persists", async ({ page }) => {
    await page.goto("/admin/moderation");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();

    const pendingBadge = page.getByRole("button", { name: /pending/i });
    const before = await pendingBadge.innerText();

    await page.getByRole("button", { name: "Review" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const listingName = (await dialog.getByRole("heading", { level: 2 }).innerText()).trim();
    await dialog.getByRole("button", { name: "Approve listing" }).click();

    await expect(page.getByText(`${listingName} approved`).first()).toBeVisible();

    const state = await readDemoState(page);
    const edits = state?.productEdits as Record<string, { moderation?: string }> | undefined;
    expect(Object.values(edits ?? {}).some((edit) => edit.moderation === "APPROVED")).toBe(true);
    await expect(pendingBadge).not.toHaveText(before);
  });

  test("saving a low-stock policy changes the shared workspace threshold", async ({ page }) => {
    await page.goto("/admin/settings");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();

    const threshold = page.getByLabel("Low-stock threshold");
    await threshold.fill("12");
    await page.getByRole("button", { name: "Save policy" }).click();
    await expect(page.getByText("Platform policy saved").first()).toBeVisible();

    const state = await readDemoState(page);
    expect((state?.settings as { lowStockThreshold: number }).lowStockThreshold).toBe(12);

    await page.goto("/admin");
    await expect(page.getByText("Low stock").first()).toBeVisible();
  });
});

test.describe("design & motion lab", () => {
  test("switching the motion profile updates the document and persists", async ({ page }) => {
    await page.goto("/lab");
    await waitForAtlas(page);

    await expect(page.locator("html")).toHaveAttribute("data-motion", /full|reduced|minimal/);

    await page.getByRole("radio", { name: /Minimal/ }).check();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "minimal");

    const stored = await page.evaluate(() => window.localStorage.getItem("ponnaloy.atlas.motion"));
    expect(stored).toBe("minimal");

    await page.reload();
    await waitForAtlas(page);
    await expect(page.getByRole("radio", { name: /Minimal/ })).toBeChecked();
  });

  test("replaying the entrance specimen is announced and repeatable", async ({ page }) => {
    await page.goto("/lab#motion");
    await waitForAtlas(page);

    const replay = page.getByRole("button", { name: "Replay" });
    await expect(page.getByText("Replay #1")).toBeVisible();
    await replay.click();
    await expect(page.getByText("Replay #2")).toBeVisible();
    await replay.click();
    await expect(page.getByText("Replay #3")).toBeVisible();
  });

  test("token swatches copy their CSS variable", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/lab#colour");
    await waitForAtlas(page);

    await page.getByRole("button", { name: /--canvas/ }).first().click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("--canvas");
  });
});
