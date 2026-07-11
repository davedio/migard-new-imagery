import type { Metadata } from "next";
import Link from "next/link";
import { GitHubIcon } from "@/components/site/BrandIcons";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import EconomicsCycle from "@/components/site/EconomicsCycle";
import { Statement } from "@/components/site/rhythm";
import { Actions, Card, CardGrid, CtaBand, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import styles from "./participate.module.css";

export const metadata: Metadata = {
  title: "Participate | Midgard",
  description:
    "Operator and Watcher roles, network economics, and how to register interest in participating in Midgard.",
  openGraph: {
    title: "Participate | Midgard",
    images: [{ url: "/og/security.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/security.jpg"] },
};

/* Reading rhythm (see .review/card-rhythm-redesign-2026-07-02.md):
   hero → chips → Statement + the page's ONE Grid (roles) → the economics
   loop (three cards circulating value, closed by the Statement) → CtaBand.
   The register band is the page's only glowing ask. */

const economicsSteps = [
  {
    title: "Fees fund the network",
    body: "Users pay fees in ADA — estimated at a fraction of L1 cost. Those fees fund the Operators and Watchers who keep the network running and checkable.",
    tone: "green",
  },
  {
    title: "Roles earn for the work",
    body: "Operators earn fees from every L2 transaction, deposit, and withdrawal they commit; Watchers earn a share of a slashed bond for a valid fault proof. Full parameters are finalized during testnet.",
    tone: "gold",
  },
  {
    title: "Bonds punish faults",
    body: "Operators post bonds that are forfeited if a fault proof succeeds against a block they committed.",
    tone: "cobalt",
  },
] as const;

/* Why-different trio — the trust-model contrast, adopted from the aligned
   copy doc with the 2026-07-08 claims rulings applied: no "break Ouroboros"
   absolute, and the liveness guarantee kept ("funds can never be permanently
   stranded" — explicitly approved). */
const differentCards = [
  {
    title: "Verifiable security",
    body: "A bad state transition can be checked precisely — against the exact inputs and scripts it touched — instead of relying on broad trust. UTXO execution is deterministic and local, so validity can be checked on Cardano itself.",
  },
  {
    title: "Non-custodial",
    body: "Your funds are held by Cardano smart contracts, not a company or a multisig bridge. There is no operator key that can move your money — deposits, withdrawals, commitments, challenges, and settlement are all enforced by scripts.",
  },
  {
    title: "Never stranded",
    body: "If every operator stops, you can submit transactions straight to the L1 state queue without any operator's permission. Funds can never be permanently stranded — the escape path is enforced by the protocol, not by trust.",
  },
] as const;

export default function ParticipatePage() {
  return (
    <main className="page-main">
      <PageBackdrop name="sentinel-watch" focus="62% 48%" />
      <PageHero
        compact
        tone="tree"
        title="Run the protocol."
        sub="Watchers and Operators keep Midgard honest, and the protocol rewards them for it. Learn the roles, review the economics, and choose yours."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Open GitHub", href: OFFICIAL_LINKS.github, variant: "ghost", icon: <GitHubIcon size={15} /> },
        ]}
      />

      <JumpChips
        items={[
          { id: "roles", label: "Roles" },
          { id: "economics", label: "Economics" },
          { id: "different", label: "Why it's safe" },
          { id: "register", label: "Register" },
        ]}
      />

      <Section
        id="roles"
        title="Operators and Watchers."
        cols
        aside={
          <Statement
            align="left"
            kicker="Why one honest node is enough"
            line={
              <>
                <em>One honest Watcher</em> is enough to stop a bad block.
              </>
            }
          />
        }
      >
        <CardGrid cols={2}>
          <Card
            title="Operator"
            body="The bonded role. Operators sequence transactions and commit blocks to Cardano in rotating shifts — and they stake a bond to do it. If a fault proof succeeds against a block they committed, that bond is slashed. In exchange, Operators earn fees from every L2 transaction, deposit, and withdrawal they commit (parameters estimated during testnet)."
          />
          <Card
            title="Watcher"
            delay={60}
            body="The permissionless role. No bond, no selection — anyone can run a Watcher. Watchers replay committed blocks against the posted data and submit a fault proof when a commitment doesn't hold; one honest Watcher is enough. A valid fault proof earns the Watcher an estimated 30–50% of the slashed bond."
          />
        </CardGrid>
        <div className={styles.rolesCta}>
          <Actions
            center
            items={[
              { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
            ]}
          />
        </div>
        {/* Keeps stale #security links useful while the full security model lives on Learn. */}
        <p id="security" className={styles.securityPointer}>
          The full security model — trust path, fault proofs, audit status, and the
          disclosure route — lives with Learn.{" "}
          <Link href="/learn#security">Read the security model →</Link>
        </p>
      </Section>

      <Section id="economics" title="Economics.">
        <div className="motion-band">
          <EconomicsCycle steps={economicsSteps} ariaLabel="How network economics fit together" />
        </div>
        <Statement line="A slashed bond costs more than honest sequencing ever earns." />
      </Section>

      <Section
        id="different"
        title="Security you can verify."
        lead="Most Layer 2s force a new trust model onto you: an operator set or a multisig bridge. Midgard asks you to trust Cardano and verifiable computation. Here is the difference."
        cols
        aside={
          <Statement
            align="left"
            kicker="Security as an incentive"
            line="Attacking the network costs more than playing fair."
            sub="Operators are bonded, Watchers are rewarded for catching them, and no block settles before its challenge window closes."
          />
        }
      >
        <CardGrid cols={3}>
          {differentCards.map((card, i) => (
            <Card key={card.title} title={card.title} body={card.body} delay={i * 50} />
          ))}
        </CardGrid>
      </Section>

      <div id="register">
        <CtaBand
          title="Use the official path."
          lead="Register interest for Operator, Watcher, infrastructure, or deeper testnet participation."
          actions={[
            { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
            { label: "Open GitHub", href: OFFICIAL_LINKS.github, variant: "ghost", icon: <GitHubIcon size={15} /> },
          ]}
        />
      </div>
    </main>
  );
}
