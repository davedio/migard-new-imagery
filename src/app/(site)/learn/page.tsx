import HowItWorksExperience from "@/components/HowItWorksExperience";
import FaqSections, { FAQ_GROUPS } from "@/components/site/FaqSections";
import { ExternalLinkNotice } from "@/components/site/ExternalLinkNotice";
import GlossaryList from "@/components/site/GlossaryList";
import JumpChips from "@/components/site/JumpChips";
import LearnMovedSectionRedirect from "@/components/site/LearnMovedSectionRedirect";
import SoftConfirmFeed from "@/components/site/SoftConfirmFeed";
import { DataRows } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { BENCHMARK_STATUS_NOTES, DEVELOPER_COPY } from "@/lib/siteCopy";
import { createPageMetadata } from "@/lib/siteMetadata";
import styles from "../how-it-works/page.module.css";
import learnStyles from "@/components/site/learn.module.css";

export const metadata = createPageMetadata("learn");

const securityRows = [
  {
    label: "Preprod contracts",
    body: "Protocol contracts and the static genesis snapshot are public on Cardano preprod.",
    href: "/developers#contracts",
  },
  {
    label: "During confirmation: Watchers",
    body: "During the challenge period, Watchers replay commitments. One honest Watcher can stop invalid state.",
  },
  {
    label: "After verification: Cardano",
    body: "After verification, final state is secured on Cardano.",
  },
  ...DEVELOPER_COPY.security.rows,
] as const;

const primerSteps = [
  {
    n: "01",
    title: "Midgard is the execution layer for UTXO finance.",
    body: "Midgard gives UTXO finance faster, lower-cost execution while verification and final settlement remain anchored to Cardano.",
    tone: "green",
  },
  {
    n: "02",
    title: "A transaction becomes usable before it becomes final.",
    body: "A soft confirmation gives an app a usable signal in seconds. Blocks then seal that activity into an ordered record, making fast confirmation and final settlement two distinct moments.",
    tone: "cobalt",
  },
  {
    n: "03",
    title: "Committed state stays public, available, and challengeable.",
    body: "Operators order transactions, while independent Watchers replay the publicly available block data to check correctness and challenge an invalid commitment.",
    tone: "gold",
  },
  {
    n: "04",
    title: "Verified state settles on Cardano.",
    body: "After verification clears, Midgard state becomes final on Cardano.",
    tone: "cobalt",
  },
] as const;

const stripCells = [
  {
    k: "Throughput",
    v: "Up to 300x",
    s: "Execution throughput compared with Cardano L1.",
  },
  {
    k: "Fees",
    v: "Low, stable, paid in ADA",
    s: "10 to 30x cheaper than L1.",
  },
  {
    k: "Security",
    v: "Open source",
    s: "Public contracts and fault-proof logic make the trust path open to inspection.",
    cta: "Inspect the protocol source",
    href: OFFICIAL_LINKS.github,
  },
  {
    k: "Soft confirmations",
    v: "Seconds",
    s: "Transactions become usable in seconds while settlement continues on Cardano.",
  },
  {
    k: "Execution model",
    v: "UTXO-native",
    s: "Midgard is designed around UTXO transaction logic, without an EVM translation layer.",
  },
] as const;

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  description: BENCHMARK_STATUS_NOTES.performanceCostReward,
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  ),
};

export default function LearnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_JSONLD).replace(/</g, "\\u003c"),
        }}
      />
      <HowItWorksExperience
        beforeJourney={
          <>
          <LearnMovedSectionRedirect />
          <PageHero
            compact
            label="Learn Midgard"
            title="Midgard Overview"
            sub="How Midgard works, what makes it checkable, and the terms used across the protocol."
            body={BENCHMARK_STATUS_NOTES.performanceCostReward}
          />

          <JumpChips
            items={[
              { id: "basics", label: "Overview" },
              { id: "proof-metrics", label: "Key numbers" },
              { id: "flow", label: "Soft confirms" },
              { id: "security", label: "Security" },
              { id: "full-journey", label: "Full journey" },
              { id: "faq", label: "FAQs" },
              { id: "glossary", label: "Glossary" },
            ]}
          />

          <Section
            id="basics"
            title="Summary view"
          >
            <ol className={learnStyles.primerList} aria-label="Midgard overview">
              {primerSteps.map((step) => (
                <li key={step.n} className={learnStyles.primerStep} data-tone={step.tone}>
                  <span className={learnStyles.primerNumber}>{step.n}</span>
                  <div className={learnStyles.primerTitle}>
                    <h3>{step.title}</h3>
                  </div>
                  <div className={learnStyles.primerBody}>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section
            id="proof-metrics"
            title="The key numbers"
            lead="Five indicators covering performance, cost, security, and execution."
          >
            <div className={styles.strip} role="list" aria-label="Key performance and security indicators">
              {stripCells.map((item) => (
                <div key={item.k} role="listitem" className={styles.cell}>
                  <span className={styles.cellKicker}>{item.k}</span>
                  <span className={styles.cellValue}>{item.v}</span>
                  <span className={styles.cellFine}>{item.s}</span>
                  {"href" in item && item.href ? (
                    <a
                      className={styles.cellLink}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.cta} →
                      <ExternalLinkNotice />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>

          {/* The soft-confirm feed — agreed on the 2026-07-10 call: the
              per-transaction view (TXs soft-confirm, blocks seal them, commits
              settle down to Cardano). Simulated and labelled as such. */}
          <Section
            id="flow"
            title="Watch transactions soft-confirm."
            lead="A simulated view of soft confirmation, block sealing, and settlement on Cardano."
          >
            <SoftConfirmFeed />
          </Section>

          <Section
            id="security"
            title="Security, in plain language"
            lead="What is public, who checks it, and where final state settles."
          >
            <DataRows rows={securityRows} ariaLabel="Security assumptions" />
          </Section>
          </>
        }
      >

        <FaqSections cols />
        <Section
          id="glossary"
          title="Glossary"
          lead="The language of execution, verification, and settlement, defined in plain English."
          cols
        >
          <GlossaryList />
        </Section>
      </HowItWorksExperience>
    </>
  );
}
