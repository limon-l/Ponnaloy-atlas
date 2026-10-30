import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetail } from "./order-detail";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="atlas-container py-16">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
      }
    >
      <OrderDetail id={id} />
    </Suspense>
  );
}
