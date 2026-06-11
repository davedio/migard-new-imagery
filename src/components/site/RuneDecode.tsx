"use client";

/* ============================================================
   RuneDecode — the Contracts page's opening incantation.

   On first render (and every reload) the page's display text appears as
   Elder Futhark runes, then decodes into English in a staggered wave down
   the page — each element flashes through shuffling runes while a reveal
   cursor sweeps left to right. The effect runs ONCE per page open; nothing
   that renders later (scroll reveals, live widgets) is touched.

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
  ".page-hero .eyebrow",
  ".page-hero h1",
  ".page-hero .sub",
  ".page-sticky-toc a",
  ".section .eyebrow",
  ".section h2",
  ".section .lead",
].join(", ");

/* Elder Futhark block */
const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
const rune = () => RUNES[(Math.random() * RUNES.length) | 0];

/* The page WAITS in runes until the cursor first touches any runed text
   (review 2026-06-11) — then the dominoes fall, top to bottom, unhurried.
   Touch devices have no cursor: the first touch or scroll starts it, and a
   generous timer backstops both. */
const STAGGER_MS = 130; // per-element domino delay (slower, deliberate)
const STAGGER_CAP_MS = 3400; // the page tail still decodes promptly
const DECODE_MS = 700; // per-element reveal sweep
const SHUFFLE_MS = 105; // rune re-shuffle cadence — a flicker, not a spin
const TOUCH_FALLBACK_MS = 2500; // no cursor ever arrives → start anyway

export default function RuneDecode() {
  const { motionOn } = useMotionPref();

  useEffect(() => {
    if (!motionOn) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    type Job = {
      node: Text;
      original: string;
      start: number; // reveal start, ms from t0
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
        jobs.push({ node: t, original: t.data, start });
      }
    });
    if (jobs.length === 0) return;

    const encode = (s: string, from = 0) => {
      let out = s.slice(0, from);
      for (let i = from; i < s.length; i++) {
        const c = s[i];
        out += /[A-Za-z0-9]/.test(c) ? rune() : c;
      }
      return out;
    };

    /* strike the page into runes in one pass — it now WAITS, flickering
       gently, until the cursor touches any runed text */
    for (const j of jobs) j.node.data = encode(j.original);

    let t0 = 0; // set when the wave is released
    let released = false;

    /* a soft idle flicker while waiting (slow, so the letters don't "spin") */
    let idleTimer = 0;
    const idleFlicker = () => {
      for (const j of jobs) j.node.data = encode(j.original);
      idleTimer = window.setTimeout(idleFlicker, SHUFFLE_MS * 3);
    };
    idleTimer = window.setTimeout(idleFlicker, SHUFFLE_MS * 3);

    const release = () => {
      if (released || disposed) return;
      released = true;
      window.clearTimeout(idleTimer);
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

    let lastShuffle = 0;
    const tick = (now: number) => {
      const t = now - t0;
      let live = false;
      const shuffle = now - lastShuffle > SHUFFLE_MS;
      if (shuffle) lastShuffle = now;
      for (const j of jobs) {
        if (j.start > t) {
          live = true;
          if (shuffle) j.node.data = encode(j.original);
          continue;
        }
        const p = (t - j.start) / DECODE_MS;
        if (p >= 1) {
          if (j.node.data !== j.original) j.node.data = j.original;
          continue;
        }
        live = true;
        const cut = Math.floor(j.original.length * p);
        if (shuffle || cut > 0) j.node.data = encode(j.original, cut);
      }
      if (live && !disposed) raf = requestAnimationFrame(tick);
      else for (const j of jobs) j.node.data = j.original; // belt & braces
    };
    /* the wave starts in release(), not here */

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
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
