"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCatalog } from "@/lib/hooks";
import { addToCart, toggleCompare, useAtlasState } from "@/lib/store";
import { formatMoney } from "@/lib/utils";

export default function WishlistPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const { toast } = useToast();
  const saved = state.wishlist
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product) && product!.moderation === "APPROVED");
  const value = saved.reduce((sum, product) => sum + product.price, 0);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-8 sm:py-12">
          <p className="eyebrow">Your account</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-display-xs text-ink">Wishlist</h1>
              <p className="mt-2 text-sm text-ink-soft">
                {saved.length} {saved.length === 1 ? "object" : "objects"} saved · {formatMoney(value)} total value
              </p>
            </div>
            {saved.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Browser-persisted</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (saved.length > 4) {
                      toast({ title: "Compare up to four", description: "Select four saved objects to compare at once.", tone: "error" });
                      return;
                    }
                    for (const product of saved) toggleCompare(product.id);
                    toast({ title: "Saved objects queued for comparison", tone: "info" });
                  }}
                >
                  Compare saved
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    let added = 0;
                    for (const product of saved) {
                      const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
                      if (addToCart(product.id, variant?.id, 1).ok) added += 1;
                    }
                    toast({ title: `${added} added to bag`, description: "Demo basket · no payment taken.", tone: "success" });
                  }}
                >
                  <ShoppingBag className="size-4" aria-hidden="true" /> Add all to bag
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="atlas-container py-8 lg:py-12">
        {saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved objects yet"
            description="Use the heart on any object to keep it here. Wishlist state persists in this browser only."
            action={{ label: "Browse the catalogue", href: "/products" }}
            secondary={{ label: "View your orders", href: "/orders" }}
          />
        ) : (
          <>
            <ProductGrid products={saved} columns={4} />
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <p className="text-xs text-ink-faint">Saved items do not reserve stock. Availability is checked again at checkout.</p>
              <Link href="/products" className="editorial-link text-xs">
                Continue browsing <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
