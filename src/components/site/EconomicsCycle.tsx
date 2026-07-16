"use client";

/* ============================================================
   EconomicsCycle — the fee / reward / bond flywheel as one visibly
   CLOSED LOOP. Three always-expanded cards (this section never
   collapses — deliberately unlike the accordion elsewhere) joined by
   dashed connectors: two short hops across the card gaps and one long
   return arc sweeping beneath the row, so the economics read as
   circulation, not a list.

   Motion identity:
   · dash-flow — stroke-dashoffset loops (~2.6s linear) so the dashes
     stream card 1 → 2 → 3 and come home right→left along the return;
   · a slow highlight walks the loop every 3.5s (JS timer, only while
     the section is on screen, the tab is visible, and nothing is
     hovered). Hovering a card makes IT active and pauses the walk.

   Determinism: no randomness, no Date; SSR and the first client
   render agree (isDesktop/inView start false → no highlight, then the
   component livens up after mount). Motion off (useMotionPref +
   [data-motion="off"] + prefers-reduced-motion): zero timers, static
   dashes at ~.5 opacity, no lift — fully readable. Below 1024px:
   static vertical stack, SVG hidden, no timers.
   ============================================================ */

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./EconomicsCycle.module.css";

export type CycleStep = {
  title: string;
  body: string;
  tone: "green" | "gold" | "cobalt";
};

const ROTATE_MS = 3500;
const DESKTOP_QUERY = "(min-width: 1024px)";

/* Connector geometry in the shared 1000×320 plane. The SVG stretches
   over the whole component (preserveAspectRatio="none"); vector-effect
   ="non-scaling-stroke" keeps every stroke 1.5px regardless. With the
   clamp()ed grid gap ≈ 3.2% of width, the three columns land at
   [0–312] [344–656] [688–1000], so:
   · wire 0 hops the first gap (card 1 → card 2), arcing ABOVE the
     gap's vertical midline (endpoints tucked 2 units into each card
     edge so the round caps read as plugged in);
   · wire 1 hops the second gap (card 2 → card 3);
   · wire 2 is the long return — drawn card 3 → card 1 so the SAME
     forward dash animation reads right→left — swooping through the
     56px apron the component reserves under the cards. */
const WIRE_PATHS = [
  "M 310 118 Q 328 92 346 118",
  "M 654 118 Q 672 92 690 118",
  "M 844 244 C 844 292 712 308 500 308 C 288 308 156 292 156 244",
] as const;

export default function EconomicsCycle({
  steps,
  ariaLabel,
}: {
  steps: readonly CycleStep[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const rootRef = useRef<HTMLElement | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  const [inView, setInView] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [rotIndex, setRotIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  /* viewport class — the timer + highlight are desktop-only concerns */
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const read = () => setIsDesktop(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  /* only rotate while the loop is actually on screen */
  useEffect(() => {
    if (!motionOn || !isDesktop) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        if (last) setInView(last.isIntersecting);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motionOn, isDesktop]);

  /* …and while the tab is visible */
  useEffect(() => {
    if (!motionOn || !isDesktop) return;
    const read = () => setDocVisible(document.visibilityState === "visible");
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, [motionOn, isDesktop]);

  const stepCount = steps.length;
  const rotating =
    motionOn &&
    isDesktop &&
    inView &&
    docVisible &&
    hovered === null &&
    stepCount > 1;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      setRotIndex((k) => (k + 1) % stepCount);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [rotating, stepCount]);

  /* hover promotes a card and re-anchors the walk so it resumes there */
  const handleEnter = (i: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !motionOn || !isDesktop) return;
    setHovered(i);
    setRotIndex(i);
  };
  const handleLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    setHovered(null);
  };

  const active =
    motionOn && isDesktop && stepCount > 0 ? (hovered ?? rotIndex % stepCount) : null;

  /* the loop geometry is drawn for exactly three cards */
  const showWires = stepCount === 3;

  return (
    <section
      ref={rootRef}
      className={styles.cycle}
      data-motion={motionOn ? "on" : "off"}
      /* freeze (not reset) the dash flow while off-screen or tab-hidden —
         same pause discipline as the accordion and stepper */
      data-paused={
        motionOn && isDesktop && (!inView || !docVisible) ? "true" : undefined
      }
      aria-label={ariaLabel}
    >
      {showWires && (
        <svg
          className={styles.wires}
          viewBox="0 0 1000 320"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {WIRE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              className={styles.wire}
              data-tone={steps[i]?.tone ?? "green"}
              data-active={active === i ? "true" : undefined}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}

      <div className={styles.grid} role="list">
        {steps.map((step, i) => (
          <div
            key={i}
            role="listitem"
            className={styles.card}
            data-tone={step.tone}
            data-active={active === i ? "true" : undefined}
            onPointerEnter={handleEnter(i)}
            onPointerLeave={handleLeave}
          >
            <span className={styles.index}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
