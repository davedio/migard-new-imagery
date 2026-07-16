import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import EconomicsMatrix from "@/components/site/EconomicsMatrix";
import JumpChips from "@/components/site/JumpChips";
import SoftConfirmFeed from "@/components/site/SoftConfirmFeed";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY, ECONOMICS_MATRIX } from "@/lib/siteCopy";
import styles from "../how-it-works/page.module.css";
import learnStyles from "@/components/site/learn.module.css";

export const metadata: Metadata = {
  title: "Learn Midgard",
  description:
    "Overview of Midgard, how it works, security standards, and the basic economics.",
  openGraph: {
    title: "Learn Midgard",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

const audienceRows = [
  {
    label: "Users",
    body: "Use apps with faster confirmations, lower fees, and final settlement on Cardano.",
    href: "/users",
  },
  {
    label: "Builders",
    body: "Build apps with faster execution and lower fees. Your contracts, tests, and tooling carry over; switching is close to one endpoint change.",
    href: "/developers",
  },
  {
    label: "Protocol roles",
    body: "Help run the network. Operators earn fees for ordering transactions into blocks; Watchers earn by stopping bad blocks before they settle.",
    href: "/participate",
  },
] as const;

const securityRows = [
  {
    label: "Before use: public contracts",
    body: "Anyone can inspect the public contracts before using Midgard.",
    href: "/developers#contracts",
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
    body: "Midgard is designed for faster, lower-cost execution, with verification and settlement anchored to Cardano.",
    takeaway: "Execution moves faster; final settlement remains on Cardano.",
    tone: "green",
  },
  {
    n: "02",
    title: "A transaction becomes usable before it becomes final.",
    body: "A soft confirmation gives the app a usable signal in seconds. Blocks then seal that activity into an ordered record.",
    takeaway: "Fast confirmation and final settlement are two different moments.",
    tone: "cobalt",
  },
  {
    n: "03",
    title: "Committed state stays public, available, and challengeable.",
    body: "Block data must remain available so independent Watchers can replay the state and challenge an invalid commitment.",
    takeaway: "Operators order transactions; Watchers check correctness.",
    tone: "gold",
  },
  {
    n: "04",
    title: "Verified state settles to Cardano.",
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
  {
    k: "Status",
    v: "Pre-alpha testnet",
    s: "Live on Cardano preprod. Mainnet follows audits and parameter finalization.",
  },
] as const;

export default function LearnPage() {
  return (
    <HowItWorksExperience
      beforeJourney={
        <>
          <PageHero
            compact
            label="Learn Midgard"
            title="Midgard Overview."
            sub="Overview of Midgard, how it works, security standards, and the basic economics."
            body="Learn what users experience, what happens underneath, and where trust comes from."
          />

          <JumpChips
            items={[
              { id: "basics", label: "Overview" },
              { id: "flow", label: "Soft confirms" },
              { id: "proof-metrics", label: "Key numbers" },
              { id: "security", label: "Security" },
              { id: "full-journey", label: "Full journey" },
              { id: "paths", label: "Paths" },
              { id: "economics", label: "Economics" },
            ]}
          />

          <Section
            id="basics"
            title="Summary view."
          >
            <ol className={learnStyles.primerList} aria-label="Midgard overview">
              {primerSteps.map((step) => (
                <li key={step.n} className={learnStyles.primerStep} data-tone={step.tone}>
                  <span className={learnStyles.primerNumber}>{step.n} / 04</span>
                  <div className={learnStyles.primerTitle}>
                    <h3>{step.title}</h3>
                  </div>
                  <div className={learnStyles.primerBody}>
                    <p>{step.body}</p>
                    {"takeaway" in step ? (
                      <p className={learnStyles.primerTakeaway}>{step.takeaway}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
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
            id="proof-metrics"
            title="The key numbers."
            lead="Six indicators: estimated where forward-looking, checkable where live."
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

          <Section
            id="security"
            title="Security, in plain language."
            lead="Midgard is checked at three points: public contracts before use, independent Watchers during the challenge period, and final state secured on Cardano after verification."
          >
            <DataRows rows={securityRows} ariaLabel="Security assumptions" />
          </Section>
        </>
      }
    >

      <Section
        id="paths"
        title="Choose what suits you."
        lead="Users move value, builders integrate apps, and protocol roles keep the network checkable."
      >
        <DataRows rows={audienceRows} ariaLabel="Midgard reader paths" />
      </Section>

      {/* The cross-entity economics view — the /economics page folded into
          this table on 2026-07-11; each audience page tells its own side. */}
      <Section
        id="economics"
        title={ECONOMICS_MATRIX.title}
        lead={ECONOMICS_MATRIX.lead}
        cols
        aside={
          <Statement
            align="left"
            kicker={ECONOMICS_MATRIX.thesis.kicker}
            line={ECONOMICS_MATRIX.thesis.line}
          />
        }
      >
        <EconomicsMatrix />
      </Section>
    </HowItWorksExperience>
  );
}
