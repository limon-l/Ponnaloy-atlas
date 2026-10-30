"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Eye, Heart, Plus, Scale, Star } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/controls";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { discountPercent, inStock } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { addToCart, toggleCompare, toggleWishlist, useAtlasState } from "@/lib/store";
import { cn, formatMoney } from "@/lib/utils";

export type ProductCardVariant = "standard" | "compact" | "featured" | "horizontal" | "deal" | "related";

const MEDIA_ASPECT: Record<ProductCardVariant, string> = {
  standard: "aspect-[4/5]",
  compact: "aspect-square",
  featured: "aspect-[5/6]",
  horizontal: "aspect-square",
  deal: "aspect-[4/5]",
  related: "aspect-[4/5]",
};

function totalStock(product: Product) {
  return product.stock + product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function ProductCard({
  product,
  sellerName,
  className,
  compact = false,
  variant,
}: {
  product: Product;
  sellerName?: string;
  className?: string;
  compact?: boolean;
  variant?: ProductCardVariant;
}) {
  const resolved: ProductCardVariant = variant ?? (compact ? "compact" : "standard");
  const state = useAtlasState();
  const { toast } = useToast();
  const saved = state.wishlist.includes(product.id);
  const comparing = state.compare.includes(product.id);
  const discount = discountPercent(product);
  const available = inStock(product);
  const stock = totalStock(product);
  const lowStock = available && stock > 0 && stock <= 6;
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);
  const addedTimer = React.useRef<number | null>(null);

  const defaultVariant = product.variants.find((entry) => entry.stock > 0) ?? product.variants[0];
  const [quickViewVariant, setQuickViewVariant] = React.useState<string | undefined>(defaultVariant?.id);
  const selectedQuickViewVariant =
    product.variants.find((entry) => entry.id === quickViewVariant) ?? defaultVariant;
  const quickViewStock = selectedQuickViewVariant?.stock ?? 0;
  const quickViewPrice = product.price + (selectedQuickViewVariant?.priceDelta ?? 0);

  React.useEffect(() => {
    return () => {
      if (addedTimer.current) window.clearTimeout(addedTimer.current);
    };
  }, []);

  const markAdded = () => {
    setJustAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setJustAdded(false), 1400);
  };

  const addToBag = (variantId?: string, quantity = 1) => {
    const result = addToCart(product.id, variantId, quantity);
    toast({
      title: result.ok ? `${product.name} added to bag` : "Could not add to bag",
      description: result.ok ? "Demo basket · no payment will be taken." : result.error,
      tone: result.ok ? "success" : "error",
    });
    if (result.ok) markAdded();
    return result.ok;
  };

  const save = () => {
    const result = toggleWishlist(product.id);
    if (result.ok) {
      toast({
        title: saved ? "Removed from wishlist" : "Saved to wishlist",
        description: saved ? undefined : "Find it in your wishlist at any time.",
        tone: "info",
      });
    }
  };

  const compare = () => {
    const result = toggleCompare(product.id);
    toast({
      title: result.ok
        ? comparing
          ? "Removed from comparison"
          : "Added to comparison"
        : "Comparison is full",
      description: result.ok ? undefined : result.error,
      tone: result.ok ? "info" : "error",
    });
  };

  const horizontal = resolved === "horizontal";
  const compactCard = resolved === "compact";
  const featured = resolved === "featured";
  const deal = resolved === "deal";
  const related = resolved === "related";

  return (
    <article
      data-variant={resolved}
      className={cn(
        "group relative flex h-full overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,box-shadow,transform] duration-base ease-atlas hover:-translate-y-0.5 hover:border-line-strong hover:shadow-whisper focus-within:border-line-strong",
        horizontal ? "flex-row" : "flex-col",
        featured && "rounded-2xl shadow-whisper",
        deal && "border-copper/35",
        compactCard && "rounded-lg",
        className
      )}
    >
      <div className={cn("relative shrink-0", horizontal ? "w-[42%] self-stretch" : "w-full")}>
        <Link
          href={`/product/${product.slug}`}
          className={cn(
            "focus-ring block overflow-hidden bg-surface",
            horizontal ? "h-full min-h-36" : MEDIA_ASPECT[resolved]
          )}
          aria-label={`${product.name} by ${sellerName ?? product.brand}`}
        >
          <span className="block h-full w-full transition-transform duration-[720ms] ease-atlas group-hover:scale-[1.035]">
            <ProductArt art={product.art} palette={product.palette} />
          </span>
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/25 via-transparent to-transparent opacity-0 transition-opacity duration-base group-hover:opacity-100"
            aria-hidden="true"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.newArrival && <Badge variant="solid">New</Badge>}
          {product.bestseller && <Badge variant="teal">Bestseller</Badge>}
          {discount !== null && <Badge variant="copper">−{discount}%</Badge>}
          {deal && <Badge variant="copper">Deal</Badge>}
          {!available && <Badge variant="neutral">Sold out</Badge>}
        </div>

        <div
          className={cn(
            "absolute right-3 top-3 flex flex-col gap-1.5",
            "opacity-100 transition-[opacity,transform] duration-base sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100"
          )}
        >
          <SimpleTooltip label={saved ? "Remove from wishlist" : "Save to wishlist"}>
            <button
              type="button"
              aria-pressed={saved}
              onClick={save}
              className={cn(
                "focus-ring flex size-9 items-center justify-center rounded-full border border-line/80 bg-surface-raised/92 text-ink-soft shadow-whisper backdrop-blur transition-[color,border-color,transform] hover:text-ink active:scale-90",
                saved && "border-copper/40 text-copper"
              )}
            >
              <Heart className={cn("size-4 transition-transform", saved && "scale-110 fill-copper")} aria-hidden="true" />
              <span className="sr-only">{saved ? "Remove from wishlist" : "Save to wishlist"}</span>
            </button>
          </SimpleTooltip>
          <SimpleTooltip label="Quick view">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="focus-ring flex size-9 items-center justify-center rounded-full border border-line/80 bg-surface-raised/92 text-ink-soft shadow-whisper backdrop-blur transition-[color,transform] hover:text-ink active:scale-90"
            >
              <Eye className="size-4" aria-hidden="true" />
              <span className="sr-only">Quick view {product.name}</span>
            </button>
          </SimpleTooltip>
          <SimpleTooltip label={comparing ? "Remove from comparison" : "Add to comparison"}>
            <button
              type="button"
              aria-pressed={comparing}
              onClick={compare}
              className={cn(
                "focus-ring flex size-9 items-center justify-center rounded-full border border-line/80 bg-surface-raised/92 text-ink-soft shadow-whisper backdrop-blur transition-[color,border-color,transform] hover:text-ink active:scale-90",
                comparing && "border-teal/40 text-teal"
              )}
            >
              <Scale className="size-4" aria-hidden="true" />
              <span className="sr-only">{comparing ? "Remove from comparison" : "Add to comparison"}</span>
            </button>
          </SimpleTooltip>
        </div>
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          compactCard ? "p-3" : featured ? "p-5" : horizontal ? "p-4" : "p-4"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-2xs uppercase tracking-[0.12em] text-ink-faint">{sellerName ?? product.brand}</p>
          <span className="inline-flex shrink-0 items-center gap-1 text-2xs text-ink-soft">
            <Star className="size-3 fill-copper text-copper" aria-hidden="true" />
            <span className="tabular">{product.rating > 0 ? product.rating.toFixed(1) : "—"}</span>
            {product.reviewCount > 0 && <span className="sr-only">from {product.reviewCount} reviews</span>}
          </span>
        </div>

        <h3
          id={`product-${product.id}-title`}
          className={cn(
            "mt-1.5 text-balance font-display leading-snug tracking-[-0.015em] text-ink",
            compactCard ? "text-[0.9375rem]" : featured ? "text-xl" : "text-lg"
          )}
        >
          <Link href={`/product/${product.slug}`} className="focus-ring rounded-xs">
            {product.name}
          </Link>
        </h3>

        {!compactCard && !related && (
          <p className={cn("mt-0.5 text-xs text-ink-faint", horizontal ? "line-clamp-2" : "line-clamp-1")}>
            {product.subtitle}
          </p>
        )}

        {lowStock && (
          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-medium text-warning">
            <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
            Only {stock} left
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="tabular text-sm font-semibold text-ink">{formatMoney(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="tabular text-2xs text-ink-faint line-through">{formatMoney(product.compareAtPrice)}</p>
            )}
          </div>
          <SimpleTooltip label={available ? "Add to bag" : "Sold out"}>
            <Button
              size="icon-sm"
              variant={justAdded ? "copper" : available ? "primary" : "quiet"}
              disabled={!available}
              onClick={() => {
                if (!available) return;
                const entry = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
                addToBag(entry?.id);
              }}
              aria-label={available ? `Add ${product.name} to bag` : `${product.name} is sold out`}
            >
              <span className="relative grid size-4 place-items-center" aria-hidden="true">
                <Plus
                  className={cn(
                    "absolute size-4 transition-all duration-200",
                    justAdded ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
                  )}
                />
                <Check
                  className={cn(
                    "absolute size-4 transition-all duration-200",
                    justAdded ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  )}
                />
              </span>
            </Button>
          </SimpleTooltip>
        </div>
      </div>

      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-5">
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="aspect-[4/5]">
                <ProductArt art={product.art} palette={product.palette} title={`${product.name} quick view`} />
              </div>
            </div>
            <div className="min-w-0">
              <DialogHeader>
                <p className="text-2xs uppercase tracking-[0.12em] text-ink-faint">{sellerName ?? product.brand}</p>
                <DialogTitle className="font-display text-2xl leading-tight tracking-[-0.025em]">
                  {product.name}
                </DialogTitle>
                <DialogDescription>{product.subtitle}</DialogDescription>
              </DialogHeader>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="tabular font-display text-2xl tracking-[-0.02em] text-ink">{formatMoney(quickViewPrice)}</p>
                <span className="inline-flex items-center gap-1 text-2xs text-ink-soft">
                  <Star className="size-3 fill-copper text-copper" aria-hidden="true" />
                  {product.rating > 0 ? `${product.rating.toFixed(1)} (${product.reviewCount})` : "No reviews"}
                </span>
              </div>

              <label className="mt-4 block">
                <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink">
                  {product.variantLabel}
                </span>
                <Select
                  value={selectedQuickViewVariant?.id ?? ""}
                  onChange={(event) => setQuickViewVariant(event.target.value)}
                  className="mt-1.5"
                  aria-label={`Choose ${product.variantLabel} for ${product.name}`}
                >
                  {product.variants.map((entry) => (
                    <option key={entry.id} value={entry.id} disabled={entry.stock <= 0}>
                      {entry.option} · {formatMoney(product.price + entry.priceDelta)}
                      {entry.stock <= 0 ? " — sold out" : ""}
                    </option>
                  ))}
                </Select>
              </label>

              <p className="mt-1.5 text-2xs text-ink-faint">
                {quickViewStock > 0 ? `${quickViewStock} available · ships from ${sellerName ?? product.brand}` : "This option is sold out"}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  disabled={quickViewStock <= 0}
                  onClick={() => {
                    const ok = addToBag(selectedQuickViewVariant?.id);
                    if (ok) setQuickViewOpen(false);
                  }}
                >
                  {quickViewStock > 0 ? "Add to bag" : "Sold out"}
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/product/${product.slug}`}>View full details</Link>
                </Button>
              </div>

              <p className="mt-3 border-t border-line pt-3 text-2xs leading-relaxed text-ink-faint">
                Quick view uses the same catalogue record, stock and variant pricing as the product page.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
