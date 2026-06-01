import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Midgard Docs",
  description:
    "Start with Midgard docs, source, status, and builder-facing material before integrating a Cardano L2 flow.",
};

export default function DocsPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Docs"
        title="Start with source, status, and a concrete flow."
        sub="The technical docs live in the official repository. This page explains what to inspect before you build or port a Cardano app flow."
        actions={[
          { label: "Open official docs", href: OFFICIAL_LINKS.docs, variant: "primary" },
          { label: "Builder quickstart", href: "/get-started#builder-quickstart", variant: "ghost" },
        ]}
      />

      <Section
        eyebrow="How to use the docs"
        title="Where to start."
        lead="The useful sequence is not a tour of every file. It is the shortest route from architecture to a flow you can test."
      >
        <CardGrid cols={2}>
          <Card
            num="01"
            title="Architecture"
            body="The rollup model: state queue, operators, watchers, the challenge path, and settlement to Cardano L1."
            cta="Open docs"
            href={OFFICIAL_LINKS.docs}
            delay={0}
          />
          <Card
            num="02"
            title="Source"
            body="Inspect the official code before trusting any website copy as technical truth."
            cta="View GitHub"
            href={OFFICIAL_LINKS.github}
            delay={70}
          />
          <Card
            num="03"
            title="Status"
            body="What is deployed, what is pending, and what still needs a refresh."
            cta="View testnet"
            href="/testnet"
            delay={140}
          />
          <Card
            num="04"
            title="Integration flow"
            body="Bring one real flow — a wallet, dApp, or protocol action — and map where L2 helps."
            cta="Start path"
            href="/get-started#builder-quickstart"
            delay={210}
          />
        </CardGrid>
      </Section>

      <Section eyebrow="Current boundary" title="Website copy is not the final technical spec." tight>
        <Prose
          items={[
            {
              text: "This site translates Midgard for users, builders, and partners. Final technical claims should be checked against the official source, current testnet status, and approval-ready claim controls before public amplification.",
            },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Builder path"
        title="Bring the flow you want to make faster."
        lead="The best next step is a concrete Cardano action: a wallet state, dApp interaction, protocol path, indexer need, or fallback behavior."
        actions={[
          { label: "Open official docs", href: OFFICIAL_LINKS.docs, variant: "primary" },
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "ghost" },
        ]}
      />
    </main>
  );
}
