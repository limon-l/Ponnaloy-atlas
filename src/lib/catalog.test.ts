import { describe, expect, it } from "vitest";
import {
  discountPercent,
  filterProducts,
  parseFilters,
  productById,
  searchProducts,
  toSearchParams,
  variantStock,
} from "@/lib/catalog";
import { products } from "@/lib/seed";
import type { ProductFilters } from "@/lib/types";

const baseFilters: ProductFilters = {
  q: "",
  categories: [],
  sellers: [],
  inStockOnly: false,
  minRating: 0,
  sort: "featured",
};

describe("catalogue filtering and search", () => {
  it("only returns approved listings", () => {
    const results = filterProducts(products, baseFilters);
    expect(results).toHaveLength(22);
    expect(results.every((product) => product.moderation === "APPROVED")).toBe(true);
    expect(results.some((product) => product.id === "p-linea")).toBe(false);
  });

  it("combines category, seller and price filters", () => {
    const results = filterProducts(products, {
      ...baseFilters,
      categories: ["audio"],
      sellers: ["sel-kestrel"],
      maxPrice: 40000,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.category === "audio" && product.sellerId === "sel-kestrel")).toBe(true);
    expect(results.every((product) => product.price <= 40000)).toBe(true);
  });

  it("searches names, tags, brands and categories", () => {
    expect(filterProducts(products, { ...baseFilters, q: "headphones" }).map((p) => p.id)).toContain("p-aria");
    expect(filterProducts(products, { ...baseFilters, q: "ceramic" }).length).toBeGreaterThan(0);
    expect(filterProducts(products, { ...baseFilters, q: "zzzz-no-match" })).toHaveLength(0);
  });

  it("sorts by price in both directions", () => {
    const ascending = filterProducts(products, { ...baseFilters, sort: "price-asc" });
    const descending = filterProducts(products, { ...baseFilters, sort: "price-desc" });
    expect(ascending[0]!.price).toBeLessThanOrEqual(ascending[ascending.length - 1]!.price);
    expect(descending[0]!.price).toBeGreaterThanOrEqual(descending[descending.length - 1]!.price);
  });

  it("filters out sold-out products when requested", () => {
    const inStock = filterProducts(products, { ...baseFilters, inStockOnly: true });
    expect(inStock.every((product) => variantStock(product) > 0)).toBe(true);
  });

  it("ranks name-prefix matches above tag matches", () => {
    const results = searchProducts(products, "aria");
    expect(results[0]?.id).toBe("p-aria");
  });

  it("returns nothing for an empty search", () => {
    expect(searchProducts(products, "   ")).toEqual([]);
  });
});

describe("filter serialisation", () => {
  it("parses comma-separated facets, numeric bounds and sort", () => {
    const params = new URLSearchParams(
      "q=oak&category=desk,lighting&seller=sel-northwind&min=1000&max=20000&stock=in&rating=4.5&sort=price-asc"
    );
    const filters = parseFilters(params);
    expect(filters.q).toBe("oak");
    expect(filters.categories).toEqual(["desk", "lighting"]);
    expect(filters.sellers).toEqual(["sel-northwind"]);
    expect(filters.minPrice).toBe(1000);
    expect(filters.maxPrice).toBe(20000);
    expect(filters.inStockOnly).toBe(true);
    expect(filters.minRating).toBe(4.5);
    expect(filters.sort).toBe("price-asc");
  });

  it("falls back to featured for an unknown sort", () => {
    expect(parseFilters(new URLSearchParams("sort=explode")).sort).toBe("featured");
  });

  it("round-trips a filter object", () => {
    const filters: ProductFilters = {
      q: "lamp",
      categories: ["lighting"],
      sellers: ["sel-lumen"],
      minPrice: 5000,
      maxPrice: 60000,
      inStockOnly: true,
      minRating: 4,
      sort: "newest",
    };
    expect(parseFilters(toSearchParams(filters))).toEqual(filters);
  });
});

describe("catalogue helpers", () => {
  it("computes a discount only when the compare-at price is higher", () => {
    const aria = productById(products, "p-aria")!;
    expect(discountPercent(aria)).toBe(13);
    expect(discountPercent({ ...aria, compareAtPrice: aria.price })).toBeNull();
  });

  it("returns zero stock for an unknown variant", () => {
    const aria = productById(products, "p-aria")!;
    expect(variantStock(aria, "v-missing")).toBe(0);
  });
});
