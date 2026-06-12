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
      {/* Two-page preview build: /contracts and /get-started are not on
          this branch, so the cards route to the whitepaper, the code and
          the home paths section. */}
      <NextSteps
        items={[
          {
            label: "Read the whitepaper",
            sub: "The challenge and proof design that keeps operators honest",
            href: "https://anastasia-labs.github.io/midgard/midgard.pdf",
          },
          {
            label: "Inspect the code",
            sub: "The protocol is open — verify it yourself on GitHub",
            href: "https://github.com/Anastasia-Labs/midgard",
          },
          {
            label: "Choose your path",
            sub: "Start as a user, start building, or run the protocol",
            href: "/#explore",
          },
        ]}
      />
    </HowItWorksExperience>
  );
}
