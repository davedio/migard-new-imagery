"use client";

/**
 * NetworkStatusWidget — "instrument readout" edition
 *
 * Wraps the network snapshot in HUD chrome: corner brackets, scanlines, a
 * monospace telemetry readout, a proof-state border pulse (green → gold),
 * an animated batch-queue fill bar, and a block-height odometer that rolls
 * each digit on update.
 *
 * SIMULATED · L2 TELEMETRY overline is shown on every surface; the widget
 * never presents mock activity as verified live protocol data.
 */

import { motion, AnimatePresence } from "motion/react";
import { type CSSProperties } from "react";
import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";
import { useMotionPref } from "@/lib/motion";
import { HudFrame, DataReadout } from "@/components/site/Hud";
import type { ProofStatus } from "@/lib/network";
import css from "./NetworkStatusWidget.module.css";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmt = (n: number) => n.toLocaleString("en-US");

/** Map proof status to border/shadow tokens. */
function proofStyle(status: ProofStatus): CSSProperties {
  if (status === "settled") {
    return {
      borderColor: "var(--green-dim)",
      boxShadow: "0 0 18px var(--green-glow)",
    };
  }
  if (status === "generated") {
    return {
      borderColor: "var(--gold-line)",
      boxShadow: "0 0 14px var(--gold-ghost)",
    };
  }
  // pending
  return {
    borderColor: "var(--panel-edge)",
    boxShadow: "none",
  };
}

/** Color for the batch fill bar based on fill fraction 0..1. */
function batchBarColor(frac: number): string {
  if (frac > 0.8) return "var(--gold-bright)";
  if (frac > 0.5) return "var(--gold-dim)";
  return "var(--green-dim)";
}

/* ------------------------------------------------------------------ */
/*  Block-height odometer                                               */
/* ------------------------------------------------------------------ */

/**
 * Renders a formatted number as a row of digit cells.
 * On each value change, digits that changed roll in from above.
 * When motionOn is false, renders as plain text with no transition.
 */
function RollingNumber({
  value,
  motionOn,
}: {
  value: number;
  motionOn: boolean;
}) {
  const currStr = fmt(value);

  if (!motionOn) {
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          color: "var(--text-hi)",
        }}
      >
        {currStr}
      </span>
    );
  }

  return (
    <span
      aria-label={currStr}
      style={{ display: "inline-flex", alignItems: "flex-end" }}
    >
      {currStr.split("").map((char, i) => (
        // key changes when this digit changes → it remounts and rolls in
        <motion.span
          key={`${i}-${char}`}
          className={css.odoDigit}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            color: "var(--text-hi)",
            display: "inline-block",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main widget                                                         */
/* ------------------------------------------------------------------ */

export function NetworkStatusWidget() {
  const { data: snap } = useNetworkSnapshot();
  const { motionOn } = useMotionPref();
  const live = snap.source !== "demo";

  const proofStatus = snap.l2.latestProofStatus;
  const batchFrac = snap.l2.batchQueueDepth / 24; // 24 is the practical max from network.ts

  const panelStyle: CSSProperties = {
    marginTop: 28,
    padding: "16px 18px",
    display: "grid",
    gap: 6,
    maxWidth: 380,
    position: "relative",
    // Proof-keyed border/glow — transition handled by CSS
    ...proofStyle(proofStatus),
    transition: motionOn
      ? "border-color 0.5s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.5s cubic-bezier(0.22,0.61,0.36,1)"
      : "none",
  };

  return (
    <HudFrame scanlines animatedScanlines={motionOn}>
      <div
        className="panel"
        style={panelStyle}
        aria-live="polite"
        aria-label="Simulated L2 network telemetry"
      >
        {/* ---- SIMULATED overline ---- */}
        <div className={css.overline} aria-label="Simulated L2 telemetry feed">
          <span className={css.overlineDot} aria-hidden />
          SIMULATED&nbsp;&middot;&nbsp;L2&nbsp;TELEMETRY
        </div>

        {/* ---- chip row ---- */}
        <div className={css.chipRow}>
          <span className={`chip chip--${live ? "live" : "demo"}`}>
            <span className="dot" />
            {live ? "Live L1 · sim L2" : "feed"}
          </span>
          {/* Timestamp fades in on each poll tick */}
          <motion.span
            key={snap.updatedAt}
            className={css.timestamp}
            initial={motionOn ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionOn ? 0.3 : 0 }}
          >
            {new Date(snap.updatedAt).toLocaleTimeString("en-US")}
          </motion.span>
        </div>

        {/* ---- L1 section ---- */}
        <div className={css.sectionLabel}>L1 · Cardano</div>

        <DataReadout
          rows={[
            {
              k: "Block",
              v: (
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--text-hi)" }}>
                    #
                  </span>
                  <RollingNumber value={snap.l1.blockHeight} motionOn={motionOn} />
                </span>
              ),
            },
            {
              k: "Slot",
              v: fmt(snap.l1.slot),
            },
            {
              k: "Epoch",
              v: String(snap.l1.epoch),
            },
            {
              k: "TPS (L1)",
              v: `${snap.l1.tps.toFixed(2)} tx/s`,
            },
          ]}
        />

        {/* ---- L2 section ---- */}
        <div className={css.innerDivider} aria-hidden />
        <div className={css.sectionLabel}>L2 · Midgard</div>

        {/* Proof row — key triggers re-animation on proof status change */}
        <DataReadout
          rows={[
            {
              k: "Throughput",
              v: `${snap.l2.throughput.toFixed(1)} ops/s`,
            },
            {
              k: "Batch queue",
              v: `${fmt(snap.l2.batchQueueDepth)} ops`,
            },
          ]}
        />

        {/* ---- Batch queue fill bar ---- */}
        <div className={css.batchBarWrap} aria-hidden title={`Batch fill: ${Math.round(batchFrac * 100)}%`}>
          <motion.div
            className={css.batchBarFill}
            animate={{ scaleX: batchFrac }}
            transition={{ duration: motionOn ? 0.6 : 0, ease: "easeOut" }}
            style={{
              background: batchBarColor(batchFrac),
              transformOrigin: "left",
            }}
          />
        </div>

        {/* Proof status row — key fires re-animation on each state transition */}
        <DataReadout
          rows={[
            {
              k: "Proof",
              v: (
                <motion.span
                  key={proofStatus}
                  initial={motionOn ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: motionOn ? 0.35 : 0, ease: "easeOut" }}
                  style={{ display: "inline-block" }}
                >
                  {proofStatus.toUpperCase()}
                </motion.span>
              ),
              gold: proofStatus === "generated" || proofStatus === "settled",
              cursor: proofStatus === "pending",
            },
          ]}
        />

        {/* ---- Challenge window row (conditional) ---- */}
        <AnimatePresence>
          {snap.l2.challengeWindowOpen && (
            <motion.div
              className={css.challengeRow}
              initial={motionOn ? { opacity: 0, height: 0 } : { opacity: 1, height: "auto" }}
              animate={{ opacity: 1, height: "auto" }}
              exit={motionOn ? { opacity: 0, height: 0 } : { opacity: 0 }}
              transition={{ duration: motionOn ? 0.3 : 0, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
              role="status"
              aria-label="Challenge window is open: simulated dispute period active"
            >
              <span className={css.challengeLabel}>Challenge window</span>
              <span className={css.challengeValue}>
                {motionOn && <span className={css.challengePulse} aria-hidden />}
                OPEN
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Settled proof burst ring ---- */}
        <AnimatePresence>
          {proofStatus === "settled" && motionOn && (
            <motion.div
              key="settled-ring"
              className={css.settledRing}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* Screen-reader live region for proof state transitions */}
        <span
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
        >
          {proofStatus === "settled"
            ? "Proof settled: L2 batch anchored"
            : proofStatus === "generated"
              ? "Proof generated: challenge window open"
              : "Proof pending: batch assembling"}
        </span>
      </div>
    </HudFrame>
  );
}
