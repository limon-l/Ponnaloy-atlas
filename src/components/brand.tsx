import { cn } from "@/lib/utils";

export function BrandMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 23V9h6.2c3.1 0 5.1 1.8 5.1 4.7 0 2.9-2 4.8-5.1 4.8h-3.1V23H9Z"
        fill="hsl(var(--canvas))"
      />
      <path d="M12 12.2v3.9h2.8c1.3 0 2.1-.8 2.1-2s-.8-1.9-2.1-1.9H12Z" fill="currentColor" />
      <circle cx="23.5" cy="22.5" r="1.8" fill="hsl(var(--copper))" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-display text-[1.35rem] font-medium leading-none tracking-[-0.04em] text-ink">
        Ponnaloy
      </span>
      {!compact && (
        <span className="font-mono text-[0.5625rem] uppercase leading-none tracking-[0.32em] text-copper">
          Atlas
        </span>
      )}
    </span>
  );
}
