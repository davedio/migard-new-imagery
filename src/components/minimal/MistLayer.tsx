"use client";

/* ============================================================
   MistLayer — light-theme atmosphere for the whole site, take two.

   Review (2026-07-13): v1 spread ~100 near-invisible wisps evenly
   across the frame — no fog you could SEE, yet the accumulated film
   washed the painting out. This version is the opposite shape:

     · the fog lives in a handful of drifting BANKS (clusters of
       elongated wisps), dense enough to read as real fog with soft
       bright cores and ragged edges
     · between banks there is CLEAR AIR — most of the painting shows
       through completely untouched
     · total coverage is lower than v1, but every wisp is ~3x denser,
       so the mist is unmistakably there

   The waft is unchanged in spirit and stronger in feel: pointer
   VELOCITY pushes nearby wisps along the hand's stroke (with curl),
   and thins them fast; they tumble, settle, and refill over ~3s.
   A slow hover barely stirs the fog; a sweep parts a bank.

   Light theme + motion-on only; parked when hidden; self-heals
   zero-size mounts. Decorative (pointer-events: none, under nav).
   ============================================================ */

import { useEffect, useRef } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Wisp = {
  /** local offset from the cluster centre */
  ox: number;
  oy: number;
  /** waft displacement (velocity-integrated, decays home) */
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  r: number;
  angle: number; // bank elongation axis
  stretch: number; // 1.6..2.8 — how elongated the bank reads
  baseA: number;
  veil: number;
  ph: number;
  curl: 1 | -1;
  sprite: number;
};

type Cluster = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
  wisps: Wisp[];
};

function makeSprite(tint: [number, number, number]): HTMLCanvasElement {
  const s = document.createElement("canvas");
  s.width = s.height = 256;
  const c = s.getContext("2d")!;
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  /* two-tone: luminous core + a faint dusty rim, so a bank reads as a
     SHAPE against the pale painted sky instead of a milky brightening */
  g.addColorStop(0, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.9)`);
  g.addColorStop(0.38, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.42)`);
  g.addColorStop(0.66, "rgba(209, 200, 186, 0.2)");
  g.addColorStop(1, "rgba(209, 200, 186, 0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  return s;
}

export function MistLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  const active = motionOn && theme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let W = 0;
    let H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    /* warm parchment cream + a faint sage, matching the painted palette */
    const sprites = [
      makeSprite([253, 250, 243]),
      makeSprite([238, 244, 235]),
    ];

    const fit = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    fit();

    /* ---- the banks ---- */
    const clusterCount = () => (window.innerWidth <= 760 ? 3 : 5);
    const clusters: Cluster[] = [];

    const makeWisp = (): Wisp => {
      const spreadX = 130 + Math.random() * 130;
      const spreadY = 60 + Math.random() * 70;
      return {
        ox: (Math.random() - 0.5) * 2 * spreadX,
        oy: (Math.random() - 0.5) * 2 * spreadY,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        r: 60 + Math.random() * 70,
        angle: (Math.random() - 0.5) * 0.9, // mostly horizontal banks
        stretch: 1.6 + Math.random() * 1.2,
        baseA: 0.085 + Math.random() * 0.075,
        veil: 1,
        ph: Math.random() * Math.PI * 2,
        curl: Math.random() < 0.5 ? 1 : -1,
        sprite: Math.random() < 0.7 ? 0 : 1,
      };
    };

    const seed = () => {
      clusters.length = 0;
      const n = clusterCount();
      for (let i = 0; i < n; i++) {
        /* spread the banks around the frame with jitter — never a grid */
        const gx = (i + 0.5) / n + (Math.random() - 0.5) * 0.14;
        const wisps: Wisp[] = [];
        const per = 4 + Math.floor(Math.random() * 3);
        for (let k = 0; k < per; k++) wisps.push(makeWisp());
        clusters.push({
          x: gx * W,
          y: (0.12 + Math.random() * 0.76) * H,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.5) * 3.5,
          ph: Math.random() * Math.PI * 2,
          wisps,
        });
      }
    };
    seed();

    /* pointer — POSITION for locality, VELOCITY for force */
    const ptr = { x: -9999, y: -9999, vx: 0, vy: 0 };
    let lastMove = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dtm = Math.min(64, now - (lastMove || now - 16)) / 1000;
      lastMove = now;
      if (ptr.x > -999) {
        ptr.vx = lerp(ptr.vx, (e.clientX - ptr.x) / Math.max(dtm, 0.008), 0.3);
        ptr.vy = lerp(ptr.vy, (e.clientY - ptr.y) / Math.max(dtm, 0.008), 0.3);
      }
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };

    const WAFT_R = 250;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* self-heal zero-size mounts (prerender/background tab) */
      if (W !== window.innerWidth || H !== window.innerHeight) {
        const hadNone = W === 0;
        fit();
        if (hadNone && W > 0) seed();
      }
      if (W === 0) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      ptr.vx *= Math.exp(-6 * dt);
      ptr.vy *= Math.exp(-6 * dt);
      const sweep = clamp01(Math.hypot(ptr.vx, ptr.vy) / 750);

      ctx.clearRect(0, 0, W, H);

      for (const cl of clusters) {
        /* banks drift as one — a slow travelling weather system */
        cl.vx += Math.sin(t * 0.09 + cl.ph) * 1.6 * dt;
        cl.vy += Math.cos(t * 0.07 + cl.ph * 1.7) * 0.9 * dt;
        cl.vx *= Math.exp(-0.5 * dt);
        cl.vy *= Math.exp(-0.5 * dt);
        cl.x += cl.vx * dt * 10;
        cl.y += cl.vy * dt * 10;
        /* toroidal wrap with a generous margin so a bank re-enters whole */
        const M = 420;
        if (cl.x < -M) cl.x = W + M;
        else if (cl.x > W + M) cl.x = -M;
        if (cl.y < -M) cl.y = H + M;
        else if (cl.y > H + M) cl.y = -M;

        for (const b of cl.wisps) {
          /* slow internal churn keeps a bank alive */
          const churnX = Math.sin(t * 0.16 + b.ph) * 9;
          const churnY = Math.cos(t * 0.13 + b.ph * 2.1) * 5;
          const hx = cl.x + b.ox + churnX;
          const hy = cl.y + b.oy + churnY;

          /* the waft: velocity-scaled push along the hand's stroke */
          const px2 = hx + b.dx;
          const py2 = hy + b.dy;
          const ddx = px2 - ptr.x;
          const ddy = py2 - ptr.y;
          const dist = Math.hypot(ddx, ddy);
          let thin = 0;
          if (dist < WAFT_R + b.r && sweep > 0.015) {
            const fall = Math.pow(1 - clamp01(dist / (WAFT_R + b.r)), 1.5);
            const inv = 1 / Math.max(26, dist);
            const ax = ddx * inv;
            const ay = ddy * inv;
            const push = (150 + 620 * sweep) * fall;
            b.vx += (ax * push + ptr.vx * 0.5 * fall - ay * b.curl * push * 0.3) * dt;
            b.vy += (ay * push + ptr.vy * 0.5 * fall + ax * b.curl * push * 0.3) * dt;
            thin = fall * sweep;
          }

          /* displacement integrates, decays home (the bank re-forms) */
          b.vx *= Math.exp(-1.9 * dt);
          b.vy *= Math.exp(-1.9 * dt);
          b.dx += b.vx * dt * 16;
          b.dy += b.vy * dt * 16;
          b.dx *= Math.exp(-0.55 * dt);
          b.dy *= Math.exp(-0.55 * dt);

          /* thinning: fast to clear, slow (~3s) to refill */
          const veilTarget = 1 - 0.9 * thin;
          b.veil +=
            (veilTarget - b.veil) *
            Math.min(1, dt * (veilTarget < b.veil ? 8 : 0.33));

          const a = b.baseA * b.veil;
          if (a < 0.008) continue;

          /* an elongated bank: three stamps along the wisp's axis */
          const breathe = 1 + 0.05 * Math.sin(t * 0.3 + b.ph);
          const r = b.r * breathe;
          const wob = b.angle + Math.sin(t * 0.11 + b.ph) * 0.1;
          const cosA = Math.cos(wob);
          const sinA = Math.sin(wob);
          const step = r * b.stretch * 0.42;
          ctx.globalAlpha = a;
          for (let k = -1; k <= 1; k++) {
            const sx = px2 + cosA * step * k;
            const sy = py2 + sinA * step * k;
            const sr = r * (k === 0 ? 1 : 0.78);
            ctx.drawImage(sprites[b.sprite], sx - sr, sy - sr, sr * 2, sr * 2);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="mist-layer" aria-hidden />;
}

export default MistLayer;
