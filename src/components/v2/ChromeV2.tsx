"use client";

/* ============================================================================
   Site-wide V2 chrome: the scroll-progress hairline and the custom cursor.
   Mounted once from the (site) layout. The cursor stands down on
   /how-it-works, which mounts its own scene cursor, and on coarse pointers.
   ========================================================================== */

import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMotionPref } from "@/lib/motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });
  return (
    <div className="v2-progress" aria-hidden>
      <motion.div className="v2-progress__bar" style={{ scaleX }} />
    </div>
  );
}

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, [data-cursor]";

export function CursorV2() {
  const pathname = usePathname();
  const { motionOn } = useMotionPref();
  const ref = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFine(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const enabled = fine && motionOn && !pathname.startsWith("/how-it-works");

  useEffect(() => {
    const dot = ref.current;
    if (!dot || !enabled) return;

    let raf = 0;
    let tx = -100;
    let ty = -100;
    let cx = -100;
    let cy = -100;
    let seen = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        // snap to the pointer on first contact instead of flying in
        cx = tx;
        cy = ty;
        seen = true;
        dot.dataset.hidden = "false";
      }
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      dot.dataset.mode = hit ? "link" : "free";
    };
    const onLeave = () => {
      dot.dataset.hidden = "true";
      seen = false;
    };

    const tick = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      dot.style.left = `${cx - 4}px`;
      dot.style.top = `${cy - 4}px`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={ref} className="v2-cursor" data-hidden="true" aria-hidden />;
}
