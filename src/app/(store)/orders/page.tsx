"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Box, Package, RotateCcw, Search, Truck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { OrderStatusBadge } from "@/components/order-status";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useCatalog } from "@/lib/hooks";
import { addToCart, useAtlasState } from "@/lib/store";
import { activeOrderStatuses } from "@/lib/catalog";
import { formatDate, formatMoney } from "@/lib/utils";

const DEMO_CUSTOMER = "c-1";

export default function OrdersPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"newest" | "oldest" | "value">("newest");

  const orders = React.useMemo(() => {
    const scoped = state.orders.filter((order) => order.customerId === DEMO_CUSTOMER);
    const filtered = scoped.filter((order) =>
      query.trim() ? order.number.toLowerCase().includes(query.trim().toLowerCase()) : true
    );
    return [...filtered].sort((a, b) => {
      if (sort === "value") return b.total - a.total;
      const delta = Date.parse(b.placedAt) - Date.parse(a.placedAt);
      return sort === "oldest" ? -delta : delta;
    });
  }, [state.orders, query, sort]);

  const all = state.orders.filter((order) => order.customerId === DEMO_CUSTOMER);
  const active = all.filter((order) => activeOrderStatuses.includes(order.status));
  const delivered = all.filter((order) => order.status === "DELIVERED");
  const returns = all.filter((order) => order.returnRequest);
  const spend = all
    .filter((order) => !["CANCELLED", "REFUNDED"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-8 sm:py-12">
          <p className="eyebrow">Your account</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-display-xs text-ink">Orders & returns</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Every order placed in this browser appears here, alongside the seeded demo history for Amara Okafor.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Demo customer</Badge>
              <Badge variant="teal">{all.length} orders</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Orders", String(all.length), "Seeded + session"],
            ["Active", String(active.length), "In fulfilment"],
            ["Delivered", String(delivered.length), "Ready for a return"],
            ["Lifetime spend", formatMoney(spend), "Demo ledger"],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-lg border border-line bg-surface-raised p-4">
              <dt className="text-2xs uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
              <dd className="mt-1 font-display text-2xl text-ink">{value}</dd>
              <dd className="mt-0.5 text-2xs text-ink-faint">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by order number…"
              aria-label="Search orders"
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-faint">
            <span>Sort</span>
            <Select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-9 w-auto text-xs" aria-label="Sort orders">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="value">Highest value</option>
            </Select>
          </label>
        </div>

        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({delivered.length})</TabsTrigger>
            <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
          </TabsList>

          {[
            ["all", orders],
            ["active", orders.filter((order) => activeOrderStatuses.includes(order.status))],
            ["delivered", orders.filter((order) => order.status === "DELIVERED")],
            ["returns", orders.filter((order) => order.returnRequest)],
          ].map(([value, list]) => (
            <TabsContent key={value as string} value={value as string}>
              {(list as typeof orders).length === 0 ? (
                <EmptyState
                  icon={value === "returns" ? RotateCcw : Package}
                  title={value === "returns" ? "No returns yet" : "No orders in this view"}
                  description={
                    value === "returns"
                      ? "Delivered orders can request a demo return from the order detail page."
                      : "Try another filter or place a demo order to see the full lifecycle."
                  }
                  action={{ label: "Browse the catalogue", href: "/products" }}
                />
              ) : (
                <ul className="space-y-3">
                  {(list as typeof orders).map((order) => {
                    const lineItems = order.lines
                      .map((line) => ({ line, product: products.find((product) => product.id === line.productId) }))
                      .filter((entry) => entry.product);
                    return (
                      <li key={order.id} className="rounded-xl border border-line bg-surface-raised">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-mono text-xs font-medium text-ink">{order.number}</p>
                            <OrderStatusBadge status={order.status} />
                            {order.returnRequest && (
                              <Badge variant="warning">Return {order.returnRequest.status.toLowerCase()}</Badge>
                            )}
                            <span className="text-2xs text-ink-faint">
                              {formatDate(order.placedAt)} · {order.source === "session" ? "Placed in this browser" : "Seeded demo order"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="tabular text-sm font-semibold text-ink">{formatMoney(order.total)}</p>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/orders/${order.id}`}>
                                View <ArrowRight className="size-3.5" aria-hidden="true" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
                          <div className="flex -space-x-2">
                            {lineItems.slice(0, 4).map(({ line, product }) => (
                              <span
                                key={`${line.productId}-${line.variantId ?? "default"}`}
                                className="size-11 overflow-hidden rounded-full border-2 border-surface-raised"
                                title={product!.name}
                              >
                                <ProductArt art={product!.art} palette={product!.palette} />
                              </span>
                            ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-ink">
                              {lineItems.map(({ product }) => product!.name).join(", ")}
                            </p>
                            <p className="mt-0.5 text-2xs text-ink-faint">
                              {order.lines.reduce((sum, line) => sum + line.quantity, 0)} items ·{" "}
                              {order.shipment
                                ? `${order.shipment.carrier} · ${order.shipment.trackingNumber}`
                                : "No shipment created yet"}
                            </p>
                          </div>
                          {order.shipment && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-2xs text-ink-soft">
                              <Truck className="size-3" aria-hidden="true" /> {order.shipment.status.replaceAll("_", " ").toLowerCase()}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              for (const line of order.lines) {
                                addToCart(line.productId, line.variantId, line.quantity);
                              }
                              toast({ title: "Added to bag", description: "Demo basket · no payment taken.", tone: "success" });
                            }}
                          >
                            <Box className="size-4" aria-hidden="true" /> Buy again
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
