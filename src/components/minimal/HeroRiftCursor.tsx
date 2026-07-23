"use client";

/* ============================================================
   HeroRiftCursor — the hero's "parallel universe" cursor tear.

   Moving the pointer over the home hero tears a ragged-edged rift
   in the page that reveals the OPPOSITE theme's hero world — in
   light mode the night hero (and vice versa) — as if the cursor is
   peeling through the fabric of this universe into its twin.
   Inspired by the buzz.xyz difference-blend cursor, but instead of
   inverting colors the blob is a registered window into the other
   theme: its page background, its plate (with its own grading),
   its scrim, AND its copy — a ghost clone of the hero text renders
   inside the rift in the other theme's colors, so the headline and
   stats flip dark/light with the world behind them.

   Mechanics (rAF + transforms; strings only for the living edge):
   - The HOLE trails the cursor with an eased lerp and scales
     open/closed; pointer velocity widens the tear.
   - The tear outline is ALIVE: each frame the jagged polygon's
     points breathe on two seeded sine octaves, and the clip-path +
     rim/depth strokes are rebuilt from the same point list so the
     edge writhes like ripping fabric, never a stamped die-cut.
   - The WORLD inside counter-translates so the revealed universe
     stays registered with the viewport, with a slight extra lag so
     the far side parallaxes like a space behind the canvas. The
     ghost copy additionally counter-scrolls so it stays glued to
     the real (scrolling) hero text.
   - The RIM is an SVG stroke trio (paper-backing fringe + mint
     sap-light burn + hot core) on the same morphing path, and a
     blurred inner shadow just inside the cut gives the fabric
     thickness.

   Gates: mounts only with motion ON and a fine pointer; touch and
   reduced-motion users never mount it or download the second
   plate. Renders inside .hero-tree-stage, inheriting its scroll
   fade and staying beneath the real copy layer.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StaticHeroHeading from "@/components/minimal/StaticHeroHeading";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { BENCHMARK_STATUS_NOTES, SITE_COPY } from "@/lib/siteCopy";

/* hole box size in px (diameter of the tear at rest) */
const HOLE = 380;

/* Deterministic jagged tear skeleton (site rule: no Math.random at
   render). The per-point phases drive the living morph; one shared
   point list feeds the CSS clip-path and every SVG stroke so the
   hole and its torn edge always match exactly. */
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

type TearPoint = {
  ang: number;
  r: number;
  p1: number;
  p2: number;
  p3: number;
};

const TEAR: TearPoint[] = (() => {
  const rnd = mulberry32(0x517cc1b7);
  const N = 28;
  const pts: TearPoint[] = [];
  for (let i = 0; i < N; i++) {
    const ang =
      (i / N) * Math.PI * 2 + (rnd() - 0.5) * ((Math.PI * 2) / N) * 0.55;
    /* base radius leaves margin inside the box for the rim strokes;
       occasional deep notches give the edge its ripped character */
    let r = 44 * (0.86 + 0.13 * rnd());
    if (rnd() < 0.2) r *= 0.8;
    pts.push({
      ang,
      r,
      p1: rnd() * Math.PI * 2,
      p2: rnd() * Math.PI * 2,
      p3: rnd() * Math.PI * 2,
    });
  }
  return pts;
})();

/* the tear outline at time t (seconds): two slow sine octaves per
   point so the rip breathes and shivers without ever repeating */
function tearOutline(t: number): { clip: string; d: string } {
  let clip = "";
  let d = "";
  for (let i = 0; i < TEAR.length; i++) {
    const p = TEAR[i];
    const r =
      p.r *
      (1 + 0.05 * Math.sin(1.1 * t + p.p1) + 0.035 * Math.sin(2.3 * t + p.p2));
    const ang = p.ang + 0.022 * Math.sin(1.6 * t + p.p3);
    const x = (50 + Math.cos(ang) * r).toFixed(2);
    const y = (50 + Math.sin(ang) * r).toFixed(2);
    clip += (i ? "," : "") + x + "% " + y + "%";
    d += (i ? " L " : "M ") + x + " " + y;
  }
  return { clip: `polygon(${clip})`, d: d + " Z" };
}

export default function HeroRiftCursor() {
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();

  /* fine-pointer gate, live-subscribed (HowItWorksExperience pattern) */
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* the rift renders into <body> so it can sit ABOVE the hero copy
     (inside the tear the other universe replaces this one, text and
     all — the registered ghost glyphs read as the same text flipping
     color). SSR-safe mount flag, same as the journey's BodyPortal. */
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => {
    setPortalReady(true);
  }, []);

  const holeRef = useRef<HTMLDivElement | null>(null);
  const cutRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const rimFringeRef = useRef<SVGPathElement | null>(null);
  const rimGlowRef = useRef<SVGPathElement | null>(null);
  const rimCoreRef = useRef<SVGPathElement | null>(null);
  const depthRef = useRef<SVGPathElement | null>(null);

  const active = motionOn && finePointer;

  useEffect(() => {
    const hole = holeRef.current;
    const cut = cutRef.current;
    const world = worldRef.current;
    const ghost = ghostRef.current;
    const paths = [
      rimFringeRef.current,
      rimGlowRef.current,
      rimCoreRef.current,
      depthRef.current,
    ];
    if (
      !hole ||
      !cut ||
      !world ||
      !ghost ||
      !active ||
      !portalReady ||
      paths.some((p) => !p)
    )
      return;

    let raf = 0;
    let running = false;
    /* eased state: hole position, laggier world position, open scale */
    let x = 0;
    let y = 0;
    let wx = 0;
    let wy = 0;
    let s = 0;
    let tx = 0;
    let ty = 0;
    let sTarget = 0;
    let placed = false;
    let last = 0;
    let lastScroll = -1;
    let hidden = true;
    let born = performance.now();

    /* hero bounds cached in DOCUMENT space (they only move on layout,
       not on scroll) */
    let heroTop = 0;
    let heroBottom = 0;
    const measure = () => {
      const hero = document.getElementById("top");
      if (!hero) {
        heroTop = 0;
        heroBottom = window.innerHeight;
        return;
      }
      const rect = hero.getBoundingClientRect();
      heroTop = rect.top + window.scrollY;
      heroBottom = heroTop + rect.height;
      /* pin the ghost section at the real section's document offset so
         the two universes' text lines up glyph-for-glyph — and size it
         to the LAYOUT width (100vw includes the scrollbar, which would
         re-wrap the ghost text a few px differently) */
      ghost.style.top = `${heroTop.toFixed(1)}px`;
      const layoutW = document.documentElement.clientWidth;
      if (layoutW >= 320) {
        ghost.style.width = `${layoutW}px`;
        world.style.width = `${layoutW}px`;
      }
      lastScroll = -1;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      /* pointer-follow easing; the world trails slightly harder so the
         revealed universe parallaxes behind the tear */
      const kHole = 1 - Math.exp(-dt / 0.085);
      const kWorld = 1 - Math.exp(-dt / 0.13);
      x += (tx - x) * kHole;
      y += (ty - y) * kHole;
      wx += (tx - wx) * kWorld;
      wy += (ty - wy) * kWorld;

      /* fast pointer drag rips the tear wider */
      const vel = Math.hypot(tx - x, ty - y);
      const widen = sTarget > 0 ? Math.min(0.16, vel * 0.0009) : 0;
      const sGoal = sTarget > 0 ? sTarget + widen : 0;
      const kS = 1 - Math.exp(-dt / (sGoal > s ? 0.14 : 0.2));
      s += (sGoal - s) * kS;

      if (s < 0.015 && sTarget === 0) {
        s = 0;
        if (!hidden) {
          hole.style.visibility = "hidden";
          hidden = true;
        }
        running = false;
        raf = 0;
        return;
      }
      if (hidden) {
        hole.style.visibility = "visible";
        hidden = false;
      }

      hole.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
        1,
      )}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
      /* register the world with the viewport: its (0,0) maps back to
         the viewport origin, using the laggier eased position */
      world.style.transform = `translate3d(${(HOLE / 2 - wx).toFixed(
        1,
      )}px, ${(HOLE / 2 - wy).toFixed(1)}px, 0)`;
      /* the ghost copy lives in page space: counter-scroll it so the
         other universe's text stays glued to the real hero text */
      const sc = window.scrollY;
      if (sc !== lastScroll) {
        ghost.style.transform = `translate3d(0, ${(-sc).toFixed(1)}px, 0)`;
        lastScroll = sc;
      }

      /* the LIVING edge: rebuild the tear outline every frame while
         open, so the rip writhes instead of gliding like a sticker */
      const { clip, d } = tearOutline((now - born) / 1000);
      cut.style.clipPath = clip;
      for (const p of paths) p!.setAttribute("d", d);

      /* while the tear is open it stays alive (the edge morphs even
         with the pointer parked); the loop only sleeps once closed */
      raf = requestAnimationFrame(frame);
      running = true;
    };

    const schedule = () => {
      if (running) return;
      last = performance.now();
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const retarget = () => {
      const docY = ty + window.scrollY;
      sTarget = docY >= heroTop && docY <= heroBottom ? 1 : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!placed) {
        /* first contact: appear AT the cursor instead of flying in */
        x = wx = tx;
        y = wy = ty;
        placed = true;
      }
      retarget();
      schedule();
    };
    const onLeave = () => {
      sTarget = 0;
      schedule();
    };
    /* scrolling with the pointer parked can carry the hero away from
       under the cursor — re-evaluate so the tear seals itself */
    const onScroll = () => {
      if (!placed) return;
      retarget();
      schedule();
    };
    const onResize = () => measure();

    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [active, portalReady]);

  if (!active || !portalReady) return null;

  /* the rift shows the OTHER world */
  const other = theme === "dark" ? "light" : "dark";
  const pfx = other === "dark" ? "/dark" : "";
  const V = `${pfx}/img/tree/tree-hero-vista`;
  const P = `${pfx}/img/tree/tree-hero-portrait`;
  const start = tearOutline(0);

  return createPortal(
    <div className="hero-rift" data-rift-theme={other} aria-hidden="true">
      <div ref={holeRef} className="hero-rift__hole">
        <div
          ref={cutRef}
          className="hero-rift__cut"
          style={{ clipPath: start.clip }}
        >
          <div ref={worldRef} className="hero-rift__world">
            <picture>
              <source
                type="image/avif"
                media="(max-aspect-ratio: 4/5)"
                srcSet={`${P}-1000.avif 1000w, ${P}-1440.avif 1440w`}
                sizes="100vw"
              />
              <source
                type="image/webp"
                media="(max-aspect-ratio: 4/5)"
                srcSet={`${P}-1000.webp 1000w, ${P}-1440.webp 1440w`}
                sizes="100vw"
              />
              <source
                type="image/avif"
                srcSet={`${V}-1280.avif 1280w, ${V}-1920.avif 1920w, ${V}-2880.avif 2880w`}
                sizes="100vw"
              />
              <source
                type="image/webp"
                srcSet={`${V}-1280.webp 1280w, ${V}-1920.webp 1920w, ${V}-2880.webp 2880w`}
                sizes="100vw"
              />
              <img
                className="hero-rift__img"
                src={`${V}-1920.webp`}
                alt=""
                decoding="async"
                fetchPriority="low"
              />
            </picture>
            <div className="hero-rift__scrim" />
            {/* the other universe's copy — same markup and classes as the
                real hero column, re-themed by the data-theme wrapper and
                counter-scrolled to stay glued to the real text */}
            <div ref={ghostRef} className="hero-rift__ghost" data-theme={other}>
              <section className="minimal-hero">
                <div className="minimal-hero__copy">
                  <StaticHeroHeading lines={SITE_COPY.hero.titleLines} />
                  <p>{SITE_COPY.hero.lead}</p>
                  <p className="minimal-hero__benchmark-note">
                    {BENCHMARK_STATUS_NOTES.performanceCostReward}
                  </p>
                  <dl className="minimal-hero-stats">
                    {SITE_COPY.stats.map((stat) => (
                      <div className="minimal-hero-stat" key={stat.k}>
                        <dt>{stat.k}</dt>
                        <dd>
                          {stat.v}
                          <span>{stat.s}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="minimal-hero__dock">
                    <div className="minimal-actions">
                      <span className="minimal-btn minimal-btn--primary">
                        {SITE_COPY.hero.primaryCta.label}
                      </span>
                      <span className="minimal-btn minimal-btn--ghost">
                        {SITE_COPY.hero.secondaryCta.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="minimal-hero__visual-space" />
              </section>
            </div>
          </div>
          {/* blurred shadow hugging the inside of the cut — the torn
              fabric has thickness and shades the world beneath. Lives in
              the CUT's box (not the world) so it rides the tear, and the
              cut's clip-path trims it to the inner half. */}
          <svg
            className="hero-rift__depth"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <filter
                id="hero-rift-depth-blur"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur stdDeviation="2.4" />
              </filter>
            </defs>
            <path
              ref={depthRef}
              className="hero-rift__depth-shadow"
              d={start.d}
              filter="url(#hero-rift-depth-blur)"
            />
          </svg>
        </div>
        <svg
          className="hero-rift__rim"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter
              id="hero-rift-glow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>
          {/* pale torn-paper backing behind the glow */}
          <path
            ref={rimFringeRef}
            className="hero-rift__rim-fringe"
            d={start.d}
          />
          {/* the sap-light burning along the tear */}
          <path
            ref={rimGlowRef}
            className="hero-rift__rim-glow"
            d={start.d}
            filter="url(#hero-rift-glow)"
          />
          <path ref={rimCoreRef} className="hero-rift__rim-core" d={start.d} />
        </svg>
      </div>
    </div>,
    document.body,
  );
}
