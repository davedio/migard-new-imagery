"use client";

/* ============================================================
   HeroRiftCursor — the hero's "parallel universe" cursor lens.

   Moving the pointer over the home hero opens a clean circular
   window that reveals the night world: its page color, its plate
   with its own grading, its scrim, and a ghost clone of the hero
   copy in dark-mode ink, aligned glyph-for-glyph with the real
   text. Inside the circle the page inverts; outside, nothing
   changes.

   LIGHT MODE ONLY (Dave, 2026-07-24): the lens is a teaser that
   makes you want to flip the theme toggle. Once you're in dark
   mode you've arrived — no lens back into daylight.

   Direction 2026-07-23 (Dave): clean circle, small, no border, no
   zoom, and the revealed world must hold PERFECTLY still — only
   the window moves. So: one eased position drives both the hole
   and the world's exact counter-translation (zero lag, zero
   parallax, zero scale), and the lens appears/disappears with a
   plain opacity fade.

   Gates: mounts only with motion ON and a fine pointer; touch and
   reduced-motion users never mount it or download the second
   plate. Body-portaled above the copy (z10, under the z50 nav);
   pointer-events:none keeps the real page interactive through it.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StaticHeroHeading from "@/components/minimal/StaticHeroHeading";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { BENCHMARK_STATUS_NOTES, SITE_COPY } from "@/lib/siteCopy";

/* lens diameter in px — keep in sync with .hero-rift__hole in v2.css */
const HOLE = 88;

export default function HeroRiftCursor() {
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();

  /* fine-pointer gate, live-subscribed (HowItWorksExperience pattern) */
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* body portal so the lens sits ABOVE the hero copy — inside the
     circle the other universe replaces this one, text included */
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => {
    setPortalReady(true);
  }, []);

  const holeRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const active = motionOn && finePointer && theme === "light";

  useEffect(() => {
    const hole = holeRef.current;
    const world = worldRef.current;
    const ghost = ghostRef.current;
    if (!hole || !world || !ghost || !active || !portalReady) return;

    let raf = 0;
    let running = false;
    /* eased state: lens position + opacity (no scale — no zoom) */
    let x = 0;
    let y = 0;
    let o = 0;
    let tx = 0;
    let ty = 0;
    let oTarget = 0;
    let placed = false;
    let last = 0;
    let lastScroll = -1;
    let lastWrote = { x: -1, y: -1, o: -1 };
    let hidden = true;

    /* hero bounds cached in DOCUMENT space (they only move on layout,
       not on scroll) */
    let heroTop = 0;
    let heroBottom = 0;
    const measure = () => {
      const hero = document.getElementById("top");
      if (!hero) {
        heroTop = 0;
        heroBottom = window.innerHeight;
        return;
      }
      const rect = hero.getBoundingClientRect();
      heroTop = rect.top + window.scrollY;
      heroBottom = heroTop + rect.height;
      /* pin the ghost section at the real section's document offset so
         the two universes' text lines up glyph-for-glyph — and size it
         to the LAYOUT width (100vw includes the scrollbar, which would
         re-wrap the ghost text a few px differently) */
      ghost.style.top = `${heroTop.toFixed(1)}px`;
      const layoutW = document.documentElement.clientWidth;
      if (layoutW >= 320) {
        ghost.style.width = `${layoutW}px`;
        world.style.width = `${layoutW}px`;
      }
      lastScroll = -1;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const k = 1 - Math.exp(-dt / 0.085);
      x += (tx - x) * k;
      y += (ty - y) * k;
      const kO = 1 - Math.exp(-dt / (oTarget > o ? 0.1 : 0.16));
      o += (oTarget - o) * kO;

      if (o < 0.02 && oTarget === 0) {
        o = 0;
        if (!hidden) {
          hole.style.visibility = "hidden";
          hidden = true;
        }
        running = false;
        raf = 0;
        return;
      }
      if (hidden) {
        hole.style.visibility = "visible";
        hidden = false;
      }

      const settled =
        Math.abs(tx - x) < 0.25 && Math.abs(ty - y) < 0.25 &&
        Math.abs(oTarget - o) < 0.01;
      if (
        Math.abs(x - lastWrote.x) > 0.1 ||
        Math.abs(y - lastWrote.y) > 0.1 ||
        Math.abs(o - lastWrote.o) > 0.005
      ) {
        hole.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
          1,
        )}px, 0) translate(-50%, -50%)`;
        hole.style.opacity = o.toFixed(3);
        /* EXACT counter-translation from the same eased position: the
           revealed world is always pinned to the viewport — the page
           and text inside the lens never move, only the window does */
        world.style.transform = `translate3d(${(HOLE / 2 - x).toFixed(
          1,
        )}px, ${(HOLE / 2 - y).toFixed(1)}px, 0)`;
        lastWrote = { x, y, o };
      }
      /* the ghost copy lives in page space: counter-scroll it so the
         other universe's text stays glued to the real hero text */
      const sc = window.scrollY;
      if (sc !== lastScroll) {
        ghost.style.transform = `translate3d(0, ${(-sc).toFixed(1)}px, 0)`;
        lastScroll = sc;
      }

      if (settled) {
        running = false;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      running = true;
    };

    const schedule = () => {
      if (running) return;
      last = performance.now();
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const retarget = () => {
      const docY = ty + window.scrollY;
      oTarget = docY >= heroTop && docY <= heroBottom ? 1 : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!placed) {
        /* first contact: appear AT the cursor instead of flying in */
        x = tx;
        y = ty;
        placed = true;
      }
      retarget();
      schedule();
    };
    const onLeave = () => {
      oTarget = 0;
      schedule();
    };
    /* scrolling with the pointer parked can carry the hero away from
       under the cursor — re-evaluate so the lens fades itself out */
    const onScroll = () => {
      if (!placed) return;
      retarget();
      schedule();
    };
    const onResize = () => measure();

    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [active, portalReady]);

  if (!active || !portalReady) return null;

  /* light-mode-only lens: the revealed world is always the night one */
  const other = "dark" as const;
  const pfx = "/dark";
  const V = `${pfx}/img/tree/tree-hero-vista`;
  const P = `${pfx}/img/tree/tree-hero-portrait`;

  return createPortal(
    <div className="hero-rift" data-rift-theme={other} aria-hidden="true">
      <div ref={holeRef} className="hero-rift__hole">
        <div ref={worldRef} className="hero-rift__world">
          <picture>
            <source
              type="image/avif"
              media="(max-aspect-ratio: 4/5)"
              srcSet={`${P}-1000.avif 1000w, ${P}-1440.avif 1440w`}
              sizes="100vw"
            />
            <source
              type="image/webp"
              media="(max-aspect-ratio: 4/5)"
              srcSet={`${P}-1000.webp 1000w, ${P}-1440.webp 1440w`}
              sizes="100vw"
            />
            <source
              type="image/avif"
              srcSet={`${V}-1280.avif 1280w, ${V}-1920.avif 1920w, ${V}-2880.avif 2880w`}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={`${V}-1280.webp 1280w, ${V}-1920.webp 1920w, ${V}-2880.webp 2880w`}
              sizes="100vw"
            />
            <img
              className="hero-rift__img"
              src={`${V}-1920.webp`}
              alt=""
              decoding="async"
              fetchPriority="low"
            />
          </picture>
          <div className="hero-rift__scrim" />
          {/* the other universe's copy — same markup and classes as the
              real hero column, re-themed by the data-theme wrapper and
              counter-scrolled to stay glued to the real text */}
          <div ref={ghostRef} className="hero-rift__ghost" data-theme={other}>
            <section className="minimal-hero">
              <div className="minimal-hero__copy">
                <StaticHeroHeading lines={SITE_COPY.hero.titleLines} />
                <p>{SITE_COPY.hero.lead}</p>
                <p className="minimal-hero__benchmark-note">
                  {BENCHMARK_STATUS_NOTES.performanceCostReward}
                </p>
                <dl className="minimal-hero-stats">
                  {SITE_COPY.stats.map((stat) => (
                    <div className="minimal-hero-stat" key={stat.k}>
                      <dt>{stat.k}</dt>
                      <dd>
                        {stat.v}
                        <span>{stat.s}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="minimal-hero__dock">
                  <div className="minimal-actions">
                    <span className="minimal-btn minimal-btn--primary">
                      {SITE_COPY.hero.primaryCta.label}
                    </span>
                    <span className="minimal-btn minimal-btn--ghost">
                      {SITE_COPY.hero.secondaryCta.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="minimal-hero__visual-space" />
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
