import { describe, expect, it } from "vitest";
import { buildComparison, comparisonSummary, groupComparisonRows } from "@/lib/comparison";
import { productById } from "@/lib/catalog";
import { products } from "@/lib/seed";

const aria = productById(products, "p-aria")!;
const nomad = productById(products, "p-nomad")!;

describe("comparison studio", () => {
  it("returns no rows without products", () => {
    expect(buildComparison([])).toEqual([]);
  });

  it("marks commercial rows that differ", () => {
    const rows = buildComparison([aria, nomad]);
    const price = rows.find((row) => row.label === "Price");
    expect(price?.group).toBe("Commercial");
    expect(price?.differs).toBe(true);
    expect(price?.values).toEqual([String(aria.price), String(nomad.price)]);
  });

  it("marks specs missing from one product as different", () => {
    const rows = buildComparison([aria, nomad]);
    const noise = rows.find((row) => row.label === "Noise control");
    expect(noise?.values[0]).toBeTruthy();
    expect(noise?.values[1]).toBeNull();
    expect(noise?.differs).toBe(true);
  });

  it("groups rows in the documented order and omits empty groups", () => {
    const groups = groupComparisonRows(buildComparison([aria, nomad]));
    expect(groups[0]?.group).toBe("Commercial");
    const labels = groups.map((group) => group.group);
    expect(labels).toEqual([...labels].sort((a, b) => {
      const order = ["Commercial", "Dimensions", "Materials", "Performance", "Care"];
      return order.indexOf(a) - order.indexOf(b);
    }));
    expect(groups.every((group) => group.rows.length > 0)).toBe(true);
  });

  it("summarises cheapest and best-rated products", () => {
    const summary = comparisonSummary([aria, nomad]);
    expect(summary.cheapest?.id).toBe(nomad.id);
    expect(summary.bestRated?.id).toBe(aria.id);
    expect(summary.inStock).toBeGreaterThan(0);
  });
});
