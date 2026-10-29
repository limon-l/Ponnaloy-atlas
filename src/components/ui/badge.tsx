import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-2xs font-medium uppercase tracking-[0.1em]",
  {
    variants: {
      variant: {
        neutral: "border-line bg-surface text-ink-soft",
        teal: "border-teal/20 bg-teal-soft text-teal",
        copper: "border-copper/20 bg-copper-soft text-copper",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-danger/20 bg-danger/10 text-danger",
        info: "border-info/20 bg-info/10 text-info",
        outline: "border-line-strong bg-transparent text-ink",
        solid: "border-transparent bg-ink text-canvas",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const toneToVariant: Record<string, NonNullable<BadgeProps["variant"]>> = {
  teal: "teal",
  copper: "copper",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  neutral: "neutral",
};

export function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <Badge variant={toneToVariant[tone] ?? "neutral"}>{children}</Badge>;
}

export { badgeVariants };
