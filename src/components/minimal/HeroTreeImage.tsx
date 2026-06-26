"use client";

/* ============================================================
   HeroTreeImage — the light-mode home hero.

   A single painterly World Tree plate sits fixed behind the hero
   copy and slowly ZOOMS IN as you scroll down the first screen, so
   the canopy fills the frame while the headline stays put. Art-
   directed: the wide dawn vista on landscape viewports, the tall
   single tree on portrait/phones. Motion respects the reduced-
   motion preference (the same hook the particle hero uses), and the
   whole layer is decorative (aria-hidden).
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
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return;

    // Reduced motion: the stage is absolutely positioned (see CSS) so it
    // simply scrolls away with the hero — no zoom, no fixed-layer fade.
    if (!motionOn) {
      const style = window.getComputedStyle(img);
      const baseLift = Number.parseFloat(style.getPropertyValue("--hero-tree-base-lift")) || 0;
      img.style.transform = `scale(1.02) translate3d(0, ${baseLift.toFixed(2)}%, 0)`;
      stage.style.opacity = "1";
      return;
    }

    let raf = 0;
    let current = 0;

    const frame = () => {
      // progress over the first ~1.2 screens of scroll
      const runway = Math.max(1, window.innerHeight * 1.2);
      const target = smooth01(window.scrollY / runway);
      // ease toward target so a flung scroll glides instead of snapping
      current += (target - current) * 0.12;
      const style = window.getComputedStyle(img);
      const baseLift = Number.parseFloat(style.getPropertyValue("--hero-tree-base-lift")) || 0;
      const scale = 1.02 + current * 0.17; // 1.02 → ~1.19, zooms into the canopy
      const lift = baseLift + current * -2.4; // baseline framing lift + gentle scroll drift (%)
      img.style.transform = `scale(${scale.toFixed(4)}) translate3d(0, ${lift.toFixed(2)}%, 0)`;
      // dissolve the fixed plate into the clean light page as the hero leaves
      stage.style.opacity = (1 - smooth01((current - 0.18) / 0.72)).toFixed(3);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
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
      <div className="hero-tree-stage__scrim" />
    </div>
  );
}

export default HeroTreeImage;
