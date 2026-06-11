"use client";

/* ============================================================================
   WorldTreeCanvas — the ONE drawing surface behind the whole home page.

   Corn-Revolution lesson applied: one camera mapping draws BOTH the tree
   plate and every particle, so image and orbs can never drift apart (the
   old "double vision" was tails cached in canvas space while the camera
   panned).

   The descent narrative, driven by phase values (all 0..1) computed by
   DescentFlow from the smoothed scroll — the SAME tree carries the whole
   story, start to finish:

     veins     orbs ride the painted green veins down the tree
     helix     they detach into a double helix OVER the visible tree
     collapse  the helix slowly winds down into ONE settlement orb
     descend   that orb rides the trunk veins down; the camera follows
     rest      it seats into this tree's own roots; at the bottom a soft
               blue detonation rings out — settled on L1

   Rendering rules learned the hard way (review 2026-06-10):
     · NO ctx.shadowBlur in the per-frame path — glows are pre-rendered
       radial-gradient sprites stamped with drawImage (≈20× cheaper)
     · tails live in IMAGE space and are projected at draw time
     · DPR capped at 1.5 (the Corn site ships 1.0 on retina; 1.5 keeps our
       type-adjacent glows crisp at half the pixel cost of 2.0)
   ========================================================================== */

import { useEffect, useRef } from "react";

export type DescentPhases = {
  helix: number; //    tree → helix, OVER the always-visible tree
  collapse: number; // the helix slowly winds down into ONE settlement orb
  descend: number; //  that orb's slow ride down the trunk
  rest: number; //     settle in the blue
  bottom: number; //   raw progress through the final band — fires the burst
  black: number; //    a gentle dim under the helix (never full black)
  camX: number; //     plate pos-x 0..1 (0.88 hero → 1.0 turned-in)
  camY: number; //     plate pos-y 0..1 (0.38 canopy → ~0.8 bedrock)
  zoom: number; //     plate zoom 1..~1.14
};

export const PHASES_REST: DescentPhases = {
  helix: 0,
  collapse: 0,
  descend: 0,
  rest: 0,
  bottom: 0,
  black: 0,
  camX: 0.88,
  camY: 0.38,
  zoom: 1,
};

const TREE_SRC = "/v2/hero-wide.avif";

const GRID_W = 384;
const SPAWN_BAND: [number, number] = [0.02, 0.58];
const GREEN_MIN = 34;
const TAIL = 9;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth01 = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Orb = {
  x: number;
  y: number;
  a: number; // heading (radians from straight-down)
  size: number;
  speed: number;
  alpha: number;
  tail: { x: number; y: number }[]; // IMAGE space
  dying: boolean;
  theta: number;
  strand: 0 | 1;
  anchorY: number | null;
  rise: number;
  rJit: number; // per-orb helix radius jitter
  mix: number; // how fully it joins the helix
};

type Burst = {
  fired: boolean;
  t: number; // seconds since fire
  parts: { a: number; v: number; r: number }[];
};

/** Pre-rendered additive glow sprite: white-hot core into a colored halo. */
function makeSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const x = c.getContext("2d")!;
  const grad = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.18, `rgba(${r},${g},${b},0.85)`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.28)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grad;
  x.fillRect(0, 0, S, S);
  return c;
}

export default function WorldTreeCanvas({
  phasesRef,
  tickRef,
}: {
  phasesRef: React.RefObject<DescentPhases>;
  /** DescentFlow owns the rAF; it calls tickRef.current(dt) every frame. */
  tickRef: React.RefObject<((dt: number) => void) | null>;
}) {
  /* TWO stacked canvases (perf pass 2026-06-11): the PLATE layer redraws
     only when the camera/fades actually move (during a dwell it costs
     nothing), and at DPR 1 — the Corn site ships its whole frame at 1.0;
     a cover-scaled photo can't tell. The PARTICLE layer redraws every
     frame at up to 1.5 so the glows stay crisp. */
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bg = bgRef.current;
    const fg = fgRef.current;
    if (!bg || !fg) return;
    const bctx = bg.getContext("2d");
    const ctx = fg.getContext("2d");
    if (!bctx || !ctx) return;

    let disposed = false;

    /* ---- sprites (no shadowBlur, ever) ---- */
    const spGreen = makeSprite(0, 255, 102);
    const spBlue = makeSprite(64, 156, 255);
    const spCyan = makeSprite(60, 230, 200);
    const spGold = makeSprite(255, 210, 110);

    /* ---- images + vein field ---- */
    const tree = new Image();
    let treeReady = false;
    /* GPU-friendly pre-decoded bitmap for the per-frame blits */
    let treeBmp: ImageBitmap | null = null;
    let lastSig = -1;
    let field: Uint8Array | null = null;
    let gw = 0;
    let gh = 0;
    let imgW = 0;
    let imgH = 0;
    let trunkX = 0;
    const spawnSites: { x: number; y: number }[] = [];
    /** the settlement orb's road: a smoothed polyline down the trunk veins */
    const path: { x: number; y: number }[] = [];

    const green = (ix: number, iy: number): number => {
      if (!field) return 0;
      const gx = Math.round((ix / imgW) * gw);
      const gy = Math.round((iy / imgH) * gh);
      if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) return 0;
      return field[gy * gw + gx];
    };

    tree.onload = () => {
      if (disposed) return;
      imgW = tree.naturalWidth;
      imgH = tree.naturalHeight;
      gw = GRID_W;
      gh = Math.round((imgH / imgW) * gw);
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(tree, 0, 0, gw, gh);
      const data = octx.getImageData(0, 0, gw, gh).data;
      field = new Uint8Array(gw * gh);
      for (let i = 0; i < gw * gh; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const score = Math.max(0, Math.min(255, g - Math.max(r, b) + (g > 120 ? 40 : 0)));
        field[i] = score;
      }
      const y0 = Math.floor(SPAWN_BAND[0] * gh);
      const y1 = Math.floor(SPAWN_BAND[1] * gh);
      for (let gy = y0; gy < y1; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          if (field[gy * gw + gx] > GREEN_MIN + 18) {
            spawnSites.push({ x: (gx / gw) * imgW, y: (gy / gh) * imgH });
          }
        }
      }
      /* trunk centroid (mid band) — the helix axis */
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
      createImageBitmap(tree).then((b) => {
        if (!disposed) treeBmp = b;
      }).catch(() => {});

      /* ---- settlement path: greedy turn-limited walk down the trunk ---- */
      {
        let px = trunkX;
        let py = imgH * 0.27;
        /* snap the start onto the strongest vein near the trunk crown */
        let best = -1;
        for (let dx = -0.06; dx <= 0.06; dx += 0.005) {
          const v = green(trunkX + dx * imgW, py);
          if (v > best) {
            best = v;
            px = trunkX + dx * imgW;
          }
        }
        let heading = 0; // straight down
        const step = imgH * 0.012;
        path.push({ x: px, y: py });
        while (py < imgH * 0.875) {
          let bestA = heading;
          let bestV = -1;
          for (const a of [-0.7, -0.35, 0, 0.35, 0.7]) {
            const cand = heading * 0.4 + a;
            const v =
              green(px + Math.sin(cand) * step * 2, py + Math.cos(cand) * step * 2) +
              (Math.abs(cand) < 0.2 ? 8 : 0);
            if (v > bestV) {
              bestV = v;
              bestA = cand;
            }
          }
          heading = lerp(heading, Math.max(-0.9, Math.min(0.9, bestA)), 0.45);
          px += Math.sin(heading) * step;
          py += Math.cos(heading) * step;
          path.push({ x: px, y: py });
        }
        /* two smoothing passes so the ride is silk */
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < path.length - 1; i++) {
            path[i].x = (path[i - 1].x + path[i].x * 2 + path[i + 1].x) / 4;
            path[i].y = (path[i - 1].y + path[i].y * 2 + path[i + 1].y) / 4;
          }
        }
      }
      treeReady = true;
    };
    tree.src = TREE_SRC;

    /* ---- viewport ---- */
    let W = 0;
    let H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const BG_DPR = 1;
    let bgDirty = true;
    const fit = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      fg.width = Math.round(W * DPR);
      fg.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bg.width = Math.round(W * BG_DPR);
      bg.height = Math.round(H * BG_DPR);
      bctx.setTransform(BG_DPR, 0, 0, BG_DPR, 0, 0);
      bgDirty = true;
    };
    fit();
    window.addEventListener("resize", fit);

    /* ---- orbs ---- */
    const mobile = () => window.innerWidth <= 760;
    const orbBase = () => (mobile() ? 52 : 100);
    const orbs: Orb[] = [];

    const spawn = (o?: Orb): Orb | null => {
      if (spawnSites.length === 0) return null;
      const site = spawnSites[(Math.random() * spawnSites.length) | 0];
      const size = 0.7 + Math.random() * 1.5;
      const orb: Orb =
        o ??
        ({
          x: 0, y: 0, a: 0, size, speed: 0, alpha: 0, tail: [], dying: false,
          theta: 0, strand: 0, anchorY: null, rise: 0, rJit: 1, mix: 1,
        } as Orb);
      orb.x = site.x + (Math.random() - 0.5) * 6;
      orb.y = site.y;
      orb.a = 0;
      orb.size = size;
      orb.speed = (44 - size * 11) * (0.9 + Math.random() * 0.34);
      orb.alpha = 0;
      orb.tail = [];
      orb.dying = false;
      orb.theta = Math.random() * Math.PI * 2;
      orb.strand = Math.random() < 0.5 ? 0 : 1;
      orb.anchorY = null;
      orb.rise = 0;
      /* tight: visible per-bead life WITHOUT smearing the strand line */
      orb.rJit = 0.94 + Math.random() * 0.12;
      orb.mix = Math.random() < 0.2 ? 0.1 + Math.random() * 0.15 : 1;
      return orb;
    };

    let surge = 0;
    let nextSurge = 5 + Math.random() * 6;
    let helixT = 0;
    const burst: Burst = { fired: false, t: 0, parts: [] };
    let bigPulse = 0;

    /* ---- the one tick, called by DescentFlow's rAF ---- */
    const tick = (dt: number) => {
      if (disposed || !treeReady || W === 0 || !field) return;
      const ph = phasesRef.current ?? PHASES_REST;

      /* the helix unwinds as it collapses into the settlement orb */
      const col = ph.collapse;
      const hx = ph.helix * (1 - col);
      const des = ph.descend;
      const rest = ph.rest;

      /* ---- shared cover mapping for THIS frame ---- */
      const scale = Math.max(W / imgW, H / imgH) * ph.zoom;
      const offX = (W - imgW * scale) * ph.camX;
      const offY = (H - imgH * scale) * ph.camY;
      const px = (ix: number) => ix * scale + offX;
      const py = (iy: number) => iy * scale + offY;

      /* ---- plates (background canvas, only when the camera moved) ---- */
      const sig =
        Math.round(offX * 4) * 31 +
        Math.round(offY * 4) * 7 +
        Math.round(scale * imgW * 4) +
        Math.round(ph.black * 250) * 131;
      if (bgDirty || sig !== lastSig) {
        lastSig = sig;
        bgDirty = false;
        bctx.clearRect(0, 0, W, H);
        bctx.globalAlpha = 1 - ph.black * 0.55;
        bctx.drawImage(treeBmp ?? tree, offX, offY, imgW * scale, imgH * scale);
        bctx.globalAlpha = 1;
        /* the thesis dwell sinks everything toward black so the helix owns
           the frame; regroup lifts it back out */
        if (ph.black > 0.004) {
          bctx.fillStyle = `rgba(4, 7, 5, ${(ph.black * 0.92).toFixed(3)})`;
          bctx.fillRect(0, 0, W, H);
        }
      }

      /* ---- particles (foreground canvas, every frame) ---- */
      ctx.clearRect(0, 0, W, H);

      /* ---- population: the swarm thins as it pours into the orb ---- */
      const calm = Math.max(smooth01((des - 0.04) / 0.5), col * 0.75);
      const want = Math.round(orbBase() * (1 + hx * 1.05) * (1 - calm * 0.62) * (1 - rest * 0.5));
      while (orbs.length < want) {
        const o = spawn();
        if (!o) break;
        o.y += Math.random() * imgH * 0.7;
        orbs.push(o);
      }
      if (orbs.length > want + 10) orbs.length = want + 10;

      nextSurge -= dt;
      if (nextSurge <= 0) {
        surge = 1;
        nextSurge = 6 + Math.random() * 7;
      }
      surge = Math.max(0, surge - dt * 0.55);
      helixT += dt;

      /* ---- the settlement orb ----
         It is BORN of the collapse: as the helix winds down, the orb takes
         its light; the descend then carries it down the trunk on a long,
         nearly-linear ride (review: it shot down too fast — no smoothstep
         mid-rush, and the flow gives the ride four sections of runway). */
      const ignite = Math.max(smooth01((col - 0.25) / 0.6), smooth01(des / 0.07));
      const travel = clamp01((des - 0.03) / 0.94);
      const bigT = Math.min(path.length - 1.001, travel * (path.length - 1));
      const bi = Math.floor(bigT);
      const bf = bigT - bi;
      const bigIx = path.length ? lerp(path[bi].x, path[bi + 1]?.x ?? path[bi].x, bf) : trunkX;
      const bigIy = path.length ? lerp(path[bi].y, path[bi + 1]?.y ?? path[bi].y, bf) : imgH * 0.3;
      bigPulse += dt * (2.2 - travel * 1.2);

      ctx.globalCompositeOperation = "lighter";

      /* ---- small orbs ---- */
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

        /* vein walk with turn-rate-limited steering (glide, don't twitch) */
        const step = imgW * 0.006;
        let bestA = 0;
        let bestV = -1;
        for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
          const v =
            green(o.x + Math.sin(a) * step, o.y + Math.cos(a) * step) +
            (a === 0 ? 6 : 0) +
            Math.random() * 4;
          if (v > bestV) {
            bestV = v;
            bestA = a;
          }
        }
        o.a = lerp(o.a, bestA, Math.min(1, dt * 6));
        if (bestV < GREEN_MIN && hx * o.mix < 0.4) o.dying = true;

        const sp = o.speed * (1 + surge * 0.9) * (1 - calm * 0.45);
        o.x += Math.sin(o.a) * sp * dt;
        o.y = Math.min(o.y + Math.cos(o.a) * sp * dt, imgH * 1.02);
        if (o.y > imgH * 0.985 && hx * o.mix < 0.4) o.dying = true;

        /* helix blend */
        let ix = o.x;
        let iy = o.y;
        let depthMod = 1;
        const di = hx * o.mix;
        if (di > 0.01) {
          if (o.anchorY === null) o.anchorY = o.y;
          o.rise += dt * (11 + o.size * 5) * di;
          let hy = o.anchorY - o.rise;
          if (hy < imgH * 0.04) {
            o.rise = 0;
            o.anchorY = imgH * (0.72 + Math.random() * 0.2);
            hy = o.anchorY;
          }
          const phase =
            helixT * 1.05 +
            (hy / imgH) * Math.PI * 4.6 +
            (o.strand ? Math.PI : 0) +
            (o.theta % 0.3) * 0.6;
          /* organic radius: global swell + per-orb jitter + a slow breath */
          const R =
            imgW *
            (0.012 + 0.105 * hx) *
            o.rJit *
            (1 + 0.03 * Math.sin(helixT * 0.6 + o.theta));
          const hxp = trunkX + Math.cos(phase) * R;
          depthMod = 0.62 + 0.38 * Math.sin(phase + Math.PI / 2);
          ix = lerp(o.x, hxp, di);
          iy = lerp(o.y, hy, di);
        } else if (o.anchorY !== null) {
          o.anchorY = null;
          o.rise = 0;
        }

        /* the pour: as the helix collapses, every light spirals into the
           orb — the collapse widens the pull until it takes the whole swarm */
        if ((col > 0.02 || ignite > 0) && travel < 0.22) {
          const dxp = bigIx - ix;
          const dyp = bigIy - iy;
          const dd = Math.hypot(dxp, dyp);
          const reach = imgW * (0.2 + col * 0.5);
          const pull = Math.max(ignite, col) * smooth01(1 - dd / reach);
          if (pull > 0.01) {
            ix += dxp * pull * dt * (2.2 + col * 1.6);
            iy += dyp * pull * dt * (2.2 + col * 1.6);
            if (dd < imgW * 0.012) {
              o.dying = true;
              bigPulse += 0.05;
            }
          }
        }

        o.tail.unshift({ x: ix, y: iy });
        if (o.tail.length > TAIL) o.tail.pop();

        const cx = px(ix);
        const cy = py(iy);
        if (cx < -40 || cx > W + 40 || cy < -40 || cy > H + 40) continue;

        const fade = o.alpha * (1 - rest * 0.55);
        const r = o.size * (1 + surge * 0.25) * lerp(1, depthMod, hx) * (1 + hx * 0.75);

        /* tail: every other image-space sample, projected now */
        const tailN = Math.min(o.tail.length, Math.max(2, Math.round(TAIL * (1 - hx * 0.55))));
        for (let i = tailN - 1; i >= 1; i -= 2) {
          const t = i / tailN;
          const tp = o.tail[i];
          const tr = r * (1 - t * 0.7) * 2.4;
          ctx.globalAlpha = fade * 0.34 * (1 - t);
          ctx.drawImage(spGreen, px(tp.x) - tr, py(tp.y) - tr, tr * 2, tr * 2);
        }
        /* halo + core, one sprite each */
        const hr = r * (3.4 + hx * 1.6);
        ctx.globalAlpha = fade * (0.5 + hx * 0.34) * lerp(1, depthMod, hx * 0.6);
        ctx.drawImage(spGreen, cx - hr, cy - hr, hr * 2, hr * 2);
        const cr = r * 1.5;
        ctx.globalAlpha = fade * 0.95;
        ctx.drawImage(spGreen, cx - cr, cy - cr, cr * 2, cr * 2);
      }

      /* ---- the settlement orb itself ---- */
      if (ignite > 0.001) {
        /* it rests where the vein path ends — in THIS tree's roots */
        const bx = px(bigIx);
        const by = py(bigIy);
        /* hue ride: green → cyan → blue as it sinks toward bedrock */
        const hue = smooth01((travel - 0.45) / 0.5);
        const breathe = 1 + 0.06 * Math.sin(bigPulse * 3.1) + surge * 0.1;
        const R0 = (mobile() ? 16 : 22) * (0.55 + ignite * 0.45) * breathe;
        const settle = smooth01(rest / 0.55);
        const R = R0 * (1 + settle * 0.35);

        /* wake while travelling */
        if (travel > 0.01 && travel < 0.99) {
          for (let i = 1; i <= 4; i++) {
            const back = Math.max(0, bigT - i * 6);
            const wp = path[Math.floor(back)];
            if (!wp) break;
            const wr = R * (1 - i * 0.18) * 0.8;
            ctx.globalAlpha = 0.16 * (1 - i / 5) * ignite;
            ctx.drawImage(hue < 0.5 ? spGreen : spCyan, px(wp.x) - wr, py(wp.y) - wr, wr * 2, wr * 2);
          }
        }

        const sprite = hue < 0.35 ? spGreen : hue < 0.75 ? spCyan : spBlue;
        ctx.globalAlpha = ignite * (0.85 + 0.15 * Math.sin(bigPulse * 2));
        ctx.drawImage(sprite, bx - R * 2.6, by - R * 2.6, R * 5.2, R * 5.2);
        ctx.globalAlpha = ignite;
        ctx.drawImage(sprite, bx - R, by - R, R * 2, R * 2);
        /* a golden L1 ember inside once it settles — the ledger holds it */
        if (settle > 0.2) {
          const gr = R * 0.5 * settle;
          ctx.globalAlpha = settle * 0.8;
          ctx.drawImage(spGold, bx - gr, by - gr, gr * 2, gr * 2);
        }

        /* ---- terminal burst: one soft blue detonation at the bottom ---- */
        if (ph.bottom > 0.82 && !burst.fired) {
          burst.fired = true;
          burst.t = 0;
          burst.parts = Array.from({ length: 42 }, () => ({
            a: Math.random() * Math.PI * 2,
            v: 60 + Math.random() * 230,
            r: 1.2 + Math.random() * 2.6,
          }));
        }
        if (ph.bottom < 0.5) burst.fired = false; // re-arm on scroll-up

        if (burst.fired && burst.t < 1.6) {
          burst.t += dt;
          const bt = burst.t;
          const ease = 1 - Math.pow(1 - Math.min(1, bt / 1.5), 3);
          const reach = Math.min(W, H) * 0.36;
          /* an expanding sphere of light under the rings */
          const gr = Math.max(1, ease * reach * 0.85);
          ctx.globalAlpha = Math.max(0, 0.5 * (1 - ease));
          ctx.drawImage(spBlue, bx - gr, by - gr, gr * 2, gr * 2);
          /* two expanding rings */
          for (const [d0, w] of [
            [1, 3],
            [0.62, 1.6],
          ] as const) {
            ctx.globalAlpha = Math.max(0, 0.8 * (1 - ease)) * d0;
            ctx.strokeStyle = "rgba(120, 185, 255, 1)";
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.arc(bx, by, ease * reach * d0, 0, Math.PI * 2);
            ctx.stroke();
          }
          /* radial sparks */
          for (const s of burst.parts) {
            const d = s.v * ease * (Math.min(W, H) / 700);
            const sx = bx + Math.cos(s.a) * d;
            const sy = by + Math.sin(s.a) * d * 0.82;
            const sr = s.r * (1 - ease * 0.55) * 4;
            ctx.globalAlpha = Math.max(0, 0.9 * (1 - ease));
            ctx.drawImage(spBlue, sx - sr, sy - sr, sr * 2, sr * 2);
          }
          /* one quiet whole-frame breath of blue */
          ctx.globalAlpha = Math.max(0, 0.16 * (1 - ease));
          ctx.fillStyle = "rgba(70, 140, 255, 1)";
          ctx.fillRect(0, 0, W, H);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    tickRef.current = tick;

    return () => {
      disposed = true;
      tickRef.current = null;
      treeBmp?.close();
      window.removeEventListener("resize", fit);
    };
  }, [phasesRef, tickRef]);

  return (
    <>
      <canvas ref={bgRef} className="v2-stage__canvas" aria-hidden />
      <canvas ref={fgRef} className="v2-stage__canvas" aria-hidden />
    </>
  );
}
