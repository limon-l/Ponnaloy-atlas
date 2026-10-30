import Link from "next/link";
import { ArrowUpRight, Github, Globe2, Mail } from "lucide-react";
import { BrandMark, Wordmark } from "@/components/brand";
import { Newsletter } from "@/components/store/newsletter";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { DATA_MODE } from "@/lib/api";
import { categories } from "@/lib/seed";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All objects", href: "/products" },
      { label: "Collections", href: "/collections" },
      { label: "Sellers", href: "/sellers" },
      { label: "Compare studio", href: "/compare" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Account overview", href: "/account" },
      { label: "Orders & returns", href: "/orders" },
      { label: "Bag", href: "/cart" },
      { label: "Demo sign-in", href: "/sign-in" },
      { label: "Help", href: "/help" },
    ],
  },
  {
    title: "The platform",
    links: [
      { label: "Connected journey", href: "/journey" },
      { label: "Design & motion lab", href: "/lab" },
      { label: "Seller workspace", href: "/seller" },
      { label: "Admin command centre", href: "/admin" },
      { label: "System notes", href: "/help#demo-data" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-deep text-deep-foreground">
      <div className="relative overflow-hidden border-b border-deep-foreground/10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_8%_0%,hsl(var(--teal)/0.5),transparent_60%),radial-gradient(ellipse_45%_50%_at_92%_100%,hsl(var(--copper-bright)/0.16),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="atlas-container relative grid gap-10 py-12 md:grid-cols-[1.1fr_1fr] md:items-center lg:py-16">
          <Newsletter />
          <div className="grid grid-cols-2 gap-6 border-t border-deep-foreground/15 pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <div>
              <p className="font-display text-3xl tracking-[-0.03em] text-deep-foreground">Atlas</p>
              <p className="mt-2 text-xs leading-relaxed text-deep-foreground/70">
                A five-surface commerce study: storefront, studio, seller, operations and motion.
              </p>
            </div>
            <div className="space-y-2 text-xs text-deep-foreground/70">
              <Link href="/journey" className="flex items-center gap-2 transition-colors hover:text-deep-foreground">
                <Globe2 className="size-3.5" aria-hidden="true" /> Journey map
              </Link>
              <Link href="/lab" className="flex items-center gap-2 transition-colors hover:text-deep-foreground">
                <ArrowUpRight className="size-3.5" aria-hidden="true" /> Motion profiles
              </Link>
              <a href="mailto:hello@ponnaloy.example" className="flex items-center gap-2 transition-colors hover:text-deep-foreground">
                <Mail className="size-3.5" aria-hidden="true" /> Contact
              </a>
              <a
                href="https://github.com/limon-l/Ponnaloy-atlas"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-deep-foreground"
              >
                <Github className="size-3.5" aria-hidden="true" /> Source
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="atlas-container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-md text-deep-foreground">
              <BrandMark size={30} />
              <Wordmark inverted />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-deep-foreground/70">
              Objects for a considered life. An editorial marketplace built for independent studios and the people who keep their work.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-deep-foreground/20 px-2.5 py-1 text-2xs text-deep-foreground/75">
                <span className={`size-1.5 rounded-full ${DATA_MODE === "live" ? "bg-success" : "bg-copper-bright"}`} aria-hidden="true" />
                {DATA_MODE === "live" ? "Live API mode" : "Demo data layer"}
              </span>
              <span className="rounded-full border border-deep-foreground/20 px-2.5 py-1 text-2xs text-deep-foreground/75">WCAG 2.2 AA target</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-2xs uppercase tracking-[0.16em] text-deep-foreground/60">{column.title}</p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex text-sm text-deep-foreground/75 transition-colors hover:text-deep-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-deep-foreground/15 pt-6">
          <p className="text-2xs uppercase tracking-[0.14em] text-deep-foreground/60">Categories</p>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="rounded-full border border-deep-foreground/15 px-2.5 py-1 text-2xs text-deep-foreground/75 transition-colors hover:border-deep-foreground/35 hover:text-deep-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-deep-foreground/15 pt-6 text-2xs text-deep-foreground/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ponnaloy Atlas. Portfolio demonstration, not a live shop.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/help#demo-data" className="hover:text-deep-foreground">Demo data disclosure</Link>
            <Link href="/help#accessibility" className="hover:text-deep-foreground">Accessibility</Link>
            <Link href="/help#privacy" className="hover:text-deep-foreground">Privacy</Link>
            <span className="hidden sm:inline">Money in USD · demo clock 29 Oct 2026</span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
