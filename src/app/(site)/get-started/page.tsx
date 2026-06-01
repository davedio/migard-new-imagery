import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  Layers,
  Callout,
  Actions,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Get Started With Midgard",
  description:
    "Get started with Midgard as a builder, operator, watcher, wallet, app, infrastructure provider, partner, or early user.",
};

export default function GetStartedPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Get Started"
        title="Get Started"
        sub="Build, operate, watch, integrate, support, or test the Cardano-native L2 path. Start with source, status, and a clear role."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Read the docs", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section
        id="builder-quickstart"
        eyebrow="Where to start"
        title="One concrete builder sequence."
      >
        <CardGrid cols={2}>
          <Card
            num="01"
            title="Read the architecture"
            body="Review the rollup model, state queue, settlement path, and challenge mechanics before you ship a user flow."
            cta="Read docs"
            href={OFFICIAL_LINKS.docs}
            delay={0}
          />
          <Card
            num="02"
            title="Inspect the implementation"
            body="Use the repository to inspect contracts, SDK surfaces, node code, and testnet-facing materials."
            cta="View GitHub"
            href={OFFICIAL_LINKS.github}
            delay={70}
          />
          <Card
            num="03"
            title="Check the status"
            body="Use the testnet status page for what is live now, what is simulated in the preview, and what still needs final confirmation."
            cta="View status"
            href="/testnet"
            delay={140}
          />
          <Card
            num="04"
            title="Bring concrete questions"
            body="The best feedback names a flow, a constraint, a wallet state, or a fallback path that needs to work."
            cta="Register interest"
            href={OFFICIAL_LINKS.intakeForm}
            delay={210}
          />
        </CardGrid>
      </Section>

      <Section
        id="roles"
        eyebrow="Roles"
        title="Find the role you can fill."
      >
        <CardGrid>
          <Card
            num="01"
            title="Builders"
            body="Bring real application flows that need more throughput and help prove where L2 execution makes Cardano more usable."
            delay={0}
          />
          <Card
            num="02"
            title="Operators"
            body="Sequence and commit blocks in rotating shifts. Operators are part of the throughput path and final parameters should be confirmed from the status surface."
            cta="Register interest"
            href={OFFICIAL_LINKS.intakeForm}
            delay={60}
          />
          <Card
            num="03"
            title="Watchers"
            body="Replay committed blocks, inspect state transitions, and use the challenge path when something invalid is found."
            cta="Become a Watcher"
            href={OFFICIAL_LINKS.intakeForm}
            delay={120}
          />
          <Card
            num="04"
            title="Wallets"
            body="Make Midgard feel native to Cardano users: same signing clarity, same ADA context, and status text that explains what is happening."
            delay={180}
          />
          <Card
            num="05"
            title="Apps and infrastructure"
            body="Keep users and builders moving with dApp flows, endpoints, indexing, monitoring, reliability surfaces, and clear failure states."
            delay={240}
          />
          <Card
            num="06"
            title="Partners"
            body="The strongest partner enters through function: what you make easier, safer, faster, or more inspectable."
            cta="Join a readiness track"
            href={OFFICIAL_LINKS.intakeForm}
            delay={300}
          />
        </CardGrid>
      </Section>

      <Section eyebrow="Integration" title="Map the flows before users touch them.">
        <Layers
          items={[
            {
              n: "01",
              name: "Throughput flow",
              desc: "Decide which application actions should execute through Midgard and which should remain directly on L1.",
            },
            {
              n: "02",
              name: "Wallet path",
              desc: "Define signing, status, fallback, and support states before users touch a live flow.",
            },
            {
              n: "03",
              name: "Settlement path",
              desc: "Separate fast soft confirmation from later L1 settlement in the user interface and product logic.",
            },
            {
              n: "04",
              name: "Error path",
              desc: "Make failed, challenged, delayed, or unsupported states legible instead of hiding them in vague status text.",
            },
          ]}
        />
      </Section>

      <Section id="users" eyebrow="For users" title="Faster Cardano apps. Same wallet. Same ADA.">
        <Prose
          items={[
            {
              text: "For most people, Midgard should feel like Cardano getting faster: the same wallet, the same ADA, lower-friction application use, and the same L1 trust anchor underneath.",
            },
            {
              text: "The user job is simple: start from official links, read the status, and do not sign anything you do not understand.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Stay safe" title="Use official links." tight>
        <Callout
          title="Midgard will never ask for private wallet secrets."
          body="Do not share your seed phrase, private key, recovery phrase, password, or wallet-draining approval. Ignore unsolicited support messages and start from official links."
        />
        <Actions
          items={[
            { label: "Open official links", href: "/official-links", variant: "ghost" },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Get Started"
        title="Bring a role, not just attention."
        lead="Tell us where you plug in: building, operating, watching, integrating, monitoring, educating, or making the user path safer."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Join Discord", href: OFFICIAL_LINKS.discord, variant: "ghost" },
        ]}
      />
    </main>
  );
}
