import { describe, expect, it } from "vitest";
import { cardSchema, checkoutSchema, reviewSchema, sellerProductSchema, storefrontSchema } from "@/lib/validations";

const validCheckout = {
  name: "Amara Okafor",
  email: "amara@example.com",
  phone: "+44 20 7946 0958",
  address: "14 Ashcombe Street",
  city: "London",
  postalCode: "SW6 3AT",
  country: "United Kingdom",
  paymentMethod: "CARD" as const,
  shippingMethod: "standard" as const,
};

describe("checkout validation", () => {
  it("accepts a complete demo checkout", () => {
    expect(checkoutSchema.safeParse(validCheckout).success).toBe(true);
  });

  it("rejects an invalid email and a too-short name", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, name: "A", email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["name", "email"]));
    }
  });

  it("rejects non-numeric phone characters", () => {
    expect(checkoutSchema.safeParse({ ...validCheckout, phone: "call me" }).success).toBe(false);
  });
});

describe("card validation", () => {
  it("accepts the documented demo card with spaces", () => {
    expect(cardSchema.safeParse({ cardNumber: "4242 4242 4242 4242", cardExpiry: "12/29", cardCvc: "123" }).success).toBe(
      true
    );
  });

  it("rejects a short card number and a malformed expiry", () => {
    expect(cardSchema.safeParse({ cardNumber: "4242", cardExpiry: "13/29", cardCvc: "123" }).success).toBe(false);
  });
});

describe("content validation", () => {
  it("accepts a valid review and rejects a one-word body", () => {
    expect(reviewSchema.safeParse({ rating: 5, title: "Quiet", comment: "Exactly right for the room." }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 5, title: "Quiet", comment: "Good" }).success).toBe(false);
  });

  it("coerces seller product numbers", () => {
    const result = sellerProductSchema.safeParse({
      name: "Linea Desk Lamp",
      subtitle: "A warm task light",
      price: "190",
      stock: "4",
      category: "lighting",
      description: "A small-batch lamp with a replaceable shade and warm dimming.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(190);
      expect(result.data.stock).toBe(4);
    }
  });

  it("validates storefront email and SLA bounds", () => {
    const storefront = {
      name: "Kestrel Audio",
      tagline: "Listen closer",
      description: "A small acoustics studio building quiet, durable listening equipment.",
      supportEmail: "care@kestrel.audio",
      fulfilmentSlaHours: "24",
    };
    expect(storefrontSchema.safeParse(storefront).success).toBe(true);
    expect(storefrontSchema.safeParse({ ...storefront, supportEmail: "nope", fulfilmentSlaHours: "999" }).success).toBe(false);
  });
});
