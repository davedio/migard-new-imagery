import type { Metadata } from "next";
import { GitHubIcon } from "@/components/site/BrandIcons";
import {
  Callout,
  Card,
  CardGrid,
  CtaBand,
  Layers,
  PageHero,
  Section,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Learn | Midgard",
  description:
    "A plain-language overview of Midgard: what it is, who it is for, how transactions move, and where to inspect the security model.",
  openGraph: {
    title: "Learn | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

const lifecycle = [
  {
    n: "01",
    name: "Submit",
    desc: "A user submits a transaction to Midgard.",
  },
  {
    n: "02",
    name: "Sequence",
    desc: "The operator orders valid transactions into an L2 block.",
  },
  {
    n: "03",
    name: "Commit",
    desc: "The operator commits compact state to the L1 settlement path.",
  },
  {
    n: "04",
    name: "Data availability check",
    desc: "Data availability participants check that the data behind the commitment can be inspected.",
  },
  {
    n: "05",
    name: "Watch",
    desc: "Watchers replay state and use the fault-proof path when a commitment is wrong.",
  },
  {
    n: "06",
    name: "Settle",
    desc: "After verification, state reaches final L1 settlement.",
  },
];

export default function LearnPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="moss"
        title="Learn Midgard."
        sub="The secure scaling layer for UTXO finance: faster execution, UTXO-native design, and L1 settlement after verification."
        actions={[
          { label: "See how it works", href: "/how-it-works", variant: "primary" },
          { label: "Read security", href: "/security", variant: "ghost" },
        ]}
      />

      <Section
        title="One page for the core idea."
        lead="Midgard lets UTXO applications run faster while keeping the settlement path checkable."
      >
        <CardGrid>
          <Card
            num="01"
            title="What Midgard is"
            body="Midgard is an optimistic rollup for UTXO finance. It gives applications faster execution without asking users to trade away full L1 settlement security."
          />
          <Card
            num="02"
            title="What users do"
            body="Deposit, transact, withdraw. The user path stays simple while the protocol handles verification underneath."
          />
          <Card
            num="03"
            title="What the protocol does"
            body="Submit, sequence, commit, data availability check, watch, settle. Those are the moving parts that turn fast activity into settled state."
          />
          <Card
            num="04"
            title="What to inspect"
            body="Source code, security model, testnet status, approved parameters, and the public path for reporting issues."
            cta="View GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
        </CardGrid>
      </Section>

      <Section
        id="roles"
        title="Find where you fit."
        lead="Start with Users, Builders, or Protocol Roles."
      >
        <CardGrid>
          <Card
            num="01"
            title="Users"
            body="Users care about simple movement: deposit assets, transact faster, and withdraw through the settlement path."
          />
          <Card
            num="02"
            title="Builders"
            body="Builders care about UTXO-native application design, lower latency, and source they can inspect before integrating."
          />
          <Card
            num="03"
            title="Protocol Roles"
            body="Operators & Watchers keep Midgard running and verifiable: Operators sequence transactions; Watchers replay commitments and challenge invalid state through the fault-proof path."
          />
        </CardGrid>
      </Section>

      <Section
        id="transaction-path"
        title="From fast action to final settlement."
        lead="The short version is easy to say, and the deeper mechanism is still available for people who need to inspect it."
        tight
      >
        <Layers items={lifecycle} />
      </Section>

      <Section
        title="Faster execution without softening trust."
        lead="The model is simple to review: faster execution first, then challenge and settlement."
      >
        <CardGrid cols={2}>
          <Card
            title="Security"
            body="Mathematically verified smart contracts, fault-proof verification, and final L1 settlement after verification reduce the attack surface without relying on operator reputation alone."
            cta="Open security"
            href="/security"
          />
          <Card
            title="FAQ"
            body="Compare trust assumptions, bridge exposure, DA assumptions, throughput, and the difference between soft confirmation and settlement."
            cta="Open FAQ"
            href="/faq"
          />
          <Card
            title="GitHub"
            body="Serious builders and reviewers can move from the overview to the source quickly."
            cta="View GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
          <Card
            title="Economics"
            body="Fees, operator bonds, watcher incentives, and launch incentives will be published through official channels as parameters are approved."
          />
        </CardGrid>
      </Section>

      <Section title="Current status stays explicit.">
        <Callout
          title="Pre-alpha testnet is the current public boundary."
          body="Midgard is early. Live status, verified code, and approved parameters are the source for claims that affect users, builders, and protocol roles."
          items={[
            "Fault-proof verification is the public verification path.",
            "Data availability and watcher assumptions are part of the security model.",
            "Rewards, bonds, and partner claims appear only after parameters are approved.",
          ]}
        />
      </Section>

      <CtaBand
        title="Move from overview to mechanism."
        lead="Start with the plain-language model, then inspect the transaction flow, the security path, and the source."
        actions={[
          { label: "How it works", href: "/how-it-works", variant: "primary" },
          {
            label: "View GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />
    </main>
  );
}
