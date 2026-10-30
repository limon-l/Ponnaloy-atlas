"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, Boxes, CircleDollarSign, Package } from "lucide-react";
import { BarList, StatusDonut, TrendChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import {
  averageOrderValue,
  categoryPerformance,
  metricDelta,
  revenueSeries,
  statusBreakdown,
  sumRevenue,
  topProducts,
} from "@/lib/analytics";
import { useSellers } from "@/lib/hooks";
import { useAtlasState } from "@/lib/store";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const ranges = [7, 14, 30] as const;
type Range = (typeof ranges)[number];

export default function SellerAnalyticsPage() {
  const state = useAtlasState();
  const sellers = useSellers();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const [range, setRange] = React.useState<Range>(30);

  const sellerOrders = React.useMemo(
    () => state.orders.filter((order) => order.sellerIds.includes(state.sellerId)),
    [state.orders, state.sellerId]
  );
  const revenue = sumRevenue(sellerOrders);
  const series = revenueSeries(sellerOrders, range);
  const seriesTotal = series.reduce((sum, point) => sum + point.value, 0);
  const top = topProducts(sellerOrders, 6);
  const categories = categoryPerformance(sellerOrders);
  const statuses = statusBreakdown(sellerOrders);
  const fallbackOrders: Order[] = sellerOrders;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={seller?.name ?? "Seller workspace"}
        title="Analytics"
        description="Every chart is derived from seller-scoped order records. No benchmark, projection or platform-wide number is mixed into this view."
        meta={
          <>
            <Badge variant="outline">{sellerOrders.length} orders in scope</Badge>
            <Badge variant="teal">{formatMoney(revenue)} lifetime GMV</Badge>
          </>
        }
        actions={
          <div className="flex gap-1 rounded-md border border-line bg-surface-raised p-0.5" role="group" aria-label="Chart range">
            {ranges.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                aria-pressed={range === value}
                className={`focus-ring rounded px-2.5 py-1.5 text-[0.6875rem] font-medium transition-colors ${
                  range === value ? "bg-teal text-white" : "text-ink-soft hover:bg-ink/[0.05]"
                }`}
              >
                {value}d
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={`Revenue · ${range} days`}
          value={formatMoney(seriesTotal)}
          detail="vs. previous 14-day window"
          delta={metricDelta(sellerOrders, "revenue")}
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Average order value"
          value={formatMoney(averageOrderValue(sellerOrders))}
          detail="revenue-bearing orders"
          delta={metricDelta(sellerOrders, "aov")}
          icon={Package}
          tone="copper"
        />
        <MetricCard
          label="Orders"
          value={String(sellerOrders.length)}
          detail="all statuses in scope"
          delta={metricDelta(sellerOrders, "orders")}
          icon={BarChart3}
          tone="ink"
        />
        <MetricCard
          label="Category spread"
          value={String(categories.length)}
          detail="categories with sales"
          icon={Boxes}
          tone="teal"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,1fr)]">
        <Panel
          title="Revenue and order count"
          description={`${range}-day daily series. The accessible table behind the chart lists every date.`}
          action={<Badge variant="outline">Seller-scoped</Badge>}
        >
          <TrendChart data={series} label={`${seller?.name ?? "Seller"} revenue, ${range} days`} height={270} />
          <div className="mt-4 grid gap-2 border-t border-line pt-4 text-[0.6875rem] text-ink-faint sm:grid-cols-3">
            <p>
              <span className="block text-[0.5625rem] uppercase tracking-[0.12em]">Peak day</span>
              <span className="tabular mt-0.5 block text-sm text-ink">{formatMoney(Math.max(0, ...series.map((point) => point.value)))}</span>
            </p>
            <p>
              <span className="block text-[0.5625rem] uppercase tracking-[0.12em]">Trading days</span>
              <span className="tabular mt-0.5 block text-sm text-ink">{series.filter((point) => point.value > 0).length}</span>
            </p>
            <p>
              <span className="block text-[0.5625rem] uppercase tracking-[0.12em]">Orders in window</span>
              <span className="tabular mt-0.5 block text-sm text-ink">{series.reduce((sum, point) => sum + (point.secondary ?? 0), 0)}</span>
            </p>
          </div>
        </Panel>

        <Panel title="Order health" description="All seller-scoped statuses, including closed records.">
          <StatusDonut data={statuses} />
          <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
            {statuses.slice(0, 5).map((entry) => (
              <div key={entry.status} className="flex justify-between gap-2">
                <dt className="capitalize text-ink-faint">{entry.status.toLowerCase().replaceAll("_", " ")}</dt>
                <dd className="tabular text-ink">{entry.count} · {formatMoney(entry.value)}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Top objects" description="Gross revenue from seller lines.">
          <BarList
            items={top.map((entry) => ({ label: entry.name, value: entry.revenue, meta: `${entry.units} u` }))}
            emptyLabel="No sold objects yet."
          />
        </Panel>
        <Panel title="Category mix" description="Revenue grouped by catalogue category.">
          <BarList
            items={categories.map((entry) => ({
              label: entry.category.replace(/^\w/, (letter) => letter.toUpperCase()),
              value: entry.revenue,
              meta: `${entry.units} u`,
            }))}
            emptyLabel="No category sales yet."
          />
        </Panel>
        <Panel title="Metric definitions" description="How this page calculates its numbers.">
          <dl className="space-y-3 text-xs leading-relaxed text-ink-soft">
            <div>
              <dt className="font-medium text-ink">Revenue</dt>
              <dd className="mt-0.5 text-ink-faint">Sum of order totals for pending, confirmed, processing, shipped, out-for-delivery and delivered orders.</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Average order value</dt>
              <dd className="mt-0.5 text-ink-faint">Revenue divided by the number of revenue-bearing orders, not all records.</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Delta</dt>
              <dd className="mt-0.5 text-ink-faint">Last 14 days compared with the preceding 14 days. A small denominator can make this move sharply.</dd>
            </div>
          </dl>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/seller/earnings">Open payout breakdown</Link>
          </Button>
        </Panel>
      </div>

      {fallbackOrders.length === 0 && (
        <Panel title="No seller orders yet">
          <p className="text-sm text-ink-soft">
            This seller has not received an order in the demo data. Analytics will populate automatically when an order
            containing this studio&apos;s products is placed.
          </p>
        </Panel>
      )}

      <WorkspaceNote>
        These are measured values from the synthetic demo dataset, not performance benchmarks. The chart uses an inline
        SVG with an accessible summary and hidden data table; no third-party chart library is loaded.
      </WorkspaceNote>
    </div>
  );
}
