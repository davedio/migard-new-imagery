"use client";

/* ============================================================
   JourneyHud — the tree-spine progress rail + live Watcher
   readout that ride the Learn page descent.

   · TreeSpine mirrors the six lifecycle beats as sap-nodes lighting
     green → gold → cobalt while the packet descends (the same spring
     progress the StageGraphic badge rides — one source of truth).
   · During the WATCH beat the readout surfaces live network numbers
     (mock telemetry today, real L2 telemetry later): the challenge
     window isn't a glow, it's a countable mechanism.

   Desktop + motion-on only (the parent gates mounting); everything
   here is decorative for screen readers.
   ============================================================ */

import { useState } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import TreeSpine from "@/components/minimal/TreeSpine";
import { useEffect } from "react";
import { subscribeTelemetry, type Telemetry } from "@/lib/mockTelemetry";
import {
  JOURNEY_STAGE_BOUNDS,
  journeyStageIndex,
} from "@/lib/journeyStages";
import styles from "./JourneyHud.module.css";

const BEATS = 6;
const BEAT_NAMES = ["Submit", "Sequence", "Commit", "Data availability", "Watch", "Settle"] as const;
/** The readout runs through the DA + WATCH beats — the stretch where
    independent verification is the story on screen. */
const WATCH_FROM = JOURNEY_STAGE_BOUNDS[3];
const WATCH_TO = JOURNEY_STAGE_BOUNDS[5];

function formatWindow(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `~${h}h ${String(m).padStart(2, "0")}m` : `~${m}m`;
}

export default function JourneyHud({ progress }: { progress: MotionValue<number> }) {
  const [beat, setBeat] = useState(0);
  const [watching, setWatching] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);

  useMotionValueEvent(progress, "change", (v) => {
    const next = journeyStageIndex(v);
    setBeat((prev) => (prev === next ? prev : next));
    const inWatch = v >= WATCH_FROM && v < WATCH_TO;
    setWatching((prev) => (prev === inWatch ? prev : inWatch));
  });

  // Only tick telemetry while the readout is on screen.
  useEffect(() => {
    if (!watching) return;
    return subscribeTelemetry(setTelemetry);
  }, [watching]);

  return (
    <div className={styles.hud} aria-hidden="true">
      <div className={styles.spineWrap}>
        <TreeSpine count={BEATS} activeIndex={beat} className={styles.spine} />
        <span className={styles.beatName} data-beat={beat}>
          {BEAT_NAMES[beat]}
        </span>
      </div>
      <div className={styles.readout} data-on={watching && telemetry ? "true" : "false"}>
        {telemetry ? (
          <>
            <span className={styles.row}>
              <i className={styles.dot} />
              Watchers: {telemetry.activeWatchers} active
            </span>
            <span className={styles.rowDim}>
              Window: {formatWindow(telemetry.challengeWindowRemainingMs)} remaining
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
