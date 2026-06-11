"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MidgardWordmark from "@/components/MidgardWordmark";
import { useMotionPref } from "@/lib/motion";

const COOKIE = "midgard_entered";
/** ~180 days, in seconds. */
const COOKIE_MAX_AGE = 15552000;
/** Matches the .splash--overlay CSS transition in globals.css. */
const FADE_MS = 700;

/**
 * One-time cinematic entry overlay for the home page.
 *
 * Reproduces the old `/` splash (static green world-tree + veil + wordmark)
 * as a fixed full-viewport layer above the nav. The whole surface is one big
 * "Enter Midgard" control: clicking anywhere (or Enter/Space) sets the
 * `midgard_entered` cookie, fades the overlay out (~700ms, instant under
 * reduced motion) and unmounts it. Body scroll is locked while visible.
 *
 * The server decides whether to render this at all — see src/app/(site)/page.tsx,
 * which reads cookies() so returning visitors never see a flash.
 */
export function SplashOverlay() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");
  const timer = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { motionOn } = useMotionPref();

  /* The forest flyover: fades in over the static plate once it can play,
     and breathes down just before each loop point so the restart cut reads
     as a slow exhale instead of a jump. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => {
      v.dataset.ready = "true";
    };
    const onTime = () => {
      const left = v.duration - v.currentTime;
      v.dataset.dim = String(Number.isFinite(left) && left < 0.6);
    };
    v.addEventListener("canplay", onReady);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [motionOn, phase]);

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

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const enter = () => {
    if (phase !== "visible") return;
    document.cookie = `${COOKIE}=1; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("gone");
      return;
    }
    setPhase("leaving");
    timer.current = window.setTimeout(() => setPhase("gone"), FADE_MS + 20);
  };

  if (phase === "gone") return null;

  return (
    <div
      className="splash splash--overlay"
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
      <div className="splash__bg" aria-hidden />
      {motionOn ? (
        <video
          ref={videoRef}
          className="splash__video"
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src="/v2/splash-forest.mp4"
        />
      ) : null}
      <div className="splash__veil" aria-hidden />

      <div className="splash__content">
        <div className="splash__lock" aria-hidden>
          <Image src="/midgard-icon.png" alt="" aria-hidden width={64} height={64} priority />
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
    </div>
  );
}
