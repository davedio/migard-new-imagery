"use client";

/* ============================================================
   LifecycleTrack — the how-it-works step-by-step as a conveyor:
   a horizontal station track with a luminous packet that glides
   left → right (Submit → … → Settle) and a spotlight card row
   beneath it. The packet IS the transaction; each arrival lights
   its station ring and expands that step's card.

   · Deterministic render: no randomness, no dates. The packet's
     px position derives from a ResizeObserver-measured track
     width; station positions are pure percentages of index.
   · Timers (~3.6s auto-advance) run ONLY while the section is in
     view (IntersectionObserver), the tab is visible, motion is
     on, the viewport is desktop-wide, and no card is hovered or
     focused. Hovering a card spotlights it and pauses the loop;
     leaving resumes from that card.
   · Motion off (useMotionPref, plus [data-motion="off"] and
     prefers-reduced-motion CSS kill-switches): no packet, no
     timers — all cards fully expanded in a 3×2 grid, stations
     faintly lit.
   · <980px: track hidden, cards become a scroll-snap carousel
     (~78vw each, fully expanded), zero timers.
   · The row reserves min-height for the tallest expanded card
     (measured, incl. after webfonts settle) so the accordion
     never jumps the page.
   ============================================================ */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./LifecycleTrack.module.css";

export type TrackStep = {
  n: string;
  title: string;
  layer: string;
  what: string;
  why: string;
  tone: "green" | "gold" | "cobalt";
};

const DESKTOP_QUERY = "(min-width: 980px)";
/** Dwell + travel per station; travel itself is 1.1s in the CSS. */
const ADVANCE_MS = 3600;
/** Keep in sync with the module CSS: card padding-bottom (16px) + top/bottom borders (2px). */
const CARD_CHROME_PX = 18;

function subscribeDesktop(onStoreChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

/** Live ≥980px flag, SSR-safe (false on the server — no timers pre-mount). */
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

export default function LifecycleTrack({
  steps,
  ariaLabel,
}: {
  steps: readonly TrackStep[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const isDesktop = useIsDesktop();
  const uid = useId();

  const count = steps.length;

  const [active, setActive] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [trackW, setTrackW] = useState(0);
  const [rowMinH, setRowMinH] = useState<number | null>(null);

  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const headRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const innerRefs = useRef<Array<HTMLDivElement | null>>([]);

  /* clamp in case the steps prop shrinks under a stale index */
  const activeIdx = count > 0 ? Math.min(active, count - 1) : 0;
  const paused = hoverIdx !== null || focusIdx !== null;

  /* ---- in-view gate for the auto-advance timer ---- */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((e) => e.isIntersecting));
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- pause while the document is hidden ---- */
  useEffect(() => {
    const read = () => setDocVisible(document.visibilityState === "visible");
     
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, []);

  /* ---- measurements: track width (packet px position) + the tallest
     expanded card (row min-height so the accordion never jumps) ---- */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (track) setTrackW(track.clientWidth);
    let tallest = 0;
    for (let i = 0; i < count; i++) {
      const head = headRefs.current[i];
      const inner = innerRefs.current[i];
      if (!head || !inner) continue;
      /* scrollHeight reports the reveal content's full height even while
         the 0fr row clips it to zero */
      const h = head.offsetHeight + inner.scrollHeight + CARD_CHROME_PX;
      if (h > tallest) tallest = h;
    }
    setRowMinH(tallest > 0 ? tallest + 2 : null);
  }, [count]);

  useEffect(() => {
    measure();
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    /* webfonts change line wraps — re-measure once they settle */
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      void document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [measure]);

  /* ---- the conveyor clock ---- */
  useEffect(() => {
    if (!motionOn || !isDesktop || !inView || !docVisible || paused || count < 2) {
      return;
    }
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % count);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [motionOn, isDesktop, inView, docVisible, paused, count]);

  /* selection is only meaningful in the desktop motion-on mode; everywhere
     else every card is already fully expanded */
  const select = useCallback(
    (i: number) => {
      if (motionOn && isDesktop) setActive(i);
    },
    [motionOn, isDesktop],
  );

  if (count === 0) return null;

  const activeTone: TrackStep["tone"] = steps[activeIdx]?.tone ?? "green";
  const packetX = trackW > 0 ? ((activeIdx + 0.5) / count) * trackW : 0;
  const packetReady = trackW > 0;

  const rowStyle = {
    "--n": String(count),
    ...(motionOn && isDesktop && rowMinH !== null
      ? { minHeight: `${rowMinH}px` }
      : {}),
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-label={ariaLabel ?? "Transaction lifecycle"}
      data-motion={motionOn ? "on" : "off"}
    >
      {/* the track — pure decoration; the cards carry the content */}
      <div ref={trackRef} className={styles.track} aria-hidden="true">
        <div className={styles.line} />
        <div
          className={styles.packet}
          data-tone={activeTone}
          data-ready={packetReady ? "true" : "false"}
          style={{ transform: `translate3d(${packetX.toFixed(2)}px, 0, 0)` }}
        />
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={styles.ring}
            data-tone={s.tone}
            data-active={
              motionOn && isDesktop && i === activeIdx ? "true" : "false"
            }
            style={{ left: `${(((i + 0.5) / count) * 100).toFixed(4)}%` }}
          >
            {s.n}
          </div>
        ))}
      </div>

      <ul className={styles.row} role="list" style={rowStyle}>
        {steps.map((s, i) => {
          const isCurrent = motionOn && isDesktop && i === activeIdx;
          const expanded = isCurrent || !motionOn || !isDesktop;
          const panelId = `${uid}-lt-panel-${i}`;
          return (
            <li
              key={s.n}
              role="listitem"
              className={styles.card}
              data-tone={s.tone}
              data-active={isCurrent ? "true" : "false"}
              aria-current={isCurrent ? "step" : undefined}
              onPointerEnter={() => {
                if (motionOn && isDesktop) {
                  setHoverIdx(i);
                  setActive(i);
                }
              }}
              onPointerLeave={() => {
                setHoverIdx((h) => (h === i ? null : h));
              }}
            >
              <button
                type="button"
                className={styles.head}
                aria-expanded={expanded}
                aria-controls={panelId}
                ref={(el) => {
                  headRefs.current[i] = el;
                }}
                onClick={() => select(i)}
                onFocus={() => {
                  setFocusIdx(i);
                  select(i);
                }}
                onBlur={() => {
                  setFocusIdx((f) => (f === i ? null : f));
                }}
              >
                <span className={styles.meta}>
                  <span className={styles.num}>{s.n}</span>
                  <span className={styles.chip}>{s.layer}</span>
                </span>
                <span className={styles.title}>{s.title}</span>
              </button>
              <div className={styles.reveal} id={panelId}>
                <div
                  className={styles.revealInner}
                  ref={(el) => {
                    innerRefs.current[i] = el;
                  }}
                >
                  <p className={styles.what}>{s.what}</p>
                  <p className={styles.why}>{s.why}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
