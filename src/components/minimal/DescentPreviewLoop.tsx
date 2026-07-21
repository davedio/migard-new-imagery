"use client";

/* ============================================================
   DescentPreviewLoop — a compact, TIME-based (not scroll) looping
   teaser of the transaction descent, for the home page.

   The ~10s loop, over the SAME signature tree used by the home hero:
     · a visible signal packet travels down the painted tree, canopy → roots
     · GREEN through the canopy third            (execution)
     · GOLD pulse + brief mid-trunk hold with a
       pair of expanding rings                   (verification beat)
     · COBALT as it sinks into the roots, then a
       clean blue settlement halo at the bottom (settled)
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

   Theme: reads <html data-theme> via MutationObserver so the hero-matched
   night/day plate never flashes in the wrong mode.

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
import { useTheme } from "@/lib/theme";
import styles from "./DescentPreviewLoop.module.css";

/* ---- exact home-hero vista, reused here instead of a separate tree painting */
const HERO_TREE = {
  dark: {
    avif:
      "/dark/img/tree/tree-hero-vista-1280.avif 1280w, /dark/img/tree/tree-hero-vista-1920.avif 1920w, /dark/img/tree/tree-hero-vista-2880.avif 2880w",
    webp:
      "/dark/img/tree/tree-hero-vista-1280.webp 1280w, /dark/img/tree/tree-hero-vista-1920.webp 1920w, /dark/img/tree/tree-hero-vista-2880.webp 2880w",
    fallback: "/dark/img/tree/tree-hero-vista-1920.webp",
  },
  light: {
    avif:
      "/img/tree/tree-hero-vista-1280.avif 1280w, /img/tree/tree-hero-vista-1920.avif 1920w, /img/tree/tree-hero-vista-2880.avif 2880w",
    webp:
      "/img/tree/tree-hero-vista-1280.webp 1280w, /img/tree/tree-hero-vista-1920.webp 1920w, /img/tree/tree-hero-vista-2880.webp 2880w",
    fallback: "/img/tree/tree-hero-vista-1920.webp",
  },
} as const;

/* ---- stage palette (scene color language) ---- */
const GREEN: RGB = [74, 222, 128]; // execution
const GOLD: RGB = [255, 200, 64]; // verification
const COBALT: RGB = [120, 185, 255]; // settlement
type RGB = [number, number, number];

/* ---- loop timeline ---- */
const TRAVEL_MS = 9000;
const REST_MS = 1500;
const TOTAL_MS = TRAVEL_MS + REST_MS;
const HOLD_A = 0.34; // verification hold begins (t, 0..1 of travel)
const HOLD_B = 0.51; // hold ends
const LAND = 0.91; // signal reaches the roots; settle cue begins
const CHECKPOINTS = [0.12, 0.5, 0.96] as const;

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
  if (t < HOLD_A) return 0;
  if (t < HOLD_B + 0.06) return 1;
  return 2;
}

const STAGE_LABELS = ["Execute", "Verify", "Settle"] as const;
const STAGE_CAPTIONS = [
  "Transactions confirmed in seconds.",
  "Watchers verify the commitment before final settlement.",
  "Rooted securely to the Cardano blockchain.",
] as const;
const STATIC_CAPTION = "Execute, verify, and settle securely to Cardano.";
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
  const { theme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef<"light" | "dark">(theme);
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

    /* The hero vista is art-directed around x≈66%. This narrow S follows the
       actual canopy/trunk/root spine after object-fit cropping at every size. */
    const pathX = (s: number) =>
      W *
      (0.665 +
        0.018 * Math.sin(s * Math.PI * 2.1 + 0.35) -
        0.009 * Math.sin(s * Math.PI * 4.2));
    const pathY = (s: number) => H * (0.16 + 0.68 * s);

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

    const pointAt = (s: number) => ({ x: pathX(s), y: pathY(s) });
    const drawRoute = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle =
        themeRef.current === "light"
          ? "rgba(20, 73, 43, 0.3)"
          : "rgba(196, 224, 202, 0.2)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      for (let i = 0; i <= 44; i++) {
        const point = pointAt(i / 44);
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawCheckpoints = (progress: number, active: 0 | 1 | 2) => {
      CHECKPOINTS.forEach((checkpoint, index) => {
        const point = pointAt(checkpoint);
        const color = [GREEN, GOLD, COBALT][index];
        const reached = progress + 0.015 >= checkpoint;
        const isActive = index === active;
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${reached ? 0.9 : 0.34})`;
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${reached ? 0.92 : 0.26})`;
        ctx.lineWidth = isActive ? 1.8 : 1.15;
        ctx.beginPath();
        ctx.arc(point.x, point.y, isActive ? 7 : 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(point.x, point.y, isActive ? 2.7 : 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    /* ---- a clear but restrained signal packet + short wake ---- */
    const TAIL = 22;
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
      drawRoute();
      beginGlow();

      if (tail.length > 1) {
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.72)`;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        tail.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }

      const active = stageOf(t);
      drawCheckpoints(s, active);

      /* The moving packet is a small diamond with a crisp halo, readable over
         both plates without allocating a per-frame gradient or shadow blur. */
      ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.76)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.98)`;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();

      /* verification beat — two clearly separated gold checkpoint pulses */
      if (t >= HOLD_A && t < HOLD_B + 0.04) {
        const k = clamp01((t - HOLD_A) / (HOLD_B - HOLD_A));
        for (const delay of [0, 0.42]) {
          const pulse = clamp01((k - delay) / (1 - delay));
          const rr = 12 + smooth(pulse) * 42;
          ctx.strokeStyle = `rgba(${GOLD[0]}, ${GOLD[1]}, ${GOLD[2]}, ${(0.62 * (1 - pulse)).toFixed(3)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(x, y, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      /* settle cue — the packet resolves into a persistent cobalt root halo */
      if (t >= LAND) {
        const f = clamp01((t - LAND) / (1 - LAND));
        const rr = 12 + smooth(f) * 46;
        ctx.strokeStyle = `rgba(${COBALT[0]}, ${COBALT[1]}, ${COBALT[2]}, ${(0.22 + 0.46 * (1 - f)).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      setStageSafe(active);
    };

    const drawRestFrame = () => {
      drawTravelFrame(1);
    };

    /* ---- motion-off: ONE static settled frame ---- */
    const drawStatic = () => {
      ctx.clearRect(0, 0, W, H);
      drawRoute();
      beginGlow();
      /* Full colored route + all three checkpoints: no motion is required to
         understand Execute → Verify → Settle. */
      const STEPS = 44;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      for (let i = 0; i < STEPS; i++) {
        const s0 = i / STEPS;
        const s1 = (i + 1) / STEPS;
        const c = rampRGB(colorU((s0 + s1) / 2));
        ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.66)`;
        ctx.beginPath();
        ctx.moveTo(pathX(s0), pathY(s0));
        ctx.lineTo(pathX(s1), pathY(s1));
        ctx.stroke();
      }
      drawCheckpoints(1, 2);
      const settled = pointAt(1);
      ctx.strokeStyle = `rgba(${COBALT[0]}, ${COBALT[1]}, ${COBALT[2]}, 0.5)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(settled.x, settled.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      setStageSafe(2);
    };

    /* ---- rAF control: runs only in-viewport AND motionOn ---- */
    let raf = 0;
    let running = false;
    let inView = false;
    let startedAt = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const ms = (now - startedAt) % TOTAL_MS;
      if (ms >= TRAVEL_MS) drawRestFrame();
      else drawTravelFrame(ms / TRAVEL_MS);
    };
    const start = () => {
      if (running) return;
      running = true;
      startedAt = performance.now();
      tail.length = 0;
      lastT = -1;
      setStageSafe(0);
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
  }, [motionOn, theme]);

  const tree = HERO_TREE[theme];

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-descent-preview
      data-motion={motionOn ? "on" : "off"}
    >
      <picture>
        <source
          type="image/avif"
          srcSet={tree.avif}
          sizes="(max-width: 640px) 100vw, (min-width: 1440px) 68vw, 1060px"
        />
        <source
          type="image/webp"
          srcSet={tree.webp}
          sizes="(max-width: 640px) 100vw, (min-width: 1440px) 68vw, 1060px"
        />
        <img
          src={tree.fallback}
          alt=""
          className={styles.plate}
          data-signature-tree
          draggable={false}
          decoding="async"
          loading="lazy"
          aria-hidden="true"
        />
      </picture>
      <div className={styles.veil} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      {/* stage readout — decorative echo of the canvas beat */}
      <div
        className={styles.stages}
        data-stage={stage}
        data-lifecycle-stage={STAGE_LABELS[stage].toLowerCase()}
        aria-hidden="true"
      >
        {STAGE_LABELS.map((label, i) => (
          <span
            className={styles.stageUnit}
            data-state={i < stage ? "complete" : i === stage ? "active" : "upcoming"}
            key={label}
          >
            {i > 0 ? <i className={styles.connector}>→</i> : null}
            <span
              className={[styles.stageLabel, styles[STAGE_CLASS_KEYS[i]]].join(" ")}
              data-lifecycle-label={label.toLowerCase()}
              data-state={i < stage ? "complete" : i === stage ? "active" : "upcoming"}
            >
              <b>{String(i + 1).padStart(2, "0")}</b>
              {label}
            </span>
          </span>
        ))}
      </div>

      {/* live caption — one readable sentence narrating the current beat */}
      <p className={styles.caption} data-stage={stage} aria-hidden="true">
        {motionOn ? STAGE_CAPTIONS[stage] : STATIC_CAPTION}
      </p>
      <p className={styles.srOnly}>
        Transaction lifecycle illustration: execute on Midgard, verify the commitment, then settle
        to Cardano.
      </p>

      {children ? <div className={styles.cta}>{children}</div> : null}
    </div>
  );
}
