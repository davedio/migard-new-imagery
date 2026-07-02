"use client";

/* ============================================================
   PipelineAccordion — the transaction pipeline as ONE horizontal
   band of collapsing slats ("cards that collapse side to side").

   · Each step is a real <button> slat; the active slat grows to
     flex-grow 3.6 while the rest settle back to 1 — the only
     layout property animated is flex-grow (plus opacity/transform
     for the copy crossfades), per the site's canvas perf laws.
   · The 4200ms auto-advance clock IS the progress bar: a 2px
     scaleX(0→1) CSS animation along the active slat's bottom whose
     `animationend` advances the selection. Pausing is
     animation-play-state: paused (via data-paused), so the visual
     fill and the timer can never drift apart — and there is no
     setInterval to leak.
   · Pauses while: off-screen (IntersectionObserver), the tab is
     hidden (visibilitychange), hovered, focus is inside, or a slat
     was clicked (pinned for 12s, then resumes).
   · Motion off (useMotionPref) — fully static: equal-flex band that
     grows to auto height with every title + body readable, no
     progress bar, no observers, no timers. CSS kill-switches under
     :global([data-motion="off"]) and prefers-reduced-motion mirror
     it even without JS.
   · <900px — plain vertical stack of static cards, all bodies
     visible; the progress element is display:none there, so its
     animation never runs and auto-advance is naturally inert.
   · Hydration-deterministic: initial selection is 0, all specs are
     props, no randomness or clocks in render.
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
import styles from "./PipelineAccordion.module.css";

export type AccordionStep = {
  title: string;
  body: ReactNode;
  /** optional protocol-layer chip (e.g. "L2 entry"), shown when expanded */
  layer?: string;
  tone: "green" | "gold" | "cobalt";
};

const PIN_MS = 12_000; // click-pin hold before auto-advance resumes

/* mirrors the module's <900px static-stack breakpoint into JS so the
   aria story and the timers match what the CSS actually renders */
const MOBILE_QUERY = "(max-width: 899.98px)";
function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

export default function PipelineAccordion({
  steps,
  ariaLabel,
}: {
  steps: readonly AccordionStep[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const isMobile = useIsMobile();
  const bandRef = useRef<HTMLDivElement>(null);
  const slatRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  /* 0 = unpinned; each click bumps the token so the 12s hold restarts */
  const [pinToken, setPinToken] = useState(0);

  const count = steps.length;
  const activeIdx = count > 0 ? Math.min(active, count - 1) : 0;
  /* the CSS renders everything expanded in these modes — the JS must agree */
  const staticLayout = !motionOn || isMobile;

  /* in-view gate — the advance animation only plays while on screen */
  useEffect(() => {
    if (staticLayout) return;
    const el = bandRef.current;
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

  /* click-pin: hold the clicked slat for 12s, then resume the loop */
  useEffect(() => {
    if (pinToken === 0) return;
    const id = window.setTimeout(() => setPinToken(0), PIN_MS);
    return () => window.clearTimeout(id);
  }, [pinToken]);

  const select = useCallback(
    (i: number) => {
      setActive(i);
      /* pinning only means something while the loop runs — and skipping it
         keeps the static modes at literally zero timers */
      if (!staticLayout) setPinToken((t) => t + 1);
    },
    [staticLayout],
  );

  /* the progress bar's 4200ms fill completing is the advance tick */
  const handleProgressEnd = useCallback(() => {
    if (count < 2) return;
    setActive((a) => (a + 1) % count);
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
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (activeIdx + dir + count) % count;
      select(next);
      slatRefs.current[next]?.focus();
    },
    [activeIdx, count, select],
  );

  if (count === 0) return null;

  const paused =
    !inView || !docVisible || hovered || focusWithin || pinToken !== 0;

  return (
    <div
      ref={bandRef}
      role="group"
      aria-label={ariaLabel ?? "Pipeline steps"}
      className={styles.band}
      data-static={motionOn ? undefined : "true"}
      data-paused={!staticLayout && paused ? "true" : undefined}
      /* real mouse hover pauses; synthesized touch "hover" must not — a tap
         would otherwise latch hovered=true and stall the loop forever */
      onPointerEnter={(e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse") setHovered(false);
      }}
      /* click-focus (Chrome/Edge) must not pause forever — only keyboard-
         visible focus holds the loop; clicks rely on the 12s pin instead */
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).matches?.(":focus-visible")) {
          setFocusWithin(true);
        }
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {steps.map((step, i) => {
        const isActive = i === activeIdx;
        return (
          <button
            key={i}
            ref={(el) => {
              slatRefs.current[i] = el;
            }}
            type="button"
            className={styles.slat}
            data-tone={step.tone}
            data-active={isActive ? "true" : undefined}
            /* the copy never leaves the accessibility tree (hidden only via
               opacity), so this is a spotlight, not a disclosure — announce
               "current", never a false "collapsed" */
            aria-current={isActive ? "true" : undefined}
            onClick={() => select(i)}
          >
            <span className={styles.num} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            {/* collapsed spine label — duplicate of the title, hidden from SRs */}
            <span className={styles.titleVertical} aria-hidden="true">
              {step.title}
            </span>
            <span className={styles.content}>
              {step.layer ? (
                <span className={styles.layer}>{step.layer}</span>
              ) : null}
              <span className={styles.title}>{step.title}</span>
              <span className={styles.body}>{step.body}</span>
            </span>
            {!staticLayout && count > 1 && isActive ? (
              <span
                className={styles.progress}
                aria-hidden="true"
                onAnimationEnd={handleProgressEnd}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
