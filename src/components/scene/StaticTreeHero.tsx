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
const mobileBgAnchorX = (width: number) =>
  width <= 420 ? 0.7 : width <= 720 ? 0.68 : 0.5;

// Geometry of the painted tree, read off the art in the PNG's normalised
// 0..1 space: a rounded canopy DOME, a short VERTICAL trunk right-of-centre,
// and a wide ROOT fan below it.
// Measured: x=0.725 is the brightest continuous vertical trunk column (the lit
// band is narrow, ~0.7225..0.7275), so strands hug it tightly and run dead
// vertical — blobs drop straight down a lit vein, never into dark bark.
const TRUNK_X = 0.725;
const TRUNK_STRANDS = [-0.0025, -0.0009, 0.0009, 0.0025];
const DOME = { cx: 0.72, cy: 0.305, rx: 0.185, ry: 0.175 }; // cx,cy = crown centre (silhouette ray origin); ry = top-weight reference (~apex)
const FORK_Y = 0.42; // canopy base: branches gather to the trunk top
const CROWN_Y = 0.615; // lower trunk base: roots begin to splay here
const GATHER_NODES = [
  { x: TRUNK_X - 0.046, y: FORK_Y - 0.011, strand: 0 },
  { x: TRUNK_X - 0.002, y: FORK_Y + 0.001, strand: 1 },
  { x: TRUNK_X + 0.042, y: FORK_Y - 0.008, strand: 3 },
] as const;

// Particle colour — luminescent green to match the vein glow.
const PARTICLE_CORE = "#00ff66"; // primary
const PARTICLE_ALT = "#33ff33"; // variation

// Tunables
const MAX_PARTICLES = 560;
// A random number of canopy orbs lump together into each trunk blob, so blob
// sizes vary with how many gathered while avoiding oversized root exits.
const GATHER_MIN = 13; // raised ~25% -> ~20% fewer (slightly bigger) blobs down the trunk
const GATHER_MAX = 20;
const FLASH_DUR = 1.5; // length of the "locked-in to L1" flash at a root tip — long, slow fade
// Canopy orbs are born tiny and GROW in place (slowly, randomised per orb)
// before they break onto their snake path down the tree.
const GROW_MIN = 0.5; // seconds to reach full size (ambient orb)
const GROW_MAX = 1.95; // wide range so orbs don't grow/break off in sync
const GROW_FAST = 0.55; // event-burst orbs grow quicker
// Blobs glide at a CONSTANT VISUAL speed (height/sec), arc-length-normalised so
// the short trunk and the long roots run at the same on-screen pace — no speed
// change at the crown. Slower than the darting canopy orbs.
const BLOB_VSPEED = 0.037; // height/sec, held from fork to the very root tip
const BLOB_VSPEED_JIT = 0.006; // tiny variance so some blobs catch up + merge
const MERGE_CAP = 4.2; // max blob size after merging

type Pt = { x: number; y: number };
type Lane = { poly: Pt[]; width: number; len: number; gi?: number }; // gi = which base-gather pocket (canopy only)
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
  growDelay?: number; // seconds to wait (tiny) before it begins growing — desyncs the field
  r0?: number; // stable per-orb random (0..1) -> slightly organic, non-circular shape
  swirl?: number; // remaining seconds of a hover-triggered spiral before the descent
  speedMul?: number; // descent speed multiplier (hover makes a clump drop a bit faster)
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
  hot: number; // 0..1 cursor-hover intensity (decays) — speeds + swirls its clump
};

// Snap helpers built from the loaded art (see makeVeinField).
type VeinField = {
  snapBright: (p: Pt, radius?: number) => Pt; // brightest vein within radius — anchors lane ends
  keepOnTree: (p: Pt, radius?: number) => Pt; // nudge an off-tree point to the nearest lit pixel
  // Walk OUT from (ox,oy) along `ang` and return the outermost real-foliage point
  // (pulled in by `inset`) — places a birth tip exactly on a canopy edge, never sky.
  silhouette: (ox: number, oy: number, ang: number, maxR?: number, inset?: number) => Pt;
  // Evenly-spread points across the whole canopy (one per occupied grid cell) —
  // birth tips sampled from here cover the full crown, far lobes included.
  canopyPoints: Pt[];
};

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
const CORE_RGB = rgb(PARTICLE_CORE);
const ALT_RGB = rgb(PARTICLE_ALT);
const FLASH_RGB = rgb("#c8964a"); // brown-gold for the L1 lock-in flash

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

  // CANOPY: a birth tip per spot across the WHOLE crown -> weave down to one of 3
  // base pockets where orbs gather -> drop the trunk. With the loaded art the tips
  // are one-per-grid-cell over the real leaf-blob (so the far lobes are covered,
  // which a trunk-centred radial fan can't reach); before it loads a parametric
  // fan stands in.
  const canopy: Lane[] = [];
  const FAN = 120;
  const tipSeeds: Pt[] =
    field && field.canopyPoints.length
      ? field.canopyPoints
      : Array.from({ length: FAN }, (_, k) => {
          const ang = Math.PI * (-0.06 + 1.12 * ((k + 0.5) / FAN));
          return {
            x: clamp(DOME.cx + Math.cos(ang) * DOME.rx, DOME.cx - DOME.rx * 0.92, DOME.cx + DOME.rx * 0.98),
            y: DOME.cy - Math.sin(ang) * DOME.ry,
          };
        });
  for (let i = 0; i < tipSeeds.length; i++) {
    const j = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const j2 = Math.abs(Math.sin(i * 78.233 + 1.3) * 43758.5453) % 1;
    const seed = tipSeeds[i];
    // tiny jitter so a tip never sits dead-centre of its cell
    const leaf: Pt = { x: seed.x + (j - 0.5) * 0.003, y: seed.y + (j2 - 0.5) * 0.003 };
    const sideX = seed.x;
    const a = clamp(Math.abs(leaf.x - DOME.cx) / DOME.rx, 0, 1); // edge-ness -> width + weave
    // Route to ONE of the 3 base pockets by which SIDE of the crown the tip sits,
    // so dots collect at 3 distinct spots at the canopy base, then drop the trunk.
    const gi = Math.min(
      GATHER_NODES.length - 1,
      Math.max(0, Math.floor(((sideX - (DOME.cx - DOME.rx)) / (DOME.rx * 2)) * GATHER_NODES.length)),
    );
    const gather = GATHER_NODES[gi];
    const forkInlet = {
      x: gather.x + TRUNK_STRANDS[i % TRUNK_STRANDS.length] * 0.3,
      y: gather.y + Math.sin(i * 1.7) * 0.003,
    };
    const mid = anchor({
      x: lerp(leaf.x, gather.x, 0.6),
      y: lerp(leaf.y, gather.y, 0.62),
    }, 0.028);
    const base = catmullRom([leaf, mid, forkInlet], 14);
    // gentle, low-frequency weave (organic flow, not a jagged wiggle)
    const woven = snake(base, 0.005 + a * 0.004, 1 + (i % 2), (i * 1.3) % (Math.PI * 2));
    const onT = field ? fitToTree(woven, onTree, 0.022, 2) : smoothPoly(woven, 2);
    if (field) onT[0] = leaf; // keep the birth point pinned to the leaf tip
    canopy.push({ poly: onT, width: clamp(1.1 - a * 0.6, 0.45, 1.1), len: polyLen(onT), gi });
  }

  // TRUNK: each strand STARTS at the gather pocket that feeds it (so a clump forms
  // there), slides in to the trunk's middle line, then drops dead-vertical into the
  // roots. Strands with no pocket just start on the centre line.
  const trunk: Lane[] = TRUNK_STRANDS.map((off, si) => {
    const x = TRUNK_X + off; // central vertical column
    const node = GATHER_NODES.find((n) => n.strand === si);
    const startX = node ? node.x : x;
    const poly = catmullRom(
      [
        { x: startX, y: FORK_Y },
        { x: lerp(startX, x, 0.6), y: FORK_Y + 0.03 }, // make their way to the middle line
        { x, y: lerp(FORK_Y, CROWN_Y, 0.5) },
        { x, y: CROWN_Y },
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
  const vein = new Float32Array(sw * sh); // bright lit veins — anchors the descending paths
  const green = new Uint8Array(sw * sh); // GREEN-DOMINANT tree pixels (excludes neutral storm-cloud)
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

    // Canopy SHAPE for edge tracing — keyed on GREEN-BIAS (how far green sits
    // above the average of red+blue). The whole leafy crown — even the dark
    // green-black lobes — suppresses BLUE, so it reads ~3-5 here; the neutral grey
    // storm-cloud reads ~0-1.7. That gap separates leaf from cloud even where the
    // foliage is nearly black. (Brightness or green-minus-brightest-channel both
    // failed: brightness swallowed the lit clouds, the other dropped the dark
    // leaves.) A flood-fill below then keeps only the crown connected to the
    // trunk, discarding stray green-tinted cloud specks. The y-floor trims the
    // hazy cloud line just above the painted canopy.
    const greenBias = gg - (r + b) / 2;
    // LOWER threshold so the dark upper foliage DOME is captured, not just the lit
    // veins — that dome is where the canopy tips live, and it was being excluded.
    // Connectivity + erosion below keep the neutral sky out; the left x-floor (0.55)
    // cuts the stray far-left cloud cluster; the high y-floor (0.12) reaches the top.
    green[i] =
      greenBias > 1.8 && gg > 11 && nx > 0.55 && nx < 0.885 && ny > 0.105 && ny < 0.55
        ? 1
        : 0;
  }

  // Keep only the canopy CONNECTED to the trunk. Flood-fill from a known tree
  // pixel over the green mask; disconnected green-tinted cloud specks are left
  // out, so a traced tip can never jump onto a cloud.
  const blob = new Uint8Array(sw * sh);
  {
    let seed = -1;
    const sx0 = Math.round(0.72 * sw);
    const sy0 = Math.round(0.34 * sh);
    for (let rr = 0; rr < 40 && seed < 0; rr++)
      for (let dy = -rr; dy <= rr && seed < 0; dy++)
        for (let dx = -rr; dx <= rr && seed < 0; dx++) {
          const x = sx0 + dx;
          const y = sy0 + dy;
          if (x >= 0 && x < sw && y >= 0 && y < sh && green[y * sw + x]) seed = y * sw + x;
        }
    if (seed >= 0) {
      const stack = [seed];
      blob[seed] = 1;
      while (stack.length) {
        const i = stack.pop() as number;
        const x = i % sw;
        const y = (i / sw) | 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const X = x + dx;
            const Y = y + dy;
            if (X < 0 || X >= sw || Y < 0 || Y >= sh) continue;
            const ni = Y * sw + X;
            if (!blob[ni] && green[ni]) {
              blob[ni] = 1;
              stack.push(ni);
            }
          }
      }
    }
  }

  // ERODE the canopy by a small margin so sampled birth tips sit strictly INSIDE
  // the foliage — never on the boundary, where a tip (or its glow) could read as
  // touching the sky. A pixel survives only if its whole RxR neighbourhood is leaf.
  const eroded = new Uint8Array(sw * sh);
  {
    const R = 2;
    for (let y = R; y < sh - R; y++) {
      for (let x = R; x < sw - R; x++) {
        if (!blob[y * sw + x]) continue;
        let ok = true;
        for (let dy = -R; dy <= R && ok; dy++)
          for (let dx = -R; dx <= R && ok; dx++)
            if (!blob[(y + dy) * sw + (x + dx)]) ok = false;
        if (ok) eroded[y * sw + x] = 1;
      }
    }
  }
  // Re-connect to the trunk: erosion can pinch a thin cloud-edge bridge in two, so
  // flood-fill the ERODED mask from the trunk and keep only that piece. Any island
  // the erosion split off the leaf line (the stray far-left cloud dots) is dropped.
  const inner = new Uint8Array(sw * sh);
  {
    let seed = -1;
    const sx0 = Math.round(0.72 * sw);
    const sy0 = Math.round(0.34 * sh);
    for (let rr = 0; rr < 60 && seed < 0; rr++)
      for (let dy = -rr; dy <= rr && seed < 0; dy++)
        for (let dx = -rr; dx <= rr && seed < 0; dx++) {
          const x = sx0 + dx;
          const y = sy0 + dy;
          if (x >= 0 && x < sw && y >= 0 && y < sh && eroded[y * sw + x]) seed = y * sw + x;
        }
    if (seed >= 0) {
      const stack = [seed];
      inner[seed] = 1;
      while (stack.length) {
        const i = stack.pop() as number;
        const x = i % sw;
        const y = (i / sw) | 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const X = x + dx;
            const Y = y + dy;
            if (X < 0 || X >= sw || Y < 0 || Y >= sh) continue;
            const ni = Y * sw + X;
            if (!inner[ni] && eroded[ni]) {
              inner[ni] = 1;
              stack.push(ni);
            }
          }
      }
    }
  }

  // Even spatial sampling of the (eroded) canopy for birth tips: one representative
  // pixel per occupied grid cell, so tips cover the WHOLE crown — including the wide
  // far lobes (the canopy is widest BELOW trunk-centre, where a radial fan barely
  // reaches). Row-major scan keeps them in spatial order for even striding.
  const canopyPoints: Pt[] = [];
  {
    const GX = 26;
    const GY = 22;
    const bx0 = 0.54;
    const bx1 = 0.89;
    const by0 = 0.11;
    const by1 = 0.46;
    const seen = new Uint8Array(GX * GY);
    for (let y = 0; y < sh; y++) {
      const ny = y / sh;
      if (ny < by0 || ny >= by1) continue;
      const cyc = Math.min(GY - 1, Math.floor(((ny - by0) / (by1 - by0)) * GY));
      for (let x = 0; x < sw; x++) {
        if (!inner[y * sw + x]) continue;
        const nx = x / sw;
        if (nx < bx0 || nx >= bx1) continue;
        const cxc = Math.min(GX - 1, Math.floor(((nx - bx0) / (bx1 - bx0)) * GX));
        const key = cyc * GX + cxc;
        if (seen[key]) continue;
        seen[key] = 1;
        canopyPoints.push({ x: nx, y: ny });
      }
    }
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

  const inBlob = (nx: number, ny: number) => {
    const x = clamp(Math.round(nx * sw), 0, sw - 1);
    const y = clamp(Math.round(ny * sh), 0, sh - 1);
    return blob[y * sw + x] === 1;
  };
  // March OUT from the crown centre and remember the FARTHEST connected-canopy
  // pixel along this ray — the real lit leaf tip in that direction. Dark gaps
  // between branches are simply passed over (we keep the farthest hit), and the
  // result is pulled in by `inset` so the orb sits on the leaf, not its edge.
  // Because only the trunk-connected canopy counts, a tip can never reach a cloud.
  const silhouette = (
    ox: number,
    oy: number,
    ang: number,
    maxR = 0.24,
    inset = 0.01,
  ): Pt => {
    const dx = Math.cos(ang);
    const dy = -Math.sin(ang);
    const ds = 0.0025;
    let lastR = 0;
    for (let r = ds; r <= maxR; r += ds) {
      const x = ox + dx * r;
      const y = oy + dy * r;
      if (x < 0 || x > 1 || y < 0 || y > 1) break;
      if (inBlob(x, y)) lastR = r;
    }
    const r = Math.max(0, lastR - inset);
    return { x: ox + dx * r, y: oy + dy * r };
  };

  return { snapBright, keepOnTree, silhouette, canopyPoints };
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
    let canopyWSum = 0;
    const computeWeights = () => {
      const top0 = DOME.cy - DOME.ry; // highest leaf y
      canopyW = tree.canopy.map((l) => {
        const top = clamp((FORK_Y - l.poly[0].y) / (FORK_Y - top0), 0, 1);
        const edge = clamp(Math.abs(l.poly[0].x - DOME.cx) / DOME.rx, 0, 1);
        // Strong pull to the TOP so the dots climb up and touch the crown (they were
        // sitting too low, down in the vein/branch structure), with some spread to
        // the outer edge so it isn't only the centre.
        return 0.6 + Math.pow(top, 1.4) * 2.4 + edge * 0.5 + l.width * 0.1;
      });
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
    const glowGold = makeGlow(FLASH_RGB);

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
      hot: 0,
    }));
    let spawnTimer = 0.05; // sporadic canopy-spawn countdown

    // Cursor in normalised art coords (set by a window listener; converted each
    // frame). Hovering a gather pocket swirls + speeds its clump down the trunk.
    const cursor = { px: -1, py: -1, active: false };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.px = e.clientX - rect.left;
      cursor.py = e.clientY - rect.top;
      cursor.active = true;
    };
    const onPointerLeave = () => {
      cursor.active = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerLeave, { passive: true });
    const HOVER_R = 0.05; // hover radius around a pocket, in art units
    let surge = 0; // settlement flash, decays
    let lastBatch = snapRef.current.l2.latestBatchId;
    let lastProof = snapRef.current.l2.latestProofStatus;
    let staticSeeded = false;
    let canopyPrimed = false;

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

    const pickCanopySeg = (): number => {
      let r = Math.random() * canopyWSum;
      for (let i = 0; i < canopyW.length; i++) {
        r -= canopyW[i];
        if (r <= 0) return i;
      }
      return (Math.random() * tree.canopy.length) | 0;
    };

    const bucketForCanopySeg = (seg: number): GatherBucket => {
      // Collect into the SAME pocket the lane was routed to (stored on the lane),
      // so the dots visibly stream into the 3 base spots they appear to flow toward.
      let idx = tree.canopy[seg]?.gi ?? 1;
      if (Math.random() < 0.12) {
        idx = clamp(idx + (Math.random() < 0.5 ? -1 : 1), 0, gatherBuckets.length - 1);
      }
      return gatherBuckets[idx];
    };

    // a small orb born at a (mostly top-of-canopy) leaf; it grows in place,
    // lingers glowing, then weaves down toward the fork.
    const spawnCanopy = (fast = false) => {
      if (particles.length >= MAX_PARTICLES) return;
      const seg = pickCanopySeg();
      const w = tree.canopy[seg].width;
      const growTime = fast
        ? GROW_FAST * (0.7 + Math.random() * 0.6)
        : GROW_MIN + Math.random() * (GROW_MAX - GROW_MIN);
      const hold = fast
        ? 0.2 + Math.random() * 0.8
        : 0.5 + Math.random() * 2.4;
      const sizeRoll = Math.random();
      const topSize =
        sizeRoll < 0.7
          ? 0.22 + Math.pow(Math.random(), 1.35) * 0.34
          : sizeRoll < 0.93
            ? 0.56 + Math.random() * 0.4
            : 1.0 + Math.random() * 0.62;
      particles.push({
        phase: 0,
        seg,
        t: 0,
        speed: (fast ? 1.5 : 1) * (0.135 + Math.random() * 0.085),
        size: topSize * (0.78 + w * 0.42),
        grow: 0,
        growRate: 1 / growTime,
        hold,
        alt: Math.random() < 0.5,
        age: 0,
        growDelay: fast ? Math.random() * 0.12 : Math.random() * 0.4,
        r0: Math.random(),
      });
      leaves[seg].flash = Math.min(1, leaves[seg].flash + 0.72);
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
        r0: Math.random(),
        // if the cursor is hovering this pocket, the clump swirls briefly then
        // drops the trunk a bit faster than its normal pace
        swirl: bucket.hot > 0.3 ? 0.45 + bucket.hot * 0.25 : 0,
        speedMul: bucket.hot > 0.3 ? 1.35 + bucket.hot * 0.35 : 1,
      });
      bucket.glow = 1;
    };

    const collectAtBucket = (p: Particle) => {
      const bucket = bucketForCanopySeg(p.seg);
      if (Math.random() < 0.06) {
        releaseBlob(bucket, 1, Math.max(0.45, p.size), true);
        return;
      }
      bucket.count += 1;
      bucket.value += Math.max(0.22, p.size);
      bucket.glow = Math.min(1, bucket.glow + 0.32 + p.size * 0.08);
    };

    const rootIndexForTrunk = (seg: number) => {
      const center = (tree.roots.length - 1) / 2;
      const offsets = [-3.2, -1.1, 1.1, 3.2];
      return clamp(
        Math.round(center + offsets[seg % offsets.length] + (Math.random() * 2 - 1) * 2.2),
        0,
        tree.roots.length - 1,
      );
    };

    const continueIntoRoot = (p: Particle) => {
      p.phase = 2;
      p.seg = rootIndexForTrunk(p.seg);
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
      const oX = (W - dW) * mobileBgAnchorX(W);
      const oY = (H - dH) / 2;

      // Hover: convert the cursor to art coords and warm any pocket it's over.
      const curX = cursor.active ? (cursor.px - oX) / dW : -1;
      const curY = cursor.active ? (cursor.py - oY) / dH : -1;
      for (const bucket of gatherBuckets) {
        const over =
          cursor.active &&
          Math.hypot((curX - bucket.x) * IMG_ASPECT, curY - bucket.y) < HOVER_R;
        bucket.hot = over
          ? Math.min(1, bucket.hot + dt * 5)
          : Math.max(0, bucket.hot - dt * 2.2);
        if (over) bucket.glow = Math.max(bucket.glow, 0.55);
      }

      if (moving) {
        staticSeeded = false;
        const activity = Math.max(0, Math.min(1, s.l1.txCountWindow / 100));
        if (!canopyPrimed) {
          for (let i = 0; i < 170; i++) spawnCanopy();
          // Dave likes the canopy DARK & blank for ~a second on load, THEN the orbs
          // bloom in. Give the initial fill a staggered grow-delay so nothing shows
          // for ~0.7s, then they fade in over the next second.
          for (const p of particles) {
            if (p.phase === 0) p.growDelay = 0.7 + Math.random() * 0.9;
          }
          canopyPrimed = true;
        }

        // event: new batch -> a small flurry of canopy orbs + nudge the lump
        if (s.l2.latestBatchId !== lastBatch) {
          lastBatch = s.l2.latestBatchId;
          for (let i = 0; i < 14; i++) spawnCanopy(true);
          gatherBuckets[(Math.random() * gatherBuckets.length) | 0].glow = 1;
        }
        // event: settlement confirmed -> brighter swell + force a blob to drop
        if (s.l2.latestProofStatus === "settled" && lastProof !== "settled") {
          surge = 1;
          for (let i = 0; i < 18; i++) spawnCanopy(true);
          for (const bucket of gatherBuckets) bucket.glow = Math.max(bucket.glow, 0.5);
        }
        lastProof = s.l2.latestProofStatus;

        // sporadic ambient canopy spawning: irregular gaps and small clusters,
        // with many more visible canopy points while each point keeps its pace
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const cluster = Math.random() < 0.3 ? 8 : Math.random() < 0.6 ? 5 : 3;
          for (let k = 0; k < cluster; k++) spawnCanopy();
          const meanGap = 0.06 + (1 - activity) * 0.12;
          spawnTimer = meanGap * (0.35 + Math.random() * 1.15);
        }

        // grow in place, then advance along the current segment (+ cursor repel)
        for (const p of particles) {
          p.age += dt;
          if (p.phase === 3) continue; // flashing at a root tip — stays put
          if (p.grow < 1) {
            // wait a tiny per-orb delay before growing, so the field doesn't all
            // swell + break off in unison
            if (p.age >= (p.growDelay ?? 0)) p.grow = Math.min(1, p.grow + p.growRate * dt);
            continue; // waiting or still growing — doesn't move yet
          }
          // is THIS canopy orb feeding a pocket the cursor is hovering?
          const hotHere =
            p.phase === 0 ? gatherBuckets[tree.canopy[p.seg]?.gi ?? 1]?.hot ?? 0 : 0;
          if (p.phase === 0 && p.hold > 0) {
            p.hold = Math.max(0, p.hold - dt * (1 + hotHere * 4)); // hovered: break off sooner
            continue; // hangs glowing in the canopy before breaking loose
          }
          // canopy orbs advance in lane-normalised t (kept as fast as before);
          // blobs glide at a constant VISUAL speed, so the short trunk and the
          // long roots run at the same on-screen pace (no jump at the crown).
          let advance = (p.phase === 0 ? p.speed : p.speed / laneOf(p).len) * (p.speedMul ?? 1);
          if (hotHere > 0.3) advance *= 1.5; // rush toward a hovered pocket
          if (p.swirl && p.swirl > 0) {
            p.swirl -= dt;
            advance *= 0.3; // crawl at the pocket while it spins, then release downward
          }
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
          // a hovered pocket fires its clump early so the swirl + faster drop feels
          // responsive to the cursor
          const effTarget =
            bucket.hot > 0.3 ? Math.max(3, Math.ceil(bucket.target * 0.45)) : bucket.target;
          while (bucket.count >= effTarget && particles.length < MAX_PARTICLES) {
            const batchCount = Math.min(bucket.count, effTarget);
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
        let x = oX + pt.x * dW;
        let y = oY + pt.y * dH;
        // hover swirl: a brief decaying spiral around the pocket before it descends
        if (p.swirl && p.swirl > 0) {
          const sp = clamp(p.swirl / 0.5, 0, 1); // 1 -> 0 as it unwinds
          const ang = (1 - sp) * Math.PI * 7;
          const rad = 16 * sp;
          x += Math.cos(ang) * rad;
          y += Math.sin(ang) * rad;
        }
        // current rendered size: grows from a seed up to the orb's random target
        const es = p.size * (0.12 + 0.88 * smooth01(p.grow));
        const rootPhase = p.phase === 2;

        // phase 3: a soft brown-GOLD "locked in to L1" bloom — rises quickly, then
        // fades out slowly, dimmer than before.
        if (p.phase === 3) {
          const fl = clamp(p.age / FLASH_DUR, 0, 1);
          // fast rise over the first ~12%, then a long slow fall for the rest
          const bloom = fl < 0.12 ? fl / 0.12 : Math.pow(1 - (fl - 0.12) / 0.88, 1.7);
          const rr = (6 + es * 3.6) * (1 + bloom * 2.2);
          ctx.globalAlpha = Math.min(0.6, 0.12 + bloom * 0.34); // dimmer halo
          ctx.drawImage(glowGold, x - rr, y - rr, rr * 2, rr * 2);
          ctx.globalAlpha = bloom * 0.5; // dimmer core
          ctx.fillStyle = `rgba(236,206,150,${bloom * 0.5})`; // warm gold core
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + es * 0.9 + bloom * 4, 0, Math.PI * 2);
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

        // glow halo + head, drawn as a slightly squashed + rotated ellipse per orb
        // (from its stable r0) so they read as organic blobs, not identical circles.
        const r = (3 + es * (rootPhase ? 2.55 : 3.2)) * glowBoost;
        const r0 = p.r0 ?? 0.5;
        const sq = 0.8 + ((r0 * 7.13) % 1) * 0.4; // 0.8 .. 1.2 aspect
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r0 * Math.PI);
        ctx.scale(sq, 1 / sq); // area-preserving — varies the shape, not the brightness
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
        className="static-tree-hero__bg"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#040a06",
          backgroundImage: `radial-gradient(85% 75% at 72% 32%, rgba(26,84,40,0.22), transparent 58%), url("${BG_SRC}")`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center, var(--static-tree-bg-position, 50% 50%)",
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
