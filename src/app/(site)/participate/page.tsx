import type { Metadata } from "next";
import Link from "next/link";
import { GitHubIcon } from "@/components/site/BrandIcons";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import EconomicsFlow from "@/components/site/EconomicsFlow";
import { Statement } from "@/components/site/rhythm";
import { Actions, Card, CardGrid, CtaBand, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import styles from "./participate.module.css";

export const metadata: Metadata = {
  title: "Participate | Midgard",
  description:
    "Operator and Watcher roles, network economics, and how to register interest.",
  openGraph: {
    title: "Participate | Midgard",
    images: [{ url: "/og/security.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/security.jpg"] },
};

/* Reading rhythm (see .review/card-rhythm-redesign-2026-07-02.md):
   hero → chips → Statement + the page's ONE Grid (roles) → the economics
   flow (three cards joined by direct arrows) → CtaBand.
   The register band is the page's only glowing ask. */

const economicsSteps = [
  {
    title: "Fees fund the network",
    body: "Users pay fees in ADA, estimated 10 to 30x cheaper than L1. Those fees fund the Operators and Watchers who keep the network running and checkable.",
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
    body: "Committed transactions can be replayed against their inputs and scripts. A valid fault proof stops bad state before settlement.",
  },
  {
    title: "Non-custodial",
    body: "Funds stay in Cardano smart contracts, not with a company, Operator, or multisig bridge.",
  },
  {
    title: "Never stranded",
    body: "If Operators stop, you can still submit directly to the L1 state queue. The protocol preserves the exit path.",
  },
] as const;

export default function ParticipatePage() {
  return (
    <main className="page-main">
      <PageBackdrop name="sentinel-watch" focus="66% 52%" mobileFocus="73% 56%" />
      <PageHero
        compact
        tone="tree"
        title="Run the protocol."
        sub="Operators earn fees for sequencing transactions. Watchers verify commitments and can earn from a valid fault proof. Both help secure Midgard."
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
            body="Operators sequence and commit blocks to Cardano, earning fees from the activity they commit. They post a bond that is slashed for a valid fault proof."
          />
          <Card
            title="Watcher"
            delay={60}
            body="Anyone can run a Watcher, with no bond or selection required. Watchers replay committed blocks and earn an estimated 30–50% of a slashed bond for a valid fault proof."
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
      </Section>

      <Section
        id="economics"
        title="Economics."
        lead="Get paid to operate and protect the network. A slashed bond costs more than honest sequencing ever earns."
      >
        <EconomicsFlow steps={economicsSteps} ariaLabel="How network economics fit together" />
      </Section>

      <Section
        id="different"
        title="Security you can verify."
        lead="Cardano settles the state. Operators post bonds, and Watchers can prove a fault. Attacking the network costs more than playing fair."
        cols
      >
        <CardGrid cols={3}>
          {differentCards.map((card, i) => (
            <Card key={card.title} title={card.title} body={card.body} delay={i * 50} />
          ))}
        </CardGrid>
        {/* Keeps stale #security links useful while the full security model lives on Learn. */}
        <p id="security" className={styles.securityPointer}>
          The full security model, trust path, fault proofs, audit status, and the
          disclosure route live with Learn.{" "}
          <Link href="/learn#security">Read the security model →</Link>
        </p>
      </Section>

      <div id="register">
        <CtaBand
          title="Get in touch."
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
