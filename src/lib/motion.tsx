"use client";

/* ============================================================
   Motion preference — single source of truth.

   Combines the OS `prefers-reduced-motion` setting (live-subscribed)
   with an optional manual override that persists in localStorage.
   Every animated layer (R3F scenes, showcases, fluid background, the
   motion toggle) should read `motionOn` from here instead of calling
   matchMedia itself, so a change anywhere is reflected everywhere.
   ============================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const STORAGE_KEY = "midgard:motion";

/** "on" / "off" force the preference; null follows the OS setting. */
type ManualPref = "on" | "off" | null;

function subscribeOs(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getOsSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

/** Live OS-level prefers-reduced-motion, SSR-safe (false on the server). */
export function useOsReducedMotion(): boolean {
  return useSyncExternalStore(subscribeOs, getOsSnapshot, () => false);
}

type MotionState = {
  /** Effective preference: true = play animations. */
  motionOn: boolean;
  /** True when the OS requests reduced motion (before manual override). */
  osReduced: boolean;
  /** Force the preference, or pass null to follow the OS again. */
  setManual: (pref: ManualPref) => void;
  /** Flip the effective preference and persist it. */
  toggle: () => void;
};

const MotionContext = createContext<MotionState | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const osReduced = useOsReducedMotion();
  const [manual, setManualState] = useState<ManualPref>(null);

  // Hydrate the manual override after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted pref after mount; initial render matches the server (null) so there is no mismatch
      if (v === "on" || v === "off") setManualState(v);
    } catch {
      /* localStorage unavailable — fall back to OS pref */
    }
  }, []);

  const setManual = useCallback((pref: ManualPref) => {
    setManualState(pref);
    try {
      if (pref === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* ignore persistence failures */
    }
  }, []);

  const motionOn = manual ? manual === "on" : !osReduced;
  const toggle = useCallback(
    () => setManual(motionOn ? "off" : "on"),
    [motionOn, setManual],
  );

  return (
    <MotionContext.Provider value={{ motionOn, osReduced, setManual, toggle }}>
      {children}
    </MotionContext.Provider>
  );
}

/**
 * Read the shared motion preference. Works outside a MotionProvider too
 * (falls back to the live OS setting with no manual control), so individual
 * components stay resilient.
 */
export function useMotionPref(): MotionState {
  const ctx = useContext(MotionContext);
  const osReduced = useOsReducedMotion();
  if (ctx) return ctx;
  return { motionOn: !osReduced, osReduced, setManual: () => {}, toggle: () => {} };
}
