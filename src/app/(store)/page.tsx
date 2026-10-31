"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Leaf,
  PackageCheck,
  Quote,
  RotateCcw,
  Sparkles,
  Wrench,
} from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { ProductGrid } from "@/components/product-grid";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/rating";
import { useCatalog, useSellers } from "@/lib/hooks";
import { categories, collections } from "@/lib/seed";
import { formatMoney } from "@/lib/utils";

const values = [
  { icon: Wrench, title: "Repair by default", body: "Spare parts and service notes for every object we carry." },
  { icon: Leaf, title: "Material honesty", body: "FSC oak, undyed wool, vegetable-tanned leather. Named, not implied." },
  { icon: PackageCheck, title: "Small-batch dispatch", body: "Stock held by the studio that made it. No distant warehouse." },
  { icon: RotateCcw, title: "30-day returns", body: "Demo policy shown end-to-end, including the seller view." },
];

const journal = [
  {
    kicker: "Materials · 6 min",
    title: "Why oiled oak gets better, and lacquer does not",
    excerpt: "A short field guide to finishes that accept repair instead of hiding it.",
    variant: 2 as const,
    palette: collections[1]!.palette,
  },
  {
    kicker: "Ritual · 4 min",
    title: "The last hour: a sequence, not a shopping list",
    excerpt: "Lower the light, start the coffee, put the phone in another room.",
    variant: 4 as const,
    palette: collections[3]!.palette,
  },
  {
    kicker: "Studio visit · 8 min",
    title: "Inside a two-bench acoustics studio in Copenhagen",
    excerpt: "Kestrel Audio tunes every pair by ear before it leaves the room.",
    variant: 1 as const,
    palette: collections[0]!.palette,
  },
];

export default function HomePage() {
  const products = useCatalog();
  const sellers = useSellers();
  const approved = products.filter((product) => product.moderation === "APPROVED");
  const featured = approved.filter((product) => product.featured).slice(0, 8);
  const heroProduct = approved.find((product) => product.slug === "aria-over-ear-headphones") ?? approved[0]!;
  const quietHours = collections[0]!;
  const sellerSpotlight = sellers.filter((seller) => seller.status === "APPROVED").slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-line aura-mesh">
        <div className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.28] dark:opacity-[0.18]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-32 top-0 size-[34rem] rounded-full bg-[radial-gradient(circle,hsl(var(--teal)/0.16),transparent_68%)] blur-3xl"
          aria-hidden="true"
        />
        <div className="atlas-container relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <p className="eyebrow flex animate-fade-up items-center gap-2">
              <span className="h-px w-8 bg-copper" aria-hidden="true" />
              Autumn edit · MMXXVI
            </p>
            <h1 className="mt-6 animate-fade-up text-balance font-display text-display-md text-ink [animation-delay:60ms]">
              Objects for a
              <span className="display-accent text-teal"> considered </span>
              life.
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-ink-soft [animation-delay:140ms] sm:text-lg">
              A marketplace for independent studios, built as five connected surfaces: an editorial storefront, a
              comparison studio, a seller workspace, an operations centre and a motion lab.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:200ms]">
              <Button asChild size="lg">
                <Link href="/products">
                  Shop the edit
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/collections">Explore collections</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg animate-fade-up grid-cols-3 gap-4 border-t border-line pt-6 [animation-delay:260ms]">
              {[
                [String(approved.length), "objects"],
                [String(sellers.length), "studios"],
                ["5", "connected surfaces"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-2xl text-ink">{value}</dd>
                  <dd className="mt-0.5 text-2xs uppercase tracking-[0.12em] text-ink-faint">{label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-2xs leading-relaxed text-ink-faint">
              Demo marketplace · synthetic catalogue, orders and analytics. No payment is processed.
            </p>
          </div>

          <Reveal className="relative" distance={24}>
            <div className="relative ml-auto w-full max-w-[30rem]">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_60%_30%,hsl(var(--copper-bright)/0.18),transparent_65%)] blur-2xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-lift">
                <div className="aspect-[4/5]">
                  <StillLifeArt palette={quietHours.palette} variant={1} />
                </div>
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden="true" />
              </div>

              <div className="absolute -left-4 top-8 hidden w-40 animate-fade-up rounded-lg border border-line bg-surface-raised/95 p-3 shadow-whisper backdrop-blur [animation-delay:320ms] sm:block lg:-left-12">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-copper">Collection 01</p>
                <p className="mt-1 font-display text-lg leading-tight tracking-[-0.02em]">The Quiet Hours</p>
                <Link href={`/collections/${quietHours.slug}`} className="mt-2 inline-flex items-center gap-1 text-2xs text-teal hover:underline">
                  Enter the story <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>

              <Link
                href={`/product/${heroProduct.slug}`}
                className="focus-ring group absolute -bottom-5 -left-2 flex w-[15rem] animate-fade-up items-center gap-3 rounded-xl border border-line bg-surface-raised/95 p-2.5 shadow-lift backdrop-blur transition-transform duration-300 [animation-delay:380ms] hover:-translate-y-0.5 sm:-left-8"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-lg">
                  <ProductArt art={heroProduct.art} palette={heroProduct.palette} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-2xs uppercase tracking-[0.12em] text-ink-faint">{heroProduct.brand}</span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-ink">{heroProduct.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">{formatMoney(heroProduct.price)}</span>
                </span>
              </Link>

              <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rotate-90 font-mono text-[0.5625rem] uppercase tracking-[0.28em] text-ink-faint lg:block">
                Editorial commerce · Est. 2026
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Values                                                        */}
      {/* ------------------------------------------------------------ */}
      <section aria-label="Our standards" className="border-b border-line bg-surface">
        <div className="atlas-container grid gap-px py-0 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`flex gap-3.5 py-6 lg:px-6 ${index > 0 ? "border-t border-line lg:border-l lg:border-t-0" : ""} ${index === 1 ? "sm:border-l sm:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-copper-soft text-copper">
                <value.icon className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink">{value.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{value.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Categories                                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="atlas-container py-16 lg:py-24" aria-labelledby="categories-heading">
        <SectionHeading
          id="categories-heading"
          eyebrow="The index"
          title="Six ways into the catalogue"
          description="Start with a material, a room, or the hour of the day. The catalogue is small on purpose."
          action={{ label: `All ${approved.length} objects`, href: "/products" }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => {
            const count = approved.filter((product) => product.category === category.slug).length;
            return (
              <Reveal key={category.slug} delay={index * 45}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="focus-ring group relative block overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-whisper"
                >
                  <span className="block aspect-square overflow-hidden">
                    <span className="block h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
                      <ProductArt
                        art={category.art}
                        palette={category.palette}
                        title={`${category.name} category illustration`}
                      />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-deep/85 via-deep/25 to-transparent p-3 pt-10">
                    <span>
                      <span className="block text-sm font-medium text-deep-foreground">{category.name}</span>
                      <span className="block text-2xs text-deep-foreground/70">{count} objects</span>
                    </span>
                    <ArrowUpRight className="size-3.5 text-deep-foreground/85 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Featured edit                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="border-y border-line bg-surface py-16 lg:py-24" aria-labelledby="featured-heading">
        <div className="atlas-container">
          <SectionHeading
            id="featured-heading"
            eyebrow="The current edit"
            title="Chosen for the long run"
            description="Eight objects the studio keeps returning to: quiet forms, repairable parts, materials that age honestly."
            action={{ label: "Browse everything", href: "/products" }}
          />
          <div className="mt-8">
            <ProductGrid products={featured} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Collection story                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="atlas-container py-16 lg:py-24">
        <div className="grid overflow-hidden rounded-xl border border-line bg-surface-raised lg:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[34rem]">
            <StillLifeArt palette={quietHours.palette} variant={3} />
            <div className="absolute left-5 top-5">
              <Badge variant="solid">Collection 01</Badge>
            </div>
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="eyebrow text-copper">A room after eight</p>
            <h2 className="mt-3 font-display text-display-xs text-ink">{quietHours.name}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">{quietHours.story}</p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {quietHours.productIds.slice(0, 3).map((id) => {
                const product = products.find((item) => item.id === id);
                if (!product) return null;
                return (
                  <li key={id}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="focus-ring group flex items-center gap-3 py-3"
                    >
                      <span className="size-11 shrink-0 overflow-hidden rounded-md">
                        <ProductArt art={product.art} palette={product.palette} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{product.name}</span>
                        <span className="block text-2xs text-ink-faint">{product.subtitle}</span>
                      </span>
                      <span className="tabular text-xs text-ink-soft">{formatMoney(product.price)}</span>
                      <ArrowRight className="size-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/collections/${quietHours.slug}`}>
                  View the collection <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/collections">All collections</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Editorial quote                                               */}
      {/* ------------------------------------------------------------ */}
      <section className="atlas-container pb-16 lg:pb-24">
        <Reveal className="relative overflow-hidden rounded-2xl textured-panel paper-grain px-7 py-14 sm:px-12 lg:px-20 lg:py-20">
          <Quote className="size-8 text-copper-bright" aria-hidden="true" />
          <blockquote className="mt-6 max-w-3xl text-balance font-display text-3xl leading-[1.12] tracking-[-0.03em] text-deep-foreground sm:text-4xl lg:text-5xl">
            “The most sustainable object is the one you keep. Everything else is logistics.”
          </blockquote>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-deep-foreground/15 pt-6">
            <div>
              <p className="text-sm font-medium text-deep-foreground">Ines Marchetti</p>
              <p className="mt-0.5 text-xs text-deep-foreground/60">Founder, Northwind Atelier · Aarhus</p>
            </div>
            <div className="flex flex-wrap gap-2 text-2xs text-deep-foreground/70">
              {["Oiled oak", "Undyed wool", "Stoneware", "Brass"].map((material) => (
                <span key={material} className="rounded-full border border-deep-foreground/20 px-3 py-1">
                  {material}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Sellers                                                       */}
      {/* ------------------------------------------------------------ */}
      <section className="border-y border-line bg-surface py-16 lg:py-24">
        <div className="atlas-container">
          <SectionHeading
            eyebrow="The studios"
            title="Small rooms, long guarantees"
            description={`Each seller is vetted for materials, repair support and fulfilment honesty. ${sellerSpotlight.length} approved studios are featured below; every studio is listed in the directory.`}
            action={{ label: "Meet all sellers", href: "/sellers" }}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {sellerSpotlight.map((seller, index) => (
              <Reveal key={seller.id} delay={index * 70}>
                <Link
                  href={`/sellers/${seller.slug}`}
                  className="focus-ring group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-whisper"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden">
                    <StillLifeArt palette={seller.palette} variant={(index + 1) as 1 | 2 | 3} />
                    <span className="absolute left-3 top-3 rounded-full bg-surface-raised/90 px-2.5 py-1 text-2xs font-medium text-ink backdrop-blur">
                      {seller.location}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-4">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-2xs uppercase tracking-[0.12em] text-ink-faint">{seller.tagline}</span>
                      <Rating value={seller.rating} count={seller.reviewCount} />
                    </span>
                    <span className="mt-2 font-display text-xl tracking-[-0.02em] text-ink">{seller.name}</span>
                    <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{seller.description}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-2xs font-medium text-teal">
                      Visit the studio
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Journey + lab                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="atlas-container py-16 lg:py-24">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="relative overflow-hidden rounded-2xl border border-line bg-deep p-7 text-deep-foreground sm:p-10">
            <div className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.12]" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,hsl(var(--teal)/0.35),transparent_70%)] blur-2xl" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow text-copper-bright">One marketplace, five surfaces</p>
              <h2 className="mt-3 max-w-md text-balance font-display text-display-xs text-deep-foreground">
                Follow one order from discovery to payout.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-deep-foreground/65">
                The journey map connects the storefront, comparison studio, seller fulfilment, admin operations and the
                design lab. Every step is interactive and reflects the same demo state.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Discover", "Compare", "Buy", "Fulfil", "Operate", "Measure"].map((step, index) => (
                  <span
                    key={step}
                    className="inline-flex items-center gap-2 rounded-full border border-deep-foreground/15 px-3 py-1.5 text-2xs text-deep-foreground/70"
                  >
                    <span className="font-mono text-copper-bright">0{index + 1}</span>
                    {step}
                  </span>
                ))}
              </div>
              <Button asChild variant="copper" className="mt-8">
                <Link href="/journey">
                  Open the connected journey <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={80} className="flex flex-col justify-between rounded-2xl border border-line bg-copper-soft p-7 sm:p-10">
            <div>
              <span className="grid size-10 place-items-center rounded-full bg-surface-raised/70 text-copper shadow-whisper">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-balance font-display text-2xl tracking-[-0.02em] text-ink">Design & motion lab</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Inspect the tokens, type scale, chart primitives and three motion profiles — including reduced and minimal.
              </p>
            </div>
            <Link href="/lab" className="editorial-link mt-8">
              Inspect the system
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Journal                                                       */}
      {/* ------------------------------------------------------------ */}
      <section className="border-t border-line bg-surface py-16 lg:py-24">
        <div className="atlas-container">
          <SectionHeading
            eyebrow="Field notes"
            title="Reading, not marketing"
            description="Short essays on materials, maintenance and the rooms objects end up in."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {journal.map((entry, index) => (
              <Reveal key={entry.title} delay={index * 60}>
                <article className="group h-full overflow-hidden rounded-xl border border-line bg-surface-raised transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-whisper">
                  <div className="aspect-[16/10] overflow-hidden">
                    <div className="h-full w-full transition-transform duration-slow ease-atlas group-hover:scale-[1.035]">
                      <StillLifeArt palette={entry.palette} variant={entry.variant} />
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-copper">{entry.kicker}</p>
                    <h3 className="mt-2 text-balance font-display text-xl leading-snug tracking-[-0.02em] text-ink">{entry.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink-soft">{entry.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-2xs font-medium text-ink-faint">
                      Demo article <ArrowRight className="size-3" aria-hidden="true" />
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-container py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-line-strong p-5 text-xs text-ink-faint">
          <p className="inline-flex items-center gap-2">
            <CircleDollarSign className="size-4 text-copper" aria-hidden="true" />
            All prices in USD. Checkout is a demonstration and never charges a card.
          </p>
          <Link href="/help#demo-data" className="text-teal hover:underline">
            Read the demo data disclosure
          </Link>
        </div>
      </section>
    </>
  );
}
