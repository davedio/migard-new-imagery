import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Bullets,
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
        sub="Midgard is a pre-alpha testnet. The protocol status surface is where builders inspect what is deployed, what is simulated, and what still needs confirmation."
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

      <Section id="whats-live" eyebrow="What is live" title="Deployed and verifiable surfaces.">
        <Prose
          items={[
            {
              text: "The public status path should show preprod contract deployment information, source references, deployment history, and a clear label for any activity that is simulated in this preview.",
            },
            {
              text: "Some activity shown in the website prototype is simulated and connects to live data at launch; the contract and deployment surfaces should be checked against the latest status source before public amplification.",
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

      <Section id="contracts" eyebrow="Contracts" title="Inspect the contract path.">
        <CardGrid>
          <Card
            title="Protocol contracts"
            body="Use the status surface to inspect the current preprod contract addresses and understand which validators each address represents."
            delay={0}
          />
          <Card
            title="State anchors"
            body="State anchors should show the current public handles for committed blocks, confirmed state, and settlement-relevant surfaces."
            delay={60}
          />
          <Card
            title="Source"
            body="The repository is where builders inspect implementation progress, SDK surfaces, node behavior, and proof machinery."
            cta="Explore on GitHub"
            ctaIcon={<GitHubIcon size={13} />}
            href={OFFICIAL_LINKS.github}
            delay={120}
          />
          <Card
            title="Deployment history"
            body="The deployment history should make the path from genesis to first settlement legible and refreshable."
            delay={180}
          />
          <Card
            title="Live node view"
            body="A node view can show soft confirmations and block sealing, but the page must label simulated versus live data clearly."
            delay={240}
          />
          <Card
            title="Contract caveats"
            body="Counts, addresses, and parameter values should be refreshed before press, investor, or policy use."
            delay={300}
          />
        </CardGrid>
      </Section>

      <Section eyebrow="Proof queue" title="What should become visible next">
        <Bullets
          items={[
            "Clear docs path.",
            "Contracts and deployment surfaces.",
            "Builder quickstart.",
            "Wallet and dApp integration tracks.",
            "Activity and settlement dashboards.",
            "Security reporting route.",
            "Support route.",
            "Post-testnet proof report.",
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Testnet"
        title="Start from the official path."
        lead="Use the status surfaces published on official links, and bring concrete feedback."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "Join Discord", href: OFFICIAL_LINKS.discord, variant: "ghost" },
        ]}
      />
    </main>
  );
}
