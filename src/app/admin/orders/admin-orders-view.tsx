"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Download,
  Package,
  RotateCcw,
  Search,
  Truck,
  X,
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
import { Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { activeOrderStatuses, statusCopy } from "@/lib/catalog";
import { useCatalog, useSellers } from "@/lib/hooks";
import { resolveReturn, updateOrderStatus, useAtlasState } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { cn, downloadCsv, formatDate, formatDateTime, formatMoney } from "@/lib/utils";

type Filter = "all" | "pending" | "active" | "delivered" | "returns" | "closed";

const filterOptions: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All orders" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "delivered", label: "Delivered" },
  { value: "returns", label: "Returns" },
  { value: "closed", label: "Closed" },
];

const statusOptions: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"];

export function AdminOrdersView() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const params = useSearchParams();
  const paramFilter = params.get("filter");
  const [filter, setFilter] = React.useState<Filter>(
    filterOptions.some((option) => option.value === paramFilter) ? (paramFilter as Filter) : "all"
  );
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"newest" | "oldest" | "value">("newest");
  const [selectedId, setSelectedId] = React.useState<string | null>(params.get("order"));
  const [returnNote, setReturnNote] = React.useState("");
  const [manualStatus, setManualStatus] = React.useState<OrderStatus>("PROCESSING");

  const selected = state.orders.find((order) => order.id === selectedId) ?? null;
  const returnCount = state.orders.filter((order) => order.returnRequest?.status === "REQUESTED").length;

  React.useEffect(() => {
    const id = params.get("order");
    if (id) setSelectedId(id);
  }, [params]);

  React.useEffect(() => {
    if (selected) setManualStatus(selected.status);
  }, [selected]);

  const counts = React.useMemo(
    () => ({
      all: state.orders.length,
      pending: state.orders.filter((order) => order.status === "PENDING").length,
      active: state.orders.filter((order) => activeOrderStatuses.includes(order.status)).length,
      delivered: state.orders.filter((order) => order.status === "DELIVERED").length,
      returns: state.orders.filter((order) => Boolean(order.returnRequest)).length,
      closed: state.orders.filter((order) => ["CANCELLED", "REFUNDED", "RETURNED"].includes(order.status)).length,
    }),
    [state.orders]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.orders
      .filter((order) => {
        if (filter === "pending") return order.status === "PENDING";
        if (filter === "active") return activeOrderStatuses.includes(order.status);
        if (filter === "delivered") return order.status === "DELIVERED";
        if (filter === "returns") return Boolean(order.returnRequest);
        if (filter === "closed") return ["CANCELLED", "REFUNDED", "RETURNED"].includes(order.status);
        return true;
      })
      .filter((order) =>
        q
          ? [order.number, order.customerName, order.email, ...order.sellerIds].join(" ").toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => {
        if (sort === "value") return b.total - a.total;
        const delta = Date.parse(a.placedAt) - Date.parse(b.placedAt);
        return sort === "oldest" ? delta : -delta;
      });
  }, [state.orders, filter, query, sort]);

  const changeStatus = (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    const result = updateOrderStatus(
      order.id,
      status,
      `Administrator changed the order status to ${status.toLowerCase().replaceAll("_", " ")} in the demo ledger.`,
      "ADMIN"
    );
    if (result.ok) {
      toast({
        title: `${order.number} set to ${status.toLowerCase().replaceAll("_", " ")}`,
        description: "The customer timeline and seller view update immediately.",
        tone: status === "CANCELLED" || status === "REFUNDED" ? "info" : "success",
      });
    }
  };

  const decideReturn = (order: Order, approve: boolean) => {
    if (!approve && returnNote.trim().length < 8) {
      toast({
        title: "A decline note is required",
        description: "Write at least 8 characters explaining the decision.",
        tone: "error",
      });
      return;
    }
    const result = resolveReturn(order.id, approve);
    if (result.ok) {
      toast({
        title: approve ? "Return approved" : "Return declined",
        description: approve
          ? "The order is marked refunded in the demo ledger. No real money moved."
          : "The decision is recorded on the order timeline.",
        tone: approve ? "success" : "info",
      });
      setReturnNote("");
    }
  };

  const exportRows = () => {
    if (filtered.length === 0) {
      toast({ title: "Nothing to export", description: "Adjust the filters first.", tone: "error" });
      return;
    }
    downloadCsv(
      "ponnaloy-admin-orders.csv",
      filtered.map((order) => ({
        number: order.number,
        customer: order.customerName,
        email: order.email,
        placed: formatDate(order.placedAt),
        status: order.status,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        sellers: order.sellerIds.join(" | "),
        total_usd: (order.total / 100).toFixed(2),
      }))
    );
    toast({ title: "CSV exported", description: `${filtered.length} demo orders written locally.`, tone: "success" });
  };

  const lineItems = selected
    ? selected.lines.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product ? [{ line, product }] : [];
      })
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Orders & returns"
        title="Order ledger"
        description="Every marketplace order, its payment state, shipment and return request. Admin actions are written to the local audit trail."
        meta={
          <>
            <Badge variant="warning">{returnCount} open returns</Badge>
            <Badge variant="outline">{counts.active} active</Badge>
            <Badge variant="success">{counts.delivered} delivered</Badge>
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={exportRows}>
            <Download className="size-4" aria-hidden="true" /> Export CSV
          </Button>
        }
      />

      <Panel title="Orders" description="Search across order number, customer and seller id.">
        <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter orders">
            {filterOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={cn(
                  "focus-ring rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium transition-colors",
                  filter === item.value ? "border-teal bg-teal text-primary-foreground" : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
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
                placeholder="Search ledger…"
                aria-label="Search all orders"
                className="h-9 pl-8 text-xs sm:w-56"
              />
            </div>
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="h-9 text-xs sm:w-40"
              aria-label="Sort orders"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="value">Highest value</option>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">No orders match this view</p>
            <p className="mt-1 text-xs text-ink-faint">Try a different status or clear the search.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left">
                <caption className="sr-only">Marketplace order ledger</caption>
                <thead>
                  <tr className="border-b border-line">
                    {["Order", "Customer", "Placed", "Sellers", "Status", "Payment", "Total", ""].map((heading) => (
                      <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(order.id)}
                          className="focus-ring rounded font-mono text-[0.6875rem] font-medium text-ink hover:text-teal"
                        >
                          {order.number}
                        </button>
                        {order.returnRequest && (
                          <Badge variant={order.returnRequest.status === "REQUESTED" ? "warning" : "outline"} className="ml-1.5">
                            Return
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-xs font-medium text-ink">{order.customerName}</p>
                        <p className="truncate text-[0.625rem] text-ink-faint">{order.email}</p>
                      </td>
                      <td className="py-3 pr-3 text-[0.6875rem] text-ink-soft">{formatDate(order.placedAt)}</td>
                      <td className="py-3 pr-3 text-[0.6875rem] text-ink-soft">
                        {order.sellerIds
                          .map((id) => sellers.find((seller) => seller.id === id)?.name ?? id)
                          .join(", ")}
                      </td>
                      <td className="py-3 pr-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="py-3 pr-3">
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "REFUNDED" ? "neutral" : "warning"}>
                          {order.paymentStatus.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="tabular py-3 pr-3 text-xs font-medium text-ink">{formatMoney(order.total)}</td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedId(order.id)}>
                          Open <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-3 space-y-2.5 md:hidden">
              {filtered.map((order) => (
                <li key={order.id} className="rounded-lg border border-line bg-surface p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[0.6875rem] font-medium text-ink">{order.number}</p>
                      <p className="mt-0.5 text-[0.625rem] text-ink-faint">{order.customerName} · {formatDate(order.placedAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
                    <span className="tabular text-xs font-medium text-ink">{formatMoney(order.total)}</span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedId(order.id)}>Open</Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-3 text-[0.625rem] text-ink-faint">
          Showing {filtered.length} of {state.orders.length} demo orders. Seeded history and session checkouts share the same contract.
        </p>
      </Panel>

      <WorkspaceNote>
        The admin ledger is platform-wide. Seller workspace access remains scoped to the signed-in studio. In production,
        every status and refund action would require server-side authorisation and immutable audit storage.
      </WorkspaceNote>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[88dvh] max-w-3xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-mono text-lg">{selected.number}</DialogTitle>
                  <OrderStatusBadge status={selected.status} />
                  <Badge variant={selected.paymentStatus === "PAID" ? "success" : selected.paymentStatus === "REFUNDED" ? "neutral" : "warning"}>
                    {selected.paymentStatus.toLowerCase()}
                  </Badge>
                  {selected.returnRequest && <Badge variant="warning">Return {selected.returnRequest.status.toLowerCase()}</Badge>}
                </div>
                <DialogDescription>
                  {selected.customerName} · {selected.email} · placed {formatDateTime(selected.placedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,1fr)]">
                <div className="space-y-4">
                  <section aria-labelledby="admin-order-items">
                    <h3 id="admin-order-items" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Items</h3>
                    <ul className="mt-2 divide-y divide-line border-y border-line">
                      {lineItems.map(({ line, product }) => (
                        <li key={`${line.productId}-${line.variantId ?? "default"}`} className="flex items-center gap-3 py-2.5">
                          <span className="size-10 shrink-0 overflow-hidden rounded-md">
                            <ProductArt art={product.art} palette={product.palette} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium text-ink">{product.name}</span>
                            <span className="block text-[0.625rem] text-ink-faint">
                              {sellers.find((seller) => seller.id === product.sellerId)?.name} · qty {line.quantity}
                            </span>
                          </span>
                          <span className="tabular text-xs text-ink">{formatMoney(line.unitPrice * line.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-labelledby="admin-order-timeline">
                    <h3 id="admin-order-timeline" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Timeline</h3>
                    <ol className="mt-2">
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
                            <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">{formatDateTime(event.at)} · {event.actor.toLowerCase()}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>

                  {selected.returnRequest && (
                    <section aria-labelledby="admin-return" className="rounded-md border border-warning/30 bg-warning/[0.05] p-3">
                      <h3 id="admin-return" className="text-xs font-medium text-ink">Return request · {selected.returnRequest.status.toLowerCase()}</h3>
                      <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-soft">{selected.returnRequest.reason}</p>
                      <p className="mt-1 font-mono text-[0.5625rem] text-ink-faint">Requested {formatDateTime(selected.returnRequest.requestedAt)}</p>
                      {selected.returnRequest.status === "REQUESTED" && (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={returnNote}
                            onChange={(event) => setReturnNote(event.target.value)}
                            rows={2}
                            placeholder="Decision note (required to decline)…"
                            aria-label="Return decision note"
                            className="text-xs"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => decideReturn(selected, true)}>
                              <Check className="size-3.5" aria-hidden="true" /> Approve refund
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => decideReturn(selected, false)}>
                              <X className="size-3.5" aria-hidden="true" /> Decline
                            </Button>
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                </div>

                <div className="space-y-4">
                  <section aria-labelledby="admin-order-summary" className="rounded-lg border border-line bg-surface p-3">
                    <h3 id="admin-order-summary" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Summary</h3>
                    <dl className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between gap-2"><dt className="text-ink-faint">Subtotal</dt><dd className="tabular text-ink">{formatMoney(selected.subtotal)}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-ink-faint">Delivery</dt><dd className="tabular text-ink">{formatMoney(selected.shipping)}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-ink-faint">Tax</dt><dd className="tabular text-ink">{formatMoney(selected.tax)}</dd></div>
                      {selected.discount > 0 && <div className="flex justify-between gap-2"><dt className="text-success">Discount</dt><dd className="tabular text-success">− {formatMoney(selected.discount)}</dd></div>}
                      <div className="flex justify-between gap-2 border-t border-line pt-1 text-sm font-semibold"><dt>Total</dt><dd className="tabular">{formatMoney(selected.total)}</dd></div>
                    </dl>
                    <p className="mt-2 border-t border-line pt-2 text-[0.625rem] leading-relaxed text-ink-faint">{selected.shippingAddress}</p>
                    <p className="mt-1 text-[0.625rem] text-ink-faint">
                      {selected.paymentMethod.replaceAll("_", " ").toLowerCase()} · {selected.paymentStatus.toLowerCase()}
                    </p>
                  </section>

                  <section aria-labelledby="admin-order-status" className="rounded-lg border border-line bg-surface p-3">
                    <h3 id="admin-order-status" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Change status</h3>
                    <Select
                      value={manualStatus}
                      onChange={(event) => setManualStatus(event.target.value as OrderStatus)}
                      aria-label="Set order status"
                      className="mt-2 h-9 text-xs"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{statusCopy[status].label}</option>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      variant="outline"
                      disabled={manualStatus === selected.status}
                      onClick={() => changeStatus(selected, manualStatus)}
                    >
                      Apply status
                    </Button>
                    <p className="mt-2 text-[0.5625rem] leading-relaxed text-ink-faint">
                      Cancelling or refunding marks the demo payment refunded. No external system is contacted.
                    </p>
                  </section>

                  {selected.shipment && (
                    <section aria-labelledby="admin-shipment" className="rounded-lg border border-line bg-surface p-3">
                      <h3 id="admin-shipment" className="flex items-center gap-1.5 text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">
                        <Truck className="size-3" aria-hidden="true" /> Shipment
                      </h3>
                      <p className="mt-1 text-xs text-ink">{selected.shipment.carrier}</p>
                      <p className="font-mono text-[0.625rem] text-ink-faint">{selected.shipment.trackingNumber}</p>
                      <p className="mt-1 text-[0.625rem] text-ink-faint">ETA {formatDate(selected.shipment.estimatedDelivery)}</p>
                    </section>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setSelectedId(null)}>
                  <RotateCcw className="size-4" aria-hidden="true" /> Close ledger entry
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
