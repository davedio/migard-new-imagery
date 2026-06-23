import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { NextSteps } from "@/components/site/NextSteps";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as an optimistic rollup for eUTXO applications: deposit, transact, withdraw, with sequencing, commitment, data availability checks, fault-proof verification, and L1 settlement.",
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
            sub: "The L1 security, fault-proof, and watcher model",
            href: "/security",
          },
          {
            label: "Whitepaper",
            sub: "The challenge and fault-proof design that keeps operators honest",
            href: OFFICIAL_LINKS.whitepaper,
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
