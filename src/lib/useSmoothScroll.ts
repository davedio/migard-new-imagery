"use client";

/* ============================================================
   useSmoothScroll — a self-contained, library-free inertial scroll
   for the weighty "RESN" feel.

   How it works:
     - The page keeps its NATIVE scrollbar and native scroll height
       (we set body height = the scroll root's content height, position
       that root `fixed`, then translateY it). So keyboard, anchors,
       wheel, trackpad, and the scrollbar all behave normally.
     - The scroll root is the `[data-scroll-content]` wrapper from the
       (site) layout, which holds the page content AND the footer — so
       both translate together and nothing detaches. The fixed nav lives
       outside it and is untouched.
     - Each rAF we lerp a `smooth` offset toward the real `window.scrollY`
       and apply it as a transform on the root. Fast flicks glide to rest
       instead of snapping.
     - We publish a smoothed 0..1 progress into `progressRef` (read by
       the 3D scene) AND a raw 0..1 (for native-feeling UI sync).

   Reduced motion / motion-off: the whole hijack is bypassed — no
   transform, body height cleared, progress tracks native scroll
   directly. Touch / coarse pointers also bypass (native momentum
   already feels right and a transform would fight it).
   ============================================================ */

import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type Options = {
  /** lerp factor per frame at 60fps (0..1). Higher = snappier. */
  ease?: number;
};

export function useSmoothScroll(
  progressRef: React.RefObject<number>,
  motionOn: boolean,
  // 0.13 keeps the cinematic glide at roughly half the settle-lag of the
  // old 0.085 (design audit 2026-06-10, finding 04).
  { ease = 0.13 }: Options = {},
) {
  // raw native progress, updated on scroll (cheap, no transform)
  const rawProgressRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector<HTMLElement>("[data-scroll-content]");

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const smoothEnabled = motionOn && !coarse && !!root;

    const maxScroll = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const updateProgress = () => {
      const p = clamp(window.scrollY / maxScroll());
      rawProgressRef.current = p;
      if (!smoothEnabled) progressRef.current = p;
    };

    const clearLayout = () => {
      if (!root) return;
      root.style.transform = "";
      root.style.position = "";
      root.style.top = "";
      root.style.left = "";
      root.style.right = "";
      root.style.width = "";
      root.style.willChange = "";
      document.body.style.height = "";
    };

    // ---- NON-smooth path: native scroll drives everything ----
    if (!smoothEnabled || !root) {
      clearLayout();
      updateProgress();
      window.addEventListener("scroll", updateProgress, { passive: true });
      window.addEventListener("resize", updateProgress);
      return () => {
        window.removeEventListener("scroll", updateProgress);
        window.removeEventListener("resize", updateProgress);
      };
    }

    // ---- SMOOTH path: fixed root + rAF-lerped transform ----
    let raf = 0;
    let smooth = window.scrollY;
    let target = window.scrollY;
    let running = true;

    const applyLayout = () => {
      // body carries the real scroll height; root floats and is translated
      document.body.style.height = `${root.scrollHeight}px`;
      root.style.position = "fixed";
      root.style.top = "0";
      root.style.left = "0";
      root.style.right = "0";
      root.style.width = "100%";
      root.style.willChange = "transform";
    };

    const onScroll = () => {
      target = window.scrollY;
      updateProgress();
    };
    const onResize = () => {
      applyLayout();
      target = window.scrollY;
      updateProgress();
    };

    // keep body height correct as content/fonts/images settle
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => applyLayout())
        : null;

    const tick = () => {
      if (!running) return;
      smooth += (target - smooth) * ease;
      if (Math.abs(target - smooth) < 0.05) smooth = target;
      root.style.transform = `translate3d(0, ${-smooth}px, 0)`;
      progressRef.current = clamp(smooth / maxScroll());
      raf = window.requestAnimationFrame(tick);
    };

    applyLayout();
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    ro?.observe(root);
    raf = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      clearLayout();
    };
  }, [progressRef, motionOn, ease]);

  return rawProgressRef;
}
