"use client";

/* ============================================================================
   WaveText — the Corn-Revolution header effect, take two (review: "the words
   appeared to split apart into glowing orbs that were connected").

   Each heading samples its own glyphs into particle home-points (the text is
   drawn to an offscreen canvas in its exact computed font, then the ink is
   sampled on a grid). Near the cursor, the DOM characters fade out and their
   particles take over: they scatter away from the pointer as luminous sap
   orbs — Midgard green with the odd gold bead — connected to their close
   neighbours by thin filaments (the constellation/plexus). Leave, and the
   orbs sail home and the type reassembles.

   Cost model: everything is parked until the pointer comes near a heading;
   one rAF loop per active heading; particles are root-relative so scrolling
   needs no re-measure. Fine pointers + motion-on only.
   ========================================================================== */

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { useMotionPref } from "@/lib/motion";

const RADIUS = 150; // px influence radius around the pointer
const SCATTER = 22; // max displacement: letters fracture in place, not into a trail
const LINK_F = 7.5; // link reach = sample stride x this

function splitChars(node: ReactNode, k: { n: number }): ReactNode {
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((seg) => {
      if (seg.length === 0) return null;
      if (seg.trim().length === 0) return seg; // raw whitespace keeps line wrapping
      return (
        <span className="cw-w" key={k.n++}>
          {[...seg].map((ch) => (
            <span className="cw-ch" key={k.n++}>
              {ch}
            </span>
          ))}
        </span>
      );
    });
  }
  if (Array.isArray(node)) return node.map((n) => splitChars(n, k));
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return cloneElement(el, { key: el.key ?? k.n++ }, splitChars(el.props.children, k));
  }
  return node;
}

type Particle = {
  hx: number; // home (root-relative)
  hy: number;
  x: number;
  y: number;
  a: number; // activation 0..1
  size: number;
  seed: number;
  gold: boolean;
};

export function WaveText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();

  useEffect(() => {
    const root = ref.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !motionOn) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = Array.from(root.querySelectorAll<HTMLElement>(".cw-ch"));
    if (chars.length === 0) return;

    /* the entrance mask would clip scattered orbs — once the reveal is long
       done, open it up (the mask only matters during the line reveal) */
    const mask = root.closest<HTMLElement>(".v2-mask");
    const maskTimer = window.setTimeout(() => {
      if (mask) mask.style.overflow = "visible";
    }, 1900);

    const PAD = 72; // canvas margin beyond the text box, room for scatter
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];
    let charPos: { x: number; y: number }[] = []; // char centers, root-relative
    let stride = 7;
    /* prominence scales with the type, but the effect should read as a
       fine connected mesh, not a big green particle spray. */
    let radiusEff = RADIUS;
    let scatterEff = SCATTER;
    let sizeBoost = 1;
    /* RESPONSIVENESS: the root rect is CACHED. Reading layout on every
       pointermove across a dozen headings thrashes the renderer and made
       the effect feel sticky — moves are now pure arithmetic, and the
       active instance refreshes its rect once per frame in the loop. */
    let rect: DOMRect | null = null;
    let ex = -9999; // last pointer, client coords
    let ey = -9999;
    let raf = 0;
    let active = false;
    let px = -9999; // pointer, root-relative
    let py = -9999;
    let pin = false; // pointer inside the influence zone
    let t = 0;
    let nearViewport = false;

    const build = () => {
      const rr = root.getBoundingClientRect();
      if (rr.width === 0) return;
      canvas.style.left = `${-PAD}px`;
      canvas.style.top = `${-PAD}px`;
      canvas.style.width = `${rr.width + PAD * 2}px`;
      canvas.style.height = `${rr.height + PAD * 2}px`;
      canvas.width = Math.round((rr.width + PAD * 2) * DPR);
      canvas.height = Math.round((rr.height + PAD * 2) * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      /* draw every char into an offscreen canvas at its exact place */
      const off = document.createElement("canvas");
      off.width = Math.max(2, Math.round(rr.width));
      off.height = Math.max(2, Math.round(rr.height));
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      charPos = [];
      let fontPx = 32;
      for (const ch of chars) {
        const cr = ch.getBoundingClientRect();
        const cs = getComputedStyle(ch);
        fontPx = parseFloat(cs.fontSize) || fontPx;
        octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const text = ch.textContent || "";
        const m = octx.measureText(text);
        const x = cr.left - rr.left;
        const y = cr.top - rr.top + (m.actualBoundingBoxAscent || fontPx * 0.78);
        octx.fillStyle = "#fff";
        octx.fillText(text, x, y);
        charPos.push({
          x: cr.left - rr.left + cr.width / 2,
          y: cr.top - rr.top + cr.height / 2,
        });
      }

      /* sample the ink on a grid → particle homes (denser = clearer
         letter-shaped constellations) */
      stride = Math.max(4, Math.round(fontPx / 15));
      radiusEff = Math.max(RADIUS, fontPx * 1.25);
      scatterEff = Math.max(SCATTER, fontPx * 0.2);
      sizeBoost = Math.min(1.9, Math.max(0.9, fontPx / 58));
      const data = octx.getImageData(0, 0, off.width, off.height).data;
      particles = [];
      for (let gy = 0; gy < off.height; gy += stride) {
        for (let gx = 0; gx < off.width; gx += stride) {
          if (data[(gy * off.width + gx) * 4 + 3] > 110) {
            particles.push({
              hx: gx,
              hy: gy,
              x: gx,
              y: gy,
              a: 0,
              size: 0.65 + Math.random() * 0.95,
              seed: Math.random() * Math.PI * 2,
              gold: Math.random() < 0.08,
            });
          }
        }
      }
    };

    const syncPointer = () => {
      if (!rect) rect = root.getBoundingClientRect();
      px = ex - rect.left;
      py = ey - rect.top;
      pin =
        px > -radiusEff &&
        px < rect.width + radiusEff &&
        py > -radiusEff &&
        py < rect.height + radiusEff;
    };

    const fall = (d: number, r: number) =>
      d >= r ? 0 : Math.pow(1 - d / r, 1.6);

    const tick = () => {
      t += 1 / 60;
      /* fresh geometry once per frame — tracking stays glued to the cursor
         through scroll and layout shifts with zero per-move layout reads */
      rect = root.getBoundingClientRect();
      syncPointer();
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      /* per-char fade — a CLEAN circular cutout directly under the cursor:
         inside the disc the type is gone, at the rim it cuts fast, outside
         it is untouched (review: clear cover over the cursor, seamless) */
      for (let i = 0; i < chars.length; i++) {
        const c = charPos[i];
        if (!c) continue;
        const f = pin ? fall(Math.hypot(c.x - px, c.y - py), radiusEff * 0.62) : 0;
        const el = chars[i];
        if (f > 0.02) {
          el.style.opacity = String(Math.max(0, 1 - f * 2.2));
          el.style.transform = `scale(${(1 - f * 0.06).toFixed(3)})`;
        } else if (el.style.opacity !== "") {
          el.style.opacity = "";
          el.style.transform = "";
        }
      }

      /* particles: activate near the cursor, breaking the glyphs apart in
         place. Hover-only attack, brisk reform; no click trail state. */
      const act: Particle[] = [];
      let energy = 0;
      for (const p of particles) {
        const d = Math.hypot(p.hx - px, p.hy - py);
        const target = pin ? fall(d, radiusEff) : 0;
        p.a += (target - p.a) * (target > p.a ? 0.78 : 0.28);
        if (p.a < 0.02) continue;
        energy = Math.max(energy, p.a);
        const dd = Math.max(8, d);
        const ux = (p.hx - px) / dd;
        const uy = (p.hy - py) / dd;
        const wob = Math.sin(t * 2.1 + p.seed) * 0.22 + 0.88;
        const mag = p.a * scatterEff * wob;
        /* a whisper of swirl keeps it organic without smearing the form */
        const sw = Math.sin(t * 1.4 + p.seed * 2) * p.a * 2.2;
        p.x = p.hx + ux * mag - uy * sw;
        p.y = p.hy + uy * mag + ux * sw;
        act.push(p);
      }

      /* filaments between close, active orbs — the connected constellation.
         Hard cap on the pair pass so dense headings can never jank a frame. */
      const reach = stride * LINK_F;
      ctx.lineWidth = 0.82;
      act.sort((a, b) => a.x - b.x);
      const linkN = Math.min(act.length, 520);
      for (let i = 0; i < linkN; i++) {
        const a = act[i];
        for (let j = i + 1; j < linkN; j++) {
          const b = act[j];
          const dx = b.x - a.x;
          if (dx > reach) break;
          const dy = a.y - b.y;
          if (dy > reach || dy < -reach) continue;
          const dist = Math.hypot(dx, dy);
          if (dist > reach) continue;
          const al = Math.min(a.a, b.a) * (1 - dist / reach) * 0.94;
          if (al < 0.014) continue;
          ctx.strokeStyle =
            a.gold || b.gold
              ? `rgba(224, 163, 60, ${Math.min(0.4, al * 0.72).toFixed(3)})`
              : `rgba(218, 255, 231, ${Math.min(0.52, al).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x + PAD, a.y + PAD);
          ctx.lineTo(b.x + PAD, b.y + PAD);
          ctx.stroke();
        }
      }

      /* fine nodes — green/gold halos with bone-white cores */
      ctx.globalCompositeOperation = "lighter";
      for (const p of act) {
        const r = p.size * sizeBoost * (0.68 + p.a * 0.74);
        const gx = p.x + PAD;
        const gy = p.y + PAD;
        ctx.beginPath();
        ctx.arc(gx, gy, r * 2.7, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(224, 163, 60, ${(p.a * 0.26).toFixed(3)})`
          : `rgba(78, 243, 131, ${(p.a * 0.24).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx, gy, r * 0.86, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(255, 233, 188, ${(p.a * 0.98).toFixed(3)})`
          : `rgba(244, 255, 248, ${(p.a * 0.96).toFixed(3)})`;
        ctx.shadowColor = p.gold
          ? "rgba(224, 163, 60, 0.78)"
          : "rgba(78, 243, 131, 0.72)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalCompositeOperation = "source-over";

      if (energy < 0.02 && !pin) {
        /* fully reassembled and the pointer is gone — park */
        ctx.clearRect(0, 0, w, h);
        chars.forEach((c) => {
          c.style.opacity = "";
          c.style.transform = "";
        });
        active = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const resetVisuals = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      chars.forEach((c) => {
        c.style.opacity = "";
        c.style.transform = "";
      });
    };

    const wake = () => {
      if (active) return;
      active = true;
      if (particles.length === 0) build();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (!nearViewport) return;
      ex = e.clientX;
      ey = e.clientY;
      syncPointer(); // pure arithmetic against the cached rect
      if (pin) wake();
    };
    const onScroll = () => {
      rect = null; // next move/frame re-measures
    };
    let rebuildTimer = 0;
    const onResize = () => {
      rect = null;
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => {
        particles = [];
        if (active) build();
      }, 180);
    };

    /* pre-build off the critical path as soon as the heading is on screen —
       the first hover must respond instantly, no build hiccup */
    const ric = (
      window as Window & { requestIdleCallback?: (cb: () => void) => number }
    ).requestIdleCallback;
    const idle = (cb: () => void) =>
      ric ? ric(cb) : window.setTimeout(cb, 60);
    const io = new IntersectionObserver(
      ([entry]) => {
        nearViewport = entry.isIntersecting;
        if (!nearViewport) {
          active = false;
          pin = false;
          cancelAnimationFrame(raf);
          resetVisuals();
          return;
        }
        if (particles.length === 0) {
          idle(() => {
            if (nearViewport && particles.length === 0) build();
          });
        }
      },
      { rootMargin: "24% 0px" },
    );
    io.observe(root);
    /* fonts may land late — resample once they're ready */
    void document.fonts?.ready.then(() => {
      if (particles.length) build();
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(maskTimer);
      window.clearTimeout(rebuildTimer);
      io.disconnect();
      cancelAnimationFrame(raf);
      resetVisuals();
    };
  }, [motionOn]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {splitChars(children, { n: 0 })}
      <canvas ref={canvasRef} className="cw-canvas" aria-hidden />
    </span>
  );
}
