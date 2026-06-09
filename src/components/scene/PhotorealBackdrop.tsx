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
  const model = useMemo(() => buildModel(wide), [wide]);

  // ---- plate parallax pan (rAF, ref-driven, no React state) ----
  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;

    const top = wide ? PAN_TOP_WIDE : PAN_TOP;
    const bottom = wide ? PAN_BOTTOM_WIDE : PAN_BOTTOM;

    // motion-off / reduced motion / mobile: calm static framing, no pan.
    if (!motionOn) {
      el.style.setProperty("--plate-y", `${lerp(top, bottom, 0.42)}%`);
      el.style.setProperty("--plate-scale", "1.02");
      return;
    }

    let raf = 0;
    let cur = clamp(progressRef.current ?? 0);
    const tick = () => {
      const target = clamp(progressRef.current ?? 0);
      // light smoothing on top of the already-smoothed progress for a
      // buttery pan that the packet rides.
      cur += (target - cur) * 0.12;
      const e = smooth(cur);
      const y = lerp(top, bottom, e);
      // a touch of "push in" toward the roots for depth as we arrive at L1
      const scale = lerp(1.06, 1.12, e);
      el.style.setProperty("--plate-y", `${y.toFixed(2)}%`);
      el.style.setProperty("--plate-scale", scale.toFixed(3));
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

    // trailing wake samples (recent packet positions, in normalized coords)
    const WAKE = 26;
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
      const p = clamp(progressRef.current ?? 0);
      const settle = smooth(clamp((p - 0.66) / 0.34));
      const arrival = smooth(clamp((p - 0.9) / 0.1)); // final landing 0..1

      // packet position in normalized coords + px
      const pk = packetPos(p, t, cx, spread);
      const px = pk.x * W;
      const py = pk.y * H;
      // packet hue shifts green -> cobalt as it nears the roots
      const pkCol = mixRGB(GREEN, COBALT, settle);

      // advance wake buffer (shift, push current head)
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

      /* --- the WAKE: a glowing trailing comet-tail behind the packet ---
         drawn as a tapering gradient stroke through the recent samples. */
      ctx.lineCap = "round";
      for (let i = wake.length - 1; i > 0; i--) {
        const a0 = wake[i];
        const a1 = wake[i - 1];
        const f = 1 - i / wake.length; // 1 near head .. 0 at tail
        const w = lerp(0.6, 7.5, f * f);
        const alpha = 0.5 * f * f * (1 - arrival * 0.5);
        ctx.strokeStyle = `rgba(${pkCol}, ${alpha})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(a0.x * W, a0.y * H);
        ctx.lineTo(a1.x * W, a1.y * H);
        ctx.stroke();
      }
      ctx.lineCap = "butt";

      /* --- the PACKET HEAD: bright comet/seed core + glow halo --- */
      const headPulse = 0.85 + 0.15 * Math.sin(t * 6);
      const coreR = lerp(3.2, 5.0, headPulse) * (1 + arrival * 0.4);
      // outer glow
      const halo = ctx.createRadialGradient(px, py, 0, px, py, coreR * 7);
      halo.addColorStop(0, `rgba(${pkCol}, 0.9)`);
      halo.addColorStop(0.3, `rgba(${pkCol}, 0.45)`);
      halo.addColorStop(1, `rgba(${pkCol}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(px, py, coreR * 7, 0, Math.PI * 2);
      ctx.fill();
      // bright core
      ctx.fillStyle = `rgba(255, 255, 255, ${0.92 * headPulse})`;
      ctx.shadowColor = `rgba(${pkCol}, 1)`;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(px, py, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      /* --- SETTLEMENT: confirmation BLOOM + ripple rings at the roots ---
         When the packet arrives at L1, bloom the cobalt root glow and
         emit expanding rings. We anchor the bloom to the packet's landing
         point near the bottom trunk. */
      if (arrival > 0.001) {
        const bx = px;
        const by = py;
        // expanding ground bloom
        const bloomR = lerp(0, Math.max(W, H) * 0.34, smooth(arrival));
        const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(8, bloomR));
        bloom.addColorStop(0, `rgba(${COBALT}, ${0.5 * arrival})`);
        bloom.addColorStop(0.4, `rgba(${COBALT}, ${0.22 * arrival})`);
        bloom.addColorStop(1, `rgba(${COBALT}, 0)`);
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(bx, by, Math.max(8, bloomR), 0, Math.PI * 2);
        ctx.fill();

        // emit a ring on first full arrival, then periodically while held
        if (arrival > 0.55) {
          if (!settledOnce) {
            settledOnce = true;
            rings.push({ t: 0, born: t });
            lastRingAt = t;
          } else if (t - lastRingAt > 1.6) {
            rings.push({ t: 0, born: t });
            lastRingAt = t;
          }
        }
      } else {
        // reset when scrolled back up so the landing can replay
        settledOnce = false;
      }

      // advance + draw ripple rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.t += dt;
        const life = ring.t / 2.2;
        if (life >= 1) {
          rings.splice(i, 1);
          continue;
        }
        const rr = lerp(10, Math.min(W, H) * 0.42, smooth(life));
        const a = (1 - life) * 0.5 * arrival;
        ctx.strokeStyle = `rgba(${COBALT}, ${a})`;
        ctx.lineWidth = lerp(2.4, 0.4, life);
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, Math.PI * 2);
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

      /* --- whisper of grain --- */
      ctx.globalAlpha = 0.03;
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
    <div className="plate-stage" aria-hidden>
      <div
        ref={plateRef}
        className={`plate-stage__img${wide ? " plate-stage__img--wide" : ""}`}
      />
      <div className="plate-stage__scrim" />
      <canvas ref={canvasRef} className="plate-stage__fx" />
    </div>
  );
}
