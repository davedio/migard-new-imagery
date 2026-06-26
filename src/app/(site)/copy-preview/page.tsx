import type { Metadata } from "next";
import Link from "next/link";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import styles from "./copy-preview.module.css";

export const metadata: Metadata = {
  title: "Copy Preview | Midgard",
  description:
    "Preview-only Midgard copy direction from the Dave and Harun June 26 website review.",
  robots: {
    index: false,
    follow: false,
  },
};

const previewNav = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Developers", href: "/developers" },
  { label: "Participate", href: "#participate-preview" },
] as const;

const heroRemovals = [
  "No category line under the hero.",
  "No DeFi, payments, or onchain markets paragraph on the homepage.",
  "No token-policy claim on the homepage.",
] as const;

const accuracyRules = [
  "Do not pair instant with settlement.",
  "Execution is instant. Settlement is verified.",
  "Use optimistic rollup once at the hero altitude.",
  "Keep Cardano settlement as a feature, not the subject.",
] as const;

const pagePlan = [
  {
    title: "Learn",
    href: "/learn",
    body: "Learn points people to How it works. FAQ and Glossary stay separate for now. Road Map stays unlinked with a pre-alpha note.",
  },
  {
    title: "How it works",
    href: "/how-it-works",
    body: "This becomes the main post-home hub. It receives the proof metrics and links out to Security and Economics on Participate.",
  },
  {
    title: "Developers",
    href: "/developers",
    body: "Developers is the hub for source, contracts, docs, and GitHub. Contracts stay under Developers, not top nav.",
  },
  {
    title: "Participate",
    href: "#participate-preview",
    body: "Operators, Watchers, security depth, and economics live together here. Fees in ADA can appear in this context.",
  },
] as const;

const developerButtons = [
  { label: "Contracts", href: "/developers#contracts" },
  { label: "Docs", href: OFFICIAL_LINKS.docs },
  { label: "GitHub", href: OFFICIAL_LINKS.github },
] as const;

const howItWorksMoves = [
  "Soft confirmations",
  "Settlement security",
  "Execution model",
  "Verified smart contracts",
  "Independent verification",
  "Pre-alpha status",
] as const;

const footerMoves = [
  "Trust / Trust in Utility",
  "Contracts",
  "Docs",
  "Privacy",
  "Security policy",
  "GitHub",
  "X",
] as const;

export default function CopyPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="copy-preview-title">
        <div className={styles.previewChrome}>
          <div className={styles.previewWordmark}>Midgard</div>
          <nav className={styles.previewNav} aria-label="Preview navigation model">
            {previewNav.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
          <span className={styles.statusPill}>Pre-Alpha Testnet</span>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <p className={styles.kicker}>Preview copy direction</p>
            <h1 id="copy-preview-title">The execution layer for UTXO finance</h1>
            <p className={styles.heroLead}>
              Midgard is an optimistic rollup that makes applications faster with verified smart contracts
              and Cardano settlement.
            </p>
            <div className={styles.heroActions}>
              <Link href="/how-it-works">Learn more</Link>
              <Link href="/developers">Start building</Link>
            </div>
          </div>
          <div className={styles.sourceCard} aria-label="Preview sources">
            <span>Sources used</span>
            <p>Google change spec, Dave and Harun transcript, and Harun&apos;s Midgard website repo.</p>
            <strong>Preview only. Not wired into production copy.</strong>
          </div>
        </div>
      </section>

      <section className={styles.band} aria-labelledby="homepage-shape-title">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Homepage shape</p>
          <h2 id="homepage-shape-title">Brief intro, problem, solution, vision, stop.</h2>
        </div>
        <div className={styles.cards3}>
          <article>
            <span>Problem</span>
            <h3>Fast apps should not hide the trust path.</h3>
            <p>Users need a faster usable signal without pretending soft confirmation is final settlement.</p>
          </article>
          <article>
            <span>Solution</span>
            <h3>Execution first. Verification before settlement.</h3>
            <p>Midgard keeps application flow fast while committed state remains replayable and challengeable.</p>
          </article>
          <article>
            <span>Vision</span>
            <h3>Point people to the right depth.</h3>
            <p>Home stays thin. Learn, Developers, and Participate carry the detailed material.</p>
          </article>
        </div>
      </section>

      <section className={styles.split} aria-labelledby="copy-rules-title">
        <div>
          <p className={styles.kicker}>Copy removals</p>
          <h2 id="copy-rules-title">Pull the excess out of the hero.</h2>
          <ul className={styles.list}>
            {heroRemovals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.kicker}>Accuracy rules</p>
          <h2>Keep the claims tight.</h2>
          <ul className={styles.list}>
            {accuracyRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.band} aria-labelledby="page-plan-title">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Route model</p>
          <h2 id="page-plan-title">Four top-level paths, then deeper links.</h2>
        </div>
        <div className={styles.routeGrid}>
          {pagePlan.map((page) => (
            <a href={page.href} className={styles.routeCard} key={page.title}>
              <span>{page.title}</span>
              <p>{page.body}</p>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.split} aria-labelledby="how-it-works-preview">
        <div>
          <p className={styles.kicker}>How it works</p>
          <h2 id="how-it-works-preview">Receive the proof metrics.</h2>
          <p className={styles.copyBlock}>
            Security and Economics become buttons that route to Participate. Fees in ADA can live here,
            but not in the homepage hero.
          </p>
          <div className={styles.metricList}>
            {howItWorksMoves.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div>
          <p className={styles.kicker}>Developers</p>
          <h2>Make the hub obvious.</h2>
          <p className={styles.copyBlock}>
            The top of Developers should give a technical reader three clean actions before the long detail.
          </p>
          <div className={styles.buttonRow}>
            {developerButtons.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="participate-preview" className={styles.band} aria-labelledby="participate-title">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Participate</p>
          <h2 id="participate-title">Security and economics belong with Protocol Roles.</h2>
        </div>
        <div className={styles.cards3}>
          <article>
            <span>Operators</span>
            <h3>Run the active path.</h3>
            <p>Operators order activity and post commitments that other parties can check.</p>
          </article>
          <article>
            <span>Watchers</span>
            <h3>Keep state contestable.</h3>
            <p>Watchers replay commitments and challenge invalid state before it can settle.</p>
          </article>
          <article>
            <span>Economics</span>
            <h3>Explain incentives in context.</h3>
            <p>Fees, rewards, bonds, and participation rules belong beside the roles they affect.</p>
          </article>
        </div>
      </section>

      <section className={styles.footerPreview} aria-labelledby="footer-preview-title">
        <div>
          <p className={styles.kicker}>Footer home</p>
          <h2 id="footer-preview-title">Move secondary trust links out of the top bar.</h2>
        </div>
        <div className={styles.footerPills}>
          {footerMoves.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
