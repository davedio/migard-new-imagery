"use client";

/* ============================================================
   HeroSapHelix — art-directed sap moving through the World Tree.

   The hero plates are fixed artwork, so the animation follows a
   hand-calibrated spine for each crop instead of trying to infer a
   trunk from painterly pixels at runtime. That keeps the complete
   particle field — cores, bloom, and tails — on the canopy, trunk,
   and root crown at every viewport size.

   Scroll carries the field slowly down the tree and gradually
   resolves it into a restrained double helix. Idle movement stays
   intentionally slow; the plate should feel alive, never busy.
   ============================================================ */

import { useEffect, useRef, type RefObject } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const TAU = Math.PI * 2;
const TAIL = 6;
const CURSOR_R = 110;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const clamp01 = (value: number) => clamp(value, 0, 1);
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const smooth01 = (value: number) => {
  const amount = clamp01(value);
  return amount * amount * (3 - 2 * amount);
};
const fract = (value: number) => value - Math.floor(value);

type SpinePoint = {
  u: number;
  v: number;
  /** Safe source-image half-width around the authored centreline. */
  half: number;
};

/* Source-space paths verified against both responsive hero plates. The wide
   tree sits at ~71% of the source; the portrait trunk resolves at ~55%, not
   the 50% axis used by the previous image sampler. */
const WIDE_SPINE: readonly SpinePoint[] = [
  { u: 0.716, v: 0.22, half: 0.013 },
  { u: 0.715, v: 0.28, half: 0.013 },
  { u: 0.712, v: 0.34, half: 0.012 },
  { u: 0.71, v: 0.4, half: 0.011 },
  { u: 0.706, v: 0.46, half: 0.01 },
  { u: 0.704, v: 0.52, half: 0.009 },
  { u: 0.707, v: 0.58, half: 0.009 },
  { u: 0.706, v: 0.64, half: 0.009 },
  { u: 0.701, v: 0.7, half: 0.01 },
  { u: 0.704, v: 0.76, half: 0.011 },
  { u: 0.71, v: 0.82, half: 0.012 },
  { u: 0.695, v: 0.88, half: 0.013 },
];

const PORTRAIT_SPINE: readonly SpinePoint[] = [
  { u: 0.49, v: 0.31, half: 0.014 },
  { u: 0.505, v: 0.36, half: 0.014 },
  { u: 0.52, v: 0.42, half: 0.013 },
  { u: 0.536, v: 0.48, half: 0.012 },
  { u: 0.547, v: 0.54, half: 0.011 },
  { u: 0.552, v: 0.6, half: 0.009 },
  { u: 0.553, v: 0.66, half: 0.009 },
  { u: 0.543, v: 0.72, half: 0.01 },
  { u: 0.528, v: 0.77, half: 0.011 },
  { u: 0.512, v: 0.82, half: 0.012 },
  { u: 0.495, v: 0.87, half: 0.013 },
  { u: 0.487, v: 0.91, half: 0.014 },
];

type Orb = {
  seed: number;
  phase: number;
  speed: number;
  size: number;
  strand: 0 | 1;
  helixMix: number;
  tail: { x: number; y: number }[];
};

const seededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const catmull = (a: number, b: number, c: number, d: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * b +
      (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t2 +
      (-a + 3 * b - 3 * c + d) * t3)
  );
};

const sampleSpine = (spine: readonly SpinePoint[], position: number): SpinePoint => {
  const scaled = clamp01(position) * (spine.length - 1);
  const index = Math.min(spine.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const p0 = spine[Math.max(0, index - 1)];
  const p1 = spine[index];
  const p2 = spine[index + 1];
  const p3 = spine[Math.min(spine.length - 1, index + 2)];
  return {
    u: catmull(p0.u, p1.u, p2.u, p3.u, local),
    v: catmull(p0.v, p1.v, p2.v, p3.v, local),
    half: catmull(p0.half, p1.half, p2.half, p3.half, local),
  };
};

const makeGlowSprite = () => {
  const sprite = document.createElement("canvas");
  sprite.width = 96;
  sprite.height = 96;
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  const glow = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  glow.addColorStop(0, "rgba(248, 255, 250, 1)");
  glow.addColorStop(0.09, "rgba(220, 255, 231, 0.98)");
  glow.addColorStop(0.2, "rgba(105, 255, 154, 0.78)");
  glow.addColorStop(0.48, "rgba(24, 242, 104, 0.24)");
  glow.addColorStop(1, "rgba(0, 210, 82, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 96, 96);
  return sprite;
};

export function HeroSapHelix({
  imgRef,
  progressRef,
}: {
  imgRef: RefObject<HTMLImageElement | null>;
  progressRef: RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  const active = motionOn && theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imgRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !image || !host || !active) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const mask = document.createElement("canvas");
    const maskContext = mask.getContext("2d");
    if (!maskContext) return;
    const sprite = makeGlowSprite();

    let width = 0;
    let height = 0;
    let offsetX = 0;
    let offsetY = 0;
    let drawScale = 1;
    let dpr = 1;
    let portrait = false;
    let mobile = false;
    let spine = WIDE_SPINE;
    let elapsed = 0;
    let last = performance.now();
    let raf = 0;
    let wakeTimer = 0;
    let running = false;
    let disposed = false;

    const orbs: Orb[] = [];
    const cursor = { x: -9999, y: -9999 };

    const toX = (u: number) => u * (image.naturalWidth || 1) * drawScale + offsetX;
    const toY = (v: number) => v * (image.naturalHeight || 1) * drawScale + offsetY;

    const helixRadiusPx = (point: SpinePoint) => {
      const sourceHalf = point.half * (image.naturalWidth || 1) * drawScale;
      return clamp(sourceHalf * 0.7, mobile ? 4.2 : 6, mobile ? 6.6 : 10.5);
    };

    const resetOrbs = () => {
      const count = mobile ? 26 : 44;
      const random = seededRandom(portrait ? 0x51a9f2 : 0x72bc41);
      orbs.length = 0;
      for (let index = 0; index < count; index += 1) {
        orbs.push({
          seed: fract((index + random() * 0.42) / count),
          phase: (random() - 0.5) * 0.5,
          speed: 0.0052 + random() * 0.0028,
          size: 0.72 + random() * 0.7,
          strand: index % 2 === 0 ? 0 : 1,
          helixMix: random() < 0.72 ? 1 : 0.18 + random() * 0.1,
          tail: [],
        });
      }
    };

    const rebuildMask = () => {
      mask.width = canvas.width;
      mask.height = canvas.height;
      maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskContext.clearRect(0, 0, width, height);
      maskContext.lineCap = "round";
      maskContext.lineJoin = "round";

      const samples = Array.from({ length: 121 }, (_, index) =>
        sampleSpine(spine, index / 120),
      );

      /* A soft corridor clips cores, trails, and bloom — not just orb centres.
         It is built only on resize/source changes, so the feather costs nothing
         in the animation loop. */
      for (let pass = 0; pass < 2; pass += 1) {
        maskContext.strokeStyle = pass === 0 ? "rgba(255,255,255,0.42)" : "white";
        maskContext.shadowColor = pass === 0 ? "rgba(255,255,255,0.72)" : "transparent";
        maskContext.shadowBlur = pass === 0 ? 5 : 0;
        for (let index = 1; index < samples.length; index += 1) {
          const from = samples[index - 1];
          const to = samples[index];
          const radius = (helixRadiusPx(from) + helixRadiusPx(to)) * 0.5;
          maskContext.lineWidth = (radius + (pass === 0 ? 7 : 3.5)) * 2;
          maskContext.beginPath();
          maskContext.moveTo(toX(from.u), toY(from.v));
          maskContext.lineTo(toX(to.u), toY(to.v));
          maskContext.stroke();
        }
      }
      maskContext.shadowBlur = 0;
    };

    const fit = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      width = host.clientWidth;
      height = host.clientHeight;
      mobile = width <= 760;
      portrait = image.naturalHeight > image.naturalWidth * 1.1;
      spine = portrait ? PORTRAIT_SPINE : WIDE_SPINE;
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight;
      const position = window.getComputedStyle(image).objectPosition.split(" ");
      const positionX = (Number.parseFloat(position[0]) || 50) / 100;
      const positionY = (Number.parseFloat(position[1]) || 50) / 100;
      drawScale = Math.max(width / imageWidth, height / imageHeight);
      offsetX = (width - imageWidth * drawScale) * positionX;
      offsetY = (height - imageHeight * drawScale) * positionY;

      resetOrbs();
      rebuildMask();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      cursor.x = ((event.clientX - bounds.left) / bounds.width) * width;
      cursor.y = ((event.clientY - bounds.top) / bounds.height) * height;
    };

    const drawOrb = (
      orb: Orb,
      x: number,
      y: number,
      depth: number,
      alpha: number,
      cursorLift: number,
    ) => {
      const core = orb.size * lerp(0.72, 1.08, depth) * (mobile ? 0.86 : 1);
      const bloom = core * (10.5 + cursorLift * 1.4);

      for (let index = orb.tail.length - 1; index >= 1; index -= 1) {
        const point = orb.tail[index];
        const life = 1 - index / orb.tail.length;
        const size = core * (3.3 + life * 1.4);
        context.globalAlpha = alpha * life * 0.12;
        context.drawImage(sprite, point.x - size / 2, point.y - size / 2, size, size);
      }

      context.globalAlpha = alpha * (0.58 + cursorLift * 0.1);
      context.drawImage(sprite, x - bloom / 2, y - bloom / 2, bloom, bloom);
      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(x, y, Math.max(0.55, core * 0.72), 0, TAU);
      context.fillStyle = "rgba(242, 255, 247, 0.96)";
      context.fill();
    };

    const tick = (now: number) => {
      if (disposed) return;
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      elapsed += delta;
      const scrollProgress = clamp01(progressRef.current || 0);

      if (scrollProgress > 0.998 || !width || !height) {
        context.clearRect(0, 0, width, height);
        running = false;
        raf = 0;
        return;
      }

      const helixBlend = smooth01((scrollProgress - 0.16) / 0.52);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      for (const orb of orbs) {
        /* Scroll carries the field only partway down the tree; the remainder is
           a very slow autonomous sap flow. Full canopy-to-root travel takes
           roughly 2–3 minutes at idle instead of racing through in seconds. */
        const position = fract(orb.seed + elapsed * orb.speed + scrollProgress * 0.3);
        const point = sampleSpine(spine, position);
        const radius = helixRadiusPx(point) * lerp(0.12, 1, helixBlend) * orb.helixMix;
        const angle =
          orb.phase +
          position * TAU * 2.15 +
          elapsed * 0.16 +
          scrollProgress * Math.PI * 0.45 +
          (orb.strand ? Math.PI : 0);
        const depth = 0.5 + 0.5 * Math.sin(angle + Math.PI / 2);
        const x = toX(point.u) + Math.cos(angle) * radius;
        const y = toY(point.v);
        const cursorDistance = Math.hypot(x - cursor.x, y - cursor.y);
        const cursorLift = cursorDistance < CURSOR_R ? 1 - cursorDistance / CURSOR_R : 0;
        const edgeFade = smooth01(position / 0.055) * smooth01((1 - position) / 0.065);
        const backHalf = lerp(0.5, 1, depth);
        const alpha = edgeFade * backHalf * (0.76 + cursorLift * 0.16);

        orb.tail.unshift({ x, y });
        if (orb.tail.length > TAIL) orb.tail.pop();
        drawOrb(orb, x, y, depth, alpha, cursorLift);
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "destination-in";
      context.drawImage(mask, 0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || disposed || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onScroll = () => {
      start();
      window.clearTimeout(wakeTimer);
      /* HeroTreeImage damps toward its new scroll target. If this field was
         parked after the final fade, wake it once more after that shared
         progress has moved so a single fast scroll-up always restores sap. */
      wakeTimer = window.setTimeout(start, 220);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onImage = () => {
      const ready = () => {
        if (disposed) return;
        fit();
        start();
      };
      if (typeof image.decode === "function") {
        image.decode().then(ready).catch(() => window.setTimeout(ready, 120));
      } else {
        ready();
      }
    };

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(host);
    image.addEventListener("load", onImage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    if (image.complete && image.naturalWidth) onImage();
    start();

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(wakeTimer);
      resizeObserver.disconnect();
      image.removeEventListener("load", onImage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [imgRef, progressRef, active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="hero-tree-stage__sap" aria-hidden />;
}

export default HeroSapHelix;
