import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { NextSteps } from "@/components/site/NextSteps";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as an optimistic rollup for UTXO applications: deposit, transact, withdraw, with sequencing, commitment, data availability checks, fault-proof verification, and Cardano L1 settlement.",
  openGraph: {
    title: "How Midgard Works",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

export default function HowItWorksPage() {
  // The flagship 3D transaction journey IS the page. (The state-queue
  // animation lives on the home ledger chapter.)
  return (
    <HowItWorksExperience>
      <NextSteps
        items={[
          {
            label: "Read security",
            sub: "The Cardano L1 security, fault-proof, and watcher model",
            href: "/learn#security-overview",
          },
          {
            label: "Whitepaper coming soon",
            sub: "The technical writeup will return after the current claims cleanup.",
          },
          {
            label: "GitHub",
            sub: "The protocol is open — verify it yourself on GitHub",
            href: OFFICIAL_LINKS.github,
          },
        ]}
      />
    </HowItWorksExperience>
  );
}
