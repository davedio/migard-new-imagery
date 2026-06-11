import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { NextSteps } from "@/components/site/NextSteps";
import { StateQueueViz } from "@/components/site/StateQueueViz";
import { Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back to Cardano.",
  openGraph: {
    title: "How Midgard Works",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

export default function HowItWorksPage() {
  // The flagship 3D transaction journey IS the page; the state-queue
  // animation below shows its Commit -> Settle half on Cardano itself.
  // (The plain-text five-step recap lives on /contracts#lifecycle now.)
  return (
    <HowItWorksExperience>
      {/* The on-chain state queue, animated — relocated from /contracts:
          it IS the Commit -> Settle half of the journey above, so it lives
          where that story is told. */}
      <Section
        id="queue"
        eyebrow="On-chain state queue"
        title="Blocks commit. Root confirms"
        lead="What Commit and Settle look like on Cardano itself: operators append committed blocks to a singly-linked queue, and when a block's fraud-proof window closes it folds into the confirmed state — oldest first, one L1 transaction at a time."
        glow="green"
      >
        <StateQueueViz />
      </Section>

      <NextSteps
        items={[
          {
            label: "Read the security model",
            sub: "The challenge and proof design that keeps operators honest",
            href: "/contracts#security-model",
          },
          {
            label: "Inspect the contracts",
            sub: "Verify the on-chain addresses yourself",
            href: "/contracts",
          },
          {
            label: "Choose your path",
            sub: "Start as a user, start building, or run the protocol",
            href: "/get-started",
          },
        ]}
      />
    </HowItWorksExperience>
  );
}
