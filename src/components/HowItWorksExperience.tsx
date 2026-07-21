"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useMotionValue } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import JourneyHud from "@/components/scene/JourneyHud";
import {
  journeyStageCenter,
  journeyStageIndex,
} from "@/lib/journeyStages";
import { useMotionPref } from "@/lib/motion";
import { useTheme, themedAsset } from "@/lib/theme";

/* ============================================================
   HowItWorksExperience — the FLAGSHIP "ride a transaction" act,
   relocated from the old home page and re-homed as the immersive
   centerpiece of /learn.

   The page introduces the protocol in plain language before a full-viewport
   JOURNEY ACT where a PHOTOREAL tree PLATE plays the scroll-driven canopy ->
   L1-settlement descent (the visual lifecycle) via a parallax pan, with LIVE green overlays
   (beams, network pulses, leaves, ADA diamonds) layered over it, and a
   HUD chapter rail whose labels are aligned to the
   page's protocol-lifecycle language (Submit · L2 -> Sequence ->
   Commit -> data availability check -> Watch -> Settle · L1). The detailed textual sections below
   the act reinforce what the 3D just showed.

   Native scrolling drives the act. Its live visual progress is shared by
   every stage label and indicator, and the expensive scene work is active
   only while the pinned journey itself is on screen. Compact, reduced-motion,
   and resource-constrained devices use the same calm static frame plus the
   complete six-step recap below it.
   ============================================================ */

// The photoreal tree plate parallax-pans canopy -> roots with live green
// overlays on a canvas.
const PhotorealBackdrop = dynamic(() => import("./scene/PhotorealBackdrop"), {
  ssr: false,
});
// The floating on-tree stage badge — rides the descending packet and surfaces
// the active lifecycle stage (replaces the old fixed HUD panel + emoji marker).
const StageGraphic = dynamic(() => import("./scene/StageGraphic"), {
  ssr: false,
});
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// Floating motion toggle (bottom-right). Shared nav/footer chrome comes from
// the (site) layout; the experience keeps only this control.
function MotionToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="motion-toggle"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Turn motion effects off" : "Turn motion effects on"}
      title={on ? "Turn motion effects off" : "Turn motion effects on"}
    >
      <span className="motion-toggle__glyph" data-on={on} aria-hidden />
    </button>
  );
}

/* Render fixed overlay layers into <body>, outside the scrolling content.
   Portaling keeps the scene, HUD, and toggle truly viewport-fixed while the
   journey act moves beneath them. SSR-safe (renders nothing until mounted). */
function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* The journey act: a TALL scroll-driven section that is transparent over
   the fixed 3D for its whole height. Scrolling its span drives the full
   canopy -> L1-settlement descent (see the act-progress wiring below), so the
   transaction is actually WATCHED settling within the act; the detailed
   opaque sections then flow in beneath and reinforce it in words.

   The intro + beat legend live in a sticky, viewport-tall inner panel so
   they stay pinned and centred while the descent plays behind them, then
   release into the content. A legibility scrim keeps the (left-anchored)
   copy readable while leaving the tree visible. */
/* "Availability" (not the full "Data availability check") — the same
   short form EXPLAINER_STEPS[3].layer already uses below, reused here
   so this compact chip row fits on one line without inventing a term. */
const ACT_BEATS: { stage: string; name: string; layer: string }[] = [
  { stage: "01", name: "Submit", layer: "l2" },
  { stage: "02", name: "Sequence", layer: "l2" },
  { stage: "03", name: "Commit", layer: "l2" },
  { stage: "04", name: "Availability", layer: "bridge" },
  { stage: "05", name: "Watch", layer: "bridge" },
  { stage: "06", name: "Settle", layer: "l1" },
];

const EXPLAINER_STEPS = [
  {
    n: "01",
    title: "Submit",
    tone: "green",
    what: "A user submits a transaction through an app or wallet and receives a usable signal before final settlement.",
  },
  {
    n: "02",
    title: "Sequence",
    tone: "green",
    what: "An Operator orders valid activity into an L2 block for fast, inspectable execution.",
  },
  {
    n: "03",
    title: "Commit",
    tone: "green",
    what: "The Operator posts a compact state commitment to Cardano for public review.",
  },
  {
    n: "04",
    title: "Data availability check",
    tone: "gold",
    what: "Block data remains available so the commitment can be replayed and checked.",
  },
  {
    n: "05",
    title: "Watch",
    tone: "gold",
    what: "Watchers replay the block; a valid fault proof prevents bad state from settling.",
  },
  {
    n: "06",
    title: "Settle",
    tone: "cobalt",
    what: "After verification, state becomes final on Cardano.",
  },
] as const;

/* Replaced 2026-07-16 (Dave): the journey plate is now the ACTUAL home-hero
   painting (tree-hero-portrait) outpainted to 9:16 — extra sky above, the
   cliff extended below — so /learn descends the SAME signature tree the
   visitor just saw on the home page. Identity over invention: candidates
   that re-painted the tree (new forks/hollows/veins) were all rejected as
   "not the same tree". The orb draws its own light path down the measured
   trunk, so the plate needs no painted sap-vein. */
const WATER_COLOR_JOURNEY_PLATE = "/img/watercolor/journey-descent-hero.avif";

type NavigatorWithResourceHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function JourneyAct({
  actRef,
  beatsRef,
  onJumpToBeat,
  staticMode,
}: {
  actRef: React.RefObject<HTMLElement | null>;
  /** written each frame (parent's rAF) with the currently active beat index — a
      DOM ref, not React state, so the 6 buttons don't re-render every frame */
  beatsRef: React.RefObject<HTMLOListElement | null>;
  onJumpToBeat: (index: number) => void;
  /** Compact/coarse and motion-off viewports use one calm frame instead of the scroll ride. */
  staticMode: boolean;
}) {
  return (
    <section
      id="full-journey"
      className="hiw-act"
      aria-labelledby="full-journey-title"
      ref={actRef}
      data-static={staticMode ? "true" : "false"}
    >
      <div className="hiw-act__viewport">
        <div className="hiw-act__scrim" aria-hidden />
        <div className="hiw-act__intro">
          <h2 id="full-journey-title" className="hiw-act__title">
            The flow of a transaction
          </h2>
          <p className="hiw-act__lead">
            Watch Midgard order, publish, verify, and settle.
          </p>
          <ol className="hiw-act__beats" ref={beatsRef} aria-label="Jump to a stage in the journey">
            {ACT_BEATS.map((b, i) => (
              <li key={b.name} data-layer={b.layer}>
                <button
                  type="button"
                  className="hiw-act__beat-btn"
                  data-layer={b.layer}
                  onClick={() => {
                    if (!staticMode) onJumpToBeat(i);
                  }}
                  disabled={staticMode}
                  aria-label={`Jump to ${b.name}`}
                >
                  <span className="hiw-act__beat-n">{b.stage}</span>
                  <span className="hiw-act__beat-name">{b.name}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hiw-act__cue" aria-hidden>
            <span className="hiw-act__rail" />
            Scroll through the six stages
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksExplainer({ visuallyHidden = false }: { visuallyHidden?: boolean }) {
  /* the site's ONE textual telling of the pipeline (the journey act above
     tells it cinematically; home only trails it) — a plain static grid,
     every step's what + why always visible, no interaction required */
  return (
    <section
      className={`hiw-explainer${visuallyHidden ? " visually-hidden" : ""}`}
      aria-labelledby="hiw-explainer-title"
    >
      <div className="hiw-explainer__head">
        <h2 id="hiw-explainer-title">The transaction flow</h2>
        <p className="hiw-explainer__lead">
          Six steps move a transaction from soft confirmation to final settlement.
        </p>
      </div>
      <ol className="hiw-explainer__grid" aria-label="Transaction lifecycle, step by step">
        {EXPLAINER_STEPS.map((step) => {
          return (
            <li key={step.title} className="hiw-explainer__card" data-tone={step.tone}>
              <span className="hiw-explainer__card-n">{step.n}</span>
              <strong className="hiw-explainer__card-title">{step.title}</strong>
              <p className="hiw-explainer__card-what">{step.what}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function HowItWorksExperience({
  beforeJourney,
  children,
}: {
  /** Plain-language summary and proof shown before the immersive journey. */
  beforeJourney?: ReactNode;
  /** the detailed lifecycle sections, rendered beneath the journey act */
  children: ReactNode;
}) {
  const { motionOn, toggle } = useMotionPref();
  const { theme } = useTheme();
  const plateSrc = themedAsset(WATER_COLOR_JOURNEY_PLATE, theme);

  // desktop + motion-on gate for the heavy interaction systems
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Truly tiny viewports (landscape phones, embedded webviews) can't host the
  // pinned journey — fall back to the static composed frame + the
  // stacked recap sections (same path reduced motion uses). Laptops always
  // get the ride: the threshold sits below any normal browser window.
  // Mirrors the CSS @media (max-height: 480px) rules in globals.css.
  const [shortViewport, setShortViewport] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-height: 480px)");
    const apply = () => setShortViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // The full pinned ride needs both visual room and a precise pointer. Phones,
  // small tablets, and primary coarse-pointer devices get a calm plate plus
  // the existing static six-step explainer instead of a long unlabeled canvas.
  const [compactViewport, setCompactViewport] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 900px), (pointer: coarse)");
    const apply = () => setCompactViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Browser-provided capability hints let weaker laptops take the established
  // static path before the canvas and long pinned act start. Save-Data is an
  // explicit signal; four or fewer logical cores / 4 GB or less are common
  // indicators that the full-screen compositing workload is a poor trade.
  const [resourceConstrained, setResourceConstrained] = useState(false);
  const [runtimeFallback, setRuntimeFallback] = useState(false);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as NavigatorWithResourceHints;
    const cores = nav.hardwareConcurrency || 0;
    const memory = nav.deviceMemory || 0;
    const frame = requestAnimationFrame(() => {
      setResourceConstrained(
        nav.connection?.saveData === true ||
          (cores > 0 && cores <= 4) ||
          (memory > 0 && memory <= 4),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const journeyOn =
    motionOn &&
    !shortViewport &&
    !compactViewport &&
    !resourceConstrained &&
    !runtimeFallback;
  const advanced = journeyOn && finePointer;

  // Always use the TALL plate so EVERY viewport (incl. desktop) genuinely
  // descends the tree canopy -> L1 on scroll. The old wide-plate path on
  // wide/short viewports defeated the "travel down the tree" descent.
  const wide = false;

  // --- journey progress, scoped to the ACT span ---
  // The scene plays the FULL canopy -> L1 descent across the tall act, so the
  // transaction is watched settling within it (not stretched over the whole
  // page behind opaque sections). Native scroll remains the source of truth:
  // 0 when the act top hits the viewport top; 1 once its bottom reaches the
  // viewport bottom.
  const actRef = useRef<HTMLElement | null>(null);
  const journeyProgressRef = useRef(0);
  const sceneProgressRef = useRef(0);
  /* the beat-chip row — its active/current beat is written directly each
     frame below (matches the --journey-p pattern), not React state, so
     the 6 buttons don't re-render on every scroll tick */
  const beatsRef = useRef<HTMLOListElement | null>(null);

  // Live packet screen position (px), written each frame by PhotorealBackdrop
  // and read by the floating StageGraphic badge so it stays anchored to the
  // transaction on the tree — one source of truth, no drift from the comet.
  const packetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Preload the scene shortly before the act, but make it visible and active
  // as soon as the act enters the viewport so its first visible edge is never
  // blank. The floating UI waits for the sticky/pinned interval. At the release
  // boundary (when the act bottom reaches the viewport bottom), every scene
  // layer is hidden before later FAQ and glossary content can enter.
  const [sceneNearby, setSceneNearby] = useState(false);
  const [actActive, setActActive] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  useEffect(() => {
    let frame = 0;

    const setInactive = () => {
      setActActive(false);
      setOverlayActive(false);
      setSceneNearby(false);
    };
    const measure = () => {
      frame = 0;
      const act = actRef.current;
      if (!act || document.visibilityState !== "visible") {
        setInactive();
        return;
      }

      const rect = act.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const nearby =
        rect.bottom > -viewportHeight && rect.top < viewportHeight * 2;
      const active = journeyOn
        ? rect.top < viewportHeight && rect.bottom >= viewportHeight
        : rect.top < viewportHeight && rect.bottom > 0;
      const overlay = journeyOn
        ? rect.top <= 0 && rect.bottom >= viewportHeight
        : active;

      setSceneNearby(nearby);
      setActActive(active);
      setOverlayActive(overlay);
    };
    const scheduleMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        setInactive();
      } else {
        scheduleMeasure();
      }
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [journeyOn]);

  // Capability hints are incomplete on many browsers, so verify the real
  // experience as it runs. Two sustained low-frame-rate windows switch to the
  // complete static path; a single decode or scroll hitch is not enough.
  useEffect(() => {
    if (!actActive || !journeyOn || runtimeFallback) return;

    let raf = 0;
    let last = 0;
    let sampleStart = 0;
    let frames = 0;
    let slowFrames = 0;
    let consecutivePoorWindows = 0;

    const tick = (now: number) => {
      if (!sampleStart) {
        // Let the plate decode and the compositor warm up before measuring.
        sampleStart = now + 1000;
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      if (now < sampleStart) {
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }

      const delta = now - last;
      last = now;
      // Ignore a background-tab pause; visibility handling suspends the scene.
      if (delta < 250) {
        frames += 1;
        if (delta > 30) slowFrames += 1;
      }

      const elapsed = now - sampleStart;
      if (elapsed >= 2000) {
        const fps = frames / (elapsed / 1000);
        const slowRatio = frames > 0 ? slowFrames / frames : 1;
        const poor = fps < 42 || slowRatio > 0.4;
        consecutivePoorWindows = poor ? consecutivePoorWindows + 1 : 0;

        if (consecutivePoorWindows >= 2) {
          setRuntimeFallback(true);
          return;
        }

        sampleStart = now;
        frames = 0;
        slowFrames = 0;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [actActive, journeyOn, runtimeFallback]);

  // Every label follows the scene's already-eased progress so the transaction,
  // stage card, beat chips, and HUD all change together.
  const stageProgress = useMotionValue(0);
  useEffect(() => {
    const act = actRef.current;
    if (!actActive || !act) return;

    if (!journeyOn) {
      const staticProgress = 0.42;
      journeyProgressRef.current = staticProgress;
      sceneProgressRef.current = staticProgress;
      act.style.setProperty("--journey-p", staticProgress.toFixed(4));
      stageProgress.set(staticProgress);
      return;
    }

    let raf = 0;
    const tick = () => {
      const rect = act.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      journeyProgressRef.current = clamp(-rect.top / span);
      // drives the intro/cue fade-out in CSS — the scroll cue must clear
      // long before the released panel can slide under the nav logo.
      act.style.setProperty("--journey-p", journeyProgressRef.current.toFixed(4));
      const beats = beatsRef.current;
      if (beats) {
        const active = journeyStageIndex(sceneProgressRef.current);
        if (beats.dataset.active !== String(active)) {
          beats.dataset.active = String(active);
          /* mirror the visual active state for assistive tech — only runs
             when the active beat CHANGES, not every frame */
          beats.querySelectorAll("button").forEach((btn, i) => {
            if (i === active) btn.setAttribute("aria-current", "step");
            else btn.removeAttribute("aria-current");
          });
        }
      }
      stageProgress.set(sceneProgressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [actActive, journeyOn, stageProgress]);

  // Jump the native scroll position so the act lands on beat i's midpoint.
  const jumpToBeat = useCallback((index: number) => {
    const act = actRef.current;
    if (!act) return;
    const rect = act.getBoundingClientRect();
    const span = Math.max(1, rect.height - window.innerHeight);
    const currentProgress = clamp(-rect.top / span);
    const targetProgress = journeyStageCenter(index);
    const deltaY = (targetProgress - currentProgress) * span;
    window.scrollTo({ top: window.scrollY + deltaY, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Fixed/viewport layers live in <body> so they stay truly fixed. */}
      <BodyPortal>
        {sceneNearby ? (
          <div
            className="scene-stage"
            data-journey-active={actActive ? "true" : "false"}
            aria-hidden={!actActive}
          >
            <PhotorealBackdrop
              key={plateSrc}
              active={actActive}
              plateSrc={plateSrc}
              progressRef={journeyProgressRef}
              visualProgressRef={sceneProgressRef}
              packetRef={packetRef}
              motionOn={journeyOn && actActive}
              wide={wide}
            />
            {/* The on-tree badge exists only while the act owns the viewport,
                so it cannot drift over the FAQ/glossary that follow. */}
            {overlayActive ? (
              <StageGraphic
                progress={stageProgress}
                packetRef={packetRef}
                enabled={advanced}
              />
            ) : null}
            {/* spine rail + live Watcher readout — desktop, motion-on only */}
            {overlayActive && advanced ? <JourneyHud progress={stageProgress} /> : null}
          </div>
        ) : null}
        <MotionToggle on={motionOn} onToggle={toggle} />
      </BodyPortal>

      {/* The journey act is transparent over the fixed plate; the detailed
          sections below stay opaque. */}
      <main
        className="page-main page-main--how-it-works page-main--hiw-experience"
        data-journey-mode={journeyOn ? "immersive" : "static"}
        data-performance-fallback={runtimeFallback ? "true" : undefined}
      >
        {beforeJourney}
        <JourneyAct
          actRef={actRef}
          beatsRef={beatsRef}
          onJumpToBeat={jumpToBeat}
          staticMode={!journeyOn}
        />
        <HowItWorksExplainer visuallyHidden={journeyOn} />
        {children}
      </main>
    </>
  );
}
