"use client";

/* ============================================================
   ChapterLabels — the HUD instrument panel that tracks the descent.

   Reads the same smoothed scroll progress the 3D scene uses (a
   MotionValue) and surfaces the FULL detail of the currently-active
   lifecycle step as a fixed, right-edge info panel. The five steps are
   aligned 1:1 with the How It Works protocol lifecycle so the 3D act and
   the textual sections beneath it reinforce each other:

     SUBMIT · L2 -> SEQUENCE -> COMMIT (Settle to L1) ->
     WATCH (Challenge window) -> SETTLE · L1

   For the ACTIVE step the panel shows: the step number (NN / 05), a
   per-step mini-icon, the full TITLE, the L2/L1 stage TAG, and the full
   DESCRIPTION — so the viewer reads the complete step, not a teaser. A
   compact 5-dot stepper at the foot keeps overall progress legible. Green
   / gold = Midgard L2 + the on-chain challenge bridge, cobalt = Cardano L1.

   Pure DOM (uses the .hud-* kit + a few scoped classes). Updates
   imperatively from the MotionValue so it never re-renders per scroll —
   the panel re-renders only when the active STEP index changes (5 times
   across the whole act). Hidden under reduced motion / small / touch (the
   page reads as stacked sections and the panel wouldn't track a descent).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

type Chapter = {
  id: string;
  /** short stepper label */
  label: string;
  /** full step title shown in the active panel */
  title: string;
  /** the L2 / L1 stage tag */
  tag: string;
  /** the full step description */
  desc: string;
  layer: "l2" | "bridge" | "l1";
  /** per-stage mini-icon (stroked SVG data URI), set as a CSS bg --icon */
  icon: string;
};

/* Per-stage mini-icon glyphs (data URIs), matching the on-scene language so
   the HUD and the scene tell the SAME story: Submit = a tx spark, Sequence =
   ordered lines, Commit = a block/cube, Watch = an eye/shield, Settle = an
   anchor. Hard brand colours so they read on the panel's dark glass. */
const ICONS = {
  submit:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#3be863' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3'/><circle cx='12' cy='12' r='2.4' fill='#3be863' stroke='none'/></svg>`,
    ),
  sequence:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#3be863' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M8 6h12M8 12h12M8 18h12'/><circle cx='4' cy='6' r='1.4' fill='#3be863' stroke='none'/><circle cx='4' cy='12' r='1.4' fill='#3be863' stroke='none'/><circle cx='4' cy='18' r='1.4' fill='#3be863' stroke='none'/></svg>`,
    ),
  commit:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#3be863' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2.6l8 4.6v9.6l-8 4.6-8-4.6V7.2z'/><path d='M12 2.6v9.6M12 12.2l8-4.6M12 12.2l-8-4.6'/></svg>`,
    ),
  watch:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#e0a33c' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z'/><circle cx='12' cy='12' r='2.7'/></svg>`,
    ),
  settle:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#6fe0ff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='4.5' r='2'/><path d='M12 6.5V21M5 12H3.5a8.5 8.5 0 0 0 17 0H19M8.5 9.5h7'/></svg>`,
    ),
} as const;

/* Aligned with the lifecycle steps + the canvas beats: Submit · L2 ->
   Sequence -> Commit (settle to L1) -> Watch (challenge) -> Settle · L1.
   FULL client copy (title / tag / description) per step — the HUD is the
   detailed reference for the active step. */
const CHAPTERS: Chapter[] = [
  {
    id: "submit",
    label: "Submit",
    title: "Transact on Midgard",
    tag: "Off-chain · L2",
    desc: "The Midgard node validates activity against eUTXO rules and issues a soft confirmation without waiting for an L1 block.",
    layer: "l2",
    icon: ICONS.submit,
  },
  {
    id: "sequence",
    label: "Sequence",
    title: "Sequence & Batch",
    tag: "L2 Operator",
    desc: "The active operator orders transactions and assembles a block using the same eUTXO model as Cardano L1.",
    layer: "l2",
    icon: ICONS.sequence,
  },
  {
    id: "commit",
    label: "Commit",
    title: "Settle to Cardano L1",
    tag: "L1 State Queue",
    desc: "The block is assembled, signed, and prepared for the Cardano anchor. The header is stored in the on-chain state queue, with the operator bond locked against fraud.",
    layer: "l2",
    icon: ICONS.commit,
  },
  {
    id: "watch",
    label: "Watch",
    title: "Watch for Fraud",
    tag: "Challenge Window",
    desc: "Watchers replay each transaction with public block data and check validity against Cardano.",
    layer: "bridge",
    icon: ICONS.watch,
  },
  {
    id: "settle",
    label: "Settle",
    title: "Final Settlement",
    tag: "L1 Confirmed",
    desc: "No fraud is detected and the maturity period ends — the block merges into confirmed state and is as final as Cardano itself.",
    layer: "l1",
    icon: ICONS.settle,
  },
];

function chapterIndex(p: number): number {
  if (p >= 0.84) return 4;
  if (p >= 0.58) return 3;
  if (p >= 0.4) return 2;
  if (p >= 0.14) return 1;
  return 0;
}

export default function ChapterLabels({
  progress,
  enabled,
}: {
  /** smoothed 0..1 scroll progress (a Framer Motion spring value) */
  progress: MotionValue<number>;
  enabled: boolean;
}) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const visRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(progress, "change", (v) => {
    const idx = chapterIndex(v);
    setActive((prev) => (prev === idx ? prev : idx));
    if (railRef.current) {
      railRef.current.style.transform = `scaleY(${Math.max(0.02, Math.min(1, v))})`;
    }
    // fade the whole panel out at the very top (let the hero breathe) and
    // back in once the journey begins
    if (visRef.current) {
      const op = v < 0.02 ? 0.55 : 1;
      visRef.current.style.opacity = String(op);
    }
  });

  // keep in sync if progress is already mid-page on mount
  useEffect(() => {
    setActive(chapterIndex(progress.get()));
  }, [progress]);

  if (!enabled) return null;

  const current = CHAPTERS[active];

  return (
    <div className="tx-hud" aria-hidden ref={visRef}>
      <div className="tx-hud__rail">
        <div className="tx-hud__rail-fill" ref={railRef} />
      </div>
      <div className="tx-hud__panel hud-frame" data-layer={current.layer}>
        <span className="hud-bracket hud-bracket--tl" />
        <span className="hud-bracket hud-bracket--tr" />
        <span className="hud-bracket hud-bracket--bl" />
        <span className="hud-bracket hud-bracket--br" />

        {/* header: mini-icon + step counter */}
        <div className="tx-hud__head">
          <span
            className="tx-hud__icon"
            style={{ ["--icon" as string]: `url("${current.icon}")` }}
            aria-hidden
          />
          <div className="tx-hud__step">
            {String(active + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
          </div>
        </div>

        {/* the ACTIVE step in full: tag, title, description */}
        <div className="tx-hud__tag" data-layer={current.layer}>
          {current.tag}
        </div>
        <div className="tx-hud__label">{current.title}</div>
        <p className="tx-hud__desc">{current.desc}</p>

        {/* compact 5-step stepper so progress through the five reads at a glance */}
        <ol className="tx-hud__ticks">
          {CHAPTERS.map((c, i) => (
            <li
              key={c.id}
              data-state={i < active ? "done" : i === active ? "active" : "idle"}
              data-layer={c.layer}
            >
              <span className="tx-hud__tick-dot" />
              <span className="tx-hud__tick-name">{c.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
