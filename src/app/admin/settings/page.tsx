"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Check,
  Download,
  HardDrive,
  Monitor,
  Moon,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Store,
  Sun,
} from "lucide-react";
import { useMotionLevel } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/controls";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { DATA_MODE } from "@/lib/api";
import { useCatalog } from "@/lib/hooks";
import { DEMO_NOW, initialAtlasState } from "@/lib/seed";
import { resetDemo, setRole, STORAGE_KEY, updatePlatformSettings, useAtlasState } from "@/lib/store";
import type { PlatformSettings } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const defaultSettings: PlatformSettings = initialAtlasState.settings;

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "System", icon: Monitor },
];

const motionOptions = [
  { id: "full" as const, label: "Full" },
  { id: "reduced" as const, label: "Reduced" },
  { id: "minimal" as const, label: "Minimal" },
];

export default function AdminSettingsPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { level, setLevel, systemReduced } = useMotionLevel();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [draft, setDraft] = React.useState<PlatformSettings>(state.settings);
  const [resetOpen, setResetOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => setDraft(state.settings), [state.settings]);

  const dirty = React.useMemo(
    () =>
      draft.lowStockThreshold !== state.settings.lowStockThreshold ||
      draft.allowReturns !== state.settings.allowReturns ||
      draft.requireListingReview !== state.settings.requireListingReview,
    [draft, state.settings]
  );

  const saveSettings = () => {
    const result = updatePlatformSettings(draft);
    if (!result.ok) {
      toast({ title: "Settings not saved", description: result.error, tone: "error" });
      return;
    }
    toast({
      title: "Platform policy saved",
      description: "Stored in this browser and written to the demo audit trail.",
      tone: "success",
    });
  };

  const restoreDefaults = () => {
    setDraft(defaultSettings);
    toast({ title: "Defaults restored in the form", description: "Choose Save policy to apply them.", tone: "info" });
  };

  const resetDemoState = () => {
    resetDemo();
    setDraft(defaultSettings);
    setResetOpen(false);
    toast({
      title: "Demo reset",
      description: "Cart, wishlist, orders, roles, settings and audit history are back to the seeded state.",
      tone: "success",
    });
  };

  const exportState = () => {
    const serializable: Partial<typeof state> = { ...state };
    delete serializable.hydrated;
    const blob = new Blob([JSON.stringify(serializable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ponnaloy-atlas-demo-state.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: "Demo state exported", description: "A JSON snapshot of this browser's Atlas state.", tone: "success" });
  };

  const previewSeller = () => {
    setRole("SELLER");
    toast({
      title: "Seller preview enabled",
      description: "Opening the seller workspace for Kestrel Audio. Demo role switch only.",
      tone: "info",
    });
    router.push("/seller");
  };

  const returnToStorefront = () => {
    setRole("CUSTOMER");
    toast({ title: "Customer preview enabled", description: "Returning to the storefront as Amara Okafor.", tone: "info" });
    router.push("/");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Configuration · browser-local demo"
        title="Platform settings"
        description="Three policies are wired into the live demo: stock-risk thresholds, return eligibility and whether new listings require review. Changes persist in this browser and are written to the audit trail."
        meta={
          <>
            <Badge variant={DATA_MODE === "live" ? "success" : "copper"}>{DATA_MODE === "live" ? "Live API" : "Demo data layer"}</Badge>
            <Badge variant="outline">State version {state.version}</Badge>
            <Badge variant="outline">Role {state.role.toLowerCase()}</Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/audit">
                <ShieldCheck className="size-4" aria-hidden="true" /> Audit trail
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/lab">Design lab</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
        <Panel
          title="Commerce policy"
          description="These fields change behaviour immediately after saving, not just copy on this page."
          action={<Badge variant={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Saved"}</Badge>}
        >
          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="low-stock">Low-stock threshold</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="low-stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={1}
                  value={draft.lowStockThreshold}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, lowStockThreshold: Number(event.target.value) }))
                  }
                  className="w-28"
                  aria-describedby="low-stock-help"
                />
                <span className="text-xs text-ink-faint">units or fewer</span>
              </div>
              <p id="low-stock-help" className="text-[0.625rem] leading-relaxed text-ink-faint">
                Drives the stock-risk panel on the admin dashboard and the low-stock count in both workspace sidebars.
                Current value: {state.settings.lowStockThreshold}.
              </p>
            </div>

            <div className="flex items-start justify-between gap-4 border-t border-line pt-4">
              <div>
                <Label htmlFor="allow-returns">Allow customer returns</Label>
                <p id="allow-returns-help" className="mt-1 text-[0.625rem] leading-relaxed text-ink-faint">
                  When off, the return action on a delivered order is rejected before a request is written. Existing
                  requests remain in the admin queue.
                </p>
              </div>
              <Switch
                id="allow-returns"
                checked={draft.allowReturns}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, allowReturns: checked }))}
                aria-describedby="allow-returns-help"
              />
            </div>

            <div className="flex items-start justify-between gap-4 border-t border-line pt-4">
              <div>
                <Label htmlFor="listing-review">Require listing review</Label>
                <p id="listing-review-help" className="mt-1 text-[0.625rem] leading-relaxed text-ink-faint">
                  When on, seller-created products enter the moderation queue. When off, a new listing is published
                  immediately and the audit entry records the waived review.
                </p>
              </div>
              <Switch
                id="listing-review"
                checked={draft.requireListingReview}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, requireListingReview: checked }))}
                aria-describedby="listing-review-help"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <Button onClick={saveSettings} disabled={!dirty}>
                <Save className="size-4" aria-hidden="true" /> Save policy
              </Button>
              <Button variant="outline" onClick={restoreDefaults} disabled={!dirty}>
                Restore defaults
              </Button>
              {dirty && <span className="text-[0.625rem] text-ink-faint">Unsaved changes are not applied to other surfaces.</span>}
            </div>
          </div>
        </Panel>

        <Panel title="Appearance & motion" description="These preferences apply immediately and persist locally.">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-ink">Theme</p>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-md border border-line bg-surface p-0.5" role="group" aria-label="Theme">
                {themeOptions.map((option) => {
                  const active = mounted && theme === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTheme(option.id)}
                      aria-pressed={active}
                      className={cn(
                        "focus-ring inline-flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[0.6875rem] font-medium transition-colors",
                        active ? "bg-teal text-primary-foreground" : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink"
                      )}
                    >
                      <option.icon className="size-3.5" aria-hidden="true" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[0.625rem] text-ink-faint">
                {mounted ? `Active: ${theme ?? "system"}` : "Reading stored preference…"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-ink">Motion profile</p>
              <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Motion profile">
                {motionOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLevel(option.id)}
                    aria-pressed={level === option.id}
                    className={cn(
                      "focus-ring rounded-md border px-2.5 py-1.5 text-[0.6875rem] font-medium transition-colors",
                      level === option.id
                        ? "border-teal bg-teal text-primary-foreground"
                        : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[0.625rem] leading-relaxed text-ink-faint">
                System reduced motion is {systemReduced ? "on" : "off"}. Inspect every profile in the{" "}
                <Link href="/lab#motion" className="text-teal hover:underline">
                  design lab
                </Link>
                .
              </p>
            </div>

            <div className="border-t border-line pt-4">
              <p className="text-xs font-medium text-ink">Preview roles</p>
              <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-faint">
                Switching role changes which demo surfaces open. Production authorisation would still come from the API.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={previewSeller}>
                  <Store className="size-4" aria-hidden="true" /> Seller workspace
                </Button>
                <Button variant="outline" size="sm" onClick={returnToStorefront}>
                  <ArrowRight className="size-4" aria-hidden="true" /> Customer view
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Demo data" description="Export or reset the browser-local state.">
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Orders</dt>
              <dd className="tabular font-medium text-ink">{formatNumber(state.orders.length)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Products</dt>
              <dd className="tabular font-medium text-ink">{formatNumber(products.length)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Audit entries</dt>
              <dd className="tabular font-medium text-ink">{formatNumber(state.audit.length)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Demo clock</dt>
              <dd className="font-mono text-[0.625rem] text-ink">{DEMO_NOW.slice(0, 10)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportState}>
              <Download className="size-4" aria-hidden="true" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" className="text-danger hover:border-danger/40" onClick={() => setResetOpen(true)}>
              <RotateCcw className="size-4" aria-hidden="true" /> Reset demo
            </Button>
          </div>
        </Panel>

        <Panel title="Storage & runtime" description="Facts read from the running demo.">
          <dl className="space-y-2 text-xs">
            <div>
              <dt className="text-ink-faint">Storage key</dt>
              <dd className="mt-0.5 break-all font-mono text-[0.625rem] text-ink">{STORAGE_KEY}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Schema version</dt>
              <dd className="tabular font-medium text-ink">{state.version}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Data source</dt>
              <dd className="font-medium text-ink">{DATA_MODE === "live" ? "Live API" : "Synthetic demo"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-faint">Hydrated</dt>
              <dd className="font-medium text-ink">{state.hydrated ? "Yes" : "Pending"}</dd>
            </div>
          </dl>
          <p className="mt-3 flex items-start gap-2 text-[0.625rem] leading-relaxed text-ink-faint">
            <HardDrive className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Browsers can block localStorage in private modes. Atlas falls back to in-memory state and keeps working.
          </p>
        </Panel>

        <Panel title="Governance boundary" description="What saving these settings does not do.">
          <ul className="space-y-2.5 text-xs leading-relaxed text-ink-soft">
            {[
              "It does not create a server-side policy record.",
              "It does not grant or revoke API permissions.",
              "It is visible only in this browser profile.",
              "It is included in the demo audit trail, not a compliance log.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-copper" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/help#demo-data">
              <Settings2 className="size-4" aria-hidden="true" /> Demo disclosure
            </Link>
          </Button>
        </Panel>
      </div>

      <WorkspaceNote>
        Platform settings are enforced by this demo store only. In production the API would own policy, validate each
        mutation, and write an immutable audit record with the authenticated actor.
      </WorkspaceNote>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset the entire demo?</DialogTitle>
            <DialogDescription>
              This clears cart, wishlist, session orders, product edits, role selection, platform settings and the audit
              trail, then reloads the seeded state. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-danger/20 bg-danger/5 p-3 text-[0.6875rem] leading-relaxed text-danger">
            Only browser-local Atlas data is removed. Other sites and files are untouched.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetDemoState}>
              <RotateCcw className="size-4" aria-hidden="true" /> Reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
