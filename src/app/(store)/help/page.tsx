"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleHelp, LifeBuoy, Mail, Package, RotateCcw, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { DATA_MODE } from "@/lib/api";

const faqs = [
  {
    id: "orders",
    topic: "Orders",
    items: [
      ["Where is my order?", "Open Orders, choose an order, and read the timeline. A shipment appears once the seller creates a label in their workspace. Demo orders update immediately across customer, seller and admin surfaces."],
      ["Can I change an order after placing it?", "In this demo, an order is actionable only through the seller and admin surfaces. Cancel it from the seller fulfilment queue or the admin ledger. A production build would restrict changes by order status and role."],
      ["Why do seeded orders appear in my account?", "The demo customer is Amara Okafor (c-1). Seeded orders for that customer are included so the account, seller queue and analytics have history to work with."],
    ],
  },
  {
    id: "returns",
    topic: "Returns & repairs",
    items: [
      ["How do demo returns work?", "Open a delivered order and choose Request return. The request appears in the admin returns queue, where an administrator can approve or reject it. Approval marks the order refunded in the demo ledger."],
      ["What is the repair promise?", "Every approved listing is expected to publish materials, care notes and a repair contact. Atlas checks those fields before moderation approval in the verified backend schema."],
      ["Do refunds process real money?", "No. No payment provider is connected. All financial values are synthetic and held in browser storage."],
    ],
  },
  {
    id: "shipping",
    topic: "Delivery",
    items: [
      ["What are the delivery options?", "Standard delivery is $12 and complimentary above $150. Express delivery is $24. Both are selectable at checkout and reflected in the order summary."],
      ["Which countries are supported?", "The checkout form lists nine demo destinations. In production this would come from the seller's fulfilment configuration and carrier coverage."],
      ["Why does the arrival date use October 2026?", "The demo clock is fixed at 29 October 2026 so seeded analytics, orders and notifications remain coherent. Shipping estimates derive from that clock."],
    ],
  },
  {
    id: "demo-data",
    topic: "Demo data",
    items: [
      ["What is synthetic?", "The catalogue, sellers, orders, reviews, inventory, analytics, notifications and campaign metrics. Product illustrations are original local SVGs."],
      ["What is real?", "The interface behaviour, accessibility patterns, state transitions, data contracts and code quality. The store, cart, role switching and CRUD actions genuinely change this browser's demo state."],
      ["How does live mode work?", "Set NEXT_PUBLIC_ATLAS_DATA_MODE=live and NEXT_PUBLIC_API_URL to point at the verified Fastify API. The adapter in src/lib/api.ts maps to /api/products, /api/auth/sign-in and /api/orders. MongoDB and Redis were unavailable in this environment, so live mode was not exercised."],
    ],
  },
];

export default function HelpPage() {
  const { toast } = useToast();
  const [sent, setSent] = React.useState(false);
  const [anchor, setAnchor] = React.useState("orders");

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-10 sm:py-14">
          <p className="eyebrow">Help & policies</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <h1 className="font-display text-display-xs text-ink">Answers, without a maze.</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
                Orders, returns, delivery, repairs and the boundaries of this demonstration. If something is simulated, it says
                so plainly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Updated 29 Oct 2026</Badge>
              <Badge variant="warning">{DATA_MODE === "demo" ? "Demo data layer" : "Live API mode"}</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { icon: Package, title: "Orders", body: "Track, reorder or open a return.", href: "/orders" },
              { icon: Truck, title: "Delivery", body: "Timings, costs and destinations.", topic: "shipping" },
              { icon: RotateCcw, title: "Returns", body: "30-day demo policy and status.", topic: "returns" },
              { icon: Wrench, title: "Repairs", body: "Materials, parts and service notes.", topic: "returns" },
            ] satisfies Array<{
              icon: React.ComponentType<{ className?: string; "aria-hidden"?: React.AriaAttributes["aria-hidden"] }>;
              title: string;
              body: string;
              href?: string;
              topic?: string;
            }>
          ).map((item) => {
            const content = (
              <>
                <item.icon className="size-4 text-copper" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-2xs leading-relaxed text-ink-faint">{item.body}</p>
              </>
            );
            const className =
              "focus-ring group rounded-xl border border-line bg-surface-raised p-4 text-left transition-colors hover:border-line-strong";
            return item.href ? (
              <Link key={item.title} href={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <button
                key={item.title}
                type="button"
                className={className}
                onClick={() => {
                  setAnchor(item.topic ?? "orders");
                  document.getElementById("help-topics")?.scrollIntoView({ block: "start" });
                }}
              >
                {content}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div id="help-topics" className="scroll-mt-24">
            <div className="flex flex-wrap gap-2">
              {["orders", "returns", "shipping", "demo-data"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAnchor(id)}
                  aria-pressed={anchor === id}
                  className={`focus-ring rounded-full border px-3 py-1.5 text-2xs capitalize transition-colors ${
                    anchor === id ? "border-teal bg-teal-soft text-teal" : "border-line text-ink-soft hover:border-line-strong"
                  }`}
                >
                  {id.replace("-", " ")}
                </button>
              ))}
            </div>

            <Accordion type="single" collapsible defaultValue={`${anchor}-0`} key={anchor} className="mt-5">
              {faqs
                .find((group) => group.id === anchor)!
                .items.map(([question, answer], index) => (
                  <AccordionItem key={question} value={`${anchor}-${index}`}>
                    <AccordionTrigger>{question}</AccordionTrigger>
                    <AccordionContent>{answer}</AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>

            <section id="accessibility" className="mt-12 scroll-mt-24 rounded-xl border border-line bg-surface-raised p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal" aria-hidden="true" />
                <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Accessibility</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Atlas targets WCAG 2.2 AA. The interface uses semantic landmarks, a skip link, visible focus rings, native form
                controls where possible, 44px form fields, keyboard-operable dialogs and menus, and
                three motion profiles that honour prefers-reduced-motion.
              </p>
              <ul className="mt-4 grid gap-2 text-xs text-ink-soft sm:grid-cols-2">
                {[
                  "Keyboard search with ⌘K / Ctrl+K and arrow-key results",
                  "Focus trapping and Escape handling from Radix primitives",
                  "Status changes announced through polite live regions",
                  "Charts include accessible summaries and hidden data tables",
                  "Reduced and minimal motion profiles, not just a media query",
                  "Colour expressed through semantic tokens in light and dark",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-2xs leading-relaxed text-ink-faint">
                Known limitation: automated axe checks cover the main routes, not every state. A formal audit with assistive
                technology users has not been performed, so this is a target rather than a certification.
              </p>
            </section>

            <section id="privacy" className="mt-6 scroll-mt-24 rounded-xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-copper" aria-hidden="true" />
                <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">Privacy & storage</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                The demo stores state under localStorage key <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs">ponnaloy.atlas.state.v1</code>.
                No analytics, cookies or network requests carry this data. In a production deployment, authentication tokens should
                move to httpOnly cookies at the API edge rather than browser storage.
              </p>
              <p className="mt-2 text-2xs text-ink-faint">
                The verified baseline currently keeps a bearer token in localStorage; Atlas documents that as a security risk rather
                than reproducing it.
              </p>
            </section>
            </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-surface-raised p-5">
              <div className="flex items-center gap-2">
                <LifeBuoy className="size-4 text-teal" aria-hidden="true" />
                <h2 className="font-display text-xl tracking-[-0.02em] text-ink">Contact the desk</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Demo form. Nothing is transmitted, but the validation and success states are real.
              </p>
              <form
                className="mt-4 space-y-3"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  setSent(true);
                  toast({ title: "Demo message received", description: "No email was sent.", tone: "info" });
                }}
              >
                <Field label="Name" htmlFor="support-name">
                  <Input id="support-name" name="name" autoComplete="name" required />
                </Field>
                <Field label="Email" htmlFor="support-email">
                  <Input id="support-email" name="email" type="email" autoComplete="email" required />
                </Field>
                <Field label="Message" htmlFor="support-message">
                  <Textarea id="support-message" name="message" rows={4} required />
                </Field>
                <Button type="submit" className="w-full" disabled={sent}>
                  {sent ? "Message logged" : "Send demo message"}
                </Button>
                {sent && <p className="text-2xs text-success">This browser has acknowledged the demo message. No network request was made.</p>}
              </form>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                <Mail className="size-4 text-copper" aria-hidden="true" /> Direct links
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                {(
                  [
                    ["Orders & tracking", "/orders"],
                    ["Wishlist", "/wishlist"],
                    ["Connected journey", "/journey"],
                    ["Design & motion lab", "/lab"],
                    ["Admin moderation", "/admin/moderation"],
                  ] satisfies Array<[string, string]>
                ).map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center justify-between gap-3 text-ink-soft hover:text-teal">
                      {label} <ArrowRight className="size-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-dashed border-line-strong p-5">
              <p className="flex items-center gap-2 text-xs font-medium text-ink">
                <CircleHelp className="size-4 text-ink-faint" aria-hidden="true" /> Still stuck?
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
                Reset the demo from Account → Demo data. This returns roles, orders and cart to the seeded state.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href="/account">Open account</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
