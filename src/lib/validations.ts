import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number the carrier can reach.")
    .regex(/^[+()\-\s\d]+$/, "Use digits, spaces, +, - or parentheses only."),
  address: z.string().trim().min(5, "Enter a street address."),
  city: z.string().trim().min(2, "Enter a city."),
  postalCode: z.string().trim().min(3, "Enter a postal code."),
  country: z.string().trim().min(2, "Choose a country."),
  paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  shippingMethod: z.enum(["standard", "express"]),
  notes: z.string().trim().max(300, "Keep notes under 300 characters.").optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const cardSchema = z.object({
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^\d{16}$/.test(value), "Use 16 digits. Demo card: 4242 4242 4242 4242."),
  cardExpiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY."),
  cardCvc: z.string().trim().regex(/^\d{3,4}$/, "Use 3 or 4 digits."),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().trim().min(3, "Add a short title.").max(80),
  comment: z.string().trim().min(10, "Write at least 10 characters.").max(600),
});

export const sellerProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  subtitle: z.string().trim().min(4, "Add a short subtitle."),
  price: z.coerce.number().min(1, "Price must be greater than zero."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  category: z.string().min(1, "Choose a category."),
  description: z.string().trim().min(20, "Write at least 20 characters."),
});

export const storefrontSchema = z.object({
  name: z.string().trim().min(2, "Store name is required."),
  tagline: z.string().trim().min(4, "Add a tagline."),
  description: z.string().trim().min(30, "Write at least 30 characters."),
  supportEmail: z.string().email("Use a valid support email."),
  fulfilmentSlaHours: z.coerce.number().int().min(1).max(168),
});
