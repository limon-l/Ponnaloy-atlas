"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/controls";
import { hydrateStore } from "@/lib/store";

type MotionLevel = "full" | "reduced" | "minimal";

interface MotionContextValue {
  level: MotionLevel;
  setLevel: (level: MotionLevel) => void;
  systemReduced: boolean;
}

const MotionContext = React.createContext<MotionContextValue | undefined>(undefined);

const STORAGE_KEY = "ponnaloy.atlas.motion";

function MotionProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = React.useState<MotionLevel>("full");
  const [systemReduced, setSystemReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(query.matches);
    let stored: MotionLevel | null = null;
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value === "full" || value === "reduced" || value === "minimal") stored = value;
    } catch { /* Preferences remain usable when storage is unavailable. */ }
    const resolved = stored ?? (query.matches ? "reduced" : "full");
    setLevelState(resolved);
    document.documentElement.dataset.motion = resolved;

    const onChange = (event: MediaQueryListEvent) => {
      setSystemReduced(event.matches);
      let hasPreference = false;
      try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        hasPreference = value === "full" || value === "reduced" || value === "minimal";
      } catch { /* Follow the device when storage is unavailable. */ }
      if (!hasPreference) {
        const next = event.matches ? "reduced" : "full";
        setLevelState(next);
        document.documentElement.dataset.motion = next;
      }
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const setLevel = React.useCallback((next: MotionLevel) => {
    setLevelState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* Session-only preference. */ }
    document.documentElement.dataset.motion = next;
  }, []);

  return (
    <MotionContext.Provider value={{ level, setLevel, systemReduced }}>
      <MotionConfig reducedMotion={level === "full" ? "user" : "always"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

export function useMotionLevel() {
  const context = React.useContext(MotionContext);
  if (!context) throw new Error("useMotionLevel must be used inside Providers");
  return context;
}

function StoreHydrator({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    hydrateStore();
  }, []);
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      storageKey="ponnaloy.atlas.theme"
    >
      <MotionProvider>
        <ToastProvider>
          <TooltipProvider delayDuration={250} skipDelayDuration={80}>
            <StoreHydrator>{children}</StoreHydrator>
          </TooltipProvider>
        </ToastProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
