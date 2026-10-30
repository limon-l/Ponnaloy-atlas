"use client";

import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard, type ProductCardVariant } from "@/components/product-card";
import { useSellers } from "@/lib/hooks";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = 4,
  emptyAction,
  variant,
}: {
  products: Product[];
  className?: string;
  columns?: 2 | 3 | 4;
  emptyAction?: { label: string; href: string };
  variant?: ProductCardVariant;
}) {
  const sellers = useSellers();

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Nothing matches those filters"
        description="Try widening the price range, clearing a category, or searching for a different material."
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4",
        columns === 4 && "lg:grid-cols-3 xl:grid-cols-4",
        columns === 3 && "lg:grid-cols-3",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          sellerName={sellers.find((seller) => seller.id === product.sellerId)?.name}
        />
      ))}
    </div>
  );
}
