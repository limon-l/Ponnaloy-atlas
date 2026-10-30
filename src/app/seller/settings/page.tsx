"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, LockKeyhole, RefreshCw, ShieldCheck, Store, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useSellers } from "@/lib/hooks";
import { setSeller, updateSeller, useAtlasState } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function SellerSettingsPage() {
  const state = useAtlasState();
  const sellers = useSellers();
  const { toast } = useToast();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const [form, setForm] = React.useState({
    name: seller?.name ?? "",
    tagline: seller?.tagline ?? "",
    description: seller?.description ?? "",
    location: seller?.location ?? "",
    supportEmail: seller?.supportEmail ?? "",
    fulfilmentSlaHours: String(seller?.fulfilmentSlaHours ?? 24),
  });

  React.useEffect(() => {
    if (!seller) return;
    setForm({
      name: seller.name,
      tagline: seller.tagline,
      description: seller.description,
      location: seller.location,
      supportEmail: seller.supportEmail,
      fulfilmentSlaHours: String(seller.fulfilmentSlaHours),
    });
  }, [seller]);

  if (!seller) {
    return <p className="text-sm text-ink-soft">No seller profile is attached to this session.</p>;
  }

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast({ title: "Studio name is required", tone: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail.trim())) {
      toast({ title: "Enter a valid support email", tone: "error" });
      return;
    }
    const sla = Math.floor(Number(form.fulfilmentSlaHours));
    if (!Number.isFinite(sla) || sla < 1 || sla > 168) {
      toast({ title: "SLA must be between 1 and 168 hours", tone: "error" });
      return;
    }
    const result = updateSeller(seller.id, {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      supportEmail: form.supportEmail.trim(),
      fulfilmentSlaHours: sla,
    });
    if (!result.ok) {
      toast({ title: "Settings not saved", description: result.error, tone: "error" });
      return;
    }
    toast({
      title: "Studio settings saved",
      description: "The seller profile is updated in this browser demo.",
      tone: "success",
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${seller.name} · ${formatDate(seller.joinedAt)}`}
        title="Studio settings"
        description="Storefront identity, support details and fulfilment targets. Commission and approval remain administrator-controlled."
        meta={
          <>
            <Badge variant={seller.status === "APPROVED" ? "success" : "warning"}>{seller.status.toLowerCase()}</Badge>
            <Badge variant="outline">{seller.location}</Badge>
            <Badge variant="teal">{seller.fulfilmentSlaHours}h SLA</Badge>
          </>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/sellers/${seller.slug}`}>
              <Store className="size-4" aria-hidden="true" /> View public studio
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,1fr)]">
        <Panel title="Public profile" description="These fields appear on the seller storefront.">
          <form onSubmit={save} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Studio name" htmlFor="seller-name">
                <Input id="seller-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </Field>
              <Field label="Location" htmlFor="seller-location">
                <Input id="seller-location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
              </Field>
            </div>
            <Field label="Tagline" htmlFor="seller-tagline" hint="One short line shown above the studio name.">
              <Input id="seller-tagline" value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} />
            </Field>
            <Field label="Studio description" htmlFor="seller-description">
              <Textarea id="seller-description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Support email" htmlFor="seller-email">
                <Input id="seller-email" type="email" value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} />
              </Field>
              <Field label="Fulfilment SLA (hours)" htmlFor="seller-sla" hint="Target dispatch window shown to administrators.">
                <Input id="seller-sla" type="number" min="1" max="168" value={form.fulfilmentSlaHours} onChange={(event) => setForm({ ...form, fulfilmentSlaHours: event.target.value })} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-[0.625rem] text-ink-faint">Changes persist in localStorage for this demo.</p>
              <Button type="submit">
                <Check className="size-4" aria-hidden="true" /> Save profile
              </Button>
            </div>
          </form>
        </Panel>

        <div className="space-y-4">
          <Panel title="Demo studio" description="Inspect another seller profile without signing out.">
            <label htmlFor="demo-seller" className="text-[0.6875rem] font-medium text-ink">Active studio</label>
            <Select
              id="demo-seller"
              value={state.sellerId}
              onChange={(event) => {
                setSeller(event.target.value);
                toast({
                  title: "Demo studio switched",
                  description: "Seller-scoped products and orders now belong to the selected studio.",
                  tone: "info",
                });
              }}
              className="mt-1.5"
            >
              {sellers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.status.toLowerCase()}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-[0.625rem] leading-relaxed text-ink-faint">
              This selector exists for demo inspection. A production seller session would be bound to one studio by the API.
            </p>
            <div className="mt-3 rounded-md border border-line bg-surface p-2.5">
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-2"><dt className="text-ink-faint">Marketplace commission</dt><dd className="tabular text-ink">{Math.round(seller.commissionRate * 100)}%</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-ink-faint">Approval state</dt><dd className="capitalize text-ink">{seller.status.toLowerCase()}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-ink-faint">Joined</dt><dd className="text-ink">{formatDate(seller.joinedAt)}</dd></div>
              </dl>
            </div>
          </Panel>

          <Panel title="Boundaries" description="What a seller cannot change here.">
            <ul className="space-y-2.5 text-xs leading-relaxed text-ink-soft">
              <li className="flex items-start gap-2"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-copper" aria-hidden="true" /> Marketplace commission is administrator-controlled.</li>
              <li className="flex items-start gap-2"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-copper" aria-hidden="true" /> Listings cannot self-approve moderation.</li>
              <li className="flex items-start gap-2"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-copper" aria-hidden="true" /> Payout bank details are not editable in this demo.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" /> Server-side ownership checks are documented as the production boundary.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: UserCog, title: "Account role", body: "Seller preview only. The API remains authoritative.", href: "/account" },
          { icon: Building2, title: "Marketplace rules", body: "Commission, moderation and returns policy.", href: "/admin/settings" },
          { icon: RefreshCw, title: "Demo data", body: "Reset state from Account if the demo drifts.", href: "/account" },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="focus-ring group flex items-start gap-3 rounded-xl border border-line bg-surface-raised p-4 transition-colors hover:border-line-strong"
          >
            <item.icon className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-ink">{item.title}</span>
              <span className="mt-0.5 block text-[0.625rem] leading-relaxed text-ink-faint">{item.body}</span>
            </span>
            <ArrowRight className="size-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <WorkspaceNote>
        Seller settings are a browser demonstration. In production, profile writes would be scoped by the authenticated
        seller identity and validated by the API, not by the selected demo studio.
      </WorkspaceNote>
    </div>
  );
}
