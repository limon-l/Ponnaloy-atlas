import { StatusBadge } from "@/components/ui/badge";
import { statusCopy } from "@/lib/catalog";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const copy = statusCopy[status];
  return <StatusBadge tone={copy.tone}>{copy.label}</StatusBadge>;
}

export function OrderStatusDescription({ status }: { status: OrderStatus }) {
  return <span className="text-xs text-ink-faint">{statusCopy[status].description}</span>;
}
