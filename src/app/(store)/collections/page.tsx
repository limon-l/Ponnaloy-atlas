"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Reveal } from "@/components/reveal";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/hooks";
import { collections } from "@/lib/seed";
import { formatMoney } from "@/lib/utils";

export default function CollectionsPage() {
  const products = useCatalog();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-12 sm:py-16">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-6 bg-copper" aria-hidden="true" />
            Four stories, one catalogue
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-display-sm text-ink">
            Collections are arguments, not shelves.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Each collection is a small essay about how objects meet: a room after eight, materials that accept repair, a desk
            that invites concentration, the last unhurried hour.
          </p>
        </div>
      </section>

      <div className="atlas-container space-y-6 py-10 lg:space-y-10 lg:py-16">
        {collections.map((collection, index) => {
          const items = collection.productIds
            .map((id) => products.find((product) => product.id === id))
            .filter((product): product is NonNullable<typeof product> => Boolean(product))
            .slice(0, 4);
          return (
            <Reveal key={collection.slug} delay={index * 60}>
              <article className="grid overflow-hidden rounded-xl border border-line bg-surface-raised lg:grid-cols-[1.1fr_1fr]">
                <div className={`relative min-h-[18rem] lg:min-h-[28rem] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <StillLifeArt palette={collection.palette} variant={((index % 4) + 1) as 1 | 2 | 3 | 4} />
                  <div className="absolute left-5 top-5">
                    <Badge variant="solid">{collection.kicker}</Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-md border border-white/20 bg-ink/35 px-3 py-2 text-white backdrop-blur">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/60">Set of</p>
                    <p className="font-display text-2xl leading-none">{collection.productIds.length}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-copper">{collection.kicker}</p>
                  <h2 className="mt-2 font-display text-display-xs text-ink">{collection.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{collection.description}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-faint">{collection.story}</p>

                  <ul className="mt-5 grid grid-cols-2 gap-2">
                    {items.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          className="focus-ring group flex items-center gap-2.5 rounded-md border border-line p-2 transition-colors hover:border-line-strong"
                        >
                          <span className="size-10 shrink-0 overflow-hidden rounded">
                            <ProductArt art={product.art} palette={product.palette} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-2xs font-medium text-ink">{product.name}</span>
                            <span className="tabular block text-[0.625rem] text-ink-faint">{formatMoney(product.price)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={`/collections/${collection.slug}`}>
                        Enter the collection <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href={`/products?category=${items[0]?.category ?? "home"}`}>Shop nearby</Link>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <section className="border-t border-line bg-surface py-12">
        <div className="atlas-container flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Build your own edit</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Compare up to four objects across collections, then keep the comparison in the tray while you browse.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/compare">
              Open comparison studio <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
