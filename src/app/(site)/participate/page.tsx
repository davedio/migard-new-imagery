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
    body: "Users pay fees in plain ADA — estimated at a fraction of L1 cost. Those fees fund the Operators and Watchers who keep the network running and checkable.",
    tone: "green",
  },
  {
    title: "Roles earn for the work",
    body: "Operators earn for sequencing and committing blocks; Watchers earn for verifying them. Reward parameters are finalized during testnet.",
    tone: "gold",
  },
  {
    title: "Bonds punish faults",
    body: "Operators post bonds that are forfeited if a fault proof succeeds against a block they committed.",
    tone: "cobalt",
  },
] as const;

export default function ParticipatePage() {
  return (
    <main className="page-main">
      <PageBackdrop name="roots-glow" focus="50% 50%" />
      <PageHero
        compact
        tone="tree"
        title="Participate in Midgard."
        sub="Operators, Watchers, and the economics that keep the network verifiable."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Open GitHub", href: OFFICIAL_LINKS.github, variant: "ghost", icon: <GitHubIcon size={15} /> },
        ]}
      />

      <JumpChips
        items={[
          { id: "roles", label: "Roles" },
          { id: "economics", label: "Economics" },
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
            body="The bonded role. Operators sequence transactions and commit blocks to Cardano L1 — and they stake a bond to do it. If a fault proof succeeds against a block they committed, that bond is slashed. In exchange, Operators earn sequencing rewards for the blocks they commit."
          />
          <Card
            title="Watcher"
            delay={60}
            body="The permissionless role. No bond, no selection — anyone can run a Watcher. Watchers replay committed blocks against the posted data and submit a fault proof when a commitment doesn't hold; one honest Watcher is enough. Watchers earn verification rewards for the checks they run."
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
