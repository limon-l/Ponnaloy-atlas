"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { activeOrderStatuses, statusCopy } from "@/lib/catalog";
import { useCatalog, useSellers } from "@/lib/hooks";
import { addShipment, updateOrderStatus, useAtlasState } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { downloadCsv, formatDate, formatDateTime, formatMoney, cn } from "@/lib/utils";

type Filter = "queue" | "active" | "shipped" | "delivered" | "closed" | "all";

const filters: Array<{ value: Filter; label: string }> = [
  { value: "queue", label: "Needs action" },
  { value: "active", label: "Active" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "closed", label: "Cancelled / refunded" },
  { value: "all", label: "All" },
];

const nextStep: Partial<Record<OrderStatus, { status: OrderStatus; label: string; note: string }>> = {
  PENDING: { status: "CONFIRMED", label: "Accept order", note: "Seller accepted the order in the demo workspace." },
  CONFIRMED: { status: "PROCESSING", label: "Start processing", note: "Seller began packing the order." },
  SHIPPED: {
    status: "OUT_FOR_DELIVERY",
    label: "Mark out for delivery",
    note: "Carrier marked the parcel out for delivery.",
  },
  OUT_FOR_DELIVERY: {
    status: "DELIVERED",
    label: "Mark delivered",
    note: "Carrier confirmed delivery in the demo ledger.",
  },
};

export function SellerOrdersView() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const params = useSearchParams();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const [filter, setFilter] = React.useState<Filter>("queue");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"newest" | "oldest" | "value">("oldest");
  const [selectedId, setSelectedId] = React.useState<string | null>(params.get("order"));
  const [carrier, setCarrier] = React.useState("DHL Express");
  const [tracking, setTracking] = React.useState("");
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const scoped = state.orders.filter((order) => order.sellerIds.includes(state.sellerId));
  const selected = scoped.find((order) => order.id === selectedId) ?? null;

  React.useEffect(() => {
    const id = params.get("order");
    if (id) setSelectedId(id);
  }, [params]);

  const counts = React.useMemo(() => {
    const queue = scoped.filter((order) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)).length;
    const active = scoped.filter((order) => activeOrderStatuses.includes(order.status)).length;
    const shipped = scoped.filter((order) => ["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status)).length;
    const delivered = scoped.filter((order) => order.status === "DELIVERED").length;
    const closed = scoped.filter((order) => ["CANCELLED", "REFUNDED", "RETURNED"].includes(order.status)).length;
    return { queue, active, shipped, delivered, closed, all: scoped.length };
  }, [scoped]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const byFilter = scoped.filter((order) => {
      if (filter === "queue") return ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status);
      if (filter === "active") return activeOrderStatuses.includes(order.status);
      if (filter === "shipped") return ["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status);
      if (filter === "delivered") return order.status === "DELIVERED";
      if (filter === "closed") return ["CANCELLED", "REFUNDED", "RETURNED"].includes(order.status);
      return true;
    });
    return byFilter
      .filter((order) =>
        q
          ? [order.number, order.customerName, order.email, ...order.lines.map((line) => line.productId)]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true
      )
      .sort((a, b) => {
        if (sort === "value") return b.total - a.total;
        const delta = Date.parse(a.placedAt) - Date.parse(b.placedAt);
        return sort === "oldest" ? delta : -delta;
      });
  }, [scoped, filter, query, sort]);

  const advance = (order: Order) => {
    const step = nextStep[order.status];
    if (!step) return;
    const result = updateOrderStatus(order.id, step.status, step.note, "SELLER");
    if (result.ok) {
      toast({
        title: `${order.number} updated`,
        description: `Status changed to ${step.status.toLowerCase().replaceAll("_", " ")}. The customer timeline updates immediately.`,
        tone: "success",
      });
    }
  };

  const ship = (order: Order) => {
    if (!tracking.trim()) {
      toast({ title: "Tracking number required", description: "Enter a demo tracking number before creating the shipment.", tone: "error" });
      return;
    }
    const result = addShipment(order.id, carrier, tracking);
    if (!result.ok) {
      toast({ title: "Shipment not created", description: result.error, tone: "error" });
      return;
    }
    toast({
      title: `Shipment created for ${order.number}`,
      description: `${carrier} · ${tracking}. The order moved to shipped.`,
      tone: "success",
    });
    setTracking("");
  };

  const cancel = (order: Order) => {
    const result = updateOrderStatus(order.id, "CANCELLED", "Order cancelled by the seller in the demo workspace.", "SELLER");
    if (result.ok) {
      toast({ title: `${order.number} cancelled`, description: "Demo payment status marked refunded.", tone: "info" });
      setCancelOpen(false);
      setSelectedId(null);
    }
  };

  const exportRows = () => {
    if (filtered.length === 0) {
      toast({ title: "Nothing to export", description: "Adjust the filters first.", tone: "error" });
      return;
    }
    downloadCsv(
      `ponnaloy-seller-orders-${seller?.slug ?? "studio"}.csv`,
      filtered.map((order) => ({
        number: order.number,
        customer: order.customerName,
        email: order.email,
        placed: formatDate(order.placedAt),
        status: order.status,
        payment: order.paymentStatus,
        items: order.lines.reduce((sum, line) => sum + line.quantity, 0),
        total_usd: (order.total / 100).toFixed(2),
      }))
    );
    toast({ title: "CSV exported", description: `${filtered.length} demo orders written locally.`, tone: "success" });
  };

  const selectedProducts = selected
    ? selected.lines.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product ? [{ line, product }] : [];
      })
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={seller?.name ?? "Seller workspace"}
        title="Orders & fulfilment"
        description="Only orders containing this studio's objects appear here. Status changes and shipment labels update the shared customer timeline."
        meta={
          <>
            <Badge variant="warning">{counts.queue} need action</Badge>
            <Badge variant="outline">{counts.active} active</Badge>
            <Badge variant="success">{counts.delivered} delivered</Badge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportRows}>
              <Download className="size-4" aria-hidden="true" /> Export CSV
            </Button>
            <Button asChild size="sm">
              <a href="#queue-table">Jump to queue</a>
            </Button>
          </>
        }
      />

      <Panel className="overflow-hidden" title="Fulfilment queue" description="Search by order number, customer or product id.">
        <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter orders">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={cn(
                  "focus-ring rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium transition-colors",
                  filter === item.value
                    ? "border-teal bg-teal text-white"
                    : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                )}
              >
                {item.label}
                <span className="tabular ml-1.5 opacity-70">{counts[item.value]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search orders…"
                aria-label="Search seller orders"
                className="h-9 pl-8 text-xs sm:w-56"
              />
            </div>
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="h-9 text-xs sm:w-40"
              aria-label="Sort seller orders"
            >
              <option value="oldest">Oldest first</option>
              <option value="newest">Newest first</option>
              <option value="value">Highest value</option>
            </Select>
          </div>
        </div>

        <div id="queue-table" className="mt-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-ink">No orders match this view</p>
              <p className="mt-1 text-xs text-ink-faint">Try a different status, search term, or clear the search.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <caption className="sr-only">Seller orders</caption>
                  <thead>
                    <tr className="border-b border-line">
                      {["Order", "Customer", "Placed", "Items", "Status", "Total", ""].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((order) => (
                      <tr key={order.id} className="group">
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            onClick={() => setSelectedId(order.id)}
                            className="focus-ring rounded font-mono text-[0.6875rem] font-medium text-ink hover:text-teal"
                          >
                            {order.number}
                          </button>
                          <p className="mt-0.5 text-[0.625rem] text-ink-faint">{order.paymentMethod.replaceAll("_", " ").toLowerCase()}</p>
                        </td>
                        <td className="py-3 pr-3">
                          <p className="text-xs font-medium text-ink">{order.customerName}</p>
                          <p className="truncate text-[0.625rem] text-ink-faint">{order.email}</p>
                        </td>
                        <td className="py-3 pr-3 text-[0.6875rem] text-ink-soft">{formatDate(order.placedAt)}</td>
                        <td className="tabular py-3 pr-3 text-xs text-ink">
                          {order.lines.reduce((sum, line) => sum + line.quantity, 0)}
                        </td>
                        <td className="py-3 pr-3"><OrderStatusBadge status={order.status} /></td>
                        <td className="tabular py-3 pr-3 text-xs font-medium text-ink">{formatMoney(order.total)}</td>
                        <td className="py-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedId(order.id)}>
                            Manage <ArrowRight className="size-3.5" aria-hidden="true" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-2.5 md:hidden">
                {filtered.map((order) => (
                  <li key={order.id} className="rounded-lg border border-line bg-surface p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[0.6875rem] font-medium text-ink">{order.number}</p>
                        <p className="mt-0.5 text-[0.625rem] text-ink-faint">{formatDate(order.placedAt)} · {order.customerName}</p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
                      <span className="tabular text-xs font-medium text-ink">{formatMoney(order.total)}</span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedId(order.id)}>
                        Manage
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <p className="mt-3 text-[0.625rem] text-ink-faint">
          Showing {filtered.length} of {scoped.length} seller-scoped demo orders. The vendor never sees other studios&apos; orders.
        </p>
      </Panel>

      <WorkspaceNote>
        Demo actions are local. Accepting, shipping or cancelling an order updates <code>localStorage</code> and the
        customer&apos;s order detail, but no carrier or payment provider is contacted.
      </WorkspaceNote>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[88dvh] max-w-3xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-mono text-lg">{selected.number}</DialogTitle>
                  <OrderStatusBadge status={selected.status} />
                  {selected.returnRequest && <Badge variant="warning">Return {selected.returnRequest.status.toLowerCase()}</Badge>}
                </div>
                <DialogDescription>
                  {selected.customerName} · placed {formatDateTime(selected.placedAt)} · {selected.source === "seed" ? "seeded demo order" : "session order"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,1fr)]">
                <div className="space-y-4">
                  <section aria-labelledby="seller-order-items">
                    <h3 id="seller-order-items" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Items in this studio</h3>
                    <ul className="mt-2 divide-y divide-line border-y border-line">
                      {selectedProducts.map(({ line, product }) => (
                        <li key={`${line.productId}-${line.variantId ?? "default"}`} className="flex items-center gap-3 py-2.5">
                          <span className="size-11 shrink-0 overflow-hidden rounded-md">
                            <ProductArt art={product.art} palette={product.palette} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-ink">{product.name}</span>
                            <span className="block text-[0.625rem] text-ink-faint">
                              {product.variants.find((variant) => variant.id === line.variantId)?.option ?? product.variantLabel} · qty {line.quantity}
                            </span>
                          </span>
                          <span className="tabular text-xs text-ink">{formatMoney(line.unitPrice * line.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-labelledby="seller-order-timeline">
                    <h3 id="seller-order-timeline" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Timeline</h3>
                    <ol className="mt-2 space-y-0">
                      {selected.timeline.map((event, index) => (
                        <li key={`${event.status}-${event.at}-${index}`} className="relative flex gap-3 pb-3 last:pb-0">
                          {index < selected.timeline.length - 1 && (
                            <span className="absolute left-[0.3125rem] top-3 h-full w-px bg-line" aria-hidden="true" />
                          )}
                          <span
                            className={cn(
                              "relative mt-1 size-2.5 shrink-0 rounded-full border-2",
                              index === selected.timeline.length - 1 ? "border-teal bg-teal" : "border-line-strong bg-surface-raised"
                            )}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-[0.6875rem] font-medium capitalize text-ink">{event.status.toLowerCase().replaceAll("_", " ")}</p>
                            <p className="text-[0.625rem] leading-relaxed text-ink-faint">{event.note}</p>
                            <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                              {formatDateTime(event.at)} · {event.actor.toLowerCase()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>

                  {selected.returnRequest && (
                    <div className="rounded-md border border-warning/25 bg-warning/[0.05] p-3">
                      <p className="text-xs font-medium text-ink">Customer return request</p>
                      <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-soft">{selected.returnRequest.reason}</p>
                      <p className="mt-1 text-[0.625rem] text-ink-faint">Administrators resolve returns; the seller can see the request only.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <section aria-labelledby="seller-order-summary" className="rounded-lg border border-line bg-surface p-3">
                    <h3 id="seller-order-summary" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Order summary</h3>
                    <dl className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between gap-2"><dt className="text-ink-faint">Subtotal</dt><dd className="tabular text-ink">{formatMoney(selected.subtotal)}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-ink-faint">Delivery</dt><dd className="tabular text-ink">{formatMoney(selected.shipping)}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-ink-faint">Tax</dt><dd className="tabular text-ink">{formatMoney(selected.tax)}</dd></div>
                      {selected.discount > 0 && <div className="flex justify-between gap-2"><dt className="text-success">Discount</dt><dd className="tabular text-success">− {formatMoney(selected.discount)}</dd></div>}
                      <div className="flex justify-between gap-2 border-t border-line pt-1 text-sm font-semibold"><dt>Total</dt><dd className="tabular">{formatMoney(selected.total)}</dd></div>
                    </dl>
                    <p className="mt-2 border-t border-line pt-2 text-[0.625rem] leading-relaxed text-ink-faint">
                      {selected.shippingAddress}
                    </p>
                  </section>

                  <section aria-labelledby="seller-order-actions">
                    <h3 id="seller-order-actions" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Fulfilment actions</h3>
                    <div className="mt-2 space-y-2">
                      {selected.status === "PROCESSING" ? (
                        <div className="space-y-2 rounded-md border border-line bg-surface p-2.5">
                          <p className="text-[0.6875rem] font-medium text-ink">Create shipment</p>
                          <Input
                            value={carrier}
                            onChange={(event) => setCarrier(event.target.value)}
                            aria-label="Demo carrier"
                            placeholder="Carrier"
                            className="h-8 text-xs"
                          />
                          <Input
                            value={tracking}
                            onChange={(event) => setTracking(event.target.value)}
                            aria-label="Demo tracking number"
                            placeholder="Tracking number"
                            className="h-8 font-mono text-xs"
                          />
                          <Button size="sm" className="w-full" onClick={() => ship(selected)}>
                            <Truck className="size-4" aria-hidden="true" /> Create label & mark shipped
                          </Button>
                          <p className="text-[0.5625rem] leading-relaxed text-ink-faint">
                            No carrier API is called. A local tracking record is created.
                          </p>
                        </div>
                      ) : nextStep[selected.status] ? (
                        <Button size="sm" className="w-full" onClick={() => advance(selected)}>
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          {nextStep[selected.status]!.label}
                        </Button>
                      ) : (
                        <p className="rounded-md border border-dashed border-line-strong p-2.5 text-[0.6875rem] text-ink-faint">
                          {statusCopy[selected.status].description}. No further seller action is available.
                        </p>
                      )}

                      {selected.status === "SHIPPED" && (
                        <p className="rounded-md border border-line bg-surface p-2.5 text-[0.625rem] text-ink-faint">
                          Shipment {selected.shipment?.carrier} · {selected.shipment?.trackingNumber}
                        </p>
                      )}

                      {["PENDING", "CONFIRMED", "PROCESSING"].includes(selected.status) && (
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => setCancelOpen(true)}>
                          <XCircle className="size-4" aria-hidden="true" /> Cancel order
                        </Button>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {cancelOpen && (
                <div className="rounded-md border border-danger/25 bg-danger/[0.05] p-3">
                  <p className="text-xs font-medium text-ink">Cancel {selected.number}?</p>
                  <p className="mt-0.5 text-[0.6875rem] text-ink-soft">
                    This writes a cancellation timeline event and marks the demo payment refunded.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => cancel(selected)}>Cancel order</Button>
                    <Button size="sm" variant="ghost" onClick={() => setCancelOpen(false)}>Keep order</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
