import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  Callout,
  Actions,
} from "@/components/site/ui";
import { DeveloperSwitch } from "@/components/site/DeveloperSwitch";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { NetworkRoles } from "@/components/site/NetworkRoles";

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

      <NetworkRoles />

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
            ctaIcon={<GitHubIcon size={13} />}
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
        id="developer-switch"
        eyebrow="Zero migration"
        title="For developers, almost nothing changes."
        lead="Same eUTXO model, same scripts, same tooling. Switching to Midgard is one endpoint change — toggle the target and watch what moves."
        glow="green"
      >
        <DeveloperSwitch />
      </Section>

      <Section
        id="ecosystem"
        eyebrow="Ecosystem"
        title="Wallets, apps, and partners."
      >
        <CardGrid>
          <Card
            num="01"
            title="Wallets"
            body="Make Midgard feel native to Cardano users: same signing clarity, same ADA context, and status text that explains what is happening."
            delay={0}
          />
          <Card
            num="02"
            title="Apps and infrastructure"
            body="Keep users and builders moving with dApp flows, endpoints, indexing, monitoring, reliability surfaces, and clear failure states."
            delay={60}
          />
          <Card
            num="03"
            title="Partners"
            body="The strongest partner enters through function: what you make easier, safer, faster, or more inspectable."
            cta="Join a readiness track"
            href={OFFICIAL_LINKS.intakeForm}
            delay={120}
          />
        </CardGrid>
      </Section>

      <Section id="users" title="Faster Cardano apps. Same wallet. Same ADA.">
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

    </main>
  );
}
