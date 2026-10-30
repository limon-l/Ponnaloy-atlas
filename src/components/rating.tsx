import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
  showEmpty = false,
}: {
  value: number;
  count?: number;
  className?: string;
  showEmpty?: boolean;
}) {
  if (value <= 0 && !showEmpty) {
    return <span className={cn("text-xs text-ink-faint", className)}>No reviews yet</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-ink-soft", className)}>
      <Star className="size-3.5 fill-copper text-copper" aria-hidden="true" />
      <span className="tabular font-medium text-ink">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-ink-faint">
          ({count.toLocaleString("en-US")})
        </span>
      )}
      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5{count ? ` from ${count} reviews` : ""}
      </span>
    </span>
  );
}
