"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
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
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const reduced = useReducedMotion();

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

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("transition-[opacity,transform] duration-[var(--duration-slow)] ease-entrance", className)}
      style={{
        opacity: visible || reduced ? 1 : 0,
        transform: visible || reduced ? "none" : `translateY(${distance}px)`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
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
