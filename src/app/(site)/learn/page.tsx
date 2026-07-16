import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import FaqSections from "@/components/site/FaqSections";
import GlossaryList from "@/components/site/GlossaryList";
import JumpChips from "@/components/site/JumpChips";
import LearnMovedSectionRedirect from "@/components/site/LearnMovedSectionRedirect";
import SoftConfirmFeed from "@/components/site/SoftConfirmFeed";
import { DataRows } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY } from "@/lib/siteCopy";
import styles from "../how-it-works/page.module.css";
import learnStyles from "@/components/site/learn.module.css";

export const metadata: Metadata = {
  title: "Learn Midgard",
  description:
    "Overview of Midgard, how it works, security standards, common questions, and protocol terms.",
  openGraph: {
    title: "Learn Midgard",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

const securityRows = [
  {
    label: "At launch: contract addresses",
    body: "Contract addresses and state anchors will be published when Midgard is live on Cardano preprod.",
    href: "/status",
  },
  {
    label: "During confirmation: Watchers",
    body: "Watchers replay commitments during the challenge period; one honest Watcher is enough to stop invalid state.",
  },
  {
    label: "After verification: Cardano",
    body: "After verification clears, finalized state is secured on Cardano.",
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
    s: "Estimated design target.",
  },
  {
    k: "Fees",
    v: "Low, stable, paid in ADA",
    s: "Estimated 10 to 30x cheaper than L1.",
  },
  {
    k: "Security",
    v: "Open source",
    s: "Public contracts and formal verification work make security claims checkable.",
    cta: "Review formal verification work",
    href: OFFICIAL_LINKS.blaster,
  },
  {
    k: "Soft confirmations",
    v: "Seconds",
    s: "Transactions become usable in seconds (estimated) while settlement continues on Cardano.",
  },
  {
    k: "Execution model",
    v: "UTXO-native",
    s: "Applications keep their UTXO design and gain faster execution, with no EVM translation layer.",
  },
] as const;

export default function LearnPage() {
  return (
    <HowItWorksExperience
      beforeJourney={
        <>
          <LearnMovedSectionRedirect />
          <PageHero
            compact
            label="Learn Midgard"
            title="Midgard Overview."
            sub="Overview of Midgard, how it works, security standards, common questions, and protocol terms."
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
            title="Summary view."
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
            title="The key numbers."
            lead="Five indicators: estimated where forward-looking, checkable where live."
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
            lead="Transactions soft-confirm in seconds (estimated) while blocks seal behind them and commitments move to Cardano (simulated here)."
          >
            <SoftConfirmFeed />
          </Section>

          <Section
            id="security"
            title="Security, in plain language."
            lead="Midgard’s security model is built around public source, independent Watchers during the challenge period, and final state secured on Cardano after verification."
          >
            <DataRows rows={securityRows} ariaLabel="Security assumptions" />
          </Section>
        </>
      }
    >

      <FaqSections cols />
      <Section
        id="glossary"
        title="Glossary."
        lead="The language of execution, verification, and settlement, defined in plain English."
        cols
      >
        <GlossaryList />
      </Section>
    </HowItWorksExperience>
  );
}
