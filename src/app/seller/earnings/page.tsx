"use client";

import * as React from "react";
import { Banknote, CalendarClock, CircleDollarSign, Download, ReceiptText, Wallet } from "lucide-react";
import { BarList } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useToast } from "@/components/ui/toast";
import { commissionFor, revenueOrders } from "@/lib/analytics";
import { useSellers } from "@/lib/hooks";
import { DEMO_NOW } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import { downloadCsv, formatDate, formatMoney, formatPercent } from "@/lib/utils";

export default function SellerEarningsPage() {
  const state = useAtlasState();
  const sellers = useSellers();
  const { toast } = useToast();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const payouts = commissionFor(state.sellerId, state.orders);
  const scoped = revenueOrders(state.orders.filter((order) => order.sellerIds.includes(state.sellerId)));
  const rate = payouts.rate;

  const monthly = React.useMemo(() => {
    const buckets = new Map<string, { gross: number; commission: number; orders: number }>();
    for (const order of scoped) {
      const key = order.placedAt.slice(0, 7);
      const current = buckets.get(key) ?? { gross: 0, commission: 0, orders: 0 };
      buckets.set(key, {
        gross: current.gross + order.total,
        commission: current.commission + Math.round(order.total * rate),
        orders: current.orders + 1,
      });
    }
    return [...buckets.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([month, value]) => ({ month, ...value }));
  }, [scoped, rate]);

  const statement = scoped
    .slice()
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
    .slice(0, 12);

  const nextPayout = new Date(DEMO_NOW);
  const daysUntilFriday = (5 - nextPayout.getUTCDay() + 7) % 7 || 7;
  nextPayout.setUTCDate(nextPayout.getUTCDate() + daysUntilFriday);

  const exportStatement = () => {
    if (statement.length === 0) {
      toast({ title: "No statement lines", description: "There are no revenue-bearing orders for this studio.", tone: "error" });
      return;
    }
    downloadCsv(
      `ponnaloy-earnings-${seller?.slug ?? "studio"}.csv`,
      statement.map((order) => ({
        order: order.number,
        placed: formatDate(order.placedAt),
        gross_usd: (order.total / 100).toFixed(2),
        commission_rate: formatPercent(rate, 0),
        commission_usd: ((order.total * rate) / 100).toFixed(2),
        net_usd: ((order.total * (1 - rate)) / 100).toFixed(2),
      }))
    );
    toast({ title: "Statement exported", description: `${statement.length} lines written to a local CSV.`, tone: "success" });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={seller?.name ?? "Seller workspace"}
        title="Earnings & payouts"
        description="A commission-ready view of gross revenue, marketplace fees and net payable. Values are synthetic and no bank transfer is initiated."
        meta={
          <>
            <Badge variant="teal">{formatPercent(rate, 0)} commission</Badge>
            <Badge variant="outline">USD · minor units</Badge>
            <Badge variant="warning">Demo ledger</Badge>
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={exportStatement}>
            <Download className="size-4" aria-hidden="true" /> Export statement
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross revenue" value={formatMoney(payouts.revenue)} detail={`${payouts.orders} revenue-bearing orders`} icon={CircleDollarSign} />
        <MetricCard label="Marketplace fee" value={formatMoney(payouts.commission)} detail={`${formatPercent(rate, 0)} of gross`} icon={ReceiptText} tone="copper" />
        <MetricCard label="Net payable" value={formatMoney(payouts.payable)} detail="Current demo position" icon={Wallet} tone="teal" />
        <MetricCard label="Next demo payout" value={formatDate(nextPayout)} detail="Illustrative Friday schedule" icon={CalendarClock} tone="ink" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,1fr)]">
        <Panel
          title="Monthly position"
          description="Gross, fee and net grouped by the month the order was placed."
          action={<Badge variant="outline">Last 6 active months</Badge>}
        >
          {monthly.length === 0 ? (
            <p className="py-6 text-sm text-ink-faint">No revenue-bearing orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <caption className="sr-only">Seller monthly earnings</caption>
                <thead>
                  <tr className="border-b border-line">
                    {["Month", "Orders", "Gross", "Fee", "Net"].map((heading) => (
                      <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {monthly.map((row) => (
                    <tr key={row.month}>
                      <th scope="row" className="py-2.5 pr-3 text-xs font-medium text-ink">
                        {new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${row.month}-01T00:00:00.000Z`))}
                      </th>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink-soft">{row.orders}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink">{formatMoney(row.gross)}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-copper">− {formatMoney(row.commission)}</td>
                      <td className="tabular py-2.5 text-xs font-medium text-teal">{formatMoney(row.gross - row.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Payout composition" description="Where the gross amount goes.">
            <BarList
              format="currency"
              items={[
                { label: "Net to studio", value: payouts.payable },
                { label: "Marketplace commission", value: payouts.commission },
              ]}
            />
            <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
              <div className="flex justify-between gap-2"><dt className="text-ink-faint">Gross revenue</dt><dd className="tabular text-ink">{formatMoney(payouts.revenue)}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-faint">Commission rate</dt><dd className="tabular text-ink">{formatPercent(rate, 0)}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-faint">Net payable</dt><dd className="tabular font-medium text-teal">{formatMoney(payouts.payable)}</dd></div>
            </dl>
          </Panel>

          <Panel title="Payout note" description="What is and is not happening.">
            <div className="flex items-start gap-2.5">
              <Banknote className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden="true" />
              <p className="text-[0.6875rem] leading-relaxed text-ink-soft">
                The figure shown is a computed demo balance. No payout account, tax document or transfer is connected.
                Commission is editable only by an administrator in this demo.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <Panel
        title="Statement lines"
        description="The twelve most recent revenue-bearing orders for this studio."
        action={<Badge variant="outline">{statement.length} lines</Badge>}
      >
        {statement.length === 0 ? (
          <p className="py-6 text-sm text-ink-faint">No statement lines yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <caption className="sr-only">Seller statement lines</caption>
              <thead>
                <tr className="border-b border-line">
                  {["Order", "Placed", "Gross", "Fee", "Net"].map((heading) => (
                    <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {statement.map((order) => {
                  const fee = Math.round(order.total * rate);
                  return (
                    <tr key={order.id}>
                      <th scope="row" className="py-2.5 pr-3 font-mono text-[0.6875rem] font-medium text-ink">{order.number}</th>
                      <td className="py-2.5 pr-3 text-xs text-ink-soft">{formatDate(order.placedAt)}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink">{formatMoney(order.total)}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-copper">− {formatMoney(fee)}</td>
                      <td className="tabular py-2.5 text-xs font-medium text-teal">{formatMoney(order.total - fee)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <WorkspaceNote>
        Earnings are derived from the same orders as the storefront and seller queue. Changing commission in the admin
        workspace changes this calculation on the next render. This is a demo, not a financial record.
      </WorkspaceNote>
    </div>
  );
}
