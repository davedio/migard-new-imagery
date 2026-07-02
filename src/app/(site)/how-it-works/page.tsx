import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { GitHubIcon } from "@/components/site/BrandIcons";
import FaqSections from "@/components/site/FaqSections";
import GlossaryList from "@/components/site/GlossaryList";
import JumpChips from "@/components/site/JumpChips";
import { NextSteps } from "@/components/site/NextSteps";
import { Actions, Card, CardGrid, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { SITE_COPY } from "@/lib/siteCopy";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as an optimistic rollup for UTXO applications — deposit, transact, withdraw, with sequencing, commitment, data availability checks, fault-proof verification, and Cardano L1 settlement — plus the FAQ and protocol glossary.",
  openGraph: {
    title: "How Midgard Works",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

export default function HowItWorksPage() {
  // The flagship 3D transaction journey IS the page. (The state-queue
  // animation lives on the home ledger chapter.) FAQ and glossary moved
  // here from their old standalone routes; the JumpChips bar below lets
  // visitors jump straight to them.
  return (
    <HowItWorksExperience>
      <JumpChips
        items={[
          { id: "proof-metrics", label: "Proof metrics" },
          { id: "next", label: "Next steps" },
          { id: "faq", label: "Questions" },
          { id: "glossary", label: "Glossary" },
        ]}
      />

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
            body="Fees are paid in plain ADA and are estimated at a fraction of L1 cost. Operator and Watcher economics live on the Participate page."
          />
        </CardGrid>
      </Section>

      <div id="next">
        <Section title="Security and economics, in depth." tight>
          <Actions
            items={[
              { label: "Security", href: "/developers#security", variant: "primary" },
              { label: "Economics", href: "/participate#economics", variant: "ghost" },
            ]}
          />
        </Section>

        <NextSteps
          items={[
            {
              label: "Security",
              sub: "Trust path, fault proofs, disclosure, and audit status",
              href: "/developers#security",
            },
            {
              label: "Economics",
              sub: "Operator and watcher incentives, bonds, rewards, and ADA fees",
              href: "/participate#economics",
            },
            {
              label: "Whitepaper",
              sub: "The full technical writeup ships alongside mainnet preparation — estimated later this year.",
            },
            {
              label: "GitHub",
              sub: "The protocol is open — verify it yourself on GitHub",
              href: OFFICIAL_LINKS.github,
              icon: <GitHubIcon size={14} aria-hidden />,
            },
          ]}
        />
      </div>

      <FaqSections />

      <Section
        id="glossary"
        title="The words we use."
        lead="Short definitions for the protocol terms used across Midgard."
      >
        <GlossaryList />
      </Section>
    </HowItWorksExperience>
  );
}
