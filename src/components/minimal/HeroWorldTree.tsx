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
  const phasesRef = useRef<DescentPhases>({ ...PHASES_REST, camX: 0.76, camY: 0.38, zoom: 1.06 });
  const tickRef = useRef<((dt: number) => void) | null>(null);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phasesRef.current;

      if (motionOn) {
        const cycle = ((now / 1000) % 16) / 16;
        const helix = pulse(cycle, 0.12, 0.74);
        const collapse = pulse(cycle, 0.45, 0.9);
        ph.helix = helix;
        ph.collapse = collapse;
        ph.descend = 0;
        ph.rest = 0;
        ph.bottom = 0;
        ph.black = 0.22 * helix * (1 - collapse);
        ph.camX = 0.76 + 0.05 * smooth01(helix);
        ph.camY = 0.38;
        ph.zoom = 1.06 + 0.05 * helix + 0.03 * collapse;
      } else {
        ph.helix = 0;
        ph.collapse = 0;
        ph.descend = 0;
        ph.rest = 0;
        ph.bottom = 0;
        ph.black = 0;
        ph.camX = 0.76;
        ph.camY = 0.38;
        ph.zoom = 1.06;
      }

      tickRef.current?.(dt);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [motionOn]);

  return (
    <div className="minimal-tree minimal-tree--world" aria-label="Midgard transaction flow tree animation">
      <WorldTreeCanvas
        fitToParent
        src={TREE_PLATES[theme]}
        phasesRef={phasesRef}
        tickRef={tickRef}
      />
      <div className="minimal-tree__world-vignette" aria-hidden />
    </div>
  );
}
