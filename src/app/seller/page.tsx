"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { BarList, StatusDonut, TrendChart } from "@/components/charts";
import { OrderStatusBadge } from "@/components/order-status";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DefinitionRow,
  MetricCard,
  PageHeader,
  Panel,
  WorkspaceNote,
} from "@/components/workspace/ui";
import {
  commissionFor,
  fulfilmentQueue,
  metricDelta,
  revenueSeries,
  statusBreakdown,
  sumRevenue,
  topProducts,
} from "@/lib/analytics";
import { useCatalog, useSellers } from "@/lib/hooks";
import { DEMO_NOW } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import { cn, formatDate, formatMoney, formatPercent } from "@/lib/utils";

export default function SellerDashboardPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const sellerOrders = state.orders.filter((order) => order.sellerIds.includes(state.sellerId));
  const queue = fulfilmentQueue(state.orders, state.sellerId);
  const revenue = sumRevenue(sellerOrders);
  const payouts = commissionFor(state.sellerId, state.orders);
  const series = revenueSeries(sellerOrders, 30);
  const sellerProducts = products.filter((product) => product.sellerId === state.sellerId);
  const lowStock = sellerProducts
    .map((product) => ({
      product,
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, product.stock),
    }))
    .filter((entry) => entry.stock <= 6)
    .sort((a, b) => a.stock - b.stock);
  const recent = sellerOrders
    .slice()
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
    .slice(0, 5);
  const top = topProducts(sellerOrders, 4);

  if (!seller) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-soft">
        No seller profile is attached to this session. Open Settings to choose a demo studio.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${seller.name} · ${formatDate(DEMO_NOW, { weekday: "long", day: "numeric", month: "long" })}`}
        title="Studio overview"
        description="Revenue, fulfilment and inventory for the studio you are signed in as. Every figure comes from the same demo orders that power the storefront."
        meta={
          <>
            <Badge variant={seller.status === "APPROVED" ? "success" : "warning"}>{seller.status.toLowerCase()}</Badge>
            <Badge variant="outline">{seller.location}</Badge>
            <Badge variant="teal">{Math.round(seller.commissionRate * 100)}% marketplace commission</Badge>
            <span className="text-2xs text-ink-faint">SLA {seller.fulfilmentSlaHours}h</span>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/sellers/${seller.slug}`}>
                <ShoppingBag className="size-4" aria-hidden="true" /> View storefront
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/seller/orders">
                <Truck className="size-4" aria-hidden="true" /> Fulfilment queue
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Seller revenue"
          value={formatMoney(revenue)}
          detail="vs. previous 14 days"
          delta={metricDelta(sellerOrders, "revenue")}
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Orders"
          value={String(sellerOrders.length)}
          detail="all statuses in scope"
          delta={metricDelta(sellerOrders, "orders")}
          icon={Package}
          tone="ink"
        />
        <MetricCard
          label="Average order"
          value={formatMoney(sellerOrders.length ? revenue / sellerOrders.length : 0)}
          detail="14-day comparison"
          delta={metricDelta(sellerOrders, "aov")}
          icon={PackageCheck}
          tone="copper"
        />
        <MetricCard
          label="Net payable"
          value={formatMoney(payouts.payable)}
          detail={`after ${formatMoney(payouts.commission)} commission`}
          icon={Wallet}
          tone="teal"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,1fr)]">
        <Panel
          title="Revenue, last 30 days"
          description="Gross merchandise value from this studio's orders, excluding cancelled and refunded records."
          action={<Badge variant="outline">Demo clock · 29 Oct 2026</Badge>}
        >
          <TrendChart data={series} label={`${seller.name} demo revenue, 30 days`} height={240} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[0.6875rem] text-ink-faint">
            <span>
              Peak day {formatMoney(Math.max(...series.map((point) => point.value)))} ·{" "}
              {series.filter((point) => point.value > 0).length} trading days shown
            </span>
            <Link href="/seller/analytics" className="inline-flex items-center gap-1 font-medium text-teal hover:underline">
              Open analytics <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </Panel>

        <Panel
          title="Needs attention"
          description="Oldest orders first. Fulfilment actions are available in the queue."
          action={<Badge variant={queue.length > 0 ? "warning" : "success"}>{queue.length} open</Badge>}
        >
          {queue.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <PackageCheck className="size-7 text-success" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-ink">Queue clear</p>
              <p className="mt-1 text-xs text-ink-faint">No confirmed or processing orders are waiting.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {queue.slice(0, 4).map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/seller/orders?order=${order.id}`}
                    className="focus-ring group flex items-center gap-3 rounded-md py-2.5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[0.6875rem] font-medium text-ink">{order.number}</span>
                        <OrderStatusBadge status={order.status} />
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-faint">
                        {order.customerName} · {order.lines.reduce((sum, line) => sum + line.quantity, 0)} items ·{" "}
                        {formatDate(order.placedAt)}
                      </span>
                    </span>
                    <span className="tabular text-xs font-medium text-ink">{formatMoney(order.total)}</span>
                    <ArrowRight className="size-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 border-t border-line pt-3">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/seller/orders">Review all orders</Link>
            </Button>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Recent orders"
          description="Latest activity across all order statuses."
          action={
            <Link href="/seller/orders" className="text-[0.6875rem] font-medium text-teal hover:underline">
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {recent.map((order) => (
              <li key={order.id}>
                <Link href={`/seller/orders?order=${order.id}`} className="focus-ring group flex items-center gap-2 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink/[0.05]">
                    <Package className="size-3.5 text-ink-soft" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-ink">{order.number}</span>
                    <span className="block truncate text-[0.625rem] text-ink-faint">{order.customerName}</span>
                  </span>
                  <span className="text-right">
                    <span className="tabular block text-xs text-ink">{formatMoney(order.total)}</span>
                    <span className="block text-[0.625rem] capitalize text-ink-faint">
                      {order.status.toLowerCase().replaceAll("_", " ")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Top objects"
          description="Ranked by gross revenue from this studio."
          action={
            <Link href="/seller/analytics" className="text-[0.6875rem] font-medium text-teal hover:underline">
              Detail
            </Link>
          }
        >
          <BarList
            items={top.map((entry) => ({
              label: entry.name,
              value: entry.revenue,
              meta: `${entry.units} u`,
            }))}
            emptyLabel="No seller revenue yet."
          />
        </Panel>

        <Panel
          title="Order mix"
          description="Status distribution for this studio."
          action={<Badge variant="outline">{sellerOrders.length} orders</Badge>}
        >
          <StatusDonut data={statusBreakdown(sellerOrders)} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,1fr)]">
        <Panel
          title="Inventory watch"
          description="Objects with six or fewer units across all options."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/seller/products">Manage catalogue</Link>
            </Button>
          }
        >
          {lowStock.length === 0 ? (
            <p className="py-4 text-sm text-ink-faint">No low-stock objects in this studio.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 5).map(({ product, stock }) => (
                <li key={product.id} className="flex items-center gap-3 py-2.5">
                  <span className="size-10 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-ink">{product.name}</span>
                    <span className="block text-[0.625rem] text-ink-faint">
                      {product.variants.map((variant) => `${variant.option}: ${variant.stock}`).join(" · ")}
                    </span>
                  </span>
                  <Badge variant={stock === 0 ? "danger" : "warning"}>{stock} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Payout position" description="Derived from the same order totals, in USD cents.">
          <dl className="divide-y divide-line">
            <DefinitionRow label="Gross revenue" value={formatMoney(payouts.revenue)} />
            <DefinitionRow
              label={`Commission (${formatPercent(payouts.rate, 0)})`}
              value={`− ${formatMoney(payouts.commission)}`}
            />
            <DefinitionRow
              label="Net payable"
              value={<span className="text-base text-teal">{formatMoney(payouts.payable)}</span>}
              className="pt-2 text-sm"
            />
            <DefinitionRow label="Orders in scope" value={String(payouts.orders)} />
          </dl>
          <Button asChild className="mt-4 w-full" variant="outline" size="sm">
            <Link href="/seller/earnings">
              <Wallet className="size-4" aria-hidden="true" /> Open earnings
            </Link>
          </Button>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Boxes, label: "Catalogue", value: `${sellerProducts.filter((p) => p.moderation === "APPROVED").length} live`, href: "/seller/products" },
          { icon: CalendarDays, label: "SLA", value: `${seller.fulfilmentSlaHours}h target`, href: "/seller/settings" },
          { icon: Wallet, label: "Commission", value: `${Math.round(seller.commissionRate * 100)}%`, href: "/seller/earnings" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "focus-ring group flex items-center gap-3 rounded-lg border border-line bg-surface-raised p-3.5 transition-colors hover:border-line-strong"
            )}
          >
            <span className="grid size-8 place-items-center rounded-full bg-teal-soft text-teal">
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">{item.label}</span>
              <span className="block text-xs font-medium text-ink">{item.value}</span>
            </span>
            <ArrowRight className="size-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <WorkspaceNote>
        Demo seller workspace. Revenue and commissions are computed from synthetic orders; no payout is initiated. The
        current studio can be changed from Settings for inspection purposes only.
      </WorkspaceNote>
    </div>
  );
}
