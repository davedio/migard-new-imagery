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

const HOLD_MS = 300; // the page opens fully runed for a readable beat
const STAGGER_MS = 55; // per-element domino delay
const STAGGER_CAP_MS = 2100; // the tail of a long page still opens promptly
const DECODE_MS = 420; // per-element reveal sweep
const SHUFFLE_MS = 48; // rune re-shuffle cadence while encoded

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
      const start = HOLD_MS + Math.min(i * STAGGER_MS, STAGGER_CAP_MS);
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

    /* strike the page into runes in one pass (before first paint of the
       effect — the rAF below begins decoding immediately) */
    for (const j of jobs) j.node.data = encode(j.original);

    const t0 = performance.now();
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
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      /* never leave the page struck mid-incantation */
      for (const j of jobs) j.node.data = j.original;
    };
  }, [motionOn]);

  return null;
}
