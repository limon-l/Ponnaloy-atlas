"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Eye, Image as ImageIcon, LayoutTemplate, MousePointerClick, Sparkles } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useCatalog } from "@/lib/hooks";
import { campaigns, collections } from "@/lib/seed";
import { saveProduct, useAtlasState } from "@/lib/store";
import { formatDate, formatNumber, formatPercent, titleCase } from "@/lib/utils";

export default function AdminMerchandisingPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const { toast } = useToast();
  const approved = products.filter((product) => product.moderation === "APPROVED" && !product.archived);
  const featured = approved.filter((product) => product.featured);
  const liveCampaigns = campaigns.filter((campaign) => campaign.status === "LIVE");

  const toggleFeatured = (productId: string, next: boolean) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const result = saveProduct(productId, { featured: next });
    toast({
      title: result.ok ? (next ? "Added to the homepage edit" : "Removed from the homepage edit") : "Update failed",
      description: result.ok
        ? `${product.name} · ${next ? "now visible in the featured edit" : "no longer featured"}. Persisted locally.`
        : result.error,
      tone: result.ok ? "success" : "error",
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Merchandising"
        title="The homepage is a decision"
        description="Curate which approved objects appear in the storefront's featured edit, and inspect the demo campaign schedule. Changes take effect on the storefront immediately."
        meta={
          <>
            <Badge variant="teal">{featured.length} featured</Badge>
            <Badge variant="success">{liveCampaigns.length} live campaigns</Badge>
            <Badge variant="outline">Browser-local curation</Badge>
          </>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <Eye className="size-4" aria-hidden="true" /> View storefront
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <Panel
          title="Featured edit"
          description="Only approved, unarchived listings can be featured. Toggle an object to add or remove it from the homepage."
          action={<Badge variant="outline">{approved.length} eligible</Badge>}
        >
          {approved.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">No approved listings are available to merchandise.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {approved.map((product) => (
                <li key={product.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2.5">
                  <span className="size-12 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{product.name}</p>
                    <p className="truncate text-[0.625rem] text-ink-faint">
                      {product.brand} · {titleCase(product.category)}
                    </p>
                  </div>
                  <label htmlFor={`featured-${product.id}`} className="flex shrink-0 items-center gap-1.5 text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                    <span className="sr-only">Feature {product.name} on the homepage</span>
                    <Switch
                      id={`featured-${product.id}`}
                      checked={Boolean(product.featured)}
                      onCheckedChange={(checked) => toggleFeatured(product.id, checked)}
                    />
                    <span aria-hidden="true">{product.featured ? "On" : "Off"}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[0.625rem] text-ink-faint">
            The homepage shows the first eight featured objects in catalogue order. Hiding a listing removes it from the
            featured grid but does not archive it.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title="Homepage composition" description="What a visitor sees first.">
            <div className="overflow-hidden rounded-lg border border-line">
              <div className="aspect-[16/10]">
                <StillLifeArt palette={collections[0]!.palette} variant={1} />
              </div>
              <div className="border-t border-line bg-surface p-3">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-copper">{collections[0]!.kicker}</p>
                <p className="mt-1 font-display text-lg tracking-[-0.02em] text-ink">{collections[0]!.name}</p>
                <p className="mt-1 line-clamp-2 text-[0.625rem] leading-relaxed text-ink-faint">{collections[0]!.description}</p>
              </div>
            </div>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-faint">Featured objects</dt>
                <dd className="tabular font-medium text-ink">{featured.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-faint">Approved catalogue</dt>
                <dd className="tabular font-medium text-ink">{approved.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-faint">Live campaigns</dt>
                <dd className="tabular font-medium text-ink">{liveCampaigns.length}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href="/collections">
                <LayoutTemplate className="size-4" aria-hidden="true" /> Inspect collections
              </Link>
            </Button>
          </Panel>

          <Panel title="Merchandising rules" description="What this surface can and cannot change.">
            <ul className="space-y-2 text-[0.6875rem] leading-relaxed text-ink-soft">
              <li className="flex gap-2"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-copper" aria-hidden="true" /> Featured state is real and affects the storefront immediately.</li>
              <li className="flex gap-2"><ImageIcon className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" /> Product imagery is an original local vector study; no upload is offered.</li>
              <li className="flex gap-2"><MousePointerClick className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" /> Campaign metrics are seeded projections with no ad platform connected.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <Panel
        title="Campaign schedule"
        description="Read-only demo projection. Campaign activation would be server-managed in production."
        action={<Badge variant="outline">{campaigns.length} campaigns</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <caption className="sr-only">Campaign schedule and demo performance</caption>
            <thead>
              <tr className="border-b border-line">
                {["Campaign", "Placement", "Status", "Window", "Impressions", "Clicks", "CTR"].map((heading) => (
                  <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <th scope="row" className="py-2.5 pr-3 text-left text-xs font-medium text-ink">{campaign.title}</th>
                  <td className="py-2.5 pr-3 text-[0.6875rem] text-ink-soft">{titleCase(campaign.placement)}</td>
                  <td className="py-2.5 pr-3">
                    <Badge variant={campaign.status === "LIVE" ? "success" : campaign.status === "SCHEDULED" ? "warning" : "neutral"}>
                      {titleCase(campaign.status)}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-[0.625rem] text-ink-faint">
                    {formatDate(campaign.startsAt)} → {formatDate(campaign.endsAt)}
                  </td>
                  <td className="tabular py-2.5 pr-3 text-xs text-ink-soft">{formatNumber(campaign.impressions)}</td>
                  <td className="tabular py-2.5 pr-3 text-xs text-ink-soft">{formatNumber(campaign.clicks)}</td>
                  <td className="tabular py-2.5 text-xs font-medium text-ink">
                    {campaign.impressions > 0 ? formatPercent(campaign.clicks / campaign.impressions, 2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[0.625rem] text-ink-faint">
          Campaign performance is synthetic and does not represent live traffic. Scheduling controls are intentionally
          omitted rather than presented as working functionality.
        </p>
      </Panel>

      <WorkspaceNote>
        This surface curates real browser-local catalogue state for the storefront. It does not publish to a CDN, schedule
        email, or write to an advertising platform. {state.role === "SUPER_ADMIN" ? "Super Admin session detected." : "Standard admin preview."}
      </WorkspaceNote>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-4 text-xs text-ink-soft">
        <span className="font-medium text-ink">Related operations:</span>
        <Link href="/admin/moderation" className="editorial-link">Moderation queue <ArrowRight className="size-3" aria-hidden="true" /></Link>
        <Link href="/admin/products" className="editorial-link">Catalogue index <ArrowRight className="size-3" aria-hidden="true" /></Link>
        <Link href="/admin/settings" className="editorial-link">Platform policy <ArrowRight className="size-3" aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
