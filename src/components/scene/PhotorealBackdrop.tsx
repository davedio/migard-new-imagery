"use client";

/* ============================================================
   PhotorealBackdrop — the CONVERGENCE variant of the How It Works
   journey backdrop: the CINEMATIC look fused with the STORYTELLING
   per-stage beats. A live motion layer over an AI-generated photoreal
   tree PLATE so the frame matches the client's reference closely.

   ── SIGNATURE: RIDE THE TRANSACTION · CINEMATIC + STAGED STORY ──
   The scroll FOLLOWS one luminous transaction packet down the tree AND
   tells its life story. The descent is tied 1:1 to the five lifecycle
   chapters (the SAME thresholds the HUD ChapterLabels uses) and the
   camera DWELLS + ZOOMS on each stage's focal region as it becomes
   active, so each beat lands as its own distinct, up-close MOMENT:

     SUBMIT   (canopy)      tiny tx glints twinkle then fly INWARD to
                            coalesce into one packet. Camera holds the
                            canopy, gently zoomed.
     SEQUENCE (upper trunk) the scattered glints SNAP into an ordered
                            vertical QUEUE of ticks along the trunk.
     COMMIT   (mid trunk)   the queue COMPRESSES / bundles down and the
                            packet morphs round -> square BLOCK (batch).
     WATCH    (lower trunk) a gold challenge-window SCAN-LINE sweeps the
                            frame and watcher "eyes" blink on the branches.
     SETTLE   (roots / L1)  the block LANDS in the cobalt L1 bedrock with
                            a slow confirmation BLOOM + expanding rings.

   A small stage CAPTION (mini-icon + title + sub) tracks beside the
   packet and cross-fades on each chapter change — the step explains
   itself from the visuals alone.

   Two stacked, fixed, full-viewport layers (both portaled to <body>
   inside .scene-stage by the host, so they stay viewport-fixed under
   the smooth-scroll transform):

     1. THE PLATE — worldtree-tall.jpg (emerald canopy -> gnarled trunk
        -> roots over mossy rock with a COBALT L1 glow at the base). As
        the page scrolls DOWN, the plate PANS + ZOOMS canopy -> roots in
        FIVE eased dwells (one per stage), coupled to the packet so you
        ride it down to the cobalt L1 bedrock = settlement. A cinematic
        POST stack (ACES-ish grade, DOF, soft bloom, vignette, chromatic
        aberration, film grain) sits over the single plate.

     2. LIVE OVERLAYS — a single <canvas> sized to the viewport, drawn
        each rAF: the per-stage beats above, the RIDDEN PACKET (molten
        comet + long tapering wake), the REACTIVE NETWORK it ignites, the
        SETTLEMENT bloom, faint organic motes, a whisper of grain.
        Geometric ADA-diamond overlays are GONE.

   Driven by the SAME smoothed scroll `progressRef` the host feeds the
   scene, plus time. No per-scroll React state — pan, overlays, and the
   stage caption read/write refs in the rAF loop, so scrolling never
   re-renders React.

   Reduced motion / motion-off / mobile (motionOn === false): the plate
   is shown STATIC (a calm mid-trunk framing, no pan) and the canvas
   draws the network ONCE as a static constellation with the packet
   resting mid-trunk (no animation, wake, bloom, motes, or grain). The
   stage caption is hidden. Cheap, legible, no scroll hijack.
   ============================================================ */

import { useEffect, useMemo, useRef, type RefObject } from "react";

/* ---- deterministic RNG (so the network/motes are stable across mounts) */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/* brand palette (mirrored from globals.css) */
const GREEN = "59, 232, 99"; // --green-bright
const GOLD = "224, 163, 60"; // --gold-bright (the challenge bridge)
const COBALT = "111, 224, 255"; // brighter L1 cyan (Cardano L1 at the roots)

/* mix two "r, g, b" strings -> "r,g,b" (rounded), t in 0..1 */
function mixRGB(c0: string, c1: string, t: number): string {
  const a = c0.split(",").map((n) => parseFloat(n));
  const b = c1.split(",").map((n) => parseFloat(n));
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  return `${r}, ${g}, ${bl}`;
}

/* ================================================================
   LIFECYCLE STAGES — the spine of the story. Thresholds are kept in
   lockstep with ChapterLabels.chapterIndex so the canvas beats, the
   HUD, and the per-stage zoom all light up on the exact same scroll
   positions. `stageOf` returns the active index plus a 0..1 LOCAL
   progress within that stage, used to drive each beat's birth / peak /
   handoff AND the camera dwell+zoom on that stage's focal region.
   ================================================================ */
const STAGE_BOUNDS = [0, 0.14, 0.4, 0.58, 0.84, 1.0001];
/* The five stage KEYS, used to pick the on-scene marker's mini-icon. The full
   step copy (title / tag / description) lives in the HUD (ChapterLabels). */
const STAGE_CUES: { key: string }[] = [
  { key: "submit" },
  { key: "sequence" },
  { key: "commit" },
  { key: "watch" },
  { key: "settle" },
];
function stageOf(p: number): { idx: number; local: number } {
  for (let i = STAGE_CUES.length - 1; i >= 0; i--) {
    if (p >= STAGE_BOUNDS[i]) {
      const span = Math.max(1e-4, STAGE_BOUNDS[i + 1] - STAGE_BOUNDS[i]);
      return { idx: i, local: clamp((p - STAGE_BOUNDS[i]) / span) };
    }
  }
  return { idx: 0, local: clamp(p / STAGE_BOUNDS[1]) };
}

/* ================================================================
   PER-STAGE CAMERA FOCAL POINTS — the dwell+zoom mechanic.
   Each stage parks the camera on a specific band of the tree at a
   specific zoom, so you really SEE the action up close, then eases on
   to the next. `focY` = background-position-y target (% — canopy small,
   roots large); `scale` = plate zoom for that dwell. The pan loop walks
   between the CURRENT and NEXT stage's focal point using the stage's
   local progress (held near the focal point through the middle of the
   stage, transitioning over the last slice). Tall plate values; the
   wide fallback uses a gentler set.
   ================================================================ */
type Focal = { focY: number; scale: number };
const FOCALS_TALL: Focal[] = [
  { focY: 8, scale: 1.07 }, // SUBMIT   · canopy
  { focY: 32, scale: 1.11 }, // SEQUENCE · upper trunk
  { focY: 55, scale: 1.13 }, // COMMIT   · mid trunk
  { focY: 76, scale: 1.11 }, // WATCH    · lower trunk / bridge
  { focY: 97, scale: 1.06 }, // SETTLE   · roots / L1
];
const FOCALS_WIDE: Focal[] = [
  { focY: 26, scale: 1.04 },
  { focY: 40, scale: 1.06 },
  { focY: 56, scale: 1.08 },
  { focY: 70, scale: 1.06 },
  { focY: 82, scale: 1.03 },
];

/* Eased camera path: hold near the active stage's focal point for the
   first ~70% of the stage (the DWELL where the beat plays and breathes),
   then ease GENTLY to the next stage's focal point over the last ~30% (the
   TRAVEL). The longer dwell + later, shorter transition make each stage
   linger noticeably before the calm move to the next (client note: slower,
   more deliberate). Returns the interpolated {focY, scale}. */
function cameraAt(idx: number, local: number, focals: Focal[]): Focal {
  const here = focals[idx];
  const next = focals[Math.min(focals.length - 1, idx + 1)];
  // dwell then travel — eased so it's smooth, never jerky. The dwell now
  // holds through ~70% of the stage so the beat sits still longer.
  const travel = smooth(clamp((local - 0.7) / 0.3));
  return {
    focY: lerp(here.focY, next.focY, travel),
    scale: lerp(here.scale, next.scale, travel),
  };
}

/* ================================================================
   The PACKET PATH — a smooth vertical journey down the trunk band, in
   normalized viewport coords. The packet's screen Y is held near the
   middle of the viewport (the camera tracks it via the plate pan), but
   it sways gently left/right along the trunk centreline as it hops the
   branch network. progress 0 -> canopy entry, 1 -> root settlement.

   We sample the path as a function of journey progress `p` plus a small
   time-based sway so the comet reads as alive, not on rails.
   ================================================================ */
function packetPos(p: number, t: number, cx: number, spread: number) {
  // Screen-space vertical travel: enters from just above the top, rides
  // down to just past centre as it nears settlement — the plate pan does
  // the rest of the "descent". Eased so entry/landing feel intentional.
  const e = smooth(p);
  const y = lerp(0.16, 0.74, e);
  // Horizontal: follow the trunk centreline, narrowing toward the roots,
  // with an organic sway that eases out as it settles.
  const narrow = lerp(1.0, 0.18, e);
  const sway =
    (Math.sin(t * 0.9 + p * 7.0) * 0.045 + Math.sin(t * 1.7 + 1.3) * 0.018) *
    narrow *
    (1 - e * 0.8);
  const x = cx + sway * (spread / 0.2);
  return { x, y };
}

/* ================================================================
   Overlay model — built once, deterministically, in plate-relative
   normalized coords (0..1 across the viewport). The trunk of the tall
   plate sits roughly centre; the network hugs that band. Coords
   convert to px each frame against the live canvas size. We also pre-bake
   the SUBMIT glints (canopy sparks) and tag watcher "eyes" so those beats
   are stable across mounts.
   ================================================================ */
type Node = {
  x: number;
  y: number;
  r: number;
  phase: number;
  /** ignition level 0..1, raised as the packet passes, decays after */
  fire: number;
  /** is this node up on a branch (an eligible WATCH "eye") */
  watcher: boolean;
  /** per-watcher blink phase offset */
  blink: number;
};
type Edge = { a: number; b: number; fire: number };
type Mote = { x: number; y: number; vx: number; vy: number; s: number; sway: number; twk: number };
/** a tiny canopy spark that flies inward to form the packet at SUBMIT */
type Glint = { x: number; y: number; r: number; tw: number; ph: number };

type Model = {
  nodes: Node[];
  edges: Edge[];
  motes: Mote[];
  glints: Glint[];
  cx: number;
  spread: number;
};

function buildModel(wide: boolean): Model {
  const rand = mulberry32(20260608);

  // trunk centre column + spread, anchored to each plate's trunk centre-line.
  // Tall plate: trunk is essentially centred (slightly right). Wide plate:
  // tree pushed into the right third.
  const cx = wide ? 0.7 : 0.55;
  const spread = wide ? 0.16 : 0.2;

  // --- NODES: scattered down the trunk/canopy column, denser near the top
  // (canopy = lots of branch junctions) thinning toward the roots. ---
  const NODE_COUNT = 26;
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const ty = i / (NODE_COUNT - 1); // 0 top .. 1 bottom
    const localSpread = spread * lerp(1.2, 0.34, ty);
    const x = cx + (rand() - 0.5) * 2 * localSpread;
    const y = lerp(0.05, 0.94, ty) + (rand() - 0.5) * 0.035;
    // watcher "eyes" live in the upper-mid branch band and sit off the
    // trunk centreline (out on the limbs).
    const offTrunk = Math.abs(x - cx) > spread * 0.5;
    nodes.push({
      x,
      y,
      r: 1.8 + rand() * 2.4,
      phase: rand() * Math.PI * 2,
      fire: 0,
      watcher: ty > 0.12 && ty < 0.62 && offTrunk,
      blink: rand() * Math.PI * 2,
    });
  }

  // --- EDGES: connect each node to a couple of nearby nodes, biased
  // downward so the graph "flows" toward the roots. ---
  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    const order = nodes
      .map((n, j) => ({
        j,
        d:
          Math.hypot(n.x - nodes[i].x, (n.y - nodes[i].y) * 0.7) +
          (n.y < nodes[i].y ? 0.18 : 0), // penalise going up
      }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d);
    const links = 1 + Math.floor(rand() * 2); // 1..2 links
    for (let k = 0; k < links && k < order.length; k++) {
      const j = order[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: i, b: j, fire: 0 });
    }
  }

  // --- MOTES: minimal organic spores/pollen drifting through the trunk
  // band. Ambient only — the packet is the star. ---
  const motes: Mote[] = [];
  const moteCount = wide ? 12 : 16;
  for (let i = 0; i < moteCount; i++) {
    motes.push({
      x: cx + (rand() - 0.5) * 2 * (spread + 0.16),
      y: rand(),
      vx: (rand() - 0.5) * 0.01,
      vy: 0.012 + rand() * 0.022,
      s: 0.8 + rand() * 1.8,
      sway: rand() * Math.PI * 2,
      twk: 0.6 + rand() * 1.4,
    });
  }

  // --- GLINTS: tiny canopy tx-sparks scattered across the upper third.
  // At SUBMIT they twinkle then fly INWARD to coalesce into the packet. ---
  const glints: Glint[] = [];
  const glintCount = wide ? 14 : 18;
  for (let i = 0; i < glintCount; i++) {
    glints.push({
      x: cx + (rand() - 0.5) * 2 * (spread + 0.22),
      y: 0.04 + rand() * 0.26,
      r: 0.8 + rand() * 1.6,
      tw: 0.8 + rand() * 1.8,
      ph: rand() * Math.PI * 2,
    });
  }

  return { nodes, edges, motes, glints, cx, spread };
}

/* Inline SVG glyphs (data URIs) for the on-scene stage mini-icon, one per
   lifecycle stage. Stroked, currentColor-free (hard green so they read on
   the dark scrim); swapped imperatively on chapter change. Kept tiny. */
const ICON: Record<string, string> = {
  // Submit — a spark / tx burst
  submit:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#3be863' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3'/><circle cx='12' cy='12' r='2.4' fill='#3be863' stroke='none'/></svg>`,
    ),
  // Sequence — stacked / ordered lines
  sequence:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#3be863' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M8 6h12M8 12h12M8 18h12'/><circle cx='4' cy='6' r='1.4' fill='#3be863' stroke='none'/><circle cx='4' cy='12' r='1.4' fill='#3be863' stroke='none'/><circle cx='4' cy='18' r='1.4' fill='#3be863' stroke='none'/></svg>`,
    ),
  // Commit — a block / cube
  commit:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#3be863' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2.6l8 4.6v9.6l-8 4.6-8-4.6V7.2z'/><path d='M12 2.6v9.6M12 12.2l8-4.6M12 12.2l-8-4.6'/></svg>`,
    ),
  // Watch — an eye / shield
  watch:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#e0a33c' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z'/><circle cx='12' cy='12' r='2.7'/></svg>`,
    ),
  // Settle — an anchor (final settlement on Cardano L1)
  settle:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#6fe0ff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='4.5' r='2'/><path d='M12 6.5V21M5 12H3.5a8.5 8.5 0 0 0 17 0H19M8.5 9.5h7'/></svg>`,
    ),
};

export default function PhotorealBackdrop({
  progressRef,
  motionOn,
  wide,
}: {
  /** smoothed 0..1 journey progress (same ref the scene used) */
  progressRef: RefObject<number>;
  motionOn: boolean;
  /** true when the wide plate / gentler pan should be used */
  wide: boolean;
}) {
  const plateRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dofRef = useRef<HTMLDivElement>(null);
  // on-scene marker DOM refs (written imperatively from the rAF loop — no
  // React state). The detailed step copy now lives in the HUD; this marker is
  // just a per-stage mini-icon that tracks the packet so the focal action is
  // tagged on the tree without duplicating the HUD's text.
  const captionRef = useRef<HTMLDivElement>(null);
  const capIconRef = useRef<HTMLSpanElement>(null);
  // shared, rAF-smoothed pan progress so the canvas packet rides the EXACT
  // same eased descent as the plate (perfect coupling = no jitter, tracking
  // shot feel). Written by the plate-pan loop, read by the overlay loop.
  const panProgRef = useRef(clamp(progressRef.current ?? 0));
  const model = useMemo(() => buildModel(wide), [wide]);

  // ---- plate parallax pan + PER-STAGE ZOOM (rAF, ref-driven) ----
  useEffect(() => {
    const el = plateRef.current;
    const dof = dofRef.current;
    if (!el) return;
    // the settle var lives on the .plate-stage parent so the sibling
    // .plate-stage__grade (cobalt L1 wash) inherits it (vars don't cross
    // siblings, only descendants).
    const stage = el.parentElement;

    const focals = wide ? FOCALS_WIDE : FOCALS_TALL;

    // motion-off / reduced motion / mobile: calm static framing, no pan.
    if (!motionOn) {
      const e = 0.42;
      panProgRef.current = e;
      const cam = cameraAt(2, 0, focals); // park on the COMMIT mid-trunk focal
      el.style.setProperty("--plate-y", `${cam.focY}%`);
      el.style.setProperty("--plate-scale", "1.04");
      stage?.style.setProperty("--plate-settle", "0");
      if (dof) {
        dof.style.setProperty("--focus-y", "46%");
        dof.style.setProperty("--dof", "0");
      }
      return;
    }

    let raf = 0;
    let cur = panProgRef.current;
    let vel = 0; // velocity term for a critically-damped follow (no jitter)
    // separately-smoothed camera focal so the dwell+zoom eases between
    // stages instead of snapping at thresholds (buttery, never jerky).
    let camY = focals[0].focY;
    let camS = focals[0].scale;
    let lastT = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      const target = clamp(progressRef.current ?? 0);
      // critically-damped spring toward target: buttery, overshoot-free.
      // This is the SAME smoothed value the overlay packet reads, so the
      // plate descent and the packet are perfectly coupled. Softer stiffness
      // (client note: slower / calmer) so the pan trails the scroll with more
      // weight and settles unhurriedly instead of tracking it tightly.
      const stiffness = 64;
      const damping = 2 * Math.sqrt(stiffness); // critical
      const a = stiffness * (target - cur) - damping * vel;
      vel += a * dt;
      cur += vel * dt;
      cur = clamp(cur);
      panProgRef.current = cur;

      // PER-STAGE camera: dwell on the active stage's focal band + zoom,
      // then ease to the next. Eased target, then a soft follow so it never
      // jerks at a stage boundary.
      const st = stageOf(cur);
      const cam = cameraAt(st.idx, st.local, focals);
      // gentler frame-rate-independent ease (client note: slower / more
      // deliberate). A larger base = the focal trails its eased target with
      // more weight, so even the in-stage settle feels calm, never snappy.
      const follow = 1 - Math.pow(0.06, dt);
      camY += (cam.focY - camY) * follow;
      camS += (cam.scale - camS) * follow;

      el.style.setProperty("--plate-y", `${camY.toFixed(3)}%`);
      el.style.setProperty("--plate-scale", camS.toFixed(4));
      // settle 0..1 drives the cobalt grade on the post layer at the roots
      const settle = smooth(clamp((cur - 0.66) / 0.34));
      stage?.style.setProperty("--plate-settle", settle.toFixed(3));

      // DEPTH OF FIELD: keep the focus sweet-spot locked to the packet. The
      // packet's screen-y is lerp(0.16, 0.74, e) (see packetPos), so we put
      // focus-y exactly there. DOF strength eases UP mid-descent and relaxes
      // a touch at the calm canopy + the settled L1 bloom.
      if (dof) {
        const e = smooth(cur);
        const focusY = lerp(16, 74, e); // dead-on the packet core
        const dofAmt =
          lerp(0.45, 1, smooth(clamp(cur / 0.5))) *
          lerp(1, 0.7, smooth(clamp((cur - 0.85) / 0.15)));
        dof.style.setProperty("--focus-y", `${focusY.toFixed(2)}%`);
        dof.style.setProperty("--dof", dofAmt.toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, motionOn, wide]);

  // ---- live overlays canvas ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const { nodes, edges, motes, glints, cx, spread } = model;
    const nx = (n: { x: number }) => n.x * W;
    const ny = (n: { y: number }) => n.y * H;

    /* ---- the network draw (also the reduced-motion frame) ----
       `glow` = ambient breathing. Each node/edge also carries its own
       `fire` (ignition by the passing packet) added on top. `settle`
       shifts the colour green -> cobalt as we near the roots. `watchT`
       (0..1) brightens watcher eyes during the WATCH stage. */
    const drawNetwork = (
      p: number,
      glow: number,
      t: number,
      watchT: number,
    ) => {
      const settle = smooth(clamp((p - 0.66) / 0.34));

      // edges first (under nodes)
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const ax = nx(a);
        const ay = ny(a);
        const bx = nx(b);
        const by = ny(b);
        const fire = e.fire;
        // dormant edges are very faint; ignited ones flare bright + colour
        // toward the packet hue.
        const baseA = 0.05 * glow;
        const fireA = 0.55 * fire;
        const a0 = baseA + fireA * 0.6;
        const a1 = baseA + fireA;
        const col = mixRGB(GREEN, settle > 0.5 ? COBALT : GREEN, settle);
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        g.addColorStop(0, `rgba(${col}, ${a0})`);
        g.addColorStop(1, `rgba(${col}, ${a1})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1 + fire * 1.4;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // nodes
      for (const n of nodes) {
        const x = nx(n);
        const y = ny(n);
        let fire = n.fire;
        const isRoot = n.y > 0.7;
        // WATCH: watcher eyes BLINK gold during the challenge window
        let eye = 0;
        if (watchT > 0.001 && n.watcher) {
          const blink = 0.5 + 0.5 * Math.sin(t * 3.2 + n.blink * 3.0);
          eye = watchT * Math.pow(blink, 3) * 0.85;
          fire = Math.max(fire, eye);
        }
        const col =
          eye > 0.02
            ? mixRGB(GREEN, GOLD, clamp(eye / 0.85))
            : mixRGB(GREEN, COBALT, isRoot ? settle : settle * 0.4);
        // dormant node: small dim dot. Ignited: bright with a glow halo.
        const baseA = 0.28 * glow;
        const a = clamp(baseA + fire * 0.7, 0, 1);
        const r = n.r * (1 + fire * 0.9);
        if (fire > 0.04) {
          const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
          halo.addColorStop(0, `rgba(${col}, ${0.5 * fire})`);
          halo.addColorStop(1, `rgba(${col}, 0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, y, r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${col}, ${a})`;
        ctx.shadowColor = `rgba(${col}, ${a})`;
        ctx.shadowBlur = 6 + fire * 12;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    /* ---- STATIC path (reduced motion / motion-off / mobile) ---- */
    if (!motionOn) {
      const renderStatic = () => {
        const pStat = 0.42;
        const pk = packetPos(pStat, 0, cx, spread);
        // a calm, partially-lit constellation with the packet resting
        // mid-trunk (no animation).
        for (const n of nodes) {
          const d = Math.hypot(n.x - pk.x, (n.y - pk.y) * 1.4);
          n.fire = clamp(0.5 - d * 2.2, 0, 0.5);
        }
        for (const e of edges) {
          e.fire = Math.min(nodes[e.a].fire, nodes[e.b].fire) * 0.8;
        }
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";
        drawNetwork(pStat, 0.8, 0, 0);
        // the resting packet seed
        const px = pk.x * W;
        const py = pk.y * H;
        const seed = ctx.createRadialGradient(px, py, 0, px, py, 26);
        seed.addColorStop(0, `rgba(${GREEN}, 0.95)`);
        seed.addColorStop(0.4, `rgba(${GREEN}, 0.4)`);
        seed.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = seed;
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      };
      renderStatic();
      window.addEventListener("resize", renderStatic);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", renderStatic);
      };
    }

    /* ---- ANIMATED path ---- */
    let raf = 0;
    let last = performance.now();

    // trailing wake samples (recent packet positions, in normalized coords).
    // A long, dense buffer so the comet tail is a smooth tapering ribbon
    // rather than a few visible segments — the hallmark of the polished look.
    const WAKE = 64;
    const wake: { x: number; y: number }[] = [];
    for (let i = 0; i < WAKE; i++) wake.push({ x: cx, y: 0.16 });

    // confirmation ripple rings spawned at settlement
    type Ring = { t: number; born: number };
    const rings: Ring[] = [];
    let lastRingAt = -1;
    let settledOnce = false;

    // caption cross-fade state (DOM, written imperatively — no React state)
    let lastStageIdx = -1;

    // tiny static grain tile, drawn faintly each frame at an offset
    const grain = document.createElement("canvas");
    grain.width = grain.height = 96;
    const gctx = grain.getContext("2d")!;
    const gimg = gctx.createImageData(96, 96);
    for (let i = 0; i < gimg.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      gimg.data[i] = gimg.data[i + 1] = gimg.data[i + 2] = v;
      gimg.data[i + 3] = 255;
    }
    gctx.putImageData(gimg, 0, 0);

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      // ride the SAME eased pan value the plate uses (coupled descent, no
      // jitter); fall back to the raw progress before the pan loop ticks.
      const p = clamp(panProgRef.current ?? progressRef.current ?? 0);
      const settle = smooth(clamp((p - 0.66) / 0.34));
      const arrival = smooth(clamp((p - 0.9) / 0.1)); // final landing 0..1

      // --- which lifecycle STAGE are we in, and how far through it? ---
      const stage = stageOf(p);
      const sIdx = stage.idx;
      const sLocal = stage.local;
      // per-stage "intensity" envelopes (0..1), each peaking mid-stage so
      // the beat reads as its own moment then hands off to the next.
      const submitT = sIdx === 0 ? 1 : clamp(1 - (p - STAGE_BOUNDS[1]) / 0.06);
      const sequenceT =
        sIdx === 1
          ? smooth(clamp(sLocal / 0.6))
          : sIdx < 1
            ? 0
            : clamp(1 - (p - STAGE_BOUNDS[2]) / 0.06);
      const commitT = sIdx === 2 ? Math.sin(smooth(sLocal) * Math.PI) : 0; // bell: bundle in, release down
      const watchT =
        sIdx === 3 ? Math.sin(smooth(clamp((sLocal - 0.05) / 0.9)) * Math.PI) : 0;

      // packet position in normalized coords + px
      const pk = packetPos(p, t, cx, spread);
      const px = pk.x * W;
      const py = pk.y * H;
      // packet hue shifts green -> cobalt as it nears the roots
      const pkCol = mixRGB(GREEN, COBALT, settle);

      // advance wake buffer (shift, push current head). The head is eased
      // toward the packet a hair so the very tip of the comet never snaps.
      for (let i = wake.length - 1; i > 0; i--) {
        wake[i].x = wake[i - 1].x;
        wake[i].y = wake[i - 1].y;
      }
      wake[0].x = pk.x;
      wake[0].y = pk.y;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      /* ============================================================
         STAGE 1 · SUBMIT — the spark is born. Canopy glints twinkle, then
         fly INWARD toward the packet head to coalesce into it. As submitT
         falls (handing to SEQUENCE) the glints have all collapsed in.
         ============================================================ */
      if (submitT > 0.001) {
        // converge: 0 = at home scatter, 1 = collapsed into packet
        const converge = smooth(clamp((p / STAGE_BOUNDS[1]) * 1.05));
        for (const gl of glints) {
          const hx = lerp(gl.x, pk.x, converge);
          const hy = lerp(gl.y, pk.y, converge);
          const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * gl.tw + gl.ph));
          const a = submitT * tw * lerp(0.9, 0.25, converge);
          const r = gl.r * lerp(1.4, 0.5, converge);
          const gx = hx * W;
          const gy = hy * H;
          const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 4);
          g.addColorStop(0, `rgba(${GREEN}, ${a})`);
          g.addColorStop(1, `rgba(${GREEN}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(gx, gy, r * 4, 0, Math.PI * 2);
          ctx.fill();
          // a faint inward thread as they collapse (only mid-converge)
          if (converge > 0.15 && converge < 0.95) {
            ctx.strokeStyle = `rgba(${GREEN}, ${a * 0.5})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(lerp(gx, px, 0.4), lerp(gy, py, 0.4));
            ctx.stroke();
          }
        }
      }

      /* ============================================================
         STAGE 2 · SEQUENCE — scattered glints SNAP into an ordered queue.
         A column of evenly-spaced ticks forms along the trunk ABOVE the
         packet, settling in from jitter into a clean ordered line. As
         COMMIT begins this queue compresses downward into the block.
         ============================================================ */
      if (sequenceT > 0.001 || commitT > 0.001) {
        const QN = 7;
        // queue spans from a little above the packet up the trunk
        const top = clamp(pk.y - 0.3, 0.06, 0.7);
        const bottomY = clamp(pk.y - 0.06, 0.1, 0.78);
        // COMMIT compresses the slots toward the packet (the "bundle")
        const compress = commitT; // 0 = full queue, ->1 = collapsed onto packet
        for (let i = 0; i < QN; i++) {
          const f = i / (QN - 1); // 0 top .. 1 nearest packet
          const baseY = lerp(top, bottomY, f);
          const slotY = lerp(baseY, pk.y - 0.02, compress * 0.92);
          const slotX = lerp(cx, pk.x, 0.35 + 0.3 * f);
          // settle-in jitter at the start of SEQUENCE, easing to a clean line
          const settleIn = smooth(clamp((sequenceT - f * 0.12) / 0.5));
          const jitter = (1 - settleIn) * Math.sin(t * 6 + i) * 0.012;
          const x = (slotX + jitter) * W;
          const y = slotY * H;
          // alpha: rise as the queue orders, fade as it compresses away
          const a = clamp(
            (sequenceT * settleIn + commitT * 0.8) * (1 - compress * 0.65),
            0,
            1,
          );
          if (a < 0.02) continue;
          const col = commitT > 0.3 ? mixRGB(GREEN, pkCol, 0.4) : GREEN;
          // a short ordered tick mark (reads as a queued tx slot)
          const half = lerp(7, 3, compress) * (0.7 + 0.3 * settleIn);
          ctx.strokeStyle = `rgba(${col}, ${a})`;
          ctx.lineWidth = lerp(2.2, 3.4, compress);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x - half, y);
          ctx.lineTo(x + half, y);
          ctx.stroke();
          // a tiny index node at the slot
          const dotG = ctx.createRadialGradient(x, y, 0, x, y, 5);
          dotG.addColorStop(0, `rgba(${col}, ${a})`);
          dotG.addColorStop(1, `rgba(${col}, 0)`);
          ctx.fillStyle = dotG;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.lineCap = "butt";
      }

      /* --- IGNITE the network around the packet -------------------
         Raise each node's `fire` by proximity to the packet, then decay
         it so the network lights up AS the packet passes and fades in
         its wake. Edges fire when either endpoint is lit. --- */
      const IGNITE_R = 0.16; // normalized ignition radius
      for (const n of nodes) {
        const d = Math.hypot(n.x - pk.x, (n.y - pk.y) * 1.25);
        if (d < IGNITE_R) {
          const add = (1 - d / IGNITE_R) * dt * 6.5;
          n.fire = clamp(n.fire + add, 0, 1);
        }
        // decay (slower so the wake lingers a beat)
        n.fire = Math.max(0, n.fire - dt * 0.9);
      }
      for (const e of edges) {
        const target = Math.min(nodes[e.a].fire, nodes[e.b].fire);
        // edge lights as its nodes light; a touch of travel feel by
        // easing toward the min of its endpoints.
        e.fire += (target - e.fire) * Math.min(1, dt * 7);
      }

      /* --- the NETWORK (now reactive; watcher eyes blink at WATCH) --- */
      const netGlow = 0.8 + 0.12 * Math.sin(t * 0.8);
      drawNetwork(p, netGlow, t, watchT);

      /* ============================================================
         STAGE 4 · WATCH — a gold challenge-window SCAN-LINE sweeps the
         frame top->bottom (a watcher scrubbing the committed block). The
         eyes blinking are handled inside drawNetwork via watchT.
         ============================================================ */
      if (watchT > 0.001) {
        const sweep = Math.sin(t * 1.1) * 0.5 + 0.5; // 0..1 ping-pong
        const sy = lerp(0.1, 0.9, sweep) * H;
        const bandH = 26;
        const a = watchT * 0.5;
        const g = ctx.createLinearGradient(0, sy - bandH, 0, sy + bandH);
        g.addColorStop(0, `rgba(${GOLD}, 0)`);
        g.addColorStop(0.5, `rgba(${GOLD}, ${a})`);
        g.addColorStop(1, `rgba(${GOLD}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, sy - bandH, W, bandH * 2);
        // a crisp gold core line
        ctx.strokeStyle = `rgba(${GOLD}, ${watchT * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(W, sy);
        ctx.stroke();
      }

      /* --- the WAKE: a long, softly-glowing COMET TAIL behind the packet.
         Each segment is a quadratic from the previous midpoint, THROUGH the
         actual sample (as control point), to the next midpoint — the
         canonical smooth-polyline trick, so the ribbon is genuinely
         kink-free even at speed. Drawn in TWO additive passes for depth:
           (1) a wide, diffuse outer haze that tapers to nothing,
           (2) a tight, bright inner filament with a hot near-white root. */
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const wakeFade = 1 - arrival * 0.45;
      // px helpers for a wake sample
      const wpx = (i: number) => wake[i].x * W;
      const wpy = (i: number) => wake[i].y * H;

      const drawWakePass = (
        widthHead: number,
        widthTail: number,
        widthPow: number,
        alphaHead: number,
        hotMix: number,
      ) => {
        // walk tail -> head; i is the "current" sample, i-1 is newer
        for (let i = wake.length - 2; i > 0; i--) {
          const f = 1 - i / wake.length; // 0 tail .. 1 head
          // segment endpoints = midpoints either side of sample i
          const mPrevX = (wpx(i + 1) + wpx(i)) / 2;
          const mPrevY = (wpy(i + 1) + wpy(i)) / 2;
          const mNextX = (wpx(i) + wpx(i - 1)) / 2;
          const mNextY = (wpy(i) + wpy(i - 1)) / 2;
          const w =
            lerp(widthTail, widthHead, Math.pow(f, widthPow)) *
            (1 + arrival * 0.25);
          const alpha = alphaHead * f * f * wakeFade;
          if (alpha < 0.002) continue;
          let style: string;
          if (hotMix > 0) {
            const hot = clamp((f - 0.6) / 0.4, 0, 1);
            const col = mixRGB(pkCol, "255, 255, 255", hot * hotMix);
            style = `rgba(${col}, ${alpha})`;
          } else {
            style = `rgba(${pkCol}, ${alpha})`;
          }
          ctx.strokeStyle = style;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(mPrevX, mPrevY);
          ctx.quadraticCurveTo(wpx(i), wpy(i), mNextX, mNextY);
          ctx.stroke();
        }
      };

      // pass (1): wide diffuse haze; pass (2): bright hot filament
      drawWakePass(26, 1, 3, 0.16, 0);
      drawWakePass(6.5, 0.4, 2, 0.55, 0.85);
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";

      /* --- the PACKET HEAD: a molten WHITE-HOT core wrapped in a layered
         additive bloom, with a faint forward flare along the travel
         direction so it reads as a tracked comet, not a static dot. At
         COMMIT it briefly takes on a crisp square "block" form (the
         batch), peaking with commitT, then relaxes back to the comet. --- */
      // travel direction (from the wake) to orient the flare
      const back = wake[Math.min(6, wake.length - 1)];
      let dirx = pk.x - back.x;
      let diry = pk.y - back.y;
      const dl = Math.hypot(dirx, diry) || 1;
      dirx /= dl;
      diry /= dl;

      const headPulse = 0.86 + 0.14 * Math.sin(t * 5.5);
      const block = commitT; // 0 round .. 1 block
      const coreR =
        lerp(3.4, 5.2, headPulse) * (1 + arrival * 0.5) * (1 + block * 0.6);

      // (a) broad soft bloom — the lush, restrained glow
      const bloomHalo = ctx.createRadialGradient(px, py, 0, px, py, coreR * 11);
      bloomHalo.addColorStop(0, `rgba(${pkCol}, 0.55)`);
      bloomHalo.addColorStop(0.22, `rgba(${pkCol}, 0.3)`);
      bloomHalo.addColorStop(0.55, `rgba(${pkCol}, 0.1)`);
      bloomHalo.addColorStop(1, `rgba(${pkCol}, 0)`);
      ctx.fillStyle = bloomHalo;
      ctx.beginPath();
      ctx.arc(px, py, coreR * 11, 0, Math.PI * 2);
      ctx.fill();

      // (b) tight inner glow — saturated colour halo
      const halo = ctx.createRadialGradient(px, py, 0, px, py, coreR * 4.2);
      halo.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
      halo.addColorStop(0.25, `rgba(${pkCol}, 0.7)`);
      halo.addColorStop(1, `rgba(${pkCol}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(px, py, coreR * 4.2, 0, Math.PI * 2);
      ctx.fill();

      // (c) forward flare — a soft lens streak ahead of the core (fades as
      // the head squares up into the committed block)
      const flareLen = coreR * lerp(5, 9, headPulse) * (1 - block * 0.7);
      const fx = px + dirx * flareLen;
      const fy = py + diry * flareLen;
      const flare = ctx.createLinearGradient(px, py, fx, fy);
      flare.addColorStop(0, `rgba(255, 255, 255, ${0.5 * headPulse * (1 - block)})`);
      flare.addColorStop(1, `rgba(${pkCol}, 0)`);
      ctx.strokeStyle = flare;
      ctx.lineCap = "round";
      ctx.lineWidth = coreR * 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(fx, fy);
      ctx.stroke();
      ctx.lineCap = "butt";

      // (d) molten core — morph round -> square BLOCK via blended draws
      ctx.shadowColor = `rgba(${pkCol}, 1)`;
      ctx.shadowBlur = 22 + block * 12;
      if (block > 0.04) {
        // square block face (the committed batch), rounded corners
        const s = coreR * lerp(1.0, 1.7, block);
        const rr = s * 0.28;
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.9 + 0.08 * headPulse) * block})`;
        ctx.beginPath();
        ctx.moveTo(px - s + rr, py - s);
        ctx.arcTo(px + s, py - s, px + s, py + s, rr);
        ctx.arcTo(px + s, py + s, px - s, py + s, rr);
        ctx.arcTo(px - s, py + s, px - s, py - s, rr);
        ctx.arcTo(px - s, py - s, px + s, py - s, rr);
        ctx.fill();
      }
      // round core always present (fades under the block at full commit)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * headPulse * (1 - block * 0.5)})`;
      ctx.beginPath();
      ctx.arc(px, py, coreR * (1 - block * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      /* ============================================================
         STAGE 5 · SETTLE — a SLOW, satisfying confirmation BLOOM + eased
         ripple rings at the cobalt roots. When the packet arrives at L1, a
         warm white core flashes then settles into a wide, layered cobalt
         bloom that keeps glowing while held; rings expand slowly with
         eased easing for a luxurious settle. Anchored to the landing.
         ============================================================ */
      if (arrival > 0.001) {
        const bx = px;
        const by = py;
        const ea = smooth(arrival);
        // (1) wide, soft outer bloom — the satisfying cobalt wash
        const bloomR = lerp(0, Math.max(W, H) * 0.46, ea);
        const bloom = ctx.createRadialGradient(
          bx,
          by,
          0,
          bx,
          by,
          Math.max(10, bloomR),
        );
        bloom.addColorStop(0, `rgba(${COBALT}, ${0.45 * arrival})`);
        bloom.addColorStop(0.35, `rgba(${COBALT}, ${0.2 * arrival})`);
        bloom.addColorStop(0.7, `rgba(${COBALT}, ${0.07 * arrival})`);
        bloom.addColorStop(1, `rgba(${COBALT}, 0)`);
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(bx, by, Math.max(10, bloomR), 0, Math.PI * 2);
        ctx.fill();
        // (2) bright tight cobalt heart with a warm-white flash on impact
        const flashR = Math.max(8, coreR * lerp(6, 14, ea));
        const heart = ctx.createRadialGradient(bx, by, 0, bx, by, flashR);
        const whiteFlash = clamp(1 - Math.abs(arrival - 0.5) * 2.4, 0, 1);
        heart.addColorStop(
          0,
          `rgba(255, 255, 255, ${(0.5 + 0.4 * whiteFlash) * arrival})`,
        );
        heart.addColorStop(0.3, `rgba(${COBALT}, ${0.55 * arrival})`);
        heart.addColorStop(1, `rgba(${COBALT}, 0)`);
        ctx.fillStyle = heart;
        ctx.beginPath();
        ctx.arc(bx, by, flashR, 0, Math.PI * 2);
        ctx.fill();

        // emit a ring on first full arrival, then periodically while held
        if (arrival > 0.5) {
          if (!settledOnce) {
            settledOnce = true;
            rings.push({ t: 0, born: t });
            lastRingAt = t;
          } else if (t - lastRingAt > 2.0) {
            rings.push({ t: 0, born: t });
            lastRingAt = t;
          }
        }
      } else {
        // reset when scrolled back up so the landing can replay
        settledOnce = false;
      }

      // advance + draw ripple rings — slow expansion, eased, soft double edge
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.t += dt;
        const life = ring.t / 3.2; // slower, more satisfying
        if (life >= 1) {
          rings.splice(i, 1);
          continue;
        }
        const el2 = smooth(life); // ease the expansion
        const rr = lerp(10, Math.min(W, H) * 0.5, el2);
        const a = (1 - life) * (1 - life) * 0.5 * arrival; // ease the fade
        ctx.strokeStyle = `rgba(${COBALT}, ${a})`;
        ctx.lineWidth = lerp(3, 0.4, life);
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, Math.PI * 2);
        ctx.stroke();
        // a faint trailing inner echo for richness
        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.3})`;
        ctx.lineWidth = lerp(1.4, 0.3, life);
        ctx.beginPath();
        ctx.arc(px, py, rr * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* --- ambient organic MOTES (spores/pollen), minimal ----------
         Drift downward through the trunk band; brighten faintly when the
         packet passes near them (carried in its light). --- */
      for (const m of motes) {
        m.sway += dt;
        m.y += m.vy * dt;
        m.x += (m.vx + Math.sin(m.sway * 1.2) * 0.008) * dt;
        if (m.y > 1.05) {
          m.y = -0.04;
          m.x = clamp(
            cx + (Math.random() - 0.5) * 2 * (spread + 0.16),
            0.06,
            0.96,
          );
        }
        const d = Math.hypot(m.x - pk.x, (m.y - pk.y) * 1.2);
        const lit = clamp(1 - d / 0.18, 0, 1);
        const tw = 0.18 + 0.16 * (0.5 + 0.5 * Math.sin(m.sway * m.twk));
        const a = tw + lit * 0.55;
        const col = lit > 0.2 ? pkCol : GREEN;
        const r = m.s * (1 + lit * 1.2);
        const g = ctx.createRadialGradient(
          m.x * W,
          m.y * H,
          0,
          m.x * W,
          m.y * H,
          r * 3,
        );
        g.addColorStop(0, `rgba(${col}, ${a})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x * W, m.y * H, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      /* --- whisper of grain (the primary, filmic soft-light grain is the
         CSS .plate-stage__grain layer; this canvas pass just adds a faint
         sparkle in the lit/additive regions so highlights feel alive). --- */
      ctx.globalAlpha = 0.018;
      const ox = (t * 40) % 96;
      const oy = (t * 30) % 96;
      for (let gx = -96; gx < W + 96; gx += 96) {
        for (let gy2 = -96; gy2 < H + 96; gy2 += 96) {
          ctx.drawImage(grain, gx - ox, gy2 - oy);
        }
      }
      ctx.globalAlpha = 1;

      /* ---- ON-SCENE STAGE MARKER: a per-stage mini-icon that TRACKS the
         packet head, updated imperatively (no React re-render). The full step
         detail (title / tag / description) now lives in the enlarged HUD, so
         this marker deliberately carries NO text — it just tags the focal
         action on the tree and swaps its glyph + colour on each chapter
         change, with a small pop so the step change registers. ---- */
      const capEl = captionRef.current;
      if (capEl) {
        if (sIdx !== lastStageIdx) {
          lastStageIdx = sIdx;
          const cue = STAGE_CUES[sIdx];
          if (capIconRef.current)
            capIconRef.current.style.setProperty(
              "--icon",
              `url("${ICON[cue.key]}")`,
            );
          capEl.dataset.layer = sIdx === 4 ? "l1" : sIdx === 3 ? "bridge" : "l2";
          // retrigger the entrance animation
          capEl.classList.remove("is-in");
          // force reflow so the animation restarts
          void capEl.offsetWidth;
          capEl.classList.add("is-in");
        }
        // sit just beside the packet head, clamped into the viewport, and fade
        // out at the very top (let the hero breathe). It's a small disc so it
        // never crowds the centre or reaches the right-edge HUD.
        const left = clamp(px + 26, 20, W - 64);
        const top = clamp(py - 22, 64, H - 64);
        capEl.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
        capEl.style.opacity = p < 0.015 ? "0" : "1";
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [model, motionOn, progressRef]);

  return (
    <div
      className={`plate-stage${motionOn ? "" : " plate-stage--still"}`}
      aria-hidden
      style={{ ["--grain-svg" as string]: `url("${GRAIN_URI}")` }}
    >
      <div
        ref={plateRef}
        className={`plate-stage__img${wide ? " plate-stage__img--wide" : ""}`}
      />
      {/* ACES-ish filmic GRADE: a static, screen/overlay colour wash that
          sits over the plate but UNDER the live fx — gives the highlight
          warmth + cool shadows of a film tone-map without an expensive
          per-frame SVG filter on the panning plate (the contrast S-curve
          itself is the cheap CSS filter baked on .plate-stage__img). The
          --plate-settle var lifts a cobalt wash as we reach the L1 roots. */}
      <div className="plate-stage__grade" />
      {/* legibility scrim (under the live fx + post so copy stays crisp) */}
      <div className="plate-stage__scrim" />
      {/* live overlays: packet, comet wake, reactive network, stage beats,
          settlement bloom */}
      <canvas ref={canvasRef} className="plate-stage__fx" />
      {/* ---- CINEMATIC POST STACK ---- */}
      <div ref={dofRef} className="plate-stage__dof" />
      <div className="plate-stage__ca" />
      <div className="plate-stage__vignette" />
      <div className="plate-stage__grain" />
      {/* ---- ON-SCENE STAGE MARKER (mini-icon only) — tags the focal action
          on the tree and tracks the packet; the full step detail lives in the
          HUD so this carries no text. Desktop / motion only; hidden via CSS in
          the static/reduced fallback. ---- */}
      {motionOn && (
        <div
          className="plate-stage__caption plate-stage__caption--marker"
          ref={captionRef}
          data-layer="l2"
        >
          <span
            className="plate-stage__caption-icon"
            ref={capIconRef}
            style={{ ["--icon" as string]: `url("${ICON.submit}")` }}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}

/* A tiny fractal-noise SVG used as the animated film-grain tile (data URI
   so there's no extra asset / network hit). High base frequency = fine
   grain; the CSS layer animates a sub-pixel translate so it shimmers. */
const GRAIN_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>` +
      `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
      `<feColorMatrix type='saturate' values='0'/></filter>` +
      `<rect width='100%' height='100%' filter='url(#n)' opacity='0.9'/></svg>`,
  );
