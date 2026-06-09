"use client";

/* ============================================================
   CustomCursor — the RESN-class cursor overlay.

   A DOM cursor (two layers: a small dot + a larger ring) that:
     - lerp-follows the pointer with inertia (the ring lags the dot),
     - MORPHS over interactive targets: scales up, shows a contextual
       label ("view" / "drag" / a section name) read from the target's
       `data-cursor` attribute,
     - exerts a MAGNETIC pull on elements tagged `data-magnetic`:
       the element eases toward the cursor while hovered, and the
       cursor ring snaps to the element's centre for a "locked" feel.

   Desktop + fine pointer + motion-on ONLY. Hidden on touch/coarse and
   under reduced motion. Renders nothing (and restores the native
   cursor) when disabled, so it never interferes with touch UX.

   The overlay is pointer-events:none and fixed on top; it never
   blocks clicks. Magnetic targets opt in with `data-magnetic` and
   are translated via a CSS variable so their own transitions/hover
   styles still compose.
   ============================================================ */

import { useEffect, useRef } from "react";

const LERP_DOT = 0.35;
const LERP_RING = 0.16;
const MAG_STRENGTH = 0.32; // how far a magnetic element follows the cursor
const MAG_RADIUS = 90; // px beyond the element's box that still attracts

export default function CustomCursor({ enabled }: { enabled: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.body.classList.add("cursor-none");

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { ...mouse };
    const ringPos = { ...mouse };

    let raf = 0;
    let hovering = false;
    let down = false;
    // currently-magnetised element + its rect, refreshed on enter
    let magnetEl: HTMLElement | null = null;
    let magnetRect: DOMRect | null = null;

    const findTarget = (el: Element | null): HTMLElement | null => {
      let node = el as HTMLElement | null;
      while (node && node !== document.body) {
        if (
          node.dataset.cursor !== undefined ||
          node.dataset.magnetic !== undefined ||
          node.tagName === "A" ||
          node.tagName === "BUTTON"
        ) {
          return node;
        }
        node = node.parentElement;
      }
      return null;
    };

    const setLabel = (text: string) => {
      label.textContent = text;
      ring.dataset.labelled = text ? "true" : "false";
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const target = findTarget(e.target as Element);
      if (target) {
        if (!hovering || magnetEl !== target) {
          hovering = true;
          ring.dataset.hover = "true";
          const labelText =
            target.dataset.cursor ??
            (target.tagName === "A" || target.tagName === "BUTTON" ? "" : "");
          setLabel(labelText);
          if (target.dataset.magnetic !== undefined) {
            magnetEl = target;
            magnetRect = target.getBoundingClientRect();
          } else {
            // releasing a previous magnet handled below
            if (magnetEl) releaseMagnet();
            magnetEl = null;
            magnetRect = null;
          }
        }
      } else if (hovering) {
        hovering = false;
        ring.dataset.hover = "false";
        setLabel("");
        if (magnetEl) releaseMagnet();
        magnetEl = null;
        magnetRect = null;
      }
    };

    const releaseMagnet = () => {
      if (!magnetEl) return;
      magnetEl.style.setProperty("--mag-x", "0px");
      magnetEl.style.setProperty("--mag-y", "0px");
      magnetEl.classList.remove("is-magnetic-active");
    };

    const onDown = () => {
      down = true;
      ring.dataset.down = "true";
    };
    const onUp = () => {
      down = false;
      ring.dataset.down = "false";
    };
    const onLeaveWindow = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnterWindow = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };
    const onScrollOrResize = () => {
      if (magnetEl) magnetRect = magnetEl.getBoundingClientRect();
    };

    const tick = () => {
      dotPos.x += (mouse.x - dotPos.x) * LERP_DOT;
      dotPos.y += (mouse.y - dotPos.y) * LERP_DOT;

      // ring snaps toward a magnetised element's centre, else follows the dot
      let ringTargetX = mouse.x;
      let ringTargetY = mouse.y;
      if (magnetEl && magnetRect) {
        const cx = magnetRect.left + magnetRect.width / 2;
        const cy = magnetRect.top + magnetRect.height / 2;
        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        const within =
          Math.abs(dx) < magnetRect.width / 2 + MAG_RADIUS &&
          Math.abs(dy) < magnetRect.height / 2 + MAG_RADIUS;
        if (within) {
          // pull the element toward the cursor
          magnetEl.classList.add("is-magnetic-active");
          magnetEl.style.setProperty("--mag-x", `${dx * MAG_STRENGTH}px`);
          magnetEl.style.setProperty("--mag-y", `${dy * MAG_STRENGTH}px`);
          // ring eases toward the element centre (locked feel)
          ringTargetX = cx + dx * 0.5;
          ringTargetY = cy + dy * 0.5;
        } else {
          releaseMagnet();
        }
      }

      ringPos.x += (ringTargetX - ringPos.x) * LERP_RING;
      ringPos.y += (ringTargetY - ringPos.y) * LERP_RING;

      dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${
        down ? 0.82 : hovering ? 1.9 : 1
      })`;

      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      releaseMagnet();
      document.body.classList.remove("cursor-none");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor-layer" aria-hidden>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" data-hover="false" data-down="false">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </div>
  );
}
