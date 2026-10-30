"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, Mail, MapPin, ShieldCheck, Store, Timer, Truck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { Rating } from "@/components/rating";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { useCatalog, useSellers } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

export function SellerView({ slug }: { slug: string }) {
  const sellers = useSellers();
  const products = useCatalog();
  const seller = sellers.find((item) => item.slug === slug);

  if (!seller) {
    return (
      <div className="atlas-container py-20">
        <EmptyState
          icon={Store}
          title="Studio not found"
          description="This storefront may belong to an application that is no longer public. Browse the approved studios instead."
          action={{ label: "All sellers", href: "/sellers" }}
        />
      </div>
    );
  }

  const items = products.filter((product) => product.sellerId === seller.id && product.moderation === "APPROVED");

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <StillLifeArt palette={seller.palette} variant={2} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/15" />
        <div className="atlas-container relative flex min-h-[24rem] flex-col justify-end py-12 text-white lg:min-h-[30rem]">
          <Link href="/sellers" className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-2xs backdrop-blur hover:bg-white/20">
            <ArrowLeft className="size-3" aria-hidden="true" /> All studios
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="copper">{seller.tagline}</Badge>
            <Badge variant="teal" className="border-white/20 bg-white/10 text-white">
              <BadgeCheck className="size-3" aria-hidden="true" /> {seller.status === "APPROVED" ? "Vetted studio" : seller.status}
            </Badge>
          </div>
          <h1 className="mt-4 font-display text-display-sm text-white">{seller.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">{seller.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden="true" /> {seller.location}</span>
            <span className="inline-flex items-center gap-1.5"><Timer className="size-3.5" aria-hidden="true" /> Ships within {seller.fulfilmentSlaHours}h</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="size-3.5" aria-hidden="true" /> Carbon-aware delivery</span>
          </div>
        </div>
      </section>

      <div className="atlas-container py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-xl border border-line bg-surface-raised p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Studio rating</p>
                <Rating value={seller.rating} count={seller.reviewCount} />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Objects", String(items.length)],
                  ["Joined", formatDate(seller.joinedAt)],
                  ["Dispatch SLA", `${seller.fulfilmentSlaHours} hours`],
                  ["Support", seller.supportEmail],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-ink-faint">{label}</dt>
                    <dd className="truncate text-right text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={`mailto:${seller.supportEmail}`}
                className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line text-xs font-medium text-ink transition-colors hover:border-line-strong"
              >
                <Mail className="size-3.5" aria-hidden="true" /> Contact the studio
              </a>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                <ShieldCheck className="size-4 text-teal" aria-hidden="true" />
                Marketplace promises
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-ink-soft">
                <li>Every listing is reviewed for materials and repairability.</li>
                <li>Stock is held by the studio, not a distant warehouse.</li>
                <li>Returns are accepted for 30 days in this demo.</li>
                <li>Commission and payouts are visible in the seller workspace.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-dashed border-line-strong p-5 text-xs leading-relaxed text-ink-faint">
              This storefront is synthetic demo content. The seller name, rating and location do not represent a real business.
            </div>
          </aside>

          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">The catalogue</p>
                <h2 className="mt-2 font-display text-display-xs text-ink">Objects by {seller.name}</h2>
              </div>
              <Link href={`/products?seller=${seller.id}`} className="editorial-link text-xs">
                Filter catalogue
              </Link>
            </div>
            <div className="mt-6">
              <ProductGrid products={items} columns={3} />
            </div>

            <div className="mt-10 rounded-xl border border-line bg-surface-raised p-6">
              <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Inside the studio</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                {seller.description} The studio operates on a small-batch model: listings show the real dispatch window, and
                replenishment happens when the work is ready rather than on a fixed calendar.
              </p>
              <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
                {[
                  ["Materials", "Named, sourced and published on every listing."],
                  ["Repair", "Spare parts and service notes before approval."],
                  ["Fulfilment", `${seller.fulfilmentSlaHours}-hour dispatch promise.`],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
