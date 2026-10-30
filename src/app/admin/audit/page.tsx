"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Filter, Search, ShieldCheck, ShieldAlert, ShieldX, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard, PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useAtlasState } from "@/lib/store";
import type { AuditEntry } from "@/lib/types";
import { cn, downloadCsv, formatDateTime } from "@/lib/utils";

type SeverityFilter = "ALL" | AuditEntry["severity"];

const severityOptions: Array<{ id: SeverityFilter; label: string }> = [
  { id: "ALL", label: "All events" },
  { id: "INFO", label: "Info" },
  { id: "WARNING", label: "Warning" },
  { id: "CRITICAL", label: "Critical" },
];

const PAGE_SIZE = 25;

const severityVariant: Record<AuditEntry["severity"], "neutral" | "warning" | "danger"> = {
  INFO: "neutral",
  WARNING: "warning",
  CRITICAL: "danger",
};

export default function AdminAuditPage() {
  const state = useAtlasState();
  const [severity, setSeverity] = React.useState<SeverityFilter>("ALL");
  const [query, setQuery] = React.useState("");
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  const counts = React.useMemo(
    () => ({
      ALL: state.audit.length,
      INFO: state.audit.filter((entry) => entry.severity === "INFO").length,
      WARNING: state.audit.filter((entry) => entry.severity === "WARNING").length,
      CRITICAL: state.audit.filter((entry) => entry.severity === "CRITICAL").length,
    }),
    [state.audit]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.audit.filter((entry) => {
      if (severity !== "ALL" && entry.severity !== severity) return false;
      if (!q) return true;
      return [entry.action, entry.target, entry.actor, entry.severity].some((value) => value.toLowerCase().includes(q));
    });
  }, [query, severity, state.audit]);

  const shown = filtered.slice(0, visible);
  const hasFilters = severity !== "ALL" || query.trim().length > 0;

  const resetFilters = () => {
    setSeverity("ALL");
    setQuery("");
    setVisible(PAGE_SIZE);
  };

  const exportTrail = () => {
    downloadCsv(
      "ponnaloy-atlas-audit.csv",
      filtered.map((entry) => ({
        timestamp: entry.at,
        severity: entry.severity,
        actor: entry.actor,
        action: entry.action,
        target: entry.target,
        id: entry.id,
      }))
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Governance · demo-local trail"
        title="Audit trail"
        description="Every order transition, shipment, return decision, moderation outcome, seller governance change and settings update made in this browser is recorded here. Entries are newest first and capped at 80 so the demo cannot grow without bound."
        meta={
          <>
            <Badge variant="outline">{counts.ALL} events retained</Badge>
            {counts.WARNING > 0 && <Badge variant="warning">{counts.WARNING} warnings</Badge>}
            {counts.CRITICAL > 0 && <Badge variant="danger">{counts.CRITICAL} critical</Badge>}
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportTrail} disabled={filtered.length === 0}>
              <Download className="size-4" aria-hidden="true" /> Export CSV
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/settings">Platform settings</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Events retained" value={String(counts.ALL)} detail="maximum 80 in demo state" icon={ShieldCheck} />
        <MetricCard label="Informational" value={String(counts.INFO)} detail="completed operations" icon={ShieldCheck} tone="teal" />
        <MetricCard label="Warnings" value={String(counts.WARNING)} detail="returns and reversals" icon={ShieldAlert} tone="copper" />
        <MetricCard label="Critical" value={String(counts.CRITICAL)} detail="seller suspensions" icon={ShieldX} tone="warning" />
      </div>

      <Panel
        title="Event log"
        description="Filter by severity or search actors, actions and targets. The table is keyboard-scrollable and every row has a heading."
        action={<Badge variant="outline">{filtered.length} matching</Badge>}
      >
        <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by severity">
            {severityOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSeverity(option.id);
                  setVisible(PAGE_SIZE);
                }}
                aria-pressed={severity === option.id}
                className={cn(
                  "focus-ring inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[0.6875rem] font-medium transition-colors",
                  severity === option.id
                    ? "border-teal bg-teal text-white"
                    : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink"
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "tabular rounded-full px-1.5 py-0.5 text-[0.5625rem]",
                    severity === option.id ? "bg-white/20 text-white" : "bg-ink/[0.06] text-ink-faint"
                  )}
                >
                  {counts[option.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label htmlFor="audit-search" className="block min-w-[13rem] flex-1 text-[0.625rem] font-medium text-ink-soft">
              Search the trail
              <span className="relative mt-1 block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
                <Input
                  id="audit-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                  placeholder="Actor, action or target"
                  className="pl-8"
                />
              </span>
            </label>
            <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasFilters}>
              <Trash2 className="size-3.5" aria-hidden="true" /> Clear
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Filter className="size-7 text-ink-faint" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">No events match this filter</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-faint">
              {hasFilters
                ? "Clear the search or choose a different severity. The seeded trail contains moderation, order and governance events."
                : "Perform an admin action—moderate a listing, resolve a return or change a commission—and it will appear here."}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="w-full min-w-[46rem] border-collapse text-left text-xs">
                <caption className="sr-only">Demo audit events, newest first</caption>
                <thead>
                  <tr className="border-b border-line text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    <th scope="col" className="py-2 pr-3 font-medium">When</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Severity</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Actor</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Action</th>
                    <th scope="col" className="py-2 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((entry) => (
                    <tr key={entry.id} className="align-top">
                      <th scope="row" className="whitespace-nowrap py-2.5 pr-3 font-mono text-[0.625rem] font-normal text-ink-faint">
                        <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                      </th>
                      <td className="py-2.5 pr-3">
                        <Badge variant={severityVariant[entry.severity]}>{entry.severity}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-soft">{entry.actor}</td>
                      <td className="py-2.5 pr-3 font-medium text-ink">{entry.action}</td>
                      <td className="py-2.5 text-ink-soft">{entry.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <p className="text-[0.625rem] text-ink-faint">
                Showing {shown.length} of {filtered.length} matching events
                {filtered.length !== counts.ALL ? ` · ${counts.ALL} retained` : ""}
              </p>
              {visible < filtered.length && (
                <Button variant="outline" size="sm" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, filtered.length - visible)} more
                </Button>
              )}
            </div>
          </>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="What is recorded" description="Actions that change marketplace state, not page views.">
          <ul className="space-y-2.5 text-xs leading-relaxed text-ink-soft">
            {[
              "Order creation, status transitions, shipments and cancellations.",
              "Customer return requests and admin refund or rejection decisions.",
              "Listing approval, rejection and return-to-moderation with notes.",
              "Seller status, commission and fulfilment-SLA changes.",
              "Platform settings saved from the admin settings surface.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Integrity boundary" description="What this demo audit trail cannot claim.">
          <p className="text-xs leading-relaxed text-ink-soft">
            This is a browser-local trail. It is not tamper-evident, append-only or server-authoritative, and clearing site
            data erases it. In production, audit records would be written inside the API transaction that performs the
            mutation, with actor identity from the session—not from a client role switch.
          </p>
          <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface/60 p-3 text-[0.625rem] leading-relaxed text-ink-faint">
            <strong className="font-medium text-ink">Do not infer compliance.</strong> This page demonstrates traceability
            in the UI. It is not a SOC 2, GDPR or financial audit artefact.
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/help#demo-data">Read the demo data disclosure</Link>
          </Button>
        </Panel>
      </div>

      <WorkspaceNote>
        Audit entries are capped at 80 and persisted with the demo store in this browser. Exporting produces exactly the
        filtered rows shown above; no server request is made.
      </WorkspaceNote>
    </div>
  );
}
