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
import styles from "@/components/site/learn.module.css";

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
    desc: "The operator commits compact state to the Cardano L1 settlement path.",
  },
  {
    n: "04",
    name: "Data availability check",
    desc: "Data availability participants check that the data behind the commitment can be inspected.",
  },
  {
    n: "05",
    name: "Watch",
    desc: "Watchers replay committed blocks and submit a fault proof when a commitment is wrong.",
  },
  {
    n: "06",
    name: "Settle",
    desc: "After verification, state reaches final Cardano L1 settlement.",
  },
];

const coreModel = [
  {
    n: "01",
    title: "User path",
    body: "Deposit, transact, withdraw.",
  },
  {
    n: "02",
    title: "Verification path",
    body: "Sequence, commit, replay, challenge.",
  },
  {
    n: "03",
    title: "Settlement path",
    body: "Final Cardano L1 settlement after verification.",
  },
] as const;

function CoreModel() {
  return (
    <div className={styles.coreModel} aria-label="Midgard core model">
      <div className={styles.coreCopy}>
        <h3>One path, three jobs.</h3>
        <p>
          Users get a simple app flow. The protocol keeps each commitment checkable. Settlement becomes final only after verification.
        </p>
      </div>
      <div className={styles.coreGraphic} aria-hidden="true">
        <div className={styles.coreSpine}>
          <span className={styles.corePacket} />
        </div>
        {coreModel.map((item) => (
          <div className={styles.coreLane} key={item.title}>
            <span>{item.n}</span>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="moss"
        title="Learn Midgard."
        sub="A plain-language map of faster UTXO execution, public verification, and Cardano L1 settlement."
        actions={[
          { label: "See how it works", href: "/how-it-works", variant: "primary" },
          { label: "Read security", href: "/security", variant: "ghost" },
        ]}
      />

      <Section
        title="One page for the core idea."
        lead="Midgard lets UTXO applications run faster while keeping the settlement path checkable."
      >
        <CoreModel />
        <CardGrid>
          <Card
            num="01"
            title="What Midgard is"
            body="Midgard is an optimistic rollup for UTXO finance: applications execute faster, while verified state settles through Cardano L1."
          />
          <Card
            num="02"
            title="What users do"
            body="Deposit, transact, withdraw. The user path stays simple while the protocol handles verification underneath."
          />
          <Card
            num="03"
            title="What the protocol does"
            body="Submit, sequence, commit, data availability, watch, settle. These steps turn fast execution into verified settlement."
          />
          <Card
            num="04"
            title="What to inspect"
            body="Source code, contract surface, security model, testnet status, approved parameters, and the official path for reporting issues."
            cta="Open GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
        </CardGrid>
      </Section>

      <Section
        id="roles"
        title="Pick the role that matches what you need."
        lead="Users move assets. Builders integrate applications. Protocol Roles operate and verify the system."
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
            body="Protocol Roles participate in the Midgard network. Operators and Watchers run nodes that verify commitments, challenge invalid state, and help secure the path to Cardano L1 settlement."
          />
        </CardGrid>
      </Section>

      <Section
        id="transaction-path"
        title="From fast execution to final settlement."
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
            body="Mathematically verified smart contracts, fault-proof verification, and final Cardano L1 settlement after verification reduce the attack surface without relying on operator reputation alone."
            cta="Read security"
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
            cta="Open GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
          <Card
            title="Economics"
            body="Current public positioning is ADA fees with no separate gas token at launch. Bonds, watcher incentives, and launch incentives should publish only after parameters are approved."
          />
        </CardGrid>
      </Section>

      <Section title="Current status stays explicit.">
        <Callout
          title="Pre-alpha testnet is the current public boundary."
          body="Midgard is early. Live status, verified code, and approved parameters are the source for claims that affect users, builders, and Protocol Roles."
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
            label: "Open GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />
    </main>
  );
}
