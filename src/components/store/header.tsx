"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { BrandMark, Wordmark } from "@/components/brand";
import { StillLifeArt } from "@/components/still-life";
import { ProductArt } from "@/components/product-art";
import { AccountMenu } from "@/components/store/account-menu";
import { CartDrawer } from "@/components/store/cart-drawer";
import { MobileNav } from "@/components/store/mobile-nav";
import { Notifications } from "@/components/store/notifications";
import { SearchDialog } from "@/components/store/search-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useCatalog } from "@/lib/hooks";
import { categories, collections } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import { cn, formatMoney } from "@/lib/utils";

const nav = [
  { href: "/products", label: "Shop", mega: true },
  { href: "/collections", label: "Collections" },
  { href: "/sellers", label: "Sellers" },
  { href: "/journey", label: "Journey" },
  { href: "/lab", label: "Lab" },
];

export function Header() {
  const pathname = usePathname();
  const state = useAtlasState();
  const products = useCatalog();
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [announcementOpen, setAnnouncementOpen] = React.useState(true);
  const [scrolled, setScrolled] = React.useState(false);
  const megaTrigger = React.useRef<HTMLButtonElement>(null);

  const cartCount = state.cart.reduce((sum, line) => sum + line.quantity, 0);
  const wishlistCount = state.wishlist.length;

  React.useEffect(() => {
    setMegaOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape" && megaOpen) {
        setMegaOpen(false);
        megaTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [megaOpen]);

  const featured = products.filter((product) => product.slug === "aria-over-ear-headphones" || product.slug === "halo-table-lamp" || product.slug === "atlas-clothbound-journal");
  const collection = collections[0]!;

  return (
    <>
      {announcementOpen && (
        <div className="relative z-[60] overflow-hidden bg-deep text-deep-foreground">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,hsl(var(--teal)/0.45),transparent_58%)]" aria-hidden="true" />
          <div className="atlas-container relative flex h-9 items-center justify-between gap-4 text-[0.625rem] uppercase tracking-[0.14em]">
            <p className="flex items-center gap-2">
              <span className="status-dot bg-copper-bright" aria-hidden="true" />
              <span className="hidden sm:inline">Atlas demo experience</span>
              <span className="sm:hidden">Demo</span>
              <span className="text-deep-foreground/40">/</span>
              <span className="text-deep-foreground/70">Synthetic marketplace data</span>
            </p>
            <div className="flex items-center gap-4">
              <Link href="/journey" className="hidden text-deep-foreground/75 transition-colors hover:text-deep-foreground md:inline">
                How the five surfaces connect
              </Link>
              <Link href="/lab" className="inline-flex items-center gap-1 text-deep-foreground/75 transition-colors hover:text-deep-foreground">
                Design lab <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => setAnnouncementOpen(false)}
                className="focus-ring -mr-1 grid size-6 place-items-center rounded-full text-deep-foreground/60 transition-colors hover:bg-white/10 hover:text-deep-foreground"
                aria-label="Dismiss announcement"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-50 border-b border-line/80 bg-canvas/85 backdrop-blur-xl transition-[box-shadow,background-color,border-color] duration-base supports-[backdrop-filter]:bg-canvas/72",
          scrolled && "border-line bg-canvas/92 shadow-whisper supports-[backdrop-filter]:bg-canvas/82"
        )}
      >
        <div className="atlas-container relative z-40 flex h-[var(--header-height)] items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="focus-ring -ml-1.5 grid size-10 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md py-1">
            <span className="text-teal">
              <BrandMark size={30} />
            </span>
            <Wordmark compactOnMobile />
          </Link>

          <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const itemActive = item.mega
                ? pathname.startsWith("/products") || pathname.startsWith("/product/")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return item.mega ? (
                <button
                  key={item.label}
                  ref={megaTrigger}
                  type="button"
                  onClick={() => setMegaOpen((open) => !open)}
                  aria-expanded={megaOpen}
                  aria-controls="atlas-mega"
                  className={cn(
                    "focus-ring relative rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink",
                    itemActive && "text-ink"
                  )}
                >
                  {item.label}
                  {itemActive && (
                    <motion.span
                      layoutId="atlas-nav-indicator"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-copper"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={itemActive ? "page" : undefined}
                  className={cn(
                    "focus-ring relative rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink",
                    itemActive && "text-ink"
                  )}
                >
                  {item.label}
                  {itemActive && (
                    <motion.span
                      layoutId="atlas-nav-indicator"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-copper"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="focus-ring hidden h-10 items-center gap-2.5 rounded-full border border-line bg-surface-raised px-3.5 text-xs text-ink-faint transition-[border-color,color,box-shadow] duration-base hover:border-line-strong hover:text-ink hover:shadow-whisper sm:flex"
              aria-label="Search ⌘K"
              aria-keyshortcuts="Meta+K"
            >
              <Search className="size-4" aria-hidden="true" />
              <span>Search</span>
              <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-mono text-[0.5625rem] leading-none text-ink-faint">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="focus-ring grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink sm:hidden"
              aria-label="Search the catalogue"
            >
              <Search className="size-[1.15rem]" aria-hidden="true" />
            </button>

            <div className="hidden sm:block">
              <Notifications role={state.role} />
            </div>

            <Link
              href="/wishlist"
              className="focus-ring relative hidden size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink sm:grid"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`}
            >
              <Heart className="size-[1.15rem]" aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-copper" />
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="focus-ring relative grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink"
              aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ", empty"}`}
            >
              <ShoppingBag className="size-[1.15rem]" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="tabular absolute -right-0.5 -top-0.5 grid min-w-[1.125rem] place-items-center rounded-full bg-teal px-1 text-[0.5625rem] font-semibold leading-[1.125rem] text-primary-foreground ring-2 ring-canvas">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <ThemeSwitcher className="hidden sm:grid" />
            <AccountMenu />
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <>
              <motion.button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-30 cursor-default bg-overlay/25 backdrop-blur-[1px]"
                onClick={() => setMegaOpen(false)}
              />
              <motion.div
                id="atlas-mega"
                role="region"
                aria-label="Shop menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-full z-50 hidden border-b border-line bg-surface-raised shadow-lift lg:block"
              >
              <div className="atlas-container grid grid-cols-12 gap-8 py-8">
                <div className="col-span-4">
                  <p className="eyebrow">Browse the catalogue</p>
                  <ul className="mt-4 space-y-0.5">
                    {categories.map((category, index) => (
                      <li key={category.slug}>
                        <Link
                          href={`/products?category=${category.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="focus-ring group flex items-center gap-4 rounded-md py-2.5 pr-3 transition-colors hover:bg-ink/[0.035]"
                        >
                          <span className="font-mono text-[0.625rem] text-ink-faint">0{index + 1}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-ink">{category.name}</span>
                            <span className="block truncate text-xs text-ink-faint">{category.description}</span>
                          </span>
                          <ArrowRight className="size-3.5 -translate-x-1 text-ink-faint opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {(
                      [
                        ["New arrivals", "/products?sort=newest"],
                        ["Bestsellers", "/products?sort=rating"],
                        ["Under $100", "/products?max=10000"],
                        ["Compare studio", "/compare"],
                      ] satisfies Array<[string, string]>
                    ).map(([label, href]) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMegaOpen(false)}
                        className="focus-ring rounded-full border border-line px-3 py-1.5 text-2xs text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="col-span-5 border-x border-line px-8">
                  <div className="flex items-baseline justify-between">
                    <p className="eyebrow">The current edit</p>
                    <Link href="/products" onClick={() => setMegaOpen(false)} className="text-2xs text-teal hover:underline">
                      All objects
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {featured.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="focus-ring group block rounded-lg"
                      >
                        <span className="block aspect-[4/5] overflow-hidden rounded-md bg-surface">
                          <span className="block h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
                            <ProductArt art={product.art} palette={product.palette} />
                          </span>
                        </span>
                        <span className="mt-2 block truncate text-xs font-medium text-ink">{product.name}</span>
                        <span className="tabular block text-2xs text-ink-faint">{formatMoney(product.price)}</span>
                      </Link>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                    Editorial selection, not a sales ranking. Every object is vetted for materials, repair and the seller behind it.
                  </p>
                </div>

                <div className="col-span-3">
                  <div className="relative overflow-hidden rounded-lg border border-line">
                    <div className="aspect-[5/4]">
                      <StillLifeArt palette={collection.palette} variant={2} />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-deep/90 via-deep/25 to-transparent p-4 text-deep-foreground">
                      <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-deep-foreground/75">{collection.kicker}</p>
                      <p className="mt-1 font-display text-xl leading-tight tracking-[-0.02em]">{collection.name}</p>
                      <Link
                        href={`/collections/${collection.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="focus-ring mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-raised/95 px-3 py-1.5 text-2xs font-medium text-ink backdrop-blur"
                      >
                        View collection <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                  <Link
                    href="/sellers"
                    onClick={() => setMegaOpen(false)}
                    className="focus-ring mt-3 flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:border-line-strong"
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-copper-soft text-copper">
                      <Store className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-ink">Meet the makers</span>
                      <span className="block text-2xs text-ink-faint">6 approved studios · 1 applicant</span>
                    </span>
                    <ArrowRight className="size-3.5 text-ink-faint" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="border-t border-line bg-surface">
                <div className="atlas-container flex items-center justify-between py-2.5 text-2xs text-ink-faint">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3 text-copper" aria-hidden="true" />
                    Search with ⌘K · compare up to four objects
                  </span>
                  <Link href="/journey" onClick={() => setMegaOpen(false)} className="inline-flex items-center gap-1 text-teal hover:underline">
                    See the connected journey <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>
      </header>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} onSearch={() => setSearchOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
