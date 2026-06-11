import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  Actions,
} from "@/components/site/ui";
import { DeveloperSwitch } from "@/components/site/DeveloperSwitch";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { NetworkRoles } from "@/components/site/NetworkRoles";
import { NextSteps } from "@/components/site/NextSteps";

export const metadata: Metadata = {
  title: "Get Started With Midgard",
  description:
    "Get started with Midgard in one of three roles: users, builders, and operators & watchers.",
  openGraph: {
    title: "Get Started With Midgard",
    images: [{ url: "/og/get-started.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/get-started.jpg"] },
};

const AUDIENCE_PATHS: {
  num: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}[] = [
  {
    num: "01",
    title: "Users",
    body: "Use Cardano apps that run on Midgard — same wallet, same ADA. Start from official links and read the status before you sign anything.",
    cta: "Start as a user",
    href: "#users",
  },
  {
    num: "02",
    title: "Builders",
    body: "For wallets and dApps — DEXs, lending protocols, and any other application. Same eUTXO model and tooling; switching is one endpoint change.",
    cta: "Start building",
    href: "#builder-quickstart",
  },
  {
    num: "03",
    title: "Operators & Watchers",
    body: "Run the protocol: operators sequence and commit blocks in rotating shifts, watchers catch bad blocks and prove it on L1.",
    cta: "Run the protocol",
    href: "#network-roles",
  },
];

export default function GetStartedPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Get Started"
        title="Choose your path into Midgard"
        sub="Three ways to take part in the Cardano-native Layer 2: as a user, a builder, or an operator & watcher. Start with source, status, and a clear role."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Read the docs", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section
        eyebrow="Choose your path"
        title="Three roles. One protocol"
        lead="Midgard meets you in one of three roles. These roles overlap — pick the one that fits what you're here to do."
      >
        <CardGrid>
          {AUDIENCE_PATHS.map((a) => (
            <Card
              key={a.title}
              num={a.num}
              title={a.title}
              body={a.body}
              cta={a.cta}
              href={a.href}
              ctaGlow
              delay={Number(a.num) * 70}
            />
          ))}
        </CardGrid>
      </Section>

      <NetworkRoles />

      <Section
        id="builder-quickstart"
        eyebrow="Where to start"
        title="One concrete builder sequence"
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
            ctaGlow
            delay={70}
          />
          <Card
            num="03"
            title="Check the status"
            body="Use the contracts &amp; testnet status page for what is live now, what is simulated in the preview, and what still needs final confirmation."
            cta="View status"
            href="/contracts"
            delay={140}
          />
          <Card
            num="04"
            title="Bring concrete questions"
            body="The best feedback names a flow, a constraint, a wallet state, or a fallback path that needs to work."
            cta="Register interest"
            href={OFFICIAL_LINKS.intakeForm}
            ctaGlow
            delay={210}
          />
        </CardGrid>
      </Section>

      <Section
        id="developer-switch"
        eyebrow="Zero migration"
        title="For developers, almost nothing changes"
        lead="Same eUTXO model, same scripts, same tooling. Switching to Midgard is one endpoint change — toggle the target and watch what moves."
        glow="green"
      >
        <DeveloperSwitch />
      </Section>

      <Section id="users" title="Faster Cardano apps. Same wallet. Same ADA">
        <Prose
          items={[
            {
              text: "For most people, Midgard feels like Cardano, just faster: the same wallet, the same ADA, lower-friction application use, and the same L1 trust anchor underneath.",
            },
            {
              text: "The user job is simple: start from official links, read the status, and do not sign anything you do not understand.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Stay safe" title="Use official links" tight>
        <Prose
          items={[
            {
              text: "Midgard will never ask for your seed phrase, private key, or password. The full safety checklist lives on the official links page — start every session from there.",
            },
          ]}
        />
        <Actions
          items={[
            { label: "Open official links", href: "/official-links", variant: "ghost" },
          ]}
        />
      </Section>

      <NextSteps
        items={[
          {
            label: "Watch a transaction travel",
            sub: "Ride one transaction from Layer 2 down to Cardano",
            href: "/how-it-works",
          },
          {
            label: "Read the security model",
            sub: "Challenges, watchers, and the proof path",
            href: "/contracts#security-model",
          },
          {
            label: "Verify the contracts",
            sub: "Every address on Cardano preprod, open on an explorer",
            href: "/contracts",
          },
        ]}
      />

    </main>
  );
}
