"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductArt } from "@/components/product-art";
import { ProductGrid } from "@/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { FREE_SHIPPING_THRESHOLD, priceCart } from "@/lib/cart";
import { useCatalog } from "@/lib/hooks";
import { applyCoupon, removeFromCart, updateCartQuantity, useAtlasState } from "@/lib/store";
import { formatMoney } from "@/lib/utils";

export default function CartPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const totals = React.useMemo(
    () => priceCart(state.cart, products, { coupon: state.coupon }),
    [state.cart, state.coupon, products]
  );
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);
  const progress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const suggestions = products
    .filter(
      (product) =>
        product.moderation === "APPROVED" &&
        product.category === totals.lines[0]?.product.category &&
        !state.cart.some((line) => line.productId === product.id)
    )
    .slice(0, 4);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-8 sm:py-12">
          <p className="eyebrow">Step 01 · Bag</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-display-xs text-ink">Your bag</h1>
              <p className="mt-2 text-sm text-ink-soft">
                {totals.count} {totals.count === 1 ? "piece" : "pieces"} · demo checkout, no payment taken.
              </p>
            </div>
            <Link href="/products" className="editorial-link text-xs">
              Continue shopping <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        {totals.lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Nothing has been added yet. Start with the current edit, or return to an object you saved earlier."
            action={{ label: "Browse the catalogue", href: "/products" }}
            secondary={{ label: "Open wishlist", href: "/wishlist" }}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div>
              <div className="rounded-lg border border-line bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <Truck className="size-4 text-teal" aria-hidden="true" />
                    {remaining === 0
                      ? "Complimentary standard delivery unlocked."
                      : `Add ${formatMoney(remaining)} for complimentary delivery.`}
                  </span>
                  <span className="tabular text-ink-faint">{Math.round(progress)}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-teal" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <ul className="mt-4 divide-y divide-line border-y border-line">
                {totals.lines.map((line) => (
                  <li key={`${line.productId}-${line.variantId ?? "default"}`} className="grid gap-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)]">
                    <Link href={`/product/${line.product.slug}`} className="focus-ring block aspect-square w-24 overflow-hidden rounded-lg sm:w-full">
                      <ProductArt art={line.product.art} palette={line.product.palette} />
                    </Link>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-2xs uppercase tracking-[0.12em] text-ink-faint">{line.product.brand}</p>
                          <Link href={`/product/${line.product.slug}`} className="mt-0.5 block font-display text-xl tracking-[-0.02em] text-ink hover:text-teal">
                            {line.product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            {line.variantLabel ?? line.product.variantLabel} · {line.product.subtitle}
                          </p>
                        </div>
                        <p className="tabular shrink-0 text-sm font-semibold text-ink">{formatMoney(line.total)}</p>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        <div className="inline-flex items-center rounded-md border border-line">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(line.productId, line.variantId, line.quantity - 1)}
                            className="focus-ring grid size-9 place-items-center rounded-l-md text-ink-soft hover:bg-ink/[0.04]"
                            aria-label={`Decrease quantity of ${line.product.name}`}
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>
                          <span className="tabular w-9 text-center text-xs font-medium">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(line.productId, line.variantId, line.quantity + 1)}
                            className="focus-ring grid size-9 place-items-center rounded-r-md text-ink-soft hover:bg-ink/[0.04] disabled:opacity-40"
                            disabled={line.quantity >= line.available}
                            aria-label={`Increase quantity of ${line.product.name}`}
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-2xs">
                          <span className="text-ink-faint">{line.available} available</span>
                          <button
                            type="button"
                            onClick={() => {
                              removeFromCart(line.productId, line.variantId);
                              toast({ title: `${line.product.name} removed`, tone: "info" });
                            }}
                            className="focus-ring inline-flex items-center gap-1.5 rounded text-ink-faint hover:text-danger"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" /> Remove
                          </button>
                        </div>
                      </div>
                      {line.quantity >= line.available && (
                        <p className="mt-1.5 text-2xs text-warning">Maximum available quantity reached.</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <Tag className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-ink">Have a demo code?</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">Try ATLAS10 for 10% off or FREESHIP for delivery.</p>
                  </div>
                </div>
                {state.coupon ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{state.coupon} applied</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        applyCoupon("");
                        setCode("");
                        toast({ title: "Coupon removed", tone: "info" });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const result = applyCoupon(code);
                      if (result.ok) {
                        toast({ title: "Demo code applied", description: "The discount is reflected in the summary.", tone: "success" });
                      } else {
                        toast({ title: "Code not recognised", description: result.error, tone: "error" });
                      }
                    }}
                  >
                    <label htmlFor="coupon" className="sr-only">Demo code</label>
                    <Input
                      id="coupon"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="ATLAS10"
                      className="h-9 w-32 uppercase"
                      autoComplete="off"
                    />
                    <Button type="submit" size="sm" variant="outline">Apply</Button>
                  </form>
                )}
              </div>
            </div>

            <aside aria-label="Order summary">
              <div className="sticky top-[calc(var(--header-height)+1.5rem)] rounded-xl border border-line bg-surface-raised p-5">
                <h2 className="font-display text-xl tracking-[-0.02em] text-ink">Summary</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <dt>Subtotal</dt>
                    <dd className="tabular">{formatMoney(totals.subtotal)}</dd>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <dt>{totals.couponLabel}</dt>
                      <dd className="tabular">−{formatMoney(totals.discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-soft">
                    <dt>Standard delivery</dt>
                    <dd className="tabular">{totals.shipping === 0 ? "Complimentary" : formatMoney(totals.shipping)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <dt>Estimated tax</dt>
                    <dd className="tabular">{formatMoney(totals.tax)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                    <dt>Total</dt>
                    <dd className="tabular">{formatMoney(totals.total)}</dd>
                  </div>
                </dl>
                <Button asChild size="lg" className="mt-5 w-full">
                  <Link href="/checkout">
                    Checkout <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <p className="mt-3 flex items-start gap-2 text-2xs leading-relaxed text-ink-faint">
                  <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                  Demo checkout. No card details are collected, transmitted or stored.
                </p>
                <div className="mt-4 space-y-2 border-t border-line pt-4 text-2xs text-ink-faint">
                  <p className="flex items-center gap-2"><Truck className="size-3.5" aria-hidden="true" /> Standard 2–4 working days · express at checkout</p>
                  <p className="flex items-center gap-2"><ShieldCheck className="size-3.5" aria-hidden="true" /> 30-day returns · seller-funded label</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {suggestions.length > 0 && (
          <section className="mt-16 border-t border-line pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Complete the room</p>
                <h2 className="mt-2 font-display text-2xl tracking-[-0.02em] text-ink">Pairs well with what is in your bag</h2>
              </div>
              <Link href="/products" className="editorial-link hidden text-xs sm:inline-flex">All objects</Link>
            </div>
            <div className="mt-6">
              <ProductGrid products={suggestions} columns={4} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
