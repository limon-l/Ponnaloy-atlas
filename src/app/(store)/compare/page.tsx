"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Plus, Scale, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductArt } from "@/components/product-art";
import { Rating } from "@/components/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/controls";
import { buildComparison, comparisonSummary, groupComparisonRows } from "@/lib/comparison";
import { useCatalog, useSellers } from "@/lib/hooks";
import { addToCart, clearCompare, reorderCompare, setCompare, toggleCompare, useAtlasState } from "@/lib/store";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export default function ComparePage() {
  const products = useCatalog();
  const sellers = useSellers();
  const state = useAtlasState();
  const { toast } = useToast();
  const [diffOnly, setDiffOnly] = React.useState(false);
  const [variantChoices, setVariantChoices] = React.useState<Record<string, string>>({});
  const selected = state.compare
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const rows = buildComparison(selected);
  const groups = groupComparisonRows(rows);
  const summary = comparisonSummary(selected);
  const available = products.filter(
    (product) => product.moderation === "APPROVED" && !state.compare.includes(product.id)
  );
  const differenceCount = rows.filter((row) => row.differs).length;
  const visibleGroups = diffOnly
    ? groups
        .map((group) => ({ ...group, rows: group.rows.filter((row) => row.differs) }))
        .filter((group) => group.rows.length > 0)
    : groups;

  const variantForProduct = (product: Product) => {
    const requested = variantChoices[product.id];
    return (
      product.variants.find((variant) => variant.id === requested) ??
      product.variants.find((variant) => variant.stock > 0) ??
      product.variants[0]
    );
  };

  const remove = (product: Product) => {
    setCompare(state.compare.filter((id) => id !== product.id));
    toast({ title: `${product.name} removed from comparison`, tone: "info" });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    reorderCompare(index, target);
  };

  const valueFor = (row: (typeof rows)[number], value: string | null) => {
    if (value === null) return <span className="text-ink-faint">—</span>;
    if (row.group === "Commercial" && row.label === "Price") return formatMoney(Number(value));
    if (row.group === "Commercial" && row.label === "Category") return <span className="capitalize">{value}</span>;
    return value;
  };

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-10 sm:py-14">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-2xs text-ink-faint hover:text-ink">
            <ArrowLeft className="size-3" aria-hidden="true" /> Back to catalogue
          </Link>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow flex items-center gap-2">
                <span className="h-px w-6 bg-copper" aria-hidden="true" />
                Exploration studio
              </p>
              <h1 className="mt-3 font-display text-display-xs text-ink">Compare without the noise.</h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                Four objects, one decision surface. Commercial facts stay separate from material and care differences. Rows that
                differ are marked so you can ignore the rest.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="teal">{selected.length} of 4 selected</Badge>
              {selected.length > 1 && (
                <label htmlFor="differences-only" className="flex items-center gap-2 text-xs text-ink-soft">
                  <Switch
                    id="differences-only"
                    checked={diffOnly}
                    onCheckedChange={setDiffOnly}
                    aria-describedby="differences-help"
                  />
                  Differences only
                  <span className="tabular text-2xs text-ink-faint">({differenceCount})</span>
                </label>
              )}
              {selected.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCompare}>
                  <Trash2 className="size-4" aria-hidden="true" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        {selected.length === 0 ? (
          <div>
            <EmptyState
              icon={Scale}
              title="Nothing to compare yet"
              description="Add two to four objects from the catalogue. The comparison tray will follow you while you browse."
              action={{ label: "Browse the catalogue", href: "/products" }}
            />
            <div className="mt-10">
              <p className="eyebrow mb-4">Start with a considered pair</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {products
                  .filter((product) => product.moderation === "APPROVED")
                  .slice(0, 4)
                  .map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleCompare(product.id)}
                      className="focus-ring flex items-center gap-3 rounded-lg border border-line bg-surface-raised p-2.5 text-left transition-colors hover:border-line-strong"
                    >
                      <span className="size-14 shrink-0 overflow-hidden rounded-md">
                        <ProductArt art={product.art} palette={product.palette} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-ink">{product.name}</span>
                        <span className="tabular block text-2xs text-ink-faint">{formatMoney(product.price)}</span>
                      </span>
                      <Plus className="size-4 text-ink-faint" aria-hidden="true" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {summary.cheapest && summary.bestRated && (
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-line bg-surface-raised p-4">
                  <p className="eyebrow">Lowest price</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-ink">{summary.cheapest.name}</p>
                  <p className="tabular mt-0.5 text-xs text-ink-faint">{formatMoney(summary.cheapest.price)}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-raised p-4">
                  <p className="eyebrow">Highest rated</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-ink">{summary.bestRated.name}</p>
                  <p className="tabular mt-0.5 text-xs text-ink-faint">{summary.bestRated.rating.toFixed(1)} / 5</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-raised p-4">
                  <p className="eyebrow">Availability</p>
                  <p className="mt-1.5 text-sm font-medium text-ink">
                    {summary.inStock} of {selected.length} in stock
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">Demo inventory, updated in the seller workspace</p>
                </div>
              </div>
            )}

            <p id="differences-help" className="mb-3 text-2xs leading-relaxed text-ink-faint">
              {diffOnly
                ? `Showing ${differenceCount} ${differenceCount === 1 ? "row that differs" : "rows that differ"}. Turn the filter off to see shared attributes.`
                : "Rows where the selected objects disagree are marked “differs”. Turn on “Differences only” to hide shared attributes."}
            </p>

            <div className="overflow-x-auto rounded-xl border border-line bg-surface-raised scrollbar-thin">
              <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                <caption className="sr-only">Product comparison for {selected.map((product) => product.name).join(", ")}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 w-44 border-b border-r border-line bg-surface p-4 align-bottom">
                      <span className="eyebrow">Comparison</span>
                      <p className="mt-1 text-xs font-normal text-ink-faint">
                        {diffOnly ? "Differences only" : "Rows marked differ"}
                      </p>
                    </th>
                    {selected.map((product, index) => {
                      const seller = sellers.find((item) => item.id === product.sellerId);
                      const variant = variantForProduct(product);
                      const optionPrice = product.price + (variant?.priceDelta ?? 0);
                      const optionStock = variant?.stock ?? 0;
                      return (
                        <th key={product.id} scope="col" className="min-w-[13rem] border-b border-line p-4 align-top">
                          <div className="flex items-start justify-between gap-2">
                            <Link href={`/product/${product.slug}`} className="focus-ring block w-20 overflow-hidden rounded-md">
                              <ProductArt art={product.art} palette={product.palette} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(product)}
                              className="focus-ring grid size-7 place-items-center rounded-full text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
                              aria-label={`Remove ${product.name} from comparison`}
                            >
                              <X className="size-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          <Link href={`/product/${product.slug}`} className="mt-2 block font-display text-lg leading-snug tracking-[-0.02em] text-ink hover:text-teal">
                            {product.name}
                          </Link>
                          <p className="mt-0.5 truncate text-2xs text-ink-faint">{seller?.name ?? product.brand}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="tabular text-sm font-semibold text-ink">{formatMoney(optionPrice)}</p>
                            <Rating value={product.rating} count={product.reviewCount} />
                          </div>
                          <label className="mt-3 block">
                            <span className="sr-only">
                              Choose {product.name} {product.variantLabel}
                            </span>
                            <Select
                              className="h-8 text-2xs"
                              value={variant?.id ?? ""}
                              onChange={(event) =>
                                setVariantChoices((current) => ({ ...current, [product.id]: event.target.value }))
                              }
                              aria-label={`Choose ${product.name} ${product.variantLabel}`}
                            >
                              {product.variants.map((option) => (
                                <option key={option.id} value={option.id} disabled={option.stock <= 0}>
                                  {option.option} · {formatMoney(product.price + option.priceDelta)}
                                  {option.stock <= 0 ? " — sold out" : ""}
                                </option>
                              ))}
                            </Select>
                          </label>
                          <p className="mt-1 text-2xs text-ink-faint">
                            {optionStock > 0 ? `${optionStock} available` : "Selected option is sold out"}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <Button
                              size="sm"
                              className="flex-1"
                              disabled={optionStock <= 0}
                              onClick={() => {
                                const result = addToCart(product.id, variant?.id, 1);
                                toast({
                                  title: result.ok ? "Added to bag" : "Could not add",
                                  description: result.ok
                                    ? `${variant?.option ?? product.variantLabel} · demo basket, no payment taken.`
                                    : result.error,
                                  tone: result.ok ? "success" : "error",
                                });
                              }}
                            >
                              Add to bag
                            </Button>
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => move(index, -1)}
                                disabled={index === 0}
                                className="focus-ring grid size-8 place-items-center rounded-l-md border border-line text-ink-faint hover:text-ink disabled:opacity-30"
                                aria-label={`Move ${product.name} left`}
                              >
                                <ChevronLeft className="size-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => move(index, 1)}
                                disabled={index === selected.length - 1}
                                className="focus-ring grid size-8 place-items-center rounded-r-md border border-l-0 border-line text-ink-faint hover:text-ink disabled:opacity-30"
                                aria-label={`Move ${product.name} right`}
                              >
                                <ChevronRight className="size-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    {selected.length < 4 && (
                      <th scope="col" className="w-48 border-b border-l border-line bg-surface p-4 align-top">
                        <p className="eyebrow">Add object</p>
                        <Select
                          className="mt-2 h-9 text-xs"
                          value=""
                          onChange={(event) => {
                            if (!event.target.value) return;
                            const result = toggleCompare(event.target.value);
                            if (!result.ok) {
                              toast({ title: "Comparison is full", description: result.error, tone: "error" });
                            }
                          }}
                          aria-label="Add a product to comparison"
                        >
                          <option value="">Choose…</option>
                          {available.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </Select>
                        <p className="mt-2 text-2xs leading-relaxed text-ink-faint">Up to four objects. Remove one to swap.</p>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleGroups.length === 0 && (
                    <tr>
                      <td colSpan={selected.length + (selected.length < 4 ? 2 : 1)} className="px-4 py-8 text-center text-xs text-ink-faint">
                        These objects share every compared attribute. Turn off “Differences only” to inspect the shared values.
                      </td>
                    </tr>
                  )}
                  {visibleGroups.map((group) => (
                    <React.Fragment key={group.group}>
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={selected.length + (selected.length < 4 ? 2 : 1)}
                          className="border-y border-line bg-surface px-4 py-2 text-left"
                        >
                          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-copper">{group.group}</span>
                        </th>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={`${group.group}-${row.label}`} className="border-b border-line last:border-0">
                          <th scope="row" className="sticky left-0 z-10 bg-surface-raised px-4 py-3 text-left align-top text-xs font-medium text-ink-soft">
                            <span className="flex items-center gap-2">
                              {row.label}
                              {row.differs && (
                                <span className="rounded-full bg-copper-soft px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-copper">
                                  differs
                                </span>
                              )}
                            </span>
                          </th>
                          {selected.map((product, index) => (
                            <td key={`${product.id}-${row.label}`} className="px-4 py-3 align-top text-xs text-ink">
                              {valueFor(row, row.values[index] ?? null)}
                            </td>
                          ))}
                          {selected.length < 4 && <td className="border-l border-line" aria-hidden="true" />}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Ready to decide?</p>
                <p className="mt-1 text-xs text-ink-soft">
                  Comparison persists while you browse. Open a product to choose a variant before adding it.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/products">Keep browsing</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/cart">
                    Review bag <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-2xs text-ink-faint">
              <Check className="size-3.5 text-teal" aria-hidden="true" />
              Differences are computed from the same demo product records used by the storefront and seller workspace.
            </div>
          </>
        )}
      </div>
    </>
  );
}
