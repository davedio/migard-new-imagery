import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import EconomicsMatrix from "@/components/site/EconomicsMatrix";
import JumpChips, { SectionJumpButton } from "@/components/site/JumpChips";
import SoftConfirmFeed from "@/components/site/SoftConfirmFeed";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY, ECONOMICS_MATRIX, SITE_COPY } from "@/lib/siteCopy";
import styles from "../how-it-works/page.module.css";
import learnStyles from "@/components/site/learn.module.css";

export const metadata: Metadata = {
  title: "Learn Midgard",
  description:
    "Follow a transaction through Midgard, then review the user path, security assumptions, and Cardano L1 settlement model.",
  openGraph: {
    title: "Learn Midgard",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

const audienceRows = [
  {
    label: "Users",
    body: "Use apps with faster confirmations, fees in ADA, and final settlement rooted back to Cardano.",
    href: "/users",
  },
  {
    label: "Builders",
    body: SITE_COPY.paths[1].body,
    href: "/developers",
  },
  {
    label: "Protocol Roles",
    body: SITE_COPY.paths[2].body,
    href: "/participate",
  },
] as const;

const securityRows = [
  {
    label: "Cardano-rooted settlement",
    body: "Fast confirmations happen up front, but verified state settles through Cardano L1.",
  },
  {
    label: "Verification before finality",
    body: "Committed state stays public and challengeable before it becomes settled state.",
  },
  {
    label: "One honest Watcher",
    body: "One honest Watcher, out of any number, is enough to stop a bad block before it settles.",
  },
  {
    label: "Contracts in the open",
    body: "Public source with formal-methods work in progress, so claims can be checked rather than accepted on trust.",
    href: "/developers#contracts",
  },
  ...DEVELOPER_COPY.security.rows,
] as const;

const CUT_PROOF_POINTS = new Set(["Settlement security", "Independent verification"]);

const primerSteps = [
  {
    n: "01",
    kicker: "What it is",
    title: "Midgard is a scaling layer for UTXO finance.",
    body: "Apps execute activity on Midgard so they can feel faster and cost less than doing every action directly on Cardano L1.",
    takeaway: "The app experience moves faster; the final settlement layer does not change.",
    tone: "green",
  },
  {
    n: "02",
    kicker: "What users feel",
    title: "A transaction becomes usable before it becomes final.",
    body: "A soft confirmation gives the app a fast signal in seconds. Blocks then seal that activity into an ordered record.",
    takeaway: "Fast confirmation and final settlement are two different moments.",
    tone: "cobalt",
  },
  {
    n: "03",
    kicker: "What keeps it checkable",
    title: "Committed state stays public, available, and challengeable.",
    body: "Block data must remain available so independent Watchers can replay the state and challenge an invalid commitment.",
    takeaway: "The operator can order transactions, but does not get the final word on correctness.",
    tone: "gold",
  },
  {
    n: "04",
    kicker: "Where it ends",
    title: "Verified state settles through Cardano L1.",
    body: "Once the verification path clears, Midgard state becomes final through the Cardano settlement layer.",
    takeaway: "Midgard separates responsive execution from Cardano-rooted finality.",
    tone: "cobalt",
  },
] as const;

const stripCells = [
  ...SITE_COPY.proofPoints.filter((p) => !CUT_PROOF_POINTS.has(p.k)),
  {
    k: "Fees",
    v: "In ADA",
    s: "A fraction of L1 cost, estimated — you pay fees in ADA.",
  },
  {
    k: "Throughput",
    v: "Up to 300x",
    s: "Estimated design target — unbenchmarked until measured.",
  },
];

export default function LearnPage() {
  return (
    <HowItWorksExperience
      beforeJourney={
        <>
          <PageHero
            compact
            label="Learn Midgard"
            title="Midgard 101."
            sub="Start with the four ideas that make the protocol click."
            body="Learn what users experience, what happens underneath, and where trust comes from. The full transaction journey comes after the essentials."
            chips={
              <>
                <SectionJumpButton id="basics" label="Start the 101" variant="primary" />
                <SectionJumpButton id="full-journey" label="Skip to the full journey" />
              </>
            }
          />

          <JumpChips
            items={[
              { id: "basics", label: "Midgard 101" },
              { id: "flow", label: "Soft confirms" },
              { id: "proof-metrics", label: "Proof metrics" },
              { id: "security", label: "Security" },
              { id: "full-journey", label: "Full journey" },
              { id: "paths", label: "Paths" },
              { id: "economics", label: "Economics" },
            ]}
          />

          <Section
            id="basics"
            eyebrow="Four things to know"
            title="The short version."
            lead="Work through these ideas first. They are the vocabulary for everything the tree shows later."
          >
            <ol className={learnStyles.primerList} aria-label="Midgard 101 lessons">
              {primerSteps.map((step) => (
                <li key={step.n} className={learnStyles.primerStep} data-tone={step.tone}>
                  <span className={learnStyles.primerNumber}>{step.n} / 04</span>
                  <div className={learnStyles.primerTitle}>
                    <span>{step.kicker}</span>
                    <h3>{step.title}</h3>
                  </div>
                  <div className={learnStyles.primerBody}>
                    <p>{step.body}</p>
                    <p className={learnStyles.primerTakeaway}>
                      <strong>Keep this:</strong> {step.takeaway}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={learnStyles.primerHandoff}>
              <div>
                <span>101 complete</span>
                <p>Next, see the fast signal a user actually experiences.</p>
              </div>
              <SectionJumpButton
                id="flow"
                label="Watch soft confirmations"
                variant="primary"
              />
            </div>
          </Section>

          {/* The soft-confirm feed — agreed on the 2026-07-10 call: the
              per-transaction view (TXs soft-confirm, blocks seal them, commits
              settle down to Cardano). Simulated and labelled as such. */}
          <Section
            id="flow"
            eyebrow="What users feel first"
            title="Watch transactions soft-confirm."
            lead="Transactions become usable in seconds while blocks seal behind them and commit down to Cardano — simulated here to show the shape of the flow."
          >
            <SoftConfirmFeed />
          </Section>

          <Section
            id="proof-metrics"
            title="Proof metrics."
            lead="Six indicators — estimated where forward-looking, checkable where live."
          >
            <div className={styles.strip} role="list" aria-label="Proof metrics">
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
            lead="Midgard should be read as an optimistic rollup: responsive execution up front, public checks before final Cardano settlement."
            cols
            aside={
              <Statement
                align="left"
                kicker="Trust path"
                line="Speed comes first, but correctness still has to pass through verification."
                sub="Operators can make the app feel fast. They do not get the final word on valid state."
              />
            }
          >
            <DataRows rows={securityRows} ariaLabel="Security assumptions" />
          </Section>
        </>
      }
    >

      <Section
        id="paths"
        title="Start with the path that matches you."
        lead="The transaction path is one protocol. The entry point depends on what you came here to do."
        cols
        aside={
          <Statement
            align="left"
            kicker="Same protocol, different jobs"
            line="Users move value, builders integrate apps, Protocol Roles keep the path checkable."
          />
        }
      >
        <DataRows rows={audienceRows} ariaLabel="Midgard reader paths" />
      </Section>

      {/* The cross-entity economics view — the /economics page folded into
          this table on 2026-07-11; each audience page tells its own side. */}
      <Section
        id="economics"
        title={ECONOMICS_MATRIX.title}
        lead={ECONOMICS_MATRIX.lead}
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

      <Section id="reference" title="Reference pages." tight cols>
        <DataRows
          ariaLabel="Learn reference pages"
          rows={[
            {
              label: "Users",
              body: "A simpler page about what normal users get from Midgard.",
              href: "/users",
            },
            {
              label: "FAQ",
              body: "Short answers about product status, security, roles, and what to check.",
              href: "/faq",
            },
            {
              label: "Glossary",
              body: "Definitions for the protocol terms used across the site.",
              href: "/glossary",
            },
            {
              label: "GitHub",
              body: "The protocol is open — inspect source, contracts, and implementation history.",
              href: OFFICIAL_LINKS.github,
              external: true,
            },
          ]}
        />
      </Section>
    </HowItWorksExperience>
  );
}
