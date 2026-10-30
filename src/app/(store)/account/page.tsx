"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Bell,
  Check,
  Database,
  Heart,
  LayoutDashboard,
  Moon,
  Package,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { RoleSwitcher } from "@/components/store/role-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/controls";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useMotionLevel } from "@/components/providers";
import { DATA_MODE } from "@/lib/api";
import { resetDemo, useAtlasState } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/utils";

const DEMO_CUSTOMER = "c-1";

export default function AccountPage() {
  const state = useAtlasState();
  const { toast } = useToast();
  const { level, setLevel, systemReduced } = useMotionLevel();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [emailOptIn, setEmailOptIn] = React.useState(true);
  const [smsOptIn, setSmsOptIn] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const orders = state.orders.filter((order) => order.customerId === DEMO_CUSTOMER);
  const spend = orders.filter((order) => !["CANCELLED", "REFUNDED"].includes(order.status)).reduce((sum, order) => sum + order.total, 0);
  const workspace = state.role === "SELLER" ? "/seller" : state.role === "ADMIN" || state.role === "SUPER_ADMIN" ? "/admin" : null;

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-8 sm:py-12">
          <p className="eyebrow">Your account</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-full bg-teal font-display text-2xl text-white">AO</span>
              <div>
                <h1 className="font-display text-display-xs text-ink">Amara Okafor</h1>
                <p className="mt-1 text-sm text-ink-soft">amara.okafor@example.com · London, UK</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="teal">VIP · demo segment</Badge>
                  <Badge variant="outline">Customer since {formatDate("2024-02-12T00:00:00.000Z")}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RoleSwitcher />
              {workspace && (
                <Button asChild variant="outline" size="sm">
                  <Link href={workspace}><LayoutDashboard className="size-4" aria-hidden="true" /> Workspace</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Orders", value: String(orders.length), detail: "Lifetime", href: "/orders", icon: Package },
            { label: "Saved objects", value: String(state.wishlist.length), detail: "Wishlist", href: "/wishlist", icon: Heart },
            { label: "Lifetime spend", value: formatMoney(spend), detail: "Demo ledger", href: "/orders", icon: Database },
            { label: "Active role", value: state.role.toLowerCase().replace("_", " "), detail: "Switch above", href: "/journey", icon: User },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="focus-ring group rounded-xl border border-line bg-surface-raised p-4 transition-colors hover:border-line-strong">
              <div className="flex items-center justify-between">
                <p className="text-2xs uppercase tracking-[0.12em] text-ink-faint">{item.label}</p>
                <item.icon className="size-4 text-ink-faint" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-2xl capitalize text-ink">{item.value}</p>
              <p className="mt-0.5 flex items-center gap-1 text-2xs text-ink-faint">
                {item.detail} <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <section aria-labelledby="profile-heading" className="rounded-xl border border-line bg-surface-raised p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 id="profile-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Contact details</h2>
                <Badge variant="outline">Demo profile</Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="profile-name">Name</Label>
                  <Input id="profile-name" defaultValue="Amara Okafor" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" type="email" defaultValue="amara.okafor@example.com" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input id="profile-phone" type="tel" defaultValue="+44 20 7946 0958" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="profile-city">City</Label>
                  <Input id="profile-city" defaultValue="London, UK" className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-2xs text-ink-faint">Profile edits are not persisted in this demo.</p>
                <Button size="sm" onClick={() => toast({ title: "Demo profile saved", description: "Nothing was transmitted.", tone: "info" })}>
                  Save profile
                </Button>
              </div>
            </section>

            <section aria-labelledby="preferences-heading" className="rounded-xl border border-line bg-surface-raised p-5 sm:p-6">
              <h2 id="preferences-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Preferences</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <p className="text-sm text-ink">Motion profile</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">
                      System preference {systemReduced ? "requests reduced motion" : "allows full motion"}.
                    </p>
                  </div>
                  <div className="flex gap-1 rounded-md border border-line p-0.5">
                    {(["full", "reduced", "minimal"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLevel(option)}
                        aria-pressed={level === option}
                        className={`focus-ring rounded px-2.5 py-1.5 text-2xs capitalize transition-colors ${level === option ? "bg-teal text-white" : "text-ink-soft hover:bg-ink/[0.05]"}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <p className="text-sm text-ink">Appearance</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">Light is the default; dark respects every token.</p>
                  </div>
                  <div className="flex gap-1 rounded-md border border-line p-0.5">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      aria-pressed={mounted && theme === "light"}
                      className={`focus-ring inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-2xs ${mounted && theme === "light" ? "bg-teal text-white" : "text-ink-soft hover:bg-ink/[0.05]"}`}
                    >
                      <Sun className="size-3.5" aria-hidden="true" /> Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      aria-pressed={mounted && theme === "dark"}
                      className={`focus-ring inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-2xs ${mounted && theme === "dark" ? "bg-teal text-white" : "text-ink-soft hover:bg-ink/[0.05]"}`}
                    >
                      <Moon className="size-3.5" aria-hidden="true" /> Dark
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <p className="text-sm text-ink">Email updates</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">Sunday edit and dispatch notices.</p>
                  </div>
                  <Switch checked={emailOptIn} onCheckedChange={setEmailOptIn} aria-label="Email updates" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-ink">SMS delivery alerts</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">Demo preference only; no messages are sent.</p>
                  </div>
                  <Switch checked={smsOptIn} onCheckedChange={setSmsOptIn} aria-label="SMS delivery alerts" />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section aria-labelledby="address-heading" className="rounded-xl border border-line bg-surface-raised p-5">
              <div className="flex items-center justify-between">
                <h2 id="address-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Default address</h2>
                <MapPinIcon />
              </div>
              <address className="mt-3 not-italic text-sm leading-relaxed text-ink-soft">
                Amara Okafor<br />
                14 Alder Lane<br />
                London SW1A 1AA<br />
                United Kingdom
              </address>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Address editing is demo-only", tone: "info" })}>
                  Edit address
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/checkout">Use at checkout</Link>
                </Button>
              </div>
            </section>

            <section aria-labelledby="data-heading" className="rounded-xl border border-line bg-surface-raised p-5">
              <h2 id="data-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Demo data</h2>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-faint">Data layer</dt>
                  <dd><Badge variant={DATA_MODE === "live" ? "success" : "warning"}>{DATA_MODE}</Badge></dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-faint">Storage key</dt>
                  <dd className="font-mono text-[0.625rem] text-ink-soft">ponnaloy.atlas.state.v1</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-faint">Session orders</dt>
                  <dd className="tabular text-ink">{orders.filter((order) => order.source === "session").length}</dd>
                </div>
              </dl>
              <p className="mt-3 flex items-start gap-2 text-2xs leading-relaxed text-ink-faint">
                <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                All demo mutations persist in localStorage. Clearing site data resets the experience.
              </p>
              {!resetOpen ? (
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setResetOpen(true)}>
                  <RotateCcw className="size-4" aria-hidden="true" /> Reset demo state
                </Button>
              ) : (
                <div className="mt-4 rounded-md border border-danger/25 bg-danger/[0.05] p-3">
                  <p className="text-xs text-ink">Reset orders, cart, wishlist, compare and role to the seeded state?</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        resetDemo();
                        setResetOpen(false);
                        toast({ title: "Demo state reset", tone: "success" });
                      }}
                    >
                      <RefreshCw className="size-4" aria-hidden="true" /> Reset
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="notif-heading" className="rounded-xl border border-line bg-surface p-5">
              <h2 id="notif-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                <Bell className="size-4 text-teal" aria-hidden="true" /> Notifications
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {state.notifications.filter((item) => item.audience === state.role && !item.read).length} unread for the current role.
                Manage them from the header bell.
              </p>
            </section>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl tracking-[-0.02em] text-ink">Recent orders</h2>
            <Link href="/orders" className="editorial-link text-xs">All orders <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {orders.slice(0, 3).map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="focus-ring flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:text-teal">
                  <span className="font-mono text-xs text-ink">{order.number}</span>
                  <span className="text-xs text-ink-faint">{formatDate(order.placedAt)}</span>
                  <span className="capitalize text-xs text-ink-soft">{order.status.toLowerCase().replaceAll("_", " ")}</span>
                  <span className="tabular text-ink">{formatMoney(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function MapPinIcon() {
  return (
    <span className="grid size-8 place-items-center rounded-full bg-teal-soft text-teal" aria-hidden="true">
      <Check className="size-4" />
    </span>
  );
}
