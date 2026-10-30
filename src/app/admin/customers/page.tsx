"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, Download, Mail, Search, UserRound, Users } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { customers } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import type { Customer } from "@/lib/types";
import { downloadCsv, formatDate, formatMoney, initials, titleCase } from "@/lib/utils";

type SortKey = "name" | "spend" | "orders" | "joinedAt";
type SortDirection = "asc" | "desc";

const segments = ["all", "VIP", "Returning", "New"] as const;
const statuses = ["all", "ACTIVE", "AT_RISK", "BLOCKED"] as const;

const statusVariant = {
  ACTIVE: "success",
  AT_RISK: "warning",
  BLOCKED: "danger",
} as const;

export default function AdminCustomersPage() {
  const state = useAtlasState();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [segment, setSegment] = React.useState<(typeof segments)[number]>("all");
  const [status, setStatus] = React.useState<(typeof statuses)[number]>("all");
  const [sort, setSort] = React.useState<{ key: SortKey; direction: SortDirection }>({
    key: "spend",
    direction: "desc",
  });
  const [selected, setSelected] = React.useState<Customer | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = customers
      .filter((customer) => segment === "all" || customer.segment === segment)
      .filter((customer) => status === "all" || customer.status === status)
      .filter((customer) =>
        q
          ? [customer.name, customer.email, customer.location, customer.id].join(" ").toLowerCase().includes(q)
          : true
      );

    return rows.sort((a, b) => {
      const multiplier = sort.direction === "asc" ? 1 : -1;
      if (sort.key === "name") return a.name.localeCompare(b.name) * multiplier;
      if (sort.key === "joinedAt") return (Date.parse(a.joinedAt) - Date.parse(b.joinedAt)) * multiplier;
      if (sort.key === "orders") return (a.orders - b.orders) * multiplier;
      return (a.spend - b.spend) * multiplier;
    });
  }, [query, segment, status, sort]);

  const totalSpend = customers.reduce((sum, customer) => sum + customer.spend, 0);
  const totalOrders = customers.reduce((sum, customer) => sum + customer.orders, 0);
  const vipCount = customers.filter((customer) => customer.segment === "VIP").length;
  const atRisk = customers.filter((customer) => customer.status !== "ACTIVE").length;

  const customerOrders = selected
    ? state.orders.filter((order) => order.customerId === selected.id)
    : [];

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" ? "asc" : "desc" }
    );
  };

  const exportCustomers = () => {
    if (filtered.length === 0) {
      toast({ title: "Nothing to export", description: "Adjust the filters first.", tone: "error" });
      return;
    }
    downloadCsv(
      "ponnaloy-customers.csv",
      filtered.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        segment: customer.segment,
        status: customer.status,
        location: customer.location,
        orders: customer.orders,
        lifetime_spend_usd: (customer.spend / 100).toFixed(2),
        joined: formatDate(customer.joinedAt),
      }))
    );
    toast({ title: "Customer directory exported", description: `${filtered.length} rows written locally.`, tone: "success" });
  };

  const sortLabel = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="focus-ring inline-flex items-center gap-1 rounded-sm text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint hover:text-ink"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ArrowUpDown
        className={`size-2.5 ${sort.key === key ? "text-teal" : "opacity-45"}`}
        aria-hidden="true"
      />
      {sort.key === key && <span className="sr-only">{sort.direction === "asc" ? "ascending" : "descending"}</span>}
    </button>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Customers"
        title="People behind the orders"
        description="A read-only customer directory built from the seeded marketplace identities. Open a customer to inspect the orders currently held in this browser's demo state."
        meta={
          <>
            <Badge variant="teal">{customers.length} demo customers</Badge>
            <Badge variant="outline">{vipCount} VIP</Badge>
            <Badge variant={atRisk > 0 ? "warning" : "success"}>{atRisk} need attention</Badge>
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={exportCustomers}>
            <Download className="size-4" aria-hidden="true" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Customers", String(customers.length), "Seeded identities"],
          ["Lifetime spend", formatMoney(totalSpend), "Across the demo directory"],
          ["Orders", String(totalOrders), "Historical records"],
          ["Average spend", formatMoney(Math.round(totalSpend / Math.max(1, customers.length))), "Per customer"],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-xl border border-line bg-surface-raised p-4 shadow-whisper">
            <p className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{label}</p>
            <p className="tabular mt-2 font-display text-[1.6rem] leading-none tracking-[-0.03em] text-ink">{value}</p>
            <p className="mt-2 text-[0.625rem] text-ink-faint">{detail}</p>
          </div>
        ))}
      </div>

      <Panel title="Customer directory" description="Search, filter and sort. Row actions open a detail panel rather than navigating away.">
        <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or location…"
              aria-label="Search customers"
              className="h-9 pl-8 text-xs"
            />
          </div>
          <Select
            value={segment}
            onChange={(event) => setSegment(event.target.value as (typeof segments)[number])}
            className="h-9 text-xs sm:w-40"
            aria-label="Filter by segment"
          >
            {segments.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All segments" : item}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}
            className="h-9 text-xs sm:w-40"
            aria-label="Filter by status"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All statuses" : titleCase(item)}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">No customers match</p>
            <p className="mt-1 text-xs text-ink-faint">Clear a filter or try another search.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <caption className="sr-only">Marketplace customer directory</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="pb-2 pr-3">{sortLabel("name", "Customer")}</th>
                  <th scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">Segment</th>
                  <th scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">Status</th>
                  <th scope="col" className="pb-2 pr-3">{sortLabel("orders", "Orders")}</th>
                  <th scope="col" className="pb-2 pr-3">{sortLabel("spend", "Spend")}</th>
                  <th scope="col" className="pb-2 pr-3">{sortLabel("joinedAt", "Joined")}</th>
                  <th scope="col" className="pb-2 text-right text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-[0.625rem] font-semibold text-teal">
                          {initials(customer.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-ink">{customer.name}</p>
                          <p className="truncate text-[0.625rem] text-ink-faint">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge variant={customer.segment === "VIP" ? "copper" : "outline"}>{customer.segment}</Badge>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge variant={statusVariant[customer.status]}>{titleCase(customer.status)}</Badge>
                    </td>
                    <td className="tabular py-2.5 pr-3 text-xs text-ink">{customer.orders}</td>
                    <td className="tabular py-2.5 pr-3 text-xs text-ink">{formatMoney(customer.spend)}</td>
                    <td className="py-2.5 pr-3 text-[0.6875rem] text-ink-soft">{formatDate(customer.joinedAt)}</td>
                    <td className="py-2.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(customer)}>
                        <UserRound className="size-3.5" aria-hidden="true" /> Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[0.625rem] text-ink-faint">
          Showing {filtered.length} of {customers.length} records. Customer edits and account deletion are intentionally not
          exposed in this demo.
        </p>
      </Panel>

      <WorkspaceNote>
        Customer records are synthetic identities. The order list inside a detail panel reads live browser-local orders, so
        a checkout completed in the storefront appears here immediately. Production customer administration requires
        server-side authorisation and an audited data-access policy.
      </WorkspaceNote>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.location} · joined {formatDate(selected.joinedAt)} · {selected.segment}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  ["Lifetime spend", formatMoney(selected.spend)],
                  ["Historical orders", String(selected.orders)],
                  ["Demo orders here", String(customerOrders.length)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-line bg-surface p-3">
                    <p className="text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">{label}</p>
                    <p className="tabular mt-1 text-sm font-medium text-ink">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-line">
                <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
                  <p className="text-xs font-medium text-ink">Orders in this demo session</p>
                  <Badge variant={selected.status === "ACTIVE" ? "success" : selected.status === "BLOCKED" ? "danger" : "warning"}>
                    {titleCase(selected.status)}
                  </Badge>
                </div>
                {customerOrders.length === 0 ? (
                  <p className="px-3 py-6 text-xs text-ink-faint">
                    No browser-local orders for this seeded identity. Place an order as Amara Okafor to add one.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {customerOrders.slice(0, 8).map((order) => (
                      <li key={order.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                        <Link href={`/orders/${order.id}`} className="font-mono text-[0.6875rem] font-medium text-teal hover:underline">
                          {order.number}
                        </Link>
                        <OrderStatusBadge status={order.status} />
                        <span className="min-w-0 flex-1 truncate text-[0.625rem] text-ink-faint">
                          {formatDate(order.placedAt)} · {order.lines.reduce((sum, line) => sum + line.quantity, 0)} items
                        </span>
                        <span className="tabular text-xs text-ink">{formatMoney(order.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <a
                  href={`mailto:${selected.email}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-teal hover:underline"
                >
                  <Mail className="size-3.5" aria-hidden="true" /> {selected.email}
                </a>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/orders">Open order ledger</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
