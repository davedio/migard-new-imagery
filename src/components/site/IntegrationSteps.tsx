"use client";

/* ============================================================
   IntegrationSteps — compact horizontal 4-step stepper for the
   /developers page.

   Motion identity (desktop ≥820px, motion on):
   · one continuous connector line (green→gold→cobalt) DRAWS itself
     left→right (scaleX) the FIRST time the stepper enters view;
   · the numbered rings pop in sequence (opacity + scale, 90ms
     stagger) and each title/body fades up 8px on the same stagger;
   · afterwards a narrow translucent sheen sweeps once along the
     line every ~7s. The sheen lives INSIDE the line's own 2px
     overflow-hidden box at z-index 0, below the solid-backed rings
     at z-index 1 — the step digits can never be occluded.

   No timers anywhere: the entrance is a one-shot IO trigger and the
   idle sheen is a pure CSS loop whose play-state is paused whenever
   the stepper is out of view or the document is hidden (both fed by
   an IntersectionObserver + visibilitychange listener, cleaned up
   on unmount). Motion off → everything rendered fully drawn and
   readable, zero observers, zero animation.

   Mobile <820px: static 2×2 grid, connector hidden, no entrance.

   All visible copy comes verbatim from `steps`; the only generated
   text is the mono step numbers ("01"…"04").
   ============================================================ */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./IntegrationSteps.module.css";

export type IntegrationStep = {
  title: string;
  body: string;
  tone: "green" | "gold" | "cobalt";
};

export default function IntegrationSteps({
  steps,
  ariaLabel,
}: {
  steps: readonly IntegrationStep[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const ref = useRef<HTMLDivElement>(null);

  /* entrance, three-state so the server never ships hidden copy:
     "static"  — fully drawn and readable (SSR, no-JS, motion off, or
                 already in view when JS takes over: skip the entrance
                 rather than hide painted text)
     "pending" — armed from JS only, for content still below the fold
     "done"    — the one-shot entrance has played */
  const [entrance, setEntrance] = useState<"static" | "pending" | "done">(
    "static",
  );
  /* idle sheen gate: paused unless in view AND the tab is visible */
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (!motionOn) {
      // fully static + fully readable: no observers, no listeners
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    /* arm the entrance only for a stepper still below the viewport —
       content the visitor can already see is never blanked */
    const below = el.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (below) setEntrance("pending");

    let inView = false;
    let docHidden = document.visibilityState === "hidden";
    const sync = () => setPaused(!inView || docHidden);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          inView = e.isIntersecting;
          if (e.isIntersecting) setEntrance("done");
        }
        sync();
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    const onVisibility = () => {
      docHidden = document.visibilityState === "hidden";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [motionOn]);

  return (
    /* div[role="list"] rather than <ol>: the absolutely-positioned
       connector must live inside the grid, and a non-<li> child would
       make an <ol> invalid HTML. The roles carry the list semantics. */
    <div
      ref={ref}
      className={styles.root}
      role="list"
      aria-label={ariaLabel}
      data-motion={motionOn ? "on" : "off"}
      data-drawn={entrance === "pending" ? "false" : "true"}
      data-paused={paused ? "true" : "false"}
    >
      {/* connector: line + sheen are clipped to this 2px box, z-index 0 —
          strictly beneath the solid-backed rings (z-index 1) */}
      <span className={styles.line} aria-hidden="true">
        <span className={styles.lineFill} />
        <span className={styles.sheenTrack}>
          <span className={styles.sheen} />
        </span>
      </span>

      {steps.map((s, i) => (
        <div
          key={i}
          className={styles.item}
          role="listitem"
          data-tone={s.tone}
          style={{ "--i": i } as CSSProperties}
        >
          <span className={styles.ring} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className={styles.copy}>
            <strong className={styles.title}>{s.title}</strong>
            <p className={styles.body}>{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
