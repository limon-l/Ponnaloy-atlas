import { Suspense } from "react";
import { AdminOrdersView } from "./admin-orders-view";

export default function AdminOrdersPage() {
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
      <AdminOrdersView />
    </Suspense>
  );
}
