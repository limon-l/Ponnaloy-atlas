"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogDescription, SheetContent } from "@/components/ui/dialog";
import { priceCart, FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { useCatalog } from "@/lib/hooks";
import { removeFromCart, updateCartQuantity, useAtlasState } from "@/lib/store";
import { formatMoney } from "@/lib/utils";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const state = useAtlasState();
  const products = useCatalog();
  const totals = React.useMemo(
    () => priceCart(state.cart, products, { coupon: state.coupon }),
    [state.cart, state.coupon, products]
  );
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);
  const progress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 pr-14">
          <div>
            <DialogTitle className="font-display text-xl tracking-[-0.02em]">Your bag</DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-ink-faint">
              {totals.count} {totals.count === 1 ? "piece" : "pieces"} · demo basket
            </DialogDescription>
          </div>
        </div>

        {totals.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-teal-soft text-teal">
              <ShoppingBag className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-2xl tracking-[-0.02em]">Your bag is quiet</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Start with an object you will still want in ten years. The edit is a good place to browse.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products" onClick={() => onOpenChange(false)}>
                Browse the catalogue
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-3">
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>
                  {remaining === 0 ? "Complimentary standard delivery unlocked" : `${formatMoney(remaining)} from free delivery`}
                </span>
                <span className="tabular text-ink-faint">{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-teal" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {totals.lines.map((line) => (
                <li key={`${line.productId}-${line.variantId ?? "default"}`} className="flex gap-4 py-4">
                  <Link
                    href={`/product/${line.product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="focus-ring block size-20 shrink-0 overflow-hidden rounded-md"
                  >
                    <ProductArt art={line.product.art} palette={line.product.palette} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{line.product.name}</p>
                        <p className="truncate text-xs text-ink-faint">
                          {line.variantLabel ?? line.product.subtitle}
                        </p>
                      </div>
                      <p className="tabular shrink-0 text-sm text-ink">{formatMoney(line.total)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-md border border-line">
                        <button
                          type="button"
                          className="focus-ring grid size-8 place-items-center rounded-l-md text-ink-soft hover:bg-ink/[0.04]"
                          onClick={() => updateCartQuantity(line.productId, line.variantId, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.product.name}`}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="tabular w-8 text-center text-xs font-medium" aria-live="polite">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="focus-ring grid size-8 place-items-center rounded-r-md text-ink-soft hover:bg-ink/[0.04] disabled:opacity-40"
                          onClick={() => updateCartQuantity(line.productId, line.variantId, line.quantity + 1)}
                          disabled={line.quantity >= line.available}
                          aria-label={`Increase quantity of ${line.product.name}`}
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.productId, line.variantId)}
                        className="focus-ring inline-flex items-center gap-1.5 rounded text-xs text-ink-faint transition-colors hover:text-danger"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                    {line.quantity >= line.available && (
                      <p className="mt-1.5 text-2xs text-warning">Maximum available quantity reached.</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-surface px-5 py-4">
              <dl className="space-y-1.5 text-sm">
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
                  <dt>Delivery</dt>
                  <dd className="tabular">{totals.shipping === 0 ? "Complimentary" : formatMoney(totals.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                  <dt>Total</dt>
                  <dd className="tabular">{formatMoney(totals.total)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-2xs leading-relaxed text-ink-faint">
                Demo checkout. No card is charged and no order is sent to a real seller.
              </p>
              <div className="mt-3 grid gap-2">
                <Button asChild size="lg">
                  <Link href="/checkout" onClick={() => onOpenChange(false)}>
                    Continue to checkout
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cart" onClick={() => onOpenChange(false)}>
                    Review full bag
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Dialog>
  );
}
