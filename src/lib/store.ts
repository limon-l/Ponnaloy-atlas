"use client";

import { useSyncExternalStore } from "react";
import { priceCart } from "@/lib/cart";
import { applyProductEdits, linePrice, productById, variantFor } from "@/lib/catalog";
import { initialAtlasState, products as seedProducts, sellers as seedSellers } from "@/lib/seed";
import type {
  AtlasState,
  AuditEntry,
  ModerationStatus,
  Order,
  OrderStatus,
  PaymentMethod,
  PlatformSettings,
  Product,
  Role,
  Seller,
} from "@/lib/types";

export const STORAGE_KEY = "ponnaloy.atlas.state.v1";
const MAX_COMPARE = 4;

type StoreResult = { ok: true } | { ok: false; error: string };
type OrderResult = { ok: true; order: Order } | { ok: false; error: string };

function auditEntry(
  action: string,
  target: string,
  severity: AuditEntry["severity"] = "INFO",
  actor = "Atlas Admin (demo)"
): AuditEntry {
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actor,
    action,
    target,
    severity,
  };
}

function withAudit(current: AtlasState, entry: AuditEntry): AtlasState {
  return { ...current, audit: [entry, ...current.audit].slice(0, 80) };
}

let state: AtlasState = initialAtlasState;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: AtlasState) {
  if (typeof window === "undefined") return;
  try {
    const serializable: Partial<AtlasState> = { ...next };
    delete serializable.hydrated;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage can be unavailable in private modes; demo continues in memory.
  }
}

/**
 * The single resolved catalogue: seeded products, created listings and any
 * seller/admin edits. Cart, checkout and comparison must all price from this
 * view so availability cannot disagree with the storefront.
 */
function resolvedCatalogue(current: AtlasState): Product[] {
  return applyProductEdits([...current.createdProducts, ...seedProducts], current.productEdits);
}

function setState(updater: (current: AtlasState) => AtlasState) {
  state = { ...updater(state), hydrated: state.hydrated };
  persist(state);
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): AtlasState {
  return state;
}

export function getServerSnapshot(): AtlasState {
  return initialAtlasState;
}

export function hydrateStore() {
  if (typeof window === "undefined" || state.hydrated) return;
  let next: AtlasState = { ...initialAtlasState, hydrated: true };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AtlasState>;
      if (parsed.version === initialAtlasState.version) {
        next = {
          ...initialAtlasState,
          ...parsed,
          hydrated: true,
        };
      }
    }
  } catch {
    next = { ...initialAtlasState, hydrated: true };
  }
  state = next;
  emit();
}

export function useAtlasState(): AtlasState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function resetDemo() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  state = { ...initialAtlasState, hydrated: true };
  emit();
}

/* ------------------------------------------------------------------ */
/* Session & role                                                      */
/* ------------------------------------------------------------------ */

export function setRole(role: Role) {
  setState((current) => ({ ...current, role }));
}

export function setSeller(sellerId: string) {
  setState((current) => ({ ...current, sellerId }));
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export function addToCart(productId: string, variantId?: string, quantity = 1): StoreResult {
  const product = productById(resolvedCatalogue(state), productId);
  if (!product) return { ok: false, error: "Product not found." };
  const variant = variantId ? variantFor(product, variantId) : product.variants[0];
  const available = variant?.stock ?? product.stock;
  if (available <= 0) return { ok: false, error: "This option is sold out." };

  const resolvedVariantId = variant?.id;
  const existing = state.cart.find(
    (line) => line.productId === productId && line.variantId === resolvedVariantId
  );
  const desired = (existing?.quantity ?? 0) + quantity;
  const nextQuantity = Math.min(available, desired);
  const limited = nextQuantity < desired;

  setState((current) => {
    const cart = existing
      ? current.cart.map((line) =>
          line.productId === productId && line.variantId === resolvedVariantId
            ? { ...line, quantity: nextQuantity }
            : line
        )
      : [
          ...current.cart,
          {
            productId,
            ...(resolvedVariantId ? { variantId: resolvedVariantId } : {}),
            quantity: nextQuantity,
          },
        ];
    return { ...current, cart };
  });
  return limited
    ? { ok: false, error: `Only ${available} available; your bag was updated to the maximum.` }
    : { ok: true };
}

export function updateCartQuantity(productId: string, variantId: string | undefined, quantity: number) {
  const product = productById(resolvedCatalogue(state), productId);
  const available = product
    ? variantId
      ? variantFor(product, variantId)?.stock ?? product.stock
      : product.stock + product.variants.reduce((sum, variant) => sum + variant.stock, 0)
    : 0;
  setState((current) => ({
    ...current,
    cart:
      quantity <= 0
        ? current.cart.filter((line) => !(line.productId === productId && line.variantId === variantId))
        : current.cart.map((line) =>
            line.productId === productId && line.variantId === variantId
              ? { ...line, quantity: Math.min(Math.max(1, quantity), Math.max(1, available)) }
              : line
          ),
  }));
}

export function removeFromCart(productId: string, variantId?: string) {
  setState((current) => ({
    ...current,
    cart: current.cart.filter((line) => !(line.productId === productId && line.variantId === variantId)),
  }));
}

export function clearCart() {
  setState((current) => ({ ...current, cart: [], coupon: null }));
}

export function applyCoupon(code: string): StoreResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    setState((current) => ({ ...current, coupon: null }));
    return { ok: true };
  }
  if (normalized !== "ATLAS10" && normalized !== "FREESHIP") {
    return { ok: false, error: "That code is not recognised. Try ATLAS10." };
  }
  setState((current) => ({ ...current, coupon: normalized }));
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Wishlist, recently viewed & compare                                 */
/* ------------------------------------------------------------------ */

export function toggleWishlist(productId: string): StoreResult {
  setState((current) => ({
    ...current,
    wishlist: current.wishlist.includes(productId)
      ? current.wishlist.filter((id) => id !== productId)
      : [...current.wishlist, productId],
  }));
  return { ok: true };
}

export function recordView(productId: string) {
  setState((current) => ({
    ...current,
    recentlyViewed: [productId, ...current.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
  }));
}

export function toggleCompare(productId: string): StoreResult {
  if (state.compare.includes(productId)) {
    setState((current) => ({ ...current, compare: current.compare.filter((id) => id !== productId) }));
    return { ok: true };
  }
  if (state.compare.length >= MAX_COMPARE) {
    return { ok: false, error: `Compare up to ${MAX_COMPARE} products at once.` };
  }
  setState((current) => ({ ...current, compare: [...current.compare, productId] }));
  return { ok: true };
}

export function setCompare(ids: string[]) {
  setState((current) => ({ ...current, compare: ids.slice(0, MAX_COMPARE) }));
}

export function reorderCompare(from: number, to: number) {
  setState((current) => {
    const next = [...current.compare];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    return { ...current, compare: next };
  });
}

export function clearCompare() {
  setState((current) => ({ ...current, compare: [] }));
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export interface CheckoutInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  shippingMethod: "standard" | "express";
  notes?: string;
}

export function placeOrder(input: CheckoutInput): OrderResult {
  if (state.cart.length === 0) return { ok: false, error: "Your cart is empty." };
  const totals = priceCart(state.cart, resolvedCatalogue(state), {
    coupon: state.coupon,
    shippingMethod: input.shippingMethod,
  });
  if (totals.lines.length === 0) return { ok: false, error: "Your cart could not be priced." };

  const soldOut = totals.lines.find((line) => line.quantity > line.available);
  if (soldOut) {
    return { ok: false, error: `${soldOut.product.name} no longer has enough stock.` };
  }

  const now = new Date().toISOString();
  const sequence = 1100 + state.orders.filter((order) => order.source === "session").length;
  const number = `ATL-${sequence}`;
  const paymentStatus =
    input.paymentMethod === "CARD" ? "PAID" : input.paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "PENDING";
  const status: OrderStatus = input.paymentMethod === "BANK_TRANSFER" ? "PENDING" : "CONFIRMED";
  const sellerIds = Array.from(new Set(totals.lines.map((line) => line.product.sellerId)));
  const order: Order = {
    id: `ord-${number}`,
    number,
    customerId: "c-1",
    customerName: input.name,
    email: input.email,
    placedAt: now,
    status,
    paymentStatus,
    paymentMethod: input.paymentMethod,
    lines: totals.lines.map((line) => ({
      productId: line.productId,
      ...(line.variantId ? { variantId: line.variantId } : {}),
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
    sellerIds,
    shippingAddress: `${input.address}, ${input.city} ${input.postalCode}, ${input.country}`,
    timeline: [
      {
        status: "PENDING",
        at: now,
        note: "Order placed in the ATLAS demo. No real payment was taken.",
        actor: "CUSTOMER",
      },
      ...(status === "CONFIRMED"
        ? [
            {
              status: "CONFIRMED" as OrderStatus,
              at: new Date(Date.parse(now) + 60_000).toISOString(),
              note:
                input.paymentMethod === "CARD"
                  ? "Simulated card authorisation captured."
                  : "Cash on delivery selected; payment due on delivery.",
              actor: "SYSTEM" as const,
            },
          ]
        : []),
    ],
    ...(input.notes ? { notes: input.notes } : {}),
    source: "session",
  };

  const sellerNames = sellerIds
    .map((id) => totals.lines.find((line) => line.product.sellerId === id)?.product.brand ?? "Seller")
    .join(", ");

  setState((current) => ({
    ...current,
    cart: [],
    coupon: null,
    orders: [order, ...current.orders],
    notifications: [
      {
        id: `notif-order-${number}`,
        title: `Order ${number} confirmed`,
        body: `${totals.count} ${totals.count === 1 ? "item" : "items"} from ${sellerNames}. Demo payment only.`,
        at: now,
        read: false,
        href: `/orders/${order.id}`,
        audience: "CUSTOMER",
      },
      {
        id: `notif-seller-${number}`,
        title: `New order ${number}`,
        body: `${input.name} placed an order. Review it in your fulfilment queue.`,
        at: now,
        read: false,
        href: "/seller/orders",
        audience: "SELLER",
      },
      {
        id: `notif-admin-${number}`,
        title: `Order ${number} created`,
        body: `${input.name} · ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.total / 100)} · demo ledger.`,
        at: now,
        read: false,
        href: "/admin/orders",
        audience: "ADMIN",
      },
      ...current.notifications,
    ],
    audit: [
      auditEntry(
        "Created demo order",
        `${number} · ${order.lines.reduce((sum, line) => sum + line.quantity, 0)} items · ${order.total} cents`,
        "INFO",
        "Checkout (demo)"
      ),
      ...current.audit,
    ].slice(0, 80),
  }));

  return { ok: true, order };
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string,
  actor: Order["timeline"][number]["actor"] = "SELLER"
): StoreResult {
  setState((current) => {
    const targetOrder = current.orders.find((order) => order.id === orderId);
    const next: AtlasState = {
      ...current,
      orders: current.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              paymentStatus:
                status === "REFUNDED" ? "REFUNDED" : status === "CANCELLED" ? "REFUNDED" : order.paymentStatus,
              timeline: [
                ...order.timeline,
                { status, at: new Date().toISOString(), note, actor },
              ],
              ...(status === "DELIVERED" && order.shipment
                ? { shipment: { ...order.shipment, status: "DELIVERED" as const } }
                : {}),
              ...(status === "SHIPPED" && order.shipment
                ? { shipment: { ...order.shipment, status: "IN_TRANSIT" as const } }
                : {}),
            }
          : order
      ),
    };
    return targetOrder
      ? withAudit(
          next,
          auditEntry(
            "Updated order status",
            `${targetOrder.number} → ${status.toLowerCase().replaceAll("_", " ")}`,
            status === "CANCELLED" || status === "REFUNDED" ? "WARNING" : "INFO",
            actor === "SELLER" ? "Seller (demo)" : actor === "ADMIN" ? "Atlas Admin (demo)" : actor
          )
        )
      : next;
  });
  return { ok: true };
}

export function addShipment(orderId: string, carrier: string, trackingNumber: string): StoreResult {
  if (!carrier.trim() || !trackingNumber.trim()) {
    return { ok: false, error: "Carrier and tracking number are required." };
  }
  setState((current) => {
    const targetOrder = current.orders.find((order) => order.id === orderId);
    const next: AtlasState = {
      ...current,
      orders: current.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              shipment: {
                carrier: carrier.trim(),
                trackingNumber: trackingNumber.trim(),
                status: "LABEL_CREATED",
                estimatedDelivery: new Date(Date.now() + 3 * 86_400_000).toISOString(),
              },
              status: order.status === "PROCESSING" ? "SHIPPED" : order.status,
              timeline: [
                ...order.timeline,
                {
                  status: order.status === "PROCESSING" ? "SHIPPED" : order.status,
                  at: new Date().toISOString(),
                  note: `Shipment created with ${carrier.trim()} (${trackingNumber.trim()}).`,
                  actor: "SELLER",
                },
              ],
            }
          : order
      ),
    };
    return targetOrder
      ? withAudit(
          next,
          auditEntry(
            "Created shipment label",
            `${targetOrder.number} · ${carrier.trim()} · ${trackingNumber.trim()}`,
            "INFO",
            "Seller (demo)"
          )
        )
      : next;
  });
  return { ok: true };
}

export function requestReturn(orderId: string, reason: string): StoreResult {
  if (!state.settings.allowReturns) {
    return { ok: false, error: "Returns are currently disabled in platform settings." };
  }
  if (reason.trim().length < 8) return { ok: false, error: "Please describe the return in at least 8 characters." };
  setState((current) => {
    const targetOrder = current.orders.find((order) => order.id === orderId);
    const next: AtlasState = {
      ...current,
      orders: current.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              returnRequest: {
                id: `ret-${order.number}`,
                reason: reason.trim(),
                requestedAt: new Date().toISOString(),
                status: "REQUESTED",
              },
              timeline: [
                ...order.timeline,
                {
                  status: order.status,
                  at: new Date().toISOString(),
                  note: `Return requested: ${reason.trim()}`,
                  actor: "CUSTOMER",
                },
              ],
            }
          : order
      ),
    };
    return targetOrder
      ? withAudit(
          next,
          auditEntry("Requested return", `${targetOrder.number} · ${reason.trim().slice(0, 90)}`, "WARNING", "Customer (demo)")
        )
      : next;
  });
  return { ok: true };
}

export function resolveReturn(orderId: string, approve: boolean): StoreResult {
  setState((current) => {
    const targetOrder = current.orders.find((order) => order.id === orderId);
    const next: AtlasState = {
      ...current,
      orders: current.orders.map((order) =>
        order.id === orderId && order.returnRequest
          ? {
              ...order,
              returnRequest: { ...order.returnRequest, status: approve ? "APPROVED" : "REJECTED" },
              status: approve ? "REFUNDED" : order.status,
              paymentStatus: approve ? "REFUNDED" : order.paymentStatus,
              timeline: [
                ...order.timeline,
                {
                  status: approve ? "REFUNDED" : order.status,
                  at: new Date().toISOString(),
                  note: approve ? "Return approved; demo refund issued." : "Return request declined.",
                  actor: "ADMIN",
                },
              ],
            }
          : order
    ),
    };
    return targetOrder
      ? withAudit(
          next,
          auditEntry(
            approve ? "Approved return and issued demo refund" : "Declined return request",
            targetOrder.number,
            approve ? "INFO" : "WARNING",
            "Atlas Admin (demo)"
          )
        )
      : next;
  });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Catalog operations (seller + admin)                                 */
/* ------------------------------------------------------------------ */

export function updateStock(productId: string, variantId: string | undefined, stock: number): StoreResult {
  if (stock < 0 || !Number.isFinite(stock)) return { ok: false, error: "Stock must be zero or greater." };
  setState((current) => {
    const product = productById([...seedProducts, ...current.createdProducts], productId);
    if (!product) return current;
    if (variantId) {
      return {
        ...current,
        productEdits: {
          ...current.productEdits,
          [productId]: {
            ...current.productEdits[productId],
            variants: product.variants.map((variant) =>
              variant.id === variantId ? { ...variant, stock } : variant
            ),
          },
        },
      };
    }
    return {
      ...current,
      productEdits: { ...current.productEdits, [productId]: { ...current.productEdits[productId], stock } },
    };
  });
  return { ok: true };
}

export function saveProduct(productId: string, patch: Partial<Product>): StoreResult {
  if (patch.name !== undefined && patch.name.trim().length < 2) {
    return { ok: false, error: "Product name is required." };
  }
  if (patch.price !== undefined && patch.price < 1) {
    return { ok: false, error: "Price must be greater than zero." };
  }
  setState((current) => {
    if (current.createdProducts.some((product) => product.id === productId)) {
      return {
        ...current,
        createdProducts: current.createdProducts.map((product) =>
          product.id === productId ? { ...product, ...patch } : product
        ),
      };
    }
    return {
      ...current,
      productEdits: {
        ...current.productEdits,
        [productId]: { ...current.productEdits[productId], ...patch },
      },
    };
  });
  return { ok: true };
}

export function createProduct(input: {
  name: string;
  subtitle: string;
  price: number;
  category: string;
  sellerId: string;
  stock: number;
  description: string;
}): { ok: true; product: Product } | { ok: false; error: string } {
  if (!input.name.trim()) return { ok: false, error: "Product name is required." };
  if (input.price <= 0) return { ok: false, error: "Price must be greater than zero." };
  const reviewRequired = state.settings.requireListingReview;
  const id = `p-session-${Date.now()}`;
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const product: Product = {
    id,
    slug,
    name: input.name.trim(),
    subtitle: input.subtitle.trim() || "New seller listing",
    description: input.description.trim() || "Draft listing created in the ATLAS demo workspace.",
    story: "Created in the ATLAS demo. Changes persist in this browser only.",
    price: input.price,
    category: input.category,
    sellerId: input.sellerId,
    brand: "Independent",
    art: "journal",
    palette: { bg: "#E8DFD2", object: "#3C5B4C", secondary: "#1D2E28", accent: "#B4633E" },
    tags: ["draft"],
    rating: 0,
    reviewCount: 0,
    stock: 0,
    variantLabel: "Edition",
    variants: [
      {
        id: `v-${id}-default`,
        label: "Edition",
        option: "Standard",
        priceDelta: 0,
        stock: Math.max(0, input.stock),
        swatch: "#3C5B4C",
      },
    ],
    specs: [
      { label: "Seller", value: input.sellerId, group: "Materials" },
      { label: "Made to order", value: "Demo listing", group: "Care" },
    ],
    highlights: [reviewRequired ? "Draft listing" : "Approved listing", reviewRequired ? "Awaiting moderation" : "Demo policy"],
    materials: "To be confirmed",
    care: "To be confirmed",
    moderation: reviewRequired ? "PENDING" : "APPROVED",
    createdAt: new Date().toISOString(),
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
  };
  setState((current) =>
    withAudit(
      { ...current, createdProducts: [product, ...current.createdProducts] },
      auditEntry(
        reviewRequired ? "Submitted listing for moderation" : "Published listing without review",
        `${product.name} · ${input.sellerId}`,
        reviewRequired ? "INFO" : "WARNING",
        "Seller (demo)"
      )
    )
  );
  return { ok: true, product };
}

export function archiveProduct(productId: string): StoreResult {
  setState((current) => ({
    ...current,
    createdProducts: current.createdProducts.map((product) =>
      product.id === productId ? { ...product, archived: true } : product
    ),
    productEdits: {
      ...current.productEdits,
      [productId]: { ...current.productEdits[productId], archived: true },
    },
  }));
  return { ok: true };
}

export function moderateProduct(
  productId: string,
  moderation: ModerationStatus,
  note?: string
): StoreResult {
  setState((current) => {
    const product = [...current.createdProducts, ...seedProducts].find((item) => item.id === productId);
    const next: AtlasState = {
      ...current,
      createdProducts: current.createdProducts.map((item) =>
        item.id === productId ? { ...item, moderation, moderationNote: note } : item
      ),
      productEdits: {
        ...current.productEdits,
        [productId]: {
          ...current.productEdits[productId],
          moderation,
          ...(note ? { moderationNote: note } : {}),
        },
      },
    };
    return withAudit(
      next,
      auditEntry(
        moderation === "APPROVED" ? "Approved listing" : moderation === "REJECTED" ? "Rejected listing" : "Returned listing to moderation",
        `${product?.name ?? productId}${note ? ` · ${note.slice(0, 90)}` : ""}`,
        moderation === "REJECTED" ? "WARNING" : "INFO"
      )
    );
  });
  return { ok: true };
}

export function updateSeller(sellerId: string, patch: Partial<Seller>): StoreResult {
  if (patch.commissionRate !== undefined && (patch.commissionRate < 0 || patch.commissionRate > 0.5)) {
    return { ok: false, error: "Commission must be between 0% and 50%." };
  }
  setState((current) => {
    const seller = seedSellers.find((item) => item.id === sellerId);
    const next: AtlasState = {
      ...current,
      sellerEdits: { ...current.sellerEdits, [sellerId]: { ...current.sellerEdits[sellerId], ...patch } },
    };
    const changes = [
      patch.commissionRate !== undefined ? `commission ${Math.round(patch.commissionRate * 100)}%` : null,
      patch.status ? `status ${patch.status.toLowerCase()}` : null,
      patch.name ? "profile details" : null,
      patch.fulfilmentSlaHours !== undefined ? `SLA ${patch.fulfilmentSlaHours}h` : null,
    ].filter(Boolean);
    return withAudit(
      next,
      auditEntry(
        patch.commissionRate !== undefined || patch.status ? "Updated seller governance" : "Updated seller profile",
        `${seller?.name ?? sellerId}${changes.length ? ` · ${changes.join(", ")}` : ""}`,
        patch.status === "SUSPENDED" ? "CRITICAL" : "INFO"
      )
    );
  });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Audit                                                               */
/* ------------------------------------------------------------------ */

/**
 * Records a demo-local audit event. Production audit writes belong on the
 * server; this exists so admin settings and governance actions are visible in
 * the same trail as orders, returns and moderation.
 */
export function logAudit(
  action: string,
  target: string,
  severity: AuditEntry["severity"] = "INFO",
  actor = "Atlas Admin (demo)"
) {
  setState((current) => withAudit(current, auditEntry(action, target, severity, actor)));
}

/* ------------------------------------------------------------------ */
/* Platform settings                                                   */
/* ------------------------------------------------------------------ */

export function updatePlatformSettings(patch: Partial<PlatformSettings>): StoreResult {
  if (
    patch.lowStockThreshold !== undefined &&
    (!Number.isFinite(patch.lowStockThreshold) || patch.lowStockThreshold < 0 || patch.lowStockThreshold > 100)
  ) {
    return { ok: false, error: "Low-stock threshold must be between 0 and 100 units." };
  }
  setState((current) => {
    const changes = [
      patch.lowStockThreshold !== undefined ? `low stock at ${patch.lowStockThreshold} units` : null,
      patch.allowReturns !== undefined ? `returns ${patch.allowReturns ? "enabled" : "disabled"}` : null,
      patch.requireListingReview !== undefined
        ? `listing review ${patch.requireListingReview ? "required" : "waived"}`
        : null,
    ].filter(Boolean);
    return withAudit(
      { ...current, settings: { ...current.settings, ...patch } },
      auditEntry("Updated platform settings", changes.join(" · ") || "No effective change", "WARNING")
    );
  });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function markNotificationRead(id: string) {
  setState((current) => ({
    ...current,
    notifications: current.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    ),
  }));
}

export function markAllNotificationsRead(role: Role) {
  setState((current) => ({
    ...current,
    notifications: current.notifications.map((notification) =>
      notification.audience === role ? { ...notification, read: true } : notification
    ),
  }));
}

/** Adds a seller-scoped synthetic notification (used by fulfilment actions). */
export function notifySeller(title: string, body: string, href: string) {
  setState((current) => ({
    ...current,
    notifications: [
      {
        id: `notif-${Date.now()}`,
        title,
        body,
        at: new Date().toISOString(),
        read: false,
        href,
        audience: "SELLER",
      },
      ...current.notifications,
    ],
  }));
}

export function cartLinePrice(productId: string, variantId?: string): number {
  const product = productById(resolvedCatalogue(state), productId);
  if (!product) return 0;
  return linePrice(product, variantId);
}

export const COMPARE_LIMIT = MAX_COMPARE;
