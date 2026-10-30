"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Sparkles, Store, UserRound, Wrench } from "lucide-react";
import { StillLifeArt } from "@/components/still-life";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { collections } from "@/lib/seed";
import { setRole, setSeller } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const accounts: Array<{
  role: Role;
  title: string;
  description: string;
  email: string;
  icon: typeof UserRound;
}> = [
  {
    role: "CUSTOMER",
    title: "Customer",
    description: "Storefront, orders, wishlist and returns.",
    email: "amara.okafor@example.com",
    icon: UserRound,
  },
  {
    role: "SELLER",
    title: "Seller",
    description: "Listings, stock, fulfilment and payouts.",
    email: "studio@kestrel.audio",
    icon: Store,
  },
  {
    role: "ADMIN",
    title: "Administrator",
    description: "Moderation, sellers, orders and platform health.",
    email: "ops@ponnaloy.example",
    icon: Wrench,
  },
];

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setSelectedRole] = React.useState<Role>("CUSTOMER");
  const [email, setEmail] = React.useState(accounts[0]!.email);
  const [password, setPassword] = React.useState("atlas-demo");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const select = (next: (typeof accounts)[number]) => {
    setSelectedRole(next.role);
    setEmail(next.email);
    setError(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid demo email address.");
      return;
    }
    if (password.length < 6) {
      setError("Demo password must be at least six characters.");
      return;
    }
    setError(null);
    setPending(true);
    window.setTimeout(() => {
      setRole(role);
      if (role === "SELLER") setSeller("sel-kestrel");
      toast({
        title: `Signed in as ${role.toLowerCase()}`,
        description: "Demo session only. The API would issue a token and enforce permissions.",
        tone: "success",
      });
      router.push(role === "CUSTOMER" ? "/account" : role === "SELLER" ? "/seller" : "/admin");
    }, 320);
  };

  return (
    <div className="atlas-container py-6 lg:py-10">
      <div className="grid overflow-hidden rounded-xl border border-line bg-surface-raised lg:grid-cols-[1.05fr_1fr]">
        <div className="relative hidden min-h-[38rem] overflow-hidden lg:block">
          <StillLifeArt palette={collections[0]!.palette} variant={4} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/55">Member access · demo</p>
            <blockquote className="mt-4 max-w-md font-display text-3xl leading-[1.12] tracking-[-0.03em]">
              “A marketplace is only as good as the handoffs between the people in it.”
            </blockquote>
            <p className="mt-4 text-xs text-white/55">Atlas design principle 04 · visible handoffs</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Customer", "Seller", "Admin", "Super admin"].map((item) => (
                <span key={item} className="rounded-full border border-white/20 px-3 py-1 text-2xs text-white/65">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-2xs text-ink-faint hover:text-ink">
            <ArrowLeft className="size-3" aria-hidden="true" /> Back to the storefront
          </Link>
          <div className="mt-7 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Sign in</p>
              <h1 className="mt-2 font-display text-display-xs text-ink">Choose a surface.</h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                Three demo identities share one marketplace state. Switch at any time; nothing is authorised outside this browser.
              </p>
            </div>
            <Sparkles className="mt-1 size-5 shrink-0 text-copper" aria-hidden="true" />
          </div>

          <fieldset className="mt-6">
            <legend className="sr-only">Choose a demo account</legend>
            <div className="grid gap-2">
              {accounts.map((account) => (
                <label
                  key={account.role}
                  className={cn(
                    "focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-2 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    role === account.role ? "border-teal bg-teal-soft" : "border-line hover:border-line-strong"
                  )}
                >
                  <input
                    type="radio"
                    name="account"
                    value={account.role}
                    checked={role === account.role}
                    onChange={() => select(account)}
                    className="sr-only"
                  />
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", role === account.role ? "bg-teal text-white" : "bg-ink/[0.05] text-ink-faint")}>
                    <account.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{account.title}</span>
                    <span className="block text-2xs text-ink-faint">{account.description}</span>
                  </span>
                  {role === account.role && <Badge variant="teal">Selected</Badge>}
                </label>
              ))}
            </div>
          </fieldset>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <Field label="Demo email" htmlFor="signin-email" error={error && error.includes("email") ? error : undefined}>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                aria-invalid={Boolean(error && error.includes("email"))}
              />
            </Field>
            <Field label="Password" htmlFor="signin-password" hint="Any six characters work. The field is prefilled." error={error && error.includes("password") ? error : undefined}>
              <Input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                aria-invalid={Boolean(error && error.includes("password"))}
              />
            </Field>

            {error && !error.includes("email") && !error.includes("password") && (
              <p role="alert" className="text-xs text-danger">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={pending} disabled={pending}>
              Continue as {role.toLowerCase()} <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-line bg-surface p-3 text-2xs leading-relaxed text-ink-faint">
            <ShieldCheck className="mt-px size-3.5 shrink-0 text-teal" aria-hidden="true" />
            Demo authentication. No credentials are verified, stored or transmitted. Production would use the verified
            /api/auth/sign-in endpoint with httpOnly cookie sessions.
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4 text-2xs">
            <span className="inline-flex items-center gap-1.5 text-ink-faint"><Lock className="size-3" aria-hidden="true" /> Role-aware by design</span>
            <Link href="/help#demo-data" className="text-teal hover:underline">Read the disclosure</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
