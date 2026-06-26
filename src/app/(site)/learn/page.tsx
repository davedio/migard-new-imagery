import type { Metadata } from "next";
import { GitHubIcon } from "@/components/site/BrandIcons";
import PageBackdrop from "@/components/site/PageBackdrop";
import {
  Actions,
  Card,
  CardGrid,
  Callout,
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

const trustPath = [
  {
    n: "01",
    title: "Soft confirmation",
    body: "Users can receive a faster usable confirmation before final settlement.",
  },
  {
    n: "02",
    title: "Committed state",
    body: "Operators post compact state to the settlement path where it can be inspected.",
  },
  {
    n: "03",
    title: "Watcher replay",
    body: "Watchers replay commitments and use the fault-proof path if state is invalid.",
  },
  {
    n: "04",
    title: "Cardano L1 settlement",
    body: "After verification, finalized state settles through the Cardano L1 path and inherits the security of that settlement layer.",
  },
] as const;

const securityInspection = [
  {
    n: "01",
    title: "Understand the trust path",
    body: "Soft confirmation, committed state, Watcher replay, and final settlement.",
    cta: "Review path",
    href: "#security-overview",
  },
  {
    n: "02",
    title: "Inspect contracts",
    body: "Validator topology, state anchors, reference scripts, and genesis history.",
    cta: "Open contracts",
    href: "/contracts",
  },
  {
    n: "03",
    title: "Review source",
    body: "Implementation details, node code, contracts, and public technical review.",
    cta: "Open GitHub",
    href: OFFICIAL_LINKS.github,
    github: true,
  },
  {
    n: "04",
    title: "Report safely",
    body: "Vulnerabilities, impersonation, and sensitive findings belong in the security policy.",
    cta: "Security policy",
    href: OFFICIAL_LINKS.securityPolicy,
  },
] as const;

const securityLayers = [
  {
    n: "01",
    name: "Finality",
    desc: "Fast soft confirmation is separate from later settlement after the fault-proof window.",
  },
  {
    n: "02",
    name: "Validity",
    desc: "Committed state must be verifiable against the protocol rules, not accepted on operator reputation alone.",
  },
  {
    n: "03",
    name: "Availability",
    desc: "Data availability is a security assumption: block data must remain available during the challenge window so Watchers can replay it.",
  },
  {
    n: "04",
    name: "Recovery",
    desc: "The escape and challenge surfaces should be clear before production value depends on them.",
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

function SecurityOverview() {
  return (
    <>
      <CardGrid cols={2}>
        {securityInspection.map((item) => (
          <Card
            key={item.title}
            num={item.n}
            title={item.title}
            body={item.body}
            cta={item.cta}
            ctaIcon={"github" in item ? <GitHubIcon size={14} /> : undefined}
            href={item.href}
          />
        ))}
      </CardGrid>

      <div className={styles.trustDiagram} aria-label="Security path from soft confirmation to Cardano L1 settlement">
        {trustPath.map((step) => (
          <article className={styles.trustStep} key={step.n}>
            <span>{step.n}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.exploitNote}>
        <strong>Lower attack surface, not magic.</strong>
        <p>
          On-chain finance systems can still fail. Midgard makes a narrower and more inspectable claim: keep the critical settlement surface small, mathematically verified, independently replayable, and contestable before Cardano L1 settlement.
        </p>
      </div>

      <div className={styles.claimBoundary} aria-label="Security claim boundaries">
        <article>
          <h3>What the claim means</h3>
          <ul>
            <li>Soft confirmations improve usability before final settlement.</li>
            <li>Committed state remains replayable and challengeable.</li>
            <li>Finalized state inherits Cardano L1 security after verification.</li>
          </ul>
        </article>
        <article>
          <h3>What it does not mean</h3>
          <ul>
            <li>Soft confirmations are not final settlement.</li>
            <li>No protocol should claim exploits are impossible.</li>
            <li>Unofficial links, DMs, and support accounts should not be trusted.</li>
          </ul>
        </article>
      </div>
    </>
  );
}

export default function LearnPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="terraces" focus="50% 48%" />
      <PageHero
        compact
        tone="moss"
        title="Learn Midgard."
        sub="A plain-language map of faster UTXO execution, public verification, and Cardano L1 settlement."
        actions={[
          { label: "See how it works", href: "/how-it-works", variant: "primary" },
          { label: "Read security", href: "#security-overview", variant: "ghost" },
        ]}
      />

      <Section
        title="The simple model."
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
        id="security-overview"
        title="Security assumptions you can inspect."
        lead="Midgard narrows the critical surface: mathematically verified contracts, UTXO-local proofs, Watcher replay, data availability, and Cardano L1 settlement after verification."
        glow="green"
      >
        <SecurityOverview />
      </Section>

      <Section title="The attack surface is narrower by design.">
        <CardGrid cols={3}>
          <Card
            num="01"
            title="Mathematically verified contracts"
            body="Core settlement logic is built around formal methods so the most important contracts can be checked with more than conventional testing."
          />
          <Card
            num="02"
            title="Fault-proof verification"
            body="Operators do not get the final word. Committed state can be challenged before it becomes settled state."
          />
          <Card
            num="03"
            title="UTXO-local state"
            body="UTXO structure helps a fault proof focus on the relevant inputs and transition instead of broad global account state."
          />
          <Card
            num="04"
            title="Watcher visibility"
            body="Every committed block should be replayable and inspectable by independent Watchers, not only by the operator that produced it."
          />
          <Card
            num="05"
            title="Open-source review"
            body="Security improves when builders, Protocol Roles, and auditors can inspect the implementation directly."
            cta="Open GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
          <Card
            num="06"
            title="Official reporting"
            body="Vulnerabilities, impersonation, exploits, and sensitive findings should move through the security policy with evidence preserved."
            cta="Security policy"
            href={OFFICIAL_LINKS.securityPolicy}
          />
        </CardGrid>
      </Section>

      <Section
        id="security-guarantees"
        title="What serious users should inspect."
        tight
      >
        <Layers items={securityLayers} />
      </Section>

      <Section id="disclosure" title="Security reporting should be boring and official.">
        <CardGrid cols={2}>
          <Card
            title="Vulnerability or impersonation"
            body="Use the security policy. Preserve links, account names, screenshots, timestamps, and where you saw the issue."
            cta="Security policy"
            href={OFFICIAL_LINKS.securityPolicy}
          />
          <Card
            title="General user question"
            body="Use Discord for non-sensitive help. Do not share wallet secrets, private account details, or recovery material."
            cta="Join Discord"
            href={OFFICIAL_LINKS.discord}
          />
          <Card
            title="Builder or integration issue"
            body="Use GitHub for source-level issues, or bring a concrete flow through the intake form."
            cta="Open GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
          <Card
            title="Protocol Role interest"
            body="Use the intake form for operator, watcher, infrastructure, or deeper testnet participation."
            cta="Register interest"
            href={OFFICIAL_LINKS.intakeForm}
          />
        </CardGrid>
        <Callout
          title="Use official routes and preserve evidence."
          body="Do not rely on unsolicited support messages. If you see a suspicious link, account, or security issue, preserve the URL, account name, screenshot, timestamp, and where you saw it."
          items={[
            "Never share a seed phrase, private key, recovery phrase, or password.",
            "Do not sign wallet approvals you do not understand.",
            "Use the security policy for vulnerabilities and impersonation; use community channels only for non-sensitive questions.",
          ]}
        />
        <Actions
          items={[
            {
              label: "Security policy",
              href: OFFICIAL_LINKS.securityPolicy,
              variant: "ghost",
            },
            { label: "Read the FAQ", href: "/faq", variant: "ghost" },
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
