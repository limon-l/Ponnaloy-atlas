import type { Product, ProductSpec } from "@/lib/types";
import { inStock, variantStock } from "@/lib/catalog";

export interface ComparisonRow {
  label: string;
  group: ProductSpec["group"] | "Commercial";
  values: Array<string | null>;
  differs: boolean;
}

const coreRows = (product: Product): Array<{ label: string; group: ComparisonRow["group"]; value: string }> => [
  { label: "Price", group: "Commercial", value: String(product.price) },
  { label: "Availability", group: "Commercial", value: inStock(product) ? "In stock" : "Sold out" },
  { label: "Units available", group: "Commercial", value: String(variantStock(product)) },
  { label: "Rating", group: "Commercial", value: product.rating > 0 ? `${product.rating.toFixed(1)} / 5` : "No reviews yet" },
  { label: "Seller", group: "Commercial", value: product.brand },
  { label: "Category", group: "Commercial", value: product.category },
];

export function buildComparison(products: Product[]): ComparisonRow[] {
  if (products.length === 0) return [];
  const labels: Array<{ label: string; group: ComparisonRow["group"] }> = [];
  const seen = new Set<string>();

  for (const product of products) {
    for (const row of coreRows(product)) {
      const key = `${row.group}:${row.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        labels.push({ label: row.label, group: row.group });
      }
    }
    for (const spec of product.specs) {
      const key = `spec:${spec.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        labels.push({ label: spec.label, group: spec.group });
      }
    }
  }

  return labels.map(({ label, group }) => {
    const values = products.map((product) => {
      if (group === "Commercial") {
        return coreRows(product).find((row) => row.label === label)?.value ?? null;
      }
      return product.specs.find((spec) => spec.label === label)?.value ?? null;
    });
    const nonNull = values.filter((value): value is string => value !== null);
    return {
      label,
      group,
      values,
      differs: new Set(nonNull).size > 1 || nonNull.length !== values.length,
    };
  });
}

export function groupComparisonRows(rows: ComparisonRow[]): Array<{ group: ComparisonRow["group"]; rows: ComparisonRow[] }> {
  const groups: ComparisonRow["group"][] = ["Commercial", "Dimensions", "Materials", "Performance", "Care"];
  return groups
    .map((group) => ({ group, rows: rows.filter((row) => row.group === group) }))
    .filter((entry) => entry.rows.length > 0);
}

export function comparisonSummary(products: Product[]) {
  if (products.length === 0) return { cheapest: null, bestRated: null, inStock: 0 };
  const cheapest = [...products].sort((a, b) => a.price - b.price)[0] ?? null;
  const bestRated = [...products].sort((a, b) => b.rating - a.rating)[0] ?? null;
  return {
    cheapest,
    bestRated,
    inStock: products.filter((product) => inStock(product)).length,
  };
}
