"use client";

/* ============================================================
   DescentPreviewLoop — a compact, TIME-based (not scroll) looping
   teaser of the transaction descent, for the home page.

   The ~12s loop, over the watercolor trunk plate:
     · a fine moving trace travels down a gentle S-curve, canopy → roots
     · GREEN through the canopy third            (execution)
     · GOLD pulse + brief mid-trunk hold with a
       subtle expanding ring                     (verification beat)
     · COBALT as it sinks into the roots, then a
       clean blue ring at the bottom             (settled)
     · 1.5s rest, loop.

   Overlay: three tiny stage labels (Execute · Verify · Settle) that
   highlight as the trace passes their band, plus a bottom-right CTA
   slot via `children` ("Watch it happen →" etc.).

   Engineering laws honored (see reference_r3f_canvas_gotchas /
   PhotorealBackdrop):
     · ONE rAF loop, and it only runs while the component is
       in-viewport (IntersectionObserver) AND motionOn
     · the route uses simple canvas strokes — no shadowBlur or
       per-frame gradient allocation
     · devicePixelRatio clamped to 1.5, ResizeObserver-aware
     · motion off → ONE static settled frame, zero loops

   Theme: reads <html data-theme> via MutationObserver (like
   FireflyField). Night plate under /dark, day plate otherwise.

   Layout contract: the component FILLS ITS PARENT — give the parent
   a size (it renders a position:relative wrapper; the canvas and
   plate are absolutely positioned inside it).
   ============================================================ */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./DescentPreviewLoop.module.css";

/* ---- plates (night lives under /dark, same repo convention as theme.tsx) */
const PLATE_DARK = "/dark/img/watercolor/trunk-flow-tall.avif";
const PLATE_LIGHT = "/img/watercolor/trunk-flow-tall.avif";

/* ---- stage palette (scene color language) ---- */
const GREEN: RGB = [74, 222, 128]; // execution
const GOLD: RGB = [255, 200, 64]; // verification
const COBALT: RGB = [120, 185, 255]; // settlement
type RGB = [number, number, number];

/* ---- loop timeline ---- */
const TRAVEL_MS = 12000;
const REST_MS = 1500;
const TOTAL_MS = TRAVEL_MS + REST_MS;
const HOLD_A = 0.38; // verification hold begins (t, 0..1 of travel)
const HOLD_B = 0.52; // hold ends
const LAND = 0.9; // trace reaches the roots; settle cue begins

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/** color ramp position u (0 green → 0.5 gold → 1 cobalt) for a path s */
function colorU(s: number): number {
  if (s < 0.3) return 0;
  if (s < 0.5) return ((s - 0.3) / 0.2) * 0.5;
  if (s < 0.62) return 0.5;
  if (s < 0.88) return 0.5 + ((s - 0.62) / 0.26) * 0.5;
  return 1;
}
function rampRGB(u: number): RGB {
  return u <= 0.5 ? mix(GREEN, GOLD, u * 2) : mix(GOLD, COBALT, (u - 0.5) * 2);
}

/** path progress s (0 canopy → 1 roots) for travel time t (0..1),
    with the mid-trunk verification hold baked in */
function sOf(t: number): number {
  if (t < HOLD_A) return smooth(t / HOLD_A) * 0.5;
  if (t < HOLD_B) return 0.5;
  if (t < LAND) return 0.5 + smooth((t - HOLD_B) / (LAND - HOLD_B)) * 0.5;
  return 1;
}

/** Execute / Verify / Settle band for the label overlay */
function stageOf(t: number): 0 | 1 | 2 {
  if (t >= LAND) return 2;
  const s = sOf(t);
  if (s < 0.32) return 0;
  if (s < 0.66) return 1;
  return 2;
}

/** Watch <html data-theme>; null until mounted (avoids a wrong-plate flash
    and any SSR/CSR mismatch — the plate renders once the theme is known). */
function useDocTheme(): "light" | "dark" | null {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setTheme(el.dataset.theme === "dark" ? "dark" : "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

const STAGE_LABELS = ["Execute", "Verify", "Settle"] as const;
const STAGE_CAPTIONS = [
  "Transactions confirmed in seconds (estimated).",
  "Watchers verify the commitment before final settlement.",
  "Rooted securely to the Cardano blockchain.",
] as const;
const STAGE_CLASS_KEYS = ["sGreen", "sGold", "sCobalt"] as const;

export default function DescentPreviewLoop({
  className,
  children,
}: {
  className?: string;
  /** bottom-right CTA slot — pass a "Watch it happen →" link here */
  children?: ReactNode;
}) {
  const { motionOn } = useMotionPref();
  const theme = useDocTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef<"light" | "dark" | null>(theme);
  const [stage, setStage] = useState<0 | 1 | 2>(motionOn ? 0 : 2);
  const stageRef = useRef<0 | 1 | 2>(stage);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  /* ---- the canvas engine ---- */
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    /* glows and lines: 1.5 is visually clean at half the fill cost of 2 */
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    /* ---- the gentle S-curve, canopy → roots ---- */
    const pathX = (s: number) =>
      W *
      (0.5 +
        0.11 * Math.sin(s * Math.PI * 2.1 + 0.5) +
        0.035 * Math.sin(s * Math.PI * 4.7 + 2));
    const pathY = (s: number) => H * (0.05 + 0.9 * s);

    const setStageSafe = (st: 0 | 1 | 2) => {
      if (stageRef.current === st) return;
      stageRef.current = st;
      setStage(st);
    };

    /* additive glow over the night plate; plain paint over the day plate
       (additive over pale paper washes out) */
    const beginGlow = () => {
      ctx.globalCompositeOperation =
        themeRef.current === "light" ? "source-over" : "lighter";
    };

    /* ---- a restrained moving trace, not a glowing orb ---- */
    const TAIL = 18;
    const tail: { x: number; y: number }[] = [];
    let lastT = -1;

    const drawTravelFrame = (t: number) => {
      const s = sOf(t);
      const x = pathX(s);
      const y = pathY(s);
      const u = colorU(s);
      const rgb = rampRGB(u);

      /* loop just wrapped — reset the tail so it doesn't streak upward */
      if (t < lastT) tail.length = 0;
      lastT = t;
      tail.push({ x, y });
      if (tail.length > TAIL) tail.shift();

      ctx.clearRect(0, 0, W, H);
      beginGlow();

      if (tail.length > 1) {
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.36)`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        tail.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }

      /* verification beat — gold pulse + one clean expanding ring */
      if (t >= HOLD_A && t < HOLD_B + 0.04) {
        const k = clamp01((t - HOLD_A) / (HOLD_B - HOLD_A));
        const rr = 9 + smooth(k) * 36;
        ctx.strokeStyle = `rgba(${GOLD[0]}, ${GOLD[1]}, ${GOLD[2]}, ${(0.55 * (1 - k)).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* settle cue — one clean blue ring at the roots */
      if (t >= LAND) {
        const f = clamp01((t - LAND) / (1 - LAND));
        const rr = 8 + smooth(f) * 44;
        ctx.strokeStyle = `rgba(${COBALT[0]}, ${COBALT[1]}, ${COBALT[2]}, ${(0.5 * (1 - f)).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      setStageSafe(stageOf(t));
    };

    const drawRestFrame = () => {
      ctx.clearRect(0, 0, W, H);
      setStageSafe(2);
      tail.length = 0;
      lastT = -1;
    };

    /* ---- motion-off: ONE static settled frame ---- */
    const drawStatic = () => {
      ctx.clearRect(0, 0, W, H);
      beginGlow();
      /* faint vein hint of the full route */
      const STEPS = 36;
      ctx.lineWidth = 1.25;
      for (let i = 0; i < STEPS; i++) {
        const s0 = i / STEPS;
        const s1 = (i + 1) / STEPS;
        const c = rampRGB(colorU((s0 + s1) / 2));
        ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.22)`;
        ctx.beginPath();
        ctx.moveTo(pathX(s0), pathY(s0));
        ctx.lineTo(pathX(s1), pathY(s1));
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      setStageSafe(2);
    };

    /* ---- rAF control: runs only in-viewport AND motionOn ---- */
    let raf = 0;
    let running = false;
    let inView = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const ms = now % TOTAL_MS; // global clock — resumes anywhere in the loop
      if (ms >= TRAVEL_MS) drawRestFrame();
      else drawTravelFrame(ms / TRAVEL_MS);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resize = () => {
      const r = root.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!motionOn) drawStatic();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    if (!motionOn) {
      drawStatic();
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inView = e.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.08 },
    );
    io.observe(root);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [motionOn]);

  const plateSrc =
    theme === null ? null : theme === "dark" ? PLATE_DARK : PLATE_LIGHT;

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      {plateSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- full-bleed decorative plate; theme-swapped at runtime
        <img
          src={plateSrc}
          alt=""
          className={styles.plate}
          draggable={false}
          aria-hidden="true"
        />
      ) : null}
      <div className={styles.veil} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      {/* stage readout — decorative echo of the canvas beat */}
      <div className={styles.stages} aria-hidden="true">
        {STAGE_LABELS.map((label, i) => (
          <span
            key={label}
            className={[styles.stageLabel, styles[STAGE_CLASS_KEYS[i]]].join(" ")}
            data-on={stage === i ? "true" : "false"}
          >
            {i > 0 ? <i className={styles.dot}>·</i> : null}
            {label}
          </span>
        ))}
      </div>

      {/* live caption — one readable sentence narrating the current beat */}
      <p className={styles.caption} data-stage={stage} aria-hidden="true">
        {STAGE_CAPTIONS[stage]}
      </p>

      {children ? <div className={styles.cta}>{children}</div> : null}
    </div>
  );
}
