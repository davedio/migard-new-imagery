"use client";

/* ============================================================
   JumpChips — a sticky in-page anchor bar ("bookmark jump buttons").

   · Sticks just below the fixed site nav (top 76px; z-index 40 —
     the nav owns 60, see v2.css .site-nav).
   · Horizontal row of pill buttons on a backdrop-blur panel;
     scrollable with a hidden scrollbar on narrow screens.
   · Click → smooth-scrolls to document.getElementById(id) with
     ~96px scroll-margin compensation (scrollIntoView + inline
     scroll-margin-top applied to targets that don't already set
     one), and mirrors the hash via history.replaceState.
   · An IntersectionObserver tracks which target section is most
     visible (by on-screen height, so tall sections win fairly) and
     fills that chip with the theme accent; the rest stay ghost.
   · Respects useMotionPref: motion off → instant jumps, no smooth
     behavior anywhere.

   Works in both themes off the existing v2.css custom properties
   (--text, --panel-edge, --green-bright …) with hardcoded
   fallbacks.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPref } from "@/lib/motion";
import styles from "./JumpChips.module.css";

export type JumpChipItem = { id: string; label: string };

const NAV_OFFSET = 96;
/* ignore observer updates briefly after a click, so the chip the user
   chose doesn't flicker through intermediate sections mid-scroll */
const CLICK_LOCK_MS = 900;

export default function JumpChips({
  items,
  ariaLabel = "On this page",
}: {
  items: JumpChipItem[];
  ariaLabel?: string;
}) {
  const { motionOn } = useMotionPref();
  const [activeId, setActiveId] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lockUntilRef = useRef(0);

  const idsKey = items.map((i) => i.id).join("|");

  /* honor a deep link on mount */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the deep-linked hash after mount (same precedent as lib/motion.tsx); SSR renders no active chip so there is no mismatch
    if (hash && items.some((i) => i.id === hash)) setActiveId(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idsKey stands in for items
  }, [idsKey]);

  /* ---- which section is most visible? ---- */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    /* visible on-screen height per section — a fairer "most visible"
       than intersectionRatio, which punishes tall sections */
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible.set(
            (e.target as HTMLElement).id,
            e.isIntersecting ? e.intersectionRect.height : 0,
          );
        }
        if (performance.now() < lockUntilRef.current) return;
        let bestId: string | null = null;
        let bestH = 0;
        for (const item of items) {
          const h = visible.get(item.id) ?? 0;
          if (h > bestH) {
            bestH = h;
            bestId = item.id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      {
        /* bias the measurement window below the fixed nav */
        rootMargin: "-86px 0px -25% 0px",
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
      },
    );
    for (const t of targets) io.observe(t);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idsKey stands in for items
  }, [idsKey]);

  /* keep the active chip in view inside the (possibly overflowing) row */
  useEffect(() => {
    if (!activeId) return;
    const row = rowRef.current;
    const chip = chipRefs.current.get(activeId);
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({
      left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2,
      behavior: motionOn ? "smooth" : "auto",
    });
  }, [activeId, motionOn]);

  const jump = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      /* window.scrollTo, not el.scrollIntoView — the journey page runs a
         custom smooth-scroll hook that position:fixed + transforms the
         [data-scroll-content] wrapper, which breaks scrollIntoView's
         scrollable-ancestor walk (it would silently no-op there). A
         viewport-rect-based target works on every page because it only
         ever reads the CURRENT rendered position, transform or not —
         the same technique the journey act's own beat-jump uses. */
      setActiveId(id);
      lockUntilRef.current = performance.now() + CLICK_LOCK_MS;
      const targetY = Math.max(
        0,
        el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
      );
      window.scrollTo({
        top: targetY,
        behavior: motionOn ? "smooth" : "instant",
      });
      window.history.replaceState(null, "", `#${id}`);
    },
    [motionOn],
  );

  if (items.length === 0) return null;

  return (
    <nav className={styles.bar} aria-label={ariaLabel}>
      <div ref={rowRef} className={styles.panel}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) chipRefs.current.set(item.id, node);
                else chipRefs.current.delete(item.id);
              }}
              type="button"
              className={[styles.chip, isActive ? styles.chipActive : null]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "true" : undefined}
              onClick={() => jump(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
