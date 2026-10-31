"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, LayoutDashboard, LogIn, Package, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { useSellers } from "@/lib/hooks";
import { setRole, useAtlasState } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const roleLabels: Record<Role, string> = {
  CUSTOMER: "Customer",
  SELLER: "Seller",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super admin",
};

const roleOptions: Array<{ role: Role; label: string; detail: string }> = [
  { role: "CUSTOMER", label: "Customer", detail: "Storefront" },
  { role: "SELLER", label: "Seller", detail: "Workspace" },
  { role: "ADMIN", label: "Admin", detail: "Operations" },
];

export function AccountMenu() {
  const state = useAtlasState();
  const sellers = useSellers();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const seller = sellers.find((item) => item.id === state.sellerId);
  const name =
    state.role === "CUSTOMER"
      ? "Amara Okafor"
      : state.role === "SELLER"
        ? (seller?.name ?? "Seller workspace")
        : "Atlas Operations";
  const email =
    state.role === "CUSTOMER"
      ? "amara.okafor@example.com"
      : state.role === "SELLER"
        ? (seller?.supportEmail ?? "seller@example.com")
        : "ops@ponnaloy.example";
  const workspace = state.role === "ADMIN" || state.role === "SUPER_ADMIN" ? "/admin" : "/seller";

  const switchRole = (role: Role) => {
    setRole(role);
    toast({
      title: `Viewing as ${roleLabels[role].toLowerCase()}`,
      description:
        role === "CUSTOMER"
          ? "Storefront links and customer surfaces are active."
          : "This is a demo role switch. The API would remain authoritative for permissions.",
      tone: "info",
    });
    setOpen(false);
    router.push(role === "CUSTOMER" ? "/" : role === "SELLER" ? "/seller" : "/admin");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="focus-ring flex h-10 items-center gap-2 rounded-md px-1.5 text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink sm:px-2"
        >
          <span className="grid size-8 place-items-center rounded-full bg-teal text-[0.6875rem] font-semibold text-primary-foreground">
            {initials(name)}
          </span>
          <span className="hidden items-center gap-1.5 xl:flex">
            <span className="max-w-24 truncate text-xs font-medium text-ink">{name.split(" ")[0]}</span>
            <ChevronDown className="size-3 text-ink-faint" aria-hidden="true" />
          </span>
          <span className="sr-only">account menu. Signed in as {name}, {roleLabels[state.role]}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,20rem)] p-0">
        <div className="border-b border-line px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-primary-foreground">
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{name}</p>
              <p className="truncate text-xs text-ink-faint">{email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={state.role === "CUSTOMER" ? "teal" : state.role === "SELLER" ? "copper" : "solid"}>
              {roleLabels[state.role]}
            </Badge>
            <span className="text-2xs text-ink-faint">Demo session</span>
          </div>
        </div>

        <nav aria-label="Account links" className="p-1.5">
          <MenuLink href="/account" icon={User} onNavigate={() => setOpen(false)}>
            Account overview
          </MenuLink>
          <MenuLink href="/orders" icon={Package} onNavigate={() => setOpen(false)}>
            Orders & returns
          </MenuLink>
          <MenuLink href="/wishlist" icon={Heart} onNavigate={() => setOpen(false)}>
            Wishlist
          </MenuLink>
          {state.role !== "CUSTOMER" && (
            <MenuLink href={workspace} icon={LayoutDashboard} onNavigate={() => setOpen(false)}>
              Open {state.role === "SELLER" ? "seller" : "admin"} workspace
            </MenuLink>
          )}
          <MenuLink href="/sign-in" icon={LogIn} onNavigate={() => setOpen(false)}>
            Demo sign-in
          </MenuLink>
        </nav>

        <div className="border-t border-line p-3">
          <p className="px-1 text-2xs uppercase tracking-[0.12em] text-ink-faint">Switch demo role</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => switchRole(option.role)}
                aria-pressed={state.role === option.role}
                className={cn(
                  "focus-ring rounded-md border px-2 py-2 text-left transition-colors",
                  state.role === option.role
                    ? "border-teal/30 bg-teal-soft text-teal"
                    : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                )}
              >
                <span className="block text-2xs font-medium">{option.label}</span>
                <span className="block text-[0.5625rem] opacity-70">{option.detail}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 flex items-start gap-1.5 px-1 text-[0.625rem] leading-relaxed text-ink-faint">
            <ShieldCheck className="mt-px size-3 shrink-0" aria-hidden="true" />
            UI preview only. Real authorisation stays with the API.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: React.AriaAttributes["aria-hidden"] }>;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="focus-ring flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-soft transition-colors hover:bg-ink/[0.045] hover:text-ink"
    >
      <Icon className="size-4 text-ink-faint" aria-hidden={true} />
      {children}
    </Link>
  );
}
