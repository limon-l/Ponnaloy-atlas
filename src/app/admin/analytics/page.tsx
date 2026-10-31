"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, Boxes, CircleDollarSign, Percent, ShieldCheck, Store, Users } from "lucide-react";
import { BarList, StatusDonut, TrendChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import {
  averageOrderValue,
  categoryPerformance,
  metricDelta,
  revenueSeries,
  sellerPerformance,
  statusBreakdown,
  sumRevenue,
  topProducts,
} from "@/lib/analytics";
import { useSellers } from "@/lib/hooks";
import { DEMO_NOW } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import { formatMoney, formatNumber, formatPercent } from "@/lib/utils";

const ranges = [7, 14, 30] as const;
type Range = (typeof ranges)[number];

export default function AdminAnalyticsPage() {
  const state = useAtlasState();
  const sellers = useSellers();
  const [range, setRange] = React.useState<Range>(30);

  const series = revenueSeries(state.orders, range);
  const windowRevenue = series.reduce((sum, point) => sum + point.value, 0);
  const lifetimeRevenue = sumRevenue(state.orders);
  const performance = sellerPerformance(state.orders);
  const commission = performance.reduce((sum, entry) => sum + entry.commission, 0);
  const top = topProducts(state.orders, 6);
  const categories = categoryPerformance(state.orders);
  const statuses = statusBreakdown(state.orders);
  const approved = sellers.filter((seller) => seller.status === "APPROVED");
  const concentration = lifetimeRevenue === 0 ? 0 : performance[0]?.revenue ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Marketplace intelligence · ${formatNumber(state.orders.length)} demo orders`}
        title="Analytics"
        description="Platform-wide revenue, seller concentration, category mix and order health, calculated from the same demo records that power the storefront and seller workspace. Every figure is traceable to an order."
        meta={
          <>
            <Badge variant="outline">Demo clock · 29 Oct 2026</Badge>
            <Badge variant="teal">{formatMoney(lifetimeRevenue)} lifetime GMV</Badge>
            <Badge variant="copper">{formatPercent(commission / Math.max(1, lifetimeRevenue), 1)} blended commission</Badge>
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
                  range === value ? "bg-teal text-primary-foreground" : "text-ink-soft hover:bg-ink/[0.05]"
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
          label={`GMV · ${range} days`}
          value={formatMoney(windowRevenue)}
          detail="revenue-bearing orders only"
          delta={metricDelta(state.orders, "revenue")}
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Average order value"
          value={formatMoney(averageOrderValue(state.orders))}
          detail="platform-wide"
          delta={metricDelta(state.orders, "aov")}
          icon={BarChart3}
          tone="copper"
        />
        <MetricCard
          label="Marketplace fees"
          value={formatMoney(commission)}
          detail="estimated across approved studios"
          icon={Percent}
          tone="ink"
        />
        <MetricCard
          label="Approved studios"
          value={String(approved.length)}
          detail={`${sellers.length - approved.length} pending or suspended`}
          icon={Users}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,1fr)]">
        <Panel
          title="Revenue and order volume"
          description={`${range}-day daily series. The accessible table behind the chart lists every date, including zero days.`}
          action={<Badge variant="outline">Platform-wide</Badge>}
        >
          <TrendChart data={series} label={`Platform demo revenue, ${range} days`} height={280} />
          <div className="mt-4 grid gap-2 border-t border-line pt-4 text-[0.6875rem] text-ink-faint sm:grid-cols-3">
            <p>
              <span className="block text-[0.5625rem] uppercase tracking-[0.12em]">Peak day</span>
              <span className="tabular mt-0.5 block text-sm text-ink">
                {formatMoney(Math.max(0, ...series.map((point) => point.value)))}
              </span>
            </p>
            <p>
              <span className="block text-[0.5625rem] uppercase tracking-[0.12em]">Trading days</span>
              <span className="tabular mt-0.5 block text-sm text-ink">{series.filter((point) => point.value > 0).length}</span>
            </p>
            <p>
              <span className="block text-[0.5625rem] uppercase tracking-[0.12em]">Orders in window</span>
              <span className="tabular mt-0.5 block text-sm text-ink">
                {series.reduce((sum, point) => sum + (point.secondary ?? 0), 0)}
              </span>
            </p>
          </div>
        </Panel>

        <Panel title="Order health" description="Every status, including closed and refunded records.">
          <StatusDonut data={statuses} />
          <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
            {statuses.slice(0, 5).map((entry) => (
              <div key={entry.status} className="flex justify-between gap-2">
                <dt className="capitalize text-ink-faint">{entry.status.toLowerCase().replaceAll("_", " ")}</dt>
                <dd className="tabular text-ink">
                  {entry.count} · {formatMoney(entry.value)}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Top objects" description="Gross revenue across all platform lines.">
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
        <Panel title="Concentration" description="Largest studio share of lifetime GMV.">
          <div className="space-y-4">
            <div>
              <p className="tabular font-display text-3xl leading-none text-ink">
                {formatPercent(lifetimeRevenue === 0 ? 0 : concentration / lifetimeRevenue, 1)}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                {performance[0]?.seller.name ?? "No studio revenue"} accounts for the largest share.
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line/70" role="img" aria-label={`Top studio share ${formatPercent(lifetimeRevenue === 0 ? 0 : concentration / lifetimeRevenue, 1)}`}>
              <div
                className="h-full rounded-full bg-copper"
                style={{ width: `${Math.min(100, lifetimeRevenue === 0 ? 0 : (concentration / lifetimeRevenue) * 100)}%` }}
              />
            </div>
            <div className="rounded-lg border border-dashed border-line-strong bg-surface/60 p-3 text-[0.625rem] leading-relaxed text-ink-faint">
              <strong className="font-medium text-ink">Reading the number:</strong> concentration is a demo-data property,
              not a marketplace forecast. A single studio can dominate a small seeded catalogue.
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        title="Seller economics"
        description="Revenue, order count and estimated commission by studio. Commission rates are editable in seller governance."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/sellers">
              <Store className="size-4" aria-hidden="true" /> Manage studios
            </Link>
          </Button>
        }
      >
        <div className="table-scroll">
          <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
            <caption className="sr-only">Seller revenue, order count and estimated commission</caption>
            <thead>
              <tr className="border-b border-line text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                <th scope="col" className="py-2 pr-3 font-medium">Studio</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Orders</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Revenue</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Rate</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Commission</th>
                <th scope="col" className="py-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {performance.map((entry) => (
                <tr key={entry.seller.id} className="text-ink-soft">
                  <th scope="row" className="py-2.5 pr-3 font-medium text-ink">
                    <Link href={`/sellers/${entry.seller.slug}`} className="hover:text-teal hover:underline">
                      {entry.seller.name}
                    </Link>
                  </th>
                  <td className="tabular py-2.5 pr-3 text-right">{entry.orders}</td>
                  <td className="tabular py-2.5 pr-3 text-right">{formatMoney(entry.revenue)}</td>
                  <td className="tabular py-2.5 pr-3 text-right">{formatPercent(entry.seller.commissionRate, 0)}</td>
                  <td className="tabular py-2.5 pr-3 text-right">{formatMoney(entry.commission)}</td>
                  <td className="tabular py-2.5 text-right">
                    {formatPercent(lifetimeRevenue === 0 ? 0 : entry.revenue / lifetimeRevenue, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line-strong font-medium text-ink">
                <th scope="row" className="py-2.5 pr-3">Total</th>
                <td className="tabular py-2.5 pr-3 text-right">{state.orders.length}</td>
                <td className="tabular py-2.5 pr-3 text-right">{formatMoney(lifetimeRevenue)}</td>
                <td className="py-2.5 pr-3" />
                <td className="tabular py-2.5 pr-3 text-right">{formatMoney(commission)}</td>
                <td className="tabular py-2.5 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Metric definitions" description="How this page calculates its numbers.">
          <dl className="space-y-3 text-xs leading-relaxed text-ink-soft">
            <div>
              <dt className="font-medium text-ink">GMV</dt>
              <dd className="mt-0.5 text-ink-faint">
                Sum of order totals for pending, confirmed, processing, shipped, out-for-delivery and delivered orders.
                Cancelled, returned and refunded orders are excluded.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Commission</dt>
              <dd className="mt-0.5 text-ink-faint">
                Each studio&apos;s lifetime revenue multiplied by its current commission rate. Editing a rate in seller
                governance changes this figure immediately.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Delta</dt>
              <dd className="mt-0.5 text-ink-faint">
                Last 14 days compared with the preceding 14 days, regardless of the selected chart range. A small
                denominator can make the percentage move sharply.
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Data provenance" description="Where the numbers come from, and what they are not.">
          <ul className="space-y-3 text-xs leading-relaxed text-ink-soft">
            <li className="flex gap-2">
              <Boxes className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
              <span>
                <strong className="font-medium text-ink">{state.orders.length} seeded orders</strong> plus any session orders
                created in this browser. No live API is connected in demo mode.
              </span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
              <span>
                <strong className="font-medium text-ink">Server-authoritative in production.</strong> This page would read
                from role-checked analytics endpoints, not from client state.
              </span>
            </li>
            <li className="flex gap-2">
              <BarChart3 className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
              <span>
                <strong className="font-medium text-ink">No benchmark claims.</strong> Seed values are synthetic. They are
                internally consistent, not representative of a real marketplace.
              </span>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/audit">
                <ShieldCheck className="size-4" aria-hidden="true" /> Audit trail
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/journey">Connected journey</Link>
            </Button>
          </div>
        </Panel>
      </div>

      <WorkspaceNote>
        Synthetic analytics at the fixed demo clock of {DEMO_NOW.slice(0, 10)}. Every figure is measured from the same
        in-browser order records as the rest of Atlas; nothing here is a projection or a fabricated benchmark.
      </WorkspaceNote>
    </div>
  );
}
