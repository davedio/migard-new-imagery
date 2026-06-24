"use client";

import { useEffect, useRef } from "react";
import { useMotionPref } from "@/lib/motion";
import { TREE_PLATES, useTheme } from "@/lib/theme";
import WorldTreeCanvas, { PHASES_REST, type DescentPhases } from "@/components/v2/WorldTreeCanvas";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth01 = (value: number) => {
  const c = clamp01(value);
  return c * c * (3 - 2 * c);
};

function pulse(t: number, start: number, end: number) {
  if (t <= start || t >= end) return 0;
  const mid = start + (end - start) / 2;
  return t < mid ? smooth01((t - start) / (mid - start)) : 1 - smooth01((t - mid) / (end - mid));
}

export function HeroWorldTree() {
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  const phasesRef = useRef<DescentPhases>({ ...PHASES_REST, camY: 0.34, zoom: 1.02 });
  const tickRef = useRef<((dt: number) => void) | null>(null);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const pageProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const runway = Math.min(maxScroll, window.innerHeight * 2.85);
      return smooth01(clamp01(window.scrollY / Math.max(1, runway)));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phasesRef.current;

      if (motionOn) {
        const scroll = pageProgress();
        const cycle = ((now / 1000) % 16) / 16;
        const idleHelix = pulse(cycle, 0.12, 0.74) * (1 - scroll * 0.48);
        const idleCollapse = pulse(cycle, 0.45, 0.9) * (1 - scroll * 0.62);
        const scrollHelix = pulse(scroll, 0.04, 0.5);
        const scrollCollapse = smooth01((scroll - 0.26) / 0.34);
        const descend = smooth01((scroll - 0.18) / 0.68);
        const rest = smooth01((scroll - 0.72) / 0.18);
        const helix = Math.max(idleHelix, scrollHelix * 0.96);
        const collapse = Math.max(idleCollapse, scrollCollapse);
        ph.helix = helix;
        ph.collapse = collapse;
        ph.descend = descend;
        ph.rest = rest;
        ph.bottom = smooth01((scroll - 0.82) / 0.16);
        ph.black = 0.22 * helix * (1 - collapse);
        ph.camY = 0.34 + 0.46 * descend + 0.05 * rest;
        ph.zoom = 1.02 + 0.06 * helix + 0.12 * descend + 0.04 * collapse;
      } else {
        ph.helix = 0;
        ph.collapse = 0;
        ph.descend = 0;
        ph.rest = 0;
        ph.bottom = 0;
        ph.black = 0;
        ph.camY = 0.34;
        ph.zoom = 1.02;
      }

      tickRef.current?.(dt);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [motionOn]);

  return (
    <div className="minimal-world-tree-stage" aria-label="Midgard transaction flow tree animation">
      <WorldTreeCanvas
        src={TREE_PLATES[theme]}
        phasesRef={phasesRef}
        tickRef={tickRef}
      />
      <div className="minimal-world-tree-stage__vignette" aria-hidden />
    </div>
  );
}
