"use client";

import { useEffect, useRef } from "react";
import { useMotionPref } from "@/lib/motion";

/* ============================================================
   TakeRootHero — Get Started hero background.

   A field of luminous green ROOT FILAMENTS that grow up from the bottom
   edge and reach toward the cursor — the page "takes root" under your
   pointer. Filaments wander organically, branch, and fade at the tips.
   Pure 2D <canvas>; no 3D runtime, no asset download.

   - Respects the shared motion preference (useMotionPref): when motion is
     OFF it paints ONE still, pre-grown frame and never animates.
   - Cursor steering only on fine-pointer (mouse) devices; otherwise the
     roots rise on a gentle ambient bias so it still feels alive on touch.
   - aria-hidden + pointer-events:none — purely decorative; it never
     blocks the hero's buttons.
   ============================================================ */

const ROOT_RGB = "43,196,106"; // #2BC46A — brand emerald
const TIP_RGB = "150,255,190"; // brighter growing tip
const MAX_FILAMENTS = 40;
const SPAWN_EVERY = 0.34; // seconds between new filaments (calm, steady cadence)
const GROW_MIN = 1.6; // seconds a filament keeps growing
const GROW_MAX = 3.4;
const FADE_TIME = 2.8; // seconds to fade out after it stops growing
const STEP_PX = 4; // append a trail point every ~this many px
const TURN_RATE = 2.0; // max radians/sec the head can steer (gentle, soft curves)
const ATTRACT = 0.42; // 0..1 — a soft lean toward the cursor, never a chase

type Pt = { x: number; y: number };
type Filament = {
  pts: Pt[];
  hx: number;
  hy: number;
  ang: number; // heading; -PI/2 points straight up
  speed: number; // px/sec
  grow: number; // growth time remaining (s)
  fade: number; // 1 alive -> 0 gone (decays once grow hits 0)
  width: number;
  curl: number; // per-filament noise phase
  branches: number; // remaining child branches
  bright: boolean;
};

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function TakeRootHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();
  const motionRef = useRef(motionOn);
  useEffect(() => {
    motionRef.current = motionOn;
  }, [motionOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let lite = false; // touch / small screens: fewer roots, lower resolution
    const filaments: Filament[] = [];

    const pointer = { x: 0, y: 0, active: false, fine: false };
    const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncFine = () => {
      pointer.fine = fineQuery.matches;
      if (!pointer.fine) pointer.active = false;
    };
    syncFine();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      lite = !pointer.fine || W < 700;
      dpr = Math.min(lite ? 1.5 : 2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (!pointer.fine || e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= r.width && pointer.y >= 0 && pointer.y <= r.height;
    };
    const clearPointer = () => {
      pointer.active = false;
    };
    fineQuery.addEventListener("change", syncFine);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", clearPointer);
    window.addEventListener("pointerout", (e: PointerEvent) => {
      if (!e.relatedTarget) clearPointer();
    });

    // A new filament sprouting from the bottom edge (or branching off a head).
    const spawn = (
      x?: number,
      y?: number,
      ang?: number,
      bright = false,
    ): Filament | null => {
      if (filaments.length >= (lite ? 24 : MAX_FILAMENTS)) return null;
      const sx = x ?? rand(W * 0.08, W * 0.92);
      const sy = y ?? H + 4;
      const f: Filament = {
        pts: [{ x: sx, y: sy }],
        hx: sx,
        hy: sy,
        ang: ang ?? -Math.PI / 2 + rand(-0.5, 0.5),
        // one calm growth profile for every root — no fast "hunting" variant
        speed: rand(60, 100),
        grow: rand(GROW_MIN, GROW_MAX),
        fade: 1,
        width: rand(1.0, 2.4),
        curl: rand(0, Math.PI * 2),
        branches: Math.random() < 0.7 ? 1 + (Math.random() < 0.4 ? 1 : 0) : 0,
        bright,
      };
      filaments.push(f);
      return f;
    };

    const step = (dt: number, t: number) => {
      for (let i = filaments.length - 1; i >= 0; i--) {
        const f = filaments[i];
        if (f.grow > 0) {
          // Desired heading: an upward bias blended toward the cursor when near.
          let target = -Math.PI / 2;
          if (pointer.active) {
            const dx = pointer.x - f.hx;
            const dy = pointer.y - f.hy;
            const dist = Math.hypot(dx, dy) || 1;
            // a soft lean toward the cursor — the roots follow where you point,
            // they do not race to reach it
            const pull = ATTRACT * clamp(1 - dist / (H * 1.1), 0.08, 0.7);
            const toCursor = Math.atan2(dy, dx);
            // shortest-arc blend up-bias -> cursor
            let d = toCursor - target;
            while (d > Math.PI) d -= Math.PI * 2;
            while (d < -Math.PI) d += Math.PI * 2;
            target += d * pull;
          }
          // organic wander — kept full strength even while following, so growth
          // stays calm and natural instead of locking on
          target += Math.sin(t * 1.1 + f.curl) * 0.5;
          // steer toward target, capped turn rate
          let d = target - f.ang;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          f.ang += clamp(d, -TURN_RATE * dt, TURN_RATE * dt);

          const dist = f.speed * dt;
          f.hx += Math.cos(f.ang) * dist;
          f.hy += Math.sin(f.ang) * dist;
          const last = f.pts[f.pts.length - 1];
          if (Math.hypot(f.hx - last.x, f.hy - last.y) >= STEP_PX) {
            f.pts.push({ x: f.hx, y: f.hy });
          }
          f.grow -= dt;

          // occasional branch off the growing head
          if (f.branches > 0 && Math.random() < dt * 0.9) {
            f.branches--;
            spawn(f.hx, f.hy, f.ang + (Math.random() < 0.5 ? 1 : -1) * rand(0.4, 0.8));
          }

          // gone off the top / sides -> stop growing, start fading
          if (f.hy < -8 || f.hx < -20 || f.hx > W + 20) f.grow = 0;
        } else {
          f.fade -= dt / FADE_TIME;
          if (f.fade <= 0) filaments.splice(i, 1);
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const f of filaments) {
        if (f.pts.length < 2) continue;
        const a = clamp(f.fade, 0, 1);
        const rgb = f.bright ? TIP_RGB : ROOT_RGB;
        // soft outer glow
        ctx.strokeStyle = `rgba(${rgb},${0.10 * a})`;
        ctx.lineWidth = f.width * 5;
        ctx.beginPath();
        ctx.moveTo(f.pts[0].x, f.pts[0].y);
        for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i].x, f.pts[i].y);
        ctx.stroke();
        // crisp core
        ctx.strokeStyle = `rgba(${rgb},${0.55 * a})`;
        ctx.lineWidth = f.width;
        ctx.stroke();
        // glowing growing tip
        if (f.grow > 0) {
          const g = ctx.createRadialGradient(f.hx, f.hy, 0, f.hx, f.hy, f.width * 6);
          g.addColorStop(0, `rgba(${TIP_RGB},${0.9 * a})`);
          g.addColorStop(1, `rgba(${TIP_RGB},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(f.hx, f.hy, f.width * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let prev = performance.now();
    let spawnT = 0;

    // Reduced motion: grow a still field once and hold it frozen. We still run
    // the rAF (so a resize redraws and a live motion-toggle resumes animation),
    // but skip the simulation step so nothing actually moves.
    let staticSeeded = false;
    const seedStaticField = () => {
      if (staticSeeded) return;
      staticSeeded = true;
      for (let s = 0; s < 9; s++) spawn();
      // grow them partway, then freeze at full opacity. Stepping too long would
      // let them finish growing and fade out, leaving the still field blank.
      for (let s = 0; s < 64; s++) step(1 / 30, 0);
      for (const f of filaments) {
        f.grow = 0;
        f.fade = 1;
      }
    };

    if (motionRef.current) {
      for (let s = 0; s < 6; s++) spawn(); // seed a little starting growth
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const t = now / 1000;
      if (motionRef.current) {
        staticSeeded = false;
        spawnT -= dt;
        if (spawnT <= 0) {
          // Steady cadence whether or not the cursor is present. When it is,
          // new roots simply favor its column a little, so growth drifts toward
          // where you point — a gentle follow, not a swarm chasing it.
          const x = pointer.active
            ? clamp(pointer.x + rand(-110, 110), 0, W)
            : undefined;
          spawn(x, undefined, undefined, pointer.active && Math.random() < 0.25);
          spawnT = SPAWN_EVERY * rand(0.7, 1.5);
        }
        step(dt, t);
      } else {
        seedStaticField();
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      fineQuery.removeEventListener("change", syncFine);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", clearPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="take-root-canvas"
      aria-hidden="true"
    />
  );
}
