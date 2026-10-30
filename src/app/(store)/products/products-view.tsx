"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, Filter, Search, X } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { Checkbox, Switch } from "@/components/ui/controls";
import { Input, Label, Select } from "@/components/ui/input";
import { filterProducts, parseFilters, toSearchParams } from "@/lib/catalog";
import { useCatalog, useSellers } from "@/lib/hooks";
import { categories } from "@/lib/seed";
import type { ProductFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

const priceBands = [
  { label: "Any price", min: undefined, max: undefined },
  { label: "Under $50", min: undefined, max: 5000 },
  { label: "$50 – $150", min: 5000, max: 15000 },
  { label: "$150 – $300", min: 15000, max: 30000 },
  { label: "$300 and above", min: 30000, max: undefined },
];

const ratings = [0, 4, 4.5];

export function ProductsView() {
  const products = useCatalog();
  const sellers = useSellers();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = React.useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [query, setQuery] = React.useState(filters.q);
  const [mobileFilters, setMobileFilters] = React.useState(false);

  React.useEffect(() => {
    setQuery(filters.q);
  }, [filters.q]);

  const results = React.useMemo(() => filterProducts(products, filters), [products, filters]);
  const approvedCount = React.useMemo(
    () => products.filter((product) => product.moderation === "APPROVED" && !product.archived).length,
    [products]
  );
  const activeCount =
    filters.categories.length +
    filters.sellers.length +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  const update = React.useCallback(
    (patch: Partial<ProductFilters>) => {
      const next = { ...filters, ...patch };
      const params = toSearchParams(next).toString();
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  const toggleList = (key: "categories" | "sellers", value: string) => {
    const set = new Set(filters[key]);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    update({ [key]: [...set] });
  };

  const clearAll = () => router.replace(pathname, { scroll: false });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    update({ q: query.trim() });
  };

  const priceBand = priceBands.find(
    (band) => band.min === filters.minPrice && band.max === filters.maxPrice
  );
  const priceValue = priceBand ? priceBands.indexOf(priceBand) : 0;

  const filterPanel = (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">Category</legend>
        <div className="mt-3 space-y-2.5">
          {categories.map((category) => (
            <label key={category.slug} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
              <Checkbox
                checked={filters.categories.includes(category.slug)}
                onCheckedChange={() => toggleList("categories", category.slug)}
              />
              <span className="flex-1">{category.name}</span>
              <span className="tabular text-2xs text-ink-faint">
                {products.filter((product) => product.category === category.slug && product.moderation === "APPROVED").length}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-line pt-6">
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">Studio</legend>
        <div className="mt-3 space-y-2.5">
          {sellers
            .filter((seller) => seller.status === "APPROVED")
            .map((seller) => (
              <label key={seller.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
                <Checkbox
                  checked={filters.sellers.includes(seller.id)}
                  onCheckedChange={() => toggleList("sellers", seller.id)}
                />
                <span className="flex-1">{seller.name}</span>
                <span className="tabular text-2xs text-ink-faint">
                  {products.filter((product) => product.sellerId === seller.id && product.moderation === "APPROVED").length}
                </span>
              </label>
            ))}
        </div>
      </fieldset>

      <div className="border-t border-line pt-6">
        <Label htmlFor="filter-price">Price</Label>
        <Select
          id="filter-price"
          className="mt-2"
          value={priceValue}
          onChange={(event) => {
            const band = priceBands[Number(event.target.value)]!;
            update({ minPrice: band.min, maxPrice: band.max });
          }}
        >
          {priceBands.map((band, index) => (
            <option key={band.label} value={index}>
              {band.label}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="border-t border-line pt-6">
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">Rating</legend>
        <div className="mt-3 space-y-2">
          {ratings.map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
              <input
                type="radio"
                name="rating"
                className="size-3.5 accent-teal"
                checked={filters.minRating === rating}
                onChange={() => update({ minRating: rating })}
              />
              {rating === 0 ? "Any rating" : `${rating.toFixed(1)} and above`}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        <Label htmlFor="in-stock">In stock only</Label>
        <Switch
          id="in-stock"
          checked={filters.inStockOnly}
          onCheckedChange={(checked) => update({ inStockOnly: checked })}
          aria-label="Show in-stock products only"
        />
      </div>

      <Button variant="outline" className="w-full" onClick={clearAll} disabled={activeCount === 0 && !filters.q}>
        Clear all filters
      </Button>
    </div>
  );

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-10 sm:py-14">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-6 bg-copper" aria-hidden="true" />
            The catalogue
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-display-xs text-ink">All objects</h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                {approvedCount} vetted objects from independent studios. Filter by room, material or price; compare up to four
                without losing your place.
              </p>
            </div>
            <form onSubmit={submitSearch} className="flex w-full max-w-md gap-2" role="search">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search names, materials, studios…"
                  aria-label="Search the catalogue"
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-medium text-ink">Refine</h2>
                {activeCount > 0 && <Badge variant="teal">{activeCount} active</Badge>}
              </div>
              {filterPanel}
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-ink-soft" role="status" aria-live="polite">
                  <span className="tabular font-medium text-ink">{results.length}</span>{" "}
                  {results.length === 1 ? "object" : "objects"}
                  {filters.q && (
                    <>
                      {" "}
                      for <span className="font-medium text-ink">“{filters.q}”</span>
                    </>
                  )}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFilters(true)}
                >
                  <Filter className="size-4" aria-hidden="true" />
                  Filters
                  {activeCount > 0 && (
                    <span className="tabular grid size-4 place-items-center rounded-full bg-teal text-[0.5625rem] text-white">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </div>

              <label className="flex items-center gap-2 text-xs text-ink-faint">
                <ArrowDownUp className="size-3.5" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Sort</span>
                <Select
                  value={filters.sort}
                  onChange={(event) => update({ sort: event.target.value as ProductFilters["sort"] })}
                  className="h-9 w-auto min-w-36 border-line text-xs"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Highest rated</option>
                </Select>
              </label>
            </div>

            {(activeCount > 0 || filters.q) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {filters.q && (
                  <FilterChip label={`“${filters.q}”`} onRemove={() => update({ q: "" })} />
                )}
                {filters.categories.map((slug) => (
                  <FilterChip
                    key={slug}
                    label={categories.find((category) => category.slug === slug)?.name ?? slug}
                    onRemove={() => toggleList("categories", slug)}
                  />
                ))}
                {filters.sellers.map((id) => (
                  <FilterChip
                    key={id}
                    label={sellers.find((seller) => seller.id === id)?.name ?? id}
                    onRemove={() => toggleList("sellers", id)}
                  />
                ))}
                {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                  <FilterChip
                    label={priceBand?.label ?? "Custom price"}
                    onRemove={() => update({ minPrice: undefined, maxPrice: undefined })}
                  />
                )}
                {filters.inStockOnly && <FilterChip label="In stock" onRemove={() => update({ inStockOnly: false })} />}
                {filters.minRating > 0 && (
                  <FilterChip label={`${filters.minRating}+ rated`} onRemove={() => update({ minRating: 0 })} />
                )}
                <button type="button" onClick={clearAll} className="focus-ring rounded px-1 text-2xs text-ink-faint underline-offset-4 hover:text-ink hover:underline">
                  Clear all
                </button>
              </div>
            )}

            <div className="mt-6">
              <ProductGrid products={results} columns={3} emptyAction={{ label: "Clear filters", href: "/products" }} />
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-line pt-4 text-2xs text-ink-faint">
              <span>Showing {results.length} of {approvedCount} approved objects</span>
              <span>Synthetic catalogue · demo data</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={mobileFilters} onOpenChange={setMobileFilters}>
        <SheetContent side="left" className="w-[min(90vw,22rem)] p-0 lg:hidden">
          <div className="border-b border-line px-5 py-4 pr-14">
            <DialogTitle className="font-display text-xl">Refine</DialogTitle>
            <p className="mt-0.5 text-xs text-ink-faint">{activeCount} active filters</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
          <div className="border-t border-line p-4">
            <Button className="w-full" onClick={() => setMobileFilters(false)}>
              Show {results.length} {results.length === 1 ? "object" : "objects"}
            </Button>
          </div>
        </SheetContent>
      </Dialog>
    </>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-raised py-1 pl-2.5 pr-1 text-2xs text-ink-soft">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className={cn("focus-ring grid size-5 place-items-center rounded-full text-ink-faint hover:bg-ink/[0.06] hover:text-ink")}
        aria-label={`Remove filter ${label}`}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}
