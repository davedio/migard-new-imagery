"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionPref } from "@/lib/motion";

/**
 * Site-wide scroll enhancements (Phase 1), mounted once in the (site) layout:
 *
 *  - Progress "spine": a thin left-edge line that fills green → gold as you
 *    move down the page (orientation cue, echoes the data-spine motif).
 *  - Active-section spotlight: the major block crossing the viewport centre
 *    stays full-strength while the others ease to a dimmer state, so focus
 *    follows the scroll.
 *
 * One rAF-throttled scroll listener drives both. The spotlight is gated on the
 * shared motion preference (manual toggle + OS reduced-motion); when motion is
 * off, all blocks return to full strength. Re-queries on route change.
 */
export function ScrollEffects() {
  const { motionOn } = useMotionPref();
  const pathname = usePathname();
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number | null = null;
    let blocks: Element[] = [];

    const refresh = () => {
      blocks = Array.from(
        document.querySelectorAll(
          ".page-main .page-hero, .page-main .section, .page-main .cta-band",
        ),
      );
      for (const b of blocks) b.setAttribute("data-spot", "");
    };

    const update = () => {
      raf = null;

      // progress spine
      const docEl = document.documentElement;
      const max = docEl.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fillRef.current?.style.setProperty("--scroll-progress", p.toFixed(4));

      // active-section spotlight
      if (!motionOn) {
        for (const b of blocks) b.removeAttribute("data-focus");
        return;
      }
      const center = window.innerHeight / 2;
      let activeIdx = -1;
      let best = Infinity;
      for (let i = 0; i < blocks.length; i++) {
        const r = blocks[i].getBoundingClientRect();
        if (r.top <= center && r.bottom >= center) {
          activeIdx = i;
          break;
        }
        const d = Math.min(Math.abs(r.top - center), Math.abs(r.bottom - center));
        if (d < best) {
          best = d;
          activeIdx = i;
        }
      }
      for (let i = 0; i < blocks.length; i++) {
        blocks[i].setAttribute("data-focus", i === activeIdx ? "active" : "dim");
      }
    };

    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };

    refresh();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [pathname, motionOn]);

  return (
    <div className="scroll-spine" aria-hidden="true">
      <div className="scroll-spine__fill" ref={fillRef} />
    </div>
  );
}
