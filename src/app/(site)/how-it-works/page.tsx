import type { Metadata } from "next";
import { Section, Layers, CtaBand } from "@/components/site/ui";
import { HudDivider } from "@/components/site/Hud";
import ProtocolLifecycle from "@/components/site/ProtocolLifecycle";
import { StatTiles } from "@/components/site/StatTiles";
import { EutxoComparison } from "@/components/site/EutxoComparison";
import HowItWorksExperience from "@/components/HowItWorksExperience";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back to Cardano.",
};

export default function HowItWorksPage() {
  // The flagship 3D transaction journey is the immersive centerpiece: the page
  // opens with a full-viewport act where scroll rides a transaction canopy ->
  // Cardano L1, then flows into the detailed lifecycle content below, which
  // reinforces — in words — what the 3D just showed. The experience component
  // owns the fixed 3D stage, the chapter-label HUD, the custom cursor, and the
  // smooth-scroll (all desktop + motion-on only; see component header).
  return (
    <HowItWorksExperience>
      {/* Textual reference for the visual lifecycle above: the step-by-step
          breakdown with the L2/L1 trust path and the sticky stage rail. */}
      <ProtocolLifecycle />

      <Section
        eyebrow="Protocol at a glance"
        title="Fast confirmations now, final settlement on Cardano."
        tight
      >
        <StatTiles />
      </Section>

      <HudDivider left="// LAYER_EXPLAINER" right="06 LAYERS" />

      <Section
        id="layers"
        eyebrow="Layer explainer"
        title="Five lifecycle steps, one trust path."
        lead="The journey above is the live flow. The rows below are the on-chain pieces that make each step verifiable."
        glow="green"
      >
        <Layers
          items={[
            {
              n: "01",
              name: "Activity",
              desc: "Wallets and apps submit transactions to the L2.",
            },
            {
              n: "02",
              name: "Batch",
              desc: "The operator orders transactions into a state batch.",
            },
            {
              n: "03",
              name: "Proof",
              desc: "Each batch commits a hash anyone can recompute and check.",
            },
            {
              n: "04",
              name: "Challenge",
              desc: "Watchers dispute an invalid batch before it settles.",
            },
            {
              n: "05",
              name: "Settlement",
              desc: "Verified state is finalized back to Cardano L1.",
            },
            {
              n: "06",
              name: "Cardano L1",
              desc: "Cardano holds the funds and anchors final settlement.",
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
        title="Ready to build on Midgard?"
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "See the contracts", href: "/contracts" },
        ]}
      />
    </HowItWorksExperience>
  );
}
