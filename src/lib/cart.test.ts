import { describe, expect, it } from "vitest";
import {
  EXPRESS_SHIPPING,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  TAX_RATE,
  priceCart,
} from "@/lib/cart";
import { linePrice, productById } from "@/lib/catalog";
import { products } from "@/lib/seed";

const aria = productById(products, "p-aria")!;
const salts = productById(products, "p-salts")!;
const ariaVariant = aria.variants[0]!;

describe("priceCart", () => {
  it("returns an empty, zeroed cart for no lines", () => {
    const totals = priceCart([], products);
    expect(totals.lines).toEqual([]);
    expect(totals.count).toBe(0);
    expect(totals.subtotal).toBe(0);
    expect(totals.shipping).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(0);
  });

  it("prices a variant line and applies free shipping above the threshold", () => {
    const unit = linePrice(aria, ariaVariant.id);
    const totals = priceCart([{ productId: aria.id, variantId: ariaVariant.id, quantity: 1 }], products);

    expect(unit).toBe(aria.price + ariaVariant.priceDelta);
    expect(totals.subtotal).toBe(unit);
    expect(totals.subtotal).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD);
    expect(totals.shipping).toBe(0);
    expect(totals.tax).toBe(Math.round(unit * TAX_RATE));
    expect(totals.total).toBe(unit + totals.tax);
  });

  it("charges standard shipping below the free threshold", () => {
    const totals = priceCart([{ productId: salts.id, quantity: 1 }], products);
    expect(totals.shipping).toBe(STANDARD_SHIPPING);
    expect(totals.total).toBe(totals.subtotal + STANDARD_SHIPPING + totals.tax);
  });

  it("supports express shipping", () => {
    const totals = priceCart([{ productId: salts.id, quantity: 1 }], products, { shippingMethod: "express" });
    expect(totals.shipping).toBe(EXPRESS_SHIPPING);
  });

  it("applies ATLAS10 before tax", () => {
    const totals = priceCart([{ productId: aria.id, variantId: ariaVariant.id, quantity: 1 }], products, {
      coupon: "atlas10",
    });
    const expectedDiscount = Math.round(totals.subtotal * 0.1);
    expect(totals.coupon).toBe("ATLAS10");
    expect(totals.discount).toBe(expectedDiscount);
    expect(totals.tax).toBe(Math.round((totals.subtotal - expectedDiscount) * TAX_RATE));
    expect(totals.total).toBe(totals.subtotal + totals.shipping + totals.tax - expectedDiscount);
  });

  it("makes delivery complimentary with FREESHIP even under the threshold", () => {
    const totals = priceCart([{ productId: salts.id, quantity: 1 }], products, { coupon: "FREESHIP" });
    expect(totals.subtotal).toBeLessThan(FREE_SHIPPING_THRESHOLD);
    expect(totals.shipping).toBe(0);
    expect(totals.couponLabel).toBe("Complimentary delivery");
  });

  it("drops unknown products instead of inventing a price", () => {
    const totals = priceCart([{ productId: "p-does-not-exist", quantity: 2 }], products);
    expect(totals.lines).toHaveLength(0);
    expect(totals.total).toBe(0);
  });

  it("counts quantity rather than line records", () => {
    const totals = priceCart(
      [
        { productId: salts.id, quantity: 2 },
        { productId: aria.id, variantId: ariaVariant.id, quantity: 1 },
      ],
      products
    );
    expect(totals.count).toBe(3);
    expect(totals.lines).toHaveLength(2);
  });
});
