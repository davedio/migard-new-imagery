"use client";

/* ============================================================
   motionConfig — the single source of truth for sitewide motion.

   Two things live here:

   1. MOTION_SPEED — ONE global time multiplier for every animated scene.
      The owner's note: "everything is moving too fast" — this is the one
      knob that slows the whole site together. Each scene multiplies its
      frame delta by MOTION_SPEED exactly ONCE, at the rAF/useFrame
      boundary (see scaledDt). Never apply it again deeper in a
      simulation — constants in scene files stay in "sim seconds" and
      their comments quote the EFFECTIVE (wall-clock) values.

      Input-following springs (scroll pans, camera follow, cursor lerps)
      intentionally keep the RAW dt: slowing those would read as input
      lag, not calm.

   2. The motion PREFERENCE (re-exported from ./motion): one provider +
      hook combining the live OS `prefers-reduced-motion` media query
      (subscribed to change events, so flipping the OS setting applies
      immediately) with a manual override persisted at
      localStorage["midgard:motion"]. Every scene, the custom cursor,
      the light-orb toy, smooth scroll, Reveal and the bottom-right
      motion toggles consume this one source — the provider is mounted
      in src/app/providers.tsx.
   ============================================================ */

/** Global time multiplier — 1 = original pacing, 0.7 = the calm sitewide pace. */
export const MOTION_SPEED = 0.7;

/**
 * Scale a frame delta ONCE at the rAF/useFrame boundary.
 * `const dt = scaledDt(rawDt)` — then never multiply by MOTION_SPEED again.
 */
export function scaledDt(dt: number): number {
  return dt * MOTION_SPEED;
}

export { MotionProvider, useMotionPref, useOsReducedMotion } from "./motion";
