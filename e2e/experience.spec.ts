import { expect, test } from "@playwright/test";
import { readDemoState, waitForAtlas } from "./helpers";

test.describe("product discovery", () => {
  test("quick view switches variant and adds the selected option to the bag", async ({ page }) => {
    await page.goto("/products");
    await waitForAtlas(page);

    await page.getByRole("button", { name: "Quick view Aria Over-Ear" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Aria Over-Ear" })).toBeVisible();

    const variant = dialog.getByLabel("Choose Finish for Aria Over-Ear");
    await variant.selectOption("v-aria-sand");
    await expect(dialog.getByText("1 available · ships from Kestrel Audio")).toBeVisible();

    await dialog.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByText("Aria Over-Ear added to bag").first()).toBeVisible();
    await expect(dialog).toBeHidden();

    const state = await readDemoState(page);
    const cart = state?.cart as Array<{ productId: string; variantId?: string; quantity: number }>;
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({ productId: "p-aria", variantId: "v-aria-sand", quantity: 1 });
  });

  test("comparison filters to differences and adds a chosen variant", async ({ page }) => {
    await page.goto("/products");
    await waitForAtlas(page);

    const compareButtons = page.getByRole("button", { name: "Add to comparison" });
    await compareButtons.first().click();
    await compareButtons.first().click();

    const tray = page.getByRole("region", { name: "Comparison tray" });
    await expect(tray).toBeVisible();
    await tray.getByRole("link", { name: /^Compare/ }).click();
    await expect(page).toHaveURL(/\/compare$/);

    const differences = page.getByRole("switch", { name: /Differences only/ });
    await expect(differences).toBeVisible();
    await differences.click();
    await expect(differences).toBeChecked();
    await expect(page.getByText(/Showing \d+ rows? that differ\./)).toBeVisible();

    const ariaColumn = page
      .locator("th")
      .filter({ has: page.getByRole("link", { name: "Aria Over-Ear", exact: true }) });
    await ariaColumn.getByLabel("Choose Aria Over-Ear Finish").selectOption("v-aria-sand");
    await expect(ariaColumn.getByText("1 available")).toBeVisible();

    await ariaColumn.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByText("Added to bag").first()).toBeVisible();

    const state = await readDemoState(page);
    const cart = state?.cart as Array<{ productId: string; variantId?: string }>;
    expect(cart.some((line) => line.productId === "p-aria" && line.variantId === "v-aria-sand")).toBe(true);
    expect(state?.compare).toHaveLength(2);
  });

  test("an empty comparison offers a considered pair to start with", async ({ page }) => {
    await page.goto("/compare");
    await waitForAtlas(page);

    await expect(page.getByRole("heading", { name: "Nothing to compare yet" })).toBeVisible();
    await expect(page.getByText("Start with a considered pair")).toBeVisible();
  });
});

test.describe("role boundaries", () => {
  test("previewing one workspace does not unlock the other", async ({ page }) => {
    await page.goto("/admin");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Command centre" })).toBeVisible();

    await page.goto("/seller");
    await waitForAtlas(page);
    await expect(page.getByRole("heading", { name: "This is the seller workspace" })).toBeVisible();

    await page.getByRole("button", { name: "Preview as seller" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Studio overview" })).toBeVisible();

    await page.goto("/admin");
    await waitForAtlas(page);
    await expect(page.getByRole("heading", { name: "This is the admin command centre" })).toBeVisible();

    const state = await readDemoState(page);
    expect(state?.role).toBe("SELLER");
  });
});

test.describe("seller inventory", () => {
  test("inline stock edits persist and change storefront availability", async ({ page }) => {
    await page.goto("/seller/inventory");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as seller" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Stock, without guesswork" })).toBeVisible();

    await page.getByLabel("Search inventory").fill("Aria");
    const graphite = page.getByLabel("Stock for Aria Over-Ear, Graphite");
    await expect(graphite).toHaveValue("2");
    await graphite.fill("7");
    await graphite.press("Enter");

    await expect(page.getByText("Stock updated").first()).toBeVisible();

    const state = await readDemoState(page);
    const edits = state?.productEdits as
      | Record<string, { variants?: Array<{ id: string; stock: number }> }>
      | undefined;
    const aria = edits?.["p-aria"];
    expect(aria?.variants?.find((variant) => variant.id === "v-aria-graphite")?.stock).toBe(7);

    await page.goto("/product/aria-over-ear-headphones");
    await waitForAtlas(page);
    await expect(page.getByText("7 available")).toBeVisible();
  });

  test("invalid stock is rejected without mutating the catalogue", async ({ page }) => {
    await page.goto("/seller/inventory");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as seller" }).click();

    await page.getByLabel("Search inventory").fill("Aria");
    const graphite = page.getByLabel("Stock for Aria Over-Ear, Graphite");
    await graphite.fill("-3");
    await graphite.press("Enter");

    await expect(page.getByText("Stock not saved").first()).toBeVisible();
    await expect(graphite).toHaveValue("2");
  });
});

test.describe("admin operations", () => {
  test("customer directory searches, filters and opens a live detail panel", async ({ page }) => {
    await page.goto("/admin/customers");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "People behind the orders" })).toBeVisible();

    await page.getByLabel("Search customers").fill("Amara");
    await expect(page.getByText("Amara Okafor").first()).toBeVisible();
    await expect(page.getByText("Jonas Lind")).toHaveCount(0);

    await page.getByRole("button", { name: "Open" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Amara Okafor" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "amara.okafor@example.com" })).toBeVisible();
    await expect(dialog.getByText("Lifetime spend")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.getByLabel("Search customers").fill("");
    await page.getByLabel("Filter by segment").selectOption("VIP");
    await expect(page.getByText("Amara Okafor").first()).toBeVisible();
    await expect(page.getByText("Jonas Lind")).toHaveCount(0);
  });

  test("customer directory exports the filtered rows as CSV", async ({ page }) => {
    await page.goto("/admin/customers");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();

    await page.getByLabel("Filter by status").selectOption("ACTIVE");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("ponnaloy-customers.csv");
    await expect(page.getByText("Customer directory exported").first()).toBeVisible();
  });

  test("a customer return can be approved from the finance ledger", async ({ page }) => {
    await page.goto("/orders/ord-ATL-1042");
    await waitForAtlas(page);

    await page.getByRole("button", { name: "Request return" }).click();
    const form = page.getByRole("dialog");
    await expect(form.getByRole("heading", { name: "Request a demo return" })).toBeVisible();
    await form.getByLabel("What happened?").fill("The finish was warmer than the studio photograph.");
    await form.getByRole("button", { name: "Submit request" }).click();
    await expect(page.getByText("Return requested").first()).toBeVisible();

    await page.goto("/admin/finance");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Payments, returns and fees" })).toBeVisible();

    await page.getByRole("tab", { name: /Returns & refunds/ }).click();
    const returnCard = page.locator("article").filter({ hasText: "ATL-1042" });
    await expect(returnCard).toBeVisible();
    await returnCard.getByRole("button", { name: "Approve refund" }).click();

    const confirm = page.getByRole("dialog");
    await expect(confirm.getByRole("heading", { name: "Approve this refund?" })).toBeVisible();
    await confirm.getByRole("button", { name: "Approve and refund" }).click();
    await expect(page.getByText("Return approved").first()).toBeVisible();

    const state = await readDemoState(page);
    const order = (state?.orders as Array<{ id: string; status: string; paymentStatus: string; returnRequest?: { status: string } }>).find(
      (item) => item.id === "ord-ATL-1042"
    );
    expect(order?.status).toBe("REFUNDED");
    expect(order?.paymentStatus).toBe("REFUNDED");
    expect(order?.returnRequest?.status).toBe("APPROVED");
  });

  test("featured curation changes the storefront edit immediately", async ({ page }) => {
    await page.goto("/admin/merchandising");
    await waitForAtlas(page);
    await page.getByRole("button", { name: "Preview as administrator" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "The homepage is a decision" })).toBeVisible();

    const aria = page.getByRole("switch", { name: /Feature Aria Over-Ear/ });
    await expect(aria).toBeChecked();
    await aria.click();
    await expect(page.getByText("Removed from the homepage edit").first()).toBeVisible();

    const featured = page.locator('section[aria-labelledby="featured-heading"]');
    await page.goto("/");
    await waitForAtlas(page);
    await expect(featured.getByRole("link", { name: "Aria Over-Ear by Kestrel Audio" })).toHaveCount(0);

    await page.goto("/admin/merchandising");
    await waitForAtlas(page);
    await page.getByRole("switch", { name: /Feature Aria Over-Ear/ }).click();
    await expect(page.getByText("Added to the homepage edit").first()).toBeVisible();

    await page.goto("/");
    await waitForAtlas(page);
    await expect(featured.getByRole("link", { name: "Aria Over-Ear by Kestrel Audio" })).toBeVisible();
  });
});
