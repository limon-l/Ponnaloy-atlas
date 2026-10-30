"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDollarSign, Percent, Search, Store, Users } from "lucide-react";
import { BarList } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { scopedOrders, sumRevenue } from "@/lib/analytics";
import { useSellers } from "@/lib/hooks";
import { useAtlasState } from "@/lib/store";
import { updateSeller } from "@/lib/store";
import type { Seller, SellerStatus } from "@/lib/types";
import { formatDate, formatMoney, formatPercent } from "@/lib/utils";

export default function AdminSellersPage() {
  const state = useAtlasState();
  const sellers = useSellers();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<SellerStatus | "ALL">("ALL");
  const [editing, setEditing] = React.useState<Seller | null>(null);
  const [commission, setCommission] = React.useState("12");
  const [status, setStatus] = React.useState<SellerStatus>("APPROVED");
  const [sla, setSla] = React.useState("48");

  React.useEffect(() => {
    if (!editing) return;
    setCommission(String(Math.round(editing.commissionRate * 100)));
    setStatus(editing.status);
    setSla(String(editing.fulfilmentSlaHours));
  }, [editing]);

  const records = React.useMemo(
    () =>
      sellers
        .map((seller) => {
          const scoped = scopedOrders(state.orders, seller.id);
          const revenue = sumRevenue(scoped);
          return {
            seller,
            revenue,
            orders: scoped.length,
            commission: Math.round(revenue * seller.commissionRate),
          };
        })
        .sort((a, b) => b.revenue - a.revenue),
    [sellers, state.orders]
  );

  const filtered = records.filter(({ seller }) => {
    if (statusFilter !== "ALL" && seller.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [seller.name, seller.location, seller.supportEmail, seller.tagline].join(" ").toLowerCase().includes(q);
  });

  const counts = {
    ALL: sellers.length,
    APPROVED: sellers.filter((seller) => seller.status === "APPROVED").length,
    PENDING: sellers.filter((seller) => seller.status === "PENDING").length,
    SUSPENDED: sellers.filter((seller) => seller.status === "SUSPENDED").length,
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const rate = Number(commission);
    if (!Number.isFinite(rate) || rate < 0 || rate > 50) {
      toast({ title: "Commission must be between 0% and 50%", tone: "error" });
      return;
    }
    const hours = Math.floor(Number(sla));
    if (!Number.isFinite(hours) || hours < 1 || hours > 168) {
      toast({ title: "SLA must be between 1 and 168 hours", tone: "error" });
      return;
    }
    const result = updateSeller(editing.id, {
      commissionRate: rate / 100,
      status,
      fulfilmentSlaHours: hours,
    });
    if (!result.ok) {
      toast({ title: "Seller not updated", description: result.error, tone: "error" });
      return;
    }
    toast({
      title: `${editing.name} updated`,
      description: `Commission ${rate}% · ${status.toLowerCase()} · ${hours}h SLA. Recorded in the demo audit trail.`,
      tone: "success",
    });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Marketplace governance"
        title="Sellers & commission"
        description="Approve applications, adjust marketplace commission and inspect seller revenue. Commission changes flow into earnings calculations immediately."
        meta={
          <>
            <Badge variant="success">{counts.APPROVED} approved</Badge>
            <Badge variant="warning">{counts.PENDING} pending</Badge>
            <Badge variant="outline">{counts.SUSPENDED} suspended</Badge>
          </>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics">
              <CircleDollarSign className="size-4" aria-hidden="true" /> Platform economics
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Approved studios", value: counts.APPROVED, detail: "Able to sell", icon: BadgeCheck },
          { label: "Applications", value: counts.PENDING, detail: "Awaiting decision", icon: Users },
          { label: "Average commission", value: formatPercent(sellers.reduce((sum, seller) => sum + seller.commissionRate, 0) / sellers.length, 1), detail: "Across all demo studios", icon: Percent },
          {
            label: "Marketplace fees",
            value: formatMoney(records.reduce((sum, record) => sum + record.commission, 0)),
            detail: "Revenue-bearing orders",
            icon: CircleDollarSign,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-surface-raised p-4">
            <item.icon className="size-4 text-copper" aria-hidden="true" />
            <p className="mt-2 text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{item.label}</p>
            <p className="tabular mt-1 font-display text-2xl leading-none text-ink">{item.value}</p>
            <p className="mt-1 text-[0.625rem] text-ink-faint">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <Panel
          title="Seller directory"
          description="Revenue is derived from the same order records as the storefront."
          action={<Badge variant="outline">{filtered.length} shown</Badge>}
        >
          <div className="flex flex-col gap-2 border-b border-line pb-3 sm:flex-row">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter sellers by status">
              {(["ALL", "APPROVED", "PENDING", "SUSPENDED"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatusFilter(item)}
                  aria-pressed={statusFilter === item}
                  className={`focus-ring rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium transition-colors ${
                    statusFilter === item ? "border-teal bg-teal text-white" : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {item.toLowerCase()}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search studios…"
                aria-label="Search sellers"
                className="h-9 pl-8 text-xs sm:w-52"
              />
            </div>
          </div>

          <ul className="mt-1 divide-y divide-line">
            {filtered.map(({ seller, revenue, orders, commission: fee }) => (
              <li key={seller.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full font-display text-lg text-white"
                  style={{ background: seller.palette.object }}
                  aria-hidden="true"
                >
                  {seller.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{seller.name}</p>
                    <Badge variant={seller.status === "APPROVED" ? "success" : seller.status === "PENDING" ? "warning" : "danger"}>
                      {seller.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[0.6875rem] text-ink-faint">{seller.location} · {seller.tagline}</p>
                  <p className="mt-0.5 text-[0.625rem] text-ink-faint">Joined {formatDate(seller.joinedAt)} · {seller.fulfilmentSlaHours}h SLA</p>
                </div>
                <div className="grid grid-cols-3 gap-4 sm:w-64">
                  <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Revenue</p><p className="tabular mt-0.5 text-xs text-ink">{formatMoney(revenue)}</p></div>
                  <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Fee</p><p className="tabular mt-0.5 text-xs text-ink">{formatMoney(fee)}</p></div>
                  <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Orders</p><p className="tabular mt-0.5 text-xs text-ink">{orders}</p></div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing(seller)}>
                  Manage <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Revenue by studio" description="Gross merchandise value in the demo ledger.">
            <BarList
              items={records.slice(0, 7).map((record) => ({
                label: record.seller.name,
                value: record.revenue,
                meta: `${record.orders} o`,
              }))}
              emptyLabel="No seller revenue yet."
            />
          </Panel>
          <Panel title="Application note" description="What approval means in this demo.">
            <div className="flex items-start gap-2.5">
              <Store className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden="true" />
              <p className="text-[0.6875rem] leading-relaxed text-ink-soft">
                Approving a studio changes its status and storefront visibility. Its listings still require individual
                moderation before appearing in the catalogue.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <WorkspaceNote>
        Commission and seller status are demo mutations stored in this browser. In production these actions would be
        limited to administrators, validated server-side, and written to an immutable audit log.
      </WorkspaceNote>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Manage {editing.name}</DialogTitle>
                <DialogDescription>
                  Commission and status changes are recorded in the audit trail and reflected in seller earnings.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={save} className="space-y-4">
                <div className="rounded-md border border-line bg-surface p-3">
                  <p className="text-xs font-medium text-ink">{editing.tagline}</p>
                  <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-soft">{editing.description}</p>
                  <p className="mt-1.5 font-mono text-[0.625rem] text-ink-faint">{editing.supportEmail}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Status" htmlFor="seller-status">
                    <Select id="seller-status" value={status} onChange={(event) => setStatus(event.target.value as SellerStatus)}>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUSPENDED">Suspended</option>
                    </Select>
                  </Field>
                  <Field label="Commission (%)" htmlFor="seller-commission" hint="0–50%.">
                    <Input
                      id="seller-commission"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={commission}
                      onChange={(event) => setCommission(event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Fulfilment SLA (hours)" htmlFor="seller-sla-admin">
                  <Input
                    id="seller-sla-admin"
                    type="number"
                    min="1"
                    max="168"
                    value={sla}
                    onChange={(event) => setSla(event.target.value)}
                  />
                </Field>
                <div className="flex justify-end gap-2 border-t border-line pt-4">
                  <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button type="submit">Save governance</Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
