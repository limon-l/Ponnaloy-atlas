"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardCheck,
  Gauge,
  Package,
  RotateCcw,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { BarList, StatusDonut, TrendChart } from "@/components/charts";
import { OrderStatusBadge } from "@/components/order-status";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import {
  fulfilmentQueue,
  metricDelta,
  revenueSeries,
  sellerPerformance,
  statusBreakdown,
  sumRevenue,
} from "@/lib/analytics";
import { useCatalog, useSellers } from "@/lib/hooks";
import { DEMO_NOW } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

export default function AdminDashboardPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const revenue = sumRevenue(state.orders);
  const series = revenueSeries(state.orders, 30);
  const performance = sellerPerformance(state.orders);
  const commission = performance.reduce((sum, entry) => sum + entry.commission, 0);
  const pendingProducts = products.filter((product) => product.moderation === "PENDING" && !product.archived);
  const pendingSellers = sellers.filter((seller) => seller.status === "PENDING");
  const openReturns = state.orders.filter((order) => order.returnRequest?.status === "REQUESTED");
  const queue = fulfilmentQueue(state.orders);
  const lowStock = products
    .filter((product) => product.moderation === "APPROVED" && !product.archived)
    .map((product) => ({
      product,
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, product.stock),
    }))
    .filter((entry) => entry.stock <= state.settings.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Marketplace operations · ${formatDate(DEMO_NOW, { weekday: "long", day: "numeric", month: "long" })}`}
        title="Command centre"
        description="A single view of catalogue health, fulfilment risk, seller governance and marketplace economics. Values derive from the same demo orders as the customer and seller surfaces."
        meta={
          <>
            <Badge variant="success">{sellers.filter((seller) => seller.status === "APPROVED").length} approved studios</Badge>
            <Badge variant="warning">{pendingProducts.length} pending listings</Badge>
            <Badge variant="outline">{openReturns.length} open returns</Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/audit">
                <ShieldCheck className="size-4" aria-hidden="true" /> Audit trail
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/moderation">
                <ClipboardCheck className="size-4" aria-hidden="true" /> Review queue
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Platform GMV"
          value={formatMoney(revenue)}
          detail="vs. previous 14 days"
          delta={metricDelta(state.orders, "revenue")}
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Marketplace fees"
          value={formatMoney(commission)}
          detail="commission across approved sellers"
          icon={Gauge}
          tone="copper"
        />
        <MetricCard
          label="Orders"
          value={String(state.orders.length)}
          detail={`${queue.length} awaiting fulfilment`}
          delta={metricDelta(state.orders, "orders")}
          icon={Package}
          tone="ink"
        />
        <MetricCard
          label="Interventions"
          value={String(pendingProducts.length + openReturns.length + pendingSellers.length)}
          detail="moderation + returns + applications"
          icon={ShieldCheck}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <Panel
          title="Marketplace revenue, 30 days"
          description="Gross merchandise value across every approved studio."
          action={<Badge variant="outline">Demo clock · 29 Oct 2026</Badge>}
        >
          <TrendChart data={series} label="Platform demo revenue, 30 days" height={260} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[0.6875rem] text-ink-faint">
            <span>{state.orders.length} demo orders · {formatMoney(commission)} estimated commission</span>
            <Link href="/admin/analytics" className="inline-flex items-center gap-1 font-medium text-teal hover:underline">
              Full analytics <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </Panel>

        <Panel
          title="Intervention queue"
          description="Items that need a human decision, not another dashboard."
          action={<Badge variant="warning">{pendingProducts.length + openReturns.length + pendingSellers.length} open</Badge>}
        >
          <ul className="divide-y divide-line">
            <li>
              <Link href="/admin/moderation" className="focus-ring group flex items-center gap-3 rounded-md py-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-copper-soft text-copper">
                  <ClipboardCheck className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-ink">Listing moderation</span>
                  <span className="block text-[0.625rem] text-ink-faint">Approve, reject or return with a note</span>
                </span>
                <span className="tabular text-xs font-medium text-ink">{pendingProducts.length}</span>
                <ArrowRight className="size-3.5 text-ink-faint" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/admin/orders?filter=returns" className="focus-ring group flex items-center gap-3 rounded-md py-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-warning/10 text-warning">
                  <RotateCcw className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-ink">Return requests</span>
                  <span className="block text-[0.625rem] text-ink-faint">Approve refunds or decline with a timeline note</span>
                </span>
                <span className="tabular text-xs font-medium text-ink">{openReturns.length}</span>
                <ArrowRight className="size-3.5 text-ink-faint" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/admin/sellers" className="focus-ring group flex items-center gap-3 rounded-md py-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-teal-soft text-teal">
                  <Users className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-ink">Seller applications</span>
                  <span className="block text-[0.625rem] text-ink-faint">Review studio status and commission</span>
                </span>
                <span className="tabular text-xs font-medium text-ink">{pendingSellers.length}</span>
                <ArrowRight className="size-3.5 text-ink-faint" aria-hidden="true" />
              </Link>
            </li>
          </ul>
          {pendingProducts.length > 0 && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-[0.5625rem] uppercase tracking-[0.13em] text-ink-faint">Oldest pending listing</p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <span className="size-9 overflow-hidden rounded-md">
                  <ProductArt art={pendingProducts[0]!.art} palette={pendingProducts[0]!.palette} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-ink">{pendingProducts[0]!.name}</span>
                  <span className="block text-[0.625rem] text-ink-faint">
                    {sellers.find((seller) => seller.id === pendingProducts[0]!.sellerId)?.name}
                  </span>
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/moderation">Review</Link>
                </Button>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Seller performance"
          description="Gross revenue and marketplace fee by studio."
          action={
            <Link href="/admin/sellers" className="text-[0.6875rem] font-medium text-teal hover:underline">
              Manage
            </Link>
          }
        >
          <BarList
            items={performance.slice(0, 6).map((entry) => ({
              label: entry.seller.name,
              value: entry.revenue,
              meta: `${entry.orders} o`,
            }))}
            emptyLabel="No seller revenue yet."
          />
        </Panel>
        <Panel title="Order mix" description="Status distribution across all demo orders.">
          <StatusDonut data={statusBreakdown(state.orders)} />
        </Panel>
        <Panel
          title="Stock risk"
          description={`Approved listings at or below ${state.settings.lowStockThreshold} units.`}
          action={<Badge variant={lowStock.length > 0 ? "warning" : "success"}>{lowStock.length}</Badge>}
        >
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Store className="size-7 text-success" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-ink">No stock risk</p>
              <p className="mt-1 text-xs text-ink-faint">All approved listings have more than {state.settings.lowStockThreshold} units.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 4).map(({ product, stock }) => (
                <li key={product.id} className="flex items-center gap-2.5 py-2.5">
                  <span className="size-9 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-ink">{product.name}</span>
                    <span className="block truncate text-[0.625rem] text-ink-faint">{product.brand}</span>
                  </span>
                  <Badge variant={stock === 0 ? "danger" : "warning"}>{stock}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,1fr)]">
        <Panel
          title="Fulfilment exposure"
          description="Orders awaiting seller action, oldest first."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">Open ledger</Link>
            </Button>
          }
        >
          {queue.length === 0 ? (
            <p className="py-6 text-sm text-ink-faint">No orders are waiting on fulfilment.</p>
          ) : (
            <ul className="divide-y divide-line">
              {queue.slice(0, 5).map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-2 py-2.5">
                  <span className="font-mono text-[0.6875rem] font-medium text-ink">{order.number}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="min-w-0 flex-1 truncate text-[0.625rem] text-ink-faint">
                    {order.customerName} · {formatDate(order.placedAt)} · {order.sellerIds.length} seller(s)
                  </span>
                  <span className="tabular text-xs text-ink">{formatMoney(order.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent audit events"
          description="Demo-local actions, newest first."
          action={
            <Link href="/admin/audit" className="text-[0.6875rem] font-medium text-teal hover:underline">
              Full trail
            </Link>
          }
        >
          <ol className="divide-y divide-line">
            {state.audit.slice(0, 5).map((entry) => (
              <li key={entry.id} className="py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.6875rem] font-medium text-ink">{entry.action}</p>
                  <Badge variant={entry.severity === "CRITICAL" ? "danger" : entry.severity === "WARNING" ? "warning" : "neutral"}>
                    {entry.severity.toLowerCase()}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-[0.625rem] text-ink-soft">{entry.target}</p>
                <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                  {formatDateTime(entry.at)} · {entry.actor}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <WorkspaceNote>
        Demo command centre. Admin mutations write local audit entries and persist in this browser. In production every
        operation would be authorised and recorded by the API, not by the client.
      </WorkspaceNote>
    </div>
  );
}
