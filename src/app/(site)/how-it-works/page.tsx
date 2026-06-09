import type { Metadata } from "next";
import { Section, CtaBand } from "@/components/site/ui";
import { StatTiles } from "@/components/site/StatTiles";
import { EutxoComparison } from "@/components/site/EutxoComparison";
import { Roadmap } from "@/components/site/Roadmap";
import HowItWorksExperience from "@/components/HowItWorksExperience";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back to Cardano.",
};

export default function HowItWorksPage() {
  // The flagship 3D transaction journey is the immersive centerpiece: the page
  // opens with a full-viewport act where scroll RIDES a transaction canopy ->
  // Cardano L1 — and, with the per-stage zoom + mini-icons + on-scene caption,
  // that scroll story now explains the full lifecycle on its own. The content
  // below is therefore trimmed to what's genuinely ADDITIVE (the at-a-glance
  // stats and the eUTXO comparison), not a re-listing of the same five steps.
  // The experience component owns the fixed 3D stage, the chapter-label HUD,
  // the custom cursor, and the smooth-scroll (all desktop + motion-on only).
  return (
    <HowItWorksExperience>
      {/* At-a-glance numbers — additive context, not a re-list of the steps. */}
      <Section
        eyebrow="Protocol at a glance"
        title="Fast confirmations now, final settlement on Cardano."
        lead="You just rode one transaction from the canopy to Cardano's bedrock. Here's what that means in practice."
        tight
      >
        <StatTiles />
      </Section>

      {/* Why eUTXO — the genuinely additive deep-dive the scroll can't show. */}
      <Section
        eyebrow="Why eUTXO"
        title="Why eUTXO builds a better rollup."
        lead="Cardano's eUTXO model makes fraud proofs surgical: Midgard re-executes only the inputs of a bad transaction — no global state scan."
        glow="gold"
      >
        <EutxoComparison />
      </Section>

      {/* Path to mainnet — honest, date-free phasing; current phase flagged. */}
      <Roadmap />

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
