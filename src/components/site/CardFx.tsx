"use client";

import { useEffect } from "react";
import { useMotionPref } from "@/lib/motion";

/**
 * Interactive card depth, mounted once in the (site) layout. On fine-pointer
 * devices it gives every `.card` a cursor-following green glow and a subtle 3D
 * tilt toward the pointer. Pure enhancement over the static soft-green glow in
 * globals.css: delegated pointer handling (one listener), rAF-throttled, and
 * gated on the shared motion preference. Touch / reduced-motion get the static
 * glow only.
 */
const MAX_TILT = 7; // degrees

export function CardFx() {
  const { motionOn } = useMotionPref();

  useEffect(() => {
    if (typeof window === "undefined" || !motionOn) return;

    let raf: number | null = null;
    let pending: PointerEvent | null = null;
    let current: HTMLElement | null = null;

    const reset = (card: HTMLElement) => {
      card.style.transform = "";
      card.style.removeProperty("--card-glow");
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    };

    const apply = () => {
      raf = null;
      const e = pending;
      if (!e) return;
      const target = e.target as Element | null;
      const card = (target?.closest?.(".card") as HTMLElement | null) ?? null;

      if (card !== current) {
        if (current) reset(current);
        current = card;
      }
      if (!card) return;

      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height; // 0..1
      const rx = (0.5 - py) * 2 * MAX_TILT;
      const ry = (px - 0.5) * 2 * MAX_TILT;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
      card.style.setProperty("--card-glow", "1");
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // tilt for mouse/pen only
      pending = e;
      if (raf == null) raf = requestAnimationFrame(apply);
    };
    const onLeaveWindow = () => {
      if (current) {
        reset(current);
        current = null;
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveWindow);
      if (raf != null) cancelAnimationFrame(raf);
      if (current) reset(current);
    };
  }, [motionOn]);

  return null;
}
