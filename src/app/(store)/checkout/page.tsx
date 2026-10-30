"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, CreditCard, Landmark, Lock, ShoppingBag, Truck, Wallet } from "lucide-react";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { priceCart } from "@/lib/cart";
import { useCatalog } from "@/lib/hooks";
import { placeOrder, useAtlasState } from "@/lib/store";
import { checkoutSchema, type CheckoutValues } from "@/lib/validations";
import { cn, formatMoney } from "@/lib/utils";

const schema = checkoutSchema.superRefine((values, ctx) => {
  if (values.paymentMethod !== "CARD") return;
  if (!/^\d{16}$/.test((values.cardNumber ?? "").replace(/\s+/g, ""))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cardNumber"], message: "Use 16 digits. Demo card: 4242 4242 4242 4242." });
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.cardExpiry ?? "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cardExpiry"], message: "Use MM/YY." });
  }
  if (!/^\d{3,4}$/.test(values.cardCvc ?? "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cardCvc"], message: "Use 3 or 4 digits." });
  }
});

const countries = ["United Kingdom", "United States", "Denmark", "France", "Germany", "Italy", "Japan", "Portugal", "Singapore"];

const paymentOptions = [
  { value: "CARD" as const, label: "Card", description: "Simulated authorisation only", icon: CreditCard },
  { value: "CASH_ON_DELIVERY" as const, label: "Cash on delivery", description: "Payment due on arrival", icon: Wallet },
  { value: "BANK_TRANSFER" as const, label: "Bank transfer", description: "Order held until transfer clears", icon: Landmark },
];

export default function CheckoutPage() {
  const state = useAtlasState();
  const products = useCatalog();
  const router = useRouter();
  const { toast } = useToast();
  const totals = priceCart(state.cart, products, { coupon: state.coupon });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CheckoutValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Amara Okafor",
      email: "amara.okafor@example.com",
      phone: "+44 20 7946 0958",
      address: "14 Alder Lane",
      city: "London",
      postalCode: "SW1A 1AA",
      country: "United Kingdom",
      paymentMethod: "CARD",
      shippingMethod: "standard",
      notes: "",
      cardNumber: "4242 4242 4242 4242",
      cardExpiry: "12/29",
      cardCvc: "424",
    },
  });
  const paymentMethod = watch("paymentMethod");
  const shippingMethod = watch("shippingMethod");
  const liveTotals = priceCart(state.cart, products, { coupon: state.coupon, shippingMethod });

  if (totals.lines.length === 0) {
    return (
      <div className="atlas-container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="There is nothing to check out"
          description="Your bag is empty. Add an object to try the demo checkout, or review your saved items first."
          action={{ label: "Browse the catalogue", href: "/products" }}
          secondary={{ label: "Open wishlist", href: "/wishlist" }}
        />
      </div>
    );
  }

  const onSubmit = handleSubmit((values) => {
    const result = placeOrder(values);
    if (!result.ok) {
      setError("root", { message: result.error });
      toast({ title: "Order not placed", description: result.error, tone: "error" });
      return;
    }
    toast({
      title: `Order ${result.order.number} placed`,
      description: "Demo order created. No payment was taken.",
      tone: "success",
    });
    router.push(`/orders/${result.order.id}?placed=1`);
  });

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="atlas-container py-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-2xs text-ink-faint hover:text-ink">
              <ArrowLeft className="size-3" aria-hidden="true" /> Back to bag
            </Link>
            <ol className="flex items-center gap-2 text-2xs text-ink-faint" aria-label="Checkout progress">
              <li><Link href="/cart" className="hover:text-ink">01 Bag</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="step" className="font-medium text-ink">02 Details</li>
              <li aria-hidden="true">/</li>
              <li>03 Confirmation</li>
            </ol>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Checkout</p>
              <h1 className="mt-2 font-display text-display-xs text-ink">Details, not distractions.</h1>
            </div>
            <Badge variant="warning">Demo · no real payment</Badge>
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} noValidate className="atlas-container grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14 lg:py-12">
        <div className="space-y-10">
          <section aria-labelledby="contact-heading">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xs text-copper">01</span>
              <h2 id="contact-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Contact</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone?.message} hint="Used only for delivery updates in a live build." className="sm:col-span-2">
                <Input id="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-hint"} {...register("phone")} />
              </Field>
            </div>
          </section>

          <section aria-labelledby="shipping-heading" className="border-t border-line pt-8">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xs text-copper">02</span>
              <h2 id="shipping-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Delivery address</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Street address" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
                <Input id="address" autoComplete="street-address" aria-invalid={Boolean(errors.address)} {...register("address")} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city?.message}>
                <Input id="city" autoComplete="address-level2" aria-invalid={Boolean(errors.city)} {...register("city")} />
              </Field>
              <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode?.message}>
                <Input id="postalCode" autoComplete="postal-code" aria-invalid={Boolean(errors.postalCode)} {...register("postalCode")} />
              </Field>
              <Field label="Country" htmlFor="country" error={errors.country?.message} className="sm:col-span-2">
                <Select id="country" autoComplete="country-name" aria-invalid={Boolean(errors.country)} {...register("country")}>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <fieldset className="mt-6">
              <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">Delivery speed</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { value: "standard" as const, label: "Standard", detail: "2–4 working days", price: liveTotals.subtotal >= 15000 ? "Complimentary" : formatMoney(1200) },
                  { value: "express" as const, label: "Express", detail: "1–2 working days", price: formatMoney(2400) },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-2 flex cursor-pointer items-center gap-3 rounded-md border p-3.5 text-sm transition-colors",
                      shippingMethod === option.value ? "border-teal bg-teal-soft" : "border-line hover:border-line-strong"
                    )}
                  >
                    <input type="radio" value={option.value} className="accent-teal" {...register("shippingMethod")} />
                    <span className="flex-1">
                      <span className="block font-medium text-ink">{option.label}</span>
                      <span className="block text-2xs text-ink-faint">{option.detail}</span>
                    </span>
                    <span className="tabular text-xs text-ink-soft">{option.price}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section aria-labelledby="payment-heading" className="border-t border-line pt-8">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xs text-copper">03</span>
                <h2 id="payment-heading" className="font-display text-xl tracking-[-0.02em] text-ink">Payment</h2>
              </div>
              <span className="inline-flex items-center gap-1 text-2xs text-ink-faint">
                <Lock className="size-3" aria-hidden="true" /> Simulated
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-faint">
              Demo payment form. The card fields are prefilled with a test number and are never transmitted or stored.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {paymentOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-2 flex cursor-pointer flex-col gap-2 rounded-md border p-3.5 text-sm transition-colors",
                    paymentMethod === option.value ? "border-teal bg-teal-soft" : "border-line hover:border-line-strong"
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <option.icon className={cn("size-4", paymentMethod === option.value ? "text-teal" : "text-ink-faint")} aria-hidden="true" />
                    <input type="radio" value={option.value} className="accent-teal" {...register("paymentMethod")} />
                  </span>
                  <span>
                    <span className="block font-medium text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-2xs leading-snug text-ink-faint">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === "CARD" && (
              <div className="mt-4 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
                <Field label="Card number" htmlFor="cardNumber" error={errors.cardNumber?.message} className="sm:col-span-2">
                  <Input
                    id="cardNumber"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    aria-invalid={Boolean(errors.cardNumber)}
                    aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
                    {...register("cardNumber")}
                  />
                </Field>
                <Field label="Expiry" htmlFor="cardExpiry" error={errors.cardExpiry?.message}>
                  <Input id="cardExpiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" aria-invalid={Boolean(errors.cardExpiry)} {...register("cardExpiry")} />
                </Field>
                <Field label="CVC" htmlFor="cardCvc" error={errors.cardCvc?.message}>
                  <Input id="cardCvc" inputMode="numeric" autoComplete="cc-csc" placeholder="424" aria-invalid={Boolean(errors.cardCvc)} {...register("cardCvc")} />
                </Field>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("cardNumber", "4242 4242 4242 4242", { shouldValidate: true });
                      setValue("cardExpiry", "12/29", { shouldValidate: true });
                      setValue("cardCvc", "424", { shouldValidate: true });
                    }}
                    className="focus-ring rounded text-2xs font-medium text-teal hover:underline"
                  >
                    Fill demo card details
                  </button>
                </div>
              </div>
            )}

            <Field label="Delivery notes" htmlFor="notes" optional error={errors.notes?.message} hint="Leave a note for the seller. Demo only." className="mt-5">
              <Textarea id="notes" rows={3} aria-describedby={errors.notes ? "notes-error" : "notes-hint"} {...register("notes")} />
            </Field>
          </section>

          {errors.root && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
              {errors.root.message}
            </p>
          )}
        </div>

        <aside aria-label="Order review">
          <div className="sticky top-[calc(var(--header-height)+1.5rem)] rounded-xl border border-line bg-surface-raised p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-[-0.02em] text-ink">Order review</h2>
              <Badge variant="outline">{totals.count} items</Badge>
            </div>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {totals.lines.map((line) => (
                <li key={`${line.productId}-${line.variantId ?? "default"}`} className="flex items-center gap-3">
                  <span className="size-12 shrink-0 overflow-hidden rounded-md">
                    <ProductArt art={line.product.art} palette={line.product.palette} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-ink">{line.product.name}</span>
                    <span className="block text-2xs text-ink-faint">
                      {line.variantLabel ?? line.product.variantLabel} · Qty {line.quantity}
                    </span>
                  </span>
                  <span className="tabular text-xs text-ink">{formatMoney(line.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>Subtotal</dt>
                <dd className="tabular">{formatMoney(liveTotals.subtotal)}</dd>
              </div>
              {liveTotals.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>{liveTotals.couponLabel}</dt>
                  <dd className="tabular">−{formatMoney(liveTotals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-ink-soft">
                <dt>Delivery</dt>
                <dd className="tabular">{liveTotals.shipping === 0 ? "Complimentary" : formatMoney(liveTotals.shipping)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Tax</dt>
                <dd className="tabular">{formatMoney(liveTotals.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular">{formatMoney(liveTotals.total)}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="mt-5 w-full" loading={isSubmitting} disabled={isSubmitting}>
              Place demo order <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <p className="mt-3 flex items-start gap-2 text-2xs leading-relaxed text-ink-faint">
              <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              No real payment. The order is saved to this browser and appears in the customer, seller and admin surfaces.
            </p>
            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-2xs text-ink-faint">
              <p className="flex items-center gap-2"><Truck className="size-3.5" aria-hidden="true" /> {shippingMethod === "express" ? "Express 1–2 working days" : "Standard 2–4 working days"}</p>
              <p className="flex items-center gap-2"><ShoppingBag className="size-3.5" aria-hidden="true" /> {totals.lines.map((line) => line.product.brand).filter((value, index, array) => array.indexOf(value) === index).join(", ")}</p>
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}
