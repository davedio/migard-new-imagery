import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { NextSteps } from "@/components/site/NextSteps";
import { Actions, Card, CardGrid, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { SITE_COPY } from "@/lib/siteCopy";

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
      <Section
        id="proof-metrics"
        title="Proof metrics."
        lead="Track the indicators that reduce guesswork: speed, settlement, UTXO fit, verification coverage, and current status."
      >
        <CardGrid cols={3}>
          {SITE_COPY.proofPoints.map((item) => (
            <Card
              key={item.k}
              title={item.k}
              body={item.s}
              cta={"href" in item ? item.cta : undefined}
              href={"href" in item ? item.href : undefined}
            />
          ))}
          <Card
            title="Fees"
            body="Fees in ADA belong here and in operator or watcher economics, not in the homepage hero."
          />
        </CardGrid>
      </Section>

      <Section title="Security and economics live with participation." tight>
        <Actions
          items={[
            { label: "Security", href: "/participate#security", variant: "primary" },
            { label: "Economics", href: "/participate#economics", variant: "ghost" },
          ]}
        />
      </Section>

      <NextSteps
        items={[
          {
            label: "Security",
            sub: "Operator commitments, Watcher replay, and challenge path",
            href: "/participate#security",
          },
          {
            label: "Economics",
            sub: "Operator and watcher incentives, bonds, rewards, and ADA fees",
            href: "/participate#economics",
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
