"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardCheck,
  Gauge,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { BrandMark, Wordmark } from "@/components/brand";
import { AccountMenu } from "@/components/store/account-menu";
import { Notifications } from "@/components/store/notifications";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { fulfilmentQueue, lowStockProducts } from "@/lib/analytics";
import { useCatalog, useSellers } from "@/lib/hooks";
import { setRole, useAtlasState } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type Workspace = "seller" | "admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: React.AriaAttributes["aria-hidden"] }>;
  badge?: number;
}

const sellerNav: NavItem[] = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/orders", label: "Orders", icon: Package },
  { href: "/seller/products", label: "Products", icon: Boxes },
  { href: "/seller/inventory", label: "Inventory", icon: Warehouse },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/seller/earnings", label: "Earnings", icon: Wallet },
  { href: "/seller/settings", label: "Settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/moderation", label: "Moderation", icon: ClipboardCheck },
  { href: "/admin/orders", label: "Orders & returns", icon: Package },
  { href: "/admin/products", label: "Catalogue", icon: Boxes },
  { href: "/admin/sellers", label: "Sellers", icon: Users },
  { href: "/admin/customers", label: "Customers", icon: UserRound },
  { href: "/admin/finance", label: "Finance", icon: Wallet },
  { href: "/admin/merchandising", label: "Merchandising", icon: Sparkles },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit", label: "Audit trail", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const allowedRoles: Record<Workspace, Role[]> = {
  seller: ["SELLER"],
  admin: ["ADMIN", "SUPER_ADMIN"],
};

const workspaceCopy = {
  seller: {
    label: "Seller workspace",
    eyebrow: "Studio operations",
    roleLabel: "Seller",
    gateTitle: "This is the seller workspace",
    gateBody:
      "Seller surfaces are scoped to one studio. Preview the seller role to open the catalogue, fulfilment queue and payouts that belong to Kestrel Audio.",
    switchLabel: "Preview as seller",
    icon: Store,
  },
  admin: {
    label: "Admin command centre",
    eyebrow: "Marketplace operations",
    roleLabel: "Administrator",
    gateTitle: "This is the admin command centre",
    gateBody:
      "Moderation, returns and platform-wide order health are restricted to marketplace administrators. Preview the admin role to inspect the demo operations surface.",
    switchLabel: "Preview as administrator",
    icon: ShieldAlert,
  },
} as const;

function isActive(pathname: string, href: string) {
  return href === "/seller" || href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function WorkspaceShell({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const seller = sellers.find((item) => item.id === state.sellerId);
  const nav = workspace === "seller" ? sellerNav : adminNav;
  const counts: Record<string, number> = {
    "/seller/orders": fulfilmentQueue(state.orders, state.sellerId).length,
    "/seller/products": products.filter(
      (product) => product.sellerId === state.sellerId && product.moderation === "PENDING"
    ).length,
    "/seller/inventory": products.filter(
      (product) =>
        product.sellerId === state.sellerId &&
        product.moderation === "APPROVED" &&
        product.stock + product.variants.reduce((sum, variant) => sum + variant.stock, 0) <=
          state.settings.lowStockThreshold
    ).length,
    "/admin/moderation": products.filter((product) => product.moderation === "PENDING").length,
    "/admin/orders": state.orders.filter((order) => order.returnRequest?.status === "REQUESTED").length,
    "/admin/finance": state.orders.filter((order) => order.returnRequest?.status === "REQUESTED").length,
    "/admin/sellers": sellers.filter((item) => item.status === "PENDING").length,
  };
  const lowStock = lowStockProducts(state.settings.lowStockThreshold, products).filter((entry) =>
    workspace === "seller" ? entry.product.sellerId === state.sellerId : true
  ).length;

  const current = nav
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActive(pathname, item.href));
  const copy = workspaceCopy[workspace];
  const canEnter = allowedRoles[workspace].includes(state.role);

  const enterWorkspace = () => {
    setRole(workspace === "seller" ? "SELLER" : "ADMIN");
    toast({
      title: workspace === "seller" ? "Seller preview enabled" : "Administrator preview enabled",
      description: "Demo role switch only. Server-side permissions remain authoritative in production.",
      tone: "info",
    });
  };

  const navigation = (
    <nav aria-label={`${copy.label} navigation`} className="space-y-1">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        const badge = counts[item.href] ?? 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.8125rem] font-medium transition-colors",
              active ? "bg-teal text-primary-foreground shadow-whisper" : "text-ink-soft hover:bg-ink/[0.045] hover:text-ink"
            )}
          >
            <item.icon
              className={cn("size-4 shrink-0", active ? "text-primary-foreground" : "text-ink-faint group-hover:text-ink")}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {badge > 0 && (
              <span
                className={cn(
                  "tabular grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[0.625rem]",
                  active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-ink/[0.06] text-ink-soft"
                )}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="sticky top-0 hidden h-dvh w-[16.5rem] shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-4 py-4">
          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md" aria-label="Ponnaloy Atlas home">
            <span className="text-teal">
              <BrandMark size={28} />
            </span>
            <Wordmark />
          </Link>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-line bg-surface-raised px-2.5 py-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-teal text-[0.625rem] font-semibold text-primary-foreground">
              {workspace === "seller" ? initials(seller?.name ?? "Seller") : "AO"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-ink">
                {workspace === "seller" ? (seller?.name ?? "Seller workspace") : "Atlas Operations"}
              </span>
              <span className="block truncate text-[0.625rem] text-ink-faint">{copy.label}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-4">
          <p className="px-2.5 pb-2 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink-faint">
            {copy.eyebrow}
          </p>
          {navigation}

          {workspace === "seller" ? (
            <div className="mt-6 rounded-lg border border-line bg-surface-raised p-3">
              <p className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">Studio health</p>
              <dl className="mt-2 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Status</dt>
                  <dd>
                    <Badge variant={seller?.status === "APPROVED" ? "success" : "warning"} className="px-1.5 py-0">
                      {seller?.status?.toLowerCase() ?? "unknown"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Low stock</dt>
                  <dd className="tabular text-ink">{lowStock}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Commission</dt>
                  <dd className="tabular text-ink">{Math.round((seller?.commissionRate ?? 0) * 100)}%</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-line bg-surface-raised p-3">
              <p className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">Platform pulse</p>
              <dl className="mt-2 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Low stock</dt>
                  <dd className="tabular text-ink">{lowStock}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Open returns</dt>
                  <dd className="tabular text-ink">{counts["/admin/orders"] ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Moderation</dt>
                  <dd className="tabular text-ink">{counts["/admin/moderation"] ?? 0}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="border-t border-line p-2.5">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-ink-soft transition-colors hover:bg-ink/[0.045] hover:text-ink"
          >
            <ShoppingBag className="size-4 text-ink-faint" aria-hidden="true" />
            View storefront
            <ArrowUpRight className="ml-auto size-3 text-ink-faint" aria-hidden="true" />
          </Link>
          <Link
            href="/journey"
            className="focus-ring flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-ink-soft transition-colors hover:bg-ink/[0.045] hover:text-ink"
          >
            <CircleDollarSign className="size-4 text-ink-faint" aria-hidden="true" />
            Connected journey
          </Link>
          <p className="mt-2 px-2 text-[0.5625rem] leading-relaxed text-ink-faint">
            Demo workspace. Role changes preview permissions only; production auth stays server-side.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="focus-ring grid size-9 place-items-center rounded-md text-ink-soft hover:bg-ink/[0.05] hover:text-ink lg:hidden"
              aria-label="Open workspace navigation"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[0.625rem] uppercase tracking-[0.14em] text-ink-faint">{copy.label}</p>
              <p className="truncate text-[0.8125rem] font-medium text-ink">{current?.label ?? "Overview"}</p>
            </div>
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <Badge variant={canEnter ? "success" : "warning"} className="mr-1 hidden sm:inline-flex">
                {canEnter ? "Role active" : "Preview only"}
              </Badge>
              <ThemeSwitcher className="hidden sm:grid" />
              <Notifications role={state.role} />
              <AccountMenu />
              <Link
                href="/"
                className="focus-ring hidden size-9 place-items-center rounded-md text-ink-soft hover:bg-ink/[0.05] hover:text-ink sm:grid"
                aria-label="Return to storefront"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
          {!state.hydrated ? (
            <WorkspaceSkeleton />
          ) : canEnter ? (
            children
          ) : (
            <section className="mx-auto max-w-xl rounded-xl border border-line bg-surface-raised p-6 text-center shadow-whisper sm:p-9">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-copper-soft text-copper">
                <copy.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-copper">Role required</p>
              <h1 className="mt-2 font-display text-3xl tracking-[-0.03em] text-ink">{copy.gateTitle}</h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{copy.gateBody}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button onClick={enterWorkspace}>{copy.switchLabel}</Button>
                <Button asChild variant="outline">
                  <Link href="/">Back to storefront</Link>
                </Button>
              </div>
              <p className="mt-4 text-2xs leading-relaxed text-ink-faint">
                The role switch is a local demo. In production the API would reject unauthorised requests even if the UI
                were bypassed.
              </p>
            </section>
          )}
        </main>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[19rem] max-w-[88vw] p-0">
          <DialogTitle className="sr-only">{copy.label} navigation</DialogTitle>
          <div className="border-b border-line px-4 py-4">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <span className="text-teal">
                <BrandMark size={28} />
              </span>
              <Wordmark />
            </Link>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-2">
              <span className="grid size-7 place-items-center rounded-full bg-teal text-[0.625rem] font-semibold text-primary-foreground">
                {workspace === "seller" ? initials(seller?.name ?? "Seller") : "AO"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-ink">
                  {workspace === "seller" ? (seller?.name ?? "Seller workspace") : "Atlas Operations"}
                </span>
                <span className="block text-[0.625rem] text-ink-faint">{copy.label}</span>
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-4">{navigation}</div>
          <div className="border-t border-line p-3">
            <ThemeSwitcher variant="inline" className="mb-3" />
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <ShoppingBag className="size-4" aria-hidden="true" /> View storefront
              </Link>
            </Button>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[0.625rem] text-ink-faint">Demo role</p>
              <Badge variant={canEnter ? "success" : "warning"}>{state.role.toLowerCase()}</Badge>
            </div>
          </div>
        </SheetContent>
      </Dialog>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading workspace">
      <div className="h-8 w-64 rounded skeleton-shimmer" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl skeleton-shimmer" />
        ))}
      </div>
      <div className="h-72 rounded-xl skeleton-shimmer" />
    </div>
  );
}
