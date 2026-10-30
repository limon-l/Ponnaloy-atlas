"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Banknote, CircleDollarSign, Download, ReceiptText, RotateCcw, Search, TriangleAlert } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { metricDelta, sellerPerformance, sumRevenue } from "@/lib/analytics";
import { resolveReturn, useAtlasState } from "@/lib/store";
import type { Order, PaymentStatus } from "@/lib/types";
import { downloadCsv, formatDate, formatDateTime, formatMoney, formatPercent, titleCase } from "@/lib/utils";

const paymentStatuses: Array<PaymentStatus | "all"> = ["all", "PAID", "PENDING", "AUTHORIZED", "FAILED", "REFUNDED"];
const paymentMethods = ["all", "CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"] as const;

const paymentTone: Record<PaymentStatus, "success" | "warning" | "info" | "danger" | "neutral"> = {
  PAID: "success",
  PENDING: "warning",
  AUTHORIZED: "info",
  FAILED: "danger",
  REFUNDED: "neutral",
};

function paymentLabel(method: Order["paymentMethod"]) {
  if (method === "CASH_ON_DELIVERY") return "Cash on delivery";
  if (method === "BANK_TRANSFER") return "Bank transfer";
  return "Card";
}

export default function AdminFinancePage() {
  const state = useAtlasState();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof paymentStatuses)[number]>("all");
  const [method, setMethod] = React.useState<(typeof paymentMethods)[number]>("all");
  const [confirmRefund, setConfirmRefund] = React.useState<{ order: Order; approve: boolean } | null>(null);

  const orders = state.orders;
  const paid = orders.filter((order) => order.paymentStatus === "PAID");
  const pending = orders.filter((order) => ["PENDING", "AUTHORIZED"].includes(order.paymentStatus));
  const refunded = orders.filter((order) => order.paymentStatus === "REFUNDED");
  const returns = orders.filter((order) => order.returnRequest);
  const openReturns = returns.filter((order) => order.returnRequest?.status === "REQUESTED");
  const performance = sellerPerformance(orders);
  const commission = performance.reduce((sum, entry) => sum + entry.commission, 0);

  const filteredPayments = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((order) => status === "all" || order.paymentStatus === status)
      .filter((order) => method === "all" || order.paymentMethod === method)
      .filter((order) =>
        q ? [order.number, order.customerName, order.email, order.shippingAddress].join(" ").toLowerCase().includes(q) : true
      )
      .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt));
  }, [orders, status, method, query]);

  const exportPayments = () => {
    if (filteredPayments.length === 0) {
      toast({ title: "Nothing to export", description: "Adjust the payment filters first.", tone: "error" });
      return;
    }
    downloadCsv(
      "ponnaloy-payments.csv",
      filteredPayments.map((order) => ({
        order: order.number,
        placed: formatDate(order.placedAt),
        customer: order.customerName,
        email: order.email,
        method: paymentLabel(order.paymentMethod),
        payment_status: order.paymentStatus,
        order_status: order.status,
        total_usd: (order.total / 100).toFixed(2),
        source: order.source,
      }))
    );
    toast({ title: "Payment ledger exported", description: `${filteredPayments.length} rows written locally.`, tone: "success" });
  };

  const applyRefundDecision = () => {
    if (!confirmRefund) return;
    const result = resolveReturn(confirmRefund.order.id, confirmRefund.approve);
    toast({
      title: result.ok ? (confirmRefund.approve ? "Return approved" : "Return declined") : "Action failed",
      description: result.ok
        ? confirmRefund.approve
          ? `${confirmRefund.order.number} marked refunded in the demo ledger. No money moved.`
          : `${confirmRefund.order.number} remains in its previous state.`
        : result.error,
      tone: result.ok ? "success" : "error",
    });
    setConfirmRefund(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Finance"
        title="Payments, returns and fees"
        description="One ledger for payment state, return decisions and marketplace commission. Every figure is derived from the same demo orders as the storefront and seller workspace."
        meta={
          <>
            <Badge variant="success">{paid.length} paid</Badge>
            <Badge variant="warning">{pending.length} pending</Badge>
            <Badge variant={openReturns.length > 0 ? "warning" : "outline"}>{openReturns.length} open returns</Badge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportPayments}>
              <Download className="size-4" aria-hidden="true" /> Export payments
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/orders">Order ledger</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Collected (demo)", value: formatMoney(sumRevenue(paid)), detail: `${paid.length} paid orders`, icon: CircleDollarSign, delta: metricDelta(orders, "revenue") },
          { label: "Awaiting payment", value: formatMoney(pending.reduce((sum, order) => sum + order.total, 0)), detail: `${pending.length} pending/authorised`, icon: Banknote, delta: undefined },
          { label: "Refunded", value: formatMoney(refunded.reduce((sum, order) => sum + order.total, 0)), detail: `${refunded.length} completed returns`, icon: RotateCcw, delta: undefined },
          { label: "Commission", value: formatMoney(commission), detail: "Net of seller payouts", icon: ReceiptText, delta: undefined },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-line bg-surface-raised p-4 shadow-whisper">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{metric.label}</p>
              <metric.icon className="size-4 text-copper" aria-hidden="true" />
            </div>
            <p className="tabular mt-2 font-display text-[1.6rem] leading-none tracking-[-0.03em] text-ink">{metric.value}</p>
            <p className="mt-2 text-[0.625rem] text-ink-faint">
              {metric.delta !== undefined && (
                <span className="mr-1 font-medium text-success">{formatPercent(metric.delta, 1)} vs prior period ·</span>
              )}
              {metric.detail}
            </p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="payments">
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="refunds">
            Returns & refunds
            {openReturns.length > 0 && (
              <span className="tabular rounded-full bg-warning/15 px-1.5 py-0.5 text-[0.5625rem] text-warning">{openReturns.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Panel title="Payment ledger" description="Payment state is a demo projection; no processor or settlement account is connected.">
            <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search order, customer or email…"
                  aria-label="Search payments"
                  className="h-9 pl-8 text-xs"
                />
              </div>
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value as (typeof paymentStatuses)[number])}
                className="h-9 text-xs sm:w-40"
                aria-label="Filter by payment status"
              >
                {paymentStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All payment states" : titleCase(item)}
                  </option>
                ))}
              </Select>
              <Select
                value={method}
                onChange={(event) => setMethod(event.target.value as (typeof paymentMethods)[number])}
                className="h-9 text-xs sm:w-44"
                aria-label="Filter by payment method"
              >
                {paymentMethods.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All methods" : paymentLabel(item)}
                  </option>
                ))}
              </Select>
            </div>

            {filteredPayments.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-faint">No payments match the current filters.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[780px] text-left">
                  <caption className="sr-only">Marketplace payment ledger</caption>
                  <thead>
                    <tr className="border-b border-line">
                      {["Order", "Placed", "Customer", "Method", "Payment", "Order", "Total"].map((heading) => (
                        <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredPayments.map((order) => (
                      <tr key={order.id}>
                        <td className="py-2.5 pr-3">
                          <Link href={`/orders/${order.id}`} className="font-mono text-[0.6875rem] font-medium text-teal hover:underline">
                            {order.number}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-[0.6875rem] text-ink-soft">{formatDate(order.placedAt)}</td>
                        <td className="py-2.5 pr-3">
                          <p className="text-xs text-ink">{order.customerName}</p>
                          <p className="text-[0.625rem] text-ink-faint">{order.email}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-[0.6875rem] text-ink-soft">{paymentLabel(order.paymentMethod)}</td>
                        <td className="py-2.5 pr-3">
                          <Badge variant={paymentTone[order.paymentStatus]}>{titleCase(order.paymentStatus)}</Badge>
                        </td>
                        <td className="py-2.5 pr-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="tabular py-2.5 text-xs font-medium text-ink">{formatMoney(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-[0.625rem] text-ink-faint">
              Showing {filteredPayments.length} of {orders.length} demo orders. {orders.filter((order) => order.source === "session").length} were
              created in this browser session.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="refunds">
          <Panel
            title="Return requests"
            description="Approve to mark the order refunded in the demo ledger, or decline to keep the order as-is."
            action={<Badge variant={openReturns.length > 0 ? "warning" : "success"}>{openReturns.length} open</Badge>}
          >
            {returns.length === 0 ? (
              <div className="py-10 text-center">
                <RotateCcw className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-ink">No return requests</p>
                <p className="mt-1 text-xs text-ink-faint">Delivered orders can request a return from the customer order detail page.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {returns
                  .slice()
                  .sort((a, b) => Date.parse(b.returnRequest!.requestedAt) - Date.parse(a.returnRequest!.requestedAt))
                  .map((order) => (
                    <article key={order.id} className="rounded-lg border border-line bg-surface p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/orders/${order.id}`} className="font-mono text-xs font-medium text-teal hover:underline">
                          {order.number}
                        </Link>
                        <OrderStatusBadge status={order.status} />
                        <Badge
                          variant={
                            order.returnRequest!.status === "REQUESTED"
                              ? "warning"
                              : order.returnRequest!.status === "APPROVED" || order.returnRequest!.status === "REFUNDED"
                                ? "success"
                                : "danger"
                          }
                        >
                          {titleCase(order.returnRequest!.status)}
                        </Badge>
                        <span className="min-w-0 flex-1 truncate text-[0.625rem] text-ink-faint">
                          {order.customerName} · requested {formatDateTime(order.returnRequest!.requestedAt)}
                        </span>
                        <span className="tabular text-xs font-medium text-ink">{formatMoney(order.total)}</span>
                      </div>
                      <p className="mt-2 rounded-md bg-surface-raised px-2.5 py-2 text-[0.6875rem] leading-relaxed text-ink-soft">
                        “{order.returnRequest!.reason}”
                      </p>
                      {order.returnRequest!.status === "REQUESTED" ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => setConfirmRefund({ order, approve: true })}>
                            Approve refund
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmRefund({ order, approve: false })}>
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-[0.625rem] text-ink-faint">
                          Decision recorded. This route is completed and cannot be re-opened in the demo.
                        </p>
                      )}
                    </article>
                  ))}
              </div>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="commissions">
          <Panel
            title="Commission by studio"
            description="Commission rates are governed in the seller workspace. Figures here are computed from paid and fulfilled demo orders."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/sellers">
                  Manage sellers <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <caption className="sr-only">Marketplace commission by seller</caption>
                <thead>
                  <tr className="border-b border-line">
                    {["Studio", "Orders", "Gross", "Rate", "Commission", "Net payable"].map((heading) => (
                      <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {performance.map((entry) => (
                    <tr key={entry.seller.id}>
                      <th scope="row" className="py-2.5 pr-3 text-left">
                        <Link href={`/sellers/${entry.seller.slug}`} className="text-xs font-medium text-ink hover:text-teal">
                          {entry.seller.name}
                        </Link>
                        <p className="text-[0.625rem] font-normal text-ink-faint">{entry.seller.location}</p>
                      </th>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink-soft">{entry.orders}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink">{formatMoney(entry.revenue)}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink-soft">{formatPercent(entry.seller.commissionRate, 0)}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-copper">{formatMoney(entry.commission)}</td>
                      <td className="tabular py-2.5 text-xs font-medium text-teal">{formatMoney(entry.revenue - entry.commission)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-line-strong">
                    <th scope="row" className="py-2.5 pr-3 text-left text-xs font-medium text-ink">Platform total</th>
                    <td />
                    <td />
                    <td />
                    <td className="tabular py-2.5 pr-3 text-xs font-medium text-copper">{formatMoney(commission)}</td>
                    <td className="tabular py-2.5 text-xs font-medium text-teal">
                      {formatMoney(performance.reduce((sum, entry) => sum + entry.revenue - entry.commission, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      <WorkspaceNote>
        This is a demonstration ledger. No payment processor, payout account or tax engine is connected. Refund decisions
        mutate browser-local order state and write a demo audit entry; a production implementation must call an authorised
        server endpoint with idempotency and settlement reconciliation.
      </WorkspaceNote>

      <Dialog open={Boolean(confirmRefund)} onOpenChange={(open) => !open && setConfirmRefund(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmRefund?.approve ? "Approve this refund?" : "Decline this return?"}</DialogTitle>
            <DialogDescription>
              {confirmRefund?.order.number} · {confirmRefund ? formatMoney(confirmRefund.order.total) : ""}.{" "}
              {confirmRefund?.approve
                ? "The demo order will be marked refunded and the timeline will record the decision."
                : "The order keeps its current status; the return request will be closed as declined."}
            </DialogDescription>
          </DialogHeader>
          {confirmRefund?.approve && (
            <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 p-3 text-[0.6875rem] leading-relaxed text-warning">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              No money moves. This only updates the browser-local demonstration ledger.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRefund(null)}>
              Cancel
            </Button>
            <Button variant={confirmRefund?.approve ? "primary" : "destructive"} onClick={applyRefundDecision}>
              {confirmRefund?.approve ? "Approve and refund" : "Decline return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
