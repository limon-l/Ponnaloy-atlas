"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Gauge,
  Layers,
  MousePointerClick,
  Play,
  Sparkles,
  Type,
  Waves,
} from "lucide-react";
import { BarList, Sparkline, StatusDonut, TrendChart } from "@/components/charts";
import { useMotionLevel } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Switch } from "@/components/ui/controls";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { revenueSeries, statusBreakdown, sumRevenue } from "@/lib/analytics";
import { useAtlasState } from "@/lib/store";
import { cn, formatMoney } from "@/lib/utils";

const colourTokens = [
  { token: "--canvas", label: "Canvas", role: "Page foundation", contrast: "Base for ink" },
  { token: "--surface", label: "Surface", role: "Section wash", contrast: "Base for ink" },
  { token: "--surface-raised", label: "Raised", role: "Panels and cards", contrast: "Base for ink" },
  { token: "--ink", label: "Ink", role: "Primary text", contrast: "Text on canvas" },
  { token: "--ink-soft", label: "Ink soft", role: "Body copy", contrast: "Text on canvas" },
  { token: "--ink-faint", label: "Ink faint", role: "Metadata", contrast: "Text on canvas" },
  { token: "--line", label: "Line", role: "Hairline rules", contrast: "Non-text only" },
  { token: "--teal", label: "Teal", role: "Signature action", contrast: "White or canvas text" },
  { token: "--teal-deep", label: "Teal deep", role: "Hover and footer", contrast: "White text" },
  { token: "--teal-soft", label: "Teal soft", role: "Quiet emphasis", contrast: "Teal text" },
  { token: "--copper", label: "Copper", role: "Editorial accent", contrast: "Large or white text" },
  { token: "--copper-soft", label: "Copper soft", role: "Accent wash", contrast: "Copper text" },
  { token: "--success", label: "Success", role: "Confirmed states", contrast: "Success text/icons" },
  { token: "--warning", label: "Warning", role: "Attention states", contrast: "Warning text/icons" },
  { token: "--danger", label: "Danger", role: "Destructive states", contrast: "Danger text/icons" },
  { token: "--info", label: "Info", role: "Neutral notices", contrast: "Info text/icons" },
];

const typeScale = [
  { name: "Display", className: "font-display text-display-xs", detail: "clamp(2rem → 3rem) · Fraunces" },
  { name: "Title", className: "font-display text-3xl tracking-[-0.03em]", detail: "1.875rem · editorial voice" },
  { name: "Subtitle", className: "font-display text-xl tracking-[-0.02em]", detail: "1.25rem · panel headings" },
  { name: "Body", className: "text-base leading-relaxed text-ink-soft", detail: "1rem / 1.7 · Manrope" },
  { name: "Small", className: "text-xs leading-relaxed text-ink-soft", detail: "0.75rem · supporting copy" },
  { name: "Mono label", className: "font-mono text-2xs uppercase tracking-[0.16em] text-ink-faint", detail: "0.6875rem · metadata" },
];

const motionProfiles = [
  {
    id: "full" as const,
    label: "Full",
    description: "Editorial entrances, staggered reveals and quiet hover lift. The default for pointer devices.",
  },
  {
    id: "reduced" as const,
    label: "Reduced",
    description: "Shortens durations, removes large travel and follows the operating-system preference.",
  },
  {
    id: "minimal" as const,
    label: "Minimal",
    description: "Removes animation and transition entirely. Every state change remains legible.",
  },
];

const componentRows = [
  ["Buttons", "Seven variants, four sizes, loading and busy states", "Button"],
  ["Dialogs", "Radix focus trap, escape to close, labelled titles", "Dialog / Sheet"],
  ["Menus", "Keyboard navigation with visible focus return", "Dropdown / Popover"],
  ["Tabs & accordion", "Arrow-key navigation, single open panel by choice", "Tabs / Accordion"],
  ["Forms", "Visible labels, described errors, native inputs", "Input / Field / Select"],
  ["Feedback", "Live-region toasts, inline status, skeleton loading", "Toast / Alert"],
  ["Charts", "SVG summaries, hidden data tables, no chart library", "Trend / Bar / Donut"],
  ["Commerce", "Cart, compare, wishlist, checkout and returns", "Store surfaces"],
];

function TokenSwatch({
  token,
  label,
  role,
  contrast,
  onCopy,
}: {
  token: string;
  label: string;
  role: string;
  contrast: string;
  onCopy: (token: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(token)}
      className="focus-ring group overflow-hidden rounded-lg border border-line bg-surface-raised text-left transition-[border-color,transform] duration-fast hover:-translate-y-0.5 hover:border-line-strong"
      title={`Copy ${token}`}
    >
      <span
        className="block h-16 w-full border-b border-line"
        style={{ background: `hsl(var(${token}))` }}
        aria-hidden="true"
      />
      <span className="block p-2.5">
        <span className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink">{label}</span>
          <Copy className="size-3 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
        </span>
        <span className="mt-0.5 block font-mono text-[0.5625rem] text-ink-faint">{token}</span>
        <span className="mt-1.5 block text-[0.625rem] leading-snug text-ink-soft">{role}</span>
        <span className="mt-0.5 block text-[0.5625rem] text-ink-faint">{contrast}</span>
      </span>
    </button>
  );
}

export function LabView() {
  const state = useAtlasState();
  const { level, setLevel, systemReduced } = useMotionLevel();
  const { toast } = useToast();
  const [replay, setReplay] = React.useState(0);
  const [reminder, setReminder] = React.useState(true);
  const [quietMode, setQuietMode] = React.useState(false);

  const series = React.useMemo(() => revenueSeries(state.orders, 14), [state.orders]);
  const statuses = React.useMemo(() => statusBreakdown(state.orders), [state.orders]);
  const revenue = sumRevenue(state.orders);
  const sparkValues = series.map((point) => point.value);

  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({ title: `${token} copied`, description: "Paste the token into a component instead of a raw colour.", tone: "success" });
    } catch {
      toast({ title: "Clipboard unavailable", description: `Token: ${token}`, tone: "info" });
    }
  };

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-line bg-ink text-canvas">
        <div className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.13]" aria-hidden="true" />
        <div className="atlas-container relative grid gap-10 py-12 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:py-16">
          <div>
            <p className="eyebrow flex items-center gap-2 text-copper-bright">
              <span className="h-px w-6 bg-copper-bright" aria-hidden="true" />
              Design &amp; motion lab
            </p>
            <h1 className="mt-4 min-h-[1.96em] max-w-3xl font-display text-display-sm text-white">
              One system.
              <span className="display-accent text-copper-bright"> Five surfaces.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-canvas/65 sm:text-base">
              Atlas is built from semantic tokens, editorial type and a small set of accessible primitives. This page is
              the living reference: every specimen below is rendered by the same components used in the storefront, seller
              workspace and admin command centre.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="copper">
                <Link href="/journey">
                  See the connected journey <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 text-white hover:border-white/40 hover:bg-white/10">
                <Link href="/products">Browse the catalogue</Link>
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/10 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ["16", "semantic colours"],
              ["3", "motion profiles"],
              ["0", "chart libraries"],
              ["AA", "contrast target"],
            ].map(([value, label]) => (
              <div key={label} className="bg-ink/80 px-4 py-4">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl text-white">{value}</dd>
                <dd className="mt-0.5 text-[0.5625rem] uppercase tracking-[0.12em] text-canvas/45">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <nav aria-label="Lab sections" className="sticky top-[var(--header-height)] z-30 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="atlas-container no-scrollbar flex gap-1 overflow-x-auto py-2">
          {[
            ["colour", "Colour"],
            ["type", "Type"],
            ["components", "Components"],
            ["motion", "Motion"],
            ["charts", "Charts"],
            ["quality", "Quality"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="focus-ring shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="atlas-container space-y-16 py-12 lg:space-y-20 lg:py-16">
        <section id="colour" aria-labelledby="colour-heading">
          <LabHeading
            id="colour"
            index="01"
            eyebrow="Semantic colour"
            title="A warm foundation, one signature"
            description="Components never reference raw hex values. Light and dark themes remap the same semantic tokens, so contrast decisions live in one place. Select a swatch to copy its token name."
            icon={Layers}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {colourTokens.map((token) => (
              <TokenSwatch key={token.token} {...token} onCopy={copyToken} />
            ))}
          </div>
          <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-line-strong bg-surface/60 p-4 text-xs leading-relaxed text-ink-soft sm:grid-cols-2">
            <p>
              <strong className="font-medium text-ink">Measured, not asserted.</strong> Contrast pairings listed above are
              design targets. The quality report records automated axe results and computed contrast checks; no pairing is
              claimed as passing until that run exists.
            </p>
            <p>
              <strong className="font-medium text-ink">Dark mode is a remap.</strong> Teal becomes a lighter tint, copper
              warms, and surfaces deepen. The theme toggle in the account menu switches the same token set.
            </p>
          </div>
        </section>

        <section id="type" aria-labelledby="type-heading">
          <LabHeading
            id="type"
            index="02"
            eyebrow="Typography"
            title="Editorial voice, enterprise clarity"
            description="Fraunces carries the editorial register; Manrope handles interface copy; IBM Plex Mono marks metadata, prices and audit records. Display sizes use clamp() so they scale without breakpoint jumps."
            icon={Type}
          />
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-0 divide-y divide-line rounded-xl border border-line bg-surface-raised">
              {typeScale.map((row) => (
                <div key={row.name} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-4 sm:px-5">
                  <p className={cn("min-w-0 text-ink", row.className)}>
                    {row.name === "Display" ? "Considered objects." : row.name}
                  </p>
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">{row.detail}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-surface-raised p-5">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-copper">Product specimen</p>
                <p className="mt-3 text-2xs uppercase tracking-[0.12em] text-ink-faint">Kestrel Audio</p>
                <h3 className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink">Aria Over-Ear Headphones</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Closed-back headphones tuned for long listening. Replaceable pads, a serviceable cable and a ten-year
                  parts promise.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="tabular font-display text-2xl text-ink">{formatMoney(38900)}</span>
                  <span className="text-xs text-ink-faint line-through">{formatMoney(44900)}</span>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-ink p-5 text-canvas">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-copper-bright">Operations specimen</p>
                <p className="mt-3 font-display text-xl tracking-[-0.02em] text-white">ATL-1042 · processing</p>
                <p className="mt-1 text-xs leading-relaxed text-canvas/60">
                  Seller accepted the order · 29 Oct 2026, 08:40 · simulated payment captured
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="components" aria-labelledby="components-heading">
          <LabHeading
            id="components"
            index="03"
            eyebrow="Primitives"
            title="Small parts, consistent behaviour"
            description="The component inventory is deliberately narrow. Each primitive owns its keyboard model, focus treatment and disabled state so product surfaces do not reinvent them."
            icon={MousePointerClick}
          />
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface-raised p-5">
                <p className="text-xs font-medium text-ink">Actions</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => toast({ title: "Primary action", description: "This specimen writes a real toast in the live region." })}>
                    Primary
                  </Button>
                  <Button size="sm" variant="copper">Copper</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                  <Button size="sm" variant="ghost">Ghost</Button>
                  <Button size="sm" variant="destructive">Destructive</Button>
                  <Button size="sm" loading>Saving</Button>
                  <Button size="sm" disabled>Disabled</Button>
                </div>
                <p className="mt-3 text-[0.625rem] leading-relaxed text-ink-faint">
                  Every action keeps a visible focus ring, a pressed translation and a busy label. Loading buttons expose
                  <code className="mx-1 rounded bg-ink/[0.05] px-1 py-0.5 font-mono text-[0.5625rem]">aria-busy</code>
                  and announce “Working…” to assistive technology.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface-raised p-5">
                  <p className="text-xs font-medium text-ink">Badges</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge>Neutral</Badge>
                    <Badge variant="teal">Teal</Badge>
                    <Badge variant="copper">Copper</Badge>
                    <Badge variant="success">Approved</Badge>
                    <Badge variant="warning">Pending</Badge>
                    <Badge variant="danger">Rejected</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  <p className="mt-3 text-[0.625rem] leading-relaxed text-ink-faint">
                    Status is never colour alone: each badge carries a text label, and order timelines pair status with a
                    timestamp and note.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface-raised p-5">
                  <p className="text-xs font-medium text-ink">Form controls</p>
                  <div className="mt-3 space-y-3">
                    <label htmlFor="lab-email" className="block text-[0.625rem] font-medium text-ink-soft">
                      Email address
                      <Input id="lab-email" type="email" placeholder="you@studio.example" className="mt-1" />
                    </label>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="lab-reminder" className="text-[0.6875rem] text-ink-soft">
                        Delivery reminder
                      </label>
                      <Switch id="lab-reminder" checked={reminder} onCheckedChange={setReminder} aria-label="Delivery reminder" />
                    </div>
                    <label className="flex items-center gap-2 text-[0.6875rem] text-ink-soft">
                      <Checkbox checked={quietMode} onCheckedChange={(value) => setQuietMode(value === true)} aria-label="Quiet mode" />
                      Quiet mode
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-surface-raised">
              <div className="border-b border-line px-4 py-3.5">
                <p className="text-xs font-medium text-ink">Inventory</p>
                <p className="mt-0.5 text-[0.625rem] text-ink-faint">What ships, and where it is specified.</p>
              </div>
              <ul className="divide-y divide-line">
                {componentRows.map(([name, behaviour, primitive]) => (
                  <li key={name} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-medium text-ink">{name}</p>
                      <span className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">{primitive}</span>
                    </div>
                    <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-soft">{behaviour}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="motion" aria-labelledby="motion-heading">
          <LabHeading
            id="motion"
            index="04"
            eyebrow="Motion profiles"
            title="Motion is a setting, not a surprise"
            description="Atlas ships three profiles. The operating-system preference selects Reduced on first visit, and the choice persists in this browser. Changing a profile updates the document dataset so CSS and Framer Motion agree."
            icon={Waves}
          />
          <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border border-line bg-surface-raised p-5">
              <fieldset>
                <legend className="text-xs font-medium text-ink">Active profile</legend>
                <div className="mt-3 grid gap-2">
                  {motionProfiles.map((profile) => {
                    const active = level === profile.id;
                    return (
                      <label
                        key={profile.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                          active ? "border-teal bg-teal-soft/60" : "border-line hover:border-line-strong"
                        )}
                      >
                        <input
                          type="radio"
                          name="motion-profile"
                          value={profile.id}
                          checked={active}
                          onChange={() => setLevel(profile.id)}
                          className="mt-0.5 size-4 accent-[hsl(var(--teal))]"
                        />
                        <span>
                          <span className="flex items-center gap-2 text-xs font-medium text-ink">
                            {profile.label}
                            {profile.id === "reduced" && systemReduced && <Badge variant="teal">System</Badge>}
                          </span>
                          <span className="mt-0.5 block text-[0.625rem] leading-relaxed text-ink-soft">{profile.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <p className="mt-3 text-[0.625rem] leading-relaxed text-ink-faint">
                System reduced motion is currently <strong className="font-medium text-ink">{systemReduced ? "on" : "off"}</strong>.
                Both profiles override CSS durations with an important rule, so third-party animation cannot ignore the choice.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-surface-raised">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-ink">Entrance specimen</p>
                  <p className="mt-0.5 text-[0.625rem] text-ink-faint">Replay the same transition under each profile.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setReplay((value) => value + 1)}>
                  <Play className="size-3.5" aria-hidden="true" /> Replay
                </Button>
              </div>
              <div className="min-h-[17rem] bg-surface p-5">
                <motion.div
                  key={replay}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-lg border border-line bg-surface-raised p-4 shadow-whisper"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="copper">Replay #{replay + 1}</Badge>
                    <Sparkles className="size-4 text-copper" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-xl tracking-[-0.02em] text-ink">A quiet arrival</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    Opacity and a short vertical translation. No parallax, no scroll hijack, no hover-only information.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Reveal", "Settle", "Read"].map((label, index) => (
                      <motion.div
                        key={`${replay}-${label}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.12 + index * 0.08 }}
                        className="rounded border border-line bg-surface px-2 py-2 text-center text-[0.625rem] text-ink-soft"
                      >
                        {label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              <div className="grid grid-cols-3 gap-px border-t border-line bg-line text-center text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                <span className="bg-surface-raised px-2 py-2">90–160ms feedback</span>
                <span className="bg-surface-raised px-2 py-2">260ms base</span>
                <span className="bg-surface-raised px-2 py-2">820ms narrative</span>
              </div>
            </div>
          </div>
        </section>

        <section id="charts" aria-labelledby="charts-heading">
          <LabHeading
            id="charts"
            index="05"
            eyebrow="Data display"
            title="Charts that explain themselves"
            description="Every chart is an inline SVG with a written summary and a hidden data table. Colours come from semantic status tokens. The figures below are the current demo order set, not benchmark data."
            icon={Gauge}
          />
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-line bg-surface-raised p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">Revenue · 14 days</p>
                  <p className="mt-0.5 text-[0.625rem] text-ink-faint">Demo clock ends 29 Oct 2026</p>
                </div>
                <Badge variant="teal">{formatMoney(revenue)} lifetime</Badge>
              </div>
              <TrendChart data={series} label="Lab specimen revenue, 14 days" height={230} className="mt-3" />
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface-raised p-4 sm:p-5">
                <p className="text-sm font-medium text-ink">Order status mix</p>
                <StatusDonut data={statuses} className="mt-4" />
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">Trend glyph</p>
                  <span className="font-mono text-[0.5625rem] text-ink-faint">decorative</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Sparkline values={sparkValues} />
                  <p className="text-[0.625rem] leading-relaxed text-ink-faint">
                    Sparklines are aria-hidden because they repeat information available in text.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-raised p-4 sm:p-5">
              <p className="text-sm font-medium text-ink">Bar list · category sample</p>
              <BarList
                className="mt-4"
                items={[
                  { label: "Audio", value: 128400, meta: "3 u" },
                  { label: "Lighting", value: 96400, meta: "2 u" },
                  { label: "Tableware", value: 62200, meta: "4 u" },
                  { label: "Desk", value: 31800, meta: "1 u" },
                ]}
              />
            </div>
            <div className="rounded-xl border border-dashed border-line-strong bg-surface/50 p-5">
              <p className="text-xs font-medium text-ink">Non-negotiables</p>
              <ul className="mt-3 space-y-2 text-[0.6875rem] leading-relaxed text-ink-soft">
                {[
                  "No chart library and no runtime data fetching for these specimens.",
                  "No colour-only encoding: labels, values and status text sit beside every mark.",
                  "The hidden table is real content, not an image alternative added afterwards.",
                  "Motion profile changes apply to charts because they use the shared duration tokens.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="quality" aria-labelledby="quality-heading">
          <LabHeading
            id="quality"
            index="06"
            eyebrow="Quality"
            title="What this system promises"
            description="These are implementation commitments and test targets. Results live in the repository quality report; a claim without a run is marked unverified."
            icon={Sparkles}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Accessibility",
                items: [
                  "Skip link, single main landmark, ordered headings",
                  "Visible focus, keyboard-operable dialogs and menus",
                  "44px primary touch targets on coarse pointers",
                  "aria-live toasts and inline form descriptions",
                ],
              },
              {
                title: "Reduced motion",
                items: [
                  "OS preference sets Reduced on first visit",
                  "Profile persisted in localStorage",
                  "CSS and Framer Motion share one decision",
                  "No scroll hijacking or hover-only content",
                ],
              },
              {
                title: "Performance",
                items: [
                  "Local SVG product art, no catalogue image requests",
                  "No chart or animation payload beyond Framer Motion",
                  "next/font with display swap and subsets",
                  "Route-level code splitting by App Router",
                ],
              },
              {
                title: "Honesty",
                items: [
                  "Demo data layer labelled on every surface",
                  "No real payment is taken",
                  "Admin and seller roles are previews, not auth",
                  "Every statistic traces to a seeded order record",
                ],
              },
            ].map((group) => (
              <div key={group.title} className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs font-medium text-ink">{group.title}</p>
                <ul className="mt-3 space-y-2 text-[0.6875rem] leading-relaxed text-ink-soft">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-ink px-5 py-4 text-canvas">
            <p className="text-xs leading-relaxed text-canvas/65">
              Read the source contract or step through all five surfaces.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="border-white/25 text-white hover:border-white/40 hover:bg-white/10">
                <Link href="/journey">
                  Connected journey <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="copper">
                <Link href="/products">Open the storefront</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LabHeading({
  id,
  index,
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: React.AriaAttributes["aria-hidden"] }>;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-copper">
          {index} · {eyebrow}
        </p>
        <h2 id={`${id}-heading`} className="mt-2 font-display text-3xl tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
        <Icon className="size-4" aria-hidden="true" />
      </span>
    </div>
  );
}
