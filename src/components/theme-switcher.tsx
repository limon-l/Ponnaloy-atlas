"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

const options: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: React.AriaAttributes["aria-hidden"] }>;
}> = [
  { value: "light", label: "Light", description: "Refined ivory & deep teal", icon: Sun },
  { value: "dark", label: "Dark", description: "Midnight forest & luminous teal", icon: Moon },
  { value: "system", label: "System", description: "Follow your device appearance", icon: Monitor },
];

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function applyWithCrossfade(apply: () => void) {
  if (typeof window === "undefined") {
    apply();
    return;
  }
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) root.classList.add("theme-transition");
  apply();
  if (!reduced) {
    window.setTimeout(() => root.classList.remove("theme-transition"), 220);
  }
}

/**
 * Light / Dark / System appearance control.
 *
 * The server and first client render share the same neutral SunMoon glyph, so
 * hydration never disagrees about the active icon. After mount the control
 * crossfades to the resolved theme. The inline variant is used inside mobile
 * drawers; the icon variant opens a labelled radio-style popover.
 */
export function ThemeSwitcher({
  className,
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "inline";
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const active: ThemeMode | "neutral" = !mounted
    ? "neutral"
    : isThemeMode(theme)
      ? theme
      : resolvedTheme === "dark"
        ? "dark"
        : "light";

  const activeLabel =
    active === "neutral"
      ? "Appearance"
      : active === "system"
        ? `System (${resolvedTheme ?? "device"})`
        : active === "dark"
          ? "Dark"
          : "Light";

  const choose = React.useCallback(
    (mode: ThemeMode) => {
      applyWithCrossfade(() => setTheme(mode));
      setOpen(false);
    },
    [setTheme]
  );

  if (variant === "inline") {
    return (
      <div
        role="group"
        aria-label="Appearance"
        className={cn("grid grid-cols-3 gap-1 rounded-lg border border-line bg-surface-inset p-1", className)}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = mounted && active === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              aria-pressed={selected}
              className={cn(
                "focus-ring flex min-h-9 items-center justify-center gap-1.5 rounded-md px-2 text-[0.6875rem] font-medium transition-[background-color,color,box-shadow,transform] duration-200",
                selected
                  ? "bg-surface-raised text-ink shadow-whisper"
                  : "text-ink-faint hover:bg-surface-raised/60 hover:text-ink"
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "focus-ring relative grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface-raised text-ink-soft transition-[background-color,border-color,color,transform] duration-200 hover:border-line-strong hover:text-ink active:scale-95",
            className
          )}
          aria-label={mounted ? `Appearance: ${activeLabel}. Change appearance` : "Change appearance"}
          aria-haspopup="dialog"
          title={mounted ? `Appearance: ${activeLabel}` : "Appearance"}
        >
          <span className="relative grid size-[1.15rem] place-items-center" aria-hidden="true">
            <SunMoon
              className={cn(
                "col-start-1 row-start-1 size-[1.15rem] transition-all duration-200",
                mounted ? "scale-50 opacity-0" : "scale-100 opacity-100"
              )}
            />
            <Sun
              className={cn(
                "col-start-1 row-start-1 size-[1.15rem] transition-all duration-200",
                active === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
              )}
            />
            <Moon
              className={cn(
                "col-start-1 row-start-1 size-[1.15rem] transition-all duration-200",
                active === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
              )}
            />
            <Monitor
              className={cn(
                "col-start-1 row-start-1 size-[1.15rem] transition-all duration-200",
                active === "system" ? "scale-100 opacity-100" : "scale-50 opacity-0"
              )}
            />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[17.5rem] p-1.5" aria-label="Appearance">
        <p className="px-2.5 pb-1.5 pt-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink-faint">
          Appearance
        </p>
        <div role="group" aria-label="Appearance options" className="space-y-0.5">
          {options.map((option) => {
            const Icon = option.icon;
            const selected = mounted && active === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value)}
                aria-pressed={selected}
                className={cn(
                  "focus-ring flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                  selected ? "bg-teal-soft text-ink" : "text-ink-soft hover:bg-ink/[0.045] hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border",
                    selected ? "border-teal/25 bg-surface-raised text-teal" : "border-line bg-surface text-ink-faint"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.8125rem] font-medium">{option.label}</span>
                  <span className="block text-[0.625rem] leading-snug text-ink-faint">{option.description}</span>
                </span>
                <Check
                  className={cn(
                    "size-4 shrink-0 text-teal transition-opacity duration-200",
                    selected ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <p className="px-2.5 pb-1 pt-2 text-[0.625rem] leading-relaxed text-ink-faint">
          {active === "system"
            ? `Following your device. Currently ${resolvedTheme ?? "light"}.`
            : "Preference is saved on this device."}
        </p>
      </PopoverContent>
    </Popover>
  );
}
