"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, MapPin, ShieldCheck, Timer } from "lucide-react";
import { Rating } from "@/components/rating";
import { Reveal } from "@/components/reveal";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalog, useSellers } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

export default function SellersPage() {
  const sellers = useSellers();
  const products = useCatalog();
  const approved = sellers.filter((seller) => seller.status === "APPROVED");
  const pending = sellers.filter((seller) => seller.status === "PENDING");

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-12 sm:py-16">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-6 bg-copper" aria-hidden="true" />
            The studios
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <h1 className="font-display text-display-sm text-ink">Independent by design.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
                Seven studios, each responsible for the objects they make and the people who buy them. Atlas vets materials,
                repair support and fulfilment promises before a listing goes live.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {[
                ["6", "approved"],
                ["1", "in review"],
                ["14", "countries served"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl text-ink">{value}</dd>
                  <dd className="mt-0.5 text-2xs uppercase tracking-[0.12em] text-ink-faint">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="atlas-container py-10 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {approved.map((seller, index) => {
            const count = products.filter((product) => product.sellerId === seller.id && product.moderation === "APPROVED").length;
            return (
              <Reveal key={seller.id} delay={index * 50}>
                <Link
                  href={`/sellers/${seller.slug}`}
                  className="focus-ring group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden">
                    <StillLifeArt palette={seller.palette} variant={((index % 4) + 1) as 1 | 2 | 3 | 4} />
                    <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised/90 px-2.5 py-1 text-2xs font-medium text-ink backdrop-blur">
                        <MapPin className="size-3" aria-hidden="true" /> {seller.location}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal/90 px-2 py-1 text-2xs text-white backdrop-blur">
                        <BadgeCheck className="size-3" aria-hidden="true" /> Approved
                      </span>
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block font-display text-xl tracking-[-0.02em] text-ink">{seller.name}</span>
                        <span className="mt-0.5 block text-2xs uppercase tracking-[0.12em] text-copper">{seller.tagline}</span>
                      </span>
                      <Rating value={seller.rating} count={seller.reviewCount} />
                    </span>
                    <span className="mt-3 line-clamp-3 text-xs leading-relaxed text-ink-soft">{seller.description}</span>
                    <span className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-2xs text-ink-faint">
                      <span>{count} objects</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="size-3" aria-hidden="true" /> {seller.fulfilmentSlaHours}h dispatch
                      </span>
                      <ArrowUpRight className="ml-auto size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {pending.map((seller) => (
          <div key={seller.id} className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-copper-soft text-copper">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl tracking-[-0.02em] text-ink">{seller.name}</p>
                    <Badge variant="warning">Application in review</Badge>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-soft">{seller.description}</p>
                  <p className="mt-2 text-2xs text-ink-faint">
                    Applied {formatDate(seller.joinedAt)} · {seller.location} · no live listings
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/sellers">Review in admin</Link>
              </Button>
            </div>
          </div>
        ))}

        <section className="mt-12 overflow-hidden rounded-xl textured-panel p-7 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow text-white/55">Sell on Atlas</p>
              <h2 className="mt-2 font-display text-display-xs text-white">A smaller marketplace, with better tools.</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                The seller workspace covers listings, stock, fulfilment, earnings and store settings. Applications are reviewed
                in the admin moderation queue, with permissions enforced by the API in production.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="copper">
                <Link href="/journey">See the seller journey <ArrowRight className="size-4" aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40">
                <Link href="/seller">Preview workspace</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
