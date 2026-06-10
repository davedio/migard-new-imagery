"use client";

/* ============================================================================
   HeroSapOrbs — the luminous sap, back on the hero.

   A 2D canvas that draws ONLY orbs, mounted INSIDE the plate's transform
   tree (same box as the background-image div), so every scroll/mouse
   parallax transform applies to plate and orbs identically — alignment for
   free. The engine samples the plate's green veins (the proven approach:
   orbs must ride continuous samplable veins, never a generic band):

     · the plate image is downsampled offscreen → a green-dominance grid
     · orbs spawn in the canopy band, then each step pick the greenest of
       five downward directions — so they visibly track the painted veins
       from leaves → trunk → roots (the canonical downward sap flow)
     · comet rendering: white-hot head + green trailing tail (#00ff66 family)
     · small = fast, big = slow; orbs near the cursor speed up
     · rare gentle surges (event-based), never a constant arcade pulse

   Runs only while visible, the tab is foreground, and motion is on.
   ========================================================================== */

import { useEffect, useRef, type RefObject } from "react";
import { useMotionPref } from "@/lib/motion";

const PLATE_SRC = "/v2/hero-wide.avif";
/* must mirror the plate div's background-position (desktop / ≤760px).
   Desktop pos-x is a RAMP synced with HomeV2's platePosX: the camera
   turns toward the tree (88% -> 100%) through the dissolve. */
const POS_MOBILE = { x: 0.92, y: 0.32 };
const POS_DESKTOP_Y = 0.38;
const posXAt = (p: number) =>
  0.88 + 0.12 * Math.min(1, Math.max(0, (p - 0.15) / 0.57));

const GRID_W = 384; // downsample width for the vein field
const SPAWN_BAND: [number, number] = [0.02, 0.58]; // canopy-to-trunk band (image-y fraction)
const GREEN_MIN = 34; // vein threshold in the 0-255 dominance score
const TAIL = 11; // comet tail samples
const CURSOR_R = 110; // px (canvas space) — orbs near the pointer hurry
const CURSOR_BOOST = 2.1;

type Orb = {
  x: number; // image-space px
  y: number;
  size: number;
  speed: number; // image px / s
  alpha: number;
  tail: { x: number; y: number }[];
  dying: boolean;
  /* helix (dissolve) state */
  theta: number;
  omega: number;
  strand: 0 | 1;
  anchorY: number | null;
  rise: number;
  /** how fully this orb joins the helix (a minority stays on the bark so
      the tree itself remains part of the magic) */
  mix: number;
};

const smooth01 = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * progressRef (0→1, the hero's scroll runway) drives the TRANSFORM:
 * below ~30% the orbs ride the painted veins; past it they detach into a
 * rising double-helix around the trunk — the tree "breaks into" the network.
 * Fully reversible on scroll-up.
 */
export default function HeroSapOrbs({
  progressRef,
}: {
  progressRef?: RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || !motionOn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let disposed = false;
    let visible = false;

    /* ---- vein field ---- */
    let field: Uint8Array | null = null;
    let gw = 0;
    let gh = 0;
    let imgW = 0;
    let imgH = 0;
    /* the helix axis — the trunk's true centre, measured from the green
       mass of the plate itself so the spin wraps the TREE, not a guess */
    let trunkX = 0;
    const spawnSites: { x: number; y: number }[] = [];

    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      gw = GRID_W;
      gh = Math.round((imgH / imgW) * gw);
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, gw, gh);
      const data = octx.getImageData(0, 0, gw, gh).data;
      field = new Uint8Array(gw * gh);
      for (let i = 0; i < gw * gh; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        /* green dominance: lit veins are green over dark bark */
        const score = Math.max(0, Math.min(255, g - Math.max(r, b) + (g > 120 ? 40 : 0)));
        field[i] = score;
      }
      /* spawn sites: green cells inside the canopy band */
      const y0 = Math.floor(SPAWN_BAND[0] * gh);
      const y1 = Math.floor(SPAWN_BAND[1] * gh);
      for (let gy = y0; gy < y1; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          if (field[gy * gw + gx] > GREEN_MIN + 18) {
            spawnSites.push({ x: (gx / gw) * imgW, y: (gy / gh) * imgH });
          }
        }
      }
      /* trunk centre = green-mass centroid of the mid band (trunk + roots
         neck). This is where the helix must spin. */
      let wsum = 0;
      let xsum = 0;
      const t0 = Math.floor(0.42 * gh);
      const t1 = Math.floor(0.82 * gh);
      for (let gy = t0; gy < t1; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const v = field[gy * gw + gx];
          if (v > GREEN_MIN) {
            wsum += v;
            xsum += v * (gx / gw) * imgW;
          }
        }
      }
      trunkX = wsum > 0 ? xsum / wsum : imgW * 0.78;
      syncRunState();
    };

    const green = (ix: number, iy: number): number => {
      if (!field) return 0;
      const gx = Math.round((ix / imgW) * gw);
      const gy = Math.round((iy / imgH) * gh);
      if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) return 0;
      return field[gy * gw + gx];
    };

    /* ---- cover mapping: image px -> canvas px (mirrors background cover) */
    let W = 0;
    let H = 0;
    let scale = 1;
    let offX = 0;
    let offY = 0;
    let mobile = false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!imgW) return;
      mobile = window.innerWidth <= 760;
      scale = Math.max(W / imgW, H / imgH);
      offY = (H - imgH * scale) * (mobile ? POS_MOBILE.y : POS_DESKTOP_Y);
      /* offX is progress-dependent on desktop — refreshed each tick */
      offX = (W - imgW * scale) * (mobile ? POS_MOBILE.x : posXAt(0));
    };

    /* ---- cursor (canvas space) ---- */
    const cursor = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      /* getBoundingClientRect includes ancestor transforms — map into the
         canvas' untransformed coordinate space */
      cursor.x = ((e.clientX - r.left) / r.width) * W;
      cursor.y = ((e.clientY - r.top) / r.height) * H;
    };

    /* ---- orbs ---- */
    const orbCount = () => (window.innerWidth <= 760 ? 68 : 128);
    const orbs: Orb[] = [];

    const spawn = (o?: Orb): Orb | null => {
      if (spawnSites.length === 0) return null;
      const site = spawnSites[(Math.random() * spawnSites.length) | 0];
      const size = 0.7 + Math.random() * 1.5;
      const orb: Orb = o ?? {
        x: 0, y: 0, size, speed: 0, alpha: 0, tail: [], dying: false,
        theta: 0, omega: 0, strand: 0, anchorY: null, rise: 0, mix: 1,
      };
      orb.x = site.x + (Math.random() - 0.5) * 6;
      orb.y = site.y;
      orb.size = size;
      /* small = fast, big = slow + linger */
      orb.speed = (44 - size * 11) * (0.9 + Math.random() * 0.34);
      orb.alpha = 0;
      orb.tail = [];
      orb.dying = false;
      orb.theta = Math.random() * Math.PI * 2;
      orb.omega = 0.7 + Math.random() * 0.9;
      orb.strand = Math.random() < 0.5 ? 0 : 1;
      orb.anchorY = null;
      orb.rise = 0;
      /* ~1 in 5 orbs keeps riding the bark veins through the dissolve */
      orb.mix = Math.random() < 0.2 ? 0.1 + Math.random() * 0.15 : 1;
      return orb;
    };

    /* surge state — a rare, soft event pulse */
    let surge = 0;
    let nextSurge = 5 + Math.random() * 6;
    /* shared helix clock — all beads spin on the SAME screw so the two
       strands read as coherent DNA, not a particle cloud */
    let helixT = 0;

    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!field || W === 0) return;

      /* dissolve factor from the hero scroll runway — the lights first travel
         down the tree, then break apart into the helix for the thesis phase. */
      const p = progressRef?.current ?? 0;
      const d = smooth01((p - 0.38) / 0.34);
      /* the camera turn (synced with the plate's background-position ramp) */
      if (!mobile) offX = (W - imgW * scale) * posXAt(p);

      /* population control — the burst thickens the helix */
      const want = Math.round(orbCount() * (1 + d * 1.15));
      while (orbs.length < want) {
        const o = spawn();
        if (!o) break;
        /* stagger initial fill down the tree so it doesn't pop in as a band */
        o.y += Math.random() * imgH * 0.7;
        orbs.push(o);
      }
      if (orbs.length > want + 12) orbs.length = want + 12;

      nextSurge -= dt;
      if (nextSurge <= 0) {
        surge = 1;
        nextSurge = 6 + Math.random() * 7;
      }
      surge = Math.max(0, surge - dt * 0.55);
      helixT += dt;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const step = imgW * 0.006; // sampling stride (image px)

      for (const o of orbs) {
        /* fade in/out */
        if (o.dying) {
          o.alpha -= dt * 1.6;
          if (o.alpha <= 0) { spawn(o); continue; }
        } else {
          o.alpha = Math.min(1, o.alpha + dt * 1.2);
        }

        /* ---- vein motion (always simmering underneath) ---- */
        let bestA = 0;
        let bestV = -1;
        for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
          const v =
            green(o.x + Math.sin(a) * step, o.y + Math.cos(a) * step) +
            (a === 0 ? 6 : 0) + /* slight straight-down bias */
            Math.random() * 10;
          if (v > bestV) { bestV = v; bestA = a; }
        }
        if (bestV < GREEN_MIN && d * o.mix < 0.4) {
          /* vein ran out (root tip / off-tree) — let the light sink out */
          o.dying = true;
        }

        /* cursor proximity boost (canvas space, against the drawn position) */
        const pcx = o.x * scale + offX;
        const pcy = o.y * scale + offY;
        const cdst = Math.hypot(pcx - cursor.x, pcy - cursor.y);
        const boost =
          cdst < CURSOR_R ? CURSOR_BOOST - (cdst / CURSOR_R) * (CURSOR_BOOST - 1) : 1;

        const sp = o.speed * boost * (1 + surge * 0.9);
        o.x += Math.sin(bestA) * sp * dt;
        o.y = Math.min(o.y + Math.cos(bestA) * sp * dt, imgH * 1.02);
        if (o.y > imgH * 0.985 && d * o.mix < 0.4) o.dying = true;

        /* ---- helix motion (the dissolve) ---- */
        let ix = o.x;
        let iy = o.y;
        let depthMod = 1;
        /* per-orb dissolve: bark-riders (low mix) barely leave the tree */
        const di = d * o.mix;
        if (di > 0.01) {
          if (o.anchorY === null) o.anchorY = o.y;
          /* stately rise — the spin should be WATCHED, not flicked past */
          o.rise += dt * (11 + o.size * 5) * di;
          let hy = o.anchorY - o.rise;
          /* strands loop: re-enter from below once they leave the canopy */
          if (hy < imgH * 0.04) {
            o.rise = 0;
            o.anchorY = imgH * (0.72 + Math.random() * 0.2);
            hy = o.anchorY;
          }
          /* phase = shared clock + height along the screw + strand offset
             (+ a whisper of per-bead jitter) — beads at the same height
             line up into two clean spiralling strands */
          const phase =
            helixT * 1.05 +
            (hy / imgH) * Math.PI * 4.6 +
            (o.strand ? Math.PI : 0) +
            (o.theta % 0.6) * 0.6;
          /* axis = the measured trunk centre — the screw wraps the TREE */
          const R = imgW * (0.012 + 0.105 * d);
          const hx = trunkX + Math.cos(phase) * R;
          depthMod = 0.62 + 0.38 * Math.sin(phase + Math.PI / 2);
          ix = lerp(o.x, hx, di);
          iy = lerp(o.y, hy, di);
        } else if (o.anchorY !== null) {
          o.anchorY = null; /* scrolled back up — re-glue to the veins */
          o.rise = 0;
        }

        const cx = ix * scale + offX;
        const cy = iy * scale + offY;

        o.tail.unshift({ x: cx, y: cy });
        if (o.tail.length > TAIL) o.tail.pop();

        /* comet: green tail … white-hot head. In the helix the tail shortens
           and the head brightens — beads of light on two strands. */
        /* beads swell ~75% in the helix — the spin must be the loudest
           thing on screen (review: brighter, more prominent) */
        const r =
          o.size * (1 + surge * 0.25) * lerp(1, depthMod, d) * (1 + d * 0.75);
        /* never exceeds the samples we actually have (a fresh orb has 1) */
        const tailN = Math.min(
          o.tail.length,
          Math.max(2, Math.round(o.tail.length * (1 - d * 0.55))),
        );
        for (let i = tailN - 1; i >= 1; i--) {
          const t = i / tailN;
          const tp = o.tail[i];
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, r * (1 - t * 0.72), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 102, ${(o.alpha * (0.24 + d * 0.18) * (1 - t)).toFixed(3)})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(51, 255, 51, ${(o.alpha * (0.24 + d * 0.26)).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 255, 242, ${(o.alpha * (0.94 + d * 0.06) * lerp(1, depthMod, d * 0.55)).toFixed(3)})`;
        ctx.shadowColor = "rgba(0, 255, 102, 0.95)";
        ctx.shadowBlur = 14 + d * 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      fit();
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const syncRunState = () => (visible && !document.hidden && field ? start() : stop());

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncRunState();
      },
      { threshold: 0.02 },
    );
    io.observe(host);
    const onVis = syncRunState;
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    img.src = PLATE_SRC;

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, [motionOn, progressRef]);

  if (!motionOn) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
