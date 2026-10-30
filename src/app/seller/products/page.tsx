"use client";

import * as React from "react";
import Link from "next/link";
import {
  Archive,
  Boxes,
  Eye,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, WorkspaceNote } from "@/components/workspace/ui";
import { useCatalog, useSellers } from "@/lib/hooks";
import { categories } from "@/lib/seed";
import { archiveProduct, createProduct, saveProduct, useAtlasState } from "@/lib/store";
import type { ModerationStatus, Product } from "@/lib/types";
import { cn, formatDate, formatMoney, titleCase } from "@/lib/utils";

type StatusFilter = "all" | ModerationStatus | "ARCHIVED";

export default function SellerProductsPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const sellers = useSellers();
  const { toast } = useToast();
  const seller = sellers.find((item) => item.id === state.sellerId);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [archiving, setArchiving] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    subtitle: "",
    price: "",
    category: "audio",
    stock: "10",
    description: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);

  const sellerProducts = React.useMemo(
    () => products.filter((product) => product.sellerId === state.sellerId),
    [products, state.sellerId]
  );
  const counts = {
    all: sellerProducts.filter((product) => !product.archived).length,
    APPROVED: sellerProducts.filter((product) => product.moderation === "APPROVED" && !product.archived).length,
    PENDING: sellerProducts.filter((product) => product.moderation === "PENDING" && !product.archived).length,
    REJECTED: sellerProducts.filter((product) => product.moderation === "REJECTED" && !product.archived).length,
    ARCHIVED: sellerProducts.filter((product) => product.archived).length,
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return sellerProducts
      .filter((product) => {
        if (status === "ARCHIVED") return product.archived;
        if (product.archived) return false;
        if (status !== "all" && product.moderation !== status) return false;
        return true;
      })
      .filter((product) =>
        q ? [product.name, product.subtitle, product.category, ...product.tags].join(" ").toLowerCase().includes(q) : true
      )
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [sellerProducts, query, status]);

  const resetForm = () => {
    setForm({ name: "", subtitle: "", price: "", category: "audio", stock: "10", description: "" });
    setFormError(null);
  };

  const submitNew = (event: React.FormEvent) => {
    event.preventDefault();
    const price = Math.round(Number(form.price) * 100);
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Enter a price greater than zero.");
      return;
    }
    const stock = Math.max(0, Math.floor(Number(form.stock)));
    const result = createProduct({
      name: form.name,
      subtitle: form.subtitle,
      price,
      category: form.category,
      sellerId: state.sellerId,
      stock: Number.isFinite(stock) ? stock : 0,
      description: form.description,
    });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setCreating(false);
    resetForm();
    toast({
      title: `${result.product.name} submitted`,
      description: "The draft is pending moderation and is not visible on the storefront yet.",
      tone: "success",
    });
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const subtitle = String(data.get("subtitle") ?? "").trim();
    const price = Math.round(Number(data.get("price")) * 100);
    const stock = Math.max(0, Math.floor(Number(data.get("stock"))));
    const variants = editing.variants.map((variant) => ({
      ...variant,
      stock: Math.max(0, Math.floor(Number(data.get(`variant-${variant.id}`) ?? variant.stock))),
    }));
    if (name.length < 2) {
      toast({ title: "Product name is required", tone: "error" });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast({ title: "Price must be greater than zero", tone: "error" });
      return;
    }
    const result = saveProduct(editing.id, { name, subtitle, price, stock, variants });
    if (!result.ok) {
      toast({ title: "Changes not saved", description: result.error, tone: "error" });
      return;
    }
    setEditing(null);
    toast({
      title: `${name} updated`,
      description: "Price and inventory changes are reflected in the demo catalogue.",
      tone: "success",
    });
  };

  const confirmArchive = () => {
    if (!archiving) return;
    archiveProduct(archiving.id);
    toast({
      title: `${archiving.name} archived`,
      description: "Archived products remain in the seller record but disappear from the storefront.",
      tone: "info",
    });
    setArchiving(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={seller?.name ?? "Seller workspace"}
        title="Catalogue"
        description="Manage the objects this studio sells. New listings enter moderation before they can appear in the storefront."
        meta={
          <>
            <Badge variant="success">{counts.APPROVED} live</Badge>
            <Badge variant="warning">{counts.PENDING} pending</Badge>
            <Badge variant="outline">{counts.ARCHIVED} archived</Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/sellers/${seller?.slug ?? ""}`}>
                <Eye className="size-4" aria-hidden="true" /> Storefront
              </Link>
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden="true" /> New listing
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Live listings", value: counts.APPROVED, detail: "Visible to customers", tone: "text-success" },
          { label: "In moderation", value: counts.PENDING, detail: "Admin review required", tone: "text-warning" },
          {
            label: "Inventory units",
            value: sellerProducts.reduce(
              (sum, product) => sum + product.variants.reduce((inner, variant) => inner + variant.stock, product.stock),
              0
            ),
            detail: "Across live and draft records",
            tone: "text-ink",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-surface-raised p-4">
            <p className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{item.label}</p>
            <p className={cn("tabular mt-1.5 font-display text-2xl leading-none", item.tone)}>{item.value}</p>
            <p className="mt-1 text-[0.625rem] text-ink-faint">{item.detail}</p>
          </div>
        ))}
      </div>

      <Panel
        title="All objects"
        description="Filter by moderation state. Each edit persists in this browser."
        action={<Badge variant="outline">{filtered.length} shown</Badge>}
      >
        <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter products by moderation status">
            {(["all", "APPROVED", "PENDING", "REJECTED", "ARCHIVED"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                aria-pressed={status === item}
                className={cn(
                  "focus-ring rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium capitalize transition-colors",
                  status === item ? "border-teal bg-teal text-white" : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                )}
              >
                {item.toLowerCase()} <span className="tabular ml-1 opacity-70">{counts[item]}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this studio…"
              aria-label="Search seller products"
              className="h-9 pl-8 text-xs sm:w-60"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Boxes className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">No objects in this view</p>
            <p className="mt-1 text-xs text-ink-faint">Create a listing or choose another moderation state.</p>
          </div>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {filtered.map((product) => {
              const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, product.stock);
              return (
                <li key={product.id} className="flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center">
                  <span className="size-14 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={product.art} palette={product.palette} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{product.name}</p>
                      <Badge
                        variant={
                          product.archived
                            ? "neutral"
                            : product.moderation === "APPROVED"
                              ? "success"
                              : product.moderation === "PENDING"
                                ? "warning"
                                : "danger"
                        }
                      >
                        {product.archived ? "Archived" : product.moderation.toLowerCase()}
                      </Badge>
                      {product.featured && <Badge variant="copper">Featured</Badge>}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[0.6875rem] text-ink-faint">{product.subtitle}</p>
                    <p className="mt-1 text-[0.625rem] text-ink-faint">
                      {titleCase(product.category)} · created {formatDate(product.createdAt)} · {product.variants.length} options
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 lg:w-64">
                    <div>
                      <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Price</p>
                      <p className="tabular mt-0.5 text-xs font-medium text-ink">{formatMoney(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Stock</p>
                      <p className={cn("tabular mt-0.5 text-xs font-medium", totalStock <= 6 ? "text-warning" : "text-ink")}>{totalStock}</p>
                    </div>
                    <div>
                      <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">Rating</p>
                      <p className="tabular mt-0.5 text-xs text-ink">{product.rating > 0 ? product.rating.toFixed(1) : "New"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setEditing(product)}>
                      <Pencil className="size-3.5" aria-hidden="true" /> Edit
                    </Button>
                    {product.archived ? (
                      <Badge variant="outline" className="self-center">Read only</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setArchiving(product)} aria-label={`Archive ${product.name}`}>
                        <Archive className="size-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <WorkspaceNote>
        New listings are submitted with moderation state <code>PENDING</code>. In this demo an administrator can approve
        them from <Link href="/admin/moderation" className="text-teal hover:underline">Admin → Moderation</Link>.
      </WorkspaceNote>

      {/* New listing */}
      <Dialog open={creating} onOpenChange={(open) => { setCreating(open); if (!open) resetForm(); }}>
        <DialogContent className="max-h-[88dvh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New listing</DialogTitle>
            <DialogDescription>
              Create a draft for {seller?.name}. It will be pending moderation and hidden from the storefront.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitNew} className="space-y-3.5" noValidate>
            <Field label="Name" htmlFor="new-product-name">
              <Input id="new-product-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </Field>
            <Field label="Subtitle" htmlFor="new-product-subtitle" optional>
              <Input id="new-product-subtitle" value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} />
            </Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Price (USD)" htmlFor="new-product-price">
                <Input id="new-product-price" type="number" min="1" step="0.01" inputMode="decimal" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              </Field>
              <Field label="Units" htmlFor="new-product-stock">
                <Input id="new-product-stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
              </Field>
            </div>
            <Field label="Category" htmlFor="new-product-category">
              <Select id="new-product-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Description" htmlFor="new-product-description" hint="A moderator will review materials and care notes before approval.">
              <Textarea id="new-product-description" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </Field>
            {formError && <p role="alert" className="text-xs text-danger">{formError}</p>}
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit">Submit for moderation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit listing */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[88dvh] max-w-xl overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Edit {editing.name}</DialogTitle>
                <DialogDescription>
                  Changes update the storefront catalogue immediately. Moderation state is not changed here.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={saveEdit} className="space-y-3.5">
                <Field label="Name" htmlFor="edit-product-name">
                  <Input id="edit-product-name" name="name" defaultValue={editing.name} required />
                </Field>
                <Field label="Subtitle" htmlFor="edit-product-subtitle" optional>
                  <Input id="edit-product-subtitle" name="subtitle" defaultValue={editing.subtitle} />
                </Field>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Price (USD)" htmlFor="edit-product-price">
                    <Input id="edit-product-price" name="price" type="number" min="1" step="0.01" defaultValue={(editing.price / 100).toFixed(2)} required />
                  </Field>
                  <Field label="Base units" htmlFor="edit-product-stock" hint="Additional to variant stock.">
                    <Input id="edit-product-stock" name="stock" type="number" min="0" step="1" defaultValue={editing.stock} />
                  </Field>
                </div>
                <fieldset className="rounded-md border border-line p-3">
                  <legend className="px-1 text-[0.6875rem] font-medium text-ink">Variant inventory</legend>
                  <div className="mt-1 space-y-2">
                    {editing.variants.map((variant) => (
                      <label key={variant.id} htmlFor={`variant-${variant.id}`} className="flex items-center gap-3 text-xs text-ink-soft">
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="size-3 rounded-full border border-line" style={{ background: variant.swatch }} aria-hidden="true" />
                          <span className="truncate">{variant.option}</span>
                        </span>
                        <Input
                          id={`variant-${variant.id}`}
                          name={`variant-${variant.id}`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={variant.stock}
                          className="h-8 w-20 text-xs"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex justify-end gap-2 border-t border-line pt-4">
                  <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive confirmation */}
      <Dialog open={Boolean(archiving)} onOpenChange={(open) => !open && setArchiving(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Archive listing</DialogTitle>
            <DialogDescription>
              {archiving?.name} will be removed from the storefront. Existing order history keeps its product reference.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setArchiving(null)}>Keep listing</Button>
            <Button variant="destructive" onClick={confirmArchive}>
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
