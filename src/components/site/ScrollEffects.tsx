"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionPref } from "@/lib/motion";

/**
 * A prominent green "focus light" that sits at eye level (viewport centre) and
 * grows in as you scroll, blooming over whatever section is in focus and
 * tracking your eye down the page. Mounted once in the (site) layout.
 *
 * One rAF-throttled scroll listener sets `--grow` (0 at the top → 1 once you've
 * scrolled in); the CSS scales + fades the light from it. Gated on the shared
 * motion preference (hidden when motion is off / reduced).
 */
export function ScrollEffects() {
  const { motionOn } = useMotionPref();
  const pathname = usePathname();
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    if (!motionOn) {
      light.style.setProperty("--grow", "0");
      return;
    }

    let raf: number | null = null;
    const update = () => {
      raf = null;
      // grows in over the first ~0.6 viewport of scroll, then holds.
      const ramp = window.innerHeight * 0.6;
      const grow = ramp > 0 ? Math.min(1, Math.max(0, window.scrollY / ramp)) : 0;
      light.style.setProperty("--grow", grow.toFixed(3));
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [pathname, motionOn]);

  return <div className="focus-light" aria-hidden="true" ref={lightRef} />;
}
