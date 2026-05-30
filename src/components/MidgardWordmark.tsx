"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   MidgardWordmark — the "Midgard" wordmark in Syne with a cursor
   spotlight: a soft green circle follows the pointer across the
   white letters and the letters spread slightly. It opens gently
   and eases back to rest slowly when the cursor leaves.

   Requires the Syne font available as CSS var --font-syne (wire it
   with next/font/google — see APPLY-wordmark.md). Falls back to a
   system sans if missing.
   ============================================================ */

export default function MidgardWordmark({
  text = "Midgard",
  radius = 130,
  className = "",
}: {
  text?: string;
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const word = ref.current;
    if (!word) return;
    let smx = -600, smy = -600, tx = -600, ty = -600, o = 0, ls = 0, inside = false, raf = 0;

    const onMove = (e: MouseEvent) => {
      const r = word.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      const m = 60;
      inside =
        e.clientX > r.left - m && e.clientX < r.right + m &&
        e.clientY > r.top - m && e.clientY < r.bottom + m;
    };
    const onLeave = () => { inside = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const loop = () => {
      smx += (tx - smx) * 0.18; smy += (ty - smy) * 0.18;            // soft trail
      const to = inside ? 1 : 0; o += (to - o) * (to > o ? 0.12 : 0.025);   // gentle open, slow fade
      const tls = inside ? 0.05 : 0; ls += (tls - ls) * (tls > ls ? 0.05 : 0.007); // open slow, settle slower
      word.style.setProperty("--mx", smx.toFixed(1) + "px");
      word.style.setProperty("--my", smy.toFixed(1) + "px");
      word.style.setProperty("--o", o.toFixed(3));
      word.style.setProperty("--ls", ls.toFixed(4) + "em");
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <span ref={ref} className={`mw ${className}`} style={{ ["--r" as string]: `${radius}px` }}>
      <span className="mw__base">{text}</span>
      <span className="mw__glow" aria-hidden="true">{text}</span>

      <style jsx>{`
        .mw {
          position: relative; display: inline-block;
          font-family: var(--font-syne), system-ui, sans-serif; font-weight: 700;
          letter-spacing: var(--ls, 0em); line-height: 1; user-select: none;
        }
        .mw__base { display: block; white-space: nowrap; color: #eaf2ec; }
        .mw__glow {
          position: absolute; inset: 0; display: block; white-space: nowrap;
          color: #3be863; opacity: var(--o, 0);
          text-shadow: 0 0 26px rgba(59, 232, 99, 0.45);
          -webkit-mask-image: radial-gradient(circle var(--r, 130px) at var(--mx, -600px) var(--my, -600px), #000 0%, #000 50%, transparent 100%);
          mask-image: radial-gradient(circle var(--r, 130px) at var(--mx, -600px) var(--my, -600px), #000 0%, #000 50%, transparent 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .mw { letter-spacing: 0 !important; }
          .mw__glow { display: none; }
        }
      `}</style>
    </span>
  );
}
