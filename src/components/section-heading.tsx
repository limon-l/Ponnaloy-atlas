import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "left",
  id,
  accent = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  align?: "left" | "center";
  id?: string;
  accent?: boolean;
}) {
  return (
    <Reveal
      distance={14}
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center")}>
            {accent && <span className="h-px w-7 bg-copper" aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="mt-3 text-balance font-display text-display-xs text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-[0.9375rem]">{description}</p>
        )}
      </div>
      {action && (
        <Link href={action.href} className="editorial-link shrink-0 self-start sm:self-auto">
          {action.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </Reveal>
  );
}
