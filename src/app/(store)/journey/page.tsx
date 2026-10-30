"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Compass,
  Package,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { TrendChart } from "@/components/charts";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fulfilmentQueue, revenueSeries, sumRevenue } from "@/lib/analytics";
import { useCatalog } from "@/lib/hooks";
import { sellers as seedSellers } from "@/lib/seed";
import { setRole, useAtlasState } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

const steps = [
  {
    id: "discover",
    index: "01",
    title: "Discover",
    surface: "Living storefront",
    icon: Compass,
    href: "/products",
    role: "CUSTOMER" as Role,
    description:
      "An editorial storefront where category, collection and seller are three valid ways into the same catalogue. Product art is original local SVG, so discovery costs no image requests.",
    detail: "Search with ⌘K, filter by studio, save to a browser-persisted wishlist, and open an object without losing the browse state.",
  },
  {
    id: "compare",
    index: "02",
    title: "Compare",
    surface: "Exploration studio",
    icon: Scale,
    href: "/compare",
    role: "CUSTOMER" as Role,
    description:
      "Up to four objects share one decision surface. Commercial facts stay separate from material and care differences, and differing rows are marked rather than left for the eye to find.",
    detail: "The comparison tray follows you through the catalogue, then expands into a grouped, keyboard-scrollable matrix.",
  },
  {
    id: "buy",
    index: "03",
    title: "Buy",
    surface: "Connected checkout",
    icon: ShoppingBag,
    href: "/checkout",
    role: "CUSTOMER" as Role,
    description:
      "One bag, several sellers. The demo checkout calculates commission-ready line items, applies demo coupons, and creates an order visible to every surface without pretending to take payment.",
    detail: "Card fields are simulated and prefilled. Submission writes a session order, a customer notification, a seller notification and an admin ledger entry.",
  },
  {
    id: "fulfil",
    index: "04",
    title: "Fulfil",
    surface: "Seller workspace",
    icon: Truck,
    href: "/seller/orders",
    role: "SELLER" as Role,
    description:
      "The seller sees only their own orders and stock. Fulfilment advances through confirmed, processing and shipped, with a shipment label and a public timeline for the customer.",
    detail: "Stock edits, product drafts and storefront settings persist in the same browser state that powers the storefront.",
  },
  {
    id: "operate",
    index: "05",
    title: "Operate",
    surface: "Admin command centre",
    icon: ShieldCheck,
    href: "/admin",
    role: "ADMIN" as Role,
    description:
      "Moderation, seller applications, returns and platform-wide order health. Admin actions are explicit and audited in the demo, with a visible separation between marketplace and seller concerns.",
    detail: "Approve listings, resolve returns, adjust commission, and inspect the audit log without leaving the workspace.",
  },
  {
    id: "measure",
    index: "06",
    title: "Measure",
    surface: "Analytics & earnings",
    icon: BarChart3,
    href: "/admin/analytics",
    role: "ADMIN" as Role,
    description:
      "Every chart is derived from the same order records, not a screenshot. Revenue, average order value, seller commission and category mix use the verified domain fields.",
    detail: "Accessible SVG charts include summaries and hidden data tables. No fabricated benchmarks or third-party chart library.",
  },
];

export default function JourneyPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = React.useState(0);
  const step = steps[active]!;
  const series = revenueSeries(state.orders, 14);
  const queue = fulfilmentQueue(state.orders);
  const pendingModeration = products.filter((product) => product.moderation === "PENDING" && !product.archived).length;
  const approvedProducts = products.filter((product) => product.moderation === "APPROVED" && !product.archived).length;
  const seedOrders = state.orders.filter((order) => order.source === "seed").length;
  const sessionOrders = state.orders.filter((order) => order.source === "session");
  const inspector = products.find((product) => product.id === "p-aria") ?? products[0]!;

  const status: Record<string, { done: boolean; label: string }> = {
    discover: { done: state.recentlyViewed.length > 0, label: `${state.recentlyViewed.length} viewed` },
    compare: { done: state.compare.length >= 2, label: `${state.compare.length} selected` },
    buy: { done: sessionOrders.length > 0, label: `${sessionOrders.length} session orders` },
    fulfil: { done: queue.length > 0, label: `${queue.length} in queue` },
    operate: { done: pendingModeration > 0, label: `${pendingModeration} in moderation` },
    measure: { done: true, label: formatMoney(sumRevenue(state.orders)) },
  };

  const goAs = (role: Role, href: string) => {
    setRole(role);
    toast({
      title: `Handing off to ${role.toLowerCase()}`,
      description: "Demo role switch. The storefront, seller and admin surfaces share one state.",
      tone: "info",
    });
    router.push(href);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-ink text-canvas">
        <div className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.12]" aria-hidden="true" />
        <div className="atlas-container relative grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow flex items-center gap-2 text-copper">
              <span className="h-px w-6 bg-copper" aria-hidden="true" />
              Connected commerce journey
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-display-sm text-white">
              One order. Five surfaces. No handoff lost.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-canvas/65 sm:text-base">
              Follow a single object from the storefront to a seller&apos;s fulfilment queue and an admin&apos;s moderation decision.
              Every step below reads the same demo state, so what you do here changes what you see there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="copper" onClick={() => setActive(0)}>
                Start the walkthrough <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button asChild variant="outline" className="border-white/25 text-white hover:border-white/40 hover:bg-white/10">
                <Link href="/lab">Inspect the design system</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[
                [String(approvedProducts), "objects"],
                [String(seedOrders), "seed orders"],
                [String(seedSellers.length), "studios"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-2xl text-white">{value}</dd>
                  <dd className="mt-0.5 text-2xs uppercase tracking-[0.12em] text-canvas/45">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-white/15 bg-white/[0.045] p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-2xs uppercase tracking-[0.14em] text-canvas/50">Your journey so far</p>
                <Badge variant="teal" className="border-white/15 bg-white/10 text-white">Live state</Badge>
              </div>
              <ul className="mt-4 space-y-2.5">
                {[
                  ["Viewed an object", state.recentlyViewed.length > 0, `${state.recentlyViewed.length}`],
                  ["Compared two or more", state.compare.length >= 2, `${state.compare.length}`],
                  ["Added to bag", state.cart.length > 0, `${state.cart.reduce((sum, line) => sum + line.quantity, 0)}`],
                  ["Placed a session order", sessionOrders.length > 0, `${sessionOrders.length}`],
                  ["Seller queue active", queue.length > 0, `${queue.length}`],
                ].map(([label, done, count]) => (
                  <li key={label as string} className="flex items-center gap-3 text-xs">
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border",
                        done ? "border-teal bg-teal text-white" : "border-white/25 text-transparent"
                      )}
                      aria-hidden="true"
                    >
                      <Check className="size-3" />
                    </span>
                    <span className={done ? "flex-1 text-white" : "flex-1 text-canvas/50"}>{label}</span>
                    <span className="tabular font-mono text-2xs text-canvas/45">{count}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-white/10 pt-4">
                <Button asChild variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Link href="/products">Advance the journey</Link>
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 hidden rounded-lg border border-white/15 bg-ink/80 px-3 py-2 text-2xs text-canvas/55 backdrop-blur sm:block">
              Persisted in localStorage
            </div>
          </div>
        </div>
      </section>

      <section className="atlas-container py-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <nav aria-label="Journey stages" className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            <ol className="relative space-y-1">
              <span className="absolute bottom-5 left-[1.125rem] top-5 w-px bg-line" aria-hidden="true" />
              {steps.map((item, index) => {
                const isActive = index === active;
                return (
                  <li key={item.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "focus-ring flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors",
                        isActive ? "bg-teal-soft" : "hover:bg-ink/[0.035]"
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[0.625rem]",
                          isActive ? "border-teal bg-teal text-white" : "border-line-strong bg-surface-raised text-ink-faint"
                        )}
                      >
                        {item.index}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm font-medium", isActive ? "text-teal" : "text-ink")}>{item.title}</span>
                        <span className={cn("block text-2xs", isActive ? "text-ink-soft" : "text-ink-faint")}>{item.surface}</span>
                        <span className="mt-1 flex items-center gap-1.5">
                          <span
                            className={cn("size-1.5 rounded-full", status[item.id]?.done ? "bg-success" : "bg-line-strong")}
                            aria-hidden="true"
                          />
                          <span className={cn("text-[0.625rem]", isActive ? "text-ink-soft" : "text-ink-faint")}>{status[item.id]?.label}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 rounded-lg border border-dashed border-line-strong p-3 text-2xs leading-relaxed text-ink-faint">
              Each stage is interactive. Role switches are demo-only; production permissions live in the API.
            </div>
          </nav>

          <div>
            <article className="overflow-hidden rounded-xl border border-line bg-surface-raised">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3">
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="font-mono text-2xs text-copper">{step.index}</span>
                  <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
                  {step.surface}
                </div>
                <Badge variant="outline">Role · {step.role.toLowerCase()}</Badge>
              </div>

              <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr] lg:p-9">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-teal-soft text-teal">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="font-display text-display-xs text-ink">{step.title}</h2>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">{step.description}</p>
                  <p className="mt-3 text-xs leading-relaxed text-ink-faint">{step.detail}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={step.href}>
                        Open {step.surface} <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                    {step.role !== "CUSTOMER" && (
                      <Button size="sm" variant="outline" onClick={() => goAs(step.role, step.href)}>
                        Hand off to {step.role.toLowerCase()}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActive((current) => (current + 1) % steps.length)}
                    >
                      Next stage
                    </Button>
                  </div>

                  <div className="mt-7 rounded-lg border border-line bg-surface p-4">
                    <p className="text-2xs uppercase tracking-[0.12em] text-ink-faint">What changes in the demo state</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-ink-soft">
                      {[
                        "The same store singleton powers customer, seller and admin views.",
                        "Orders placed at checkout appear in all three surfaces with one timeline.",
                        "Stock and listing edits persist through localStorage and survive reload.",
                        "Resetting from Account → Demo data returns every surface to seed.",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-3 shrink-0 text-teal" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  {step.id === "discover" && (
                    <>
                      <div className="overflow-hidden rounded-lg border border-line">
                        <div className="aspect-[4/5]">
                          <ProductArt art={inspector.art} palette={inspector.palette} title={`${inspector.name} illustration`} />
                        </div>
                        <div className="border-t border-line bg-surface-raised p-3">
                          <p className="text-sm font-medium text-ink">{inspector.name}</p>
                          <p className="text-2xs text-ink-faint">{inspector.subtitle}</p>
                          <p className="tabular mt-1 text-xs text-ink">{formatMoney(inspector.price)}</p>
                        </div>
                      </div>
                      <Link href={`/product/${inspector.slug}`} className="editorial-link text-xs">
                        Open this object <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </>
                  )}

                  {step.id === "compare" && (
                    <div className="rounded-lg border border-line bg-surface p-4">
                      <p className="eyebrow">Tray state</p>
                      <ul className="mt-3 space-y-2">
                        {(state.compare.length > 0 ? state.compare : ["p-aria", "p-halo", "p-journal"]).map((id, index) => {
                          const product = products.find((item) => item.id === id);
                          if (!product) return null;
                          return (
                            <li key={`${id}-${index}`} className="flex items-center gap-2.5">
                              <span className="size-9 overflow-hidden rounded">
                                <ProductArt art={product.art} palette={product.palette} />
                              </span>
                              <span className="min-w-0 flex-1 truncate text-xs text-ink">{product.name}</span>
                              <span className="tabular text-2xs text-ink-faint">{formatMoney(product.price)}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href="/compare">Open comparison</Link>
                      </Button>
                    </div>
                  )}

                  {step.id === "buy" && (
                    <div className="rounded-lg border border-line bg-surface p-4">
                      <p className="eyebrow">Bag & orders</p>
                      <dl className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between"><dt className="text-ink-faint">Lines in bag</dt><dd className="tabular text-ink">{state.cart.length}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-faint">Session orders</dt><dd className="tabular text-ink">{sessionOrders.length}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-faint">Last order</dt><dd className="text-ink">{sessionOrders[0]?.number ?? "—"}</dd></div>
                      </dl>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href="/checkout">Open checkout</Link>
                      </Button>
                    </div>
                  )}

                  {step.id === "fulfil" && (
                    <div className="rounded-lg border border-line bg-surface p-4">
                      <p className="eyebrow">Fulfilment queue</p>
                      <p className="mt-2 font-display text-3xl text-ink">{queue.length}</p>
                      <p className="text-2xs text-ink-faint">Orders awaiting seller action</p>
                      <ul className="mt-3 space-y-1.5">
                        {queue.slice(0, 3).map((order) => (
                          <li key={order.id} className="flex items-center justify-between gap-2 text-2xs">
                            <span className="font-mono text-ink">{order.number}</span>
                            <span className="capitalize text-ink-faint">{order.status.toLowerCase()}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href="/seller/orders">Open seller queue</Link>
                      </Button>
                    </div>
                  )}

                  {step.id === "operate" && (
                    <div className="rounded-lg border border-line bg-surface p-4">
                      <p className="eyebrow">Platform health</p>
                      <dl className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between"><dt className="text-ink-faint">Pending moderation</dt><dd className="tabular text-ink">{pendingModeration}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-faint">Returns open</dt><dd className="tabular text-ink">{state.orders.filter((order) => order.returnRequest?.status === "REQUESTED").length}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-faint">Sellers</dt><dd className="tabular text-ink">7</dd></div>
                      </dl>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href="/admin/moderation">Open moderation</Link>
                      </Button>
                    </div>
                  )}

                  {step.id === "measure" && (
                    <div className="rounded-lg border border-line bg-surface p-4">
                      <p className="eyebrow">Revenue · 14 days</p>
                      <p className="mt-1 font-display text-2xl text-ink">{formatMoney(sumRevenue(state.orders))}</p>
                      <div className="mt-2">
                        <TrendChart data={series} label="Demo revenue, 14 days" height={110} />
                      </div>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href="/admin/analytics">Open analytics</Link>
                      </Button>
                    </div>
                  )}

                  <div className="rounded-lg border border-dashed border-line-strong p-3 text-2xs leading-relaxed text-ink-faint">
                    Live values, not screenshots. Open the surface and complete the action to advance the checklist.
                  </div>
                </div>
              </div>
            </article>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { role: "CUSTOMER" as Role, label: "Customer hand-off", detail: "Browse, compare, buy", href: "/products", icon: Compass },
                { role: "SELLER" as Role, label: "Seller hand-off", detail: "Fulfil, update stock", href: "/seller", icon: Store },
                { role: "ADMIN" as Role, label: "Admin hand-off", detail: "Moderate, resolve, measure", href: "/admin", icon: ClipboardCheck },
              ].map((handoff) => (
                <button
                  key={handoff.role}
                  type="button"
                  onClick={() => goAs(handoff.role, handoff.href)}
                  className="focus-ring group flex items-start gap-3 rounded-lg border border-line bg-surface-raised p-4 text-left transition-colors hover:border-line-strong"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink/[0.05] text-ink-soft group-hover:bg-teal-soft group-hover:text-teal">
                    <handoff.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-ink">{handoff.label}</span>
                    <span className="mt-0.5 block text-2xs text-ink-faint">{handoff.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-12">
        <div className="atlas-container">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="eyebrow">The operating model</p>
              <h2 className="mt-2 font-display text-display-xs text-ink">One domain, explicit boundaries.</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Customer, seller and admin surfaces share order and product records, but not permissions. The demo switches roles
                in the browser; production keeps them in the API.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "API is authoritative", body: "Role and seller ownership checks stay server-side. The UI only previews." },
                { icon: CircleDollarSign, title: "Money in cents", body: "Subtotal, tax, discount, commission and payout use integer minor units." },
                { icon: Package, title: "Order as a record", body: "Lines, timeline, shipment and return request are one contract across surfaces." },
                { icon: BarChart3, title: "Derived analytics", body: "Metrics are computed from orders; nothing is hard-coded to look impressive." },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-line bg-surface-raised p-4">
                  <item.icon className="size-4 text-copper" aria-hidden="true" />
                  <p className="mt-2 text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-faint">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
