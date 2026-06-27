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
  { label: "Participate", href: "/participate" },
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

const statusMetrics = [
  { label: "Soft confirmation", value: "Seconds", live: false },
  { label: "Settlement", value: "After verification", live: false },
  { label: "Fraud proofs", value: "eUTXO-targeted", live: false },
  { label: "Protocol fees", value: "ADA", live: false },
  { label: "Status", value: "Pre-Alpha Testnet", live: true },
] as const;

const activityRows = [
  { type: "TX", id: "8f3a...c291", status: "Soft confirmed", time: "11ms", symbol: "T" },
  { type: "TX", id: "2e91...7fa4", status: "Soft confirmed", time: "8ms", symbol: "T" },
  { type: "BLOCK", id: "Block #4 291", status: "Sealed", time: "1.2s", symbol: "B" },
  { type: "COMMIT", id: "Commit #4 289", status: "Queued to L1", time: "open", symbol: "C" },
  { type: "VERIFY", id: "Watcher replay", status: "Available", time: "live", symbol: "V" },
] as const;

const flowSteps = [
  { label: "Submit", detail: "App sends a UTXO transaction." },
  { label: "Execute", detail: "Midgard gives a fast usable signal." },
  { label: "Commit", detail: "Ordered state is posted for review." },
  { label: "Verify", detail: "Watchers can replay and challenge." },
  { label: "Settle", detail: "Valid state reaches Cardano settlement." },
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

const codePanels = [
  {
    label: "Cardano L1",
    endpoint: "cardano-node",
    endpointLine: "const endpoint = \"cardano-node\";",
    sharedLines: ["const tx = await lucid.newTx()", ".payToAddress(\"addr1...\", value)", ".complete();"],
  },
  {
    label: "Midgard",
    endpoint: "midgard-rpc",
    endpointLine: "const endpoint = \"midgard-rpc\";",
    sharedLines: ["const tx = await lucid.newTx()", ".payToAddress(\"addr1...\", value)", ".complete();"],
  },
] as const;

const verificationPath = [
  { label: "Operator", detail: "Posts ordered commitments." },
  { label: "Watcher", detail: "Replays state independently." },
  { label: "Challenge", detail: "Invalid state can be contested." },
  { label: "Settlement", detail: "Valid state settles on Cardano." },
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

      <section className={styles.widgetBand} aria-labelledby="reference-widgets-title">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Network widgets</p>
          <h2 id="reference-widgets-title">Execution, verification, and settlement in motion.</h2>
        </div>

        <div className={styles.statusRail} aria-label="Preview status metrics">
          {statusMetrics.map((item) => (
            <div className={styles.statusMetric} data-live={item.live ? "true" : "false"} key={item.label}>
              <span>{item.label}</span>
              <strong>
                {item.live ? <i className={styles.signalDot} aria-hidden="true" /> : null}
                {item.value}
              </strong>
            </div>
          ))}
        </div>

        <div className={styles.widgetGrid}>
          <article className={styles.liveWidget} aria-labelledby="live-widget-title">
            <div className={styles.widgetTopline}>
              <div>
                <span className={styles.signalDot} aria-hidden="true" />
                <p id="live-widget-title">Midgard Node / Testnet</p>
              </div>
              <strong>eUTXO rules</strong>
            </div>
            <div className={styles.feedHeader}>
              <span>Type</span>
              <span>ID</span>
              <span>Status</span>
              <span>Time</span>
            </div>
            <ul className={styles.activityRows} aria-label="Simulated node activity">
              {activityRows.map((row) => (
                <li key={`${row.type}-${row.id}`} data-type={row.type}>
                  <span>
                    <i aria-hidden="true">{row.symbol}</i>
                    {row.type}
                  </span>
                  <span>{row.id}</span>
                  <span>{row.status}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
            <div className={styles.widgetFooter}>
              <span>Simulated preview widget</span>
              <span>Ready for live data later</span>
            </div>
          </article>

          <article className={styles.flowWidget} aria-labelledby="flow-widget-title">
            <p className={styles.kicker}>Transaction path</p>
            <h3 id="flow-widget-title">Execution first. Verification before settlement.</h3>
            <div className={styles.flowDiagram} aria-hidden="true">
              <div className={styles.flowRail}>
                <span />
              </div>
              <div className={styles.flowNodes}>
                {flowSteps.map((step) => (
                  <span key={step.label}>{step.label}</span>
                ))}
              </div>
            </div>
            <ol className={styles.flowSteps}>
              {flowSteps.map((step) => (
                <li key={step.label}>
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                </li>
              ))}
            </ol>
          </article>
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
        <div className={styles.developerPanel}>
          <p className={styles.kicker}>Developers</p>
          <h2>Make the hub obvious.</h2>
          <p className={styles.copyBlock}>
            The top of Developers should give a technical reader three clean actions before the long detail.
          </p>
          <div className={styles.codeSwitch} aria-label="Developer endpoint preview">
            <div className={styles.switchHeader}>
              <span>Developer sandbox</span>
              <strong>One endpoint change</strong>
            </div>
            <div className={styles.endpointRail} aria-hidden="true">
              <span>same transaction body</span>
              <i />
              <span>different endpoint</span>
            </div>
            <div className={styles.codeGrid}>
              {codePanels.map((panel) => (
                <div className={styles.codePanel} key={panel.label}>
                  <div>
                    <span>{panel.label}</span>
                    <strong>{panel.endpoint}</strong>
                  </div>
                  <pre>
                    <code>
                      <span className={styles.changedLine}>{panel.endpointLine}</span>
                      {"\n"}
                      {panel.sharedLines.join("\n")}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
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
        <div className={styles.roleSecurity} aria-labelledby="role-security-title">
          <div>
            <p className={styles.kicker}>Role security graphic</p>
            <h3 id="role-security-title">Operator work stays independently checkable.</h3>
          </div>
          <ol className={styles.securityPath}>
            {verificationPath.map((step) => (
              <li key={step.label}>
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
              </li>
            ))}
          </ol>
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
