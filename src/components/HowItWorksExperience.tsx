"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useSpring } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMotionPref } from "@/lib/motion";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

/* ============================================================
   HowItWorksExperience — the FLAGSHIP "ride a transaction" act,
   relocated from the old home page and re-homed as the immersive
   centerpiece of /how-it-works.

   The page opens with a full-viewport JOURNEY ACT where a PHOTOREAL
   tree PLATE plays the scroll-driven canopy -> Cardano-L1 descent (the
   visual lifecycle) via a parallax pan, with LIVE green overlays
   (beams, network pulses, leaves, ADA diamonds) layered over it, and a
   HUD chapter rail whose labels are aligned to the
   page's protocol-lifecycle language (Submit · L2 -> Sequence ->
   Commit -> Watch -> Settle · L1). The detailed textual sections —
   ProtocolLifecycle, the Layers reference, the eUTXO comparison —
   flow in beneath the act and reinforce what the 3D just showed.

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
   navigation, these systems activate ONLY on /how-it-works —
   useSmoothScroll clears its fixed-layout hijack on unmount, so /home
   (native) and every other route are untouched.
   ============================================================ */

// The PHOTOREAL variant: instead of a WebGL JourneyScene, the backdrop is an
// AI-generated photoreal tree PLATE that parallax-pans canopy -> roots with
// LIVE green overlays (beams / network pulses / leaves / diamonds) on a canvas.
const PhotorealBackdrop = dynamic(() => import("./scene/PhotorealBackdrop"), {
  ssr: false,
});
// The floating on-tree stage badge — rides the descending packet and surfaces
// the active lifecycle stage (replaces the old fixed HUD panel + emoji marker).
const StageGraphic = dynamic(() => import("./scene/StageGraphic"), {
  ssr: false,
});
// playful "draw with light" cursor toy: a held pointer paints a soft green
// glowing orb + fading trail. Pointer-events:none overlay, desktop/motion only.
const LightOrbLayer = dynamic(() => import("./LightOrbLayer"), { ssr: false });

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

/* ----------------------------------------------------------------
   Lightweight 3D-tilt for cards (data-tilt). Pointer-position drives
   a small rotateX/rotateY via CSS vars; resets on leave. Desktop +
   motion-on only (gated by the parent). Composes with the magnetic
   translate (different vars) and the card's own hover styles.
   (Verbatim from the old Gateway wiring — re-homed here.)
   ---------------------------------------------------------------- */
function useCardTilt(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt]"),
    );
    const handlers: Array<() => void> = [];
    cards.forEach((card) => {
      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-py * 7).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(px * 9).toFixed(2)}deg`);
        card.style.setProperty("--sheen-x", `${((px + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty("--sheen-y", `${((py + 0.5) * 100).toFixed(1)}%`);
      };
      const onLeave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      handlers.push(() => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      });
    });
    return () => handlers.forEach((h) => h());
  }, [active]);
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
   canopy -> Cardano-L1 descent (see the act-progress wiring below), so the
   transaction is actually WATCHED settling within the act; the detailed
   opaque sections then flow in beneath and reinforce it in words.

   The intro + beat legend live in a sticky, viewport-tall inner panel so
   they stay pinned and centred while the descent plays behind them, then
   release into the content. A legibility scrim keeps the (left-anchored)
   copy readable while leaving the tree visible. */
const ACT_BEATS: { stage: string; name: string; layer: string }[] = [
  { stage: "01", name: "Submit", layer: "l2" },
  { stage: "02", name: "Sequence", layer: "l2" },
  { stage: "03", name: "Commit", layer: "l2" },
  { stage: "04", name: "Watch", layer: "bridge" },
  { stage: "05", name: "Settle", layer: "l1" },
];

function JourneyAct({ actRef }: { actRef: React.RefObject<HTMLElement | null> }) {
  return (
    <section className="hiw-act" aria-label="Transaction journey" ref={actRef}>
      <div className="hiw-act__viewport">
        <div className="hiw-act__scrim" aria-hidden />
        <div className="hiw-act__intro">
          <div className="eyebrow">How it works</div>
          <h1 className="hiw-act__title">
            Watch a transaction
            <br />
            travel to{" "}
            <span style={{ color: "var(--green-bright)" }}>Cardano</span>
          </h1>
          <p className="hiw-act__lead">
            Midgard is a Cardano-native optimistic rollup. Scroll to ride one
            transaction down the world&nbsp;tree — born in the canopy on L2,
            sequenced and committed, watched through the challenge window, and
            settled into the cobalt bedrock of Cardano&nbsp;L1.
          </p>
          <ol className="hiw-act__beats" aria-hidden>
            {ACT_BEATS.map((b) => (
              <li key={b.name} data-layer={b.layer}>
                <span className="hiw-act__beat-n">{b.stage}</span>
                <span className="hiw-act__beat-name">{b.name}</span>
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

export default function HowItWorksExperience({
  children,
}: {
  /** the detailed lifecycle sections, rendered beneath the journey act */
  children: ReactNode;
}) {
  const { motionOn, toggle } = useMotionPref();

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
      }
      springProgress.set(journeyProgressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [springProgress]);

  useCardTilt(advanced);

  return (
    <>
      {/* Fixed/viewport layers live in <body>, escaping the smooth-scroll
          transform wrapper so they stay truly fixed (see BodyPortal). */}
      <BodyPortal>
        <div className="scene-stage">
          <PhotorealBackdrop
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
        </div>
        {/* light-painting orb: above the scene, below the cursor. Gated to
            desktop + fine pointer + motion-on (advanced). */}
        <LightOrbLayer enabled={advanced} />
        <MotionToggle on={motionOn} onToggle={toggle} />
      </BodyPortal>

      {/* The scrolling content. The (site) layout wraps this + the footer in
          [data-scroll-content], which the inertial-scroll hook translates.
          The journey act is transparent over the fixed plate; the detailed
          sections below stay opaque. */}
      <main className="page-main page-main--how-it-works page-main--hiw-experience">
        <JourneyAct actRef={actRef} />
        {children}
      </main>
    </>
  );
}
