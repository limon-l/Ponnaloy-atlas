import type {
  Customer,
  Order,
  OrderStatus,
  Product,
  ProductFilters,
  ProductVariant,
  Seller,
} from "@/lib/types";

export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const activeOrderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
];

export const statusCopy: Record<OrderStatus, { label: string; description: string; tone: string }> = {
  PENDING: { label: "Pending", description: "Awaiting payment or seller confirmation", tone: "warning" },
  CONFIRMED: { label: "Confirmed", description: "Payment captured, ready for fulfilment", tone: "info" },
  PROCESSING: { label: "Processing", description: "Seller is packing the order", tone: "info" },
  SHIPPED: { label: "Shipped", description: "Handed to the carrier", tone: "teal" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", description: "Arriving today", tone: "teal" },
  DELIVERED: { label: "Delivered", description: "Package delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", description: "Order cancelled", tone: "danger" },
  RETURNED: { label: "Returned", description: "Return received", tone: "warning" },
  REFUNDED: { label: "Refunded", description: "Refund issued", tone: "neutral" },
};

export function lineTotal(line: { quantity: number; unitPrice: number }): number {
  return line.quantity * line.unitPrice;
}

export function orderSubtotal(order: Order): number {
  return order.lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function productById(products: Product[], id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function variantFor(product: Product, variantId?: string): ProductVariant | undefined {
  return product.variants.find((variant) => variant.id === variantId);
}

export function variantStock(product: Product, variantId?: string): number {
  if (variantId) return variantFor(product, variantId)?.stock ?? 0;
  return product.variants.reduce((sum, variant) => sum + variant.stock, product.stock);
}

export function linePrice(product: Product, variantId?: string): number {
  return product.price + (variantFor(product, variantId)?.priceDelta ?? 0);
}

export function effectivePrice(product: Product, variantId?: string): number {
  return linePrice(product, variantId);
}

export function discountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function inStock(product: Product): boolean {
  return variantStock(product) > 0;
}

export function applyProductEdits(
  products: Product[],
  edits: Record<string, Partial<Product>>
): Product[] {
  if (Object.keys(edits).length === 0) return products;
  return products.map((product) => ({ ...product, ...(edits[product.id] ?? {}) }));
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.q.trim().toLowerCase();
  const filtered = products.filter((product) => {
    if (product.moderation !== "APPROVED") return false;
    if (query) {
      const haystack = [
        product.name,
        product.subtitle,
        product.brand,
        product.category,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    if (filters.sellers.length > 0 && !filters.sellers.includes(product.sellerId)) {
      return false;
    }
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    if (filters.inStockOnly && !inStock(product)) return false;
    if (filters.minRating > 0 && product.rating < filters.minRating) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "newest":
      sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    default:
      sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestseller) - Number(a.bestseller) ||
          b.rating - a.rating
      );
  }
  return sorted;
}

export function relatedProducts(products: Product[], product: Product, limit = 4): Product[] {
  return products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.moderation === "APPROVED" &&
        (item.category === product.category || item.sellerId === product.sellerId)
    )
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, limit);
}

export function searchProducts(products: Product[], query: string, limit = 6): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products
    .filter((product) => product.moderation === "APPROVED")
    .map((product) => {
      const name = product.name.toLowerCase();
      const tags = product.tags.join(" ").toLowerCase();
      const score = name.startsWith(q) ? 4 : name.includes(q) ? 3 : tags.includes(q) ? 2 : product.brand.toLowerCase().includes(q) ? 1 : 0;
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function parseFilters(searchParams: URLSearchParams): ProductFilters {
  const numberOrUndefined = (key: string) => {
    const value = searchParams.get(key);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const list = (key: string) =>
    (searchParams.get(key) ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  const sort = searchParams.get("sort");
  const validSort = ["featured", "newest", "price-asc", "price-desc", "rating"] as const;
  return {
    q: searchParams.get("q") ?? "",
    categories: list("category"),
    sellers: list("seller"),
    minPrice: numberOrUndefined("min"),
    maxPrice: numberOrUndefined("max"),
    inStockOnly: searchParams.get("stock") === "in",
    minRating: numberOrUndefined("rating") ?? 0,
    sort: validSort.includes(sort as (typeof validSort)[number])
      ? (sort as ProductFilters["sort"])
      : "featured",
  };
}

export function toSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.sellers.length) params.set("seller", filters.sellers.join(","));
  if (filters.minPrice !== undefined) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("max", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("stock", "in");
  if (filters.minRating > 0) params.set("rating", String(filters.minRating));
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params;
}

export function sellerName(sellers: Seller[], sellerId: string): string {
  return sellers.find((seller) => seller.id === sellerId)?.name ?? "Independent seller";
}

export function customerInitials(customer: Customer): string {
  return customer.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
}
