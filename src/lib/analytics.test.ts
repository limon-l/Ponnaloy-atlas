import { describe, expect, it } from "vitest";
import {
  averageOrderValue,
  commissionFor,
  metricDelta,
  percentChange,
  revenueOrders,
  revenueSeries,
  sellerPerformance,
  statusBreakdown,
  sumRevenue,
} from "@/lib/analytics";
import { orders, sellers } from "@/lib/seed";

describe("analytics", () => {
  it("excludes cancelled, returned and refunded orders from revenue", () => {
    const counted = revenueOrders(orders);
    expect(counted.every((order) => !["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status))).toBe(true);
    expect(sumRevenue(orders)).toBe(counted.reduce((sum, order) => sum + order.total, 0));
    expect(sumRevenue(orders)).toBeGreaterThan(0);
  });

  it("computes average order value only over revenue-bearing orders", () => {
    const counted = revenueOrders(orders);
    expect(averageOrderValue(orders)).toBeCloseTo(sumRevenue(orders) / counted.length, 6);
    expect(averageOrderValue([])).toBe(0);
  });

  it("counts every status in the breakdown", () => {
    const breakdown = statusBreakdown(orders);
    expect(breakdown.reduce((sum, entry) => sum + entry.count, 0)).toBe(orders.length);
    expect(breakdown.every((entry) => entry.value >= 0)).toBe(true);
  });

  it("builds a fixed-length daily revenue series", () => {
    const series = revenueSeries(orders, 14);
    expect(series).toHaveLength(14);
    expect(series.every((point) => point.value >= 0)).toBe(true);
    expect(series.at(-1)?.date).toBe("2026-10-29");
  });

  it("calculates commission from the seller's current rate", () => {
    const seller = sellers[0]!;
    const result = commissionFor(seller.id, orders);
    expect(result.rate).toBe(seller.commissionRate);
    expect(result.commission).toBe(Math.round(result.revenue * seller.commissionRate));
    expect(result.payable).toBe(result.revenue - result.commission);
  });

  it("sorts seller performance by revenue and omits pending applications", () => {
    const performance = sellerPerformance(orders);
    expect(performance.length).toBeGreaterThan(0);
    expect(performance.every((entry) => entry.seller.status !== "PENDING")).toBe(true);
    for (let index = 1; index < performance.length; index += 1) {
      expect(performance[index - 1]!.revenue).toBeGreaterThanOrEqual(performance[index]!.revenue);
    }
  });

  it("handles percentage change with a zero denominator", () => {
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(10, 0)).toBe(1);
    expect(percentChange(150, 100)).toBeCloseTo(0.5, 6);
  });

  it("reports a delta for each metric", () => {
    for (const metric of ["revenue", "orders", "aov"] as const) {
      const delta = metricDelta(orders, metric);
      expect(Number.isFinite(delta)).toBe(true);
    }
  });
});
