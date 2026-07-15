"use client";

/* ============================================================
   HeroTreeImage — the light-mode home hero.

   A single painterly World Tree plate sits fixed behind the hero
   copy and follows a long canopy-to-roots scroll sequence. Art-
   directed: the wide dawn vista on landscape viewports, the tall
   single tree on portrait/phones. Motion respects the reduced-
   motion preference (the same hook the particle hero uses), and the
   whole layer is decorative (aria-hidden).

   The zoom transform lives on a MOVER wrapper rather than the image.
   The scroll sequence is keyed to the transaction section instead of
   disappearing after a fixed short distance.
   ============================================================ */

import { useEffect, useRef } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth01 = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export function HeroTreeImage() {
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  const stageRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const mover = moverRef.current;
    const stage = stageRef.current;
    if (!img || !mover || !stage) return;

    // Reduced motion: the stage is absolutely positioned (see CSS) so it
    // simply scrolls away with the hero — no zoom, no fixed-layer fade.
    if (!motionOn) {
      const style = window.getComputedStyle(img);
      const baseLift = Number.parseFloat(style.getPropertyValue("--hero-tree-base-lift")) || 0;
      mover.style.transform = `scale(1) translate3d(0, ${baseLift.toFixed(2)}%, 0)`;
      stage.style.opacity = "1";
      return;
    }

    let raf = 0;
    let current = 0;
    let target = 0;
    let runway = Math.max(1, window.innerHeight * 3.2);
    let baseLift = 0;
    let portrait = false;
    let last = performance.now();

    const measure = () => {
      const style = window.getComputedStyle(img);
      baseLift = Number.parseFloat(style.getPropertyValue("--hero-tree-base-lift")) || 0;
      portrait = window.matchMedia("(max-aspect-ratio: 4 / 5)").matches;
      const handoff = document.querySelector<HTMLElement>("[data-tree-handoff]");
      const handoffTop = handoff
        ? handoff.getBoundingClientRect().top + window.scrollY
        : window.innerHeight * 2.7;
      /* Three-plus screens gives the plate room to establish, travel through
         the role cards, and hand off only as the transaction story arrives. */
      runway = Math.max(
        window.innerHeight * 3.2,
        handoffTop + (handoff?.offsetHeight || 0) * 0.34,
      );
    };

    const applyFrame = () => {
      const camera = smooth01((current - 0.02) / 0.84);
      const scale = 1 + camera * (portrait ? 0.075 : 0.1);
      const lift = baseLift - camera * (portrait ? 1.1 : 1.6);
      const originX = portrait ? 55 : 72;
      const originY = portrait
        ? 34 + smooth01((current - 0.14) / 0.7) * 40
        : 28 + smooth01((current - 0.14) / 0.7) * 50;
      mover.style.transform = `scale(${scale.toFixed(4)}) translate3d(0, ${lift.toFixed(2)}%, 0)`;
      mover.style.transformOrigin = `${originX}% ${originY.toFixed(1)}%`;
      stage.style.opacity = (1 - smooth01((current - 0.88) / 0.12)).toFixed(3);
    };

    const frame = (now: number) => {
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      /* Frame-rate-independent damping: a trackpad fling glides, but scroll
         position remains the source of truth. */
      const amount = 1 - Math.exp(-delta / 0.18);
      current += (target - current) * amount;
      if (Math.abs(target - current) < 0.0001) current = target;
      applyFrame();
      if (current !== target) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    };

    const schedule = () => {
      target = clamp01(window.scrollY / runway);
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    target = clamp01(window.scrollY / runway);
    current = target;
    applyFrame();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [motionOn]);

  const pfx = theme === "dark" ? "/dark" : "";
  const V = `${pfx}/img/tree/tree-hero-vista`;
  const P = `${pfx}/img/tree/tree-hero-portrait`;

  return (
    <div
      ref={stageRef}
      className="hero-tree-stage"
      data-motion={motionOn ? "on" : "off"}
      aria-hidden="true"
    >
      <div className="hero-tree-stage__frame">
        <div ref={moverRef} className="hero-tree-stage__mover">
          <picture>
            {/* portrait single tree on tall/phone viewports */}
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
            {/* wide dawn vista everywhere else */}
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
              ref={imgRef}
              className="hero-tree-stage__img"
              src={`${V}-1920.webp`}
              alt=""
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </div>
      </div>
      <div className="hero-tree-stage__scrim" />
    </div>
  );
}

export default HeroTreeImage;
