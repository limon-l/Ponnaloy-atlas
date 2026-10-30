"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Boxes, Download, Search } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useCatalog, useSellers } from "@/lib/hooks";
import { categories } from "@/lib/seed";
import { downloadCsv, formatDate, formatMoney, titleCase } from "@/lib/utils";

type Filter = "all" | "APPROVED" | "PENDING" | "REJECTED" | "ARCHIVED";

export default function AdminProductsPage() {
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [category, setCategory] = React.useState("all");
  const [sellerId, setSellerId] = React.useState("all");

  const counts = {
    all: products.length,
    APPROVED: products.filter((product) => product.moderation === "APPROVED" && !product.archived).length,
    PENDING: products.filter((product) => product.moderation === "PENDING" && !product.archived).length,
    REJECTED: products.filter((product) => product.moderation === "REJECTED" && !product.archived).length,
    ARCHIVED: products.filter((product) => product.archived).length,
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (filter === "ARCHIVED") return product.archived;
        if (product.archived) return false;
        if (filter !== "all" && product.moderation !== filter) return false;
        return true;
      })
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => sellerId === "all" || product.sellerId === sellerId)
      .filter((product) =>
        q ? [product.name, product.subtitle, product.brand, product.category, ...product.tags].join(" ").toLowerCase().includes(q) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, filter, category, sellerId, query]);

  const exportRows = () => {
    if (filtered.length === 0) {
      toast({ title: "Nothing to export", description: "Adjust the filters first.", tone: "error" });
      return;
    }
    downloadCsv(
      "ponnaloy-catalogue.csv",
      filtered.map((product) => ({
        id: product.id,
        name: product.name,
        seller: sellers.find((seller) => seller.id === product.sellerId)?.name ?? product.sellerId,
        category: product.category,
        moderation: product.moderation,
        archived: product.archived ? "yes" : "no",
        price_usd: (product.price / 100).toFixed(2),
        stock: product.variants.reduce((sum, variant) => sum + variant.stock, product.stock),
        created: formatDate(product.createdAt),
      }))
    );
    toast({ title: "Catalogue exported", description: `${filtered.length} rows written locally.`, tone: "success" });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin · Catalogue"
        title="Every object, one index"
        description="A read-only marketplace catalogue for inspection. Sellers own listing content and stock; administrators own moderation and governance."
        meta={
          <>
            <Badge variant="success">{counts.APPROVED} live</Badge>
            <Badge variant="warning">{counts.PENDING} pending</Badge>
            <Badge variant="outline">{counts.all} records</Badge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportRows}>
              <Download className="size-4" aria-hidden="true" /> Export CSV
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/moderation">Moderation queue</Link>
            </Button>
          </>
        }
      />

      <Panel title="Catalogue index" description="Filter by moderation state, category and seller.">
        <div className="flex flex-col gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter catalogue by moderation state">
            {(["all", "APPROVED", "PENDING", "REJECTED", "ARCHIVED"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`focus-ring rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium capitalize transition-colors ${
                  filter === item ? "border-teal bg-teal text-white" : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                {item.toLowerCase()} <span className="tabular ml-1 opacity-70">{counts[item]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the catalogue…"
                aria-label="Search catalogue"
                className="h-9 pl-8 text-xs"
              />
            </div>
            <Select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 text-xs sm:w-40" aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </Select>
            <Select value={sellerId} onChange={(event) => setSellerId(event.target.value)} className="h-9 text-xs sm:w-44" aria-label="Filter by seller">
              <option value="all">All sellers</option>
              {sellers.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Boxes className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">No objects match</p>
            <p className="mt-1 text-xs text-ink-faint">Clear a filter or try another search.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <caption className="sr-only">Marketplace catalogue</caption>
              <thead>
                <tr className="border-b border-line">
                  {["Object", "Seller", "Category", "Price", "Stock", "State", ""].map((heading) => (
                    <th key={heading} scope="col" className="pb-2 pr-3 text-[0.5625rem] font-medium uppercase tracking-[0.13em] text-ink-faint">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((product) => {
                  const seller = sellers.find((item) => item.id === product.sellerId);
                  const stock = product.variants.reduce((sum, variant) => sum + variant.stock, product.stock);
                  return (
                    <tr key={product.id}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span className="size-10 shrink-0 overflow-hidden rounded-md">
                            <ProductArt art={product.art} palette={product.palette} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-ink">{product.name}</p>
                            <p className="truncate text-[0.625rem] text-ink-faint">{product.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-[0.6875rem] text-ink-soft">{seller?.name ?? product.brand}</td>
                      <td className="py-2.5 pr-3 text-[0.6875rem] text-ink-soft">{titleCase(product.category)}</td>
                      <td className="tabular py-2.5 pr-3 text-xs text-ink">{formatMoney(product.price)}</td>
                      <td className={`tabular py-2.5 pr-3 text-xs ${stock <= 6 ? "text-warning" : "text-ink"}`}>{stock}</td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          variant={product.archived ? "neutral" : product.moderation === "APPROVED" ? "success" : product.moderation === "PENDING" ? "warning" : "danger"}
                        >
                          {product.archived ? "archived" : product.moderation.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        {product.archived ? (
                          <span className="text-[0.625rem] text-ink-faint">Archived</span>
                        ) : product.moderation === "APPROVED" ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/product/${product.slug}`}>
                              Storefront <ArrowUpRight className="size-3.5" aria-hidden="true" />
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" size="sm">
                            <Link href="/admin/moderation">Review</Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[0.625rem] text-ink-faint">
          Showing {filtered.length} of {products.length} records. Catalogue edits belong to the seller workspace; admins
          moderate rather than rewrite seller content.
        </p>
      </Panel>

      <WorkspaceNote>
        This index includes pending and archived records for operations visibility. Only approved, unarchived objects are
        exposed by the customer catalogue.
      </WorkspaceNote>
    </div>
  );
}
