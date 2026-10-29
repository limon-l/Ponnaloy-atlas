import { DEMO_NOW, products, sellers } from "@/lib/seed";
import type { Order, OrderStatus, SeriesPoint } from "@/lib/types";

const MS_DAY = 86_400_000;
const REVENUE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function scopedOrders(orders: Order[], sellerId?: string): Order[] {
  if (!sellerId) return orders;
  return orders.filter((order) => order.sellerIds.includes(sellerId));
}

export function revenueOrders(orders: Order[]): Order[] {
  return orders.filter((order) => REVENUE_STATUSES.includes(order.status));
}

export function sumRevenue(orders: Order[]): number {
  return revenueOrders(orders).reduce((sum, order) => sum + order.total, 0);
}

export function averageOrderValue(orders: Order[]): number {
  const valid = revenueOrders(orders);
  if (valid.length === 0) return 0;
  return sumRevenue(valid) / valid.length;
}

export function statusBreakdown(orders: Order[]): Array<{ status: OrderStatus; count: number; value: number }> {
  const map = new Map<OrderStatus, { count: number; value: number }>();
  for (const order of orders) {
    const current = map.get(order.status) ?? { count: 0, value: 0 };
    map.set(order.status, { count: current.count + 1, value: current.value + order.total });
  }
  return [...map.entries()]
    .map(([status, value]) => ({ status, ...value }))
    .sort((a, b) => b.count - a.count);
}

export function revenueSeries(orders: Order[], days = 30): SeriesPoint[] {
  const end = new Date(DEMO_NOW);
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end.getTime() - (days - 1) * MS_DAY);
  const buckets = new Map<string, { value: number; count: number }>();

  for (let i = 0; i < days; i += 1) {
    const date = new Date(start.getTime() + i * MS_DAY);
    buckets.set(date.toISOString().slice(0, 10), { value: 0, count: 0 });
  }

  for (const order of revenueOrders(orders)) {
    const date = order.placedAt.slice(0, 10);
    const bucket = buckets.get(date);
    if (bucket) {
      bucket.value += order.total;
      bucket.count += 1;
    }
  }

  return [...buckets.entries()].map(([date, bucket]) => ({
    date,
    value: bucket.value,
    secondary: bucket.count,
  }));
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 1;
  return (current - previous) / previous;
}

export function metricDelta(orders: Order[], metric: "revenue" | "orders" | "aov"): number {
  const now = new Date(DEMO_NOW).getTime();
  const current = revenueOrders(orders).filter((order) => Date.parse(order.placedAt) > now - 14 * MS_DAY);
  const previous = revenueOrders(orders).filter(
    (order) =>
      Date.parse(order.placedAt) <= now - 14 * MS_DAY &&
      Date.parse(order.placedAt) > now - 28 * MS_DAY
  );
  if (metric === "revenue") return percentChange(sumRevenue(current), sumRevenue(previous));
  if (metric === "orders") return percentChange(current.length, previous.length);
  return percentChange(averageOrderValue(current), averageOrderValue(previous));
}

export function topProducts(orders: Order[], limit = 5) {
  const map = new Map<string, { units: number; revenue: number }>();
  for (const order of revenueOrders(orders)) {
    for (const line of order.lines) {
      const current = map.get(line.productId) ?? { units: 0, revenue: 0 };
      map.set(line.productId, {
        units: current.units + line.quantity,
        revenue: current.revenue + line.quantity * line.unitPrice,
      });
    }
  }
  return [...map.entries()]
    .map(([productId, value]) => {
      const product = products.find((item) => item.id === productId);
      return {
        productId,
        name: product?.name ?? "Unknown product",
        category: product?.category ?? "—",
        revenue: value.revenue,
        units: value.units,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function categoryPerformance(orders: Order[]) {
  const map = new Map<string, { revenue: number; units: number }>();
  for (const order of revenueOrders(orders)) {
    for (const line of order.lines) {
      const product = products.find((item) => item.id === line.productId);
      if (!product) continue;
      const current = map.get(product.category) ?? { revenue: 0, units: 0 };
      map.set(product.category, {
        revenue: current.revenue + line.quantity * line.unitPrice,
        units: current.units + line.quantity,
      });
    }
  }
  return [...map.entries()]
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function commissionFor(sellerId: string, orders: Order[]) {
  const seller = sellers.find((item) => item.id === sellerId);
  const scoped = scopedOrders(orders, sellerId);
  const revenue = sumRevenue(scoped);
  const rate = seller?.commissionRate ?? 0.12;
  const commission = Math.round(revenue * rate);
  return {
    revenue,
    rate,
    commission,
    payable: revenue - commission,
    orders: scoped.length,
  };
}

export function sellerPerformance(orders: Order[]) {
  return sellers
    .filter((seller) => seller.status !== "PENDING")
    .map((seller) => {
      const scoped = scopedOrders(orders, seller.id);
      return {
        seller,
        revenue: sumRevenue(scoped),
        orders: scoped.length,
        commission: Math.round(sumRevenue(scoped) * seller.commissionRate),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function fulfilmentQueue(orders: Order[], sellerId?: string): Order[] {
  return scopedOrders(orders, sellerId)
    .filter((order) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status))
    .sort((a, b) => Date.parse(a.placedAt) - Date.parse(b.placedAt));
}

export function lowStockProducts(threshold = 6) {
  return products
    .filter((product) => product.moderation === "APPROVED")
    .map((product) => ({
      product,
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, product.stock),
    }))
    .filter((entry) => entry.stock <= threshold)
    .sort((a, b) => a.stock - b.stock);
}
