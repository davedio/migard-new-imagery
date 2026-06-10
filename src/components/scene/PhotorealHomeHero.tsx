"use client";

/* ============================================================
   PhotorealHomeHero — the HOME page hero backdrop.

   A photoreal world-tree PLATE (public/plates/hero-tree.jpg — a wide frame
   with the tree offset RIGHT, misty negative space LEFT, CONTINUOUS green
   bioluminescent veins up the trunk + branches and down into the roots, and a
   cobalt glow in the root hollow) with a live "sap" overlay so the hero feels
   alive and matches the photoreal How-It-Works tree.

   ── VEIN-RIDING SAP ORBS (the original StaticTreeHero engine, ported) ──
   This is the SAME engine as src/components/scene/StaticTreeHero.tsx, retargeted
   from the old hero PNG to this photoreal plate:

     · The plate is DRAWN INTO THE CANVAS (cover, offset-right, scroll-panned),
       so the image and the orbs live in ONE shared coordinate space — the orbs
       are glued to the painted tree and can never drift onto a generic band.
     · makeVeinField() samples the plate's GREEN/YELLOW lit vein pixels
       (getImageData on an offscreen downsample) → snapBright / keepOnTree.
     · buildTree(field) weaves canopy / trunk / root LANES anchored to those
       sampled veins (every vertex snapped onto a lit vein, then smoothed).
     · The particle system BORNs orbs at canopy leaf tips, GROWs them in place,
       then FLOWs them DOWN the branches → trunk → roots where they "lock in"
       (an L1 settlement flash). Bright-green luminous radial sprites with a
       white-green heart + a soft comet tail (#00ff66 / #33ff33).

   So the orbs visibly originate in the canopy and ride the tree's actual glowing
   veins all the way to the roots — NOT floating rain on a vertical band.

   ── SCROLL: TREE SCANS CANOPY → ROOTS ──
   The in-canvas plate's vertical framing + a gentle zoom are rAF-driven by the
   PAGE scroll progress (progressRef). The vein-field is sampled ONCE in the
   plate's intrinsic 0..1 space; every frame the plate AND the orbs are drawn
   through the SAME cover/pan/zoom transform, so the orbs stay on the veins as
   the tree scans down the page. A cobalt L1 wash (CSS) lifts at the roots.

   Reduced motion / motion-off / mobile (motionOn === false): the plate is drawn
   STATIC (no pan) and the orbs are a calm constellation sitting ON the sampled
   veins (no flow). DPR capped at 2; cheaper particle counts on mobile. rAF +
   refs only — no per-scroll React state.
   ============================================================ */

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { MOTION_SPEED } from "@/lib/motionConfig";

const PLATE_SRC = "/plates/hero-tree.jpg";

/* Intrinsic plate aspect (2600×1451) — used to mirror `cover` in the canvas and
   to scale x by aspect so on-screen lane lengths/speeds stay isotropic. */
const IMG_ASPECT = 2600 / 1451;

/* ---- scroll-pan framing (mirrors the old CSS --home-plate vars) ----
   The plate is drawn offset-RIGHT (tree in the right ~60%, clean left for copy).
   CHANGE 1 — the journey now BEGINS zoomed IN on the upper BRANCHES/canopy (you
   start up among the branches, larger/closer) and as the page scrolls it travels
   DOWN the trunk and eases the zoom OUT to land framed on the full root system.
   So top of page = tight zoom on the branch band; bottom = wider framing on the
   roots. The zoom eases off as we descend so no plate edge is ever revealed. */
const BG_POS_X = 0.86; // horizontal cover anchor — pushes the tree right
const BG_POS_X_WIDE = 0.82; // a touch less right on very wide viewports
const Y_TOP = 0.16; // vertical cover anchor at the canopy (page top)
const Y_BOTTOM = 0.96; // vertical cover anchor at the roots (page bottom)
const ZOOM_TOP = 1.14; // gentle zoom up top, room to pan down
const ZOOM_BOTTOM = 1.08; // ease the zoom at the roots (stays > 1 so the plate always covers — no edge reveal)

/* ============================================================
   TREE GEOMETRY in the plate's normalised 0..1 image space.

   Measured off hero-tree.jpg by sampling its green veins (see commit notes):
     · trunk column nx ≈ 0.745..0.764 (narrowest "neck" at y≈0.32..0.45),
     · canopy y ≈ 0.00..0.30 spreading x ≈ 0.51..0.93 (centroid ≈ 0.72),
     · branches gather to the trunk top (the "fork") around y ≈ 0.40,
     · roots begin to splay (the "crown") around y ≈ 0.60,
     · roots fan wide x ≈ 0.43..0.96 down to y ≈ 0.92.
   The orb lanes are then snapped onto the ACTUAL lit veins by the VeinField, so
   these are just seed waypoints — the painted tree decides the final path.
   ============================================================ */
const TRUNK_X = 0.752; // brightest continuous vertical vein column
const TRUNK_STRANDS = [-0.0036, -0.0013, 0.0013, 0.0036];
const DOME = { cx: 0.73, cy: 0.2, rx: 0.21, ry: 0.17 }; // canopy foliage spread
const FORK_Y = 0.4; // canopy base: branches gather to the trunk top
const CROWN_Y = 0.6; // lower trunk base: roots begin to splay
const L1_HOLLOW = { x: TRUNK_X - 0.018, y: 0.655 }; // cobalt Cardano/L1 hollow
const GATHER_NODES = [
  { x: TRUNK_X - 0.04, y: FORK_Y - 0.012, strand: 0 },
  { x: TRUNK_X - 0.003, y: FORK_Y + 0.001, strand: 1 },
  { x: TRUNK_X + 0.034, y: FORK_Y - 0.009, strand: 3 },
] as const;

/* Particle colour — luminescent green to match the vein glow (same as the
   original StaticTreeHero). Cobalt is left to the CSS root wash only. */
const PARTICLE_CORE = "#00ff66";
const PARTICLE_ALT = "#33ff33";

/* Tunables (ported from StaticTreeHero, trimmed for a CALM ambient home hero —
   far fewer lanes/particles than the data-driven How-It-Works track).

   TIME BASE: the frame loop multiplies dt by MOTION_SPEED (0.7) exactly ONCE
   at the rAF boundary, so every time/speed constant below is in "sim seconds"
   and runs at 0.7x wall-clock. Comments quote the EFFECTIVE (wall-clock)
   values where pacing matters. */
const FLASH_DUR = 1.2; // L1 settlement bloom length (sim-s) — EFFECTIVE ~1.7s: a soft charge-and-decay, no longer a blink
const GROW_MIN = 0.4;
const GROW_MAX = 1.0;
const GROW_FAST = 0.34;
const FIRST_GLOW_DELAY = 0.45;
const STARTUP_RAMP_SECONDS = 4.0;
const TRUNK_PACKET_VSPEED = 0.043; // image-height/sec (sim) — EFFECTIVE ~0.030: a deliberate, unhurried descent (was 0.052)
const TRUNK_PACKET_VSPEED_JIT = 0.0074; // scaled in proportion (EFFECTIVE ~0.005; was 0.009)
const L1_HOLLOW_ROUTE_CHANCE = 0.34; // some, not all, packets enter the blue L1 hollow

/* ── SETTLEMENT SEQUENCING ──
   At most this many root-tip blooms play at once; extra arrivals HOLD at the
   tip (fully blue-charged) until a slot frees, and each major root fan gets a
   cooldown — so settlement reads SEQUENCED, never popcorn. */
const MAX_CONCURRENT_BLASTS = 2;
const ROOT_SLOT_COOLDOWN = 1.4; // sim-s (EFFECTIVE ~2s) before the same root fan blooms again

/* ── QUEUED-ORB DRIFT at the batcher pockets ──
   The old per-frame sine wobble (1.8 rad/s) twitched like a pinball. Queued
   orbs now ride a SLOW orbital drift (0.7 rad/s sim ⇒ ~0.5 rad/s EFFECTIVE,
   small radius) and ease into their slot with a critically-damped spring —
   no instantaneous jumps, no direction reversals. Orbs glide. */
const QUEUE_ORBIT_W = 0.7; // rad/s (sim) orbital angular frequency
const QUEUE_ORBIT_R = 2.3; // px orbital radius
const QUEUE_SPRING = 26; // spring stiffness for the slot glide (critically damped)

/* ── BATCHER / SEQUENCER tunables ──
   Canopy orbs stay small and distributed, then temporarily queue in 3-5 local
   batcher pockets at the fork. Each pocket grows only modestly, holds for a
   beat, then releases individual packets in order down the vertical trunk. */
const BATCH_NODE_COUNT = 5;
const BATCH_NODE_COUNT_LITE = 3;
const BATCH_QUEUE_CAP = 5;
const BATCH_READY_MIN = 3;
const BATCH_READY_MAX = 4;
const BATCH_HOLD_MIN = 1.05;
const BATCH_HOLD_MAX = 1.75;
const BATCH_RELEASE_EVERY = 0.34; // sim-s between sequenced releases — EFFECTIVE ~0.49s (was 0.26)
const BATCH_RELEASE_JIT = 0.06;
const BATCH_NODE_X0 = TRUNK_X - 0.088;
const BATCH_NODE_X1 = TRUNK_X + 0.078;
const BATCH_NODE_Y = FORK_Y - 0.012;

/* ── INDIVIDUAL L1 BLAST tunables (the blue connection burst at a root tip) ── */
const BLAST_RING_R = 38; // px reach of the fast expanding blue shockwave ring
const BLAST_SPARK_R = 18; // px reach of the hot cyan-blue spark core

type Pt = { x: number; y: number };
type Lane = {
  poly: Pt[];
  width: number;
  len: number;
  gi?: number;
  ang?: number;
  high?: boolean;
  l1?: boolean;
};
type Tree = { canopy: Lane[]; trunk: Lane[]; roots: Lane[] };

// phase 0 = canopy orb (grows in place, then descends), 1 = sequenced trunk
// packet, 2 = root stream, 3 = "locked-in" L1 blast at a root tip.
type Particle = {
  phase: 0 | 1 | 2 | 3;
  seg: number;
  t: number;
  speed: number;
  size: number;
  grow: number;
  growRate: number;
  hold: number;
  alt: boolean;
  age: number;
  r0?: number;
  growDelay?: number;
  settled?: boolean; // static fallback: a calm BLUE orb resting at an L1 root tip
  xJit?: number; // small packet x offset so releases originate from their batcher
  l1Center?: boolean; // this packet routes through the blue Cardano/L1 hollow
};

type QueuedOrb = {
  size: number;
  alt: boolean;
  r0: number;
  sourceX: number;
  sourceY: number; // arrival point (image space) so the orb GLIDES into its slot
  age: number;
  order: number;
  // critically-damped slot-glide state: px offset from the pocket centre +
  // velocity. Initialised from the canopy arrival point on first draw so the
  // orb eases in — no instantaneous jump into the queue.
  ox: number;
  oy: number;
  ovx: number;
  ovy: number;
  oInit: boolean;
};

/* A small batcher pocket at the fork. It never absorbs into one giant sprite;
   it holds a capped queue of individual orbs, pulses modestly, then releases
   them FIFO down the trunk so sequencing reads visually. */
type BatchNode = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  queue: QueuedOrb[];
  age: number;
  hold: number;
  readyAt: number;
  releaseTimer: number;
  pulse: number;
  glow: number;
  sequence: number;
  ready: boolean;
};

type LeafNode = { x: number; y: number; phase: number; flash: number };

type VeinField = {
  snapBright: (p: Pt, radius?: number) => Pt;
  keepOnTree: (p: Pt, radius?: number) => Pt;
};

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
// lerp between two "r,g,b" strings (for the green→blue L1 charge on root orbs).
function mixRgb(a: string, b: string, t: number): string {
  const pa = a.split(",");
  const pb = b.split(",");
  const m = (i: number) =>
    Math.round(lerp(+pa[i], +pb[i], t));
  return `${m(0)},${m(1)},${m(2)}`;
}
const CORE_RGB = rgb(PARTICLE_CORE);
const ALT_RGB = rgb(PARTICLE_ALT);
/* L1 settlement blink palette — green L2 orb flips to Cardano BLUE when it
   connects to L1 at a root tip. Deep Cardano blue core, bright cyan-blue glow. */
const L1_CORE_RGB = rgb("#0033ad"); // Cardano blue (the settled L1 heart)
const L1_GLOW_RGB = rgb("#3aa0ff"); // bright cyan-blue halo at the connection
const L1_SPARK_RGB = rgb("#6fe0ff"); // hottest cyan-blue spark at the blink peak

/* Pre-mixed green→blue colour ramps (17 steps each) so the hot draw loop
   never rebuilds "r,g,b" strings via mixRgb per orb per frame — the per-frame
   string/parse work is hoisted to init (perf). */
const L1_MIX_STEPS = 16;
const L1_MIX_CORE: string[] = [];
const L1_MIX_ALT: string[] = [];

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth01 = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

// populate the green→blue ramps (here, after lerp/mixRgb are initialised)
for (let i = 0; i <= L1_MIX_STEPS; i++) {
  L1_MIX_CORE.push(mixRgb(CORE_RGB, L1_GLOW_RGB, i / L1_MIX_STEPS));
  L1_MIX_ALT.push(mixRgb(ALT_RGB, L1_GLOW_RGB, i / L1_MIX_STEPS));
}

/* ---- curve / vein-fitting helpers (ported verbatim from StaticTreeHero) ---- */
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

// 0 inside the vertical trunk y-band, smoothly → 1 in the canopy and roots.
function trunkDamp(y: number): number {
  const lo = FORK_Y - 0.02;
  const hi = CROWN_Y + 0.02;
  if (y <= lo || y >= hi) return 1;
  const mid = (lo + hi) / 2;
  const d = Math.abs(y - mid) / ((hi - lo) / 2);
  return d * d * (3 - 2 * d);
}

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

// Snap a woven lane onto the lit veins, then smooth — every vertex pulled to a
// painted vein so the path can never sit in a dark gap (the whole point).
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
function polyLen(poly: Pt[]): number {
  let L = 0;
  for (let i = 1; i < poly.length; i++) L += visualSegLen(poly[i - 1], poly[i]);
  return L || 1;
}

/* ============================================================
   buildTree — three vein-lane sets in the plate's normalised space. With a
   VeinField, lane ends are anchored to the brightest nearby vein and EVERY
   vertex is kept on the lit tree (ported from StaticTreeHero, lane counts cut
   for a calm ambient home hero).
   ============================================================ */
const BASE_CANOPY_LANES = 64;
const HIGH_CANOPY_EXTRA_LANES = 40;

function buildTree(lite: boolean, field?: VeinField): Tree {
  const anchor = field ? field.snapBright : (p: Pt) => p;
  const onTree = field ? field.keepOnTree : (p: Pt) => p;
  const crown: Pt = { x: TRUNK_X, y: CROWN_Y };

  // CANOPY: leaf tip on the dome → sweep in → fork. Snake-woven branches that
  // converge at the bottom of the canopy where orbs gather.
  const canopy: Lane[] = [];
  const baseN = lite ? Math.round(BASE_CANOPY_LANES * 0.6) : BASE_CANOPY_LANES;
  const highN = lite
    ? Math.round(HIGH_CANOPY_EXTRA_LANES * 0.6)
    : HIGH_CANOPY_EXTRA_LANES;
  const NC = baseN + highN;
  for (let i = 0; i < NC; i++) {
    const isHigh = i >= baseN;
    // RANDOM scatter across the crown (not a grid): random angle + depth, capped
    // so tips never reach the outer edge / sky. Snapped onto the nearest bright
    // vein so orbs RIDE the branches.
    const jAng = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const jRad = Math.abs(Math.sin(i * 78.233 + 2.1) * 43758.5453) % 1;
    const jW = Math.abs(Math.sin(i * 39.42 + 0.7) * 43758.5453) % 1;
    const ang = isHigh
      ? Math.PI * (0.18 + 0.64 * jAng)
      : Math.PI * (-0.02 + 1.04 * jAng);
    const rf = isHigh ? 0.54 + 0.22 * jRad : 0.3 + 0.52 * jRad;
    const leafGuess = {
      x: DOME.cx + Math.cos(ang) * DOME.rx * rf,
      y: DOME.cy - Math.sin(ang) * DOME.ry * rf,
    };
    const leaf = field
      ? onTree(
          anchor(leafGuess, isHigh ? 0.03 : 0.06),
          isHigh ? 0.032 : 0.065,
        )
      : {
          x: clamp(leafGuess.x, DOME.cx - DOME.rx * 0.85, DOME.cx + DOME.rx * 0.85),
          y: leafGuess.y,
        };
    const gi = Math.min(
      GATHER_NODES.length - 1,
      Math.max(
        0,
        Math.floor(((leaf.x - (DOME.cx - DOME.rx)) / (DOME.rx * 2)) * GATHER_NODES.length),
      ),
    );
    const gather = GATHER_NODES[gi];
    const forkInlet = {
      x: gather.x + TRUNK_STRANDS[i % TRUNK_STRANDS.length] * 0.3,
      y: gather.y + Math.sin(i * 1.7) * 0.003,
    };
    const mid = anchor(
      { x: lerp(leaf.x, gather.x, 0.6), y: lerp(leaf.y, gather.y, 0.62) },
      isHigh ? 0.018 : 0.03,
    );
    const base = catmullRom([leaf, mid, forkInlet], 14);
    const woven = snake(
      base,
      isHigh ? 0.0028 + jW * 0.0028 : 0.005 + jW * 0.004,
      1 + (i % 2),
      (i * 1.3) % (Math.PI * 2),
    );
    const onT = field
      ? fitToTree(woven, onTree, isHigh ? 0.014 : 0.024, 2)
      : smoothPoly(woven, 2);
    if (field) onT[0] = leaf; // pin birth point to the snapped vein tip
    canopy.push({
      poly: onT,
      width: isHigh
        ? clamp(0.32 + jW * 0.32, 0.28, 0.66)
        : clamp(0.55 + jW * 0.6, 0.45, 1.15),
      len: polyLen(onT),
      gi,
      ang,
      high: isHigh,
    });
  }

  // TRUNK: a few near-vertical parallel strands fork → crown. At constant x they
  // already sit on the painted trunk, so blobs drop almost dead-vertical.
  const trunk: Lane[] = TRUNK_STRANDS.map((off, si) => {
    const x = TRUNK_X + off;
    const node = GATHER_NODES.find((n) => n.strand === si);
    const startX = node ? node.x : x;
    const poly = catmullRom(
      [
        { x: startX, y: FORK_Y },
        { x: lerp(startX, x, 0.6), y: FORK_Y + 0.03 },
        { x, y: lerp(FORK_Y, CROWN_Y, 0.5) },
        { x, y: CROWN_Y },
      ],
      10,
    );
    return { poly, width: 1, len: polyLen(poly) };
  });

  // ROOTS: crown → splay → tip. Wide asymmetric fan (further left than right),
  // each tip snapped onto a painted root vein. The lower lanes stay calmer than
  // the canopy so packets read as sequenced settlement, not erratic wandering.
  const roots: Lane[] = [];
  const NR = lite ? 18 : 28;
  for (let i = 0; i < NR; i++) {
    const u = ((i + 0.5) / NR) * 2 - 1;
    const a = Math.abs(u);
    const j = Math.abs(Math.sin((i + 11) * 78.233) * 43758.5453) % 1;
    // tips reach lower toward the L1 zone — central roots plunge to ~0.96, the
    // wide flanking roots fan out a little higher. Snapped onto a painted vein.
    const tip = anchor(
      {
        x: clamp(TRUNK_X + (u < 0 ? u * 0.34 : u * 0.22), 0.42, 0.96),
        y: 0.8 + (1 - a) * 0.16 + j * 0.025,
      },
      0.05,
    );
    const gate = {
      x: lerp(crown.x, tip.x, 0.06),
      y: CROWN_Y + 0.05 + (1 - a) * 0.01,
    };
    const mid = anchor(
      {
        x: lerp(crown.x, tip.x, 0.38) + u * (0.008 + j * 0.01),
        y: lerp(CROWN_Y, tip.y, 0.62),
      },
      0.034,
    );
    const base = catmullRom([crown, gate, mid, tip], 14);
    const woven = snake(base, 0.0012 + a * 0.0014, 1, (i * 2.1 + 1) % (Math.PI * 2));
    const onT = field ? fitToTree(woven, onTree, 0.026, 2) : smoothPoly(woven, 3);
    roots.push({
      poly: onT,
      width: clamp(1.15 - a * 0.6, 0.5, 1.15),
      len: polyLen(onT),
    });
  }

  // Explicit Cardano/L1 hollow lanes. These are intentionally separate from the
  // normal green root fan: they enter the cobalt hole directly, but routing only
  // sends a minority of packets through them so the symbolism stays legible.
  const l1Count = lite ? 2 : 3;
  for (let i = 0; i < l1Count; i++) {
    const u = (i / (l1Count - 1)) * 2 - 1;
    const tip: Pt = {
      x: L1_HOLLOW.x + u * 0.012,
      y: L1_HOLLOW.y + Math.sin((i + 1) * 2.15) * 0.005,
    };
    const entry = field
      ? anchor(
          {
            x: TRUNK_X + u * 0.014,
            y: 0.625 + Math.abs(u) * 0.012,
          },
          0.026,
        )
      : {
          x: TRUNK_X + u * 0.014,
          y: 0.625 + Math.abs(u) * 0.012,
        };
    const approach: Pt = {
      x: lerp(entry.x, tip.x, 0.68),
      y: lerp(entry.y, tip.y, 0.72),
    };
    const base = catmullRom(
      [
        crown,
        { x: TRUNK_X + u * 0.004, y: CROWN_Y + 0.025 },
        entry,
        approach,
        tip,
      ],
      14,
    );
    let onT = field ? fitToTree(base, onTree, 0.024, 1) : smoothPoly(base, 3);
    onT = onT.map((p, idx) => {
      const t = idx / (onT.length - 1);
      const pull = smooth01((t - 0.58) / 0.42);
      return pull > 0 ? blendPt(p, tip, pull * 0.92) : p;
    });
    onT = smoothPoly(onT, 1);
    onT[onT.length - 1] = tip;
    roots.push({
      poly: onT,
      width: clamp(0.92 - Math.abs(u) * 0.16, 0.68, 0.92),
      len: polyLen(onT),
      l1: true,
    });
  }

  return { canopy, trunk, roots };
}

// Distance-based Catmull sample along a lane (ported from StaticTreeHero) —
// constant visual speed + a rolling curve through the snapped vertices.
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
  return { pt, tan };
}

// Luminous radial sprite (ported from StaticTreeHero.makeGlow), re-rastered
// at 192px to match the ~1.8x larger draw sizes (so nothing samples blurry),
// with a GENTLER alpha ramp — brighter through the mid-falloff, softer at the
// edge — so each orb reads as a deliberate light source, not a hard spark.
function makeGlow(rgbStr: string): HTMLCanvasElement {
  const S = 192;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, `rgba(${rgbStr},0.92)`);
  grd.addColorStop(0.16, `rgba(${rgbStr},0.62)`);
  grd.addColorStop(0.38, `rgba(${rgbStr},0.3)`);
  grd.addColorStop(0.68, `rgba(${rgbStr},0.1)`);
  grd.addColorStop(1, `rgba(${rgbStr},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  return c;
}

// White-green "heart" stamped at each orb's centre (ported from makeCore),
// re-rastered at 96px for the larger hearts, mid-stop eased out a touch.
function makeCore(): HTMLCanvasElement {
  const S = 96;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, "rgba(238,255,245,0.96)");
  grd.addColorStop(0.4, "rgba(178,255,208,0.48)");
  grd.addColorStop(1, "rgba(120,255,170,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  return c;
}

/* ============================================================
   makeVeinField — ported from StaticTreeHero. Downsamples the PLATE to a
   green-vein luminance grid (getImageData), then:
     · snapBright → brightest lit vein within a radius (anchors lane ends),
     · keepOnTree → nudge an off-tree point to the NEAREST lit vein.
   Keyed on the green/yellow bioluminescent veins (not generic brightness), so
   misty fog / rock / sky never pull the lanes off the painted tree.
   ============================================================ */
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
    // The tree sits in the RIGHT band of this plate — gate to it so the misty
    // mountains LEFT and the sky can't register as veins.
    const nearTree =
      nx > 0.44 &&
      nx < 0.99 &&
      ny > 0.0 &&
      ny < 0.96 &&
      Math.abs(nx - TRUNK_X) < 0.4;

    // Follow the green/yellow lit veins specifically, and require the pixel to be
    // meaningfully green-dominant so grey fog / rock highlights are rejected.
    vein[i] =
      nearTree && gg > 44 && vividGreen > 10
        ? vividGreen * 2.4 + yellowGreen * 0.8 + saturation * 0.18 + lum * 0.035
        : 0;
  }
  const at = (nx: number, ny: number) => {
    const x = clamp(Math.round(nx * sw), 0, sw - 1);
    const y = clamp(Math.round(ny * sh), 0, sh - 1);
    return vein[y * sw + x];
  };

  const MIN_L = 12;
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
        const score = l - 0.75 * Math.sqrt(dist2);
        if (score > best) {
          best = score;
          bx = x / sw;
          by = y / sh;
        }
      }
    }
    return { x: bx, y: by };
  };

  const MIN_ON = 6;
  const keepOnTree = (p: Pt, radius = 0.026): Pt => {
    if (at(p.x, p.y) >= MIN_ON) return p;
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

export default function PhotorealHomeHero({
  motionOn,
  progressRef,
}: {
  motionOn: boolean;
  /** smoothed 0..1 PAGE scroll progress (drives the canopy → roots descent) */
  progressRef: RefObject<number>;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // lite on coarse/small screens → cheaper lane + particle counts, static plate.
  const lite = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 720
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // fewer, larger orbs (was 220/520): each light should read as deliberate
    const MAX_PARTICLES = lite ? 130 : 300;

    /* ---- build the lanes (parametric first; re-snap once the plate loads) ---- */
    const makeLeaves = (t: Tree): LeafNode[] =>
      t.canopy.map((l, i) => ({
        x: l.poly[0].x,
        y: l.poly[0].y,
        phase: (i * 1.7) % (Math.PI * 2),
        flash: 0,
      }));

    let canopyW: number[] = [];
    let highCanopyIdx: number[] = [];
    let canopyWSum = 0;
    const computeWeights = () => {
      canopyW = tree.canopy.map((l) => 1.0 + l.width * 0.2 + (l.high ? 0.3 : 0));
      highCanopyIdx = tree.canopy.reduce<number[]>((acc, l, i) => {
        if (l.high) acc.push(i);
        return acc;
      }, []);
      canopyWSum = canopyW.reduce((s, w) => s + w, 0);
    };

    let tree = buildTree(lite);
    let leaves = makeLeaves(tree);
    computeWeights();

    /* ---- DRAW the plate INTO the canvas (the shared coordinate space) ----
       The image is decoded once; we draw it every frame through the same
       cover/pan/zoom transform we use for the orbs, so they can never drift. */
    const plateImg = new Image();
    let plateReady = false;
    // the static (motion-off) branch assigns this so we can redraw the calm
    // constellation the moment the plate decodes + its veins are sampled.
    let staticRedraw: (() => void) | null = null;
    plateImg.onload = () => {
      plateReady = true;
      try {
        const field = makeVeinField(plateImg);
        tree = buildTree(lite, field);
        leaves = makeLeaves(tree);
        computeWeights();
        if (!motionOn) {
          seedStatic(); // refresh the static constellation onto the snapped veins
          staticRedraw?.();
        }
      } catch {
        /* tainted/decode failure — keep the parametric tree */
      }
    };
    plateImg.src = PLATE_SRC;

    const glowCore = makeGlow(CORE_RGB);
    const glowAlt = makeGlow(ALT_RGB);
    // BLUE L1-settlement blink sprites: bright cyan-blue halo + a hot cyan spark
    // at the blink peak (the green→blue "connected to L1" flash at a root tip).
    const glowL1 = makeGlow(L1_GLOW_RGB);
    const glowL1Spark = makeGlow(L1_SPARK_RGB);
    const glowHeart = makeCore();

    let W = 0;
    let H = 0;
    let dpr = 1;
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

    /* ---- particle field state ---- */
    const particles: Particle[] = [];

    const freshReadyAt = () =>
      BATCH_READY_MIN +
      Math.floor(Math.random() * (BATCH_READY_MAX - BATCH_READY_MIN + 1));
    const freshHold = () =>
      BATCH_HOLD_MIN + Math.random() * (BATCH_HOLD_MAX - BATCH_HOLD_MIN);
    const makeBatchNodes = (): BatchNode[] => {
      const count = lite ? BATCH_NODE_COUNT_LITE : BATCH_NODE_COUNT;
      return Array.from({ length: count }, (_, i) => {
        const u = i / (count - 1);
        const jx = Math.sin((i + 1) * 18.13) * 0.009;
        const jy = Math.sin((i + 1) * 2.05) * 0.011 + (i % 2 ? 0.007 : -0.003);
        const homeX = lerp(BATCH_NODE_X0, BATCH_NODE_X1, u) + jx;
        const homeY = BATCH_NODE_Y + jy;
        return {
          x: homeX,
          y: homeY,
          homeX,
          homeY,
          vx: 0,
          queue: [],
          age: 0,
          hold: freshHold(),
          readyAt: freshReadyAt(),
          releaseTimer: BATCH_RELEASE_EVERY * (0.4 + Math.random() * 0.8),
          pulse: 0,
          glow: 0,
          sequence: 0,
          ready: false,
        };
      });
    };
    const batchNodes = makeBatchNodes();

    let spawnTimer = FIRST_GLOW_DELAY;
    let surge = 0;
    let staticSeeded = false;
    let runTime = 0;
    let focusAngle = Math.PI / 2;
    let openingBurstDone = false;
    let openingReleaseDone = false;

    const laneOf = (p: Particle): Lane =>
      p.phase === 0
        ? tree.canopy[p.seg]
        : p.phase === 1
          ? tree.trunk[p.seg]
          : tree.roots[p.seg];

    const recentBirths: number[] = [];
    const pickBaseCanopySeg = (): number => {
      if (canopyWSum <= 0) return (Math.random() * tree.canopy.length) | 0;
      let r = Math.random() * canopyWSum;
      for (let i = 0; i < canopyW.length; i++) {
        r -= canopyW[i];
        if (r <= 0) return i;
      }
      return (Math.random() * tree.canopy.length) | 0;
    };
    const birthDist = (a: number, b: number) => {
      const pa = tree.canopy[a]?.poly[0];
      const pb = tree.canopy[b]?.poly[0];
      if (!pa || !pb) return 1;
      return Math.hypot((pa.x - pb.x) * IMG_ASPECT, pa.y - pb.y);
    };
    const rememberBirth = (seg: number) => {
      recentBirths.push(seg);
      if (recentBirths.length > 18) recentBirths.shift();
      return seg;
    };
    const pickHighCanopySeg = (): number => {
      if (highCanopyIdx.length === 0) return pickBaseCanopySeg();
      if (recentBirths.length === 0)
        return rememberBirth(highCanopyIdx[(Math.random() * highCanopyIdx.length) | 0]);
      let best = highCanopyIdx[(Math.random() * highCanopyIdx.length) | 0];
      let bestScore = -Infinity;
      for (let tries = 0; tries < 6; tries++) {
        const idx = highCanopyIdx[(Math.random() * highCanopyIdx.length) | 0];
        let minDist = Infinity;
        for (const recent of recentBirths)
          minDist = Math.min(minDist, birthDist(idx, recent));
        const score = minDist + Math.random() * 0.012;
        if (score > bestScore) {
          bestScore = score;
          best = idx;
        }
      }
      return rememberBirth(best);
    };
    const pickCanopySeg = (): number => {
      if (Math.random() < 0.34) return pickHighCanopySeg();
      if (Math.random() < 0.2) return pickBaseCanopySeg();
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
    const spawnCanopy = (fast = false) => {
      if (particles.length >= MAX_PARTICLES) return;
      const seg = pickCanopySeg();
      const w = tree.canopy[seg].width;
      const sizeRoll = Math.random();
      const topSize =
        sizeRoll < 0.76
          ? 0.16 + Math.pow(Math.random(), 1.35) * 0.28
          : sizeRoll < 0.96
            ? 0.42 + Math.random() * 0.28
            : 0.72 + Math.random() * 0.28;
      const size = topSize * (0.72 + w * 0.3);
      const sizeN = clamp(size / 1.6, 0, 1);
      const growTime =
        (fast
          ? GROW_FAST * (0.7 + Math.random() * 0.6)
          : GROW_MIN + Math.random() * (GROW_MAX - GROW_MIN)) *
        (0.7 + sizeN * 0.9);
      const hold =
        (fast ? 0.1 + sizeN * 0.55 : 0.22 + sizeN * 1.05) *
        (0.55 + Math.random() * 0.65);
      particles.push({
        phase: 0,
        seg,
        t: 0,
        speed:
          (fast ? 1.75 : 1) * (0.18 + Math.random() * 0.12) * (1.15 - sizeN * 0.3),
        size,
        grow: 0,
        growRate: 1 / growTime,
        hold,
        alt: Math.random() < 0.5,
        age: 0,
        r0: Math.random(),
        growDelay: fast ? Math.random() * 0.06 : Math.random() * 0.26,
      });
      leaves[seg].flash = Math.min(1, leaves[seg].flash + 0.72);
    };

    // pick the trunk strand whose x is closest to a given img-space x (so the
    // sequenced packet starts under its batcher pocket).
    const trunkSegForX = (x: number): number => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < tree.trunk.length; i++) {
        const p0 = tree.trunk[i].poly[0];
        const d = Math.abs(p0.x - x);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const resetBatchNode = (node: BatchNode) => {
      node.age = 0;
      node.hold = freshHold();
      node.readyAt = freshReadyAt();
      node.releaseTimer = BATCH_RELEASE_EVERY * (0.65 + Math.random() * 0.6);
      node.ready = false;
      node.glow = Math.min(node.glow, 0.18);
    };

    const queueIntoBatch = (p: Particle, pt: Pt) => {
      let best: BatchNode | null = null;
      let bestScore = Infinity;
      for (const node of batchNodes) {
        const overflow = Math.max(0, node.queue.length - BATCH_QUEUE_CAP + 1);
        const d = Math.hypot((node.x - pt.x) * IMG_ASPECT, (node.y - pt.y) * 1.4);
        const score = d + node.queue.length * 0.012 + overflow * 4;
        if (score < bestScore) {
          bestScore = score;
          best = node;
        }
      }
      if (!best) return;
      if (best.queue.length >= BATCH_QUEUE_CAP) {
        best.ready = true;
        best.releaseTimer = Math.min(best.releaseTimer, 0.03);
        return;
      }
      const orb: QueuedOrb = {
        size: clamp(0.44 + p.size * 0.58, 0.46, 1.08),
        alt: p.alt,
        r0: p.r0 ?? Math.random(),
        sourceX: pt.x,
        sourceY: pt.y,
        age: 0,
        order: best.sequence++,
        // slot-glide state seeds from the arrival point on first draw
        ox: 0,
        oy: 0,
        ovx: 0,
        ovy: 0,
        oInit: false,
      };
      best.queue.push(orb);
      if (best.queue.length === 1) {
        best.age = 0;
        best.ready = false;
        best.hold = freshHold();
        best.readyAt = freshReadyAt();
      }
      best.homeX = lerp(best.homeX, pt.x, 0.06);
      best.glow = Math.min(0.72, best.glow + 0.14);
      best.pulse = Math.min(1, best.pulse + 0.34);
      if (best.queue.length >= best.readyAt) best.ready = true;
    };

    const releaseQueuedOrb = (node: BatchNode) => {
      const orb = node.queue.shift();
      if (!orb) return;
      if (particles.length < MAX_PARTICLES) {
        const lane = trunkSegForX(node.x);
        particles.push({
          phase: 1,
          seg: lane,
          t: 0,
          speed:
            TRUNK_PACKET_VSPEED +
            (Math.random() * 2 - 1) * TRUNK_PACKET_VSPEED_JIT,
          size: clamp(orb.size * (0.98 + Math.random() * 0.18), 0.5, 1.24),
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: orb.alt,
          age: 0,
          r0: orb.r0,
          xJit: clamp((node.x - TRUNK_X) * 0.5, -0.024, 0.024),
        });
      }
      node.pulse = Math.min(1, node.pulse + 0.45);
      node.glow = Math.min(0.72, node.glow + 0.18);
      surge = Math.max(surge, 0.06);
      if (node.queue.length === 0) resetBatchNode(node);
    };

    const splitRootIndices = () => {
      const normal: number[] = [];
      const l1: number[] = [];
      tree.roots.forEach((root, idx) => (root.l1 ? l1 : normal).push(idx));
      return { normal, l1 };
    };

    const rootAtFrac = (indices: number[], frac: number) => {
      if (!indices.length) return 0;
      const pos = clamp(Math.round(frac * (indices.length - 1)), 0, indices.length - 1);
      return indices[pos];
    };

    // Spread most streams across stable root lanes, while a controlled minority
    // deliberately enters the blue Cardano/L1 hollow through explicit center lanes.
    // Each major fan slot carries a COOLDOWN so consecutive packets fan out
    // across DIFFERENT roots — settlement blooms read sequenced, not popcorn.
    const MAJOR_ROOT_FRACS = [0.18, 0.3, 0.42, 0.58, 0.7, 0.82];
    const rootSlotNextFree = MAJOR_ROOT_FRACS.map(() => 0); // runTime timestamps
    let rootCursor = (Math.random() * MAJOR_ROOT_FRACS.length) | 0;
    let l1Cursor = 0;
    const rootIndexForPacket = (p: Particle) => {
      const { normal, l1 } = splitRootIndices();
      const seed = p.r0 ?? Math.random();
      if (l1.length && seed < L1_HOLLOW_ROUTE_CHANCE) {
        l1Cursor = (l1Cursor + 1 + Math.floor(seed * 3)) % l1.length;
        return l1[l1Cursor];
      }
      // walk the fan, preferring the first slot whose cooldown has expired;
      // if all are cooling, take the one that frees soonest.
      let pick = -1;
      for (let k = 0; k < MAJOR_ROOT_FRACS.length; k++) {
        const idx = (rootCursor + 1 + k) % MAJOR_ROOT_FRACS.length;
        if (rootSlotNextFree[idx] <= runTime) {
          pick = idx;
          break;
        }
      }
      if (pick < 0) {
        pick = 0;
        for (let k = 1; k < rootSlotNextFree.length; k++)
          if (rootSlotNextFree[k] < rootSlotNextFree[pick]) pick = k;
      }
      rootCursor = pick;
      rootSlotNextFree[pick] = runTime + ROOT_SLOT_COOLDOWN;
      const frac = MAJOR_ROOT_FRACS[pick] + (((seed * 13.37) % 1) - 0.5) * 0.028;
      return rootAtFrac(normal.length ? normal : tree.roots.map((_, idx) => idx), frac);
    };

    const routeIntoRoot = (p: Particle) => {
      p.phase = 2;
      p.seg = rootIndexForPacket(p);
      p.l1Center = !!tree.roots[p.seg]?.l1;
      p.t = Math.random() * 0.02;
      p.size = clamp(p.size * (0.84 + Math.random() * 0.18), 0.48, 1.06);
      p.speed =
        (TRUNK_PACKET_VSPEED +
          (Math.random() * 2 - 1) * TRUNK_PACKET_VSPEED_JIT) *
        1.06;
      p.age = Math.max(p.age, 0.32);
      p.xJit = 0;
      surge = Math.max(surge, 0.04);
    };

    // STATIC fallback (reduced-motion / mobile): a calm still version of the
    // story — canopy scatter, small batch queues, ordered trunk packets, and a
    // few settled blue root tips. No giant accumulation glow.
    function seedStatic() {
      particles.length = 0;
      for (const node of batchNodes) {
        node.queue.length = 0;
        node.age = 0.9;
        node.ready = true;
        node.pulse = 0.28;
        node.glow = 0.24;
        const qn = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < qn; i++)
          node.queue.push({
            size: 0.52 + Math.random() * 0.28,
            alt: i % 2 === 0,
            r0: Math.random(),
            sourceX: node.x,
            sourceY: node.y,
            age: 0.6 + i * 0.14,
            order: node.sequence++,
            ox: 0,
            oy: 0,
            ovx: 0,
            ovy: 0,
            oInit: true, // static seed sits directly in its slot (no glide-in)
          });
      }
      // a faint scatter of small canopy orbs (kept sparse on lite).
      const canopyStride = lite ? 3 : 2;
      for (let i = 0; i < tree.canopy.length; i += canopyStride)
        particles.push({
          phase: 0,
          seg: i,
          t: 0.55,
          speed: 0,
          size: 0.4 * (0.6 + tree.canopy[i].width * 0.6),
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: i % 2 === 0,
          age: 1,
        });
      // a few small sequenced packets already moving down the trunk.
      for (let i = 0; i < Math.min(4, tree.trunk.length); i++)
        particles.push({
          phase: 1,
          seg: i,
          t: 0.22 + i * 0.16,
          speed: 0,
          size: 0.82 + (i % 2) * 0.16,
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: i % 2 === 0,
          age: 1,
          r0: Math.random(),
          xJit: 0,
        });
      // a few root streams settled mid-root.
      const { normal, l1 } = splitRootIndices();
      const allRoots = tree.roots.map((_, idx) => idx);
      const staticNormalRoots = normal.length ? normal : allRoots;
      const fanRoots = tree.roots.length
        ? [0.22, 0.42, 0.62, 0.82].map((f) => rootAtFrac(staticNormalRoots, f))
        : [];
      for (let k = 0; k < fanRoots.length; k++)
        particles.push({
          phase: 2,
          seg: fanRoots[k],
          t: 0.55,
          speed: 0,
          size: 1.0,
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: k % 2 === 0,
          age: 1,
        });
      // a few static BLUE blasts RESTING at L1 root tips (the settled payoff).
      const restRoots = tree.roots.length
        ? Array.from(
            new Set([
              rootAtFrac(staticNormalRoots, 0.32),
              rootAtFrac(staticNormalRoots, 0.68),
              ...l1.slice(0, 2),
            ]),
          )
        : [];
      for (const ri of restRoots)
        particles.push({
          phase: 2,
          seg: ri,
          t: 0.965,
          speed: 0,
          size: 1.0,
          grow: 1,
          growRate: 0,
          hold: 0,
          alt: false,
          age: 1,
          settled: true,
          l1Center: !!tree.roots[ri]?.l1,
        });
    }

    /* ---- the shared cover/pan/zoom transform (plate + veins + orbs) ----
       Reads the scroll progress ref each frame (no per-scroll React state). */
    let cur = clamp(progressRef.current ?? 0, 0, 1);
    let vel = 0;
    const wide =
      typeof window !== "undefined" && window.matchMedia("(min-width: 1480px)").matches;
    const posX = wide ? BG_POS_X_WIDE : BG_POS_X;

    const computeCover = (dt: number) => {
      // critically-damped follow so the pan trails the scroll softly. Static
      // (motion-off / mobile): hold a calm mid framing, no spring.
      let e: number;
      if (!motionOn || lite) {
        e = lite ? 0.4 : 0.42;
        cur = e;
      } else {
        const target = clamp(progressRef.current ?? 0, 0, 1);
        const stiffness = 58;
        const damping = 2 * Math.sqrt(stiffness);
        const a = stiffness * (target - cur) - damping * vel;
        vel += a * dt;
        cur += vel * dt;
        cur = clamp(cur, 0, 1);
        e = smooth01(cur);
      }
      const bgPosY = lerp(Y_TOP, Y_BOTTOM, e);
      const bgZoom = lerp(ZOOM_TOP, ZOOM_BOTTOM, e);
      // cobalt L1 wash lifts over the final third (roots) — CSS reads this var.
      const settle = smooth01(clamp((cur - 0.6) / 0.4, 0, 1));
      stage.style.setProperty("--home-plate-settle", settle.toFixed(3));

      // mirror background-size: cover for the plate aspect
      const va = W / H;
      let coverW: number, coverH: number;
      if (va > IMG_ASPECT) {
        coverW = W;
        coverH = W / IMG_ASPECT;
      } else {
        coverH = H;
        coverW = H * IMG_ASPECT;
      }
      const dW = coverW * bgZoom;
      const dH = coverH * bgZoom;
      // background-position with the right-bias X anchor; transform-origin matches
      // the CSS (82% 50%) so the zoom pivots like the old plate did.
      const baseX = (W - coverW) * posX;
      const baseY = (H - coverH) * bgPosY;
      const oX = W * posX + (baseX - W * posX) * bgZoom;
      const oY = H / 2 + (baseY - H / 2) * bgZoom;
      return { oX, oY, dW, dH };
    };

    /* ============================================================
       FRAME
       ============================================================ */
    let raf = 0;
    let prev = performance.now();
    // scaled simulation clock — drives every ambient oscillator below so the
    // whole engine breathes at the same 0.7x pace (never use now/1000).
    let simNow = 0;
    // the soft green canopy bloom over the plate is rebuilt only when the
    // cover transform actually moves — idle frames reuse the gradient (perf).
    let plateBloom: CanvasGradient | null = null;
    let plateBloomKey = "";
    const frame = (now: number) => {
      // MOTION_SPEED is applied exactly ONCE here, at the rAF boundary: the
      // simulation (orb growth, spawn cadence, decays, oscillators) runs at
      // 0.7x wall-clock. The cover pan keeps the RAW dt — it follows live
      // user scroll, and slowing that spring would read as lag, not calm.
      const rawDt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const dt = rawDt * MOTION_SPEED;
      simNow += dt;
      const moving = motionOn;

      const { oX, oY, dW, dH } = computeCover(rawDt);

      /* ---- simulate ---- */
      if (moving) {
        staticSeeded = false;
        runTime += dt;
        focusAngle = Math.PI * 0.5 + Math.PI * 0.72 * Math.sin(simNow * 0.65);

        if (!openingBurstDone && runTime >= FIRST_GLOW_DELAY) {
          openingBurstDone = true;
          const burst = lite ? 6 : 12; // calmer opening (was 9/18)
          for (let i = 0; i < burst; i++) spawnCanopy(true);
          spawnTimer = 0.06;
        }
        if (!openingReleaseDone && runTime >= 2.4) {
          openingReleaseDone = true;
          for (const node of batchNodes) {
            if (node.queue.length >= 2) {
              node.ready = true;
              node.releaseTimer = Math.min(node.releaseTimer, 0.08 + Math.random() * 0.18);
            }
          }
        }

        // ambient canopy spawning — a deliberate drip: mostly SINGLE births,
        // ~0.42–0.62 sim-s apart ⇒ EFFECTIVE ~0.6–0.9s between spawns
        // (was every 0.17–0.34s with 1–4 orb clusters: too frantic).
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const ramp = Math.min(1, runTime / STARTUP_RAMP_SECONDS);
          const cluster = 1 + (Math.random() < 0.25 * ramp ? 1 : 0);
          for (let k = 0; k < cluster; k++) spawnCanopy(Math.random() < 0.12 + ramp * 0.1);
          const meanGap = 0.62 - ramp * 0.1; // 0.62 → 0.52 sim-s
          spawnTimer = meanGap * (0.8 + Math.random() * 0.4);
        }

        // grow in place, then advance along the current lane
        for (const p of particles) {
          p.age += dt;
          if (p.phase === 3) continue;
          if (p.phase === 0 && p.growDelay && p.age < p.growDelay) continue;
          if (p.grow < 1) {
            p.grow = Math.min(1, p.grow + p.growRate * dt);
            continue;
          }
          if (p.phase === 0 && p.hold > 0) {
            p.hold = Math.max(0, p.hold - dt);
            continue;
          }
          const advance = p.phase === 0 ? p.speed : p.speed / laneOf(p).len;
          p.t += advance * dt;
        }

        // batch pockets drift subtly, hold capped FIFO queues, then release one
        // sequenced packet at a time down the vertical trunk lanes.
        for (const node of batchNodes) {
          const busy = node.queue.length > 0;
          if (busy) {
            node.age += dt;
            for (const orb of node.queue) orb.age += dt;
            if (node.queue.length >= node.readyAt || node.age >= node.hold)
              node.ready = true;
            if (node.ready) {
              node.releaseTimer -= dt;
              if (node.releaseTimer <= 0) {
                releaseQueuedOrb(node);
                node.releaseTimer =
                  BATCH_RELEASE_EVERY +
                  (Math.random() * 2 - 1) * BATCH_RELEASE_JIT;
              }
            }
          } else {
            node.age = 0;
            node.ready = false;
          }
          node.vx += (node.homeX - node.x) * 7 * dt;
          node.vx *= 0.88;
          node.x += node.vx * dt;
          node.y = lerp(node.y, node.homeY + (busy ? 0.004 : 0), 0.045);
          node.glow = Math.max(0, node.glow - dt / 1.2);
          node.pulse = Math.max(0, node.pulse - dt / 0.42);
        }

        // phase transitions: canopy → batch queue; trunk packet → root lane;
        // root tip → individual L1 settlement bloom (capped + sequenced).
        let activeBlasts = 0;
        for (const p of particles)
          if (p.phase === 3 && p.age < FLASH_DUR * 0.7) activeBlasts++;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          if (p.phase === 3) {
            if (p.age >= FLASH_DUR) particles.splice(i, 1);
            continue;
          }
          if (p.grow < 1 || p.t < 1) continue;
          if (p.phase === 0) {
            const end = sampleLane(tree.canopy[p.seg], 1).pt;
            queueIntoBatch(p, end);
            particles.splice(i, 1);
          } else if (p.phase === 1) {
            routeIntoRoot(p);
          } else {
            // stagger settlement: only MAX_CONCURRENT_BLASTS blooms at once —
            // extra arrivals HOLD at the tip, fully blue-charged, until a
            // slot frees, so the payoff reads sequenced rather than popcorn.
            if (activeBlasts >= MAX_CONCURRENT_BLASTS) {
              p.t = 0.9999;
              continue;
            }
            activeBlasts++;
            p.phase = 3;
            p.t = 1;
            p.hold = 0;
            p.age = 0;
          }
        }

        surge = Math.max(0, surge - dt / 1.4);
      } else if (!staticSeeded) {
        seedStatic();
        staticSeeded = true;
      }

      /* ---- draw ---- */
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1) the photoreal plate, drawn IN-CANVAS through the shared transform so
      //    the orbs are glued to it. Behind everything (source-over).
      ctx.globalCompositeOperation = "source-over";
      if (plateReady) {
        ctx.drawImage(plateImg, oX, oY, dW, dH);
      } else {
        ctx.fillStyle = "#050b08";
        ctx.fillRect(0, 0, W, H);
      }

      // light grade to match the old CSS filter (contrast/saturate/brightness).
      // a soft green canopy bloom + an overall lift, screen-blended. The
      // gradient is cached and only rebuilt when the cover transform moves
      // ≥1px (idle frames skip the per-frame createRadialGradient — perf).
      ctx.globalCompositeOperation = "screen";
      const bloomKey = `${oX | 0},${oY | 0},${dW | 0}`;
      if (!plateBloom || bloomKey !== plateBloomKey) {
        plateBloomKey = bloomKey;
        plateBloom = ctx.createRadialGradient(
          oX + 0.72 * dW,
          oY + 0.26 * dH,
          0,
          oX + 0.72 * dW,
          oY + 0.26 * dH,
          dW * 0.4,
        );
        plateBloom.addColorStop(0, "rgba(26,84,40,0.18)");
        plateBloom.addColorStop(1, "rgba(26,84,40,0)");
      }
      ctx.fillStyle = plateBloom;
      ctx.fillRect(0, 0, W, H);

      // 2) the sap engine — orbs ride the SAME transform as the plate.
      ctx.globalCompositeOperation = "lighter";
      const glowBoost = 1 + surge * 0.6;

      // softly shimmering canopy leaf glints at the vein tips
      // (1.1 rad/s sim ⇒ ~0.77 rad/s EFFECTIVE — ambient-breathing band)
      for (const lf of leaves) {
        const shimmer = moving ? 0.04 * Math.sin(simNow * 1.1 + lf.phase) : 0;
        const a = Math.min(0.4, 0.05 + shimmer + lf.flash * 0.45);
        if (a > 0.02) {
          const lr = 9 + lf.flash * 13; // a touch larger to match the bigger orbs
          ctx.globalAlpha = a;
          ctx.drawImage(glowAlt, oX + lf.x * dW - lr, oY + lf.y * dH - lr, lr * 2, lr * 2);
        }
        if (moving) lf.flash = Math.max(0, lf.flash - dt / 0.8);
      }
      ctx.globalAlpha = 1;

      // BATCHER POCKETS: capped queues of individual small orbs. They bunch for
      // a beat, pulse modestly, then release FIFO. No accumulated white slab.
      for (const node of batchNodes) {
        const q = node.queue.length;
        if (q === 0 && node.pulse <= 0.02) continue;
        const cx = oX + node.x * dW;
        const cy = oY + node.y * dH;
        const pulse = smooth01(node.pulse);
        const ready = node.ready ? 1 : 0;

        const haloR = (16 + q * 3.4) * (1 + pulse * 0.12); // ~1.5x to wrap the larger orbs
        ctx.globalAlpha = Math.min(0.3, 0.05 + q * 0.024 + node.glow * 0.1);
        ctx.drawImage(glowCore, cx - haloR, cy - haloR, haloR * 2, haloR * 2);

        if (q > 1) {
          ctx.globalAlpha = 0.13 + ready * 0.08;
          ctx.strokeStyle = `rgba(${ready ? ALT_RGB : CORE_RGB},${ctx.globalAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx - 7, cy + 8);
          ctx.lineTo(cx + 7, cy - 8);
          ctx.stroke();
          if (ready) {
            ctx.globalAlpha = 0.16 + pulse * 0.12;
            ctx.strokeStyle = `rgba(${ALT_RGB},${ctx.globalAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.arc(cx, cy, haloR * 0.48, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        for (let i = 0; i < q; i++) {
          const orb = node.queue[i];
          const row = Math.floor(i / 2);
          const side = i % 2 === 0 ? -1 : 1;
          const wobble =
            Math.sin((now / 1000) * 1.8 + orb.r0 * 8 + i) * (moving ? 1.2 : 0.25);
          const sx = cx + side * (3.6 + row * 0.8) + wobble;
          const sy = cy - row * 5.2 + Math.cos(orb.r0 * 7 + i) * 1.3;
          const sr = 5.2 + orb.size * 4.15 + pulse * 1.35;
          const alpha = Math.min(0.78, 0.42 + orb.age * 0.16 + ready * 0.08);
          ctx.globalAlpha = alpha;
          ctx.drawImage(orb.alt ? glowAlt : glowCore, sx - sr, sy - sr, sr * 2, sr * 2);
          const cr = Math.min(5.0, 1.55 + orb.size * 1.75);
          ctx.globalAlpha = Math.min(0.66, alpha * 0.62);
          ctx.drawImage(glowHeart, sx - cr, sy - cr, cr * 2, cr * 2);
        }
        ctx.globalAlpha = 1;
      }

      // the orbs themselves — follow the baked, vein-snapped lanes
      for (const p of particles) {
        const lane = laneOf(p);
        const s = sampleLane(lane, p.t);
        const tan = s.tan;
        const pt = s.pt;
        // a sequenced packet carries a small x-bias from its batcher pocket,
        // easing back onto the trunk strand as it descends.
        const xOff = p.xJit ? p.xJit * Math.max(0, 1 - p.t * 1.15) : 0;
        const x = oX + (pt.x + xOff) * dW;
        const y = oY + pt.y * dH;
        const es = p.size * (0.12 + 0.88 * smooth01(p.grow));
        const rootPhase = p.phase === 2;

        // phase 3: the BLUE "connected to L1 / settled" BLINK at a root tip.
        // The orb's green core flips to Cardano blue with a short, satisfying
        // pulse: a hot cyan-blue spark + an expanding ring at the peak, settling
        // to a deep blue heart that fades. Reads as a distinct L1 event.
        if (p.phase === 3) {
          const fl = clamp(p.age / FLASH_DUR, 0, 1);
          // Fast attack, faster fade: a blink/pop rather than a lingering orb.
          const attack = fl < 0.1 ? fl / 0.1 : 1;
          const decay = fl < 0.1 ? 1 : Math.pow(1 - (fl - 0.1) / 0.9, 2.35);
          const blm = attack * decay;
          // a couple of quick blue flickers on the way up sell the "connect".
          const flick = fl < 0.24 ? 0.82 + 0.18 * Math.sin(fl * 78) : 1;
          // per-blast variety so each connection reads as INDIVIDUAL (size/timing
          // jitter keyed off the orb's stable r0) — not one uniform wash.
          const seed = p.r0 ?? 0.5;
          const blastScale = (p.l1Center ? 1.14 : 0.9) + ((seed * 5.17) % 1) * 0.35;
          // bright cyan-blue halo bloom
          const rr = (7 + es * 5) * (1 + blm * 2.45) * blastScale;
          ctx.globalAlpha = Math.min(0.88, blm * 0.64) * flick;
          ctx.drawImage(glowL1, x - rr, y - rr, rr * 2, rr * 2);
          // hottest cyan spark right at the blast peak
          if (blm > 0.25) {
            const sr = (4 + es * 3) * (0.6 + blm * 1.1) * blastScale;
            ctx.globalAlpha = Math.min(0.95, (blm - 0.25) * 1.15) * flick;
            ctx.drawImage(glowL1Spark, x - sr, y - sr, sr * 2, sr * 2);
          }
          // the RADIATING blue shockwave: an expanding ring that bursts outward on
          // the attack and fades — the distinct "connection" pop for this tip.
          if (fl < 0.5) {
            const ringT = fl / 0.5;
            const ringR =
              (4 + es * 2) + smooth01(ringT) * (BLAST_RING_R + es * 8) * blastScale;
            const ringA = Math.pow(1 - ringT, 1.35) * 0.72 * flick;
            ctx.globalAlpha = ringA;
            ctx.strokeStyle = `rgba(${L1_SPARK_RGB},${ringA})`;
            ctx.lineWidth = 2.0 * (1 - ringT) + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, ringR, 0, Math.PI * 2);
            ctx.stroke();
            // a second, fainter trailing ring for depth (still individual).
            const ring2 = ringR * 0.62;
            ctx.globalAlpha = ringA * 0.5;
            ctx.strokeStyle = `rgba(${L1_GLOW_RGB},${ringA * 0.5})`;
            ctx.lineWidth = 1.2 * (1 - ringT) + 0.4;
            ctx.beginPath();
            ctx.arc(x, y, ring2, 0, Math.PI * 2);
            ctx.stroke();
          }
          // Packets that enter the hollow get a tight inner blue entry ripple.
          if (p.l1Center && fl < 0.38) {
            const entryT = fl / 0.38;
            const entryA = Math.pow(1 - entryT, 1.55) * 0.58 * flick;
            ctx.globalAlpha = entryA;
            ctx.strokeStyle = `rgba(${L1_GLOW_RGB},${entryA})`;
            ctx.lineWidth = 1.6 * (1 - entryT) + 0.35;
            ctx.beginPath();
            ctx.arc(x, y, (5 + es * 2) + smooth01(entryT) * 18 * blastScale, 0, Math.PI * 2);
            ctx.stroke();
          }
          // a hot cyan radial flare at the very peak — emphasises the burst.
          if (blm > 0.55) {
            const fr = (BLAST_SPARK_R + es * 3) * blm * blastScale;
            ctx.globalAlpha = (blm - 0.55) * 0.9 * flick;
            ctx.drawImage(glowL1Spark, x - fr, y - fr, fr * 2, fr * 2);
          }
          // the blue heart fades fully out with the shockwave.
          const heartA = Math.min(0.9, blm * 0.86 * flick);
          ctx.globalAlpha = heartA;
          ctx.fillStyle = `rgba(${blm > 0.45 ? L1_SPARK_RGB : L1_CORE_RGB},${heartA})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + es * 1.0 + blm * 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }

        const life = Math.min(1, p.age / 0.4) * (moving ? 1 : 0.6);
        // green L2 stays dominant along branches/trunk/roots — but in the FINAL
        // stretch of a root lane the orb starts to CHARGE BLUE, foreshadowing the
        // L1 blink at the tip (a smooth green→blue lead-in to the settlement).
        // `settled` static orbs read fully blue (resting on L1).
        const nearL1 = p.settled
          ? 1
          : rootPhase && moving
            ? smooth01(clamp((p.t - 0.72) / 0.28, 0, 1))
            : 0;
        // tail colour blends green→blue as the orb charges toward L1.
        const baseRgb = p.alt ? ALT_RGB : CORE_RGB;
        const rgbStr = nearL1 > 0.01 ? mixRgb(baseRgb, L1_GLOW_RGB, nearL1) : baseRgb;

        // soft comet tail trailing behind the bead — only once it's moving (and
        // not for the parked `settled` rest orbs, which sit still on L1).
        if (p.grow >= 1 && p.hold <= 0 && !p.settled) {
          const trunkPacket = p.phase === 1;
          const tl = Math.hypot(tan.x * dW, tan.y * dH) || 1;
          const ux = (tan.x * dW) / tl;
          const uy = (tan.y * dH) / tl;
          const tailLen =
            (trunkPacket ? 5 + es * 4.2 : 8 + es * 6) *
            (rootPhase ? 1.02 : 1) *
            (1 + surge * 0.32) *
            (1 - nearL1 * 0.55);
          const tx2 = x - ux * tailLen;
          const ty2 = y - uy * tailLen;
          const grad = ctx.createLinearGradient(x, y, tx2, ty2);
          grad.addColorStop(0, `rgba(${rgbStr},${(rootPhase ? 0.54 : 0.62) * life})`);
          grad.addColorStop(1, `rgba(${rgbStr},0)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth =
            (trunkPacket ? 0.85 : rootPhase ? 0.9 : 1) +
            es * (trunkPacket ? 0.55 : rootPhase ? 0.72 : 0.82);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx2, ty2);
          ctx.stroke();
        }

        // glow halo + heart, drawn as a slightly squashed/rotated ellipse so the
        // orbs read as organic sap droplets rather than perfect circles.
        const r0 = p.r0 ?? 0.5;
        const sq = 0.8 + ((r0 * 7.13) % 1) * 0.4;
        const r = (3.4 + es * (rootPhase ? 2.55 : 3.25)) * glowBoost;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r0 * Math.PI);
        ctx.scale(sq, 1 / sq);
        const haloA = Math.min(1, (rootPhase ? 0.4 : 0.48) * life);
        // green halo (fades as the orb charges blue near the L1 tip)
        ctx.globalAlpha = haloA * (1 - nearL1);
        ctx.drawImage(p.alt ? glowAlt : glowCore, -r, -r, r * 2, r * 2);
        // blue halo blends in over the final root stretch
        if (nearL1 > 0.01) {
          ctx.globalAlpha = haloA * nearL1;
          ctx.drawImage(glowL1, -r, -r, r * 2, r * 2);
        }
        ctx.restore();
        const cr = Math.min(7.8, 1.6 + es * 1.95) * glowBoost;
        ctx.globalAlpha = Math.min(0.85, (0.42 + es * 0.4) * life);
        ctx.drawImage(glowHeart, x - cr, y - cr, cr * 2, cr * 2);
        // a faint blue core creeping in as it nears L1
        if (nearL1 > 0.01) {
          ctx.globalAlpha = Math.min(0.7, (0.3 + es * 0.4) * life) * nearL1;
          ctx.fillStyle = `rgba(${L1_GLOW_RGB},${ctx.globalAlpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.0 + es * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.globalCompositeOperation = "source-over";

      // static fallback draws once and stops the loop (no flow / twinkle).
      if (!moving) {
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    // kick off: animated runs a loop; static draws once (re-draw on resize and
    // once the vein-field is ready so the constellation lands on the veins).
    if (motionOn) {
      raf = requestAnimationFrame(frame);
    } else {
      const renderStaticOnce = () => frame(performance.now());
      staticRedraw = renderStaticOnce; // plate onload redraws onto the veins
      renderStaticOnce();
      const onResize = () => renderStaticOnce();
      window.addEventListener("resize", onResize);
      // belt-and-braces redraw in case onload fired before this branch ran.
      const tId = window.setTimeout(renderStaticOnce, 120);
      return () => {
        staticRedraw = null;
        window.removeEventListener("resize", onResize);
        window.clearTimeout(tId);
        plateImg.onload = null;
        ro.disconnect();
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      plateImg.onload = null;
      ro.disconnect();
    };
  }, [motionOn, lite, progressRef]);

  return (
    <div
      ref={stageRef}
      className={`home-hero-plate${motionOn ? "" : " home-hero-plate--still"}`}
      aria-hidden
    >
      {/* The photoreal plate is drawn INSIDE this canvas (shared coord space with
          the orbs), so they can never drift onto a generic band. */}
      <canvas ref={canvasRef} className="home-hero-plate__canvas" />
      {/* a low drifting mist over the roots — calm, motion-gated via CSS */}
      <div className="home-hero-plate__mist" />
      {/* left legibility scrim so the copy stays crisp over the frame */}
      <div className="home-hero-plate__scrim" />
      {/* cobalt L1 wash at the roots — lifts via --home-plate-settle on scroll */}
      <div className="home-hero-plate__l1" />
    </div>
  );
}
