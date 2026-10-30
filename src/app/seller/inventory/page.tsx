"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Boxes, Check, Download, PackageCheck, Search } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useCatalog, useSellers } from "@/lib/hooks";
import { updateStock, useAtlasState } from "@/lib/store";
import type { Product } from "@/lib/types";
import { downloadCsv, formatMoney, titleCase } from "@/lib/utils";

type StockFilter = "all" | "low" | "out" | "healthy";

function StockEditor({
  product,
  variantId,
  label,
  stock,
  threshold,
}: {
  product: Product;
  variantId?: string;
  label: string;
  stock: number;
  threshold: number;
}) {
  const { toast } = useToast();
  const [value, setValue] = React.useState(String(stock));

  React.useEffect(() => {
    setValue(String(stock));
  }, [stock]);

  const commit = () => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100000) {
      toast({ title: "Stock not saved", description: "Enter a whole number between 0 and 100,000.", tone: "error" });
      setValue(String(stock));
      return;
    }
    if (parsed === stock) return;
    const result = updateStock(product.id, variantId, parsed);
    toast({
      title: result.ok ? "Stock updated" : "Stock not saved",
      description: result.ok
        ? `${product.name} · ${label} · ${parsed} units. Persisted in this browser.`
        : result.error,
      tone: result.ok ? "success" : "error",
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setValue(String(stock));
            event.currentTarget.blur();
          }
        }}
        className={`h-8 w-20 text-xs ${stock <= threshold ? "border-warning/50" : ""}`}
        aria-label={`Stock for ${product.name}, ${label}`}
      />
      <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">units</span>
    </div>
  );
}

export default function SellerInventoryPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<StockFilter>("all");
  const threshold = state.settings.lowStockThreshold;

  const scoped = React.useMemo(
    () => products.filter((product) => product.sellerId === state.sellerId && !product.archived),
    [products, state.sellerId]
  );

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .map((product) => {
        const options = product.variants.length
          ? product.variants.map((variant) => ({
              key: variant.id,
              variantId: variant.id as string | undefined,
              label: variant.option,
              stock: variant.stock,
              price: product.price + variant.priceDelta,
            }))
          : [{ key: "base", variantId: undefined, label: product.variantLabel, stock: product.stock, price: product.price }];
        const stock = options.reduce((sum, option) => sum + option.stock, 0);
        return { product, options, stock };
      })
      .filter((entry) => {
        if (filter === "low") return entry.stock > 0 && entry.stock <= threshold;
        if (filter === "out") return entry.stock === 0;
        if (filter === "healthy") return entry.stock > threshold;
        return true;
      })
      .filter((entry) =>
        q ? [entry.product.name, entry.product.subtitle, entry.product.category, ...entry.product.tags].join(" ").toLowerCase().includes(q) : true
      )
      .sort((a, b) => a.stock - b.stock);
  }, [scoped, filter, threshold, query]);

  const units = scoped.reduce(
    (sum, product) => sum + product.stock + product.variants.reduce((variantSum, variant) => variantSum + variant.stock, 0),
    0
  );
  const retailValue = scoped.reduce(
    (sum, product) =>
      sum +
      product.stock * product.price +
      product.variants.reduce((variantSum, variant) => variantSum + variant.stock * (product.price + variant.priceDelta), 0),
    0
  );
  const lowCount = scoped.filter((product) => {
    const stock = product.stock + product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    return stock > 0 && stock <= threshold;
  }).length;
  const outCount = scoped.filter(
    (product) => product.stock + product.variants.reduce((sum, variant) => sum + variant.stock, 0) === 0
  ).length;

  const exportInventory = () => {
    if (scoped.length === 0) {
      toast({ title: "Nothing to export", description: "This studio has no active listings.", tone: "error" });
      return;
    }
    downloadCsv(
      `ponnaloy-inventory-${seller?.slug ?? "studio"}.csv`,
      scoped.flatMap((product) =>
        (product.variants.length ? product.variants : [{ option: product.variantLabel, stock: product.stock, priceDelta: 0 }]).map(
          (option) => ({
            product: product.name,
            option: option.option,
            moderation: product.moderation,
            stock: option.stock,
            price_usd: ((product.price + option.priceDelta) / 100).toFixed(2),
            value_usd: (((product.price + option.priceDelta) * option.stock) / 100).toFixed(2),
          })
        )
      )
    );
    toast({ title: "Inventory exported", description: `${scoped.length} listings written locally.`, tone: "success" });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${seller?.name ?? "Seller workspace"} · Inventory`}
        title="Stock, without guesswork"
        description="Edit stock per listing option. Changes update the storefront availability, comparison studio and this browser's persisted demo state immediately."
        meta={
          <>
            <Badge variant="teal">{scoped.length} active listings</Badge>
            <Badge variant="outline">{threshold}-unit low-stock threshold</Badge>
            <Badge variant="warning">Browser-local inventory</Badge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportInventory}>
              <Download className="size-4" aria-hidden="true" /> Export CSV
            </Button>
            <Button asChild size="sm">
              <Link href="/seller/products">Open product editor</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Units on hand", value: String(units), detail: "All listing options", icon: Boxes },
          { label: "Retail value", value: formatMoney(retailValue), detail: "At current listing prices", icon: PackageCheck },
          { label: "Low stock", value: String(lowCount), detail: `At or below ${threshold} units`, icon: AlertTriangle },
          { label: "Out of stock", value: String(outCount), detail: "Unavailable to customers", icon: AlertTriangle },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-line bg-surface-raised p-4 shadow-whisper">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{metric.label}</p>
              <metric.icon className={`size-4 ${metric.label === "Out of stock" || metric.label === "Low stock" ? "text-warning" : "text-copper"}`} aria-hidden="true" />
            </div>
            <p className="tabular mt-2 font-display text-[1.6rem] leading-none tracking-[-0.03em] text-ink">{metric.value}</p>
            <p className="mt-2 text-[0.625rem] text-ink-faint">{metric.detail}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Inventory ledger"
        description="Every option is editable inline. Press Enter or leave the field to save; Escape reverts."
        action={<Badge variant="outline">{rows.length} listings shown</Badge>}
      >
        <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search listings…"
              aria-label="Search inventory"
              className="h-9 pl-8 text-xs"
            />
          </div>
          <Select
            value={filter}
            onChange={(event) => setFilter(event.target.value as StockFilter)}
            className="h-9 text-xs sm:w-44"
            aria-label="Filter inventory"
          >
            <option value="all">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="healthy">Healthy stock</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <div className="py-12 text-center">
            <Boxes className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">No listings match</p>
            <p className="mt-1 text-xs text-ink-faint">Clear the filter or create a new listing in the product editor.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {rows.map(({ product, options, stock }) => (
              <section key={product.id} className="rounded-lg border border-line bg-surface">
                <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-2.5">
                  <span className="size-9 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{product.name}</p>
                    <p className="truncate text-[0.625rem] text-ink-faint">
                      {titleCase(product.category)} · {product.variants.length} {product.variants.length === 1 ? "option" : "options"}
                    </p>
                  </div>
                  <Badge variant={product.moderation === "APPROVED" ? "success" : product.moderation === "PENDING" ? "warning" : "danger"}>
                    {product.moderation.toLowerCase()}
                  </Badge>
                  <Badge variant={stock === 0 ? "danger" : stock <= threshold ? "warning" : "outline"}>
                    {stock} units
                  </Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/product/${product.slug}`}>View</Link>
                  </Button>
                </div>
                <ul className="divide-y divide-line">
                  {options.map((option) => (
                    <li key={option.key} className="flex flex-wrap items-center gap-3 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.6875rem] font-medium text-ink">{option.label}</p>
                        <p className="text-[0.625rem] text-ink-faint">{formatMoney(option.price)}</p>
                      </div>
                      {option.stock === 0 && <Badge variant="danger">Sold out</Badge>}
                      {option.stock > 0 && option.stock <= threshold && <Badge variant="warning">Low</Badge>}
                      <StockEditor
                        product={product}
                        variantId={option.variantId}
                        label={option.label}
                        stock={option.stock}
                        threshold={threshold}
                      />
                      <Check className="size-3.5 text-success" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        <p className="mt-3 text-[0.625rem] text-ink-faint">
          Stock edits do not create purchase orders, reservations or warehouse sync events. They update the demo catalogue
          only. Production inventory would use an audited server transaction with concurrency control.
        </p>
      </Panel>

      <WorkspaceNote>
        Inventory belongs to the selected demo studio. Switch studios in Seller settings to inspect another scope. The
        customer catalogue, comparison studio and checkout availability all read the same edited values.
      </WorkspaceNote>
    </div>
  );
}
