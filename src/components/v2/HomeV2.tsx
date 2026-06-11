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
import DescentFlow from "./DescentFlow";
import { StateQueueViz } from "@/components/site/StateQueueViz";
import {
  Duel,
  HeroHud,
  Ledger,
  Marquee,
  Paths,
  Provenance,
  Statement,
  MotionToggle,
} from "./HomeContent";

const PLATES = {
  hero: "/v2/hero-wide.avif",
  strata: "/v2/strata-tall.avif",
  roots: "/v2/roots-bedrock.avif",
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
  stratum,
  title,
  lead,
}: {
  n: string;
  stratum: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="v2-ch">
      <div className="v2-ch__index">
        <span className="n">{n}</span>
        <span className="rule" />
        <span className="stratum">{stratum}</span>
      </div>
      <h2>{title}</h2>
      {lead ? <p className="v2-ch__lead">{lead}</p> : null}
    </div>
  );
}

function StaticHome() {
  return (
    <>
      <StaticScene id="top" plate={PLATES.hero} position="88% 38%">
        <div className="v2-static__hero">
          <span className="v2-hero__eyebrow">
            <span className="tick" aria-hidden />
            Speed · Scale · Security
          </span>
          <h1 className="v2-hero__title">
            Built to scale.
            <br />
            Rooted in <span className="ital">Cardano</span>.
          </h1>
          <p className="v2-hero__lead">
            Midgard is a Cardano-native optimistic rollup that gives
            applications a faster execution layer while keeping Cardano as the
            root of trust.
          </p>
          <div className="v2-hero__actions">
            <Link className="btn btn--primary" href="/get-started">
              Get Started
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

      <Marquee />

      <section id="canopy" className="v2-static v2-static--dark">
        <div className="v2-static__body">
          <StaticChapter
            n="01"
            stratum="Canopy — the thesis"
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

      <StaticScene id="roots" plate={PLATES.roots} position="68% 64%">
        <StaticChapter
          n="02"
          stratum="Roots — protocol at a glance"
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
          <h2>Blocks commit. Root confirms.</h2>
        </div>
        <div className="v2-queue">
          <StateQueueViz />
        </div>
      </StaticScene>

      <StaticScene id="proofs" plate={PLATES.roots} position="50% 52%">
        <StaticChapter
          n="03"
          stratum="Proofs — why eUTXO"
          title={
            <>
              Why eUTXO builds
              <br />a better rollup.
            </>
          }
          lead={
            <>
              Cardano&apos;s eUTXO model makes fraud proofs surgical: Midgard
              re-executes only the inputs of a bad transaction —{" "}
              <strong>no global state scan</strong>.
            </>
          }
        />
        <Duel />
        <Provenance />
      </StaticScene>

      <StaticScene id="trunk" plate={PLATES.strata} position="50% 32%">
        <StaticChapter
          n="04"
          stratum="Trunk — three ways in"
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

  return (
    <main className="v2-home" data-motion={motionOn ? "on" : "off"}>
      {/* React hoists these to <head> — the tree plate is the LCP image */}
      <link rel="preload" as="image" href={PLATES.hero} />
      {motionOn ? <DescentFlow /> : <StaticHome />}
      <MotionToggle />
    </main>
  );
}
