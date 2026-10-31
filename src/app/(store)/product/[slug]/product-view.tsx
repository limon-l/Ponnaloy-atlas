"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductArt } from "@/components/product-art";
import { ProductGrid } from "@/components/product-grid";
import { Rating } from "@/components/rating";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { discountPercent, inStock, relatedProducts, variantStock } from "@/lib/catalog";
import { useCatalog, useSellers } from "@/lib/hooks";
import { addToCart, recordView, toggleCompare, toggleWishlist, useAtlasState } from "@/lib/store";
import { DEMO_NOW } from "@/lib/seed";
import { cn, formatDate, formatMoney } from "@/lib/utils";

export function ProductView({ slug }: { slug: string }) {
  const products = useCatalog();
  const sellers = useSellers();
  const state = useAtlasState();
  const { toast } = useToast();
  const product = products.find((item) => item.slug === slug);
  const [variantId, setVariantId] = React.useState<string | undefined>(product?.variants[0]?.id);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (product) recordView(product.id);
  }, [product]);

  React.useEffect(() => {
    setVariantId(product?.variants[0]?.id);
    setQuantity(1);
  }, [product?.id, product?.variants]);

  if (!product) {
    return (
      <div className="atlas-container py-20">
        <EmptyState
          icon={PackageCheck}
          title="This object is not on the shelf"
          description="The link may be from a reset demo, or the listing is still in moderation. The full catalogue is a good place to restart."
          action={{ label: "Browse the catalogue", href: "/products" }}
          secondary={{ label: "View the journey", href: "/journey" }}
        />
      </div>
    );
  }

  const seller = sellers.find((item) => item.id === product.sellerId);
  const variant = product.variants.find((item) => item.id === variantId);
  const unitPrice = product.price + (variant?.priceDelta ?? 0);
  const stock = variantStock(product, variantId);
  const saved = state.wishlist.includes(product.id);
  const comparing = state.compare.includes(product.id);
  const discount = discountPercent(product);
  const related = relatedProducts(products, product, 4);
  const viewed = state.recentlyViewed
    .filter((id) => id !== product.id)
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 4);
  const dispatch = new Date(Date.parse(DEMO_NOW) + (seller?.fulfilmentSlaHours ?? 48) * 3_600_000);
  const arrival = new Date(dispatch.getTime() + 3 * 86_400_000);

  const add = () => {
    const result = addToCart(product.id, variantId, quantity);
    toast({
      title: result.ok ? `${product.name} added to bag` : "Could not add to bag",
      description: result.ok
        ? `${quantity} × ${variant?.option ?? product.variantLabel} · demo basket, no payment taken.`
        : result.error,
      tone: result.ok ? "success" : "error",
    });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            brand: { "@type": "Brand", name: product.brand },
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: (product.price / 100).toFixed(2),
              availability: inStock(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
            aggregateRating:
              product.reviewCount > 0
                ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
                : undefined,
          }),
        }}
      />

      <div className="atlas-container pt-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-2xs text-ink-faint">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="hover:text-ink">Catalogue</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/products?category=${product.category}`} className="capitalize hover:text-ink">
            {product.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink-soft" aria-current="page">{product.name}</span>
        </nav>
      </div>

      <section className="atlas-container grid gap-10 py-8 [&>*]:min-w-0 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:py-12">
        <div>
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface-raised">
            <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
              <ProductArt art={product.art} palette={product.palette} title={`${product.name} illustration`} />
            </div>
            <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
              {product.newArrival && <Badge variant="solid">New arrival</Badge>}
              {product.bestseller && <Badge variant="teal">Bestseller</Badge>}
              {discount !== null && <Badge variant="copper">−{discount}%</Badge>}
            </div>
            <div className="absolute right-4 top-4 flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast({ title: saved ? "Removed from wishlist" : "Saved to wishlist", tone: "info" });
                }}
                aria-pressed={saved}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                className={cn(
                  "focus-ring grid size-10 place-items-center rounded-full border border-line bg-surface-raised/92 text-ink-soft shadow-whisper backdrop-blur hover:text-ink",
                  saved && "border-copper/30 text-copper"
                )}
              >
                <Heart className={cn("size-4", saved && "fill-copper")} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const result = toggleCompare(product.id);
                  toast({
                    title: result.ok ? (comparing ? "Removed from comparison" : "Added to comparison") : "Comparison is full",
                    description: result.ok ? undefined : result.error,
                    tone: result.ok ? "info" : "error",
                  });
                }}
                aria-pressed={comparing}
                aria-label={comparing ? "Remove from comparison" : "Add to comparison"}
                className={cn(
                  "focus-ring grid size-10 place-items-center rounded-full border border-line bg-surface-raised/92 text-ink-soft shadow-whisper backdrop-blur hover:text-ink",
                  comparing && "border-teal/30 text-teal"
                )}
              >
                <Scale className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-1 rounded-md border border-line/70 bg-surface-raised/80 px-3 py-2 backdrop-blur">
              <p className="text-2xs text-ink-faint">Original vector study · no photography</p>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">Atlas / {product.category}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {["Front", "Profile", "Detail"].map((view, index) => (
              <div key={view} className="overflow-hidden rounded-lg border border-line bg-surface-raised">
                <div className="aspect-square">
                  <div
                    className={cn("h-full w-full", index === 1 && "scale-110", index === 2 && "scale-125")}
                    aria-hidden="true"
                  >
                    <ProductArt art={product.art} palette={product.palette} />
                  </div>
                </div>
                <p className="border-t border-line px-2 py-1.5 text-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  {view} study
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-2">
          <div className="flex items-center justify-between gap-3">
            {seller ? (
              <Link href={`/sellers/${seller.slug}`} className="editorial-link text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                {seller.name}
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            ) : (
              <span className="text-xs uppercase tracking-[0.12em] text-ink-faint">{product.brand}</span>
            )}
            <Badge variant="outline">Demo listing</Badge>
          </div>

          <h1 className="mt-3 font-display text-display-xs text-ink">{product.name}</h1>
          <p className="mt-2 text-base text-ink-soft">{product.subtitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} count={product.reviewCount} showEmpty />
            <a href="#reviews" className="text-2xs text-ink-faint underline-offset-4 hover:text-ink hover:underline">
              Read demo reviews
            </a>
            <span className="inline-flex items-center gap-1.5 text-2xs text-ink-faint">
              <PackageCheck className="size-3.5" aria-hidden="true" /> {stock > 0 ? `${stock} available` : "Sold out"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <p className="tabular font-display text-3xl tracking-[-0.02em] text-ink">{formatMoney(unitPrice)}</p>
            {product.compareAtPrice && product.compareAtPrice > unitPrice && (
              <p className="tabular text-sm text-ink-faint line-through">{formatMoney(product.compareAtPrice)}</p>
            )}
            <span className="text-2xs text-ink-faint">USD · tax calculated at checkout</span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          <fieldset className="mt-6">
            <legend className="flex w-full items-baseline justify-between gap-4 text-xs">
              <span className="font-semibold uppercase tracking-[0.12em] text-ink">{product.variantLabel}</span>
              <span className="text-ink-faint">{variant?.option ?? "—"}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((option) => {
                const selected = option.id === variantId;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-2 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors",
                      selected ? "border-teal bg-teal-soft text-teal" : "border-line text-ink-soft hover:border-line-strong",
                      option.stock <= 0 && "cursor-not-allowed opacity-45"
                    )}
                  >
                    <input
                      type="radio"
                      name="variant"
                      className="sr-only"
                      value={option.id}
                      checked={selected}
                      disabled={option.stock <= 0}
                      onChange={() => setVariantId(option.id)}
                    />
                    <span className="size-3 rounded-full border border-black/10" style={{ background: option.swatch }} aria-hidden="true" />
                    <span>{option.option}</span>
                    {option.priceDelta !== 0 && (
                      <span className="tabular text-2xs opacity-70">
                        {option.priceDelta > 0 ? "+" : "−"}
                        {formatMoney(Math.abs(option.priceDelta))}
                      </span>
                    )}
                    {option.stock <= 0 && <span className="sr-only">Sold out</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-stretch gap-3">
            <div className="inline-flex h-12 items-center rounded-md border border-line-strong">
              <button
                type="button"
                className="focus-ring grid h-full w-11 place-items-center rounded-l-md text-ink-soft hover:bg-ink/[0.04] disabled:opacity-40"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="tabular w-10 text-center text-sm font-medium" aria-live="polite">{quantity}</span>
              <button
                type="button"
                className="focus-ring grid h-full w-11 place-items-center rounded-r-md text-ink-soft hover:bg-ink/[0.04] disabled:opacity-40"
                onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
            <Button size="lg" className="min-w-44 flex-1" onClick={add} disabled={stock <= 0}>
              {stock > 0 ? (
                <>
                  Add to bag <span className="tabular">· {formatMoney(unitPrice * quantity)}</span>
                </>
              ) : (
                "Sold out"
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                toggleWishlist(product.id);
                toast({ title: saved ? "Removed from wishlist" : "Saved to wishlist", tone: "info" });
              }}
              aria-pressed={saved}
            >
              <Heart className={cn("size-4", saved && "fill-copper text-copper")} aria-hidden="true" />
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </Button>
          </div>

          <div className="mt-5 grid gap-2 rounded-lg border border-line bg-surface p-4 text-xs text-ink-soft sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <Truck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
              Dispatches by {formatDate(dispatch)} · estimated arrival {formatDate(arrival)}
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
              30-day demo returns · seller pays return label
            </p>
          </div>

          <ul className="mt-6 grid gap-2 text-xs text-ink-soft sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>

          {seller && (
            <div className="mt-7 flex items-center gap-3 rounded-lg border border-line p-3.5">
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: seller.palette.bg }}>
                <span className="font-display text-sm" style={{ color: seller.palette.object }}>
                  {seller.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{seller.name}</p>
                <p className="truncate text-2xs text-ink-faint">{seller.location} · ships within {seller.fulfilmentSlaHours}h</p>
              </div>
              <Link href={`/sellers/${seller.slug}`} className="shrink-0 text-2xs text-teal hover:underline">
                Storefront
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="atlas-container py-10 sm:py-14">
          <Tabs defaultValue="story">
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="care">Care & repair</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="story" className="grid max-w-4xl gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-base leading-relaxed text-ink-soft">{product.story}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  Made by {product.brand} in small batches. This listing is part of the Atlas demo catalogue; availability,
                  reviews and lead times are synthetic but the product structure mirrors the verified API contract.
                </p>
              </div>
              <dl className="space-y-3 rounded-lg border border-line bg-surface-raised p-5 text-sm">
                {[
                  ["Materials", product.materials],
                  ["Care", product.care],
                  ["Category", product.category],
                  ["Listing since", formatDate(product.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-ink-faint">{label}</dt>
                    <dd className="text-right capitalize text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>

            <TabsContent value="specs">
              <div className="max-w-3xl">
                <table className="w-full text-sm">
                  <caption className="sr-only">Specifications for {product.name}</caption>
                  <tbody className="divide-y divide-line">
                    {product.specs.map((spec) => (
                      <tr key={spec.label}>
                        <th scope="row" className="w-1/3 py-3 pr-4 text-left align-top font-medium text-ink-faint">{spec.group}</th>
                        <td className="py-3">
                          <span className="block text-xs text-ink-faint">{spec.label}</span>
                          <span className="mt-0.5 block text-ink">{spec.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="care">
              <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
                <p>{product.care}</p>
                <p>
                  Atlas sellers are expected to publish spare parts, service instructions and a repair contact before a listing
                  can be approved. The admin moderation surface checks for these fields in the verified backend schema.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/help#repairs">Read the repair policy</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews" id="reviews">
              <div className="grid max-w-4xl gap-8 lg:grid-cols-[16rem_1fr]">
                <div className="rounded-lg border border-line bg-surface-raised p-5">
                  <p className="font-display text-4xl leading-none text-ink">{product.rating.toFixed(1)}</p>
                  <div className="mt-2 flex gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={cn("size-4", index < Math.round(product.rating) ? "fill-copper text-copper" : "text-line-strong")} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink-faint">{product.reviewCount} demo reviews</p>
                  <div className="mt-4 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars, index) => {
                      const pct = [58, 27, 9, 4, 2][index] ?? 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 text-2xs text-ink-faint">
                          <span className="tabular w-3">{stars}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full bg-copper" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="tabular w-7 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="eyebrow">Demo excerpts</p>
                  <ul className="mt-4 space-y-5">
                    {[
                      ["Ines M.", "Five stars", "The kind of object you stop noticing because it simply works. The finish has softened nicely after six months."],
                      ["Jonas L.", "Exactly as described", "Packaging was minimal and the seller replied within a day about a replacement cable."],
                      ["Priya N.", "Worth the wait", "Small-batch lead time was accurate. The material notes on the listing are unusually honest."],
                    ].map(([name, title, body]) => (
                      <li key={name} className="border-b border-line pb-5 last:border-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-ink">{title}</p>
                          <span className="text-2xs text-ink-faint">{name} · demo</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="atlas-container py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Complete the room</p>
            <h2 className="mt-2 font-display text-display-xs text-ink">Related objects</h2>
          </div>
          <Link href={`/products?category=${product.category}`} className="editorial-link hidden sm:inline-flex">
            More in {product.category} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={related} columns={4} />
        </div>
      </section>

      {viewed.length > 0 && (
        <section className="border-t border-line bg-surface py-12">
          <div className="atlas-container">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Recently viewed</h2>
              <Link href="/products" className="editorial-link text-xs">
                Back to catalogue
              </Link>
            </div>
            <div className="mt-5">
              <ProductGrid products={viewed} columns={4} />
            </div>
          </div>
        </section>
      )}

      <div className="atlas-container pb-4">
        <Link href="/products" className="editorial-link text-xs">
          <ArrowLeft className="size-3.5" aria-hidden="true" /> All objects
        </Link>
      </div>

      <section className="atlas-container py-12">
        <div className="rounded-xl border border-line bg-surface-raised p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-copper" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-ink">Open the connected journey</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  See how this object moves from comparison to fulfilment, moderation and seller payout.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/journey">Trace an order <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Accordion type="single" collapsible className="atlas-container max-w-3xl pb-16">
        <AccordionItem value="demo">
          <AccordionTrigger>What is demo and what is real here?</AccordionTrigger>
          <AccordionContent>
            The catalogue, reviews, prices and stock are synthetic. The interaction model, accessibility patterns and data
            contracts are real. No payment is processed and no order reaches a seller.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
