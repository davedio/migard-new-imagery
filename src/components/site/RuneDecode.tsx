"use client";

/* ============================================================
   RuneDecode — the Contracts page's opening incantation.

   On first render (and every reload) the page's display text appears as
   Elder Futhark runes, then quickly decodes into English. The effect runs
   ONCE per page open; body sections, live widgets, and copy fields stay
   readable immediately.

   Mechanics, kept honest:
   · the server-rendered text stays English (SEO/no-JS/reduced-motion see
     plain copy); the scramble happens client-side after hydration
   · only TEXT NODES inside a tight selector list are mutated, so nested
     markup (accent spans, <strong>, Term links) survives intact
   · client widgets (live status, copy fields, addresses) are excluded —
     nobody wants to copy a rune-struck address
   ============================================================ */

import { useEffect } from "react";
import { useMotionPref } from "@/lib/motion";

/** display text that takes part in the incantation, in document order */
const TARGETS = [
  ".page-hero h1",
  ".page-hero .sub",
  "[data-rune-target]",
].join(", ");

/* Elder Futhark block */
const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
const rune = () => RUNES[(Math.random() * RUNES.length) | 0];

/* The rune beat should read as atmosphere, not a loading state. It starts
   almost immediately and only touches the hero/index text. */
const STAGGER_MS = 55;
const STAGGER_CAP_MS = 520;
const DECODE_MS = 360;
const TOUCH_FALLBACK_MS = 180;

export default function RuneDecode() {
  const { motionOn } = useMotionPref();

  useEffect(() => {
    if (!motionOn) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    type Job = {
      node: Text;
      original: string;
      /** the ONE fixed rune strike for this load — never re-rolled
          (review 2026-06-11: static runes, fresh per refresh) */
      runed: string;
      start: number; // reveal start, ms from t0
      lastCut: number;
    };
    const jobs: Job[] = [];
    const timers: number[] = [];
    let raf = 0;
    let disposed = false;

    /* collect text nodes per target element, in document order */
    const els = [...document.querySelectorAll<HTMLElement>(TARGETS)];
    els.forEach((el, i) => {
      if (el.closest("[data-no-rune]")) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const start = Math.min(i * STAGGER_MS, STAGGER_CAP_MS);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n as Text;
        if (!t.data.trim()) continue;
        jobs.push({ node: t, original: t.data, runed: "", start, lastCut: -1 });
      }
    });
    if (jobs.length === 0) return;

    const encode = (s: string) => {
      let out = "";
      for (const c of s) out += /[A-Za-z0-9]/.test(c) ? rune() : c;
      return out;
    };

    /* strike the page into runes in ONE roll — a different combination
       every load, but STATIC on screen until each element's domino flips
       it to English (no flicker, no re-shuffle) */
    for (const j of jobs) {
      j.runed = encode(j.original);
      j.node.data = j.runed;
    }

    let t0 = 0; // set when the wave is released
    let released = false;

    const release = () => {
      if (released || disposed) return;
      released = true;
      document.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("scroll", onTouch);
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    };
    /* the cursor must HIT runed text — not merely enter the page */
    const onPointer = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(TARGETS);
      if (hit && !hit.closest("[data-no-rune]")) release();
    };
    const onTouch = () => release();
    document.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("scroll", onTouch, { passive: true });
    timers.push(window.setTimeout(release, TOUCH_FALLBACK_MS));

    const tick = (now: number) => {
      const t = now - t0;
      let live = false;
      for (const j of jobs) {
        if (j.start > t) {
          live = true; // waiting its turn — untouched, perfectly still
          continue;
        }
        const p = (t - j.start) / DECODE_MS;
        if (p >= 1) {
          if (j.node.data !== j.original) j.node.data = j.original;
          continue;
        }
        live = true;
        /* the flip: English sweeps left to right over the FIXED runes */
        const cut = Math.floor(j.original.length * p);
        if (cut !== j.lastCut) {
          j.lastCut = cut;
          j.node.data = j.original.slice(0, cut) + j.runed.slice(cut);
        }
      }
      if (live && !disposed) raf = requestAnimationFrame(tick);
      else for (const j of jobs) j.node.data = j.original; // belt & braces
    };
    /* the wave starts in release(), not here */

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("scroll", onTouch);
      /* never leave the page struck mid-incantation */
      for (const j of jobs) j.node.data = j.original;
    };
  }, [motionOn]);

  return null;
}
