import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  Layers,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Build On Midgard",
  description:
    "Midgard gives Cardano builders a higher-throughput L2 path while preserving Cardano-native development patterns where possible.",
};

export default function BuildersPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Builder path"
        title="Build On Midgard."
        sub="Midgard is for Cardano builders who need more throughput without treating migration as the only serious option."
        body="Your users should not have to leave the ecosystem. Your team should not have to rebuild around a foreign stack just to reach a higher-capacity path."
        actions={[
          { label: "Read technical docs", href: "/docs", variant: "primary" },
          { label: "Explore on GitHub", href: OFFICIAL_LINKS.github, variant: "ghost" },
        ]}
      />

      <Section tight>
        <Prose
          items={[
            {
              text: "Midgard is designed to preserve familiar Cardano/eUTXO development patterns where possible while giving applications an L2 environment built for higher-throughput flows.",
              variant: "emph",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Builder thesis"
        title="Scaling should respect the system you already chose."
      >
        <Prose
          items={[
            {
              text: "Cardano builders chose a different model for a reason: eUTXO accounting, explicit state, strong settlement assumptions, and a culture that values correctness.",
            },
            { text: "Midgard does not flatten that into a generic L2 story.", variant: "dim" },
            {
              text: "Midgard makes that model more usable for applications that need capacity, composability, and better user flow.",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Start with inspection" title="Start with inspection.">
        <CardGrid cols={2}>
          <Card
            num="01"
            title="Read the architecture"
            body="Understand the rollup model, state transition path, challenge design, settlement assumptions, and current integration surface."
            delay={0}
          />
          <Card
            num="02"
            title="Inspect the implementation"
            body="Review the repository, contracts, SDK, node surfaces, and testnet materials."
            cta="Explore on GitHub"
            href={OFFICIAL_LINKS.github}
            delay={70}
          />
          <Card
            num="03"
            title="Map your app"
            body="Identify which flows need throughput, which state must remain on L1, which flows can move to L2, and where users need the experience to feel seamless."
            delay={140}
          />
          <Card
            num="04"
            title="Build toward readiness"
            body="Bring concrete integration questions. Midgard is not looking for passive attention. It needs builders who can test the path."
            delay={210}
          />
        </CardGrid>
      </Section>

      <Section
        eyebrow="Developer continuity"
        title="Less migration pain. More Cardano leverage."
      >
        <Prose
          items={[
            {
              text: "Midgard is designed to keep Cardano builders in the Cardano mental model: familiar wallets, familiar transaction assumptions, familiar tooling patterns, and a path back to L1 settlement.",
            },
            {
              text: "Some flows will need careful integration. That is fine. Serious infrastructure is built by making constraints visible and then solving them.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Before integration"
        title="What to understand before integration"
      >
        <Layers
          items={[
            {
              n: "01",
              name: "L2 activity",
              desc: "Application activity executes in the Midgard L2 environment.",
            },
            {
              n: "02",
              name: "Batching",
              desc: "L2 activity is organized into batches or state transitions that anchor back to Cardano L1.",
            },
            {
              n: "03",
              name: "Challenge paths",
              desc: "Midgard is designed around fraud-proof and challenge mechanics that make invalid activity contestable.",
            },
            {
              n: "04",
              name: "Settlement",
              desc: "Fast L2 activity and final L1 settlement are different pieces of the trust path.",
            },
            {
              n: "05",
              name: "Wallet and dApp UX",
              desc: "The best Midgard experience should feel native to Cardano users. Wallets and dApps are how that becomes real.",
            },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Bring the proof"
        title="Bring the proof with you."
        lead="If you are building on Midgard, do not build from a headline. Build from the architecture, the source, the docs, the testnet behavior, and the constraints you can actually inspect."
        actions={[
          { label: "Open builder intake", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Explore on GitHub", href: OFFICIAL_LINKS.github, variant: "ghost" },
        ]}
      />
    </main>
  );
}
