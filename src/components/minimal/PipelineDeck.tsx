"use client";

/* ============================================================
   PipelineDeck — a fanned card DECK that auto-plays at every
   viewport width. Replaces PipelineAccordion (whose flex-grow band
   went fully static below 900px, which read as "I have to click
   each one" — a real bug: the auto-advance timer never ran there).

   · Cards physically STACK behind the active one (translate + tilt
     + scale by depth), z-ordered front to back. Every ~4200ms the
     front card flies out to the side and the deck rotates — the
     next card settles into the active slot, the exited card
     resettles at the back. No breakpoint disables this; the deck
     is exactly as small/large as its container at any width.
   · The tick is still a 2px progress bar under the deck whose own
     animationend drives the advance (no setInterval to drift or
     leak) — pauses (animation-play-state) while off-screen, the
     tab is hidden, a REAL mouse hovers (not synthesized touch
     "hover"), or keyboard focus is inside (:focus-visible only, so
     a mouse click doesn't parked it forever in Chrome/Edge).
   · Clicking any card behind the front one promotes it — the deck
     "cuts" to that card and everything else keeps its relative
     order, so manual jumps and the auto-tick share one code path.
   · Motion off / prefers-reduced-motion: a plain vertical list, all
     cards fully visible, no stacking, no timers.
   · Hydration-deterministic: initial order is [0..N-1], all specs
     are props, no randomness or clocks in render.
   ============================================================ */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./PipelineDeck.module.css";

export type DeckStep = {
  title: string;
  body: ReactNode;
  /** optional protocol-layer chip (e.g. "L2 entry") */
  layer?: string;
  tone: "green" | "gold" | "cobalt";
};

const TICK_MS = 4200;
const EXIT_MS = 520;
const PIN_MS = 12_000;

/* belt-and-braces: OS-level reduced motion collapses to the static list
   even if the manual toggle is on (matches the site's PRM contract) */
const PRM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribePRM(cb: () => void) {
  const mq = window.matchMedia(PRM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribePRM,
    () => window.matchMedia(PRM_QUERY).matches,
    () => false,
  );
}

export default function PipelineDeck({
  steps,
  ariaLabel,
}: {
  steps: readonly DeckStep[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const reducedMotion = usePrefersReducedMotion();
  const staticLayout = !motionOn || reducedMotion;

  const count = steps.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /* order[0] is the front (active) card's step-index; order[N-1] is the
     deepest card in the stack. Rotating this array IS the deck shuffle. */
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: count }, (_, i) => i),
  );
  const [exiting, setExiting] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pinToken, setPinToken] = useState(0);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  /* in-view gate */
  useEffect(() => {
    if (staticLayout) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [staticLayout]);

  /* tab-visibility gate */
  useEffect(() => {
    if (staticLayout) return;
    const read = () => setDocVisible(!document.hidden);
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, [staticLayout]);

  /* click-pin: hold the promoted card for 12s, then resume the loop */
  useEffect(() => {
    if (pinToken === 0) return;
    const id = window.setTimeout(() => setPinToken(0), PIN_MS);
    return () => window.clearTimeout(id);
  }, [pinToken]);

  /* rotate the deck so `stepIndex` becomes the front — shared by both the
     auto-tick (always promotes order[1]) and manual clicks (any index) */
  const rotateTo = useCallback((stepIndex: number) => {
    setOrder((prev) => {
      const pos = prev.indexOf(stepIndex);
      if (pos <= 0) return prev;
      const outgoing = prev[0];
      const next = [...prev.slice(pos), ...prev.slice(0, pos)];
      setExiting(outgoing);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => setExiting(null), EXIT_MS);
      return next;
    });
  }, []);

  const select = useCallback(
    (stepIndex: number) => {
      rotateTo(stepIndex);
      if (!staticLayout) setPinToken((t) => t + 1);
    },
    [rotateTo, staticLayout],
  );

  const handleTick = useCallback(() => {
    if (count < 2) return;
    setOrder((prev) => {
      const outgoing = prev[0];
      setExiting(outgoing);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => setExiting(null), EXIT_MS);
      return [...prev.slice(1), prev[0]];
    });
  }, [count]);

  const handleBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocusWithin(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (count === 0) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const frontPos = 0;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = order[(frontPos + dir + count) % count];
      select(next);
      cardRefs.current[next]?.focus();
    },
    [count, order, select],
  );

  if (count === 0) return null;

  const paused = !inView || !docVisible || hovered || focusWithin || pinToken !== 0;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={ariaLabel ?? "Pipeline steps"}
      className={styles.deck}
      data-static={staticLayout ? "true" : undefined}
      data-paused={!staticLayout && paused ? "true" : undefined}
      onPointerEnter={(e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse") setHovered(false);
      }}
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).matches?.(":focus-visible")) {
          setFocusWithin(true);
        }
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.stage} style={{ "--n": count } as React.CSSProperties}>
        {steps.map((step, i) => {
          const depth = order.indexOf(i);
          const isFront = depth === 0;
          const isExiting = exiting === i;
          return (
            <button
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              type="button"
              className={styles.card}
              data-tone={step.tone}
              data-depth={Math.min(depth, 5)}
              data-front={isFront ? "true" : undefined}
              data-exiting={isExiting ? "true" : undefined}
              aria-current={isFront ? "true" : undefined}
              tabIndex={isFront || staticLayout ? 0 : -1}
              onClick={() => select(i)}
              style={{ "--depth": depth, "--i": i } as React.CSSProperties}
            >
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.layer ? <span className={styles.layer}>{step.layer}</span> : null}
              <span className={styles.title}>{step.title}</span>
              <span className={styles.body}>{step.body}</span>
            </button>
          );
        })}
      </div>
      {!staticLayout && count > 1 ? (
        <span
          className={styles.progress}
          aria-hidden="true"
          onAnimationEnd={handleTick}
          style={{ animationDuration: `${TICK_MS}ms` } as React.CSSProperties}
        />
      ) : null}
    </div>
  );
}
