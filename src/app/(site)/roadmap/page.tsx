import type { Metadata } from "next";
import { PageHero, Prose, Section } from "@/components/site/ui";
import { Roadmap } from "@/components/site/Roadmap";
import { NextSteps } from "@/components/site/NextSteps";

export const metadata: Metadata = {
  title: "Midgard Roadmap",
  description:
    "The road from today's pre-alpha testnet to settlement on Cardano mainnet: four phases, paced by the work, not by dates.",
  openGraph: {
    title: "Midgard Roadmap",
    images: [{ url: "/og/roadmap.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/roadmap.jpg"] },
};

export default function RoadmapPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="cobalt"
        label="Roadmap"
        title="The road to mainnet"
        sub="Midgard is pre-alpha. The route from today's testnet to settlement on Cardano mainnet runs through four phases, paced by the work, not by dates."
        actions={[
          { label: "What's live right now", href: "/contracts#network-status", variant: "primary" },
          { label: "Follow on GitHub", href: "https://github.com/Anastasia-Labs/midgard", variant: "ghost" },
        ]}
      />

      <Roadmap />

      <Section eyebrow="How to read this" title="Paced by the work, not by dates" tight>
        <Prose
          items={[
            {
              text: "Each phase ships when its exit criteria hold up to inspection, not when a quarter ends. The contracts page shows what is live versus simulated at any moment, and the changelog records what actually shipped.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <NextSteps
        items={[
          {
            label: "Read the changelog",
            sub: "What actually shipped, in order",
            href: "/changelog",
          },
          {
            label: "Check network status",
            sub: "Live versus simulated, labeled honestly",
            href: "/contracts#network-status",
          },
          {
            label: "Start building",
            sub: "Builder quickstart and SDK surfaces",
            href: "/get-started#builder-quickstart",
          },
        ]}
      />
    </main>
  );
}
