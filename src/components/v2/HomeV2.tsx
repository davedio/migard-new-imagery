"use client";

/* ============================================================================
   HOME V2 — "THE DESCENT", one seamless flow.

   Motion ON  → DescentFlow: a single fixed stage (one canvas drawing the
                tree, the particles and the plates) behind pinned overlays
                that fade in place — the Corn-Revolution grammar. No image
                subsections; one continuous fall from canopy to bedrock:

                  tree → helix → tree again → the settlement orb ignites,
                  rides the trunk down and comes to rest in bedrock blue —
                  a soft blue detonation over the roots close-up.

   Motion OFF → the plain stacked-scene fallback below: static plates,
                no canvas, no pinned choreography. Reduced motion is a
                first-class path, not an apology.
   ========================================================================== */

import Link from "next/link";
import { type ReactNode } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme, TREE_PLATES } from "@/lib/theme";
import DescentFlow from "./DescentFlow";
import { StateQueueViz } from "@/components/site/StateQueueViz";
import {
  HeroHud,
  Ledger,
  Marquee,
  PartnerMarquee,
  Paths,
  Provenance,
  Statement,
  MotionToggle,
} from "./HomeContent";

/* ONE tree, every scene (client direction 2026-06-12): the static
   fallback frames different bands of the SAME tall plate instead of
   loading three different renders. The theme decides night or day. */
const STATIC_BANDS = {
  hero: "50% 20%", //  canopy
  roots: "50% 86%", // bedrock boulders + glow
  prov: "50% 60%", //  root flare
  strata: "50% 42%", // trunk
} as const;

/* ---------------------------------------------------------------------- */
/*  motion-off fallback: plain stacked scenes                              */
/* ---------------------------------------------------------------------- */

function StaticScene({
  id,
  plate,
  position = "center",
  children,
}: {
  id: string;
  plate: string;
  position?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="v2-static" data-scene={id}>
      <div
        className="v2-static__plate"
        style={{ backgroundImage: `url(${plate})`, backgroundPosition: position }}
        aria-hidden
      />
      <div className="v2-static__veil" aria-hidden />
      <div className="v2-static__body">{children}</div>
    </section>
  );
}

function StaticChapter({
  n,
  title,
  lead,
}: {
  n: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="v2-ch">
      <div className="v2-ch__index">
        <span className="n">{n}</span>
        <span className="rule" />
      </div>
      <h2>{title}</h2>
      {lead ? <p className="v2-ch__lead">{lead}</p> : null}
    </div>
  );
}

function StaticHome({ plate }: { plate: string }) {
  return (
    <>
      <StaticScene id="top" plate={plate} position={STATIC_BANDS.hero}>
        <div className="v2-static__hero">
          <span className="v2-hero__eyebrow">
            <span className="tick" aria-hidden />
            Speed · Scale · Security
          </span>
          <h1 className="v2-hero__title">
            Built to scale.
            <br />
            Secured by <span className="ital">Cardano</span>.
          </h1>
          <p className="v2-hero__lead">
            Midgard is a Cardano-native optimistic rollup that gives
            applications a faster execution layer while keeping Cardano as the
            trust anchor.
          </p>
          <div className="v2-hero__actions">
            <Link className="btn btn--primary" href="/how-it-works">
              See How It Works
            </Link>
            <a
              className="btn-link--gold"
              href="https://anastasia-labs.github.io/midgard/midgard.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the whitepaper
            </a>
          </div>
          <div className="v2-hero__meta">
            <HeroHud />
          </div>
        </div>
      </StaticScene>

      <PartnerMarquee />
      <Marquee />

      <section id="canopy" className="v2-static v2-static--dark">
        <div className="v2-static__body">
          <StaticChapter
            n="01"
            title={
              <>
                Scale that stays
                <br />
                on Cardano.
              </>
            }
          />
          <Statement />
        </div>
      </section>

      <StaticScene id="roots" plate={plate} position={STATIC_BANDS.roots}>
        <StaticChapter
          n="02"
          title={
            <>
              Fast confirmations now,
              <br />
              final settlement on Cardano.
            </>
          }
          lead={
            <>
              The numbers behind Midgard&apos;s pre-alpha testnet:{" "}
              <strong>usable speed today</strong>, with final settlement on
              Cardano.
            </>
          }
        />
        <Ledger />
        <div className="v2-ch" style={{ paddingTop: 24 }}>
          <div className="v2-ch__index">
            <span className="rule" style={{ flexBasis: 30 }} />
            <span className="stratum">On-chain state queue</span>
          </div>
          <h2>Blocks commit. State confirms.</h2>
        </div>
        <div className="v2-queue">
          <StateQueueViz />
        </div>
      </StaticScene>

      <StaticScene id="prov" plate={plate} position={STATIC_BANDS.prov}>
        <Provenance />
      </StaticScene>

      <StaticScene id="trunk" plate={plate} position={STATIC_BANDS.strata}>
        <StaticChapter
          n="03"
          title="Choose your path."
          lead="These roles overlap. Pick the one that fits what you're here to do."
        />
        <Paths />
      </StaticScene>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  composition                                                            */
/* ---------------------------------------------------------------------- */

export default function HomeV2() {
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  const plate = TREE_PLATES[theme];

  return (
    <main className="v2-home" data-motion={motionOn ? "on" : "off"}>
      {/* React hoists these to <head> — the tree plate is the LCP image */}
      <link rel="preload" as="image" href={plate} />
      {/* keyed by plate: a theme flip remounts the whole flow so every
          theme-derived value (canvas wash, shatter dust, vein field)
          re-reads together under the view-transition crossfade */}
      {motionOn ? (
        <DescentFlow key={plate} treeSrc={plate} />
      ) : (
        <StaticHome plate={plate} />
      )}
      <MotionToggle />
    </main>
  );
}
