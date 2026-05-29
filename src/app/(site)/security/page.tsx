import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Bullets,
  Actions,
  CtaBand,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Midgard Security And Trust",
  description:
    "Midgard's trust story is built around Cardano L1 anchoring, mathematical rigor, eUTXO-aware design, batching, challenge mechanics, and settlement.",
};

export default function SecurityPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Trust posture"
        title="Security starts at the base."
        sub="Midgard's trust path is rooted directly in Cardano Layer 1: formal methods, functional programming, eUTXO-aware design, challenge mechanics, and settlement."
        actions={[
          { label: "Explore trust architecture", href: "#posture", variant: "primary" },
          { label: "Read docs", href: "/docs", variant: "ghost" },
        ]}
      />

      <Section
        id="posture"
        eyebrow="Trust posture"
        title="Security should be explained, not performed."
      >
        <Prose
          items={[
            {
              text: "Midgard's security story is not a magic word. It is a sequence of mechanisms:",
            },
          ]}
        />
        <Bullets
          items={[
            "Cardano L1 anchoring",
            "mathematical rigor",
            "formal-methods engineering culture",
            "functional programming roots",
            "eUTXO-aware design",
            "batch publication",
            "fraud-proof and challenge paths",
            "settlement assumptions",
            "operational readiness",
          ]}
        />
        <Prose
          items={[
            { text: "The more legible the mechanism, the stronger the brand.", variant: "emph" },
          ]}
        />
      </Section>

      <Section eyebrow="Cardano L1" title="Cardano stays in the loop.">
        <Prose
          items={[
            {
              text: "Midgard is designed so L2 activity does not drift into a detached security model. State transitions and settlement tie back to Cardano L1.",
            },
            {
              text: "That is why Midgard can be bold without sounding reckless. The system has a path back to the base layer.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Watchers and challenge culture"
        title="The system should invite inspection."
      >
        <Prose
          items={[
            {
              text: "The strongest rollup systems are not built on vibes. They are built around the ability to inspect, challenge, and prove.",
            },
            {
              text: "Midgard's trust architecture should make that inspection culture visible to users, builders, and partners.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Reporting" title="Security belongs in the open path." tight>
        <Prose
          items={[
            {
              text: "As Midgard matures, security reporting, review, monitoring, and incident routes should become part of the public trust surface. The goal is not to hide complexity. The goal is to route it clearly.",
            },
          ]}
        />
        <Actions
          items={[{ label: "Open security route", href: "/official-links", variant: "ghost" }]}
        />
      </Section>

      <CtaBand
        eyebrow="Trust path"
        title="Read the path, then test it."
        lead="The trust story is meant to be inspected. Read how it fits together, then watch it behave on testnet."
        actions={[
          { label: "How it works", href: "/how-it-works", variant: "primary" },
          { label: "Explore testnet", href: "/testnet", variant: "ghost" },
        ]}
      />
    </main>
  );
}
