"use client";

/* ============================================================
   StageGraphic — the floating on-tree stage badge that RIDES the
   transaction journey.

   Replaces both the old fixed right-edge HUD panel (ChapterLabels) AND
   the little emoji-glyph marker that used to track the packet. Instead of
   a detached corner panel + a flat icon, this is ONE elegant, luminous
   glass badge that lives ON the tree: it floats beside the descending
   packet at the active stage's location and travels with it down the
   world tree —

     SUBMIT · L2 (canopy) -> SEQUENCE -> COMMIT (upper/mid trunk) ->
     WATCH (lower trunk, challenge window) -> SETTLE · L1 (roots).

   Anchoring: the badge follows the LIVE packet screen-position that
   PhotorealBackdrop publishes each frame into a shared ref (single source
   of truth, so the plate pan, the comet, and this badge never drift
   apart). It sits to the SIDE of the packet (auto-flipping left/right so
   it never crosses the centre focal action) and is clamped into the
   viewport, so as the packet rides canopy -> roots the badge rides with
   it and naturally sits over the right band of the tree per stage.

   Content per stage: a custom luminous glyph, the L2/L1 tag, the stage
   NAME, and one compact line of copy — set over a soft local scrim/glow
   so it stays legible over the photoreal scene. On each stage change the
   whole badge cross-fades + drifts a hair (content swap), and the glyph
   re-pops. Green = Midgard L2, gold = the on-chain challenge bridge,
   cobalt = Cardano L1, matched to the scene's own colour language.

   Perf: pure DOM. Position + opacity are written imperatively from a
   single rAF loop reading refs (the packet ref + the live stage index);
   React re-renders ONLY when the active stage index changes (5x across
   the whole act), driven off the spring MotionValue. No per-scroll React
   state, no per-frame React work.

   Fallback: motion-off / reduced-motion / small / touch — the rAF
   tracking is bypassed and a simpler STATIC label is shown, pinned to a
   calm spot (or hidden on very small screens, as the old HUD did, via
   CSS). ============================================================ */

import { useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type Layer = "l2" | "bridge" | "l1";

type Stage = {
  id: string;
  /** the L2 / L1 stage tag */
  tag: string;
  /** the stage NAME (display) */
  name: string;
  /** one compact line of supporting copy */
  line: string;
  layer: Layer;
};

/* The five lifecycle stages + the lifecycle copy, intact from the HUD:
   Submit · L2 -> Sequence -> Commit (settle to L1) -> Watch (challenge) ->
   Settle · L1. The badge keeps the narrative; the line is the compact
   description so the floating graphic stays light over the scene. */
const STAGES: Stage[] = [
  {
    id: "submit",
    tag: "Off-chain · L2",
    name: "Submit",
    line: "Validated against eUTXO rules — a soft confirmation, no L1 block wait.",
    layer: "l2",
  },
  {
    id: "sequence",
    tag: "L2 Operator",
    name: "Sequence",
    line: "The operator orders transactions and assembles a block.",
    layer: "l2",
  },
  {
    id: "commit",
    tag: "L1 State Queue",
    name: "Commit",
    line: "The block header enters Cardano's on-chain state queue, operator bond locked.",
    layer: "l2",
  },
  {
    id: "watch",
    tag: "Challenge Window",
    name: "Watch",
    line: "Watchers replay every transaction and check validity against Cardano.",
    layer: "bridge",
  },
  {
    id: "settle",
    tag: "L1 Confirmed",
    name: "Settle",
    line: "No fraud, maturity ends — merged into state, as final as Cardano itself.",
    layer: "l1",
  },
];

/* SAME thresholds as the scene's stageOf / the old HUD, so the badge swaps
   on the exact scroll positions the camera dwells + the canvas beats fire. */
function stageIndex(p: number): number {
  if (p >= 0.84) return 4;
  if (p >= 0.58) return 3;
  if (p >= 0.4) return 2;
  if (p >= 0.14) return 1;
  return 0;
}

/* Per-stage custom glyph — a refined inline SVG (currentColor so it tints
   per layer), one motif per stage. Submit = a tx spark, Sequence = ordered
   rows, Commit = a settling block, Watch = a watching eye, Settle = an
   anchor at L1. Drawn at a comfortable size inside the glass medallion. */
function StageGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "submit":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.6 2.6M15.8 15.8l2.6 2.6M18.4 5.6l-2.6 2.6M8.2 15.8l-2.6 2.6" />
          <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "sequence":
      return (
        <svg {...common}>
          <path d="M9 6.5h11M9 12h11M9 17.5h11" />
          <circle cx="4.6" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4.6" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4.6" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "commit":
      return (
        <svg {...common}>
          <path d="M12 2.6l8 4.6v9.6l-8 4.6-8-4.6V7.2z" />
          <path d="M12 2.6v9.6M12 12.2l8-4.6M12 12.2l-8-4.6" />
        </svg>
      );
    case "watch":
      return (
        <svg {...common}>
          <path d="M2.2 12C4 8.4 7.6 5.4 12 5.4S20 8.4 21.8 12C20 15.6 16.4 18.6 12 18.6S4 15.6 2.2 12Z" />
          <circle cx="12" cy="12" r="2.7" />
        </svg>
      );
    case "settle":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="4.6" r="2" />
          <path d="M12 6.6V21M5 12H3.4a8.6 8.6 0 0 0 17.2 0H19M8.6 9.6h6.8" />
        </svg>
      );
  }
}

export default function StageGraphic({
  progress,
  packetRef,
  enabled,
}: {
  /** smoothed 0..1 scroll progress (the spring MotionValue) */
  progress: MotionValue<number>;
  /** live packet screen position in px, published by PhotorealBackdrop */
  packetRef: RefObject<{ x: number; y: number }>;
  /** advanced (desktop + fine pointer + motion-on): drives the tracking */
  enabled: boolean;
}) {
  const [active, setActive] = useState(() => stageIndex(progress.get()));
  const rootRef = useRef<HTMLDivElement>(null);

  // swap the active stage when the index crosses a threshold (5x total).
  // (The top-of-page fade --sg-fade is driven by the rAF loop while tracking;
  // in the static fallback the badge stays at full opacity.)
  useMotionValueEvent(progress, "change", (v) => {
    const idx = stageIndex(v);
    setActive((prev) => (prev === idx ? prev : idx));
  });

  // ---- follow the live packet, imperatively (no per-frame React state) ----
  // The badge sits to the side of the packet head, auto-flipping so it never
  // crosses the centre focal action, and is clamped into the viewport. As the
  // packet rides canopy -> roots, the badge rides with it — so it's anchored
  // ON the tree at the active stage's band.
  useEffect(() => {
    const el = rootRef.current;
    if (!enabled) {
      // static fallback: clear any imperative transform/fade left from a
      // previous tracking session so the CSS (.stage-graphic--static) places
      // it at the calm pinned spot and full opacity.
      if (el) {
        el.style.removeProperty("transform");
        el.style.removeProperty("--sg-fade");
      }
      return;
    }
    if (!el) return;
    let raf = 0;
    // remembered side so a hair of packet sway near centre can't make the
    // badge flip-flop frame to frame (hysteresis around the midline).
    let side: "left" | "right" = "right";
    // hide until the packet position is real (avoids a 1-frame top-left flash
    // before PhotorealBackdrop's loop publishes the first packet position).
    let positioned = false;
    el.style.setProperty("--sg-fade", "0");
    const tick = () => {
      const pk = packetRef.current;
      if (pk && (pk.x !== 0 || pk.y !== 0)) {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const rect = el.getBoundingClientRect();
        const bw = rect.width || 240;
        const bh = rect.height || 96;
        const gap = 40; // clear of the comet head + its bloom
        const m = 16; // viewport margin
        // Choose the side with MORE room so the badge sits beside the packet
        // and clear of the centre focal action, without being clamped against
        // an edge. Hysteresis (a 6% dead-band around the packet) keeps it
        // from flipping while the packet sways across the midline.
        const roomLeft = pk.x - gap - bw - m; // space if placed to the left
        const roomRight = W - m - (pk.x + gap + bw); // space if placed right
        const bias = W * 0.06;
        if (side === "right" && roomLeft > roomRight + bias) side = "left";
        else if (side === "left" && roomRight > roomLeft + bias) side = "right";
        let left = side === "right" ? pk.x + gap : pk.x - gap - bw;
        // vertically centre the badge on the packet head
        let top = pk.y - bh / 2;
        // clamp into the viewport (top margin clears the fixed site nav).
        // Keep the badge off the far-left edge — sit it a bit further to the
        // RIGHT, nearer the tree (per request), while still beside the packet.
        left = clamp(left, Math.min(W * 0.12, W - bw - m), W - bw - m);
        top = clamp(top, m + 56, H - bh - m);
        el.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
        el.dataset.side = side;
        // reveal once positioned; fade down at the very top so the hero/intro
        // breathes, back up once the journey begins. This loop is the sole
        // authority for --sg-fade while tracking.
        positioned = true;
        el.style.setProperty("--sg-fade", progress.get() < 0.02 ? "0" : "1");
      } else if (!positioned) {
        el.style.setProperty("--sg-fade", "0");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, packetRef, progress]);

  const s = STAGES[active];

  return (
    <div
      className={`stage-graphic${enabled ? "" : " stage-graphic--static"}`}
      data-layer={s.layer}
      aria-hidden
      ref={rootRef}
    >
      {/* soft local glow/scrim behind the badge so text stays legible over
          the photoreal scene without a hard panel */}
      <div className="stage-graphic__glow" aria-hidden />

      {/* the badge content — keyed by stage id so React swaps the subtree on
          stage change, retriggering the cross-fade/drift entrance */}
      <div className="stage-graphic__card" key={s.id} data-layer={s.layer}>
        <span className="stage-graphic__medallion" aria-hidden>
          <StageGlyph id={s.id} />
        </span>
        <div className="stage-graphic__body">
          <div className="stage-graphic__head">
            <span className="stage-graphic__tag">{s.tag}</span>
            <span className="stage-graphic__count">
              {String(active + 1).padStart(2, "0")}
              <span className="stage-graphic__count-sep">/</span>
              {String(STAGES.length).padStart(2, "0")}
            </span>
          </div>
          <div className="stage-graphic__name">{s.name}</div>
          <p className="stage-graphic__line">{s.line}</p>
        </div>
      </div>
    </div>
  );
}
