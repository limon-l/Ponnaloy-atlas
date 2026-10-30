"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, Search, ShieldCheck } from "lucide-react";
import { Dialog, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { categories } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";

const links = [
  { href: "/products", label: "Shop all" },
  { href: "/collections", label: "Collections" },
  { href: "/sellers", label: "Sellers" },
  { href: "/journey", label: "Connected journey" },
  { href: "/lab", label: "Design lab" },
];

export function MobileNav({
  open,
  onOpenChange,
  onSearch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: () => void;
}) {
  const state = useAtlasState();
  const workspace = state.role === "SELLER" ? "/seller" : state.role === "ADMIN" || state.role === "SUPER_ADMIN" ? "/admin" : null;
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(88vw,22rem)] p-0">
        <div className="border-b border-line px-5 py-4 pr-14">
          <DialogTitle className="font-display text-xl tracking-[-0.03em]">Ponnaloy Atlas</DialogTitle>
          <p className="mt-0.5 text-2xs uppercase tracking-[0.14em] text-copper">Objects for a considered life</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                close();
                onSearch();
              }}
              className="focus-ring flex w-full items-center gap-3 rounded-md border border-line bg-surface px-3 py-3 text-sm text-ink-faint"
            >
              <Search className="size-4" aria-hidden="true" />
              Search objects, sellers…
            </button>
          </div>

          <nav aria-label="Mobile primary" className="px-3 pb-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="focus-ring flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-ink/[0.04]"
              >
                {link.label}
                <ArrowUpRight className="size-4 text-ink-faint" aria-hidden="true" />
              </Link>
            ))}
            {workspace && (
              <Link
                href={workspace}
                onClick={close}
                className="focus-ring mt-1 flex items-center justify-between rounded-md bg-teal-soft px-3 py-3 text-base font-medium text-teal"
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  {state.role === "SELLER" ? "Seller workspace" : "Admin workspace"}
                </span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </nav>

          <div className="border-t border-line px-5 py-4">
            <p className="eyebrow mb-3">Browse by category</p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  onClick={close}
                  className="focus-ring rounded-md px-2 py-2 text-sm text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-line px-3 py-4">
            <Link
              href="/account"
              onClick={close}
              className="focus-ring block rounded-md px-3 py-2.5 text-sm text-ink-soft hover:bg-ink/[0.04]"
            >
              Account
            </Link>
            <Link
              href="/orders"
              onClick={close}
              className="focus-ring block rounded-md px-3 py-2.5 text-sm text-ink-soft hover:bg-ink/[0.04]"
            >
              Orders
            </Link>
            <Link
              href="/wishlist"
              onClick={close}
              className="focus-ring block rounded-md px-3 py-2.5 text-sm text-ink-soft hover:bg-ink/[0.04]"
            >
              Wishlist
            </Link>
            <Link
              href="/help"
              onClick={close}
              className="focus-ring block rounded-md px-3 py-2.5 text-sm text-ink-soft hover:bg-ink/[0.04]"
            >
              Help & returns
            </Link>
          </div>
        </div>

        <div className="border-t border-line bg-surface p-4">
          <p className="flex items-start gap-2 text-[0.6875rem] leading-relaxed text-ink-faint">
            <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Demo marketplace. Synthetic catalogue and orders; no payments are processed.
          </p>
        </div>
      </SheetContent>
    </Dialog>
  );
}
