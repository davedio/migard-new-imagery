import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Bullets,
  Layers,
  CtaBand,
} from "@/components/site/ui";
import RootworkShowcase from "@/components/site/RootworkShowcase";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "Midgard is a Cardano-native optimistic rollup with L2 activity, batching, challenge paths, and settlement back to Cardano L1.",
};

export default function HowItWorksPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Mechanism"
        title="Trust architecture, not throughput theater."
        sub="Midgard is designed to make Cardano-native L2 activity faster to use and easier to reason about."
        actions={[
          { label: "Inspect the layers", href: "#layers", variant: "primary" },
          { label: "Read docs", href: "/docs", variant: "ghost" },
        ]}
      />

      <RootworkShowcase
        eyebrow="Living Roots · Interactive"
        caption="Verified activity flows down the roots, through the six trust layers, into Cardano L1 settlement."
      />

      <Section
        eyebrow="Rollup, not sidechain"
        title="A rollup keeps Cardano in the trust path."
      >
        <Prose
          items={[
            {
              text: "A sidechain has its own ledger, consensus, and security assumptions. A rollup is different. It processes activity off L1 while publishing commitments, disputes, or settlement-relevant information back to the L1 it depends on.",
            },
            {
              text: "Midgard is a Cardano-native optimistic rollup. Its trust story runs through Cardano L1 anchoring, challenge mechanics, and settlement. Not through a separate-chain narrative.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Optimistic rollup"
        title="Optimistic means fast movement with a dispute path."
      >
        <Prose
          items={[
            {
              text: "In an optimistic rollup, activity can move quickly because the system does not re-prove every transaction up front. Instead, invalid activity can be challenged through the protocol.",
            },
            { text: "That is the tradeoff:", variant: "dim" },
          ]}
        />
        <Bullets
          items={[
            "Faster L2 activity.",
            "Later L1 settlement.",
            "A challenge path for disputes.",
          ]}
        />
        <Prose
          items={[
            { text: "Midgard turns that into a Cardano-native architecture.", variant: "emph" },
          ]}
        />
      </Section>

      <Section
        eyebrow="eUTXO design"
        title="Cardano's local state is the technical edge."
      >
        <Prose
          items={[
            {
              text: "Midgard's strongest technical thesis starts with Cardano's eUTXO model. Localized state gives the system a cleaner way to reason about disputed transitions than a global account-state model.",
            },
            { text: 'That is why Midgard is not just "a rollup, but on Cardano."', variant: "dim" },
            { text: "It is a rollup built for what makes Cardano different.", variant: "emph" },
          ]}
        />
      </Section>

      <Section
        eyebrow="Developer continuity"
        title="More capacity should not require an alien stack."
      >
        <Prose
          items={[
            {
              text: "Midgard aims to preserve Cardano-native development patterns where possible: familiar wallets, transaction assumptions, off-chain tooling, and application architecture.",
            },
            {
              text: "The best version of Midgard feels like Cardano gaining a practical execution layer, not Cardano users being sent somewhere else.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Settlement path" title="The path ends at Cardano L1.">
        <Prose
          items={[
            {
              text: "L2 activity should not make Cardano irrelevant. It should make Cardano more useful.",
            },
            {
              text: "Midgard activity is designed to route through Cardano settlement and verification surfaces. Fees are paid in ADA. The trust path remains tied to Cardano.",
            },
          ]}
        />
      </Section>

      <Section id="layers" eyebrow="Layer explainer" title="The six layers">
        <Layers
          items={[
            {
              n: "01",
              name: "Activity",
              desc: "Users and applications create activity in the L2 environment.",
            },
            {
              n: "02",
              name: "Batch",
              desc: "Activity is organized into batches or state transitions.",
            },
            {
              n: "03",
              name: "Proof",
              desc: "The system uses commitments and evidence so the path can be checked.",
            },
            {
              n: "04",
              name: "Challenge",
              desc: "Disputed activity can be contested through the protocol's challenge mechanics.",
            },
            {
              n: "05",
              name: "Settlement",
              desc: "Settlement brings the path back to Cardano L1.",
            },
            {
              n: "06",
              name: "Cardano L1",
              desc: "Cardano remains the base layer for the trust story.",
            },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Go deeper"
        title="Go deeper than the headline."
        lead="The architecture is meant to be inspected — in the docs, and on testnet."
        actions={[
          { label: "Read docs", href: "/docs", variant: "primary" },
          { label: "Explore testnet", href: "/testnet", variant: "ghost" },
        ]}
      />
    </main>
  );
}
