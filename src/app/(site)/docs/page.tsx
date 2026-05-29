import type { Metadata } from "next";
import {
  PageHero,
  Section,
  CardGrid,
  Card,
  CtaBand,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Midgard Docs",
  description:
    "Midgard docs help builders inspect the architecture, constraints, contracts, SDK, testnet status, and integration path.",
};

export default function DocsPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Docs"
        title="Build from source, not slogans."
        sub="Midgard docs are where builders inspect the architecture, constraints, contracts, SDK, examples, and testnet behavior."
        actions={[
          { label: "Open docs", href: "#sections", variant: "primary" },
          { label: "View GitHub", href: "/official-links", variant: "ghost" },
        ]}
      />

      <Section id="sections" eyebrow="Docs sections" title="Where to start">
        <CardGrid>
          <Card
            num="01"
            title="Start here"
            body="Understand what Midgard is, how the L2 path works, and where Cardano L1 fits."
            delay={0}
          />
          <Card
            num="02"
            title="Architecture"
            body="Review the rollup model, L2 activity path, batching, challenge mechanics, settlement assumptions, and Cardano L1 anchoring."
            delay={60}
          />
          <Card
            num="03"
            title="Contracts"
            body="Inspect current preprod contracts and related deployment information."
            delay={120}
          />
          <Card
            num="04"
            title="SDK and examples"
            body="Use examples to understand how applications can interact with Midgard surfaces as they mature."
            delay={180}
          />
          <Card
            num="05"
            title="Integration path"
            body="Map wallet flow, dApp flow, data surfaces, support assumptions, and user-facing states."
            delay={240}
          />
          <Card
            num="06"
            title="Security"
            body="Use the security route for reporting, review, and monitoring as the system matures."
            delay={300}
          />
        </CardGrid>
      </Section>

      <CtaBand
        eyebrow="Integration"
        title="A good integration starts with a constraint map."
        lead="Before building a user-facing flow, map the environment, support assumptions, wallet path, error states, settlement path, and fallback behavior."
        actions={[
          { label: "Open integration checklist", href: "/official-links", variant: "primary" },
          { label: "Explore testnet", href: "/testnet", variant: "ghost" },
        ]}
      />
    </main>
  );
}
