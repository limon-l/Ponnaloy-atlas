"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { useMotionLevel } from "@/components/providers";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  once?: boolean;
  distance?: number;
}

/**
 * IntersectionObserver reveal. CSS handles the transition, so the animation
 * costs no React renders after the first intersection and is disabled by the
 * global reduced-motion profiles.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  once = true,
  distance = 18,
  style,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const systemReduced = useReducedMotion();
  const { level } = useMotionLevel();
  const reduced = systemReduced || level !== "full";
  const Component = Tag as React.ElementType;

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const revealNow = visible || reduced;

  return (
    <Component
      ref={ref}
      data-aura-reveal=""
      className={cn("transition-[opacity,transform] duration-slow ease-entrance", className)}
      style={{
        opacity: revealNow ? 1 : 0,
        transform: revealNow ? "none" : `translateY(${distance}px)`,
        transitionDelay: reduced ? "0ms" : `${Math.min(delay, 300)}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Stagger({
  children,
  className,
  step = 55,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child) ? (
          <Reveal delay={index * step} className="h-full">
            {child}
          </Reveal>
        ) : (
          child
        )
      )}
    </div>
  );
}
