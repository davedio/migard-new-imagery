"use client";

/* ============================================================================
   Site-wide V2 chrome: the scroll-progress hairline mounted once from the
   (site) layout.
   ========================================================================== */

import { motion, useScroll, useSpring } from "motion/react";

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
