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

export function ProductCard({
  product,
  sellerName,
  className,
  compact = false,
}: {
  product: Product;
  sellerName?: string;
  className?: string;
  compact?: boolean;
}) {
  const state = useAtlasState();
  const { toast } = useToast();
  const testimonial = product.reviewCount > 0 ? product.reviewCount : undefined;
  const saved = state.wishlist.includes(product.id);
  const comparing = state.compare.includes(product.id);
  const discount = discountPercent(product);
  const available = inStock(product);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);
  const defaultVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const [quickViewVariant, setQuickViewVariant] = React.useState<string | undefined>(defaultVariant?.id);
  const selectedQuickViewVariant =
    product.variants.find((variant) => variant.id === quickViewVariant) ?? defaultVariant;
  const quickViewStock = selectedQuickViewVariant?.stock ?? 0;
  const quickViewPrice = product.price + (selectedQuickViewVariant?.priceDelta ?? 0);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,box-shadow,transform] duration-base ease-atlas hover:-translate-y-0.5 hover:border-line-strong hover:shadow-whisper focus-within:border-line-strong",
        className
      )}
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="focus-ring block aspect-[4/5] overflow-hidden bg-surface"
          aria-label={`${product.name} by ${sellerName ?? product.brand}`}
        >
          <span className="block h-full w-full transition-transform duration-slow ease-atlas group-hover:scale-[1.025]">
            <ProductArt art={product.art} palette={product.palette} />
          </span>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.newArrival && <Badge variant="solid">New</Badge>}
          {product.bestseller && <Badge variant="teal">Bestseller</Badge>}
          {discount !== null && <Badge variant="copper">−{discount}%</Badge>}
          {!available && <Badge variant="neutral">Sold out</Badge>}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <SimpleTooltip label={saved ? "Remove from wishlist" : "Save to wishlist"}>
            <button
              type="button"
              aria-pressed={saved}
              onClick={() => {
                const result = toggleWishlistSafe(product.id);
                if (result.ok) {
                  toast({
                    title: saved ? "Removed from wishlist" : "Saved to wishlist",
                    description: saved ? undefined : "Find it in your wishlist at any time.",
                    tone: "info",
                  });
                }
              }}
              className={cn(
                "focus-ring flex size-9 items-center justify-center rounded-full border border-line/80 bg-surface-raised/90 text-ink-soft shadow-whisper backdrop-blur transition-colors hover:text-ink",
                saved && "border-copper/30 text-copper"
              )}
            >
              <Heart className={cn("size-4", saved && "fill-copper")} aria-hidden="true" />
              <span className="sr-only">{saved ? "Remove from wishlist" : "Save to wishlist"}</span>
            </button>
          </SimpleTooltip>
          <SimpleTooltip label="Quick view">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="focus-ring flex size-9 items-center justify-center rounded-full border border-line/80 bg-surface-raised/90 text-ink-soft shadow-whisper backdrop-blur transition-colors hover:text-ink"
            >
              <Eye className="size-4" aria-hidden="true" />
              <span className="sr-only">Quick view {product.name}</span>
            </button>
          </SimpleTooltip>
          <SimpleTooltip label={comparing ? "Remove from comparison" : "Add to comparison"}>
            <button
              type="button"
              aria-pressed={comparing}
              onClick={() => {
                const result = toggleCompareSafe(product.id);
                toast({
                  title: result.ok
                    ? comparing
                      ? "Removed from comparison"
                      : "Added to comparison"
                    : "Comparison is full",
                  description: result.ok ? undefined : result.error,
                  tone: result.ok ? "info" : "error",
                });
              }}
              className={cn(
                "focus-ring flex size-9 items-center justify-center rounded-full border border-line/80 bg-surface-raised/90 text-ink-soft shadow-whisper backdrop-blur transition-colors hover:text-ink",
                comparing && "border-teal/30 text-teal"
              )}
            >
              <Scale className="size-4" aria-hidden="true" />
              <span className="sr-only">{comparing ? "Remove from comparison" : "Add to comparison"}</span>
            </button>
          </SimpleTooltip>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-4", compact && "p-3.5")}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-2xs uppercase tracking-[0.12em] text-ink-faint">{sellerName ?? product.brand}</p>
          <span className="inline-flex shrink-0 items-center gap-1 text-2xs text-ink-soft">
            <Star className="size-3 fill-copper text-copper" aria-hidden="true" />
            <span className="tabular">{product.rating > 0 ? product.rating.toFixed(1) : "—"}</span>
            {testimonial && <span className="text-ink-faint">({testimonial})</span>}
          </span>
        </div>

        <h3 className="mt-1.5 font-display text-lg leading-snug tracking-[-0.015em] text-ink">
          <Link href={`/product/${product.slug}`} className="focus-ring rounded-xs">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">{product.subtitle}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="tabular text-sm font-semibold text-ink">{formatMoney(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="tabular text-2xs text-ink-faint line-through">{formatMoney(product.compareAtPrice)}</p>
            )}
          </div>
          <Button
            size="icon-sm"
            variant={available ? "primary" : "quiet"}
            disabled={!available}
            onClick={() => {
              if (!available) return;
              const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
              const result = addToBagSafe(product.id, variant?.id);
              toast({
                title: result.ok ? `${product.name} added to bag` : "Could not add to bag",
                description: result.ok ? "Demo basket · no payment will be taken." : result.error,
                tone: result.ok ? "success" : "error",
              });
            }}
            aria-label={available ? `Add ${product.name} to bag` : `${product.name} is sold out`}
          >
            {available ? <Plus aria-hidden="true" /> : <Check aria-hidden="true" />}
          </Button>
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
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                      {variant.option} · {formatMoney(product.price + variant.priceDelta)}
                      {variant.stock <= 0 ? " — sold out" : ""}
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
                    const result = addToBagSafe(product.id, selectedQuickViewVariant?.id);
                    toast({
                      title: result.ok ? `${product.name} added to bag` : "Could not add to bag",
                      description: result.ok
                        ? `${selectedQuickViewVariant?.option ?? product.variantLabel} · demo basket, no payment taken.`
                        : result.error,
                      tone: result.ok ? "success" : "error",
                    });
                    if (result.ok) setQuickViewOpen(false);
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

/* The store is a singleton module; these wrappers keep the component readable
   while still calling the imported mutations through one place. */
function toggleWishlistSafe(id: string) {
  return toggleWishlist(id);
}
function toggleCompareSafe(id: string) {
  return toggleCompare(id);
}
function addToBagSafe(id: string, variantId?: string) {
  return addToCart(id, variantId, 1);
}
