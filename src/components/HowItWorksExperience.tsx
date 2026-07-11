"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useSpring } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import JourneyHud from "@/components/scene/JourneyHud";
import { useMotionPref } from "@/lib/motion";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { useTheme, themedAsset } from "@/lib/theme";

/* ============================================================
   HowItWorksExperience — the FLAGSHIP "ride a transaction" act,
   relocated from the old home page and re-homed as the immersive
   centerpiece of /learn.

   The page opens with a full-viewport JOURNEY ACT where a PHOTOREAL
   tree PLATE plays the scroll-driven canopy -> L1-settlement descent (the
   visual lifecycle) via a parallax pan, with LIVE green overlays
   (beams, network pulses, leaves, ADA diamonds) layered over it, and a
   HUD chapter rail whose labels are aligned to the
   page's protocol-lifecycle language (Submit · L2 -> Sequence ->
   Commit -> data availability check -> Watch -> Settle · L1). The detailed textual sections below
   the act reinforce what the 3D just showed.

   This component owns the two RESN-class interaction systems, all
   desktop + fine-pointer + motion-on only and fully bypassed under
   reduced motion (so the page reads as normally-stacked sections over
   a single composed frame):

     1. inertial smooth scroll (useSmoothScroll) — native scrollbar
        kept, the (site) layout's [data-scroll-content] wrapper is
        rAF-lerped for weight.
     2. a spring-smoothed scroll progress feeding BOTH the 3D scene
        (buttery beats) and the HUD chapter labels.

   Because the experience mounts only on this route and unmounts on
   navigation, these systems activate ONLY where this component is mounted —
   useSmoothScroll clears its fixed-layout hijack on unmount, so every
   other route is untouched.
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

/* Render fixed overlay layers into <body>, OUTSIDE the smooth-scroll
   transform wrapper. A `position: fixed` element inside a transformed
   ancestor is positioned relative to that ancestor and would be dragged
   by the scroll translate; portaling to body keeps the 3D stage, HUD,
   cursor and toggle truly viewport-fixed. SSR-safe (renders nothing
   until mounted). */
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
const ACT_BEAT_COUNT = ACT_BEATS.length;

const EXPLAINER_STEPS = [
  {
    n: "01",
    title: "Submit",
    layer: "L2 entry",
    what: "A user submits a transaction to Midgard, usually through an app or wallet.",
    check: "The transaction is validated against UTXO rules before it enters the ordered flow.",
    why: "The user can get a faster usable signal without waiting for final settlement.",
  },
  {
    n: "02",
    title: "Sequence",
    layer: "Operator",
    what: "An operator orders valid activity into an L2 block.",
    check: "The order becomes part of the state that other parties can replay.",
    why: "Applications get fast execution while the order remains inspectable.",
  },
  {
    n: "03",
    title: "Commit",
    layer: "Cardano L1 path",
    what: "The operator posts a compact block header to the Cardano L1 settlement path.",
    check: "The commitment points to state that must remain available and challengeable.",
    why: "Midgard does not ask users to trust a private operator database.",
  },
  {
    n: "04",
    title: "Data availability check",
    layer: "Availability",
    what: "Block data is made available so commitments can be replayed and inspected.",
    check: "Reviewers need the data required to replay the committed state.",
    why: "A commitment is not useful if the underlying data cannot be checked.",
  },
  {
    n: "05",
    title: "Watch",
    layer: "Challenge",
    what: "Watchers replay committed blocks; a valid fault proof keeps bad state from settling.",
    check: "Invalid commitments can be challenged before they become settled state.",
    why: "Operators do not get the final word on correctness.",
  },
  {
    n: "06",
    title: "Settle",
    layer: "Cardano L1 finality",
    what: "If no valid fault proof succeeds, verified state settles through Cardano L1.",
    check: "After the verification path clears, finalized state inherits Cardano L1 security.",
    why: "Fast execution and final settlement stay separate, clear, and reviewable.",
  },
] as const;

/* Redesigned 2026-07-11: the previous plate (journey-flow-tall) was a
   symmetric, near-uniform trunk, so the five FOCALS_TALL dwell/zoom stops
   below all looked nearly identical as the camera panned — the descent
   didn't read as travel. This plate is purpose-built with a distinct scene
   at each stop: sunlit canopy -> a gnarled branch fork -> a weathered
   trunk hollow -> mossy roots over boulders -> the sap-light pooling into
   a glowing basin at the base (the "Settle" payoff). */
const WATER_COLOR_JOURNEY_PLATE = "/img/watercolor/journey-descent.avif";

function JourneyAct({
  actRef,
  beatsRef,
  onJumpToBeat,
}: {
  actRef: React.RefObject<HTMLElement | null>;
  /** written each frame (parent's rAF) with the currently active beat index — a
      DOM ref, not React state, so the 6 buttons don't re-render every frame */
  beatsRef: React.RefObject<HTMLOListElement | null>;
  onJumpToBeat: (index: number) => void;
}) {
  return (
    <section className="hiw-act" aria-label="Transaction journey" ref={actRef}>
      <div className="hiw-act__viewport">
        <div className="hiw-act__scrim" aria-hidden />
        <div className="hiw-act__intro">
          <h1 className="hiw-act__title">
            Flow of a{" "}
            <span style={{ color: "var(--green-bright)" }}>transaction</span>
          </h1>
          <p className="hiw-act__lead">
            You never touch the lifecycle directly: deposit once, transact as
            much as you like, and withdraw when you&apos;re done. Midgard runs
            everything else underneath — follow a transaction all the way down
            to Cardano.
          </p>
          <ol className="hiw-act__beats" ref={beatsRef} aria-label="Jump to a stage in the journey">
            {ACT_BEATS.map((b, i) => (
              <li key={b.name} data-layer={b.layer}>
                <button
                  type="button"
                  className="hiw-act__beat-btn"
                  data-layer={b.layer}
                  onClick={() => onJumpToBeat(i)}
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
            Scroll to follow it down
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksExplainer() {
  /* the site's ONE textual telling of the pipeline (the journey act above
     tells it cinematically; home only trails it) — a plain static grid,
     every step's what + why always visible, no interaction required */
  return (
    <section className="hiw-explainer" aria-labelledby="hiw-explainer-title">
      <div className="hiw-explainer__head">
        <p>Transaction path</p>
        <h2 id="hiw-explainer-title">Fast execution first. Verification before final settlement.</h2>
        <p className="hiw-explainer__lead">
          Six steps take every transaction from instant soft confirmation on
          Midgard to irreversible settlement on Cardano.
        </p>
      </div>
      <ol className="hiw-explainer__grid" aria-label="Transaction lifecycle, step by step">
        {EXPLAINER_STEPS.map((step) => {
          const tone = step.layer.includes("L1")
            ? "cobalt"
            : step.layer === "Challenge" || step.layer === "Availability"
              ? "gold"
              : "green";
          return (
            <li key={step.title} className="hiw-explainer__card" data-tone={tone}>
              <span className="hiw-explainer__card-n">{step.n}</span>
              <span className="hiw-explainer__card-layer">{step.layer}</span>
              <strong className="hiw-explainer__card-title">{step.title}</strong>
              <p className="hiw-explainer__card-what">{step.what}</p>
              <p className="hiw-explainer__card-why">{step.why}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function HowItWorksExperience({
  children,
}: {
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
  // pinned 800vh journey — fall back to the static composed frame + the
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

  const journeyOn = motionOn && !shortViewport;
  const advanced = journeyOn && finePointer;

  // Always use the TALL plate so EVERY viewport (incl. desktop) genuinely
  // descends the tree canopy -> L1 on scroll. The old wide-plate path on
  // wide/short viewports defeated the "travel down the tree" descent.
  const wide = false;

  // --- inertial smooth scroll (whole-page transform) ---
  // The hook keeps the native scrollbar but rAF-lerps the (site) layout's
  // [data-scroll-content] wrapper for weight. We don't read its whole-page
  // progress for the scene (the journey is scoped to the ACT, below); we keep
  // the hook for the buttery transform that the act-progress then inherits.
  const smoothProgressRef = useRef(0);
  useSmoothScroll(smoothProgressRef, motionOn);

  // --- journey progress, scoped to the ACT span ---
  // The scene plays the FULL canopy -> L1 descent across the tall act, so the
  // transaction is watched settling within it (not stretched over the whole
  // page behind opaque sections). Computed each rAF from the act element's
  // rect, which reflects the smooth-scroll transform — so the descent inherits
  // the inertial smoothing for free. 0 when the act top hits the viewport top;
  // 1 once its bottom has scrolled up to the viewport bottom.
  const actRef = useRef<HTMLElement | null>(null);
  const journeyProgressRef = useRef(0);
  /* the beat-chip row — its active/current beat is written directly each
     frame below (matches the --journey-p pattern), not React state, so
     the 6 buttons don't re-render on every scroll tick */
  const beatsRef = useRef<HTMLOListElement | null>(null);

  // Live packet screen position (px), written each frame by PhotorealBackdrop
  // and read by the floating StageGraphic badge so it stays anchored to the
  // transaction on the tree — one source of truth, no drift from the comet.
  const packetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // A spring MotionValue the HUD subscribes to; fed each frame from the
  // act-progress (buttery, no jumps). Softer + heavier (client note: slower /
  // calmer descent) so the HUD's stage changes ease in sympathy with the
  // gentler plate pan rather than snapping at thresholds.
  const springProgress = useSpring(0, { stiffness: 52, damping: 24, mass: 0.9 });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const act = actRef.current;
      if (act) {
        const rect = act.getBoundingClientRect();
        const span = Math.max(1, rect.height - window.innerHeight);
        journeyProgressRef.current = clamp(-rect.top / span);
        // drives the intro/cue fade-out in CSS — the scroll cue must clear
        // long before the released panel can slide under the nav logo.
        act.style.setProperty("--journey-p", journeyProgressRef.current.toFixed(4));
        const beats = beatsRef.current;
        if (beats) {
          const active = Math.min(
            ACT_BEAT_COUNT - 1,
            Math.max(0, Math.floor(journeyProgressRef.current * ACT_BEAT_COUNT)),
          );
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
      }
      springProgress.set(journeyProgressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [springProgress]);

  // Jump the (real, native) scroll position so the act lands on beat i's
  // midpoint. The smooth-scroll hook above already lerps window.scrollY into
  // a buttery transform, so a plain scrollTo here inherits that easing for
  // free — no separate animation path to keep in sync.
  const jumpToBeat = useCallback((index: number) => {
    const act = actRef.current;
    if (!act) return;
    const rect = act.getBoundingClientRect();
    const span = Math.max(1, rect.height - window.innerHeight);
    const currentProgress = clamp(-rect.top / span);
    const targetProgress = clamp((index + 0.5) / ACT_BEAT_COUNT);
    const deltaY = (targetProgress - currentProgress) * span;
    window.scrollTo({ top: window.scrollY + deltaY, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Fixed/viewport layers live in <body>, escaping the smooth-scroll
          transform wrapper so they stay truly fixed (see BodyPortal). */}
      <BodyPortal>
        <div className="scene-stage">
          <PhotorealBackdrop
            key={plateSrc}
            plateSrc={plateSrc}
            progressRef={journeyProgressRef}
            packetRef={packetRef}
            motionOn={journeyOn}
            wide={wide}
          />
          {/* the floating on-tree stage badge lives INSIDE .scene-stage so it
              sits over the plate + post stack; it anchors to the live packet
              (packetRef) and rides the journey. Tracking is gated to advanced
              (desktop + fine pointer + motion-on); otherwise a static label. */}
          <StageGraphic
            progress={springProgress}
            packetRef={packetRef}
            enabled={advanced}
          />
          {/* spine rail + live Watcher readout — desktop, motion-on only */}
          {advanced ? <JourneyHud progress={springProgress} /> : null}
        </div>
        <MotionToggle on={motionOn} onToggle={toggle} />
      </BodyPortal>

      {/* The scrolling content. The (site) layout wraps this + the footer in
          [data-scroll-content], which the inertial-scroll hook translates.
          The journey act is transparent over the fixed plate; the detailed
          sections below stay opaque. */}
      <main className="page-main page-main--how-it-works page-main--hiw-experience">
        <JourneyAct actRef={actRef} beatsRef={beatsRef} onJumpToBeat={jumpToBeat} />
        <HowItWorksExplainer />
        {children}
      </main>
    </>
  );
}
