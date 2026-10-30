"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Store, Tag, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductArt } from "@/components/product-art";
import { searchProducts } from "@/lib/catalog";
import { useCatalog, useSellers } from "@/lib/hooks";
import { categories } from "@/lib/seed";
import { formatMoney } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RECENT_KEY = "ponnaloy.atlas.recent-searches";

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const products = useCatalog();
  const sellers = useSellers();
  const [query, setQuery] = React.useState("");
  const [recent, setRecent] = React.useState<string[]>([]);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      setRecent(raw ? (JSON.parse(raw) as string[]).slice(0, 5) : []);
    } catch {
      setRecent([]);
    }
    setQuery("");
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  const productResults = React.useMemo(
    () => (query.trim() ? searchProducts(products, query, 5) : []),
    [products, query]
  );
  const categoryResults = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return categories.filter((category) => category.name.toLowerCase().includes(q)).slice(0, 3);
  }, [query]);

  const options = React.useMemo(() => {
    if (!query.trim()) {
      return recent.map((value) => ({ kind: "recent" as const, value }));
    }
    return [
      ...productResults.map((product) => ({ kind: "product" as const, product })),
      ...categoryResults.map((category) => ({ kind: "category" as const, category })),
    ];
  }, [categoryResults, productResults, query, recent]);

  const saveRecent = (value: string) => {
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 5);
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/private mode
    }
  };

  const go = (href: string, remember?: string) => {
    if (remember) saveRecent(remember);
    onOpenChange(false);
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(options.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      if (options.length === 0 && query.trim()) {
        event.preventDefault();
        go(`/products?q=${encodeURIComponent(query.trim())}`, query.trim());
        return;
      }
      const option = options[active];
      if (!option) return;
      event.preventDefault();
      if (option.kind === "recent") go(`/products?q=${encodeURIComponent(option.value)}`, option.value);
      if (option.kind === "product") go(`/product/${option.product.slug}`, option.product.name);
      if (option.kind === "category") go(`/products?category=${option.category.slug}`, option.category.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0" hideClose>
        <DialogTitle className="sr-only">Search the catalogue</DialogTitle>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="atlas-search-results"
            aria-autocomplete="list"
            aria-activedescendant={options[active] ? `atlas-search-option-${active}` : undefined}
            aria-label="Search products, collections and categories"
            placeholder="Search objects, sellers, categories…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-2xs text-ink-faint sm:block">ESC</kbd>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="focus-ring rounded p-1.5 text-ink-faint hover:text-ink sm:hidden"
            aria-label="Close search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div id="atlas-search-results" role="listbox" aria-label="Search results" className="max-h-[min(65vh,520px)] overflow-y-auto p-2">
          {!query.trim() && (
            <div className="px-2 py-2">
              <p className="eyebrow mb-3">Recent searches</p>
              {recent.length === 0 ? (
                <p className="pb-3 text-sm text-ink-faint">Try “lamp”, “linen” or “journal”.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recent.map((value, index) => (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={active === index}
                      id={`atlas-search-option-${index}`}
                      onClick={() => go(`/products?q=${encodeURIComponent(value)}`, value)}
                      className="focus-ring rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink/30 hover:text-ink aria-selected:border-teal aria-selected:text-teal"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
              <p className="eyebrow mb-3 mt-6">Browse</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products?category=${category.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="focus-ring flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  >
                    {category.name}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim() && options.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-medium text-ink">No direct matches for “{query}”.</p>
              <p className="mt-1 text-sm text-ink-soft">Search the full catalogue or try a broader term.</p>
              <button
                type="button"
                onClick={() => go(`/products?q=${encodeURIComponent(query.trim())}`, query.trim())}
                className="focus-ring mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-teal px-4 text-sm font-medium text-white"
              >
                Search all products <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {options.map((option, index) => {
            if (option.kind === "product") {
              const product = option.product;
              const seller = sellers.find((item) => item.id === product.sellerId);
              return (
                <button
                  key={`product-${product.id}`}
                  type="button"
                  role="option"
                  aria-selected={active === index}
                  id={`atlas-search-option-${index}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(`/product/${product.slug}`, product.name)}
                  className="focus-ring flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-ink/[0.04] aria-selected:bg-ink/[0.05]"
                >
                  <span className="size-12 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                    <span className="block truncate text-xs text-ink-faint">{seller?.name} · {product.subtitle}</span>
                  </span>
                  <span className="tabular text-sm text-ink-soft">{formatMoney(product.price)}</span>
                </button>
              );
            }
            if (option.kind === "category") {
              return (
                <button
                  key={`cat-${option.category.slug}`}
                  type="button"
                  role="option"
                  aria-selected={active === index}
                  id={`atlas-search-option-${index}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(`/products?category=${option.category.slug}`, option.category.name)}
                  className="focus-ring flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-ink/[0.04] aria-selected:bg-ink/[0.05]"
                >
                  <span className="flex size-10 items-center justify-center rounded-md bg-teal-soft text-teal">
                    {option.category.slug === "stationery" ? <Tag className="size-4" /> : <Store className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{option.category.name}</span>
                    <span className="block truncate text-xs text-ink-faint">Category · {option.category.description}</span>
                  </span>
                </button>
              );
            }
            return null;
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-2.5 text-2xs text-ink-faint">
          <span>↑ ↓ to navigate · Enter to open</span>
          <button
            type="button"
            onClick={() => go(`/products?q=${encodeURIComponent(query.trim())}`, query.trim())}
            className="focus-ring rounded text-teal hover:underline disabled:text-ink-faint"
            disabled={!query.trim()}
          >
            View all results
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
