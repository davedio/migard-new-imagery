import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { NextSteps } from "@/components/site/NextSteps";

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
  // The flagship 3D transaction journey IS the page. (The state-queue
  // animation lives on the home ledger chapter; the five-step recap on
  // /contracts#lifecycle.)
  return (
    <HowItWorksExperience>
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
