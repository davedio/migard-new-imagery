import type { Metadata } from "next";
import Link from "next/link";
import {
  Actions,
  Callout,
  Card,
  CardGrid,
  CtaBand,
  Layers,
  PageHero,
  Section,
} from "@/components/site/ui";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import styles from "@/components/site/security.module.css";

export const metadata: Metadata = {
  title: "Security | Midgard",
  description:
    "How Midgard approaches L1 security, mathematically verified smart contracts, fault-proof verification, and eUTXO-local security.",
  openGraph: {
    title: "Security | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

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
    title: "L1 settlement",
    body: "After verification, finalized state inherits the full security of the L1 settlement layer.",
  },
] as const;

type ReviewRoute = {
  n: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone?: "gold";
};

const reviewRoutes: ReviewRoute[] = [
  {
    n: "01",
    title: "Understand the trust path",
    body: "Soft confirmation, committed state, Watcher replay, and final settlement.",
    cta: "Read mechanism",
    href: "#mechanism",
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
  },
  {
    n: "04",
    title: "Report safely",
    body: "Vulnerabilities, impersonation, and sensitive findings belong in the security policy.",
    cta: "Security policy",
    href: OFFICIAL_LINKS.securityPolicy,
    tone: "gold",
  },
] as const;

function RouteCard({ item }: { item: ReviewRoute }) {
  const external = /^https?:\/\//.test(item.href);
  const inner = (
    <>
      <span>{item.n}</span>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <strong>{item.cta} -&gt;</strong>
    </>
  );

  if (external) {
    return (
      <a className={styles.reviewRouteCard} data-tone={item.tone} href={item.href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link className={styles.reviewRouteCard} data-tone={item.tone} href={item.href}>
      {inner}
    </Link>
  );
}

export default function SecurityPage() {
  return (
    <main className={`page-main ${styles.securityPage}`}>
      <PageHero
        compact
        tone="ink"
        title="Security you can inspect."
        sub="Midgard combines mathematically verified smart contracts, fault-proof verification, and eUTXO-local state so faster execution does not require weaker settlement security."
        actions={[
          { label: "Read the mechanism", href: "#mechanism", variant: "primary" },
          {
            label: "Open GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />

      <section className={styles.reviewRoutes} aria-labelledby="security-review-routes-title">
        <div className={styles.reviewRoutesInner}>
          <div className={styles.reviewRoutesHead}>
            <h2 id="security-review-routes-title">Start with the right security route.</h2>
            <p>Read the model, inspect the contracts, review the source, or report something sensitive through the official path.</p>
          </div>
          <div className={styles.reviewRouteGrid}>
            {reviewRoutes.map((item) => (
              <RouteCard item={item} key={item.title} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="mechanism"
        className={styles.trustSection}
        aria-labelledby="security-mechanism-title"
      >
        <div className={styles.trustInner}>
          <div className={styles.trustHead}>
            <h2 id="security-mechanism-title">Fast confirmations first. Full L1 security after verification.</h2>
            <p>
              Operators can make activity feel fast, but finality still depends on the base-layer settlement path and the challenge rules around committed state.
            </p>
          </div>
          <div className={styles.trustDiagram} aria-label="Security path from soft confirmation to L1 settlement">
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
              On-chain finance systems can still fail. Midgard makes a narrower and more inspectable claim: keep the critical settlement surface small, mathematically verified, independently replayable, and contestable before final settlement.
            </p>
          </div>
          <div className={styles.claimBoundary} aria-label="Security claim boundaries">
            <article>
              <h3>What the claim means</h3>
              <ul>
                <li>Soft confirmations improve usability before final settlement.</li>
                <li>Committed state remains replayable and challengeable.</li>
                <li>Finalized state inherits L1 security after verification.</li>
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
        </div>
      </section>

      <Section title="The attack surface is narrower by design.">
        <CardGrid>
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
            title="eUTXO-local state"
            body="eUTXO structure helps localize what must be inspected, reducing the broad shared-state surface that attackers often exploit."
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
            title="Honest status labels"
            body="Public claims should stay tied to live status, measured benchmarks, approved parameters, and the current pre-alpha testnet boundary."
          />
        </CardGrid>
      </Section>

      <Section
        id="guarantees"
        title="What serious users should inspect."
        tight
      >
        <Layers
          items={[
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
              desc: "Data availability checks belong in the deeper mechanism, where builders can inspect the assumptions.",
            },
            {
              n: "04",
              name: "Recovery",
              desc: "The escape and challenge surfaces should be clear before production value depends on them.",
            },
          ]}
        />
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
        title="Trust should be checkable."
        lead="Read the mechanism, inspect the source, and compare the security model before treating any performance claim as meaningful."
        actions={[
          { label: "Open FAQ", href: "/faq", variant: "primary" },
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
