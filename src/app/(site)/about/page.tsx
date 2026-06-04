import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  Actions,
  CtaBand,
} from "@/components/site/ui";
import { StackChips } from "@/components/site/StackChips";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";

export const metadata: Metadata = {
  title: "About Midgard",
  description:
    "Midgard is a Cardano-native optimistic rollup from Anastasia Labs, built so Cardano can scale without becoming less Cardano.",
};

export default function AboutPage() {
  return (
    <main className="page-main">
      <PageHero
        label="About"
        title="Scale Cardano without making it less Cardano."
        sub="Midgard is a Cardano-native optimistic rollup from Anastasia Labs, built so Cardano can scale while keeping the model, tooling, and rigor that made it Cardano."
        actions={[
          { label: "Read how it works", href: "/how-it-works", variant: "primary" },
          { label: "Explore docs ↗", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section eyebrow="The thesis" title="Throughput, with correctness intact.">
        <Prose
          items={[
            {
              text: "The usual way to scale a chain is to leave it: move to a faster network, accept a weaker or less familiar security model, learn a foreign stack, and fragment liquidity on the way out.",
            },
            {
              text: "Midgard takes the harder route. Applications run at Layer 2 speed in a Cardano-native environment, and the trust path settles back to Cardano L1.",
              variant: "emph",
            },
            {
              text: "Scale is the goal. Correctness is the constraint that does not move.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Who builds it" title="Built by Anastasia Labs.">
        <Prose
          items={[
            {
              text: "Midgard comes from Anastasia Labs, a team building Cardano infrastructure and open-source tooling for serious on-chain systems.",
            },
            {
              text: "The protocol is open, the implementation can be inspected, and the status surface should make what is live, planned, and simulated clear.",
              variant: "dim",
            },
          ]}
        />
        <Actions
          items={[
            { label: "View GitHub", href: OFFICIAL_LINKS.github, variant: "ghost", icon: <GitHubIcon size={15} /> },
          ]}
        />
      </Section>

      <Section eyebrow="Built with" title="The Cardano stack, end to end.">
        <StackChips />
      </Section>

      <Section eyebrow="Where we are" title="Live on testnet surfaces, not mainnet promises.">
        <CardGrid cols={2}>
          <Card
            title="Pre-alpha testnet"
            body="The preview should keep pre-alpha and testnet status visible, especially where simulated data or pending status surfaces are involved."
          />
          <Card
            title="Public status path"
            body="The status page is the right place for contracts, deployment history, supported flows, and current caveats."
            cta="View status"
            href="/testnet"
          />
        </CardGrid>
      </Section>

      <CtaBand
        eyebrow="In short"
        title="Not just speed. A trust path you can check."
        lead="Midgard is L2 execution, challengeable invalid state, and settlement back to Cardano L1 — fast where it can be, final where it must be."
        actions={[
          { label: "How it works", href: "/how-it-works", variant: "primary" },
          { label: "Get Started", href: "/get-started", variant: "ghost" },
        ]}
      />
    </main>
  );
}
