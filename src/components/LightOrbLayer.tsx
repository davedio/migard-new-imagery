"use client";

/* ============================================================
   LightOrbLayer — a playful "draw with light" cursor toy.

   While the pointer is PRESSED AND HELD, a soft brand-green glowing orb
   appears at the cursor and FOLLOWS it, painting a luminous green trail
   as the held cursor moves (light-painting). Trail points fade over
   ~1-1.5s; on release the whole thing eases out.

   Self-contained: a fixed, full-viewport <canvas> with
   `pointer-events: none` so it NEVER blocks clicks, links, scroll, or
   the custom cursor. Listens to pointerdown / pointermove / pointerup on
   `window`. A single rAF render loop reads/writes refs only — NO
   per-event React state, so dragging never re-renders React.

   Gating: desktop + fine pointer + motion-on only (the host passes the
   page's `enabled` = motionOn && finePointer). It also re-checks
   `(pointer: fine)` itself. No-op on touch / coarse pointer / motion-off
   / reduced motion — the component renders nothing and binds nothing.
   ============================================================ */

import { useEffect, useRef } from "react";

/* brand green, matching the sap orbs / packet so it belongs */
const CORE = "59, 232, 99"; // #3be863 core
const GLOW = "32, 190, 67"; // #20be43 outer glow

/* a single painted trail sample */
type Dab = { x: number; y: number; born: number };

const TRAIL_LIFE = 1.25; // seconds a trail point takes to fully fade
const ORB_R = 26; // core orb radius (px) — sap-orb / packet scale
const MAX_DABS = 240; // hard cap on live trail points (perf guard)

export default function LightOrbLayer({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    // re-check fine pointer + reduced-motion defensively (host also gates).
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // --- interaction state (refs only, mutated in event handlers) ---
    let down = false; // pointer currently held
    let px = 0;
    let py = 0; // live cursor position
    let hasPos = false; // have we seen a position yet
    // orb presence 0..1 — eases up on press, eases down on release so the
    // orb + trail gently fade out instead of snapping.
    let presence = 0;
    const dabs: Dab[] = [];

    const now = () => performance.now() / 1000;

    const onDown = (e: PointerEvent) => {
      // primary button / touch-equivalent only; ignore right/middle.
      if (e.button !== 0 && e.pointerType === "mouse") return;
      down = true;
      px = e.clientX;
      py = e.clientY;
      hasPos = true;
      dabs.push({ x: px, y: py, born: now() });
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      hasPos = true;
      if (!down) return;
      // sample the trail; densify long jumps so the stroke stays continuous.
      const last = dabs[dabs.length - 1];
      const t = now();
      if (!last) {
        dabs.push({ x: px, y: py, born: t });
      } else {
        const dx = px - last.x;
        const dy = py - last.y;
        const dist = Math.hypot(dx, dy);
        const step = 7; // px between dabs
        if (dist > step) {
          const n = Math.min(24, Math.floor(dist / step));
          for (let i = 1; i <= n; i++) {
            const f = i / n;
            dabs.push({ x: last.x + dx * f, y: last.y + dy * f, born: t });
          }
        } else {
          dabs.push({ x: px, y: py, born: t });
        }
      }
      if (dabs.length > MAX_DABS) dabs.splice(0, dabs.length - MAX_DABS);
    };
    const onUp = () => {
      down = false;
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    // releasing outside the window should still end the stroke
    window.addEventListener("blur", onUp);

    let raf = 0;
    let last = performance.now();
    const render = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const t = ts / 1000;

      // ease presence toward held-state (frame-rate independent).
      const target = down ? 1 : 0;
      const k = down ? 1 - Math.pow(0.001, dt) : 1 - Math.pow(0.02, dt);
      presence += (target - presence) * k;

      ctx.clearRect(0, 0, W, H);

      // nothing live? keep the loop cheap but alive (so a fresh press is
      // picked up instantly).
      if (dabs.length === 0 && presence < 0.001) {
        raf = requestAnimationFrame(render);
        return;
      }

      ctx.globalCompositeOperation = "lighter";

      // --- TRAIL: each dab is a soft green glow that fades over its life ---
      for (let i = dabs.length - 1; i >= 0; i--) {
        const d = dabs[i];
        const age = (t - d.born) / TRAIL_LIFE;
        if (age >= 1) {
          dabs.splice(i, 1);
          continue;
        }
        const fade = (1 - age) * (1 - age); // ease-out fade
        // newest dabs ride a touch larger/brighter so the stroke has a head.
        const a = fade * 0.5;
        const r = ORB_R * (0.5 + 0.45 * fade);
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
        g.addColorStop(0, `rgba(${CORE}, ${a})`);
        g.addColorStop(0.4, `rgba(${GLOW}, ${a * 0.6})`);
        g.addColorStop(1, `rgba(${GLOW}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- THE ORB: a soft round radial-glow at the cursor, sized like a
      // sap orb / the packet. Scales with presence so it blooms in on press
      // and eases out on release. ---
      if (hasPos && presence > 0.001) {
        const pr = presence;
        // (a) broad outer glow
        const outerR = ORB_R * 2.4 * (0.7 + 0.3 * pr);
        const outer = ctx.createRadialGradient(px, py, 0, px, py, outerR);
        outer.addColorStop(0, `rgba(${GLOW}, ${0.32 * pr})`);
        outer.addColorStop(0.4, `rgba(${GLOW}, ${0.14 * pr})`);
        outer.addColorStop(1, `rgba(${GLOW}, 0)`);
        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.arc(px, py, outerR, 0, Math.PI * 2);
        ctx.fill();

        // (b) saturated core halo with a soft white-green centre
        const coreR = ORB_R * (0.85 + 0.15 * pr);
        const core = ctx.createRadialGradient(px, py, 0, px, py, coreR);
        core.addColorStop(0, `rgba(210, 255, 222, ${0.9 * pr})`);
        core.addColorStop(0.3, `rgba(${CORE}, ${0.75 * pr})`);
        core.addColorStop(1, `rgba(${CORE}, 0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(px, py, coreR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="light-orb-layer" aria-hidden />;
}
