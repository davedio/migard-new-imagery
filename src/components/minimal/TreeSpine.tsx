"use client";

/* ============================================================
   TreeSpine — a vertical SVG "sap vein" progress spine that sits
   beside a list of lifecycle steps.

   · An organic, slightly-curved vertical path with `count` node
     circles evenly spaced along it (deterministic sway per index,
     so SSR/CSR match).
   · Nodes below `activeIndex` are lit; the node AT `activeIndex`
     pulses softly (pulse suppressed when motion is off).
   · Stage color language (matches the scene backdrops):
       execution   → emerald green  #4ade80  (first ~half)
       verification→ warm gold      #ffc840  (next band)
       settlement  → cool cobalt    #78b9ff  (final node(s))
   · The vein fill between lit nodes animates via a normalized
     stroke-dashoffset transition (pathLength=1) — transform/paint
     free, GPU-cheap.

   Pure presentational: the PARENT owns and drives `activeIndex`
   (e.g. from scroll or step hover). aria-hidden — it decorates the
   adjacent, already-accessible step list.
   ============================================================ */

import { useId, useMemo } from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./TreeSpine.module.css";

const GREEN = "#4ade80"; // execution
const GOLD = "#ffc840"; // verification / watch
const COBALT = "#78b9ff"; // settlement

/* viewBox geometry */
const VB_W = 56;
const CX = 28;
const PAD = 26; // breathing room above the first / below the last node
const GAP = 64; // vertical space between nodes

/** execution → verification → settlement mapping per node index */
function nodeColor(i: number, count: number): string {
  const cobaltFrom = count - Math.max(1, Math.round(count / 5));
  if (i >= cobaltFrom) return COBALT;
  if (i < Math.ceil(count * 0.5)) return GREEN;
  return GOLD;
}

/** gentle deterministic sway so the vein reads organic, not ruled */
function nodeX(i: number): number {
  return CX + Math.sin(i * 1.7 + 0.6) * 7;
}

export default function TreeSpine({
  count,
  activeIndex,
  className,
}: {
  count: number;
  activeIndex: number;
  className?: string;
}) {
  const { motionOn } = useMotionPref();
  /* useId can contain «» / : — strip to a safe SVG reference id */
  const gradId = `spine-g-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const n = Math.max(1, Math.floor(count));
  const height = PAD * 2 + GAP * (n - 1);
  const active = Math.max(0, Math.min(n - 1, Math.floor(activeIndex)));

  /* node positions + the curved vein path through them */
  const { points, pathD } = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      pts.push({ x: nodeX(i), y: PAD + GAP * i });
    }
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const bend = GAP * 0.38;
      d += ` C ${a.x.toFixed(2)} ${(a.y + bend).toFixed(2)}, ${b.x.toFixed(2)} ${(b.y - bend).toFixed(2)}, ${b.x.toFixed(2)} ${b.y}`;
    }
    return { points: pts, pathD: d };
  }, [n]);

  /* how far down the vein the sap has filled (to the active node) */
  const progress = n > 1 ? active / (n - 1) : active > 0 ? 1 : 0;

  return (
    <svg
      className={[styles.spine, className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="xMidYMin meet"
      data-motion={motionOn ? "on" : "off"}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* execution → verification → settlement, top to bottom */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GREEN} />
          <stop offset="52%" stopColor={GOLD} />
          <stop offset="100%" stopColor={COBALT} />
        </linearGradient>
      </defs>

      {/* dormant rail */}
      <path
        className={styles.rail}
        d={pathD}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* lit sap vein — normalized dash, so dashoffset = 1 - progress */}
      {n > 1 ? (
        <path
          className={styles.vein}
          d={pathD}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2.25"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: 1 - progress }}
        />
      ) : null}

      {points.map((p, i) => {
        const state = i < active ? "lit" : i === active ? "active" : "idle";
        const color = nodeColor(i, n);
        return (
          <g
            key={i}
            className={styles.nodeG}
            data-state={state}
            style={{ "--nc": color } as React.CSSProperties}
          >
            {/* soft static glow behind lit nodes */}
            <circle className={styles.glow} cx={p.x} cy={p.y} r={9} />
            {/* pulsing halo — active node only, motion permitting */}
            {state === "active" ? (
              <circle
                className={[
                  styles.halo,
                  motionOn ? styles.haloPulse : styles.haloStill,
                ].join(" ")}
                cx={p.x}
                cy={p.y}
                r={7.5}
              />
            ) : null}
            <circle className={styles.core} cx={p.x} cy={p.y} r={4.2} />
          </g>
        );
      })}
    </svg>
  );
}
