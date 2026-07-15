"use client";

/* ============================================================
   HeroSapHelix — the gateway hero's "sick helix" (sap orbs that
   ride the tree, then break into a spinning double-helix on
   scroll), ported to the painterly light-mode World Tree.

   The painted plate has no bioluminescent veins to sample, so the
   engine reads TREE-vs-SKY instead: a tracking centroid walks the
   dark painted mass down from the canopy, yielding the trunk's
   centerline + width per row. Ambient phase: sap orbs are born in
   the canopy and meander down that anatomy. As the hero's descent
   progress rises (the same eased value that drives the plate zoom),
   the orbs detach into a phase-coherent double-helix wrapped around
   the measured trunk — fully reversible on scroll-up.

   Placement: the canvas lives INSIDE the hero's transformed mover,
   so the plate zoom/lift carries the orbs with zero re-projection.
   Palette is theme-aware: deep-emerald ink beads with pale hearts
   on the light plate (additive neon vanishes on cream), the
   original luminous set when the dark plates land.

   Perf: parked when the tab is hidden or the plate has dissolved
   (descent > ~0.99); everything else matches the proven engine.
   ============================================================ */

import { useEffect, useRef, type RefObject } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const ROWS = 96;
const TAIL = 7;
const CURSOR_R = 100;
const CURSOR_BOOST = 2.0;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth01 = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

type Orb = {
  u: number; // image-space fraction 0..1
  v: number;
  drift: number; // personal lane offset within the trunk width (-1..1)
  size: number;
  speed: number; // v-fraction per second
  alpha: number;
  tail: { x: number; y: number }[];
  dying: boolean;
  theta: number;
  strand: 0 | 1;
  anchorV: number | null;
  flow: number;
  mix: number; // helix participation (a minority keeps riding the bark)
};

export function HeroSapHelix({
  imgRef,
  progressRef,
}: {
  /** the hero <img> — sampled for anatomy, mirrored for geometry */
  imgRef: RefObject<HTMLImageElement | null>;
  /** the hero's eased descent progress (0..1), written by HeroTreeImage */
  progressRef: RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  /* DARK MODE ONLY (direction 2026-07-13): the luminous sap belongs to the
     night plate. */
  const active = motionOn && theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !img || !host || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let disposed = false;

    /* ---- anatomy: centerline + width per row, canopy sites ---- */
    const cLine = new Float32Array(ROWS).fill(0.68);
    const wLine = new Float32Array(ROWS).fill(0.07);
    let treeTopV = 0.06;
    let rootsV = 0.9;
    let trunkU = 0.72;
    let anatReady = false;
    const canopySites: { u: number; v: number }[] = [];

    const rowAt = (arr: Float32Array, v: number) => {
      const f = clamp01(v) * (ROWS - 1);
      const i = Math.floor(f);
      return lerp(arr[i], arr[Math.min(ROWS - 1, i + 1)], f - i);
    };
    const cAt = (v: number) => rowAt(cLine, v);
    const wAt = (v: number) => rowAt(wLine, v);
    /* The crown can spread laterally, but the sap should visibly funnel into
       the trunk. Blend the sampled canopy centre toward the stable mid-trunk
       axis as V increases, rather than following every painted side branch. */
    const pathCenterAt = (v: number) => {
      const funnel = smooth01(
        (v - (treeTopV + 0.08)) / Math.max(0.01, rootsV - treeTopV - 0.08),
      );
      return lerp(cAt(v), trunkU, funnel * 0.92);
    };
    /* The visible sap corridor narrows as it leaves the canopy. This keeps
       ambient orbs and both helix strands on the painted tree instead of in
       the surrounding sky, even where the sampled canopy is very broad. */
    const pathHalfAt = (v: number) => {
      const downTree = smooth01((v - treeTopV) / Math.max(0.01, rootsV - treeTopV));
      const sampled = wAt(v) * lerp(0.62, 0.42, downTree);
      return clamp(sampled, 0.012, lerp(0.085, 0.034, downTree));
    };

    const sampleAnatomy = () => {
      if (!img.complete || img.naturalWidth === 0) return;
      const gw = 160;
      const gh = Math.max(2, Math.round((img.naturalHeight / img.naturalWidth) * gw));
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      try {
        octx.drawImage(img, 0, 0, gw, gh);
      } catch {
        return; // decode race — the load listener will call us again
      }
      const data = octx.getImageData(0, 0, gw, gh).data;
      const portraitPlate = img.naturalHeight > img.naturalWidth * 1.1;
      const seedU = portraitPlate ? 0.5 : 0.72;
      cLine.fill(seedU);
      /* treeness = deviation from the SKY, measured from the plate itself
         (top-left patch). Works on the pale dawn sky AND the night plate
         when it lands — whatever the sky is, the tree isn't it. */
      let skySum = 0;
      let skyN = 0;
      for (let gy = 0; gy < Math.max(2, Math.floor(gh * 0.07)); gy++) {
        for (let gx = 0; gx < Math.floor(gw * 0.3); gx++) {
          const i = (gy * gw + gx) * 4;
          skySum += (data[i] + data[i + 1] + data[i + 2]) / 3;
          skyN++;
        }
      }
      const skyL = skyN > 0 ? skySum / skyN : 235;
      const score = (gx: number, gy: number) => {
        const i = (gy * gw + gx) * 4;
        const l = (data[i] + data[i + 1] + data[i + 2]) / 3;
        return Math.max(0, Math.abs(skyL - l) - 16);
      };

      /* first row with real mass = the canopy top */
      let firstRow = -1;
      const rowMass: number[] = [];
      const seedHalf = portraitPlate ? 0.38 : 0.34;
      const seedLo = Math.max(0, Math.floor((seedU - seedHalf) * gw));
      const seedHi = Math.min(gw, Math.ceil((seedU + seedHalf) * gw));
      for (let gy = 0; gy < gh; gy++) {
        let m = 0;
        for (let gx = seedLo; gx < seedHi; gx++) if (score(gx, gy) > 46) m++;
        rowMass.push(m);
        if (firstRow < 0 && m > (seedHi - seedLo) * 0.055) firstRow = gy;
      }
      if (firstRow < 0) return;
      treeTopV = firstRow / gh;

      /* tracking centroid: full-width seed at the canopy, then a window
         around the previous row's centre — the left valley/cliffs never
         capture the line because they sit outside the window */
      let prevC: number | null = seedU;
      let prevW = portraitPlate ? 0.075 : 0.085;
      for (let r = 0; r < ROWS; r++) {
        const v = r / (ROWS - 1);
        const gy = Math.min(gh - 1, Math.round(v * (gh - 1)));
        const win = r === 0 ? seedHalf : 0.11; // fraction of width
        const lo = Math.max(0, Math.floor(((prevC ?? seedU) - win) * gw));
        const hi = Math.min(gw, Math.ceil(((prevC ?? seedU) + win) * gw));
        let sum = 0;
        let sx = 0;
        let sxx = 0;
        for (let gx = lo; gx < hi; gx++) {
          const s = score(gx, gy);
          if (s > 46) {
            sum += s;
            sx += s * gx;
            sxx += s * gx * gx;
          }
        }
        if (sum > 0 && gy >= firstRow) {
          const mean = sx / sum;
          const std = Math.sqrt(Math.max(0, sxx / sum - mean * mean));
          prevC = mean / gw;
          prevW = clamp((std * 1.35) / gw, 0.018, 0.14);
        }
        cLine[r] = prevC ?? 0.68;
        wLine[r] = prevW;
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let r = 1; r < ROWS - 1; r++) {
          cLine[r] = (cLine[r - 1] + cLine[r] * 2 + cLine[r + 1]) / 4;
          wLine[r] = (wLine[r - 1] + wLine[r] * 2 + wLine[r + 1]) / 4;
        }
      }

      /* trunk axis = centroid of the mid band; roots edge = where mass
         stops thinning back out near the bottom */
      let tw = 0;
      let tx = 0;
      for (let r = Math.floor(ROWS * 0.4); r < Math.floor(ROWS * 0.8); r++) {
        tw += 1;
        tx += cLine[r];
      }
      trunkU = clamp(tw > 0 ? tx / tw : seedU, seedU - 0.035, seedU + 0.035);
      rootsV = clamp(treeTopV + 0.82, 0.8, 0.94);

      /* canopy spark sites: strong cells in the crown band, near the line */
      canopySites.length = 0;
      const cTop = firstRow;
      const cBot = Math.min(gh - 1, Math.floor(firstRow + gh * 0.24));
      for (let gy = cTop; gy <= cBot; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const u = gx / gw;
          if (
            score(gx, gy) > 70 &&
            Math.abs(u - pathCenterAt(gy / gh)) < pathHalfAt(gy / gh) * 0.95 &&
            canopySites.length < 360
          ) {
            canopySites.push({ u, v: gy / gh });
          }
        }
      }
      if (canopySites.length === 0) {
        canopySites.push({ u: trunkU, v: treeTopV + 0.05 });
      }
      anatReady = true;
    };

    /* ---- geometry: image (u,v) -> canvas px (object-fit cover + position).
       The canvas shares the transformed mover, so the zoom needs no math. */
    let W = 0;
    let H = 0;
    let offX = 0;
    let offY = 0;
    let drawScale = 1;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const iw = img.naturalWidth || 1;
      const ih = img.naturalHeight || 1;
      const pos = window.getComputedStyle(img).objectPosition.split(" ");
      const px = (Number.parseFloat(pos[0]) || 50) / 100;
      const py = (Number.parseFloat(pos[1]) || 50) / 100;
      drawScale = Math.max(W / iw, H / ih);
      offX = (W - iw * drawScale) * px;
      offY = (H - ih * drawScale) * py;
    };
    const tX = (u: number) => u * (img.naturalWidth || 1) * drawScale + offX;
    const tY = (v: number) => v * (img.naturalHeight || 1) * drawScale + offY;

    /* ---- cursor (canvas space, through the ancestor transforms) ---- */
    const cursor = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width === 0) return;
      cursor.x = ((e.clientX - r.left) / r.width) * W;
      cursor.y = ((e.clientY - r.top) / r.height) * H;
    };

    /* ---- orbs ---- */
    const orbCount = () => (window.innerWidth <= 760 ? 30 : 56);
    const orbs: Orb[] = [];

    const spawn = (o?: Orb): Orb => {
      const site = canopySites.length
        ? canopySites[(Math.random() * canopySites.length) | 0]
        : { u: trunkU, v: treeTopV + 0.05 };
      const size = 0.8 + Math.random() * 1.5;
      const orb: Orb =
        o ??
        ({
          u: 0, v: 0, drift: 0, size, speed: 0, alpha: 0, tail: [],
          dying: false, theta: 0, strand: 0, anchorV: null, flow: 0, mix: 1,
        } as Orb);
      orb.u = site.u + (Math.random() - 0.5) * 0.012;
      orb.v = site.v;
      orb.drift = (Math.random() - 0.5) * 1.7;
      orb.size = size;
      orb.speed = (0.045 - size * 0.011) * (0.85 + Math.random() * 0.3);
      orb.alpha = 0;
      orb.tail = [];
      orb.dying = false;
      orb.theta = Math.random() * Math.PI * 2;
      orb.strand = Math.random() < 0.5 ? 0 : 1;
      orb.anchorV = null;
      orb.flow = 0;
      orb.mix = Math.random() < 0.2 ? 0.1 + Math.random() * 0.15 : 1;
      return orb;
    };

    let helixT = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* self-heal zero-size mounts (prerender/background tab) */
      if (W === 0 && host.clientWidth > 0) fit();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!anatReady || W === 0) return;

      const c = clamp01(progressRef.current ?? 0);
      if (c > 0.99) {
        // the plate has dissolved into the page — draw nothing
        ctx.clearRect(0, 0, W, H);
        return;
      }
      /* the transformation: forms through the first half of the descent,
         then holds while the plate zooms toward the roots */
      const d = smooth01((c - 0.1) / 0.32);
      helixT += dt;

      const want = Math.round(orbCount() * (1 + d * 0.35));
      while (orbs.length < want) {
        const o = spawn();
        o.v += Math.random() * Math.min(0.34, Math.max(0, rootsV - o.v - 0.04));
        /* Initial fill used to move only V, leaving each orb's canopy X
           floating through open sky until it eased back to the trunk. */
        o.u = pathCenterAt(o.v) + o.drift * pathHalfAt(o.v) * 0.55;
        orbs.push(o);
      }
      if (orbs.length > want + 10) orbs.length = want + 10;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      for (const o of orbs) {
        if (o.dying) {
          o.alpha -= dt * 1.6;
          if (o.alpha <= 0) {
            spawn(o);
            continue;
          }
        } else {
          o.alpha = Math.min(1, o.alpha + dt * 1.2);
        }

        /* ambient anatomy flow: descend, easing into the lane the tree
           actually paints at this height */
        const laneHalf = pathHalfAt(o.v);
        const laneU = pathCenterAt(o.v) + o.drift * laneHalf * 0.55;
        const sway = Math.sin(now / 900 + o.theta * 3) * laneHalf * 0.05;
        o.u += (laneU + sway - o.u) * Math.min(1, dt * 3.2);
        const boostD = Math.hypot(tX(o.u) - cursor.x, tY(o.v) - cursor.y);
        const boost =
          boostD < CURSOR_R ? CURSOR_BOOST - (boostD / CURSOR_R) * (CURSOR_BOOST - 1) : 1;
        o.v += o.speed * boost * dt;
        if (o.v > rootsV && d * o.mix < 0.4) o.dying = true;

        /* Helix detach: both strands now travel canopy -> trunk -> roots,
           following the measured tree centreline instead of orbiting one
           fixed page axis. */
        let iu = o.u;
        let iv = o.v;
        let depthMod = 1;
        const di = d * o.mix;
        if (di > 0.01) {
          if (o.anchorV === null) o.anchorV = clamp(o.v, treeTopV + 0.01, rootsV - 0.04);
          o.flow += dt * 0.035 * di;
          let hv = o.anchorV + o.flow;
          if (hv > rootsV) {
            o.flow = 0;
            o.anchorV = clamp(treeTopV + 0.015 + Math.random() * 0.07, 0, 0.96);
            hv = o.anchorV;
          }
          const phase =
            helixT * 1.05 +
            hv * Math.PI * 4.6 +
            (o.strand ? Math.PI : 0) +
            (o.theta % 0.6) * 0.6;
          const R = clamp(pathHalfAt(hv) * (0.28 + 0.12 * d), 0.006, 0.026);
          const hu = pathCenterAt(hv) + Math.cos(phase) * R;
          depthMod = 0.62 + 0.38 * Math.sin(phase + Math.PI / 2);
          iu = lerp(o.u, hu, di);
          iv = lerp(o.v, hv, di);
        } else if (o.anchorV !== null) {
          o.anchorV = null;
          o.flow = 0;
        }

        /* Last-resort corridor clamp: sampling can be imperfect on painterly
           edges, but no rendered orb is allowed outside the tree path. */
        const renderHalf = pathHalfAt(iv);
        iu = clamp(iu, pathCenterAt(iv) - renderHalf, pathCenterAt(iv) + renderHalf);

        const cx = tX(iu);
        const cy = tY(iv);
        o.tail.unshift({ x: cx, y: cy });
        if (o.tail.length > TAIL) o.tail.pop();

        const r =
          o.size * lerp(1, depthMod, d) * (1 + d * 0.28) *
          (window.innerWidth <= 760 ? 0.85 : 1);
        const tailN = Math.min(
          o.tail.length,
          Math.max(2, Math.round(o.tail.length * (1 - d * 0.55))),
        );

        /* the luminous night set — white-hot hearts, green glow */
        for (let i = tailN - 1; i >= 1; i--) {
          const t = i / tailN;
          const tp = o.tail[i];
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, r * (1 - t * 0.72), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 102, ${(o.alpha * 0.2 * (1 - t)).toFixed(3)})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(51, 255, 51, ${(o.alpha * (0.14 + d * 0.16)).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 255, 242, ${(o.alpha * 0.94 * lerp(1, depthMod, d * 0.5)).toFixed(3)})`;
        ctx.shadowColor = "rgba(0, 255, 102, 0.9)";
        ctx.shadowBlur = 8 + d * 7;
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

    /* (re)sample on every source swap (responsive/theme), but only once the
       new frame is actually decodable — and keep the previous anatomy live
       until the new one lands, so a decode race can never park the engine */
    const onImg = () => {
      const attempt = () => {
        if (disposed) return;
        sampleAnatomy();
        fit();
      };
      if (typeof img.decode === "function") {
        img.decode().then(attempt).catch(() => window.setTimeout(attempt, 160));
      } else {
        attempt();
      }
    };
    if (img.complete && img.naturalWidth > 0) onImg();
    img.addEventListener("load", onImg);

    const onVis = () => (document.hidden ? stop() : start());
    const ro = new ResizeObserver(() => {
      fit();
    });
    ro.observe(host);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    start();

    return () => {
      disposed = true;
      stop();
      ro.disconnect();
      img.removeEventListener("load", onImg);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, [imgRef, progressRef, active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="hero-tree-stage__sap"
      aria-hidden
    />
  );
}

export default HeroSapHelix;
