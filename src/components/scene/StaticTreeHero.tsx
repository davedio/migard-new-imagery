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
     1. GATHER     — they lump together at the fork; once a (random)
                     number collect, they release as one BLOB — its size
                     set by how many gathered — that drops almost dead-
                     vertical down the trunk, fast.
     2. ROOTS      — at the root crown each blob keeps its size and picks
                     a random big root, travelling down the root vein.
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
const CROWN_Y = 0.49; // trunk base: roots begin to splay here

// Particle colour — luminescent green to match the vein glow.
const PARTICLE_CORE = "#00ff66"; // primary
const PARTICLE_ALT = "#33ff33"; // variation

// Tunables
const MAX_PARTICLES = 140;
// A random number of canopy orbs lump together into each trunk blob, so blob
// sizes vary (small..large) with how many gathered. A small target keeps the
// funnel quick (releases after only a few orbs collect).
const GATHER_MIN = 3;
const GATHER_MAX = 6;
const ROOT_SPLIT_MIN = 3;
const ROOT_SPLIT_MAX = 5;
const FLASH_DUR = 0.45; // length of the "locked-in to L1" flash at a root tip
// Canopy orbs are born tiny and GROW in place (slowly, randomised per orb)
// before they break onto their snake path down the tree.
const GROW_MIN = 0.9; // seconds to reach full size (ambient orb)
const GROW_MAX = 2.3;
const GROW_FAST = 0.55; // event-burst orbs grow quicker
// Blobs glide at a CONSTANT VISUAL speed (height/sec), arc-length-normalised so
// the short trunk and the long roots run at the same on-screen pace — no speed
// change at the crown. Slower than the darting canopy orbs.
const BLOB_VSPEED = 0.048; // height/sec, held from fork to the very root tip
const BLOB_VSPEED_JIT = 0.006; // tiny variance so some blobs catch up + merge
// As blobs descend the trunk they GATHER into fewer, even larger orbs.
const MERGE_CAP = 5.5; // max blob size after merging
const MERGE_DT = 0.05; // t-distance under which two trunk blobs fuse

type Pt = { x: number; y: number };
type Lane = { poly: Pt[]; width: number; len: number };
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
  alt: boolean;
  age: number;
};

type LeafNode = { x: number; y: number; phase: number; flash: number };

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
  const fork: Pt = { x: TRUNK_X, y: FORK_Y };
  const crown: Pt = { x: TRUNK_X, y: CROWN_Y };

  // CANOPY: leaf tip on the dome -> sweep in -> fork. Snake-woven branches that
  // all converge at the bottom of the canopy (the fork) where orbs gather.
  const canopy: Lane[] = [];
  const NC = 72;
  for (let i = 0; i < NC; i++) {
    const u = ((i + 0.5) / NC) * 2 - 1;
    const a = Math.abs(u);
    const j = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const ang = Math.PI * (-0.06 + 1.12 * ((i + 0.5) / NC)); // broad upper canopy
    const rf = 0.72 + 0.26 * j;
    const leaf = anchor({
      x: DOME.cx + Math.cos(ang) * DOME.rx * rf,
      y: DOME.cy - Math.sin(ang) * DOME.ry * rf,
    }, 0.035);
    const forkInlet = {
      x: TRUNK_X + TRUNK_STRANDS[i % TRUNK_STRANDS.length] * 0.65,
      y: FORK_Y + (Math.sin(i * 1.7) * 0.004),
    };
    const mid = anchor({
      x: lerp(leaf.x, fork.x, 0.6),
      y: lerp(leaf.y, fork.y, 0.62),
    }, 0.028);
    const base = catmullRom([leaf, mid, forkInlet], 14);
    // gentle, low-frequency weave (organic flow, not a jagged wiggle)
    const woven = snake(base, 0.005 + a * 0.004, 1 + (i % 2), (i * 1.3) % (Math.PI * 2));
    const onT = field ? fitToTree(woven, onTree, 0.022, 2) : smoothPoly(woven, 2);
    canopy.push({ poly: onT, width: clamp(1.1 - a * 0.6, 0.45, 1.1), len: polyLen(onT) });
  }

  // TRUNK: a few perfectly-vertical parallel strands, fork -> crown. NOT snapped
  // to veins (that kinked them sideways) — at constant x they already sit on the
  // painted trunk, so blobs drop almost dead-vertical into the root system.
  const trunk: Lane[] = TRUNK_STRANDS.map((off) => {
    const x = TRUNK_X + off;
    const poly = catmullRom(
      [
        { x, y: FORK_Y },
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
      y: 0.61 + (1 - a) * 0.28 + j * 0.025,
    }, 0.04);
    const mid = anchor({
      x: lerp(crown.x, tip.x, 0.48) + u * (0.012 + j * 0.014),
      y: lerp(CROWN_Y, tip.y, 0.5),
    }, 0.03);
    const base = catmullRom([crown, mid, tip], 14);
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

    // Spawn weights bias new orbs toward the TOP of the canopy (higher leaves).
    let canopyW: number[] = [];
    let canopyWSum = 0;
    const computeWeights = () => {
      const top0 = DOME.cy - DOME.ry; // highest leaf y
      canopyW = tree.canopy.map((l) => {
        const top = clamp((FORK_Y - l.poly[0].y) / (FORK_Y - top0), 0, 1);
        return 0.8 + top * 0.9 + l.width * 0.2; // active across the whole canopy
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

    let W = 0,
      H = 0,
      dpr = 1;
    const particles: Particle[] = [];
    let gather = 0; // canopy orbs accumulated at the fork, waiting to release
    const nextTarget = () =>
      GATHER_MIN + ((Math.random() * (GATHER_MAX - GATHER_MIN + 1)) | 0);
    let gatherTarget = nextTarget(); // how many to lump before THIS blob releases
    let gatherGlow = 0; // brightness of the lump forming at the fork
    let spawnTimer = 0.3; // sporadic canopy-spawn countdown
    let surge = 0; // settlement flash, decays
    let lastBatch = snapRef.current.l2.latestBatchId;
    let lastProof = snapRef.current.l2.latestProofStatus;
    let staticSeeded = false;

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

    // a small orb born at a (mostly top-of-canopy) leaf; it grows in place, then
    // weaves down toward the fork. Sizes stay random so orbs aren't uniform.
    const spawnCanopy = (fast = false) => {
      if (particles.length >= MAX_PARTICLES) return;
      const seg = pickCanopySeg();
      const w = tree.canopy[seg].width;
      const growTime = fast
        ? GROW_FAST * (0.7 + Math.random() * 0.6)
        : GROW_MIN + Math.random() * (GROW_MAX - GROW_MIN);
      particles.push({
        phase: 0,
        seg,
        t: 0,
        speed: (fast ? 1.5 : 1) * (0.135 + Math.random() * 0.085),
        size: (0.36 + Math.random() * 0.46) * (0.6 + w * 0.6),
        grow: 0,
        growRate: 1 / growTime,
        alt: Math.random() < 0.5,
        age: 0,
      });
      leaves[seg].flash = Math.min(1, leaves[seg].flash + 0.5);
    };

    // the gathered lump releases as a blob dropping SLOWLY down a trunk strand.
    // If a blob is still on the upper trunk, this release MERGES into it instead,
    // so blobs gather into fewer, even larger orbs as they descend.
    const releaseBlob = (gathered: number) => {
      const base = 1.25 + (gathered / GATHER_MAX) * 1.7;
      const addSize = base * (0.55 + Math.random() * 0.85); // wide spread: small..large
      // Only SOMETIMES merge into a blob still high on the trunk. Always-merging
      // funnelled everything into one big orb; merging ~45% of the time lets
      // small, medium and large blobs travel down together.
      if (Math.random() < 0.45) {
        let host: Particle | null = null;
        for (const p of particles)
          if (p.phase === 1 && p.t < 0.4 && (!host || p.t < host.t)) host = p;
        if (host) {
          host.size = Math.min(MERGE_CAP, Math.cbrt(host.size ** 3 + addSize ** 3));
          gatherGlow = 1;
          return;
        }
      }
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({
        phase: 1,
        seg: (Math.random() * tree.trunk.length) | 0,
        t: 0,
        speed: BLOB_VSPEED + (Math.random() * 2 - 1) * BLOB_VSPEED_JIT, // h/s, steady
        size: addSize,
        grow: 1,
        growRate: 0,
        alt: Math.random() < 0.5,
        age: 0,
      });
      gatherGlow = 1;
    };

    const rootFanIndices = (count: number): number[] => {
      const used = new Set<number>();
      const out: number[] = [];
      const len = tree.roots.length;
      const stride = len / (count + 1);
      for (let i = 0; i < count; i++) {
        let idx = Math.round(stride * (i + 1) + (Math.random() * 2 - 1) * 1.25);
        idx = clamp(idx, 0, len - 1);
        if (used.has(idx)) {
          for (let step = 1; step < len; step++) {
            const a = clamp(idx - step, 0, len - 1);
            const b = clamp(idx + step, 0, len - 1);
            if (!used.has(a)) {
              idx = a;
              break;
            }
            if (!used.has(b)) {
              idx = b;
              break;
            }
          }
        }
        used.add(idx);
        out.push(idx);
      }
      return out;
    };

    const spreadIntoRoots = (blob: Particle) => {
      const count = clamp(
        Math.round(ROOT_SPLIT_MIN + (blob.size / MERGE_CAP) * (ROOT_SPLIT_MAX - ROOT_SPLIT_MIN)),
        ROOT_SPLIT_MIN,
        ROOT_SPLIT_MAX,
      );
      const indices = rootFanIndices(count);
      const childSize = Math.max(0.95, blob.size / Math.sqrt(count));
      let added = 0;
      for (const seg of indices) {
        if (particles.length >= MAX_PARTICLES) break;
        const lane = tree.roots[seg];
        particles.push({
          phase: 2,
          seg,
          t: Math.random() * 0.035,
          speed: blob.speed * (0.94 + Math.random() * 0.12),
          size: childSize * (0.82 + lane.width * 0.22 + Math.random() * 0.16),
          grow: 1,
          growRate: 0,
          alt: Math.random() < 0.5,
          age: Math.max(blob.age, 0.4),
        });
        added++;
      }
      gatherGlow = Math.max(gatherGlow, added > 0 ? 0.7 : 0);
    };

    const seedStatic = () => {
      particles.length = 0;
      for (let i = 0; i < tree.canopy.length; i++)
        particles.push({ phase: 0, seg: i, t: 0.55, speed: 0, size: 0.6 * (0.6 + tree.canopy[i].width * 0.6), grow: 1, growRate: 0, alt: i % 2 === 0, age: 1 });
      for (let i = 0; i < tree.trunk.length; i++)
        particles.push({ phase: 1, seg: i, t: 0.5, speed: 0, size: 1.6, grow: 1, growRate: 0, alt: false, age: 1 });
      for (let i = 0; i < tree.roots.length; i++)
        particles.push({ phase: 2, seg: i, t: 0.5, speed: 0, size: 1.4, grow: 1, growRate: 0, alt: i % 2 === 0, age: 1 });
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

        // event: new batch -> a small flurry of canopy orbs + nudge the lump
        if (s.l2.latestBatchId !== lastBatch) {
          lastBatch = s.l2.latestBatchId;
          for (let i = 0; i < 6; i++) spawnCanopy(true);
          gather += 2;
        }
        // event: settlement confirmed -> brighter swell + force a blob to drop
        if (s.l2.latestProofStatus === "settled" && lastProof !== "settled") {
          surge = 1;
          for (let i = 0; i < 8; i++) spawnCanopy(true);
          gather += 3;
        }
        lastProof = s.l2.latestProofStatus;

        // sporadic ambient canopy spawning: irregular gaps and small clusters,
        // with many more visible canopy points while each point keeps its pace
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const cluster = Math.random() < 0.18 ? 3 : Math.random() < 0.42 ? 2 : 1;
          for (let k = 0; k < cluster; k++) spawnCanopy();
          const meanGap = 0.16 + (1 - activity) * 0.24;
          spawnTimer = meanGap * (0.35 + Math.random() * 1.25);
        }

        // grow in place, then advance along the current segment (+ cursor repel)
        for (const p of particles) {
          p.age += dt;
          if (p.phase === 3) continue; // flashing at a root tip — stays put
          if (p.grow < 1) {
            p.grow = Math.min(1, p.grow + p.growRate * dt);
            continue; // still growing at its birth spot — doesn't move yet
          }
          // canopy orbs advance in lane-normalised t (kept as fast as before);
          // blobs glide at a constant VISUAL speed, so the short trunk and the
          // long roots run at the same on-screen pace (no jump at the crown).
          p.t += (p.phase === 0 ? p.speed : p.speed / laneOf(p).len) * dt;
        }

        // merge trunk blobs that have come close together -> fewer, larger blobs
        for (let i = particles.length - 1; i >= 0; i--) {
          const a = particles[i];
          if (a.phase !== 1) continue;
          for (let j = i - 1; j >= 0; j--) {
            const b = particles[j];
            if (b.phase !== 1) continue;
            if (Math.abs(a.t - b.t) < MERGE_DT) {
              b.size = Math.min(MERGE_CAP, Math.cbrt(b.size ** 3 + a.size ** 3));
              b.t = Math.max(b.t, a.t);
              b.age = Math.max(b.age, a.age);
              particles.splice(i, 1);
              break;
            }
          }
        }

        // phase ends: flash expires -> die; canopy -> gather; trunk -> a random
        // root (keeping its size); root tip -> the locked-in flash.
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          if (p.phase === 3) {
            if (p.age >= FLASH_DUR) particles.splice(i, 1);
            continue;
          }
          if (p.grow < 1 || p.t < 1) continue;
          if (p.phase === 0) {
            gather += 1;
            gatherGlow = Math.min(1, gatherGlow + 0.22);
            particles.splice(i, 1);
          } else if (p.phase === 1) {
            particles.splice(i, 1);
            spreadIntoRoots(p);
          } else {
            // reached a root tip -> flash "locked in to L1", then vanish
            p.phase = 3;
            p.t = 1;
            p.age = 0;
          }
        }

        // release blobs from the gathered lump (random count -> random size)
        while (gather >= gatherTarget && particles.length < MAX_PARTICLES) {
          releaseBlob(gatherTarget);
          gather -= gatherTarget;
          gatherTarget = nextTarget();
        }
        gatherGlow = Math.max(0, gatherGlow - dt / 0.7);
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

      // the lump of light gathering at the bottom of the canopy
      if (gather > 0 || gatherGlow > 0.01) {
        const lr = 7 + (Math.min(1, gather / gatherTarget) + gatherGlow) * 9;
        ctx.globalAlpha = Math.min(0.6, 0.07 + gather * 0.05 + gatherGlow * 0.3);
        ctx.drawImage(glowCore, oX + TRUNK_X * dW - lr, oY + FORK_Y * dH - lr, lr * 2, lr * 2);
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
          const bloom = Math.sin(Math.PI * fl); // 0 -> 1 -> 0
          const rr = (7 + es * 4.5) * (1 + bloom * 2.6);
          ctx.globalAlpha = Math.min(1, 0.3 + bloom * 0.65);
          ctx.drawImage(glowCore, x - rr, y - rr, rr * 2, rr * 2);
          ctx.globalAlpha = bloom;
          ctx.fillStyle = `rgba(224,255,236,${bloom})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5 + es * 1.1 + bloom * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }

        // brightness: fade in (blobs stay bright all the way to the root tip)
        const life = Math.min(1, p.age / 0.4) * (moving ? 1 : 0.55);
        const rgbStr = p.alt ? ALT_RGB : CORE_RGB;

        // soft comet tail trailing behind the bead — only once it's moving
        if (p.grow >= 1) {
          const tl = Math.hypot(tan.x * dW, tan.y * dH) || 1;
          const ux = (tan.x * dW) / tl;
          const uy = (tan.y * dH) / tl;
          const tailLen = (9 + es * 7) * (rootPhase ? 1.45 : 1) * (1 + surge * 0.4);
          const tx2 = x - ux * tailLen;
          const ty2 = y - uy * tailLen;
          const grad = ctx.createLinearGradient(x, y, tx2, ty2);
          grad.addColorStop(0, `rgba(${rgbStr},${(rootPhase ? 0.76 : 0.62) * life})`);
          grad.addColorStop(1, `rgba(${rgbStr},0)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = (rootPhase ? 1.25 : 1) + es * (rootPhase ? 1.05 : 0.9);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx2, ty2);
          ctx.stroke();
        }

        // glow halo at the head (bigger for blobs)
        const r = (3 + es * (rootPhase ? 3.8 : 3.2)) * glowBoost;
        ctx.globalAlpha = Math.min(1, (rootPhase ? 0.64 : 0.55) * life);
        ctx.drawImage(p.alt ? glowAlt : glowCore, x - r, y - r, r * 2, r * 2);
        ctx.globalAlpha = 1;

        // soft head — green-white core
        ctx.fillStyle = `rgba(206,255,224,${0.7 * life})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + es * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      veinImg.onload = null;
      ro.disconnect();
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
