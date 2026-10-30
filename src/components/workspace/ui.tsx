import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-copper">
          <span className="size-1.5 rounded-full bg-copper" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="mt-2 text-balance font-display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] leading-[1.05] tracking-[-0.035em] text-ink">
          {title}
        </h1>
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-soft">{description}</p>
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  delta,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail: string;
  delta?: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: React.AriaAttributes["aria-hidden"] }>;
  tone?: "teal" | "copper" | "ink" | "warning";
}) {
  const positive = (delta ?? 0) > 0.0001;
  const negative = (delta ?? 0) < -0.0001;
  const DeltaIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  return (
    <div className="group relative overflow-hidden rounded-xl border border-line bg-surface-raised p-4 shadow-whisper transition-[border-color,box-shadow,transform] duration-base ease-atlas hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift">
      <span
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-24 rounded-full opacity-60 blur-2xl transition-opacity duration-base group-hover:opacity-90",
          tone === "teal" && "bg-teal/15",
          tone === "copper" && "bg-copper/15",
          tone === "ink" && "bg-ink/10",
          tone === "warning" && "bg-warning/15"
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[0.625rem] uppercase tracking-[0.13em] text-ink-faint">{label}</p>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full",
            tone === "teal" && "bg-teal-soft text-teal",
            tone === "copper" && "bg-copper-soft text-copper",
            tone === "ink" && "bg-ink/[0.06] text-ink-soft",
            tone === "warning" && "bg-warning/10 text-warning"
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="tabular relative mt-2.5 font-display text-[1.75rem] leading-none tracking-[-0.03em] text-ink">{value}</p>
      <div className="relative mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.625rem]">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              positive ? "bg-success/10 text-success" : negative ? "bg-danger/10 text-danger" : "bg-ink/[0.05] text-ink-faint"
            )}
          >
            <DeltaIcon className="size-3" aria-hidden="true" />
            {formatPercent(Math.abs(delta), 1)}
            <span className="sr-only">{positive ? "increase" : negative ? "decrease" : "no change"}</span>
          </span>
        )}
        <span className="text-ink-faint">{detail}</span>
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  as: Tag = "section",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={cn("overflow-hidden rounded-xl border border-line bg-surface-raised shadow-whisper", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-surface/45 px-4 py-3.5 sm:px-5">
          <div>
            {title && <h2 className="text-balance font-display text-lg leading-tight tracking-[-0.02em] text-ink">{title}</h2>}
            {description && <p className="mt-0.5 max-w-prose text-[0.6875rem] leading-relaxed text-ink-faint">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </Tag>
  );
}

export function DefinitionRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-1.5 text-xs", className)}>
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export function WorkspaceNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-line-strong bg-surface/50 px-3 py-2 text-[0.6875rem] leading-relaxed text-ink-faint">
      {children}
    </p>
  );
}
