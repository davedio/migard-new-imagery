"use client";

/* ============================================================
   PhotorealBackdrop — the PHOTOREAL variant of the How It Works
   journey backdrop. Instead of a pure-WebGL world-tree (JourneyScene),
   this layers LIVE motion over an AI-generated photoreal tree PLATE so
   the frame matches the client's reference as closely as possible.

   Two stacked, fixed, full-viewport layers (both portaled to <body>
   inside .scene-stage by the host, so they stay viewport-fixed under
   the smooth-scroll transform):

     1. THE PLATE — worldtree-tall.jpg (a vertical photoreal world-tree:
        emerald canopy -> gnarled trunk -> roots over mossy rock with a
        COBALT L1 glow at the base, misty mountains, god-rays). As the
        page scrolls DOWN, the plate PARALLAX-PANS from the canopy (top)
        to the roots (bottom): you literally descend the tree to the
        cobalt L1 bedrock = settlement. On very wide/short viewports we
        fall back to the wide plate with a gentler pan.

     2. LIVE OVERLAYS — a single <canvas> sized to the viewport, drawn
        each rAF, that adds the motion the still plate can't:
          - vertical EMERALD light-beams climbing the trunk region,
          - a green NETWORK (nodes + thin lines) with light PULSES that
            travel DOWN toward the roots (transactions -> settlement),
          - a few drifting / falling green leaves,
          - small wireframe ADA-diamond (octahedron) crystals slowly
            rotating + floating,
          - a subtle film grain.
        Everything is positioned over the trunk/canopy band and tuned to
        complement — not fight — the plate. The network "settles" toward
        cobalt as the descent reaches the roots.

   Driven by the SAME smoothed scroll `progressRef` the host feeds the
   3D scene, plus time. No per-scroll React state — pan + overlays read
   refs in the rAF loop, so scrolling never re-renders React.

   Reduced motion / motion-off / mobile (motionOn === false): the plate
   is shown STATIC (a calm mid-trunk framing, no pan) and the canvas
   draws the network ONCE as a static constellation (no beams, pulses,
   leaves, diamond spin, or grain). Cheap, legible, no scroll hijack.
   ============================================================ */

import { useEffect, useMemo, useRef, type RefObject } from "react";

/* ---- deterministic RNG (so the network/leaves are stable across mounts) */
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
const GOLD = "224, 163, 60"; // --gold-bright
const COBALT = "111, 224, 255"; // brighter L1 cyan

/* ----------------------------------------------------------------
   The plate's vertical "descent" is expressed as a background-position
   pan. The tall plate is taller than the viewport when covered, so we
   pan object-position from the canopy (top) to the roots (bottom).
   These bounds keep a little headroom/footroom so we never reveal an
   edge. p = 0 -> canopy, p = 1 -> roots.
   ---------------------------------------------------------------- */
const PAN_TOP = 6; // % object-position-y at the canopy
const PAN_BOTTOM = 96; // % object-position-y at the roots
const PAN_TOP_WIDE = 24; // gentler pan for the wide fallback
const PAN_BOTTOM_WIDE = 78;

/* ================================================================
   Overlay model — built once, deterministically, in plate-relative
   normalized coords (0..1 across the viewport). The trunk of the tall
   plate sits roughly in the centre-right; the network + beams hug that
   band. Coords are converted to px each frame against the live canvas
   size, so it stays responsive without rebuilding.
   ================================================================ */
type Node = { x: number; y: number; r: number; phase: number };
type Edge = { a: number; b: number };
type Pulse = { edge: number; t: number; speed: number };
type Beam = { x: number; w: number; phase: number; speed: number; h0: number; h1: number };
type LeafP = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; s: number; sway: number };
type Diamond = { x: number; y: number; s: number; rot: number; vr: number; bob: number; phase: number };

type Model = {
  nodes: Node[];
  edges: Edge[];
  pulses: Pulse[];
  beams: Beam[];
  leaves: LeafP[];
  diamonds: Diamond[];
};

/* The trunk band in normalized viewport coords for the TALL plate.
   The network is anchored to this band (a vertical column with the tree)
   so beams + nodes land on the trunk/canopy, not on empty mist. */
function buildModel(wide: boolean): Model {
  const rand = mulberry32(20260608);

  // trunk centre column + spread. Tall plate: tree centred slightly right.
  // Wide plate: tree pushed to the right third.
  const cx = wide ? 0.7 : 0.55;
  const spread = wide ? 0.16 : 0.2;

  // --- NODES: scattered down the trunk/canopy column, denser near the top
  // (canopy = lots of activity) thinning toward the roots. ---
  const NODE_COUNT = 22;
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const ty = i / (NODE_COUNT - 1); // 0 top .. 1 bottom
    // horizontal spread narrows as we go down (canopy wide, trunk narrow)
    const localSpread = spread * lerp(1.15, 0.32, ty);
    const x = cx + (rand() - 0.5) * 2 * localSpread;
    const y = lerp(0.06, 0.92, ty) + (rand() - 0.5) * 0.04;
    nodes.push({
      x,
      y,
      r: 2.0 + rand() * 2.6,
      phase: rand() * Math.PI * 2,
    });
  }

  // --- EDGES: connect each node to a couple of nearby nodes below/around
  // it, biased downward so the graph "flows" toward the roots. ---
  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    // nearest neighbours by distance, prefer ones lower on the trunk
    const order = nodes
      .map((n, j) => ({
        j,
        d:
          Math.hypot(n.x - nodes[i].x, (n.y - nodes[i].y) * 0.7) +
          (n.y < nodes[i].y ? 0.18 : 0), // penalise going up
      }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d);
    const links = 1 + Math.floor(rand() * 2); // 1..2 downward links
    for (let k = 0; k < links && k < order.length; k++) {
      const j = order[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: i, b: j });
    }
  }

  // --- PULSES: travelling lights on a subset of edges, always heading
  // toward the lower node (down the tree). ---
  const pulses: Pulse[] = [];
  const pulseCount = Math.min(edges.length, wide ? 7 : 9);
  for (let i = 0; i < pulseCount; i++) {
    pulses.push({
      edge: Math.floor(rand() * edges.length),
      t: rand(),
      speed: 0.18 + rand() * 0.26,
    });
  }

  // --- BEAMS: vertical emerald light-shafts riding the trunk column. ---
  const beams: Beam[] = [];
  const beamCount = wide ? 4 : 5;
  for (let i = 0; i < beamCount; i++) {
    const t = i / (beamCount - 1);
    beams.push({
      x: cx + (t - 0.5) * 2 * spread * 0.7 + (rand() - 0.5) * 0.02,
      w: 14 + rand() * 26,
      phase: rand() * Math.PI * 2,
      speed: 0.5 + rand() * 0.7,
      h0: 0.1 + rand() * 0.1, // top of beam (normalized y)
      h1: 0.78 + rand() * 0.14, // bottom of beam
    });
  }

  // --- LEAVES: a handful drifting/falling across the trunk region. ---
  const leaves: LeafP[] = [];
  const leafCount = wide ? 9 : 12;
  for (let i = 0; i < leafCount; i++) {
    leaves.push({
      x: cx + (rand() - 0.5) * 2 * (spread + 0.14),
      y: rand(),
      vx: (rand() - 0.5) * 0.012,
      vy: 0.02 + rand() * 0.03,
      rot: rand() * Math.PI * 2,
      vr: (rand() - 0.5) * 1.4,
      s: 5 + rand() * 6,
      sway: rand() * Math.PI * 2,
    });
  }

  // --- DIAMONDS: a few wireframe ADA octahedra floating along the trunk. ---
  const diamonds: Diamond[] = [];
  const diaCount = wide ? 3 : 4;
  for (let i = 0; i < diaCount; i++) {
    const t = (i + 0.5) / diaCount;
    diamonds.push({
      x: cx + (rand() - 0.5) * 2 * spread * 0.8,
      y: lerp(0.2, 0.82, t) + (rand() - 0.5) * 0.05,
      s: 12 + rand() * 12,
      rot: rand() * Math.PI * 2,
      vr: 0.2 + rand() * 0.3,
      bob: 0.01 + rand() * 0.012,
      phase: rand() * Math.PI * 2,
    });
  }

  return { nodes, edges, pulses, beams, leaves, diamonds };
}

/* ================================================================
   The canvas renderer. Pure 2D, additive-ish (lighter blend) so the
   green glow reads over the dark plate. Reads progress + time from
   refs; never touches React state.
   ================================================================ */
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  rot: number,
  color: string,
  alpha: number,
) {
  // a wireframe octahedron seen ~3/4: outer rhombus + inner cross edges,
  // squashed by a slow rotation to feel 3D.
  const sx = Math.cos(rot) * 0.55 + 0.45; // horizontal squash 0..1
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  ctx.lineWidth = 1.1;
  ctx.shadowColor = `rgba(${color}, ${alpha * 0.9})`;
  ctx.shadowBlur = 8;
  const w = s * sx;
  const h = s;
  // outer rhombus
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, h);
  ctx.lineTo(-w, 0);
  ctx.closePath();
  ctx.stroke();
  // equator + vertical axis (the octahedron's inner edges)
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.lineTo(w, 0);
  ctx.moveTo(0, -h);
  ctx.lineTo(0, h);
  ctx.stroke();
  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  rot: number,
  alpha: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = `rgba(${GREEN}, ${alpha})`;
  ctx.shadowColor = `rgba(${GREEN_MID}, ${alpha})`;
  ctx.shadowBlur = 6;
  // simple two-arc leaf
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.9, 0, 0, s);
  ctx.quadraticCurveTo(-s * 0.9, 0, 0, -s);
  ctx.fill();
  ctx.restore();
}

export default function PhotorealBackdrop({
  progressRef,
  motionOn,
  wide,
}: {
  /** smoothed 0..1 journey progress (same ref the 3D scene used) */
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

    // motion-off / reduced motion / mobile: a calm static framing on the
    // trunk, no pan, no rAF.
    if (!motionOn) {
      el.style.setProperty("--plate-y", `${lerp(top, bottom, 0.42)}%`);
      el.style.setProperty("--plate-scale", "1.02");
      return;
    }

    let raf = 0;
    let cur = clamp(progressRef.current ?? 0);
    const tick = () => {
      const target = clamp(progressRef.current ?? 0);
      // light smoothing on top of the already-smoothed progress for buttery pan
      cur += (target - cur) * 0.12;
      const e = smooth(cur);
      const y = lerp(top, bottom, e);
      // a touch of "push in" toward the roots for depth
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

    const { nodes, edges, pulses, beams, leaves, diamonds } = model;
    const nx = (n: { x: number }) => n.x * W;
    const ny = (n: { y: number }) => n.y * H;

    /* ---- the static network draw (also the reduced-motion frame) ---- */
    const drawNetwork = (p: number, glow: number) => {
      // settle colour shifts green -> cobalt as we near the roots
      const settle = smooth(clamp((p - 0.7) / 0.3));
      // edges
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const ax = nx(a);
        const ay = ny(a);
        const bx = nx(b);
        const by = ny(b);
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        g.addColorStop(0, `rgba(${GREEN}, ${0.1 * glow})`);
        g.addColorStop(1, `rgba(${GREEN}, ${0.22 * glow})`);
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      // nodes
      for (const n of nodes) {
        const x = nx(n);
        const y = ny(n);
        const col = settle > 0.5 && n.y > 0.7 ? COBALT : GREEN;
        ctx.fillStyle = `rgba(${col}, ${0.85 * glow})`;
        ctx.shadowColor = `rgba(${col}, ${0.9 * glow})`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    /* ---- STATIC path (reduced motion / motion-off / mobile) ---- */
    if (!motionOn) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      drawNetwork(0.42, 0.8);
      ctx.globalCompositeOperation = "source-over";
      // redraw once on resize so it stays sharp / repositioned
      const redraw = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";
        drawNetwork(0.42, 0.8);
        ctx.globalCompositeOperation = "source-over";
      };
      window.addEventListener("resize", redraw);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", redraw);
      };
    }

    /* ---- ANIMATED path ---- */
    let raf = 0;
    let last = performance.now();

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
      const settle = smooth(clamp((p - 0.7) / 0.3));

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      /* --- BEAMS: vertical emerald shafts climbing the trunk --- */
      for (const bm of beams) {
        const x = bm.x * W;
        const y0 = bm.h0 * H;
        const y1 = bm.h1 * H;
        const breathe = 0.5 + 0.5 * Math.sin(t * bm.speed + bm.phase);
        const w = bm.w * (0.7 + 0.5 * breathe);
        const a = (0.05 + 0.07 * breathe) * (1 - settle * 0.4);
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, `rgba(${GREEN}, 0)`);
        g.addColorStop(0.35, `rgba(${GREEN}, ${a})`);
        g.addColorStop(0.7, `rgba(${GREEN_MID}, ${a * 0.8})`);
        g.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - w / 2, y0, w, y1 - y0);
        // a brighter travelling glint riding up the beam
        const gy = y1 - ((t * bm.speed * 0.5 + bm.phase) % 1) * (y1 - y0);
        const gg = ctx.createRadialGradient(x, gy, 0, x, gy, w * 1.4);
        gg.addColorStop(0, `rgba(${GREEN}, ${0.18 * (1 - settle * 0.5)})`);
        gg.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(x, gy, w * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* --- NETWORK (edges + nodes) breathing --- */
      const netGlow = 0.85 + 0.15 * Math.sin(t * 0.8);
      drawNetwork(p, netGlow);

      /* --- PULSES travelling DOWN edges toward the roots --- */
      for (const pl of pulses) {
        pl.t += dt * pl.speed;
        if (pl.t > 1) {
          pl.t -= 1;
          // occasionally hop to another edge for variety
          if (Math.random() < 0.4) pl.edge = Math.floor(Math.random() * edges.length);
        }
        const e = edges[pl.edge];
        if (!e) continue;
        let a = nodes[e.a];
        let b = nodes[e.b];
        // ensure travel is downward (toward larger y = roots)
        if (a.y > b.y) {
          const tmp = a;
          a = b;
          b = tmp;
        }
        const x = lerp(nx(a), nx(b), pl.t);
        const y = lerp(ny(a), ny(b), pl.t);
        const col = settle > 0.4 ? COBALT : GREEN;
        const r = 3.2;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        gg.addColorStop(0, `rgba(${col}, 0.95)`);
        gg.addColorStop(0.4, `rgba(${col}, 0.5)`);
        gg.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* --- DIAMONDS: wireframe ADA octahedra slowly rotating/floating --- */
      for (const d of diamonds) {
        d.rot += dt * d.vr;
        const fy = (d.y + Math.sin(t * 0.5 + d.phase) * d.bob) * H;
        const fx = (d.x + Math.cos(t * 0.4 + d.phase) * 0.006) * W;
        const col = settle > 0.5 && d.y > 0.7 ? COBALT : GREEN;
        const a = 0.5 + 0.2 * Math.sin(t * 1.3 + d.phase);
        drawDiamond(ctx, fx, fy, d.s, d.rot, col, a);
      }

      /* --- LEAVES: drifting / falling green leaves --- */
      ctx.globalCompositeOperation = "lighter";
      for (const lf of leaves) {
        lf.sway += dt;
        lf.y += lf.vy * dt;
        lf.x += (lf.vx + Math.sin(lf.sway * 1.4) * 0.01) * dt;
        lf.rot += lf.vr * dt;
        if (lf.y > 1.06) {
          lf.y = -0.05;
          lf.x = clamp(lf.x + (Math.random() - 0.5) * 0.1, 0.1, 0.95);
        }
        const a = 0.25 + 0.25 * (0.5 + 0.5 * Math.sin(lf.sway));
        drawLeaf(ctx, lf.x * W, lf.y * H, lf.s, lf.rot, a);
      }

      ctx.globalCompositeOperation = "source-over";

      /* --- subtle grain --- */
      ctx.globalAlpha = 0.035;
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
