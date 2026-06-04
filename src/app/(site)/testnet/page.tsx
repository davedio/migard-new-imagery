import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  CtaBand,
} from "@/components/site/ui";
import { NetworkStatusWidget } from "@/components/site/NetworkStatusWidget";
import { StateQueueViz } from "@/components/site/StateQueueViz";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";

export const metadata: Metadata = {
  title: "Midgard Testnet Status",
  description:
    "Midgard testnet status: what is live, what is simulated, and where builders can inspect the Cardano-native L2 path.",
};

export default function TestnetPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Testnet status"
        title="Midgard on Cardano preprod."
        sub="Midgard is a pre-alpha testnet. This status page is where builders can see what is deploying now and what is coming soon."
        chips={
          <>
            <span className="chip chip--testnet">
              <span className="dot" />
              Pre-alpha testnet
            </span>
            <span className="chip chip--demo">
              <span className="dot" />
              Demo L2 activity; live data source pending
            </span>
          </>
        }
        actions={[
          { label: "What is live", href: "#whats-live", variant: "primary" },
          { label: "Get Started", href: "/get-started", variant: "ghost" },
        ]}
      />

      <Section id="whats-live" eyebrow="What is live" title="What's live right now.">
        <Prose
          items={[
            {
              text: "Live: the preprod contracts and their addresses (see Contracts), the source on GitHub, and the genesis deployment history.",
            },
            {
              text: "Simulated: the moving network activity below — it will connect to live data at launch.",
              variant: "dim",
            },
          ]}
        />
        <NetworkStatusWidget />
      </Section>

      <Section
        eyebrow="On-chain state queue"
        title="Blocks commit. Root confirms."
        lead="Operators append committed blocks to a singly-linked queue. When a block's fraud-proof window closes, it folds into the confirmed state — oldest first, one L1 transaction at a time."
        glow="green"
      >
        <StateQueueViz />
      </Section>

      <Section id="contracts" title="Contracts">
        <CardGrid>
          <Card
            title="Protocol contracts"
            body="Inspect the current preprod contract addresses and see which validator each address represents."
            delay={0}
          />
          <Card
            title="State anchors"
            body="See the current addresses for committed blocks, confirmed state, and settlement."
            delay={60}
          />
          <Card
            title="Source"
            body="Review Github for SDKs, node behavior, proof machinery, and implementation progress."
            cta="Explore on GitHub"
            ctaIcon={<GitHubIcon size={13} />}
            href={OFFICIAL_LINKS.github}
            delay={120}
          />
          <Card
            title="Deployment history"
            body="Follow the path from genesis to first settlement, refreshed as it progresses."
            delay={180}
          />
          <Card
            title="Live node view"
            body="A node view shows soft confirmations and block sealing. Simulated and live data are always labelled clearly."
            delay={240}
          />
          <Card
            title="Contract caveats"
            body="Counts, addresses, and parameter values can change — refresh them before press, investor, or policy use."
            delay={300}
          />
        </CardGrid>
      </Section>

      <CtaBand
        title="Start from the official path."
        lead="Use the status pages published on official links, and bring concrete feedback."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "Join Discord", href: OFFICIAL_LINKS.discord, variant: "ghost" },
        ]}
      />
    </main>
  );
}
