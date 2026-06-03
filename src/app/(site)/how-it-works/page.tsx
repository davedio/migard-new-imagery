import type { Metadata } from "next";
import { Section, Layers, CtaBand } from "@/components/site/ui";
import { HudDivider } from "@/components/site/Hud";
import ProtocolLifecycle from "@/components/site/ProtocolLifecycle";
import { StatTiles } from "@/components/site/StatTiles";
import { EutxoComparison } from "@/components/site/EutxoComparison";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back through Cardano L1.",
};

export default function HowItWorksPage() {
  return (
    <main className="page-main page-main--how-it-works">
      <ProtocolLifecycle />

      <Section
        eyebrow="Protocol at a glance"
        title="Fast where it can be, final where it must be."
        tight
      >
        <StatTiles />
      </Section>

      <HudDivider left="// LAYER_EXPLAINER" right="06 LAYERS" />

      <Section
        id="layers"
        eyebrow="Layer explainer"
        title="Five lifecycle steps, one trust path."
        lead="The lifecycle is the moving system. The layer rows below show the underlying architecture Midgard keeps inspectable."
        glow="green"
      >
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

      <Section
        eyebrow="Why eUTXO"
        title="Why eUTXO builds a better rollup."
        lead="Cardano's eUTXO model makes fraud proofs surgical: Midgard re-executes only the inputs of a bad transaction — no global state scan."
        glow="gold"
      >
        <EutxoComparison />
      </Section>

      <CtaBand
        eyebrow="Go deeper"
        title="Go deeper than the headline."
        lead="Midgard's architecture is meant to be inspected in source, docs, status surfaces, and the security path."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "Security", href: "/security", variant: "ghost" },
        ]}
      />
    </main>
  );
}
