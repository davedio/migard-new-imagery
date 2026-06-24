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
  const rootRef = useRef<HTMLDivElement>(null);
  const phasesRef = useRef<DescentPhases>({ ...PHASES_REST, camX: 0.55, camY: 0.34, zoom: 1.03 });
  const tickRef = useRef<((dt: number) => void) | null>(null);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const heroProgress = () => {
      const root = rootRef.current;
      const hero = root?.closest<HTMLElement>(".minimal-hero");
      if (!hero) return 0;
      const rect = hero.getBoundingClientRect();
      const runway = Math.max(window.innerHeight * 0.82, rect.height * 0.74);
      return smooth01(clamp01(-rect.top / runway));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phasesRef.current;

      if (motionOn) {
        const scroll = heroProgress();
        const cycle = ((now / 1000) % 16) / 16;
        const idleHelix = pulse(cycle, 0.12, 0.74) * (1 - scroll * 0.48);
        const idleCollapse = pulse(cycle, 0.45, 0.9) * (1 - scroll * 0.62);
        const scrollHelix = pulse(scroll, 0.04, 0.58);
        const scrollCollapse = smooth01((scroll - 0.32) / 0.38);
        const descend = smooth01((scroll - 0.24) / 0.72);
        const helix = Math.max(idleHelix, scrollHelix * 0.96);
        const collapse = Math.max(idleCollapse, scrollCollapse);
        ph.helix = helix;
        ph.collapse = collapse;
        ph.descend = descend * 0.62;
        ph.rest = 0;
        ph.bottom = 0;
        ph.black = 0.22 * helix * (1 - collapse);
        ph.camX = 0.55 - 0.05 * descend + 0.03 * smooth01(helix);
        ph.camY = 0.34 + 0.2 * descend;
        ph.zoom = 1.03 + 0.06 * helix + 0.1 * descend + 0.03 * collapse;
      } else {
        ph.helix = 0;
        ph.collapse = 0;
        ph.descend = 0;
        ph.rest = 0;
        ph.bottom = 0;
        ph.black = 0;
        ph.camX = 0.55;
        ph.camY = 0.34;
        ph.zoom = 1.03;
      }

      tickRef.current?.(dt);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [motionOn]);

  return (
    <div ref={rootRef} className="minimal-tree minimal-tree--world" aria-label="Midgard transaction flow tree animation">
      <WorldTreeCanvas
        fitToParent
        helixAxisOffset={-0.018}
        src={TREE_PLATES[theme]}
        phasesRef={phasesRef}
        tickRef={tickRef}
      />
      <div className="minimal-tree__world-vignette" aria-hidden />
    </div>
  );
}
