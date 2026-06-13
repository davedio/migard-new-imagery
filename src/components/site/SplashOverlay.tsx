"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import MidgardWordmark from "@/components/MidgardWordmark";
import { useMotionPref } from "@/lib/motion";

/** Matches the .splash--overlay CSS transition in globals.css. */
const FADE_MS = 900;
/* The cinematic beats, ms from mount. The branch pattern of the world
   tree was drawn FROM the Midgard logo, so the sequence makes that
   lineage explicit: tree alone -> the sigil surfaces out of the canopy ->
   the full MIDGARD lockup + Enter. */
const BEAT_LOGO = 2400;
const BEAT_TITLE = 4800;
/** Gentle auto-advance for visitors who just watch. */
const AUTO_ENTER = 13000;

type Phase = "tree" | "logo" | "title" | "leaving" | "gone";

/**
 * Cinematic entry overlay for the home page (two-page preview build:
 * shown on EVERY visit, no exceptions — no cookie gate, and a bfcache
 * restore replays it; see the pageshow listener below).
 *
 * Beats: the night world tree fades up from black; the Midgard sigil
 * materializes over the trunk (the silhouette echo); the wordmark +
 * tagline + Enter arrive. Clicking anywhere (or Enter/Space) enters
 * immediately at any beat; if nobody clicks, it eases in on its own.
 * Reduced motion jumps straight to the complete title card and never
 * auto-advances. Body scroll is locked while visible.
 */
export function SplashOverlay() {
  const { motionOn } = useMotionPref();
  const [phase, setPhase] = useState<Phase>("tree");
  /* bumped on a bfcache replay so the beat timeline rearms */
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  /* enter at any beat — the state updater guards re-entry, so this is
     stable and safe to share with the auto-advance timer */
  const enter = useCallback(() => {
    setPhase((p) => {
      if (p === "leaving" || p === "gone") return p;
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return "gone";
      window.setTimeout(() => setPhase("gone"), FADE_MS + 20);
      return "leaving";
    });
  }, []);

  /* the beat timeline — motion-off skips it (and never auto-advances) */
  useEffect(() => {
    if (!motionOn) return;
    const t1 = window.setTimeout(
      () => setPhase((p) => (p === "tree" ? "logo" : p)),
      BEAT_LOGO,
    );
    const t2 = window.setTimeout(
      () => setPhase((p) => (p === "tree" || p === "logo" ? "title" : p)),
      BEAT_TITLE,
    );
    const t3 = window.setTimeout(enter, AUTO_ENTER);
    timers.current.push(t1, t2, t3);
    return () => {
      for (const t of timers.current) window.clearTimeout(t);
      timers.current = [];
    };
  }, [motionOn, enter, run]);

  /* Back/forward-cache restores resurrect the page with the intro already
     dismissed — the ONLY way past the no-cookie gate. Replay from the
     first beat instead: the intro shows on every visit, every time. */
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setPhase("tree");
      setRun((n) => n + 1);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // Lock body scroll while the overlay is up.
  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "gone") return null;

  /* motion-off shows the finished title card immediately — the early
     beats are display-only, so this is derived, not state */
  const shownPhase =
    !motionOn && (phase === "tree" || phase === "logo") ? "title" : phase;

  return (
    <div
      className="splash splash--overlay splash--cinema"
      data-phase={shownPhase}
      data-leaving={phase === "leaving"}
      role="button"
      tabIndex={0}
      aria-label="Enter Midgard"
      onClick={enter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          enter();
        }
      }}
    >
      {/* the night world tree — the same plate the home descent rides */}
      <div className="splash__tree" aria-hidden />
      <div className="splash__veil splash__veil--cinema" aria-hidden />

      <div className="splash__content splash__content--cinema">
        {/* beat 2: the sigil surfaces over the trunk — the tree's branch
            pattern came from this mark, and here it shows */}
        <div className="splash__sigil" aria-hidden>
          <Image
            src="/midgard-icon.png"
            alt=""
            aria-hidden
            width={148}
            height={148}
            priority
          />
        </div>

        {/* beat 3: the full lockup */}
        <div className="splash__reveal">
          <div className="splash__lock" aria-hidden>
            <Image
              src="/midgard-icon.png"
              alt=""
              aria-hidden
              width={64}
              height={64}
              priority
            />
            <span className="wm">
              <MidgardWordmark radius={165} />
            </span>
          </div>
          <p className="splash__tagline" aria-hidden>
            A Cardano-native optimistic rollup
          </p>
          {/* Affordance only — the whole overlay is the actual control. */}
          <span className="splash__enter" aria-hidden>
            Enter Midgard
          </span>
        </div>

        {/* quiet skip affordance during the early beats */}
        <span className="splash__hint" aria-hidden>
          Click anywhere to enter
        </span>
      </div>
    </div>
  );
}
