"use client";

import * as React from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [subscribed, setSubscribed] = React.useState(false);

  return (
    <div className={compact ? "" : "max-w-md"}>
      {!compact && (
        <>
          <p className="eyebrow text-white/60">The Sunday edit</p>
          <h2 className="mt-3 font-display text-2xl tracking-[-0.02em] text-white">
            One letter, six objects, no urgency.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            New work from independent studios, repair notes, and the occasional essay on living with fewer things.
          </p>
        </>
      )}
      <form
        className="mt-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
          if (!valid) {
            setError("Enter a valid email address.");
            return;
          }
          setError(null);
          setSubscribed(true);
          toast({
            title: "You are on the demo list",
            description: "No email was sent. This interaction stays in your browser.",
            tone: "info",
          });
        }}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "newsletter-error" : "newsletter-hint"}
              className="border-white/15 bg-white/[0.06] pl-9 text-white placeholder:text-white/60"
            />
          </div>
          <Button type="submit" variant="copper" className="shrink-0">
            {subscribed ? "Subscribed" : "Join the list"}
            {!subscribed && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>
        {error ? (
          <p id="newsletter-error" role="alert" className="mt-2 text-xs text-white/80">
            {error}
          </p>
        ) : (
          <p id="newsletter-hint" className="mt-2 text-[0.6875rem] text-white/70">
            Demo form. No address is stored or transmitted.
          </p>
        )}
      </form>
    </div>
  );
}
