import { beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "ponnaloy.atlas.state.v1";

async function freshStore() {
  vi.resetModules();
  return import("./store");
}

describe("demo store hydration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates saved state before the first mutation so edits are not clobbered", async () => {
    const { initialAtlasState } = await import("./seed");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...initialAtlasState,
        role: "SELLER",
        productEdits: {
          "p-aria": {
            variants: [
              { id: "v-aria-graphite", label: "Finish", option: "Graphite", stock: 2, swatch: "#2C3234", priceDelta: 0 },
              { id: "v-aria-sand", label: "Finish", option: "Sand", stock: 5, swatch: "#C9B79C", priceDelta: 0 },
            ],
          },
        },
      })
    );

    const store = await freshStore();
    // Simulate a child mount effect mutating before the hydration effect ran.
    const result = store.updateStock("p-aria", "v-aria-graphite", 9);
    expect(result.ok).toBe(true);

    const persisted = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    const variants = persisted.productEdits["p-aria"].variants as Array<{ id: string; stock: number }>;
    expect(variants.find((variant) => variant.id === "v-aria-sand")?.stock).toBe(5);
    expect(variants.find((variant) => variant.id === "v-aria-graphite")?.stock).toBe(9);
    expect(persisted.role).toBe("SELLER");
    expect(store.getSnapshot().hydrated).toBe(true);
  });

  it("ignores snapshots written by an older state version", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, role: "ADMIN", cart: [{ productId: "p-aria", quantity: 3 }] })
    );

    const store = await freshStore();
    store.hydrateStore();

    const snapshot = store.getSnapshot();
    expect(snapshot.role).toBe("CUSTOMER");
    expect(snapshot.cart).toEqual([]);
    expect(snapshot.hydrated).toBe(true);
  });
});
