"use client";

/* ============================================================
   FireflyField — a pointer-events-none field of small warm-green
   firefly motes for DARK-MODE hero / section backdrops.

   · DOM spans + CSS keyframes only (no rAF, no canvas): each mote
     drifts (transform) and blinks (opacity) — compositor-friendly.
   · Every mote's position / delay / duration / scale comes from a
     deterministic index hash computed once in useMemo, so SSR and
     CSR render identical markup (no Math.random in render).
   · Subscribes to the mock telemetry contract (src/lib/mockTelemetry)
     and maps txPerSec to data-activity="low|med|high"; the CSS scales
     animation durations from it — busier network, livelier fireflies.
   · Dark theme only: watches documentElement's data-theme via a
     MutationObserver and renders nothing in light theme (fireflies
     over a daylight plate read as dust on the lens).
   · Motion off (useMotionPref): animations are disabled in CSS and
     the motes rest as faint static points — no loops of any kind.

   Parent supplies a positioned container; the field fills it.
   ============================================================ */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useMotionPref } from "@/lib/motion";
import { subscribeTelemetry } from "@/lib/mockTelemetry";
import styles from "./FireflyField.module.css";

/* tiny deterministic hash → [0, 1). Index + salt in, same float out on
   server and client — the whole reason this exists. */
function hash01(index: number, salt: number): number {
  let h = (index + 1) * 374761393 + (salt + 1) * 668265263;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

type FireflySpec = {
  key: number;
  style: CSSProperties;
};

/** Watch <html data-theme> (set by the theme boot script / ThemeProvider). */
function useIsDarkTheme(): boolean {
  const [dark, setDark] = useState(false); // SSR renders nothing; corrected on mount
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export default function FireflyField({
  count = 14,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const { motionOn } = useMotionPref();
  const isDark = useIsDarkTheme();
  const fieldRef = useRef<HTMLDivElement>(null);

  /* mote specs — computed ONCE per count, deterministic per index */
  const fireflies = useMemo<FireflySpec[]>(() => {
    const list: FireflySpec[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        key: i,
        style: {
          "--fx": `${(3 + hash01(i, 1) * 94).toFixed(2)}%`,
          "--fy": `${(6 + hash01(i, 2) * 88).toFixed(2)}%`,
          /* negative delays start every mote mid-cycle — no synchronized
             wake-up blink on mount */
          "--d1": `${(-hash01(i, 3) * 16).toFixed(2)}s`,
          "--d2": `${(-hash01(i, 4) * 9).toFixed(2)}s`,
          "--dur": `${(10 + hash01(i, 5) * 9).toFixed(2)}s`,
          "--blink": `${(3.6 + hash01(i, 6) * 4.2).toFixed(2)}s`,
          "--s": (0.7 + hash01(i, 7) * 0.9).toFixed(3),
          "--dx": `${((hash01(i, 8) * 2 - 1) * 34).toFixed(1)}px`,
          "--dy": `${((hash01(i, 9) * 2 - 1) * 26).toFixed(1)}px`,
          "--peak": (0.55 + hash01(i, 10) * 0.4).toFixed(3),
        } as CSSProperties,
      });
    }
    return list;
  }, [count]);

  /* telemetry → data-activity (written straight to the DOM so a 2s tick
     never re-renders the mote spans) */
  useEffect(() => {
    if (!isDark || !motionOn) return;
    const el = fieldRef.current;
    if (!el) return;
    return subscribeTelemetry((t) => {
      el.dataset.activity =
        t.txPerSec < 16 ? "low" : t.txPerSec <= 28 ? "med" : "high";
    });
  }, [isDark, motionOn]);

  if (!isDark) return null;

  return (
    <div
      ref={fieldRef}
      className={[styles.field, className].filter(Boolean).join(" ")}
      data-activity="med"
      data-motion={motionOn ? "on" : "off"}
      aria-hidden="true"
    >
      {fireflies.map((f) => (
        <span key={f.key} className={styles.fly} style={f.style} />
      ))}
    </div>
  );
}
