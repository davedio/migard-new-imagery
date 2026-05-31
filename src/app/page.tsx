import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MidgardWordmark from "@/components/MidgardWordmark";

export const metadata: Metadata = {
  title: "Enter Midgard",
  description:
    "Midgard — a Cardano-native Layer 2. Built to scale, secured by math.",
};

/**
 * Flash Entry splash at `/`. Lives outside the (site) route group, so it has no
 * nav/footer chrome — a clean cinematic title card.
 *
 * Background today is the static green world-tree PNG with a slow drift
 * (.splash__bg in globals.css). When Dave's cinematic clip is ready, drop a
 *   <video autoPlay muted loop playsInline className="splash__bg" .../>
 * in place of the div below — it sits in the same inset:0 cover layer.
 */
export default function SplashPage() {
  return (
    <main className="splash">
      <div className="splash__bg" aria-hidden />
      <div className="splash__veil" aria-hidden />

      <div className="splash__content">
        <div className="splash__lock" aria-label="Midgard">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={64} height={64} priority />
          <span className="wm">
            <MidgardWordmark radius={120} />
          </span>
        </div>
        <Link href="/home" className="splash__enter" aria-label="Enter Midgard">
          Enter Midgard
        </Link>
      </div>
    </main>
  );
}
