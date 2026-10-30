import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsView } from "./products-view";

export const metadata: Metadata = {
  title: "All objects",
  description:
    "Browse the Ponnaloy Atlas catalogue by category, seller, price and rating. Compare up to four objects side by side.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="atlas-container py-16">
          <Skeleton className="h-10 w-64" />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5]" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsView />
    </Suspense>
  );
}
