"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/hooks";
import { collections } from "@/lib/seed";
import { Layers } from "lucide-react";

export function CollectionView({ slug }: { slug: string }) {
  const products = useCatalog();
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) {
    return (
      <div className="atlas-container py-20">
        <EmptyState
          icon={Layers}
          title="This collection has moved"
          description="The story may belong to a retired edit. Browse the current four collections instead."
          action={{ label: "All collections", href: "/collections" }}
        />
      </div>
    );
  }

  const items = collection.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const others = collections.filter((item) => item.slug !== collection.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <StillLifeArt palette={collection.palette} variant={3} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
        <div className="atlas-container relative flex min-h-[26rem] flex-col justify-end py-12 text-white lg:min-h-[34rem] lg:py-16">
          <Link href="/collections" className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-2xs text-white/85 backdrop-blur transition-colors hover:bg-white/20">
            <ArrowLeft className="size-3" aria-hidden="true" />
            All collections
          </Link>
          <Badge variant="copper" className="w-fit">{collection.kicker}</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-display-sm text-white">{collection.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{collection.description}</p>
          <p className="mt-6 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-white/50">
            {items.length} objects · curated by Atlas
          </p>
        </div>
      </section>

      <section className="atlas-container py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">The argument</p>
            <p className="mt-3 font-display text-2xl leading-snug tracking-[-0.02em] text-ink">{collection.story}</p>
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-ink-soft">
              <p>
                Every object in this edit is available from the studio that made it. Stock is held locally, dispatch times are
                published on each listing, and the comparison studio records the differences that matter.
              </p>
              <p className="text-xs text-ink-faint">
                Demo collection. Product availability and prices are synthetic.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/compare">Compare the edit</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sellers">Meet the sellers</Link>
              </Button>
            </div>
          </div>
          <div>
            <ProductGrid products={items} columns={3} />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface py-12">
        <div className="atlas-container">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Continue reading</h2>
            <Link href="/collections" className="editorial-link text-xs">
              All four <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/collections/${other.slug}`}
                className="focus-ring group overflow-hidden rounded-lg border border-line bg-surface-raised"
              >
                <span className="block aspect-[16/9] overflow-hidden">
                  <span className="block h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
                    <StillLifeArt palette={other.palette} variant={2} />
                  </span>
                </span>
                <span className="block p-4">
                  <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-copper">{other.kicker}</span>
                  <span className="mt-1 block font-display text-lg tracking-[-0.02em] text-ink">{other.name}</span>
                  <span className="mt-1 block text-2xs text-ink-faint">{other.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
