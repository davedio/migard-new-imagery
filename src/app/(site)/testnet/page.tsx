import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Bullets,
  CardGrid,
  Card,
  Actions,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

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
        title="Live on Cardano preprod."
        sub="Midgard is a pre-alpha testnet. The protocol status surface is where builders inspect what is deployed, what is simulated, and what still needs confirmation."
        chips={
          <>
            <span className="chip chip--testnet">
              <span className="dot" />
              Pre-alpha testnet
            </span>
            <span className="chip chip--demo">
              <span className="dot" />
              Simulated · connects to live data at launch
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

      <Section eyebrow="How to engage" title="Inspect, build, report.">
        <Bullets
          items={[
            "Builders read the docs, inspect source and contracts, test supported flows, and bring concrete feedback.",
            "Partners enter through function: wallet flow, app flow, infrastructure, analytics, monitoring, or security review.",
            "Users read status labels, start from official links, and watch the network mature.",
          ]}
        />
      </Section>

      <Section
        eyebrow="Builders"
        title="Builders make the path real."
        tight
      >
        <Prose
          items={[
            {
              text: "Review the docs, inspect source, test supported flows, identify integration blockers, and bring concrete feedback. Midgard needs builders who can turn architecture into usable applications.",
            },
          ]}
        />
        <Actions
          items={[{ label: "Get Started", href: "/get-started", variant: "ghost" }]}
        />
      </Section>

      <Section
        eyebrow="Partners"
        title="Partners should enter through function."
        tight
      >
        <Prose
          items={[
            {
              text: "Wallets, dApps, infrastructure providers, analytics teams, security contributors, and community educators should start with a clear role. What do you make easier, safer, faster, or more inspectable?",
            },
          ]}
        />
        <Actions
          items={[{ label: "Get Started", href: "/get-started", variant: "ghost" }]}
        />
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
