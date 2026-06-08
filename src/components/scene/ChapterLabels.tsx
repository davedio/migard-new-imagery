"use client";

/* ============================================================
   ChapterLabels — HUD-style beat readout that tracks the descent.

   Reads the same smoothed scroll progress the 3D scene uses (a
   MotionValue) and surfaces the current lifecycle chapter as a fixed
   instrument panel: SUBMITTED · L2 -> SEQUENCED -> BATCHED ->
   DESCENDING -> SETTLED · L1, with a progress rail and a mono
   sub-line. Green/gold = Midgard L2, cobalt = Cardano L1.

   Pure DOM (uses the .hud-* kit + a few home-scoped classes). Updates
   imperatively from the MotionValue so it never re-renders per scroll.
   Hidden under reduced motion (the page reads as stacked sections and
   the label set wouldn't track a descent).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";

type Chapter = {
  id: string;
  label: string;
  sub: string;
  layer: "l2" | "bridge" | "l1";
};

const CHAPTERS: Chapter[] = [
  { id: "submit", label: "Submitted", sub: "tx on Midgard L2", layer: "l2" },
  { id: "sequence", label: "Sequenced", sub: "operator orders the queue", layer: "l2" },
  { id: "batch", label: "Batched", sub: "packed into a block", layer: "l2" },
  { id: "descend", label: "Descending", sub: "settling toward L1", layer: "bridge" },
  { id: "settle", label: "Settled", sub: "confirmed on Cardano L1", layer: "l1" },
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
        <div className="tx-hud__step">
          {String(active + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
        </div>
        <div className="tx-hud__label">{current.label}</div>
        <div className="tx-hud__sub hud-cursor">{current.sub}</div>
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
