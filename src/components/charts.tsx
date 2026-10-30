import * as React from "react";
import type { SeriesPoint } from "@/lib/types";
import { cn, formatCompact, formatMoney, formatShortDate } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Revenue / trend chart                                               */
/* ------------------------------------------------------------------ */

export function TrendChart({
  data,
  height = 200,
  className,
  label,
  format = "currency",
}: {
  data: SeriesPoint[];
  height?: number;
  className?: string;
  label: string;
  format?: "currency" | "number";
}) {
  const width = 640;
  const padding = { top: 18, right: 12, bottom: 28, left: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = 220 - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((point) => point.value));
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const valueOf = (value: number) => (format === "currency" ? formatMoney(value) : formatCompact(value));

  const points = data.map((point, index) => {
    const x = padding.left + (data.length <= 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (point.value / max) * chartHeight;
    return { ...point, x, y };
  });

  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const area = points.length
    ? `${line} L${points[points.length - 1]!.x.toFixed(2)},${padding.top + chartHeight} L${points[0]!.x.toFixed(2)},${padding.top + chartHeight} Z`
    : "";
  const ticks = [0.25, 0.5, 0.75, 1];

  return (
    <figure className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} 220`}
        style={{ height }}
        className="w-full animate-fade-in overflow-visible"
        role="img"
        aria-label={`${label}. ${data.length} data points. Total ${valueOf(total)}. Peak ${valueOf(max)}.`}
      >
        <defs>
          <linearGradient id={`trend-fill-${label.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <line
            key={tick}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + chartHeight * (1 - tick)}
            y2={padding.top + chartHeight * (1 - tick)}
            stroke="hsl(var(--line))"
            strokeDasharray="3 5"
            strokeWidth="1"
          />
        ))}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + chartHeight}
          y2={padding.top + chartHeight}
          stroke="hsl(var(--line-strong))"
          strokeWidth="1"
        />
        {area && <path d={area} fill={`url(#trend-fill-${label.replace(/[^a-z0-9]/gi, "")})`} />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke="hsl(var(--chart-1))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="2.5" fill="hsl(var(--chart-1))" opacity={point.value > 0 ? 1 : 0.35}>
              <title>{`${formatShortDate(point.date)}: ${valueOf(point.value)}`}</title>
            </circle>
          </g>
        ))}
        {points.length > 0 && (
          <>
            <text x={padding.left} y={214} fill="hsl(var(--ink-faint))" fontSize="10" fontFamily="var(--font-mono)">
              {formatShortDate(points[0]!.date)}
            </text>
            <text
              x={width - padding.right}
              y={214}
              textAnchor="end"
              fill="hsl(var(--ink-faint))"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {formatShortDate(points[points.length - 1]!.date)}
            </text>
          </>
        )}
      </svg>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <th scope="row">{point.date}</th>
              <td>{valueOf(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bar list                                                 */
/* ------------------------------------------------------------------ */

export function BarList({
  items,
  format = "currency",
  className,
  emptyLabel = "No data yet",
}: {
  items: Array<{ label: string; value: number; meta?: string }>;
  format?: "currency" | "number";
  className?: string;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (items.length === 0) return <p className="py-8 text-sm text-ink-faint">{emptyLabel}</p>;
  return (
    <ul className={cn("space-y-3.5", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-ink">{item.label}</span>
            <span className="tabular shrink-0 text-xs font-medium text-ink-soft">
              {format === "currency" ? formatMoney(item.value) : formatCompact(item.value)}
              {item.meta && <span className="ml-2 font-normal text-ink-faint">{item.meta}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/70">
            <div
              className="h-full rounded-full bg-chart-1 transition-[width] duration-slow ease-atlas"
              style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */

const DONUT_COLOURS: Record<string, string> = {
  PENDING: "hsl(var(--warning))",
  CONFIRMED: "hsl(var(--info))",
  PROCESSING: "hsl(var(--info))",
  SHIPPED: "hsl(var(--teal))",
  OUT_FOR_DELIVERY: "hsl(var(--teal))",
  DELIVERED: "hsl(var(--success))",
  CANCELLED: "hsl(var(--danger))",
  RETURNED: "hsl(var(--warning))",
  REFUNDED: "hsl(var(--ink-faint))",
};

export function StatusDonut({
  data,
  className,
}: {
  data: Array<{ status: string; count: number }>;
  className?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let cursor = 0;
  const segments = data.map((item) => {
    const start = total === 0 ? 0 : (cursor / total) * 100;
    cursor += item.count;
    const end = total === 0 ? 0 : (cursor / total) * 100;
    return `${DONUT_COLOURS[item.status] ?? "hsl(var(--line-strong))"} ${start}% ${end}%`;
  });
  const background =
    total === 0 ? "hsl(var(--line))" : `conic-gradient(${segments.join(", ")})`;

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div
        className="relative grid size-28 shrink-0 place-items-center rounded-full"
        style={{ background }}
        role="img"
        aria-label={`Order status split: ${data.map((item) => `${item.status} ${item.count}`).join(", ")}`}
      >
        <div className="grid size-[4.5rem] place-items-center rounded-full bg-surface-raised text-center">
          <div>
            <p className="tabular font-display text-xl leading-none text-ink">{total}</p>
            <p className="mt-0.5 text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">orders</p>
          </div>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {data.slice(0, 5).map((item) => (
          <li key={item.status} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-ink-soft">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: DONUT_COLOURS[item.status] ?? "hsl(var(--line-strong))" }}
                aria-hidden="true"
              />
              <span className="truncate capitalize">{item.status.toLowerCase().replaceAll("_", " ")}</span>
            </span>
            <span className="tabular shrink-0 font-medium text-ink">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const width = 120;
  const height = 34;
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const path = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-8 w-28", className)} aria-hidden="true">
      <path d={path} fill="none" stroke="hsl(var(--chart-1))" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
