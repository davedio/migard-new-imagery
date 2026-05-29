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

export const metadata: Metadata = {
  title: "Midgard Testnet",
  description:
    "Midgard testnet is the place for builders, partners, and users to inspect the Cardano-native L2 path before it carries production weight.",
};

export default function TestnetPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Testnet"
        title="Test the path before the path carries weight."
        sub="Midgard testnet is where the architecture becomes tangible: docs, contracts, integrations, wallets, dashboards, feedback, and proof."
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
          { label: "Start testnet path", href: "#whats-live", variant: "primary" },
          { label: "Read docs", href: "/docs", variant: "ghost" },
        ]}
      />

      <Section eyebrow="What testnet is for" title="Make the path real.">
        <Prose
          items={[
            {
              text: "Testnet is not a marketing checkpoint. It is where the system gets sharper.",
            },
          ]}
        />
        <Bullets
          items={[
            "Builders test integration paths.",
            "Wallets test user flow.",
            "dApps test useful activity.",
            "Infrastructure teams test reliability.",
            "Analytics teams make activity legible.",
            "Security contributors test assumptions.",
            "Community educators make the category understandable.",
          ]}
        />
      </Section>

      <Section id="whats-live" eyebrow="What is live now" title="Current surfaces">
        <CardGrid>
          <Card
            title="Website"
            body="The public site is the gateway for users, builders, partners, docs, and launch updates."
            delay={0}
          />
          <Card
            title="Contracts"
            body="The contracts page is the place to inspect preprod deployment information."
            delay={60}
          />
          <Card
            title="Source"
            body="The repository is the place to inspect implementation progress."
            delay={120}
          />
          <Card
            title="Docs"
            body="Docs and whitepaper routes should turn curiosity into builder action."
            delay={180}
          />
          <Card
            title="Community"
            body="Community routes should answer questions, surface feedback, and route people back to official materials."
            delay={240}
          />
          <Card
            title="Early access"
            body="Early access should identify serious builders and partners, not collect passive hype."
            delay={300}
          />
        </CardGrid>
      </Section>

      <Section
        eyebrow="Builders"
        title="Builders can help make the path real."
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
          items={[{ label: "Join builder readiness", href: "/builders", variant: "ghost" }]}
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
          items={[{ label: "Request partner intake", href: "/partners", variant: "ghost" }]}
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
        lead="Use the testnet surfaces published on official links, and bring concrete feedback."
        actions={[
          { label: "Open official links", href: "/official-links", variant: "primary" },
          { label: "Read docs", href: "/docs", variant: "ghost" },
        ]}
      />
    </main>
  );
}
