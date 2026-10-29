import { linePrice, productById, variantFor, variantStock } from "@/lib/catalog";
import type { AtlasState, CartLine, Product } from "@/lib/types";

export const FREE_SHIPPING_THRESHOLD = 15000;
export const STANDARD_SHIPPING = 1200;
export const EXPRESS_SHIPPING = 2400;
export const TAX_RATE = 0.08;

export interface PricedCartLine extends CartLine {
  product: Product;
  variantLabel: string | null;
  unitPrice: number;
  total: number;
  available: number;
}

export interface CartTotals {
  lines: PricedCartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  coupon: string | null;
  couponLabel: string | null;
  shippingMethod: "standard" | "express";
}

export function priceCart(
  cart: CartLine[],
  products: Product[],
  options: { coupon?: string | null; shippingMethod?: "standard" | "express" } = {}
): CartTotals {
  const lines = cart.flatMap((line) => {
    const product = productById(products, line.productId);
    if (!product) return [];
    const variant = variantFor(product, line.variantId);
    const unitPrice = linePrice(product, line.variantId);
    return [
      {
        ...line,
        product,
        variantLabel: variant?.option ?? null,
        unitPrice,
        total: unitPrice * line.quantity,
        available: variant?.stock ?? product.stock,
      },
    ];
  });

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const coupon = options.coupon?.trim().toUpperCase() || null;
  const shippingMethod = options.shippingMethod ?? "standard";

  let discount = 0;
  let freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  if (coupon === "ATLAS10") discount = Math.round(subtotal * 0.1);
  if (coupon === "FREESHIP") freeShipping = true;

  const baseShipping =
    lines.length === 0 ? 0 : shippingMethod === "express" ? EXPRESS_SHIPPING : freeShipping ? 0 : STANDARD_SHIPPING;
  const shipping = baseShipping;
  const tax = Math.round(Math.max(0, subtotal - discount) * TAX_RATE);
  const total = subtotal + shipping + tax - discount;

  return {
    lines,
    count,
    subtotal,
    shipping,
    discount,
    tax,
    total,
    coupon,
    couponLabel:
      coupon === "ATLAS10" ? "10% editorial welcome" : coupon === "FREESHIP" ? "Complimentary delivery" : null,
    shippingMethod,
  };
}

export function cartFromState(state: AtlasState, products: Product[], shippingMethod?: "standard" | "express") {
  return priceCart(state.cart, products, { coupon: state.coupon, shippingMethod });
}

export function availableStock(product: Product, variantId?: string): number {
  return variantStock(product, variantId);
}
