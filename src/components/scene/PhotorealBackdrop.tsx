"use client";

/* ============================================================
   PhotorealBackdrop — the PHOTOREAL variant of the How It Works
   journey backdrop. A live motion layer over an AI-generated photoreal
   tree PLATE so the frame matches the client's reference closely.

   ── THIS TAKE'S SIGNATURE: RIDE THE TRANSACTION ──
   The scroll literally FOLLOWS one luminous transaction packet down the
   tree. A bright comet/seed of green light with a glowing trailing wake
   is born in the canopy and ridden down the trunk to the roots, tracking
   with the descent. As it passes, the branch-NETWORK ignites around it —
   nodes and edges flare then fade in its wake (the transaction hopping
   the network). At the bottom it lands in the cobalt L1 roots with a
   confirmation BLOOM + expanding ripple rings = settlement. The plate
   pan is COUPLED to the packet so the camera keeps it framed as you fall.
   Ambient particles are minimal organic motes; the hero is the packet
   and the reactive network it lights.

   Two stacked, fixed, full-viewport layers (both portaled to <body>
   inside .scene-stage by the host, so they stay viewport-fixed under
   the smooth-scroll transform):

     1. THE PLATE — worldtree-tall.jpg (emerald canopy -> gnarled trunk
        -> roots over mossy rock with a COBALT L1 glow at the base). As
        the page scrolls DOWN, the plate PARALLAX-PANS canopy -> roots,
        coupled to the packet's vertical position so you ride it down to
        the cobalt L1 bedrock = settlement. Wide/short viewports fall
        back to the wide plate with a gentler pan.

     2. LIVE OVERLAYS — a single <canvas> sized to the viewport, drawn
        each rAF: the RIDDEN PACKET (comet + wake), the REACTIVE NETWORK
        it ignites, the SETTLEMENT BLOOM at L1, faint organic motes, a
        couple of soft trunk light-shafts, a whisper of grain. Geometric
        ADA-diamond overlays are GONE — at most a single faint, rare
        crystalline glint near settlement.

   Driven by the SAME smoothed scroll `progressRef` the host feeds the
   scene, plus time. No per-scroll React state — pan + overlays read
   refs in the rAF loop, so scrolling never re-renders React.

   Reduced motion / motion-off / mobile (motionOn === false): the plate
   is shown STATIC (a calm mid-trunk framing, no pan) and the canvas
   draws the network ONCE as a static constellation with the packet
   resting mid-trunk (no animation, wake, bloom, motes, or grain).
   Cheap, legible, no scroll hijack.
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
const GREEN_MID = "32, 190, 67"; // --midgard-green
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

/* ----------------------------------------------------------------
   The plate's vertical "descent" is a background-position pan, COUPLED
   to the packet so the camera keeps the ridden transaction framed. The
   tall plate is taller than the viewport when covered, so we pan
   object-position from the canopy (top) to the roots (bottom).
   p = 0 -> canopy, p = 1 -> roots.
   ---------------------------------------------------------------- */
const PAN_TOP = 6; // % object-position-y at the canopy
const PAN_BOTTOM = 96; // % object-position-y at the roots
const PAN_TOP_WIDE = 24; // gentler pan for the wide fallback
const PAN_BOTTOM_WIDE = 78;

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
    (Math.sin(t * 0.9 + p * 7.0) * 0.045 +
      Math.sin(t * 1.7 + 1.3) * 0.018) *
    narrow *
    (1 - e * 0.8);
  const x = cx + sway * (spread / 0.2);
  return { x, y };
}

/* ================================================================
   Overlay model — built once, deterministically, in plate-relative
   normalized coords (0..1 across the viewport). The trunk of the tall
   plate sits roughly centre-right; the network + shafts hug that band.
   Coords convert to px each frame against the live canvas size.
   ================================================================ */
type Node = {
  x: number;
  y: number;
  r: number;
  phase: number;
  /** ignition level 0..1, raised as the packet passes, decays after */
  fire: number;
};
type Edge = { a: number; b: number; fire: number };
type Shaft = { x: number; w: number; phase: number; speed: number; h0: number; h1: number };
type Mote = { x: number; y: number; vx: number; vy: number; s: number; sway: number; twk: number };

type Model = {
  nodes: Node[];
  edges: Edge[];
  shafts: Shaft[];
  motes: Mote[];
  cx: number;
  spread: number;
};

function buildModel(wide: boolean): Model {
  const rand = mulberry32(20260608);

  // trunk centre column + spread. Tall plate: tree centred slightly right.
  // Wide plate: tree pushed toward the right third.
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
    nodes.push({
      x,
      y,
      r: 1.8 + rand() * 2.4,
      phase: rand() * Math.PI * 2,
      fire: 0,
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

  // --- SHAFTS: a couple of soft vertical light-shafts on the trunk for
  // ambient depth (much quieter than the old beam field). ---
  const shafts: Shaft[] = [];
  const shaftCount = wide ? 2 : 3;
  for (let i = 0; i < shaftCount; i++) {
    const t = shaftCount > 1 ? i / (shaftCount - 1) : 0.5;
    shafts.push({
      x: cx + (t - 0.5) * 2 * spread * 0.6 + (rand() - 0.5) * 0.02,
      w: 22 + rand() * 30,
      phase: rand() * Math.PI * 2,
      speed: 0.32 + rand() * 0.4,
      h0: 0.08 + rand() * 0.08,
      h1: 0.82 + rand() * 0.12,
    });
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

  return { nodes, edges, shafts, motes, cx, spread };
}

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
  // shared, rAF-smoothed pan progress so the canvas packet rides the EXACT
  // same eased descent as the plate (perfect coupling = no jitter, tracking
  // shot feel). Written by the plate-pan loop, read by the overlay loop.
  const panProgRef = useRef(clamp(progressRef.current ?? 0));
  const model = useMemo(() => buildModel(wide), [wide]);

  // ---- plate parallax pan (rAF, ref-driven, no React state) ----
  useEffect(() => {
    const el = plateRef.current;
    const dof = dofRef.current;
    if (!el) return;

    const top = wide ? PAN_TOP_WIDE : PAN_TOP;
    const bottom = wide ? PAN_BOTTOM_WIDE : PAN_BOTTOM;

    // motion-off / reduced motion / mobile: calm static framing, no pan.
    if (!motionOn) {
      const e = 0.42;
      panProgRef.current = e;
      el.style.setProperty("--plate-y", `${lerp(top, bottom, e)}%`);
      el.style.setProperty("--plate-scale", "1.02");
      if (dof) {
        dof.style.setProperty("--focus-y", "46%");
        dof.style.setProperty("--dof", "0");
      }
      return;
    }

    let raf = 0;
    let cur = panProgRef.current;
    let vel = 0; // velocity term for a critically-damped follow (no jitter)
    let lastT = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      const target = clamp(progressRef.current ?? 0);
      // critically-damped spring toward target: buttery, overshoot-free.
      // This is the SAME smoothed value the overlay packet reads, so the
      // plate descent and the packet are perfectly coupled.
      const stiffness = 120;
      const damping = 2 * Math.sqrt(stiffness); // critical
      const a = stiffness * (target - cur) - damping * vel;
      vel += a * dt;
      cur += vel * dt;
      cur = clamp(cur);
      panProgRef.current = cur;

      const e = smooth(cur);
      const y = lerp(top, bottom, e);
      // a touch of "push in" toward the roots for depth as we arrive at L1
      const scale = lerp(1.06, 1.13, e);
      el.style.setProperty("--plate-y", `${y.toFixed(3)}%`);
      el.style.setProperty("--plate-scale", scale.toFixed(4));

      // DEPTH OF FIELD: keep the focus sweet-spot locked to the packet. The
      // packet's screen-y is lerp(0.16, 0.74, e) (see packetPos), so we put
      // focus-y exactly there. DOF strength eases UP mid-descent and relaxes
      // a touch at the calm canopy + the settled L1 bloom.
      if (dof) {
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

    const { nodes, edges, shafts, motes, cx, spread } = model;
    const nx = (n: { x: number }) => n.x * W;
    const ny = (n: { y: number }) => n.y * H;

    /* ---- the network draw (also the reduced-motion frame) ----
       `glow` = ambient breathing. Each node/edge also carries its own
       `fire` (ignition by the passing packet) added on top. `settle`
       shifts the colour green -> cobalt as we near the roots. */
    const drawNetwork = (p: number, glow: number, packX: number, packY: number) => {
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
        const fire = n.fire;
        const isRoot = n.y > 0.7;
        const col = mixRGB(GREEN, COBALT, isRoot ? settle : settle * 0.4);
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
      // silence unused-arg lint while keeping the signature symmetric with
      // the animated caller (packet coords used there for ignition).
      void packX;
      void packY;
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
        drawNetwork(pStat, 0.8, pk.x * W, pk.y * H);
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

      /* --- soft trunk light-shafts (ambient depth, quiet) --- */
      for (const sh of shafts) {
        const x = sh.x * W;
        const y0 = sh.h0 * H;
        const y1 = sh.h1 * H;
        const breathe = 0.5 + 0.5 * Math.sin(t * sh.speed + sh.phase);
        const w = sh.w * (0.8 + 0.3 * breathe);
        const a = (0.03 + 0.035 * breathe) * (1 - settle * 0.5);
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, `rgba(${GREEN}, 0)`);
        g.addColorStop(0.4, `rgba(${GREEN}, ${a})`);
        g.addColorStop(0.75, `rgba(${GREEN_MID}, ${a * 0.7})`);
        g.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - w / 2, y0, w, y1 - y0);
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

      /* --- the NETWORK (now reactive) --- */
      const netGlow = 0.8 + 0.12 * Math.sin(t * 0.8);
      drawNetwork(p, netGlow, px, py);

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
          const w = lerp(widthTail, widthHead, Math.pow(f, widthPow)) * (1 + arrival * 0.25);
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
         direction so it reads as a tracked comet, not a static dot. --- */
      // travel direction (from the wake) to orient the flare
      const back = wake[Math.min(6, wake.length - 1)];
      let dirx = pk.x - back.x;
      let diry = pk.y - back.y;
      const dl = Math.hypot(dirx, diry) || 1;
      dirx /= dl;
      diry /= dl;

      const headPulse = 0.86 + 0.14 * Math.sin(t * 5.5);
      const coreR = lerp(3.4, 5.2, headPulse) * (1 + arrival * 0.5);

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

      // (c) forward flare — a soft lens streak ahead of the core
      const flareLen = coreR * lerp(5, 9, headPulse);
      const fx = px + dirx * flareLen;
      const fy = py + diry * flareLen;
      const flare = ctx.createLinearGradient(px, py, fx, fy);
      flare.addColorStop(0, `rgba(255, 255, 255, ${0.5 * headPulse})`);
      flare.addColorStop(1, `rgba(${pkCol}, 0)`);
      ctx.strokeStyle = flare;
      ctx.lineCap = "round";
      ctx.lineWidth = coreR * 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(fx, fy);
      ctx.stroke();
      ctx.lineCap = "butt";

      // (d) molten white-hot core
      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * headPulse})`;
      ctx.shadowColor = `rgba(${pkCol}, 1)`;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(px, py, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      /* --- SETTLEMENT: a SLOW, satisfying confirmation BLOOM + eased ripple
         rings at the cobalt roots. When the packet arrives at L1, a warm
         white core flashes then settles into a wide, layered cobalt bloom
         that keeps glowing while held; rings expand slowly with eased
         easing for a luxurious settle. Anchored to the packet's landing. */
      if (arrival > 0.001) {
        const bx = px;
        const by = py;
        const ea = smooth(arrival);
        // (1) wide, soft outer bloom — the satisfying cobalt wash
        const bloomR = lerp(0, Math.max(W, H) * 0.46, ea);
        const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(10, bloomR));
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
        // the white flash is strongest right at first contact then cools
        const whiteFlash = clamp(1 - Math.abs(arrival - 0.5) * 2.4, 0, 1);
        heart.addColorStop(0, `rgba(255, 255, 255, ${(0.5 + 0.4 * whiteFlash) * arrival})`);
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
        const el = smooth(life); // ease the expansion
        const rr = lerp(10, Math.min(W, H) * 0.5, el);
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
          m.x = clamp(cx + (Math.random() - 0.5) * 2 * (spread + 0.16), 0.06, 0.96);
        }
        const d = Math.hypot(m.x - pk.x, (m.y - pk.y) * 1.2);
        const lit = clamp(1 - d / 0.18, 0, 1);
        const tw = 0.18 + 0.16 * (0.5 + 0.5 * Math.sin(m.sway * m.twk));
        const a = tw + lit * 0.55;
        const col = lit > 0.2 ? pkCol : GREEN;
        const r = m.s * (1 + lit * 1.2);
        const g = ctx.createRadialGradient(m.x * W, m.y * H, 0, m.x * W, m.y * H, r * 3);
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
          itself is the cheap CSS filter baked on .plate-stage__img). */}
      <div className="plate-stage__grade" />
      {/* legibility scrim (under the live fx + post so copy stays crisp) */}
      <div className="plate-stage__scrim" />
      {/* live overlays: packet, comet wake, reactive network, settlement */}
      <canvas ref={canvasRef} className="plate-stage__fx" />
      {/* ---- CINEMATIC POST STACK (this take) ---- */}
      <div ref={dofRef} className="plate-stage__dof" />
      <div className="plate-stage__ca" />
      <div className="plate-stage__vignette" />
      <div className="plate-stage__grain" />
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
