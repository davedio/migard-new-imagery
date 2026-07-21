"use client";

import { useEffect, useState } from "react";
import { useMotionPref } from "@/lib/motion";
import css from "./SoftConfirmFeed.module.css";

/* ------------------------------------------------------------------ *
 * A SIMULATED stream of the transaction flow: TXs soft-confirm in
 * seconds, a block seals them (gold), and commits post block headers
 * down to Cardano L1 (cobalt). Adapted from the feed on the team site
 * per the 2026-07-10 call — clearly labelled simulated, never
 * presented as live network data. The page-level benchmark note carries
 * the status of the seconds-level soft-confirmation target.
 *
 * Deliberately plain: exactly MAX_VISIBLE rows in the DOM, keyed by
 * step, with a one-shot CSS entrance on the newest row. No exit
 * animations (an AnimatePresence version leaked exiting rows inside
 * the smooth-scroll experience).
 * ------------------------------------------------------------------ */

const CADENCE_MS = 1600;
const MAX_VISIBLE = 7;
/* enough history at first paint that the reduced-motion static frame
   already shows all three row kinds */
const INITIAL_HEAD = 12;

type Kind = "tx" | "block" | "commit";
type Entry = { id: number; kind: Kind; label: string; status: string };

/* the repeating shape of the flow: TXs soft-confirm, a block seals
   them, and every few blocks a commit carries a header down to L1 */
const PATTERN: Kind[] = [
  "tx",
  "tx",
  "tx",
  "block",
  "tx",
  "tx",
  "commit",
  "tx",
  "tx",
  "tx",
  "block",
  "tx",
];

const KIND_META: Record<Kind, string> = {
  tx: "TX",
  block: "BLOCK",
  commit: "COMMIT",
};

/** Deterministic pseudo-hash (no Math.random → SSR-safe, no hydration drift). */
function hex(seed: number, len = 8): string {
  let s = (seed * 2654435761 + 0x9e3779b9) >>> 0;
  let out = "";
  while (out.length < len) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out += (s >>> 16).toString(16).padStart(4, "0");
  }
  return out.slice(0, len);
}

/** How many entries of `kind` the pattern has produced up to step n. */
function countKind(kind: Kind, n: number): number {
  const perCycle = PATTERN.filter((k) => k === kind).length;
  let rest = 0;
  for (let i = 0; i < n % PATTERN.length; i++) {
    if (PATTERN[i] === kind) rest++;
  }
  return Math.floor(n / PATTERN.length) * perCycle + rest;
}

function makeEntry(n: number): Entry {
  const kind = PATTERN[n % PATTERN.length];
  if (kind === "block") {
    return {
      id: n,
      kind,
      label: `Block #${4291 + countKind("block", n)}`,
      status: "Sealed: holds the TXs above",
    };
  }
  if (kind === "commit") {
    return {
      id: n,
      kind,
      label: `Commit #${4289 + countKind("commit", n)}`,
      status: "Header → Cardano L1",
    };
  }
  const h = hex(n * 7 + 13);
  return {
    id: n,
    kind,
    label: `${h.slice(0, 4)}…${h.slice(-4)}`,
    status: "Soft-confirmed",
  };
}

function visibleEntries(head: number): Entry[] {
  const out: Entry[] = [];
  for (let n = head; n > head - MAX_VISIBLE && n >= 0; n--) {
    out.push(makeEntry(n));
  }
  return out;
}

export default function SoftConfirmFeed() {
  const { motionOn } = useMotionPref();
  const [head, setHead] = useState(INITIAL_HEAD);

  useEffect(() => {
    if (!motionOn) return; // freeze to the static frame under reduced motion
    const iv = setInterval(() => setHead((h) => h + 1), CADENCE_MS);
    return () => clearInterval(iv);
  }, [motionOn]);

  return (
    <div
      className={css.feed}
      data-motion={motionOn ? "on" : "off"}
      role="group"
      aria-label="Simulated transaction flow"
    >
      <div className={css.overline}>
        <span className={css.overlineDot} aria-hidden />
        SIMULATED&nbsp;&middot;&nbsp;TRANSACTION&nbsp;FLOW
      </div>

      <p className={css.srOnly}>
        Circles are transactions, diamonds are sealed blocks, and rings are Cardano commits.
      </p>

      {/* The stream churns rows every 1.6s — hidden from assistive tech;
          the visible fine print below describes what it shows. */}
      <div className={css.stream} aria-hidden="true">
        {visibleEntries(head).map((e, i) => (
          <div
            key={e.id}
            className={css.row}
            data-kind={e.kind}
            data-newest={i === 0 || undefined}
          >
            <span className={css.dot} aria-hidden />
            <span className={css.kind}>{KIND_META[e.kind]}</span>
            <span className={css.label}>{e.label}</span>
            <span className={css.status}>{e.status}</span>
          </div>
        ))}
      </div>

      <p className={css.fine}>
        Illustrative sequence, not live network data. Soft confirmations happen
        in seconds; blocks settle through Cardano after verification.
      </p>
    </div>
  );
}
