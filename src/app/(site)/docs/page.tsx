import type { Metadata } from "next";
import {
  PageHero,
  Section,
  CardGrid,
  Card,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

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
          { label: "Explore on GitHub", href: OFFICIAL_LINKS.github, variant: "ghost" },
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
            title="Source and contracts"
            body="Inspect implementation progress, contracts, SDK, node surfaces, and related deployment information."
            cta="Explore on GitHub"
            href={OFFICIAL_LINKS.github}
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
          { label: "Explore on GitHub", href: OFFICIAL_LINKS.github, variant: "primary" },
          { label: "Open builder intake", href: OFFICIAL_LINKS.intakeForm, variant: "ghost" },
        ]}
      />
    </main>
  );
}
