import type { Metadata } from "next";
import { Section, Layers, CtaBand } from "@/components/site/ui";
import ProtocolLifecycle from "@/components/site/ProtocolLifecycle";

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
        id="layers"
        eyebrow="Layer explainer"
        title="Five lifecycle steps, one trust path."
        lead="The lifecycle above shows the moving system. The layer rows below show the underlying architecture Midgard keeps inspectable."
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
