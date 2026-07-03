"use client";

/* ============================================================================
   ShatterHeading — the Corn-Revolution heading cursor effect, DOM-honest.

   On the Corn site (verified by inspection): headings are solid until the
   cursor nears; the letters inside a ~100px field disintegrate into a
   constellation of small dots — a few faintly linked — that scatter from
   the pointer and reassemble when it leaves.

   Implementation contract (the two previous attempts died of jank — this
   one is built around their autopsies):
     · the text stays REAL DOM (selection, SEO, a11y); each letter is a span
     · letters near the cursor flip to opacity:0 while their pre-sampled
       pixel particles take over on a canvas overlay — at rest the particle
       cloud occupies the exact glyph pixels, so the swap is invisible
     · physics + drawing live in ONE rAF that only runs while disturbed;
       fully settled headings cost zero
     · drawing is batched fillRect with two fill styles — no shadowBlur,
       no per-particle arc(), no React state in the hot path
   ========================================================================== */

import { Fragment, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useMotionPref } from "@/lib/motion";

type Accent = "green" | "gold";

const FIELD_R = 60; // px — cursor influence radius (kept tight so the headline stays readable while pointing near it)
const SPRING_K = 92; // spring stiffness toward home
const SPRING_D = 11; // damping
const REPEL = 3300; // cursor repulsion strength
const SETTLE_EPS = 0.35; // px — when a particle counts as home

type Letter = {
  el: HTMLSpanElement;
  cx: number; // center, canvas space
  cy: number;
  active: boolean;
  /** crossfade after reassembly: 1 → 0 while the dust dissolves over the
      returning DOM glyph (review 2026-06-11: fade back, don't pop) */
  fade: number;
  p0: number; // particle range [p0, p1)
  p1: number;
};

const RESTORE_FADE_S = 0.3; // dust dissolve / glyph fade-in duration — quick, so words reassemble before you miss them

function paletteForTheme(theme: "light" | "dark") {
  return theme === "light"
    ? {
        colors: [
          "rgba(14, 27, 19, 0.92)",
          "rgba(12, 125, 54, 0.95)",
          "rgba(125, 92, 16, 0.95)",
        ],
        link: "rgba(14, 27, 19, 0.16)",
      }
    : {
        colors: [
          "rgba(232, 238, 229, 0.96)",
          "rgba(74, 222, 128, 0.95)",
          "rgba(255, 200, 64, 0.95)",
        ],
        link: "rgba(220, 240, 228, 0.14)",
      };
}

export default function ShatterHeading({
  as: Tag = "h2",
  lines,
  accents,
  className,
  style,
}: {
  as?: "h1" | "h2" | "h3";
  lines: string[];
  /** map a substring (e.g. "Cardano.") to an accent color */
  accents?: Record<string, Accent>;
  className?: string;
  style?: CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();

  /* split lines into WORDS of letters (wrapping happens at word boundaries,
     so a single-line heading can still break gracefully on small screens),
     tagging accent runs */
  const split = useMemo(() => {
    return lines.map((line) => {
      const marks: { start: number; end: number; accent: Accent }[] = [];
      for (const [needle, accent] of Object.entries(accents ?? {})) {
        const at = line.indexOf(needle);
        if (at >= 0) marks.push({ start: at, end: at + needle.length, accent });
      }
      const words: { ch: string; accent?: Accent }[][] = [];
      let word: { ch: string; accent?: Accent }[] = [];
      for (let i = 0; i < line.length; i++) {
        if (line[i] === " ") {
          if (word.length) words.push(word);
          word = [];
          continue;
        }
        const m = marks.find((mk) => i >= mk.start && i < mk.end);
        word.push({ ch: line[i], accent: m?.accent });
      }
      if (word.length) words.push(word);
      return words;
    });
  }, [lines, accents]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !motionOn) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let letters: Letter[] = [];
    /* flat particle store */
    let X: Float32Array = new Float32Array(0); // pos
    let Y: Float32Array = new Float32Array(0);
    let VX: Float32Array = new Float32Array(0); // velocity
    let VY: Float32Array = new Float32Array(0);
    let HX: Float32Array = new Float32Array(0); // home
    let HY: Float32Array = new Float32Array(0);
    let SZ: Float32Array = new Float32Array(0); // dot size
    let CG: Uint8Array = new Uint8Array(0); // color group 0 bone / 1 green / 2 gold
    let NR: Int32Array = new Int32Array(0); // right-neighbour index or -1
    let count = 0;

    const PAD = 130; // scatter room around the heading
    let cw = 0;
    let ch = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    /* Dust matches the active theme. This must follow live theme toggles:
       if the page mounts in light mode, then toggles to dark, stale dark-ink
       particles make the hovered letters look like they disappear. */
    const readTheme = (): "light" | "dark" =>
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    let activeTheme = readTheme();
    let palette = paletteForTheme(activeTheme);
    const syncTheme = () => {
      const next = readTheme();
      if (next === activeTheme) return;
      activeTheme = next;
      palette = paletteForTheme(next);
      if (count > 0) start();
    };

    /* ---- sample glyph pixels into particles ---- */
    const sample = () => {
      const rootRect = root.getBoundingClientRect();
      if (rootRect.width === 0) return;
      cw = Math.ceil(rootRect.width + PAD * 2);
      ch = Math.ceil(rootRect.height + PAD * 2);
      canvas.width = Math.round(cw * DPR);
      canvas.height = Math.round(ch * DPR);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      canvas.style.left = `${-PAD}px`;
      canvas.style.top = `${-PAD}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const spans = [...root.querySelectorAll<HTMLSpanElement>(".shx-ch")];
      const homesX: number[] = [];
      const homesY: number[] = [];
      const sizes: number[] = [];
      const groups: number[] = [];
      const neigh: number[] = [];
      letters = [];

      const off = document.createElement("canvas");
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      for (const span of spans) {
        const chr = span.dataset.ch ?? "";
        if (!chr.trim()) continue;
        const r = span.getBoundingClientRect();
        const cs = getComputedStyle(span);
        const fs = parseFloat(cs.fontSize);
        const stride = Math.max(3, Math.round(fs / 24));
        const w = Math.max(2, Math.ceil(r.width)) + 8;
        const h = Math.max(2, Math.ceil(r.height)) + 8;
        off.width = w;
        off.height = h;
        octx.clearRect(0, 0, w, h);
        octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        octx.textBaseline = "top";
        octx.fillStyle = "#fff";
        octx.fillText(chr, 4, 0);
        const data = octx.getImageData(0, 0, w, h).data;
        const group = span.dataset.accent === "green" ? 1 : span.dataset.accent === "gold" ? 2 : 0;
        const baseX = r.left - rootRect.left + PAD - 4;
        const baseY = r.top - rootRect.top + PAD;
        const p0 = homesX.length;
        /* grid sample; remember the previous index in this row for links */
        for (let yy = 0; yy < h; yy += stride) {
          let prev = -1;
          for (let xx = 0; xx < w; xx += stride) {
            if (data[(yy * w + xx) * 4 + 3] > 120) {
              const idx = homesX.length;
              homesX.push(baseX + xx);
              homesY.push(baseY + yy);
              sizes.push(2.0 + Math.random() * 1.5);
              groups.push(group);
              neigh.push(-1);
              if (prev >= 0 && idx - prev === 1) neigh[prev] = idx;
              prev = idx;
            }
          }
        }
        letters.push({
          el: span,
          cx: baseX + r.width / 2,
          cy: baseY + r.height / 2,
          active: false,
          fade: 0,
          p0,
          p1: homesX.length,
        });
      }

      count = homesX.length;
      cacheRect();
      X = Float32Array.from(homesX);
      Y = Float32Array.from(homesY);
      HX = Float32Array.from(homesX);
      HY = Float32Array.from(homesY);
      VX = new Float32Array(count);
      VY = new Float32Array(count);
      SZ = Float32Array.from(sizes);
      CG = Uint8Array.from(groups);
      NR = Int32Array.from(neigh);
    };

    /* ---- interaction ---- */
    let mx = -9e4;
    let my = -9e4;
    let raf = 0;
    let running = false;
    let lastT = 0;
    /* The viewport rect is CACHED — reading getBoundingClientRect on every
       pointermove forced a style/layout pass per heading per event (the
       documented cause of the first cursor effect's stickiness). Headings
       scroll with the page now, so a scroll marks the cache dirty and the
       next pointermove refreshes it once. */
    let canvasRect = { left: 0, top: 0 };
    let rectDirty = true;
    const cacheRect = () => {
      const r = canvas.getBoundingClientRect();
      canvasRect = { left: r.left, top: r.top };
      rectDirty = false;
    };
    const markDirty = () => {
      rectDirty = true;
    };
    window.addEventListener("scroll", markDirty, { passive: true });

    const visible = () => {
      /* skip work while our overlay band is faded out */
      const ov = root.closest<HTMLElement>(".v2-ov");
      return !ov || ov.dataset.active === "true";
    };

    let lastCX = -9e4;
    let lastCY = -9e4;
    const onMove = (e: PointerEvent) => {
      if (!visible() || count === 0) return;
      /* Chrome re-fires pointermove on scroll with an UNMOVED cursor — only
         real movement may wake the letters, or page jumps shatter headings
         the user never touched */
      const moved = Math.hypot(e.clientX - lastCX, e.clientY - lastCY);
      const firstSeen = lastCX < -8e4;
      lastCX = e.clientX;
      lastCY = e.clientY;
      if (rectDirty) cacheRect();
      mx = e.clientX - canvasRect.left;
      my = e.clientY - canvasRect.top;
      if (firstSeen || moved < 2) return;
      /* wake letters whose center is within reach */
      for (const L of letters) {
        if (L.active) continue;
        if (Math.hypot(L.cx - mx, L.cy - my) < FIELD_R * 1.15) {
          L.active = true;
          L.fade = 0;
          /* hide FAST on wake; the slow CSS transition is for the return */
          L.el.style.transition = "opacity 0.07s linear";
          L.el.style.opacity = "0";
          if (!running) start();
        }
      }
    };
    const onLeave = () => {
      mx = -9e4;
      my = -9e4;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.04, (now - lastT) / 1000) || 0.016;
      lastT = now;

      ctx.clearRect(0, 0, cw, ch);
      let anyActive = false;

      for (const L of letters) {
        /* post-reassembly crossfade: the dust dissolves at home while the
           DOM glyph fades in beneath it — no pop */
        if (!L.active && L.fade > 0) {
          L.fade = Math.max(0, L.fade - dt / RESTORE_FADE_S);
          if (L.fade > 0.004) {
            anyActive = true;
            ctx.globalAlpha = L.fade;
            for (let g = 0; g < 3; g++) {
              ctx.fillStyle = palette.colors[g];
              for (let i = L.p0; i < L.p1; i++) {
                if (CG[i] !== g) continue;
                const s = SZ[i];
                ctx.fillRect(X[i] - s / 2, Y[i] - s / 2, s, s);
              }
            }
            ctx.globalAlpha = 1;
          }
          continue;
        }
        if (!L.active) continue;
        let settled = true;
        const far = Math.hypot(L.cx - mx, L.cy - my) > FIELD_R * 1.3;

        for (let i = L.p0; i < L.p1; i++) {
          const dx = X[i] - mx;
          const dy = Y[i] - my;
          const d2 = dx * dx + dy * dy;
          /* cursor repulsion inside the field */
          if (d2 < FIELD_R * FIELD_R) {
            const d = Math.max(10, Math.sqrt(d2));
            const f = (REPEL * (1 - d / FIELD_R)) / d;
            VX[i] += dx * f * dt;
            VY[i] += dy * f * dt;
            /* constellation jitter */
            VX[i] += (Math.random() - 0.5) * 30 * dt * 60;
            VY[i] += (Math.random() - 0.5) * 30 * dt * 60;
          }
          /* spring home */
          VX[i] += (HX[i] - X[i]) * SPRING_K * dt;
          VY[i] += (HY[i] - Y[i]) * SPRING_K * dt;
          const damp = Math.max(0, 1 - SPRING_D * dt);
          VX[i] *= damp;
          VY[i] *= damp;
          X[i] += VX[i] * dt;
          Y[i] += VY[i] * dt;
          if (
            settled &&
            (Math.abs(X[i] - HX[i]) > SETTLE_EPS ||
              Math.abs(Y[i] - HY[i]) > SETTLE_EPS ||
              Math.abs(VX[i]) > 6 ||
              Math.abs(VY[i]) > 6)
          ) {
            settled = false;
          }
        }

        if (settled && far) {
          /* freeze exactly at home and begin the crossfade: glyph fades in
             on the slow CSS transition while the dust dissolves above it */
          for (let i = L.p0; i < L.p1; i++) {
            X[i] = HX[i];
            Y[i] = HY[i];
            VX[i] = 0;
            VY[i] = 0;
          }
          L.active = false;
          L.fade = 1;
          L.el.style.transition = "";
          L.el.style.opacity = "";
          anyActive = true;
          continue;
        }
        anyActive = true;

        /* ---- draw: batched by color group ---- */
        for (let g = 0; g < 3; g++) {
          ctx.fillStyle = palette.colors[g];
          for (let i = L.p0; i < L.p1; i++) {
            if (CG[i] !== g) continue;
            const s = SZ[i];
            ctx.fillRect(X[i] - s / 2, Y[i] - s / 2, s, s);
          }
        }
        /* faint constellation links between displaced row-neighbours */
        ctx.strokeStyle = palette.link;
        ctx.lineWidth = 1;
        ctx.beginPath();
        let seg = 0;
        for (let i = L.p0; i < L.p1 && seg < 220; i += 2) {
          const j = NR[i];
          if (j < 0) continue;
          const ddx = X[i] - HX[i];
          const ddy = Y[i] - HY[i];
          if (ddx * ddx + ddy * ddy < 9) continue; // only displaced dust links
          ctx.moveTo(X[i], Y[i]);
          ctx.lineTo(X[j], Y[j]);
          seg++;
        }
        ctx.stroke();
      }

      if (!anyActive) stop();
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, cw, ch);
    };

    /* sample once fonts are real, resample on box changes */
    let sampleTimer = 0;
    const queueSample = () => {
      window.clearTimeout(sampleTimer);
      sampleTimer = window.setTimeout(() => {
        if (!disposed) sample();
      }, 120);
    };
    document.fonts?.ready.then(() => !disposed && sample());
    sample();
    const ro = new ResizeObserver(queueSample);
    ro.observe(root);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(sampleTimer);
      ro.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("scroll", markDirty);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [motionOn, split]);

  return (
    <div ref={rootRef} className="v2-shx" style={style}>
      <Tag className={className} aria-label={lines.join(" ")}>
        {split.map((words, li) => (
          <Fragment key={li}>
            {li > 0 ? " " : null}
            <span className="shx-line" aria-hidden>
              {words.map((word, wi) => (
                <span key={wi}>
                  {wi > 0 ? " " : null}
                  <span className="shx-w">
                    {word.map((r, ci) => (
                      <span
                        key={ci}
                        className="shx-ch"
                        data-ch={r.ch}
                        data-accent={r.accent}
                      >
                        {r.ch}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </Tag>
      <canvas ref={canvasRef} className="v2-shx__canvas" aria-hidden />
    </div>
  );
}
