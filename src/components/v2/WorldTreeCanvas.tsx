"use client";

/* ============================================================================
   WorldTreeCanvas — the ONE drawing surface behind the whole home page.

   Corn-Revolution lesson applied: one camera mapping draws BOTH the tree
   plate and every particle, so image and orbs can never drift apart.

   The descent narrative, driven by phase values (all 0..1) computed by
   DescentFlow from the smoothed scroll — the SAME tree carries the whole
   story, start to finish:

     veins     orbs ride the painted veins down the tree
     helix     they detach into a double helix OVER the visible tree
     collapse  the helix slowly winds down into ONE settlement orb
     descend   that orb rides the trunk veins down into the blue cave
     rest      it seats into this tree's own bedrock; a soft blue
               detonation rings out — settled on L1

   Plate strategy (rebuild 2026-06-13): the home uses the WIDE cinematic
   plate on landscape (tree right-of-frame, copy on the left, the whole
   tree from canopy to the glowing cave held in view) and the TALL plate
   on portrait phones (the camera pans canopy -> roots as you scroll, so
   a phone still travels the full tree). One image-space orb engine drives
   both. The helix radius is a fraction of imgW*scale (which is viewport-
   relative), so it renders identically on a laptop and a 4K monitor — no
   zoom needed when you switch displays.

   Rendering rules learned the hard way:
     · NO ctx.shadowBlur in the per-frame path — glows are pre-rendered
       radial-gradient sprites stamped with drawImage (≈20× cheaper)
     · tails live in IMAGE space and are projected at draw time
   ========================================================================== */

import { useEffect, useRef } from "react";

export type DescentPhases = {
  helix: number; //    tree → helix, OVER the always-visible tree
  collapse: number; // the helix slowly winds down into ONE settlement orb
  descend: number; //  that orb's slow ride down the trunk
  rest: number; //     settle in the blue
  bottom: number; //   raw progress through the final band — fires the burst
  black: number; //    a gentle dim under the helix (never full black)
  camX: number; //     legacy pan knob (kept for compatibility; offX is
  //                   trunk-anchored now so the framing is plate-agnostic)
  camY: number; //     plate pos-y 0..1 (0.38 canopy → ~0.8 bedrock) — only
  //                   bites on the tall plate, which has vertical slack
  zoom: number; //     plate zoom 1..~1.1
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

/* defaults — parent overrides per theme */
const WIDE_SRC = "/plates/worldtree-night-wide.avif";
const TALL_SRC = "/plates/worldtree-night-tall.avif";

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
  wideSrc = WIDE_SRC,
  tallSrc = TALL_SRC,
}: {
  phasesRef: React.RefObject<DescentPhases>;
  /** DescentFlow owns the rAF; it calls tickRef.current(dt) every frame. */
  tickRef: React.RefObject<((dt: number) => void) | null>;
  /** landscape plate (theme picks night/day) */
  wideSrc?: string;
  /** portrait plate for phones (theme picks night/day) */
  tallSrc?: string;
}) {
  /* TWO stacked canvases: the PLATE layer redraws only when the camera/
     fades actually move (during a dwell it costs nothing); the PARTICLE
     layer redraws every frame so the glows stay crisp. */
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

    /* ---- the live plate + its derived vein field ---- */
    let tree = new Image();
    let treeReady = false;
    let treeBmp: ImageBitmap | null = null;
    let activeSrc = "";
    let lastSig = -1;
    let field: Uint8Array | null = null;
    let gw = 0;
    let gh = 0;
    let imgW = 0;
    let imgH = 0;
    let trunkX = 0;
    let vaultX = 0;
    let vaultY = 0;
    /* adaptive "is this still a vein" floor, set per plate from its peak
       green so orbs don't die the instant they spawn on a dark plate */
    let liveThresh = GREEN_MIN;
    const spawnSites: { x: number; y: number }[] = [];
    /** the settlement orb's road: a smoothed polyline down the trunk veins */
    let path: { x: number; y: number }[] = [];

    const green = (ix: number, iy: number): number => {
      if (!field) return 0;
      const gx = Math.round((ix / imgW) * gw);
      const gy = Math.round((iy / imgH) * gh);
      if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) return 0;
      return field[gy * gw + gx];
    };

    /* (re)build all image-derived data for a freshly-loaded plate */
    const ingest = (img: HTMLImageElement) => {
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
        const score = Math.max(0, Math.min(255, g - Math.max(r, b) + (g > 120 ? 40 : 0)));
        field[i] = score;
      }

      /* ---- trunk corridor: the plates' bark veins are faint, so measure
         the row-wise green centroid + spread and bake that corridor into
         the field — gated by row green mass so open sky above the crown
         and bare bedrock get NO synthetic corridor (orbs in thin air). The
         helix axis (trunkX) and the orbs both ride this. ---- */
      const ROWS = 96;
      const cRow = new Float32Array(ROWS);
      const wRow = new Float32Array(ROWS);
      const mRow = new Float32Array(ROWS);
      let pc = 0.5;
      let pw = 0.16;
      for (let r = 0; r < ROWS; r++) {
        const gy = Math.min(gh - 1, Math.round((r / (ROWS - 1)) * (gh - 1)));
        let sum = 0;
        let sx = 0;
        let sxx = 0;
        for (let gx = 0; gx < gw; gx++) {
          const v = field[gy * gw + gx];
          if (v > 26) {
            sum += v;
            sx += v * gx;
            sxx += v * gx * gx;
          }
        }
        if (sum > 0) {
          const mean = sx / sum;
          const std = Math.sqrt(Math.max(0, sxx / sum - mean * mean));
          pc = mean / gw;
          pw = Math.min(0.3, Math.max(0.03, (std * 1.7) / gw));
        }
        cRow[r] = pc;
        wRow[r] = pw;
        mRow[r] = sum;
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let r = 1; r < ROWS - 1; r++) {
          cRow[r] = (cRow[r - 1] + cRow[r] * 2 + cRow[r + 1]) / 4;
          wRow[r] = (wRow[r - 1] + wRow[r] * 2 + wRow[r + 1]) / 4;
          mRow[r] = (mRow[r - 1] + mRow[r] * 2 + mRow[r + 1]) / 4;
        }
      }
      for (let gy = 0; gy < gh; gy++) {
        const r = Math.min(ROWS - 1, Math.round((gy / Math.max(1, gh - 1)) * (ROWS - 1)));
        const rowOk = Math.min(1, mRow[r] / 2600);
        if (rowOk < 0.08) continue;
        const c = cRow[r] * gw;
        const halfW = Math.max(2, wRow[r] * gw * 0.55);
        for (let gx = 0; gx < gw; gx++) {
          const d = (gx - c) / halfW;
          const i = gy * gw + gx;
          field[i] = Math.min(255, field[i] + Math.exp(-d * d) * 70 * rowOk);
        }
      }

      /* spawn sites: the lit canopy + upper trunk. The wide plate's canopy
         is a small, dark-green fraction of a 3168px frame, so a FIXED green
         threshold finds almost nothing. Take the GREENEST ~700 cells in the
         band instead — a target count adapts to night/day and any framing,
         always giving a lush, evenly-fed swarm. */
      spawnSites.length = 0;
      const y0 = Math.floor(SPAWN_BAND[0] * gh);
      const y1 = Math.floor(SPAWN_BAND[1] * gh);
      const cand: { x: number; y: number; v: number }[] = [];
      let peak = 1;
      for (let gy = y0; gy < y1; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const v = field[gy * gw + gx];
          if (v > peak) peak = v;
          if (v > GREEN_MIN * 0.5) {
            cand.push({ x: (gx / gw) * imgW, y: (gy / gh) * imgH, v });
          }
        }
      }
      cand.sort((a, b) => b.v - a.v);
      const TARGET = 700;
      const keep = cand.slice(0, TARGET);
      for (const c of keep) spawnSites.push({ x: c.x, y: c.y });
      /* live floor: orbs persist while on anything brighter than the dimmest
         site we kept (so they don't die the instant they spawn on a dark
         plate), with a hard minimum */
      liveThresh = Math.max(14, (keep.length ? keep[keep.length - 1].v : GREEN_MIN) * 0.7);

      /* helix axis: the mass-weighted centerline of the trunk band */
      {
        let cx = 0;
        let n = 0;
        for (let r = Math.floor(ROWS * 0.42); r < Math.floor(ROWS * 0.66); r++) {
          cx += cRow[r] * mRow[r];
          n += mRow[r];
        }
        trunkX = n > 0 ? (cx / n) * imgW : imgW * 0.5;
      }

      /* the cobalt vault: blue centroid of the bedrock band — the glowing
         "cave" the settlement orb seats into */
      vaultX = trunkX;
      vaultY = imgH * 0.9;
      {
        let bsum = 0;
        let bu = 0;
        let bv = 0;
        for (let gy = Math.floor(gh * 0.72); gy < gh; gy++) {
          for (let gx = 0; gx < gw; gx++) {
            const i = (gy * gw + gx) * 4;
            const s = Math.max(0, data[i + 2] - Math.max(data[i], data[i + 1]));
            if (s > 26) {
              bsum += s;
              bu += s * gx;
              bv += s * gy;
            }
          }
        }
        if (bsum > 0) {
          vaultX = (bu / bsum / gw) * imgW;
          vaultY = (bv / bsum / gh) * imgH;
        }
      }

      /* ---- settlement path: greedy turn-limited walk down the trunk
         veins, then a measured glide INTO the blue cave ---- */
      path = [];
      {
        let px = trunkX;
        let py = imgH * 0.27;
        let best = -1;
        for (let dx = -0.06; dx <= 0.06; dx += 0.005) {
          const v = green(trunkX + dx * imgW, py);
          if (v > best) {
            best = v;
            px = trunkX + dx * imgW;
          }
        }
        let heading = 0;
        const step = imgH * 0.012;
        path.push({ x: px, y: py });
        while (py < imgH * 0.78) {
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
        const fromX = px;
        const fromY = py;
        const STEPS = 16;
        for (let i = 1; i <= STEPS; i++) {
          const t = smooth01(i / STEPS);
          path.push({ x: lerp(fromX, vaultX, t), y: lerp(fromY, vaultY, t) });
        }
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < path.length - 1; i++) {
            path[i].x = (path[i - 1].x + path[i].x * 2 + path[i + 1].x) / 4;
            path[i].y = (path[i - 1].y + path[i].y * 2 + path[i + 1].y) / 4;
          }
        }
      }
      treeReady = true;
      bgDirty = true;
    };

    /* load (or swap to) a plate, then ingest it */
    const load = (srcUrl: string) => {
      if (srcUrl === activeSrc) return;
      activeSrc = srcUrl;
      treeReady = false;
      treeBmp?.close();
      treeBmp = null;
      const img = new Image();
      img.onload = () => {
        if (disposed || activeSrc !== srcUrl) return;
        tree = img;
        ingest(img);
        createImageBitmap(img)
          .then((b) => {
            if (!disposed && activeSrc === srcUrl) treeBmp = b;
          })
          .catch(() => {});
      };
      img.src = srcUrl;
    };

    /* ---- viewport ---- */
    let W = 0;
    let H = 0;
    const isPortrait = () => window.innerWidth < window.innerHeight * 0.9;
    const isMobile = () => window.innerWidth <= 760;
    const dprCap = () => (isMobile() ? 1.25 : 1.5);
    let DPR = Math.min(window.devicePixelRatio || 1, dprCap());
    const BG_DPR = 1;
    let bgDirty = true;

    const fit = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      DPR = Math.min(window.devicePixelRatio || 1, dprCap());
      fg.width = Math.round(W * DPR);
      fg.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bg.width = Math.round(W * BG_DPR);
      bg.height = Math.round(H * BG_DPR);
      bctx.setTransform(BG_DPR, 0, 0, BG_DPR, 0, 0);
      bgDirty = true;
      /* swap plate if the orientation crossed the portrait threshold */
      load(isPortrait() ? tallSrc : wideSrc);
    };
    fit();
    window.addEventListener("resize", fit);

    /* ---- orbs ---- */
    const orbBase = () => (isMobile() ? 42 : 100);
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
      const day = activeSrc.includes("day");

      /* the helix unwinds as it collapses into the settlement orb */
      const col = ph.collapse;
      const hx = ph.helix * (1 - col);
      const des = ph.descend;
      const rest = ph.rest;

      /* ---- shared cover mapping for THIS frame ----
         The MEASURED trunk is anchored to a viewport fraction (right of
         centre on landscape so copy clears the left; centred on portrait).
         Because the anchor is in viewport units, the framing is identical
         on a laptop and a 4K monitor — no zoom needed between displays. */
      const portrait = W < H * 0.9;
      const scale = Math.max(W / imgW, H / imgH) * ph.zoom;
      const anchorX = portrait ? 0.5 : 0.64 - 0.05 * smooth01(des);
      let offX = anchorX * W - trunkX * scale;
      offX = Math.min(0, Math.max(W - imgW * scale, offX));
      const offY = (H - imgH * scale) * ph.camY;
      const px = (ix: number) => ix * scale + offX;
      const py = (iy: number) => iy * scale + offY;

      /* ---- plate (background canvas, only when the camera moved) ---- */
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
        /* the thesis dwell pulls the plate back so the helix owns the frame
           — toward NIGHT on the dark plate, into MIST on the day plate */
        if (ph.black > 0.004) {
          bctx.fillStyle = day
            ? `rgba(236, 242, 233, ${(ph.black * 0.82).toFixed(3)})`
            : `rgba(4, 7, 5, ${(ph.black * 0.92).toFixed(3)})`;
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
         nearly-linear ride into the blue cave. */
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
        if (bestV < liveThresh && hx * o.mix < 0.4) o.dying = true;

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
        const bx = px(bigIx);
        const by = py(bigIy);
        /* hue ride: green → cyan → blue as it sinks toward bedrock */
        const hue = smooth01((travel - 0.45) / 0.5);
        const breathe = 1 + 0.06 * Math.sin(bigPulse * 3.1) + surge * 0.1;
        const R0 = (isMobile() ? 16 : 22) * (0.55 + ignite * 0.45) * breathe;
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

        /* ---- terminal burst: one soft blue detonation at the cave ---- */
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
          const gr = Math.max(1, ease * reach * 0.85);
          ctx.globalAlpha = Math.max(0, 0.5 * (1 - ease));
          ctx.drawImage(spBlue, bx - gr, by - gr, gr * 2, gr * 2);
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
          for (const s of burst.parts) {
            const d = s.v * ease * (Math.min(W, H) / 700);
            const sx = bx + Math.cos(s.a) * d;
            const sy = by + Math.sin(s.a) * d * 0.82;
            const sr = s.r * (1 - ease * 0.55) * 4;
            ctx.globalAlpha = Math.max(0, 0.9 * (1 - ease));
            ctx.drawImage(spBlue, sx - sr, sy - sr, sr * 2, sr * 2);
          }
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
  }, [phasesRef, tickRef, wideSrc, tallSrc]);

  return (
    <>
      <canvas ref={bgRef} className="v2-stage__canvas" aria-hidden />
      <canvas ref={fgRef} className="v2-stage__canvas" aria-hidden />
    </>
  );
}
