"use client";

/* ============================================================
   HeroRiftCursor — the hero's "parallel universe" cursor tear.

   Moving the pointer over the home hero tears a ragged-edged rift
   in the backdrop that reveals the OPPOSITE theme's hero world —
   in light mode the night hero (and vice versa) — as if the cursor
   is peeling through the fabric of this universe into its twin.
   Inspired by the buzz.xyz difference-blend cursor, but instead of
   inverting colors the blob is a registered window into the other
   theme: its page background, its plate (with its own grading),
   its scrim.

   Mechanics (all compositor-only after load):
   - The HOLE (fixed-size box, jagged clip-path) trails the cursor
     with an eased lerp and scales open/closed; pointer velocity
     widens the tear.
   - The WORLD inside counter-translates so the revealed universe
     stays registered with the viewport (same geometry as the real
     hero art at hero scroll depth), with a slight extra lag so the
     far side parallaxes like a space behind the canvas.
   - The RIM is an SVG stroke pair on the same jagged path: a pale
     "torn paper backing" fringe + the mint sap-light glow.

   Gates: mounts only with motion ON and a fine pointer (the same
   advanced gate as the journey HUD), so touch/reduced-motion users
   never pay for the second plate. Renders inside .hero-tree-stage,
   inheriting its scroll fade and z-order (beneath the hero copy).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

/* hole box size in px (diameter of the tear at rest) */
const HOLE = 380;

/* Deterministic jagged tear outline (site rule: no Math.random at
   render). One shared point list feeds both the CSS clip-path and
   the SVG rim so the hole and its torn edge match exactly. */
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

const TEAR_POINTS: { x: number; y: number }[] = (() => {
  const rnd = mulberry32(0x517cc1b7);
  const N = 28;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < N; i++) {
    const ang =
      (i / N) * Math.PI * 2 + (rnd() - 0.5) * ((Math.PI * 2) / N) * 0.55;
    /* base radius leaves margin inside the box for the rim strokes;
       occasional deep notches give the edge its ripped character */
    let r = 46 * (0.86 + 0.13 * rnd());
    if (rnd() < 0.2) r *= 0.8;
    pts.push({
      x: 50 + Math.cos(ang) * r,
      y: 50 + Math.sin(ang) * r,
    });
  }
  return pts;
})();

const TEAR_CLIP = `polygon(${TEAR_POINTS.map(
  (p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`,
).join(",")})`;

const TEAR_PATH = `M ${TEAR_POINTS.map(
  (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
).join(" L ")} Z`;

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

  const holeRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const active = motionOn && finePointer;

  useEffect(() => {
    const hole = holeRef.current;
    const world = worldRef.current;
    if (!hole || !world || !active) return;

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
    let lastWrote = { x: -1, y: -1, s: -1 };
    let hidden = true;

    /* hero bounds cached in DOCUMENT space (they only move on layout,
       not on scroll — unlike ShatterHeading's viewport-space cache) */
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

      /* fast pointer drag widens the tear */
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

      const settled =
        Math.abs(tx - x) < 0.25 &&
        Math.abs(ty - y) < 0.25 &&
        Math.abs(sGoal - s) < 0.002;
      if (
        Math.abs(x - lastWrote.x) > 0.1 ||
        Math.abs(y - lastWrote.y) > 0.1 ||
        Math.abs(s - lastWrote.s) > 0.001
      ) {
        hole.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
          1,
        )}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
        /* register the world with the viewport: its (0,0) maps back to
           the viewport origin, using the laggier eased position */
        world.style.transform = `translate3d(${(HOLE / 2 - wx).toFixed(
          1,
        )}px, ${(HOLE / 2 - wy).toFixed(1)}px, 0)`;
        lastWrote = { x, y, s };
      }

      if (settled) {
        /* idle — open or closed, nothing moves until the next pointer
           event re-schedules the loop */
        running = false;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      running = true;
    };

    const schedule = () => {
      if (running) return;
      last = performance.now();
      running = true;
      raf = requestAnimationFrame(frame);
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
      const docY = e.clientY + window.scrollY;
      sTarget = docY >= heroTop && docY <= heroBottom ? 1 : 0;
      schedule();
    };
    const onLeave = () => {
      sTarget = 0;
      schedule();
    };
    const onResize = () => measure();

    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  if (!active) return null;

  /* the rift shows the OTHER world */
  const other = theme === "dark" ? "light" : "dark";
  const pfx = other === "dark" ? "/dark" : "";
  const V = `${pfx}/img/tree/tree-hero-vista`;
  const P = `${pfx}/img/tree/tree-hero-portrait`;

  return (
    <div className="hero-rift" data-rift-theme={other} aria-hidden="true">
      <div ref={holeRef} className="hero-rift__hole">
        <div className="hero-rift__cut" style={{ clipPath: TEAR_CLIP }}>
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
          </div>
        </div>
        <svg
          className="hero-rift__rim"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="hero-rift-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>
          {/* pale torn-paper backing behind the glow */}
          <path className="hero-rift__rim-fringe" d={TEAR_PATH} />
          {/* the sap-light burning along the tear */}
          <path
            className="hero-rift__rim-glow"
            d={TEAR_PATH}
            filter="url(#hero-rift-glow)"
          />
          <path className="hero-rift__rim-core" d={TEAR_PATH} />
        </svg>
      </div>
    </div>
  );
}
