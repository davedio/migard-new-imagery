"use client";

/* ============================================================
   JourneyHud — the tree-spine progress rail + live Watcher
   readout that ride the /how-it-works descent.

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
import styles from "./JourneyHud.module.css";

const BEATS = 6;
/** The WATCH beat spans [4/6, 5/6) of the journey (beat index 4). */
const WATCH_FROM = 4 / BEATS;
const WATCH_TO = 5 / BEATS;

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
    const next = Math.min(BEATS - 1, Math.max(0, Math.floor(v * BEATS)));
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
      <TreeSpine count={BEATS} activeIndex={beat} className={styles.spine} />
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
