"use client";

import { useEffect, useRef } from "react";
import type { NetworkSnapshot } from "@/lib/network";

/* ============================================================
   StaticTreeHero — IMAGE-BACKGROUND hero track.

   A static world-tree PNG (public/hero-tree-green.png) + a 2D
   <canvas> "sap" engine that animates blockchain activity as light
   moving through the painted veins, in phases:

     0. BIRTH/GROW — many small orbs are born at leaf tips across the
                     TOP of the canopy and grow SLOWLY in place (each a
                     random final size). Only once full-grown do they
                     "break" onto their path.
     0. CANOPY     — the grown orb weaves down the branches (snake
                     pattern) to the bottom of the canopy (the fork).
     1. GATHER     — they collect into three canopy-base batching pockets;
                     once enough gather, they release fewer/larger proof
                     orbs down the trunk.
     2. ROOTS      — near the lower trunk each proof orb bends into one
                     root trail, staying separate all the way down.
     3. LOCK-IN    — at the root tip it flares a bigger glow (the tx is
                     "locked in" to Cardano L1), then vanishes.

   On-tree approach: each lane is woven from waypoints anchored to the
   brightest nearby vein, every vertex snapped onto the lit tree ONCE, then
   Laplacian-smoothed into an organic curve. Beads follow that baked curve
   directly — no per-frame re-snapping (it pulled beads across gaps to other
   veins, reading as a jagged zig-zag). The bead layer shares the background's
   single static cover-transform, so light tracks the veins at any aspect.

   The procedural Three.js track lives untouched in
   ./WorldTreeScene.tsx — Gateway switches between them via HERO_MODE,
   so both forks coexist.
   ============================================================ */

const BG_SRC = "/hero-tree-green.png";

// Intrinsic size of the background art — used to mirror `cover` in the canvas.
const IMG_ASPECT = 1672 / 941;
// Matches the CSS background `scale(1.06)` so the particle field sits on the art.
const ZOOM = 1.06;

// Geometry of the painted tree, read off the art in the PNG's normalised
// 0..1 space: a rounded canopy DOME, a short VERTICAL trunk right-of-centre,
// and a wide ROOT fan below it.
// Measured: x=0.725 is the brightest continuous vertical trunk column (the lit
// band is narrow, ~0.7225..0.7275), so strands hug it tightly and run dead
// vertical — blobs drop straight down a lit vein, never into dark bark.
const TRUNK_X = 0.725;
const TRUNK_STRANDS = [-0.0025, -0.0009, 0.0009, 0.0025];
const DOME = { cx: 0.72, cy: 0.305, rx: 0.185, ry: 0.135 }; // canopy foliage
const FORK_Y = 0.42; // canopy base: branches gather to the trunk top
const CROWN_Y = 0.615; // lower trunk base: roots begin to splay here
const GATHER_NODES = [
  { x: TRUNK_X - 0.029, y: FORK_Y - 0.011, strand: 0 },
  { x: TRUNK_X - 0.002, y: FORK_Y + 0.001, strand: 1 },
  { x: TRUNK_X + 0.026, y: FORK_Y - 0.008, strand: 3 },
] as const;

// Particle colour — luminescent green to match the vein glow.
const PARTICLE_CORE = "#00ff66"; // primary
const PARTICLE_ALT = "#33ff33"; // variation

// Tunables
const MAX_PARTICLES = 760;
// A random number of canopy orbs lump together into each trunk blob, so blob
// sizes vary with how many gathered while avoiding oversized root exits.
const GATHER_MIN = 8;
const GATHER_MAX = 13;
const FLASH_DUR = 1.5; // length of the "locked-in to L1" flash at a root tip — long, slow fade
// Canopy orbs are born tiny and GROW in place (slowly, randomised per orb)
// before they break onto their snake path down the tree.
const GROW_MIN = 0.38; // seconds to reach full size (ambient orb)
const GROW_MAX = 0.95;
const GROW_FAST = 0.32; // event-burst orbs grow quicker
const FIRST_GLOW_DELAY = 0.5; // first visible transaction glow after page open
const STARTUP_RAMP_SECONDS = 4.4;
const OPENING_BURST_COUNT = 18;
const BASE_CANOPY_LANES = 150;
const HIGH_CANOPY_EXTRA_LANES = 200;
const HIGH_MICRO_OPENING_BURST = 190;
const HIGH_MICRO_BATCH_BURST = 38;
const HIGH_MICRO_SETTLE_BURST = 52;
// Blobs glide at a CONSTANT VISUAL speed (height/sec), arc-length-normalised so
// the short trunk and the long roots run at the same on-screen pace — no speed
// change at the crown. Slower than the darting canopy orbs.
const BLOB_VSPEED = 0.038; // height/sec, held from fork to the very root tip — slightly slower drop
const BLOB_VSPEED_JIT = 0.006; // tiny variance so some blobs catch up + merge
const MERGE_CAP = 4.2; // max blob size after merging

type Pt = { x: number; y: number };
type Lane = { poly: Pt[]; width: number; len: number; gi?: number; ang?: number; high?: boolean }; // gi = base pocket; ang = birth angle (canopy)
type Tree = { canopy: Lane[]; trunk: Lane[]; roots: Lane[] };

// phase 0 = canopy orb (grows in place, then descends), 1 = trunk blob,
// 2 = root blob, 3 = "locked-in" flash playing out at a root tip
type Particle = {
  phase: 0 | 1 | 2 | 3;
  seg: number; // index within the current phase's lane set
  t: number; // 0..1 along the current segment
  speed: number; // progress/sec
  size: number; // target (full-grown) size — randomised, kept varied
  grow: number; // 0..1 growth progress; while <1 the orb grows in place
  growRate: number; // growth per second (0 for already-grown blobs)
  hold: number; // after growing, canopy orbs linger glowing before breaking loose
  alt: boolean;
  age: number;
  r0?: number; // stable per-orb random (0..1) -> slightly squashed/rotated organic shape
  growDelay?: number; // tiny per-orb wait before it begins growing — desyncs the field
  micro?: boolean;
};

type LeafNode = { x: number; y: number; phase: number; flash: number };
type GatherBucket = {
  x: number;
  y: number;
  strand: number;
  count: number;
  value: number;
  target: number;
  glow: number;
};

// Snap helpers built from the loaded art (see makeVeinField).
type VeinField = {
  snapBright: (p: Pt, radius?: number) => Pt; // brightest vein within radius — anchors lane ends
  keepOnTree: (p: Pt, radius?: number) => Pt; // nudge an off-tree point to the nearest lit pixel
};

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
const CORE_RGB = rgb(PARTICLE_CORE);
const ALT_RGB = rgb(PARTICLE_ALT);
const FLASH_RGB = rgb("#c8964a"); // brown-gold for the L1 lock-in flash at root tips

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth01 = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

// Smooth curve through waypoints (Catmull-Rom), ends clamped.
function catmullRom(points: Pt[], samplesPer: number): Pt[] {
  if (points.length < 2) return points.slice();
  const pts = [points[0], ...points, points[points.length - 1]];
  const out: Pt[] = [];
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1],
      p1 = pts[i],
      p2 = pts[i + 1],
      p3 = pts[i + 2];
    for (let j = 0; j < samplesPer; j++) {
      const t = j / samplesPer;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

// 0 inside the vertical trunk y-band, smoothly -> 1 in the canopy and roots, so
// branches converge cleanly at the fork and roots emerge straight from the crown.
function trunkDamp(y: number): number {
  const lo = FORK_Y - 0.02;
  const hi = CROWN_Y + 0.02;
  if (y <= lo || y >= hi) return 1;
  const mid = (lo + hi) / 2;
  const d = Math.abs(y - mid) / ((hi - lo) / 2); // 0 at band centre -> 1 at edge
  return d * d * (3 - 2 * d); // smoothstep
}

// Lateral sine "snake" weave; amplitude tapers to 0 at both ends so the ends
// stay anchored, and is damped through the trunk band.
function snake(poly: Pt[], amp: number, waves: number, phase: number): Pt[] {
  const n = poly.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = poly[Math.max(0, i - 1)];
    const b = poly[Math.min(n - 1, i + 1)];
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const L = Math.hypot(tx, ty) || 1;
    tx /= L;
    ty /= L;
    const off =
      amp *
      Math.sin(Math.PI * t) *
      Math.sin(waves * Math.PI * t + phase) *
      trunkDamp(poly[i].y);
    out.push({ x: poly[i].x + -ty * off, y: poly[i].y + tx * off });
  }
  return out;
}

// Light Laplacian smoothing: nudges each interior point toward the midpoint of
// its neighbours a few times, erasing the high-frequency zig-zag that the
// per-vertex vein-snap leaves behind. Endpoints stay anchored, so a bead glides
// along a smooth, organic curve instead of a jagged one.
function smoothPoly(poly: Pt[], iters: number): Pt[] {
  let out = poly.map((p) => ({ x: p.x, y: p.y }));
  for (let k = 0; k < iters; k++) {
    const next = out.map((p) => ({ x: p.x, y: p.y }));
    for (let i = 1; i < out.length - 1; i++) {
      next[i].x = out[i].x + 0.5 * ((out[i - 1].x + out[i + 1].x) / 2 - out[i].x);
      next[i].y = out[i].y + 0.5 * ((out[i - 1].y + out[i + 1].y) / 2 - out[i].y);
    }
    out = next;
  }
  return out;
}

function blendPt(a: Pt, b: Pt, t: number): Pt {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function chaikinPoly(poly: Pt[], iters: number): Pt[] {
  let out = poly.map((p) => ({ x: p.x, y: p.y }));
  for (let k = 0; k < iters; k++) {
    if (out.length < 3) return out;
    const next: Pt[] = [out[0]];
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i];
      const b = out[i + 1];
      next.push(blendPt(a, b, 0.28), blendPt(a, b, 0.72));
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
}

function fitToTree(
  poly: Pt[],
  onTree: (p: Pt, radius?: number) => Pt,
  radius: number,
  passes = 2,
): Pt[] {
  let out = smoothPoly(poly.map((p) => onTree(p, radius)), 3);
  for (let i = 0; i < passes; i++) {
    out = smoothPoly(
      out.map((p, idx) => {
        const end = idx === 0 || idx === out.length - 1;
        return blendPt(p, onTree(p, radius), end ? 0.85 : 0.35);
      }),
      2,
    );
  }
  out = chaikinPoly(out, 2);
  return smoothPoly(
    out.map((p, idx) => {
      const end = idx === 0 || idx === out.length - 1;
      return blendPt(p, onTree(p, radius * 0.9), end ? 0.7 : 0.18);
    }),
    1,
  );
}

function visualSegLen(a: Pt, b: Pt): number {
  return Math.hypot((b.x - a.x) * IMG_ASPECT, b.y - a.y);
}

// Approximate on-screen (visual) length of a lane — x scaled by the art aspect
// so trunk/root/canopy lengths are comparable. Used to hold a blob at a constant
// visual speed no matter how long the lane it's travelling is.
function polyLen(poly: Pt[]): number {
  let L = 0;
  for (let i = 1; i < poly.length; i++) {
    L += visualSegLen(poly[i - 1], poly[i]);
  }
  return L || 1;
}

// Build the three vein-lane sets in the PNG's normalised space. With a
// VeinField, lane ends are anchored to the brightest nearby vein and EVERY
// vertex is kept on the lit tree (so the snake-weave can't wander off it).
function buildTree(field?: VeinField): Tree {
  const anchor = field ? field.snapBright : (p: Pt) => p;
  const onTree = field ? field.keepOnTree : (p: Pt) => p;
  const crown: Pt = { x: TRUNK_X, y: CROWN_Y };

  // CANOPY: leaf tip on the dome -> sweep in -> fork. Snake-woven branches that
  // all converge at the bottom of the canopy (the fork) where orbs gather.
  const canopy: Lane[] = [];
  const NC = BASE_CANOPY_LANES + HIGH_CANOPY_EXTRA_LANES;
  for (let i = 0; i < NC; i++) {
    const isHighMicro = i >= BASE_CANOPY_LANES;
    // RANDOM scatter across the crown (not a grid): random angle + random DEPTH,
    // capped at 0.8 of the dome so tips never reach the outer edge / sky. Snapped
    // onto the nearest bright vein so orbs RIDE the branches + bunch lower-centre.
    const jAng = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const jRad = Math.abs(Math.sin(i * 78.233 + 2.1) * 43758.5453) % 1;
    const jW = Math.abs(Math.sin(i * 39.42 + 0.7) * 43758.5453) % 1;
    const ang = isHighMicro
      ? Math.PI * (0.18 + 0.64 * jAng)
      : Math.PI * (-0.04 + 1.08 * jAng); // across the crown arc
    const rf = isHighMicro
      ? 0.56 + 0.2 * jRad
      : 0.3 + 0.5 * jRad; // never the very edge
    const leafGuess = {
      x: DOME.cx + Math.cos(ang) * DOME.rx * rf,
      y: DOME.cy - Math.sin(ang) * DOME.ry * rf,
    };
    const leaf = field
      ? onTree(anchor(leafGuess, isHighMicro ? 0.026 : 0.055), isHighMicro ? 0.028 : 0.06)
      : {
          x: clamp(leafGuess.x, DOME.cx - DOME.rx * 0.8, DOME.cx + DOME.rx * 0.8),
          y: leafGuess.y,
        };
    // route this lane to ONE of the 3 base pockets (by which side of the crown)
    const gi = Math.min(
      GATHER_NODES.length - 1,
      Math.max(0, Math.floor(((leaf.x - (DOME.cx - DOME.rx)) / (DOME.rx * 2)) * GATHER_NODES.length)),
    );
    const gather = GATHER_NODES[gi];
    const forkInlet = {
      x: gather.x + TRUNK_STRANDS[i % TRUNK_STRANDS.length] * 0.3,
      y: gather.y + Math.sin(i * 1.7) * 0.003,
    };
    const mid = anchor({
      x: lerp(leaf.x, gather.x, 0.6),
      y: lerp(leaf.y, gather.y, 0.62),
    }, isHighMicro ? 0.016 : 0.028);
    const base = catmullRom([leaf, mid, forkInlet], 14);
    const woven = snake(
      base,
      isHighMicro ? 0.0025 + jW * 0.0025 : 0.005 + jW * 0.004,
      1 + (i % 2),
      (i * 1.3) % (Math.PI * 2),
    );
    const onT = field
      ? fitToTree(woven, onTree, isHighMicro ? 0.012 : 0.022, 2)
      : smoothPoly(woven, 2);
    if (field) onT[0] = leaf; // pin the birth point to the snapped vein tip
    canopy.push({
      poly: onT,
      width: isHighMicro ? clamp(0.32 + jW * 0.32, 0.28, 0.66) : clamp(0.55 + jW * 0.6, 0.45, 1.15),
      len: polyLen(onT),
      gi,
      ang,
      high: isHighMicro,
    });
  }

  // TRUNK: a few perfectly-vertical parallel strands, fork -> crown. NOT snapped
  // to veins (that kinked them sideways) — at constant x they already sit on the
  // painted trunk, so blobs drop almost dead-vertical into the root system.
  const trunk: Lane[] = TRUNK_STRANDS.map((off, si) => {
    const x = TRUNK_X + off; // central vertical column
    const node = GATHER_NODES.find((n) => n.strand === si);
    const startX = node ? node.x : x;
    const poly = catmullRom(
      [
        { x: startX, y: FORK_Y }, // a clump forms at the pocket...
        { x: lerp(startX, x, 0.6), y: FORK_Y + 0.03 }, // ...slides to the middle line...
        { x, y: lerp(FORK_Y, CROWN_Y, 0.5) },
        { x, y: CROWN_Y }, // ...then drops straight down
      ],
      10,
    );
    return { poly, width: 1, len: polyLen(poly) };
  });

  // ROOTS: crown -> splay -> tip. Wide asymmetric fan (further left than right);
  // centre roots plunge deepest. These are the "big roots" blobs travel down.
  const roots: Lane[] = [];
  const NR = 24;
  for (let i = 0; i < NR; i++) {
    const u = ((i + 0.5) / NR) * 2 - 1;
    const a = Math.abs(u);
    const j = Math.abs(Math.sin((i + 11) * 78.233) * 43758.5453) % 1;
    const tip = anchor({
      x: clamp(TRUNK_X + (u < 0 ? u * 0.31 : u * 0.18), 0.47, 0.9),
      y: 0.7 + (1 - a) * 0.22 + j * 0.018,
    }, 0.04);
    const gate = {
      x: lerp(crown.x, tip.x, 0.06),
      y: CROWN_Y + 0.052 + (1 - a) * 0.01,
    };
    const mid = anchor({
      x: lerp(crown.x, tip.x, 0.38) + u * (0.008 + j * 0.01),
      y: lerp(CROWN_Y, tip.y, 0.62),
    }, 0.03);
    const base = catmullRom([crown, gate, mid, tip], 14);
    // gentlest weave — roots should read as aligning to the big painted root veins
    const woven = snake(base, 0.0025 + a * 0.0025, 1, (i * 2.1 + 1) % (Math.PI * 2));
    const onT = field ? fitToTree(woven, onTree, 0.026, 2) : smoothPoly(woven, 2);
    roots.push({ poly: onT, width: clamp(1.15 - a * 0.6, 0.5, 1.15), len: polyLen(onT) });
  }

  return { canopy, trunk, roots };
}

// Distance-based Catmull sample along a dense softened lane. That keeps visual
// speed even after vein fitting and gives the bead/tail a rolling curve instead
// of visible corner turns between snapped vertices.
function sampleLane(lane: Lane, t: number): { pt: Pt; tan: Pt } {
  const poly = lane.poly;
  const n = poly.length - 1;
  if (n < 1) return { pt: poly[0], tan: { x: 0, y: 1 } };
  const target = clamp(t, 0, 0.99999) * lane.len;
  let acc = 0;
  let i = 0;
  let f = 0;
  for (; i < n; i++) {
    const seg = visualSegLen(poly[i], poly[i + 1]);
    if (acc + seg >= target) {
      f = seg > 0 ? (target - acc) / seg : 0;
      break;
    }
    acc += seg;
  }
  i = Math.min(i, n - 1);
  const p0 = poly[Math.max(0, i - 1)];
  const p1 = poly[i];
  const p2 = poly[i + 1];
  const p3 = poly[Math.min(n, i + 2)];
  const f2 = f * f;
  const f3 = f2 * f;
  const pt = {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * f +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * f +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f3),
  };
  const tan = {
    x:
      0.5 *
      ((-p0.x + p2.x) +
        2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f +
        3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f2),
    y:
      0.5 *
      ((-p0.y + p2.y) +
        2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f +
        3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f2),
  };
  return {
    pt,
    tan,
  };
}

function makeGlow(rgbStr: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, `rgba(${rgbStr},0.92)`);
  grd.addColorStop(0.4, `rgba(${rgbStr},0.26)`);
  grd.addColorStop(1, `rgba(${rgbStr},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return c;
}

// Build "snap" helpers from the loaded art. Downsamples the PNG to a luminance
// grid; `snapBright` returns the brightest painted pixel within a small radius
// (to anchor lane ends), and `keepOnTree` nudges an off-tree point to the
// NEAREST painted pixel (so a woven path can never sit in a dark gap).
function makeVeinField(img: HTMLImageElement): VeinField {
  const sw = 720;
  const sh = Math.max(1, Math.round((sw * img.naturalHeight) / img.naturalWidth));
  const c = document.createElement("canvas");
  c.width = sw;
  c.height = sh;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, sw, sh);
  const d = g.getImageData(0, 0, sw, sh).data;
  const vein = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const k = i * 4;
    const r = d[k];
    const gg = d[k + 1];
    const b = d[k + 2];
    const lum = 0.3 * r + 0.6 * gg + 0.1 * b;
    const vividGreen = Math.max(0, gg - Math.max(r, b));
    const yellowGreen = Math.max(0, gg * 1.35 - r - b * 0.55);
    const saturation = Math.max(r, gg, b) - Math.min(r, gg, b);
    const nx = (i % sw) / sw;
    const ny = Math.floor(i / sw) / sh;
    const nearTree =
      nx > 0.45 &&
      nx < 0.93 &&
      ny > 0.16 &&
      ny < 0.94 &&
      Math.abs(nx - TRUNK_X) < 0.35;

    // Follow the green/yellow lit veins, not generic image brightness. This
    // avoids cloud highlights and background foliage pulling the overlay away
    // from the painted tree.
    vein[i] =
      nearTree && gg > 34
        ? vividGreen * 2.4 + yellowGreen * 0.8 + saturation * 0.18 + lum * 0.035
        : 0;
  }
  const at = (nx: number, ny: number) => {
    const x = clamp(Math.round(nx * sw), 0, sw - 1);
    const y = clamp(Math.round(ny * sh), 0, sh - 1);
    return vein[y * sw + x];
  };

  const MIN_L = 10; // score that counts as a lit painted vein
  const snapBright = (p: Pt, radius = 0.04): Pt => {
    const px = p.x * sw;
    const py = p.y * sh;
    const Rb = radius * sw;
    const x0 = Math.max(0, Math.floor(px - Rb));
    const x1 = Math.min(sw - 1, Math.ceil(px + Rb));
    const y0 = Math.max(0, Math.floor(py - Rb));
    const y1 = Math.min(sh - 1, Math.ceil(py + Rb));
    let best = -1;
    let bx = p.x;
    let by = p.y;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - px;
        const dy = y - py;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > Rb * Rb) continue;
        const l = vein[y * sw + x];
        if (l < MIN_L) continue;
        const score = l - 0.75 * Math.sqrt(dist2); // signal first, but stay close
        if (score > best) {
          best = score;
          bx = x / sw;
          by = y / sh;
        }
      }
    }
    return { x: bx, y: by };
  };

  const MIN_ON = 5;
  const keepOnTree = (p: Pt, radius = 0.024): Pt => {
    if (at(p.x, p.y) >= MIN_ON) return p; // already on the tree — leave it be
    const px = p.x * sw;
    const py = p.y * sh;
    const Rk = radius * sw;
    const x0 = Math.max(0, Math.floor(px - Rk));
    const x1 = Math.min(sw - 1, Math.ceil(px + Rk));
    const y0 = Math.max(0, Math.floor(py - Rk));
    const y1 = Math.min(sh - 1, Math.ceil(py + Rk));
    let bestD = Infinity;
    let bx = p.x;
    let by = p.y;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const l = vein[y * sw + x];
        if (l < MIN_ON) continue;
        const dx = x - px;
        const dy = y - py;
        const dist2 = dx * dx + dy * dy;
        const score = dist2 / (1 + l * 0.12);
        if (score < bestD) {
          bestD = score;
          bx = x / sw;
          by = y / sh;
        }
      }
    }
    return bestD < Infinity ? { x: bx, y: by } : p;
  };

  return { snapBright, keepOnTree };
}

export default function StaticTreeHero({
  snap,
  motionOn,
}: {
  snap: NetworkSnapshot;
  motionOn: boolean;
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const snapRef = useRef(snap);
  const motionRef = useRef(motionOn);

  useEffect(() => {
    snapRef.current = snap;
  }, [snap]);

  useEffect(() => {
    motionRef.current = motionOn;
  }, [motionOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bg = bgRef.current;
    if (!canvas || !bg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const makeLeaves = (t: Tree): LeafNode[] =>
      t.canopy.map((l, i) => ({
        x: l.poly[0].x,
        y: l.poly[0].y,
        phase: (i * 1.7) % (Math.PI * 2),
        flash: 0,
      }));

    // Spawn weights bias new orbs toward the top while keeping the outer canopy alive.
    let canopyW: number[] = [];
    let highCanopyIdx: number[] = [];
    let canopyWSum = 0;
    const computeWeights = () => {
      // near-uniform: the random vein-snapped lanes already bunch in the lit
      // lower-centre, so let that lane density set where the orbs concentrate.
      canopyW = tree.canopy.map((l) => 1.0 + l.width * 0.2 + (l.high ? 0.35 : 0));
      highCanopyIdx = tree.canopy.reduce<number[]>((acc, l, i) => {
        if (l.high) acc.push(i);
        return acc;
      }, []);
      canopyWSum = canopyW.reduce((s, w) => s + w, 0);
    };

    // Provisional parametric tree renders immediately; once the art has loaded
    // we re-snap the lanes onto the actual painted veins and swap it in. The
    // snapping happens here, at build time only — the lanes are then baked, so
    // the draw loop follows them without any per-frame snapping.
    let tree = buildTree();
    let leaves = makeLeaves(tree);
    computeWeights();
    const veinImg = new Image();
    veinImg.onload = () => {
      try {
        const field = makeVeinField(veinImg);
        tree = buildTree(field);
        leaves = makeLeaves(tree);
        computeWeights();
      } catch {
        /* tainted/decode failure — keep the parametric tree */
      }
    };
    veinImg.src = BG_SRC;

    const glowCore = makeGlow(CORE_RGB);
    const glowAlt = makeGlow(ALT_RGB);
    const glowGold = makeGlow(FLASH_RGB); // brown-gold root lock-in flash (#8)

    let W = 0,
      H = 0,
      dpr = 1;
    const nextTarget = () =>
      GATHER_MIN + ((Math.random() * (GATHER_MAX - GATHER_MIN + 1)) | 0);
    const particles: Particle[] = [];
    const gatherBuckets: GatherBucket[] = GATHER_NODES.map((node) => ({
      ...node,
      count: 0,
      value: 0,
      target: nextTarget(),
      glow: 0,
    }));
    let spawnTimer = FIRST_GLOW_DELAY; // short pause before the first orbs drip in (#4)
    let surge = 0; // settlement flash, decays
    let lastBatch = snapRef.current.l2.latestBatchId;
    let lastProof = snapRef.current.l2.latestProofStatus;
    let staticSeeded = false;
    let runTime = 0; // seconds of active animation — drives the drip ramp (#4)
    let focusAngle = Math.PI / 2; // sweeping spawn-concentration angle (#4)
    let openingBurstDone = false;
    let openingReleaseDone = false;

    // cursor speed-field (#9): orbs within CURSOR_R of the pointer move faster
    const cursor = { px: -1, py: -1, active: false };
    const CURSOR_R = 0.04;
    const CURSOR_BOOST = 3;
    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.px = e.clientX - r.left;
      cursor.py = e.clientY - r.top;
      cursor.active = true;
    };
    const onPointerLeave = () => {
      cursor.active = false;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerout", onPointerLeave);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const laneOf = (p: Particle): Lane =>
      p.phase === 0 ? tree.canopy[p.seg] : p.phase === 1 ? tree.trunk[p.seg] : tree.roots[p.seg];

    const pickBaseCanopySeg = (): number => {
      if (canopyWSum <= 0) return (Math.random() * tree.canopy.length) | 0;
      let r = Math.random() * canopyWSum;
      for (let i = 0; i < canopyW.length; i++) {
        r -= canopyW[i];
        if (r <= 0) return i;
      }
      return (Math.random() * tree.canopy.length) | 0;
    };

    const pickHighCanopySeg = (): number => {
      if (highCanopyIdx.length === 0) return pickBaseCanopySeg();
      return highCanopyIdx[(Math.random() * highCanopyIdx.length) | 0];
    };

    const pickCanopySeg = (): number => {
      // Keep a portion of births spread across the whole crown so the top reads
      // like many independent transactions rather than one tight swarm.
      if (Math.random() < 0.42) return pickHighCanopySeg();
      if (Math.random() < 0.18) return pickBaseCanopySeg();

      // base lane density × proximity to the current focus angle, which slowly
      // sweeps so the drip bunches on one side then rotates around the crown (#4)
      const focusW: number[] = [];
      let sum = 0;
      for (let i = 0; i < canopyW.length; i++) {
        const a = tree.canopy[i].ang ?? Math.PI / 2;
        const d = a - focusAngle;
        const prox = Math.exp(-(d * d) / (2 * 0.68 * 0.68));
        const wgt = (canopyW[i] || 1) * (0.55 + prox * 0.9);
        focusW.push(wgt);
        sum += wgt;
      }
      let r = Math.random() * sum;
      for (let i = 0; i < focusW.length; i++) {
        r -= focusW[i];
        if (r <= 0) return i;
      }
      return (Math.random() * tree.canopy.length) | 0;
    };

    const bucketForCanopySeg = (seg: number): GatherBucket => {
      // route to the pocket this lane was already aimed at during construction (#6)
      let idx = tree.canopy[seg]?.gi ?? 1;
      if (Math.random() < 0.12) {
        idx = clamp(idx + (Math.random() < 0.5 ? -1 : 1), 0, gatherBuckets.length - 1);
      }
      return gatherBuckets[idx];
    };

    // a small orb born at a (mostly top-of-canopy) leaf; it grows in place,
    // lingers glowing, then weaves down toward the fork.
    const spawnCanopy = (fast = false, micro = false) => {
      if (particles.length >= MAX_PARTICLES) return;
      const seg = micro ? pickHighCanopySeg() : pickCanopySeg();
      const w = tree.canopy[seg].width;
      // pick the FINAL size first, then correlate timing to it (#5): small orbs
      // grow fast + break off quickly; large orbs grow slowly + linger longer.
      const sizeRoll = Math.random();
      const topSize = micro
        ? 0.12 + Math.pow(Math.random(), 1.7) * 0.18
        : sizeRoll < 0.7
          ? 0.22 + Math.pow(Math.random(), 1.35) * 0.34
          : sizeRoll < 0.93
            ? 0.56 + Math.random() * 0.4
            : 1.0 + Math.random() * 0.62;
      const size = topSize * (micro ? 0.72 + w * 0.18 : 0.78 + w * 0.42);
      const sizeN = clamp(size / 1.6, 0, 1); // 0 (tiny) .. 1 (largest)
      const growTime = micro
        ? (fast ? 0.14 : 0.2) + Math.random() * (fast ? 0.18 : 0.26)
        : (fast
            ? GROW_FAST * (0.7 + Math.random() * 0.6)
            : GROW_MIN + Math.random() * (GROW_MAX - GROW_MIN)) *
          (0.7 + sizeN * 0.9);
      const hold = micro
        ? (0.24 + Math.random() * 0.56) * (fast ? 0.82 : 1)
        : (fast ? 0.1 + sizeN * 0.55 : 0.22 + sizeN * 1.05) *
          (0.55 + Math.random() * 0.65);
      particles.push({
        phase: 0,
        seg,
        t: 0,
        speed: micro
          ? (fast ? 1.4 : 1) * (0.11 + Math.random() * 0.08)
          : (fast ? 1.75 : 1) * (0.18 + Math.random() * 0.12) * (1.15 - sizeN * 0.3),
        size,
        grow: 0,
        growRate: 1 / growTime,
        hold,
        alt: Math.random() < 0.5,
        age: 0,
        r0: Math.random(),
        growDelay: micro ? Math.random() * 0.08 : fast ? Math.random() * 0.06 : Math.random() * 0.26,
        micro,
      });
      leaves[seg].flash = Math.min(1, leaves[seg].flash + (micro ? 0.16 : 0.72));
    };

    const releaseBlob = (
      bucket: GatherBucket,
      gatheredCount: number,
      gatheredValue: number,
      passThrough = false,
    ) => {
      const base = passThrough
        ? 0.52 + Math.random() * 0.45
        : 0.78 + Math.sqrt(gatheredCount) * 0.23 + Math.sqrt(gatheredValue) * 0.36;
      const addSize = clamp(
        base * (0.78 + Math.random() * 0.5),
        passThrough ? 0.45 : 0.9,
        passThrough ? 1.15 : MERGE_CAP,
      );
      if (!passThrough && Math.random() < 0.18) {
        let host: Particle | null = null;
        for (const p of particles)
          if (p.phase === 1 && p.t < 0.28 && (!host || p.t < host.t)) host = p;
        if (host) {
          host.size = Math.min(MERGE_CAP, Math.cbrt(host.size ** 3 + addSize ** 3));
          bucket.glow = 1;
          return;
        }
      }
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({
        phase: 1,
        seg: clamp(
          bucket.strand + (Math.random() < 0.18 ? (Math.random() < 0.5 ? -1 : 1) : 0),
          0,
          tree.trunk.length - 1,
        ),
        t: 0,
        speed: BLOB_VSPEED + (Math.random() * 2 - 1) * BLOB_VSPEED_JIT,
        size: addSize,
        grow: 1,
        growRate: 0,
        hold: 0,
        alt: Math.random() < 0.5,
        age: 0,
      });
      bucket.glow = 1;
    };

    const collectAtBucket = (p: Particle) => {
      const bucket = bucketForCanopySeg(p.seg);
      if (p.micro && Math.random() < 0.58) {
        bucket.glow = Math.min(1, bucket.glow + 0.08 + p.size * 0.04);
        return;
      }
      if (Math.random() < 0.06) {
        releaseBlob(bucket, 1, Math.max(0.45, p.size), true);
        return;
      }
      const txWeight = p.micro ? 0.35 : 1;
      bucket.count += txWeight;
      bucket.value += Math.max(0.22, p.size) * (p.micro ? 0.45 : 1);
      bucket.glow = Math.min(1, bucket.glow + 0.32 + p.size * 0.08);
    };

    // send proof orbs down a handful of MAJOR root systems (not every tip) so
    // the lock-in flashes cluster on the big light-green roots — ~6 of them (#8)
    const MAJOR_ROOT_FRACS = [0.12, 0.27, 0.42, 0.55, 0.71, 0.88];
    const rootIndexForTrunk = () => {
      const frac = MAJOR_ROOT_FRACS[(Math.random() * MAJOR_ROOT_FRACS.length) | 0];
      return clamp(Math.round(frac * (tree.roots.length - 1)), 0, tree.roots.length - 1);
    };

    const continueIntoRoot = (p: Particle) => {
      p.phase = 2;
      p.seg = rootIndexForTrunk();
      p.t = Math.random() * 0.015;
      p.speed *= 0.96 + Math.random() * 0.08;
      p.age = Math.max(p.age, 0.4);
      surge = Math.max(surge, 0.06);
    };

    const seedStatic = () => {
      particles.length = 0;
      for (let i = 0; i < tree.canopy.length; i++)
        particles.push({
          phase: 0,
          seg: i,
          t: 0.55,
          speed: 0,
          size: 0.45 * (0.6 + tree.canopy[i].width * 0.6),
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: i % 2 === 0,
          age: 1,
        });
      for (let i = 0; i < tree.trunk.length; i++)
        particles.push({
          phase: 1,
          seg: i,
          t: 0.5,
          speed: 0,
          size: 1.25,
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: false,
          age: 1,
        });
      for (let i = 0; i < tree.roots.length; i++)
        particles.push({
          phase: 2,
          seg: i,
          t: 0.5,
          speed: 0,
          size: 0.85,
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: i % 2 === 0,
          age: 1,
        });
    };

    let raf = 0;
    let prev = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const moving = motionRef.current;
      const s = snapRef.current;

      // Mirror CSS `background-size: cover` (+ ZOOM) so normalised art coords land
      // on the painted tree. The background is static (no mouse parallax), so the
      // bead layer and the art share one fixed transform.
      const va = W / H;
      let dW: number, dH: number;
      if (va > IMG_ASPECT) {
        dW = W * ZOOM;
        dH = (W / IMG_ASPECT) * ZOOM;
      } else {
        dH = H * ZOOM;
        dW = H * IMG_ASPECT * ZOOM;
      }
      const oX = (W - dW) / 2;
      const oY = (H - dH) / 2;

      if (moving) {
        staticSeeded = false;
        const activity = Math.max(0, Math.min(1, s.l1.txCountWindow / 100));
        // advance the drip ramp + sweep the spawn-focus angle around the crown (#4)
        runTime += dt;
        focusAngle = Math.PI * 0.5 + Math.PI * 0.72 * Math.sin((now / 1000) * 0.65);

        if (!openingBurstDone && runTime >= FIRST_GLOW_DELAY) {
          openingBurstDone = true;
          for (let i = 0; i < OPENING_BURST_COUNT; i++) spawnCanopy(true);
          for (let i = 0; i < HIGH_MICRO_OPENING_BURST; i++) spawnCanopy(true, true);
          for (const bucket of gatherBuckets) bucket.glow = Math.max(bucket.glow, 0.55);
          spawnTimer = 0.06;
        }

        if (!openingReleaseDone && runTime >= 1.65) {
          openingReleaseDone = true;
          const bucket = gatherBuckets[(Math.random() * gatherBuckets.length) | 0];
          releaseBlob(bucket, GATHER_MIN, GATHER_MIN * 0.8);
        }

        // event: new batch -> a small flurry of canopy orbs + nudge the lump
        if (s.l2.latestBatchId !== lastBatch) {
          lastBatch = s.l2.latestBatchId;
          for (let i = 0; i < 14; i++) spawnCanopy(true);
          for (let i = 0; i < HIGH_MICRO_BATCH_BURST; i++) spawnCanopy(true, true);
          gatherBuckets[(Math.random() * gatherBuckets.length) | 0].glow = 1;
        }
        // event: settlement confirmed -> brighter swell + force a blob to drop
        if (s.l2.latestProofStatus === "settled" && lastProof !== "settled") {
          surge = 1;
          for (let i = 0; i < 18; i++) spawnCanopy(true);
          for (let i = 0; i < HIGH_MICRO_SETTLE_BURST; i++) spawnCanopy(true, true);
          for (const bucket of gatherBuckets) bucket.glow = Math.max(bucket.glow, 0.5);
        }
        lastProof = s.l2.latestProofStatus;

        // sporadic ambient canopy spawning: irregular gaps and small clusters,
        // with many more visible canopy points while each point keeps its pace
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          // ramp 0->1 over the first few seconds: a sparse drip that builds to a heavy
          // dotting — bigger clusters + shorter gaps as the ramp climbs (#4).
          const ramp = Math.min(1, runTime / STARTUP_RAMP_SECONDS);
          const cluster = 2 + Math.floor(ramp * (Math.random() < 0.55 ? 5 : 3));
          for (let k = 0; k < cluster; k++) spawnCanopy(Math.random() < 0.16 + ramp * 0.14);
          const microCluster = 3 + Math.floor(ramp * (Math.random() < 0.65 ? 6 : 4));
          for (let k = 0; k < microCluster; k++) spawnCanopy(Math.random() < 0.28 + ramp * 0.22, true);
          const meanGap = Math.max(0.08, (0.34 - ramp * 0.22) + (1 - activity) * 0.06);
          spawnTimer = meanGap * (0.42 + Math.random() * 0.9);
        }

        // cursor focus point in normalised art coords (for the speed-field #9)
        const curX = cursor.active ? (cursor.px - oX) / dW : -1;
        const curY = cursor.active ? (cursor.py - oY) / dH : -1;

        // grow in place, then advance along the current segment (+ cursor boost)
        for (const p of particles) {
          p.age += dt;
          if (p.phase === 3) continue; // flashing at a root tip — stays put
          // staggered birth: a brief delay before each orb starts swelling, so
          // they pop in as an irregular drip rather than all at once (#4/#5)
          if (p.phase === 0 && p.growDelay && p.age < p.growDelay) continue;
          if (p.grow < 1) {
            p.grow = Math.min(1, p.grow + p.growRate * dt);
            continue; // still growing at its birth spot — doesn't move yet
          }
          // cursor speed-field: orbs within a small circle of the pointer shed
          // their hold + advance faster, then resume the normal path (#9)
          let near = false;
          if (cursor.active) {
            const pos = sampleLane(laneOf(p), p.t).pt;
            near = Math.hypot((pos.x - curX) * IMG_ASPECT, pos.y - curY) < CURSOR_R;
          }
          if (p.phase === 0 && p.hold > 0) {
            p.hold = Math.max(0, p.hold - dt * (near ? 6 : 1));
            continue; // hangs glowing in the canopy before breaking loose
          }
          // canopy orbs advance in lane-normalised t (kept as fast as before);
          // blobs glide at a constant VISUAL speed, so the short trunk and the
          // long roots run at the same on-screen pace (no jump at the crown).
          const advance = (p.phase === 0 ? p.speed : p.speed / laneOf(p).len) * (near ? CURSOR_BOOST : 1);
          p.t += advance * dt;
        }

        // phase ends: flash expires -> die; canopy -> gather; trunk proof orb
        // bends into one root trail without merging or splitting again.
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          if (p.phase === 3) {
            if (p.age >= FLASH_DUR) particles.splice(i, 1);
            continue;
          }
          if (p.grow < 1 || p.t < 1) continue;
          if (p.phase === 0) {
            collectAtBucket(p);
            particles.splice(i, 1);
          } else if (p.phase === 1) {
            continueIntoRoot(p);
          } else {
            // reached a root tip -> flash "locked in to L1", then vanish
            p.phase = 3;
            p.t = 1;
            p.hold = 0;
            p.age = 0;
          }
        }

        // Release each canopy-base batch pocket independently. This makes lots
        // of visible L2 transactions compress into fewer proof orbs.
        for (const bucket of gatherBuckets) {
          while (bucket.count >= bucket.target && particles.length < MAX_PARTICLES) {
            const batchCount = bucket.target;
            const batchValue =
              bucket.count > 0 ? (bucket.value / bucket.count) * batchCount : batchCount;
            releaseBlob(bucket, batchCount, batchValue);
            bucket.count -= batchCount;
            bucket.value = Math.max(0, bucket.value - batchValue);
            bucket.target = nextTarget();
          }
          bucket.glow = Math.max(0, bucket.glow - dt / 0.9);
        }
        surge = Math.max(0, surge - dt / 1.4);
      } else if (!staticSeeded) {
        seedStatic();
        staticSeeded = true;
      }

      // ---- draw ----
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";

      const glowBoost = 1 + surge * 0.6;

      // a touch of softly-shimmering canopy leaves
      for (const lf of leaves) {
        const shimmer = moving ? 0.04 * Math.sin((now / 1000) * 1.1 + lf.phase) : 0;
        const a = Math.min(0.4, 0.06 + shimmer + lf.flash * 0.45);
        if (a > 0.02) {
          const lr = 8 + lf.flash * 12;
          ctx.globalAlpha = a;
          ctx.drawImage(glowAlt, oX + lf.x * dW - lr, oY + lf.y * dH - lr, lr * 2, lr * 2);
        }
        if (moving) lf.flash = Math.max(0, lf.flash - dt / 0.8);
      }
      ctx.globalAlpha = 1;

      // Three batch pockets at the canopy base: many little L2 tx lights gather
      // here before compressing into fewer, larger proof lights.
      for (const bucket of gatherBuckets) {
        if (bucket.count <= 0 && bucket.glow <= 0.01) continue;
        const fullness = Math.min(1, bucket.count / bucket.target);
        const lr = 5 + fullness * 7 + bucket.glow * 8;
        ctx.globalAlpha = Math.min(0.62, 0.05 + bucket.count * 0.026 + bucket.glow * 0.32);
        ctx.drawImage(glowCore, oX + bucket.x * dW - lr, oY + bucket.y * dH - lr, lr * 2, lr * 2);
        ctx.globalAlpha = Math.min(0.88, 0.18 + fullness * 0.52);
        ctx.fillStyle = `rgba(204,255,219,${ctx.globalAlpha})`;
        ctx.beginPath();
        ctx.arc(oX + bucket.x * dW, oY + bucket.y * dH, 0.7 + fullness * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      for (const p of particles) {
        const lane = laneOf(p);
        const s = sampleLane(lane, p.t);
        const tan = s.tan;
        // follow the baked, vein-snapped + smoothed lane directly — no per-frame
        // re-snap (that pulled beads across gaps to other veins, which read as a
        // jagged zig-zag and threw them far off the tree).
        const pt = s.pt;
        const x = oX + pt.x * dW;
        const y = oY + pt.y * dH;
        // current rendered size: grows from a seed up to the orb's random target
        const es = p.size * (0.12 + 0.88 * smooth01(p.grow));
        const rootPhase = p.phase === 2;

        // phase 3: a bright "locked in to L1" bloom that swells, then vanishes
        if (p.phase === 3) {
          const fl = clamp(p.age / FLASH_DUR, 0, 1);
          // quick rise, long slow fall — a dim brown-gold settle, not a bright pop (#8)
          const bloom = fl < 0.12 ? fl / 0.12 : Math.pow(1 - (fl - 0.12) / 0.88, 1.7);
          const rr = (7 + es * 4.5) * (1 + bloom * 1.8);
          ctx.globalAlpha = Math.min(0.7, 0.12 + bloom * 0.4);
          ctx.drawImage(glowGold, x - rr, y - rr, rr * 2, rr * 2);
          ctx.globalAlpha = bloom * 0.7;
          ctx.fillStyle = `rgba(236,206,150,${bloom * 0.7})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + es * 0.9 + bloom * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }

        // brightness: fade in (blobs stay bright all the way to the root tip)
        const life = Math.min(1, p.age / 0.4) * (moving ? 1 : 0.55);
        const rgbStr = p.alt ? ALT_RGB : CORE_RGB;

        // soft comet tail trailing behind the bead — only once it's moving
        if (p.grow >= 1 && p.hold <= 0) {
          const tl = Math.hypot(tan.x * dW, tan.y * dH) || 1;
          const ux = (tan.x * dW) / tl;
          const uy = (tan.y * dH) / tl;
          const tailLen = (9 + es * 7) * (rootPhase ? 1.08 : 1) * (1 + surge * 0.4);
          const tx2 = x - ux * tailLen;
          const ty2 = y - uy * tailLen;
          const grad = ctx.createLinearGradient(x, y, tx2, ty2);
          grad.addColorStop(0, `rgba(${rgbStr},${(rootPhase ? 0.54 : 0.62) * life})`);
          grad.addColorStop(1, `rgba(${rgbStr},0)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = (rootPhase ? 0.9 : 1) + es * (rootPhase ? 0.72 : 0.9);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx2, ty2);
          ctx.stroke();
        }

        // glow halo + core drawn as a slightly squashed, rotated ellipse so the
        // orbs read as organic sap droplets rather than perfect circles (#3)
        const r0 = p.r0 ?? 0.5;
        const sq = 0.8 + ((r0 * 7.13) % 1) * 0.4; // 0.8 .. 1.2 aspect
        const r = (3 + es * (rootPhase ? 2.55 : 3.2)) * glowBoost;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r0 * Math.PI);
        ctx.scale(sq, 1 / sq);
        ctx.globalAlpha = Math.min(1, (rootPhase ? 0.46 : 0.55) * life);
        ctx.drawImage(p.alt ? glowAlt : glowCore, -r, -r, r * 2, r * 2);
        ctx.globalAlpha = 1;
        // soft head — green-white core
        ctx.fillStyle = `rgba(206,255,224,${0.7 * life})`;
        ctx.beginPath();
        ctx.arc(0, 0, 0.8 + es * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      veinImg.onload = null;
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerLeave);
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#040a06",
          backgroundImage: `radial-gradient(85% 75% at 72% 32%, rgba(26,84,40,0.22), transparent 58%), url("${BG_SRC}")`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center, center",
          backgroundRepeat: "no-repeat, no-repeat",
          transform: `scale(${ZOOM})`,
          willChange: "transform",
        }}
      />
      {/* legibility vignette: darken the left (hero copy) and the edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, rgba(3,8,5,0.82) 0%, rgba(3,8,5,0.34) 34%, rgba(3,8,5,0) 60%)," +
            "radial-gradient(125% 125% at 50% 50%, transparent 55%, rgba(2,6,4,0.72))",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
