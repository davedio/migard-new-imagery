"use client";

/* ============================================================
   useInView — IntersectionObserver gate for lazy / pausable layers.

   Used to defer mounting heavy R3F canvases until they scroll near the
   viewport, and (with `once: false`) to pause offscreen scenes. Mirrors
   the behaviour previously copy-pasted across the showcase components.
   ============================================================ */

import { useEffect, useRef, useState } from "react";

export function useInView<T extends Element = HTMLDivElement>({
  rootMargin = "300px 0px",
  once = true,
}: { rootMargin?: string; once?: boolean } = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Effects run client-side only, where IntersectionObserver is available.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);

  return [ref, inView] as const;
}
