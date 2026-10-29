/**
 * ATLAS domain model.
 *
 * These contracts intentionally mirror the verified Ponnaloy API shapes
 * (`apps/api/prisma/schema.prisma`, `apps/web/src/types/index.ts`) while
 * adding the marketplace/operations fields the new surfaces require.
 * Money is stored in minor units (cents) everywhere.
 */

export type Role = "CUSTOMER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod = "CARD" | "CASH_ON_DELIVERY" | "BANK_TRANSFER";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SellerStatus = "APPROVED" | "PENDING" | "SUSPENDED";

export type ArtKey =
  | "headphones"
  | "speaker"
  | "earbuds"
  | "monitor"
  | "lamp"
  | "floorlamp"
  | "candle"
  | "pendant"
  | "vase"
  | "throw"
  | "chair"
  | "dinnerware"
  | "journal"
  | "pen"
  | "tray"
  | "planner"
  | "tote"
  | "watch"
  | "fragrance"
  | "diffuser"
  | "salts"
  | "coffee";

export interface Palette {
  /** Image-field background */
  bg: string;
  /** Primary object colour */
  object: string;
  /** Secondary object colour */
  secondary: string;
  /** Accent detail */
  accent: string;
}

export interface Seller {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  commissionRate: number;
  status: SellerStatus;
  joinedAt: string;
  palette: Palette;
  supportEmail: string;
  fulfilmentSlaHours: number;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  art: ArtKey;
  palette: Palette;
}

export interface ProductVariant {
  id: string;
  label: string;
  option: string;
  priceDelta: number;
  stock: number;
  swatch: string;
}

export interface ProductSpec {
  label: string;
  value: string;
  group: "Dimensions" | "Materials" | "Performance" | "Care";
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  story: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  sellerId: string;
  brand: string;
  art: ArtKey;
  palette: Palette;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  variantLabel: string;
  variants: ProductVariant[];
  specs: ProductSpec[];
  highlights: string[];
  materials: string;
  care: string;
  moderation: ModerationStatus;
  moderationNote?: string;
  createdAt: string;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  bestseller: boolean;
  archived?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  location: string;
  status: "ACTIVE" | "AT_RISK" | "BLOCKED";
  segment: "New" | "Returning" | "VIP";
  orders: number;
  spend: number;
}

export interface OrderLine {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  note: string;
  actor: "CUSTOMER" | "SELLER" | "ADMIN" | "SYSTEM";
}

export interface Shipment {
  carrier: string;
  trackingNumber: string;
  status: "LABEL_CREATED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
  estimatedDelivery: string;
}

export interface ReturnRequest {
  id: string;
  reason: string;
  requestedAt: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED";
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  email: string;
  placedAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  sellerIds: string[];
  shippingAddress: string;
  timeline: OrderEvent[];
  shipment?: Shipment;
  returnRequest?: ReturnRequest;
  notes?: string;
  source: "seed" | "session";
}

export interface Collection {
  slug: string;
  name: string;
  kicker: string;
  description: string;
  story: string;
  productIds: string[];
  palette: Palette;
}

export interface Campaign {
  id: string;
  title: string;
  placement: "HOMEPAGE_HERO" | "COLLECTION_BANNER" | "PROMO_STRIP";
  status: "LIVE" | "SCHEDULED" | "ENDED";
  startsAt: string;
  endsAt: string;
  impressions: number;
  clicks: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
  audience: Role;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface AtlasState {
  version: number;
  hydrated: boolean;
  role: Role;
  sellerId: string;
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  productEdits: Record<string, Partial<Product>>;
  sellerEdits: Record<string, Partial<Seller>>;
  createdProducts: Product[];
  coupon: string | null;
  notifications: Notification[];
  recentlyViewed: string[];
  compare: string[];
}

export interface ProductFilters {
  q: string;
  categories: string[];
  sellers: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  minRating: number;
  sort: "featured" | "newest" | "price-asc" | "price-desc" | "rating";
}

export interface DashboardMetric {
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number;
  detail: string;
}

export interface SeriesPoint {
  date: string;
  value: number;
  secondary?: number;
}

export interface Repositories {
  products: Product[];
  sellers: Seller[];
  categories: Category[];
  collections: Collection[];
  orders: Order[];
  customers: Customer[];
}
