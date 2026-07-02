"use client";

/* StepRail's client half: the connected vertical line draws in and the
   numbered nodes tick on (60ms stagger, ≤400ms total) the FIRST time the
   rail enters view — motion-pref gated; static when motion is off. The
   rail never animates out: reading content stays put (motion rule #2). */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPref } from "@/lib/motion";
import type { RailStep } from "./rhythm";

export function StepRailClient({
  steps,
  ariaLabel,
}: {
  steps: readonly RailStep[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const ref = useRef<HTMLOListElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!motionOn) {
      setDrawn(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setDrawn(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motionOn]);

  return (
    <ol
      ref={ref}
      className="steprail"
      data-drawn={drawn ? "true" : "false"}
      data-motion={motionOn ? "on" : "off"}
      aria-label={ariaLabel}
    >
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="steprail__step"
          data-tone={s.tone ?? "green"}
          style={{ "--ri": i } as CSSProperties}
        >
          <span className="steprail__node" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="steprail__copy">
            <strong>{s.title}</strong>
            <p>{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
