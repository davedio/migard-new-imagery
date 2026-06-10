import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  Layers,
} from "@/components/site/ui";
import { AboutFold } from "@/components/site/AboutFold";
import { NextSteps } from "@/components/site/NextSteps";
import { Term } from "@/components/site/Term";

export const metadata: Metadata = {
  title: "About Midgard",
  description:
    "Why Midgard exists: the use cases, the features, and the economic incentives behind a Cardano-native optimistic rollup built by Anastasia Labs.",
  openGraph: {
    title: "About Midgard",
    images: [{ url: "/og/about.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/about.jpg"] },
};

export default function AboutPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="moss"
        label="About"
        title="Scale that stays on Cardano"
        sub="The nontechnical story in one page: what Midgard is for, what makes it different, and why the people running it are motivated to keep it honest."
        actions={[
          { label: "Watch how it works", href: "/how-it-works", variant: "primary" },
          { label: "Choose your path", href: "/get-started", variant: "ghost" },
        ]}
      />

      <Section eyebrow="The problem" title="Growing apps shouldn't have to leave">
        <Prose
          items={[
            {
              text: "The usual way to scale a blockchain app is to leave it: move to a faster network, accept a weaker security model, learn a new stack, and split your liquidity on the way out.",
            },
            {
              text: "Midgard keeps you on Cardano. Apps run at Layer 2 speed, and every result settles back to Cardano, the chain users already trust.",
              variant: "emph",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Use cases"
        title="What faster execution unlocks"
        lead="Anything that feels cramped on a base chain gets room to move on a rollup."
      >
        <CardGrid>
          <Card
            num="01"
            title="Trading and DeFi under load"
            body="DEXs and lending protocols keep responding during peak demand: soft confirmation arrives in moments, not blocks."
            delay={0}
          />
          <Card
            num="02"
            title="Payments that feel instant"
            body="Same wallet, same ADA, lower friction. Checkout-grade speed with Cardano settlement underneath."
            delay={70}
          />
          <Card
            num="03"
            title="High-frequency apps"
            body="Games, social actions, and machine-to-machine flows that would be impractical to put on Layer 1 directly."
            delay={140}
          />
        </CardGrid>
      </Section>

      <Section eyebrow="The features" title="What makes Midgard different">
        <Layers
          items={[
            {
              n: "01",
              name: "Cardano-native by design",
              desc: "The same eUTXO model, scripts, and tooling builders already use. For most developers, switching is one endpoint change.",
            },
            {
              n: "02",
              name: "ADA all the way down",
              desc: "Fees are paid in ADA. No new gas token to hold, price, or explain to users.",
            },
            {
              n: "03",
              name: "Settlement on Cardano",
              desc: "Every batch commits back to Cardano. Finality is inherited from the chain itself, not from a committee.",
            },
            {
              n: "04",
              name: "Open and inspectable",
              desc: "The contracts, the source, and the status surfaces are public. Anyone can verify the addresses on an explorer.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Economic incentives"
        title="Why the network stays honest"
        lead="Optimistic rollups work because honesty is the profitable strategy. Three roles hold each other in check."
      >
        <Prose
          items={[
            {
              text: (
                <>
                  <Term k="operator">Operators</Term> post collateral to run the
                  network. Commit an invalid block and that bond can be slashed,
                  so cheating risks real value for no payoff.
                </>
              ),
            },
            {
              text: (
                <>
                  <Term k="watcher">Watchers</Term> independently re-execute every
                  committed block. One valid{" "}
                  <Term k="fraud-proof">fraud proof</Term> during the{" "}
                  <Term k="challenge-window">challenge window</Term> is enough to
                  stop bad state, and anyone can run a watcher.
                </>
              ),
            },
            {
              text: "Users keep Cardano's security while gaining Layer 2 speed: if the operator set misbehaves or stalls, Cardano-enforced escape paths let funds exit. The incentives are designed so the cheapest way to participate is to follow the rules.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <AboutFold showThesis={false} />

      <NextSteps
        items={[
          {
            label: "Watch a transaction travel",
            sub: "The five-step journey from Layer 2 to Cardano",
            href: "/how-it-works",
          },
          {
            label: "See the road to mainnet",
            sub: "Four phases, paced by the work",
            href: "/roadmap",
          },
          {
            label: "Choose your path",
            sub: "Start as a user, start building, or run the protocol",
            href: "/get-started",
          },
        ]}
      />
    </main>
  );
}
