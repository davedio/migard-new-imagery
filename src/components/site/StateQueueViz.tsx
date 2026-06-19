"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useMotionPref } from "@/lib/motion";
import css from "./StateQueueViz.module.css";

/* ------------------------------------------------------------------ *
 * A SIMULATED, self-driven model of the on-chain state queue. Blocks
 * commit at the tail, mature through the fraud-proof window, and the
 * oldest "ready" block folds into the confirmed root (FIFO). Clearly
 * labelled simulated; never presented as live protocol data.
 * ------------------------------------------------------------------ */

const TICK = 130; // ms
const MATURE_STEP = 1 / 46; // ~6s to mature
const SPAWN_TICKS = 18; // ~2.3s between commits
const FOLD_TICKS = 14; // ~1.8s between folds
const MAX_BLOCKS = 6;
const MIN_VISIBLE = 3; // keep the queue populated

type Status = "maturing" | "ready";
type Block = { id: number; hash: string; maturity: number; status: Status };
type State = {
  root: { hash: string; merged: number };
  blocks: Block[];
  t: number;
  lastSpawnT: number;
  lastFoldT: number;
  nextId: number;
};

/** Deterministic pseudo-hash (no Math.random → SSR-safe, no hydration drift). */
function hex(seed: number, len = 16): string {
  let s = (seed * 2654435761 + 0x9e3779b9) >>> 0;
  let out = "";
  while (out.length < len) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out += (s >>> 16).toString(16).padStart(4, "0");
  }
  return out.slice(0, len);
}

function initialState(): State {
  const seeds = [
    { id: 1, maturity: 1, status: "ready" as Status },
    { id: 2, maturity: 0.66, status: "maturing" as Status },
    { id: 3, maturity: 0.4, status: "maturing" as Status },
    { id: 4, maturity: 0.14, status: "maturing" as Status },
  ];
  return {
    root: { hash: hex(0), merged: 4096 },
    blocks: seeds.map((b) => ({ ...b, hash: hex(b.id * 7 + 13) })),
    t: 0,
    lastSpawnT: 0,
    lastFoldT: 0,
    nextId: 5,
  };
}

function tick(s: State): State {
  const t = s.t + 1;
  let blocks = s.blocks.map((b) =>
    b.status === "ready"
      ? b
      : (() => {
          const m = Math.min(1, b.maturity + MATURE_STEP);
          return { ...b, maturity: m, status: (m >= 1 ? "ready" : "maturing") as Status };
        })(),
  );
  let { root, lastSpawnT, lastFoldT, nextId } = s;

  // Fold the oldest ready block into the confirmed root.
  if (t - lastFoldT >= FOLD_TICKS && blocks.length > MIN_VISIBLE && blocks[0]?.status === "ready") {
    root = { hash: blocks[0].hash, merged: root.merged + 1 };
    blocks = blocks.slice(1);
    lastFoldT = t;
  }

  // Commit a new block at the tail.
  if (t - lastSpawnT >= SPAWN_TICKS && blocks.length < MAX_BLOCKS) {
    blocks = [...blocks, { id: nextId, hash: hex(nextId * 7 + 13), maturity: 0, status: "maturing" }];
    nextId += 1;
    lastSpawnT = t;
  }

  return { root, blocks, t, lastSpawnT, lastFoldT, nextId };
}

const R = 19;
const C = 2 * Math.PI * R;

function MaturityRing({ value, status }: { value: number; status: Status }) {
  return (
    <div className={css.ringWrap}>
      <svg className={css.ringSvg} viewBox="0 0 44 44" aria-hidden>
        <circle className={css.ringBg} cx="22" cy="22" r={R} />
        <circle
          className={css.ringFg}
          cx="22"
          cy="22"
          r={R}
          style={{
            strokeDasharray: C,
            strokeDashoffset: C * (1 - value),
            stroke: status === "ready" ? "var(--gold-bright)" : "var(--green-bright)",
          }}
        />
      </svg>
      <span className={css.ringPct}>
        {status === "ready" ? "✓" : `${Math.round(value * 100)}`}
      </span>
    </div>
  );
}

export function StateQueueViz() {
  const { motionOn } = useMotionPref();
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (!motionOn) return; // freeze to the static frame under reduced motion
    const iv = setInterval(() => setState(tick), TICK);
    return () => clearInterval(iv);
  }, [motionOn]);

  return (
    <div className={css.queue} aria-label="Simulated state-queue animation">
      <div className={css.overline}>
        <span className={css.overlineDot} aria-hidden />
        SIMULATED&nbsp;&middot;&nbsp;STATE&nbsp;QUEUE
      </div>

      <div className={css.track}>
        <div className={css.root}>
          {motionOn && (
            <motion.span
              key={state.root.merged}
              className={css.rootRipple}
              initial={{ opacity: 0.55, scale: 1 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{ duration: 1, ease: "easeOut" }}
              aria-hidden
            />
          )}
          <span className={css.rootGlyph} aria-hidden />
          <div>
            <div className={css.rootLabel}>Confirmed state</div>
            <div className={css.rootHash}>
              {state.root.hash.slice(0, 8)}…{state.root.hash.slice(-4)}
            </div>
            <div className={css.rootMerged}>
              {state.root.merged.toLocaleString("en-US")} blocks merged
            </div>
          </div>
        </div>

        <span className={css.feedArrow} aria-hidden>
          ←
        </span>

        <div className={css.flow}>
          <AnimatePresence initial={false}>
            {state.blocks.map((b) => (
              <motion.div
                key={b.id}
                layout={motionOn}
                className={css.block}
                data-status={b.status}
                initial={motionOn ? { opacity: 0, scale: 0.8, x: 26 } : false}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={motionOn ? { opacity: 0, scale: 0.6, x: -36 } : { opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <MaturityRing value={b.maturity} status={b.status} />
                <div className={css.blockHash}>{b.hash.slice(0, 6)}…</div>
                <div className={css.blockStatus}>
                  {b.status === "ready" ? "ready" : "maturing"}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className={css.legend} aria-hidden>
        <span className={css.legendItem}>
          <span className={css.legendDot} data-kind="root" /> Confirmed state · live L1 UTxO
        </span>
        <span className={css.legendItem}>
          <span className={css.legendDot} data-kind="maturing" /> Maturing · fraud-proof window
        </span>
        <span className={css.legendItem}>
          <span className={css.legendDot} data-kind="ready" /> Ready · folds next
        </span>
      </div>
    </div>
  );
}
