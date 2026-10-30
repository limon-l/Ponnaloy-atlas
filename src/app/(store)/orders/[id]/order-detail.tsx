"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  CheckCircle2,
  Copy,
  CreditCard,
  MapPin,
  MessageSquare,
  Package,
  Printer,
  RotateCcw,
  Truck,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { OrderStatusBadge } from "@/components/order-status";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useCatalog, useSellers } from "@/lib/hooks";
import { addToCart, requestReturn, useAtlasState } from "@/lib/store";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

export function OrderDetail({ id }: { id: string }) {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const placed = searchParams.get("placed") === "1";
  const [showPlaced, setShowPlaced] = React.useState(placed);
  const [returnOpen, setReturnOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | null>(null);
  const order = state.orders.find((item) => item.id === id);

  if (!order) {
    return (
      <div className="atlas-container py-16">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="Seeded and session orders live in this browser only. If storage was cleared, the order reference will not resolve."
          action={{ label: "All orders", href: "/orders" }}
          secondary={{ label: "Browse the catalogue", href: "/products" }}
        />
      </div>
    );
  }

  const lineItems = order.lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ line, product }] : [];
  });
  const orderSellers = sellers.filter((seller) => order.sellerIds.includes(seller.id));
  const canReturn = order.status === "DELIVERED" && !order.returnRequest;

  return (
    <>
      <div className="atlas-container py-8 lg:py-12">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-2xs text-ink-faint hover:text-ink">
          <ArrowLeft className="size-3" aria-hidden="true" /> All orders
        </Link>

        {showPlaced && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-success/25 bg-success/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-ink">Demo order {order.number} confirmed</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                  No payment was taken. The order is now visible in the seller fulfilment queue and the admin ledger.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/seller/orders">Open seller queue</Link>
              </Button>
              <button
                type="button"
                onClick={() => setShowPlaced(false)}
                className="focus-ring grid size-8 place-items-center rounded-md text-ink-faint hover:bg-ink/[0.05] hover:text-ink"
                aria-label="Dismiss confirmation"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <header className="mt-6 flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Order detail</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-display-xs text-ink">{order.number}</h1>
              <OrderStatusBadge status={order.status} />
              {order.returnRequest && <Badge variant="warning">Return {order.returnRequest.status.toLowerCase()}</Badge>}
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Placed {formatDateTime(order.placedAt)} · {order.source === "session" ? "session order" : "seeded demo order"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" /> Print
            </Button>
            {canReturn && (
              <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="size-4" aria-hidden="true" /> Request return
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a demo return</DialogTitle>
                    <DialogDescription>
                      This creates a return request visible to the seller and admin. No parcel is collected and no refund is
                      processed outside the demo ledger.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const result = requestReturn(order.id, reason);
                      if (!result.ok) {
                        setReasonError(result.error);
                        return;
                      }
                      setReasonError(null);
                      setReturnOpen(false);
                      setReason("");
                      toast({ title: "Return requested", description: "Track it from this order or the admin returns queue.", tone: "success" });
                    }}
                  >
                    <label htmlFor="return-reason" className="text-xs font-medium text-ink">What happened?</label>
                    <Textarea
                      id="return-reason"
                      value={reason}
                      onChange={(event) => {
                        setReason(event.target.value);
                        setReasonError(null);
                      }}
                      placeholder="The shade was warmer than expected…"
                      aria-invalid={Boolean(reasonError)}
                      aria-describedby={reasonError ? "return-reason-error" : undefined}
                    />
                    {reasonError && <p id="return-reason-error" role="alert" className="text-xs text-danger">{reasonError}</p>}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setReturnOpen(false)}>Cancel</Button>
                      <Button type="submit">Submit request</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button
              size="sm"
              onClick={() => {
                for (const line of order.lines) addToCart(line.productId, line.variantId, line.quantity);
                toast({ title: "Added to bag", description: "All items are back in the demo basket.", tone: "success" });
              }}
            >
              <Box className="size-4" aria-hidden="true" /> Buy again
            </Button>
          </div>
        </header>

        {order.returnRequest && (
          <div className="mt-5 rounded-lg border border-warning/25 bg-warning/[0.06] p-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Return {order.returnRequest.status.toLowerCase()} · {formatDate(order.returnRequest.requestedAt)}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">“{order.returnRequest.reason}”</p>
                <p className="mt-1 text-2xs text-ink-faint">
                  Admins resolve returns from the operations centre. Refunds are simulated.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="space-y-8">
            <section aria-labelledby="items-heading">
              <h2 id="items-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Items</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {lineItems.map(({ line, product }) => (
                  <li key={`${line.productId}-${line.variantId ?? "default"}`} className="flex gap-4 py-4">
                    <Link href={`/product/${product.slug}`} className="focus-ring block size-20 shrink-0 overflow-hidden rounded-md">
                      <ProductArt art={product.art} palette={product.palette} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/product/${product.slug}`} className="block text-sm font-medium text-ink hover:text-teal">
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            {product.variants.find((variant) => variant.id === line.variantId)?.option ?? product.variantLabel}
                          </p>
                        </div>
                        <p className="tabular shrink-0 text-sm text-ink">{formatMoney(line.unitPrice * line.quantity)}</p>
                      </div>
                      <p className="mt-2 text-2xs text-ink-faint">
                        Qty {line.quantity} · {formatMoney(line.unitPrice)} each · {sellers.find((seller) => seller.id === product.sellerId)?.name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Timeline</h2>
              <ol className="mt-4 space-y-0">
                {order.timeline.map((event, index) => (
                  <li key={`${event.status}-${event.at}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < order.timeline.length - 1 && (
                      <span className="absolute left-[0.4375rem] top-4 h-full w-px bg-line" aria-hidden="true" />
                    )}
                    <span
                      className={`relative mt-1.5 size-3.5 shrink-0 rounded-full border-2 ${
                        index === order.timeline.length - 1 ? "border-teal bg-teal" : "border-line-strong bg-surface-raised"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium capitalize text-ink">
                          {event.status.toLowerCase().replaceAll("_", " ")}
                        </p>
                        <p className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-faint">{formatDateTime(event.at)}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{event.note}</p>
                      <p className="mt-1 text-2xs text-ink-faint">Actor · {event.actor.toLowerCase()}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {order.shipment && (
              <section aria-labelledby="shipment-heading" className="rounded-xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="shipment-heading" className="flex items-center gap-2 font-display text-xl tracking-[-0.02em] text-ink">
                    <Truck className="size-4 text-teal" aria-hidden="true" /> Shipment
                  </h2>
                  <Badge variant="info">{order.shipment.status.replaceAll("_", " ").toLowerCase()}</Badge>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.1em] text-ink-faint">Carrier</dt>
                    <dd className="mt-0.5 text-ink">{order.shipment.carrier}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.1em] text-ink-faint">Tracking</dt>
                    <dd className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-ink">
                      {order.shipment.trackingNumber}
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard?.writeText(order.shipment?.trackingNumber ?? "");
                          toast({ title: "Tracking number copied", tone: "info" });
                        }}
                        className="focus-ring rounded p-0.5 text-ink-faint hover:text-ink"
                        aria-label="Copy tracking number"
                      >
                        <Copy className="size-3" aria-hidden="true" />
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.1em] text-ink-faint">Estimated delivery</dt>
                    <dd className="mt-0.5 text-ink">{formatDate(order.shipment.estimatedDelivery)}</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-surface-raised p-5">
              <h2 className="font-display text-xl tracking-[-0.02em] text-ink">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-ink-soft"><dt>Subtotal</dt><dd className="tabular">{formatMoney(order.subtotal)}</dd></div>
                <div className="flex justify-between text-ink-soft"><dt>Delivery</dt><dd className="tabular">{order.shipping === 0 ? "Complimentary" : formatMoney(order.shipping)}</dd></div>
                <div className="flex justify-between text-ink-soft"><dt>Tax</dt><dd className="tabular">{formatMoney(order.tax)}</dd></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-success"><dt>Discount</dt><dd className="tabular">−{formatMoney(order.discount)}</dd></div>
                )}
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink"><dt>Total</dt><dd className="tabular">{formatMoney(order.total)}</dd></div>
              </dl>
              <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs text-ink-soft">
                <p className="flex items-center gap-2"><CreditCard className="size-3.5 text-ink-faint" aria-hidden="true" /> {order.paymentMethod.replaceAll("_", " ").toLowerCase()} · {order.paymentStatus.toLowerCase()}</p>
                <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" /> {order.shippingAddress}</p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">Sold by</h2>
              <ul className="mt-3 space-y-2">
                {orderSellers.map((seller) => (
                  <li key={seller.id}>
                    <Link href={`/sellers/${seller.slug}`} className="flex items-center justify-between gap-3 text-sm text-ink-soft hover:text-teal">
                      {seller.name}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-line pt-4">
                <Link href="/help#orders" className="inline-flex items-center gap-2 text-xs text-ink-soft hover:text-teal">
                  <MessageSquare className="size-3.5" aria-hidden="true" /> Delivery or return help
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-line-strong p-4 text-2xs leading-relaxed text-ink-faint">
              This order exists in the browser demo. Status changes made in the seller or admin workspace update this timeline.
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Link href="/journey" className="editorial-link text-xs">
            Follow the connected journey <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
