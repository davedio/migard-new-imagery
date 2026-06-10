"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Natural reveal-on-scroll wrapper. Fades + lifts its children into view the
 * first time they enter the viewport, then disconnects. Respects
 * prefers-reduced-motion via the `.reveal` rules in globals.css (which force
 * the element visible and disable the transition).
 */
export function Reveal({
  children,
  delay = 0,
  stagger = false,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  /** Cascade direct children in 80ms apart instead of gating the whole block. */
  stagger?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is unavailable, just show the content.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setSeen(true));
      return () => cancelAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            io.disconnect();
            break;
          }
        }
      },
      // Pre-trigger just below the fold so sections are already alive when
      // they enter view — no full-viewport voids (design audit 2026-06-10).
      { threshold: 0.05, rootMargin: "0px 0px 12% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${stagger ? " reveal--stagger" : ""}${seen ? " in" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
