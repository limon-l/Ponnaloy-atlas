import { Suspense } from "react";
import { SellerOrdersView } from "./seller-orders-view";

export default function SellerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4" aria-busy="true">
          <div className="h-8 w-64 rounded skeleton-shimmer" />
          <div className="h-16 rounded-xl skeleton-shimmer" />
          <div className="h-96 rounded-xl skeleton-shimmer" />
        </div>
      }
    >
      <SellerOrdersView />
    </Suspense>
  );
}
