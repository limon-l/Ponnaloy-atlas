"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  ClipboardCheck,
  Eye,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useCatalog, useSellers } from "@/lib/hooks";
import { moderateProduct, useAtlasState } from "@/lib/store";
import type { ModerationStatus, Product } from "@/lib/types";
import { cn, formatDate, formatMoney, titleCase } from "@/lib/utils";

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export default function AdminModerationPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const [status, setStatus] = React.useState<StatusFilter>("PENDING");
  const [query, setQuery] = React.useState("");
  const [reviewing, setReviewing] = React.useState<Product | null>(null);
  const [note, setNote] = React.useState("");
  const [reviewAction, setReviewAction] = React.useState<"APPROVED" | "REJECTED" | null>(null);

  const counts = {
    PENDING: products.filter((product) => product.moderation === "PENDING" && !product.archived).length,
    APPROVED: products.filter((product) => product.moderation === "APPROVED" && !product.archived).length,
    REJECTED: products.filter((product) => product.moderation === "REJECTED" && !product.archived).length,
    ALL: products.filter((product) => !product.archived).length,
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((product) => !product.archived)
      .filter((product) => (status === "ALL" ? true : product.moderation === status))
      .filter((product) =>
        q
          ? [product.name, product.subtitle, product.brand, product.category, product.materials]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true
      )
      .sort((a, b) => {
        const pendingDelta = Number(b.moderation === "PENDING") - Number(a.moderation === "PENDING");
        return pendingDelta || Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [products, status, query]);

  const openReview = (product: Product) => {
    setReviewing(product);
    setNote(product.moderationNote ?? "");
    setReviewAction(null);
  };

  const decide = (moderation: ModerationStatus) => {
    if (!reviewing) return;
    if (moderation === "REJECTED" && note.trim().length < 8) {
      setReviewAction("REJECTED");
      toast({
        title: "A rejection note is required",
        description: "Tell the seller what needs to change before resubmission (at least 8 characters).",
        tone: "error",
      });
      return;
    }
    const result = moderateProduct(reviewing.id, moderation, note.trim() || undefined);
    if (!result.ok) {
      toast({ title: "Decision not saved", description: result.error, tone: "error" });
      return;
    }
    setReviewing(null);
    toast({
      title: `${reviewing.name} ${moderation === "APPROVED" ? "approved" : moderation === "REJECTED" ? "rejected" : "returned"}`,
      description:
        moderation === "APPROVED"
          ? "The listing is now visible in the storefront catalogue and seller analytics."
          : "The seller sees the moderation note in their catalogue.",
      tone: moderation === "APPROVED" ? "success" : "info",
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Trust & catalogue"
        title="Listing moderation"
        description="Review new listings against materials, care, pricing and seller readiness. The decision immediately changes what customers can buy."
        meta={
          <>
            <Badge variant="warning">{counts.PENDING} pending</Badge>
            <Badge variant="success">{counts.APPROVED} approved</Badge>
            <Badge variant="danger">{counts.REJECTED} rejected</Badge>
          </>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <Eye className="size-4" aria-hidden="true" /> Catalogue view
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Decision SLA", value: "24h", detail: "Demo target for first review", icon: ClipboardCheck },
          { label: "Queue age", value: `${Math.max(1, counts.PENDING)}`, detail: "Listings awaiting a first decision", icon: ShieldAlert },
          { label: "Audit coverage", value: "100%", detail: "Every demo decision is logged locally", icon: ShieldCheck },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-surface-raised p-4">
            <item.icon className="size-4 text-copper" aria-hidden="true" />
            <p className="mt-2 text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{item.label}</p>
            <p className="tabular mt-1 font-display text-2xl leading-none text-ink">{item.value}</p>
            <p className="mt-1 text-[0.625rem] text-ink-faint">{item.detail}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Review queue"
        description="Pending listings are sorted first; the rest are available for inspection."
        action={<Badge variant="outline">{filtered.length} shown</Badge>}
      >
        <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter listings by moderation status">
            {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                aria-pressed={status === item}
                className={cn(
                  "focus-ring rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium transition-colors",
                  status === item ? "border-teal bg-teal text-white" : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                )}
              >
                {item.toLowerCase()} <span className="tabular ml-1 opacity-70">{counts[item]}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search listings…"
              aria-label="Search listings"
              className="h-9 pl-8 text-xs sm:w-64"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <ShieldCheck className="mx-auto size-7 text-success" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">Nothing in this queue</p>
            <p className="mt-1 text-xs text-ink-faint">Choose another moderation state or clear the search.</p>
          </div>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {filtered.map((product) => {
              const seller = sellers.find((item) => item.id === product.sellerId);
              return (
                <li key={product.id} className="flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center">
                  <span className="size-14 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{product.name}</p>
                      <Badge
                        variant={product.moderation === "APPROVED" ? "success" : product.moderation === "PENDING" ? "warning" : "danger"}
                      >
                        {product.moderation.toLowerCase()}
                      </Badge>
                      {product.sellerId === state.sellerId && <Badge variant="outline">Your demo studio</Badge>}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[0.6875rem] text-ink-faint">{product.subtitle}</p>
                    <p className="mt-1 text-[0.625rem] text-ink-faint">
                      {seller?.name ?? product.brand} · {titleCase(product.category)} · submitted {formatDate(product.createdAt)}
                    </p>
                    {product.moderationNote && (
                      <p className="mt-1 rounded border border-line bg-surface px-2 py-1 text-[0.625rem] text-ink-soft">
                        Note: {product.moderationNote}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 lg:w-40">
                    <div>
                      <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Price</p>
                      <p className="tabular mt-0.5 text-xs font-medium text-ink">{formatMoney(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Stock</p>
                      <p className="tabular mt-0.5 text-xs font-medium text-ink">
                        {product.variants.reduce((sum, variant) => sum + variant.stock, product.stock)}
                      </p>
                    </div>
                  </div>
                  <Button variant={product.moderation === "PENDING" ? "primary" : "outline"} size="sm" onClick={() => openReview(product)}>
                    {product.moderation === "PENDING" ? "Review" : "Inspect"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <WorkspaceNote>
        Moderation decisions are written to the demo store and audit trail. Approving a listing makes it visible to
        customers immediately; rejecting requires a note the seller can act on.
      </WorkspaceNote>

      <Dialog open={Boolean(reviewing)} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent className="max-h-[88dvh] max-w-2xl overflow-y-auto">
          {reviewing && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>{reviewing.name}</DialogTitle>
                  <Badge
                    variant={reviewing.moderation === "APPROVED" ? "success" : reviewing.moderation === "PENDING" ? "warning" : "danger"}
                  >
                    {reviewing.moderation.toLowerCase()}
                  </Badge>
                </div>
                <DialogDescription>
                  {sellers.find((seller) => seller.id === reviewing.sellerId)?.name} · {reviewing.subtitle}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                <div className="overflow-hidden rounded-lg border border-line">
                  <div className="aspect-square">
                    <ProductArt art={reviewing.art} palette={reviewing.palette} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[0.5625rem] uppercase tracking-[0.13em] text-ink-faint">Seller description</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{reviewing.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Price</p><p className="tabular mt-0.5 text-ink">{formatMoney(reviewing.price)}</p></div>
                    <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Category</p><p className="mt-0.5 text-ink">{titleCase(reviewing.category)}</p></div>
                    <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Materials</p><p className="mt-0.5 text-ink">{reviewing.materials}</p></div>
                    <div><p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Care</p><p className="mt-0.5 text-ink">{reviewing.care}</p></div>
                  </div>
                </div>
              </div>

              <section aria-labelledby="moderation-checklist">
                <h3 id="moderation-checklist" className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">Review checklist</h3>
                <ul className="mt-2 grid gap-1.5 text-[0.6875rem] text-ink-soft sm:grid-cols-2">
                  {[
                    "Materials and care are specific and plausible.",
                    "Price includes tax and delivery expectations.",
                    "At least one variant has stock and a swatch.",
                    "Seller profile and support email resolve.",
                    "No medical, safety or sustainability overclaim.",
                    "Images are original local art in this demo.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 size-3 shrink-0 text-teal" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="rounded-md border border-line bg-surface p-3">
                <label htmlFor="moderation-note" className="text-[0.6875rem] font-medium text-ink">
                  Moderation note
                </label>
                <Textarea
                  id="moderation-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="mt-1.5"
                  placeholder="Required for rejection; optional for approval."
                  aria-describedby="moderation-note-help"
                />
                <p id="moderation-note-help" className="mt-1 text-[0.625rem] text-ink-faint">
                  Stored with the listing and visible to the seller in their catalogue.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setReviewing(null)}>Close</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setReviewAction("REJECTED");
                    decide("REJECTED");
                  }}
                  aria-pressed={reviewAction === "REJECTED"}
                >
                  <X className="size-4" aria-hidden="true" /> Reject
                </Button>
                <Button
                  onClick={() => {
                    setReviewAction("APPROVED");
                    decide("APPROVED");
                  }}
                  aria-pressed={reviewAction === "APPROVED"}
                >
                  <Check className="size-4" aria-hidden="true" /> Approve listing
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
