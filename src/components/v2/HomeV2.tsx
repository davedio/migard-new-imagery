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
import { SITE_COPY } from "@/lib/siteCopy";
import DescentFlow from "./DescentFlow";
import { StateQueueViz } from "@/components/site/StateQueueViz";
import {
  Ledger,
  Paths,
  ProtocolPath,
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
          <h1 className="v2-hero__title">
            The <span className="ital">execution layer</span>
            <br />
            for UTXO finance
          </h1>
          <p className="v2-hero__lead">
            {SITE_COPY.hero.lead}
          </p>
          <div className="v2-hero__actions">
            <Link className="btn btn--primary" href="#paths">
              Choose your path
            </Link>
            <Link className="btn-link--gold" href="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
      </StaticScene>

      <StaticScene id="trunk" plate={plate} position={STATIC_BANDS.strata}>
        <StaticChapter
          n="01"
          title="Choose your path."
          lead="Users, builders, and Protocol Roles overlap. Start with the role that fits what you're here to do."
        />
        <Paths />
        <ProtocolPath />
      </StaticScene>

      <section id="canopy" className="v2-static v2-static--dark">
        <div className="v2-static__body">
          <StaticChapter
            n="02"
            title={
              <>
                Fast UTXO execution.
                <br />
                Cardano L1 security.
              </>
            }
          />
          <Statement />
        </div>
      </section>

      <StaticScene id="roots" plate={plate} position={STATIC_BANDS.roots}>
        <StaticChapter
          n="03"
          title={
            <>
              Key metrics
              <br />
              worth tracking.
            </>
          }
          lead={
            <>
              Track the indicators that matter: confirmation speed, settlement
              security, UTXO-native execution, verified contracts,
              fault-proof coverage, and current status.
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
      <link rel="preload" as="image" href={plate} />
      {motionOn ? (
        <DescentFlow key={plate} treeSrc={plate} />
      ) : (
        <StaticHome plate={plate} />
      )}
      <MotionToggle />
    </main>
  );
}
