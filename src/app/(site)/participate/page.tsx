import type { Metadata } from "next";
import { GitHubIcon } from "@/components/site/BrandIcons";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { Card, CardGrid, CtaBand, Layers, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

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

const roleSteps = [
  {
    n: "01",
    name: "Operator",
    desc: "Orders activity and posts commitments that other parties can check.",
  },
  {
    n: "02",
    name: "Watcher",
    desc: "Replays committed state and challenges invalid commitments before settlement.",
  },
  {
    n: "03",
    name: "Security",
    desc: "Keeps the trust path inspectable before production value depends on it.",
  },
  {
    n: "04",
    name: "Economics",
    desc: "Connects fees, rewards, bonds, and participation rules to the roles they affect.",
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

      <Section title="Protocol Roles.">
        <Layers items={roleSteps} />
      </Section>

      <Section id="roles" title="Operators and Watchers.">
        <CardGrid cols={2}>
          <Card
            title="Operators"
            body="Operators run the active path: order activity, post commitments, and keep state moving through the verification path."
            cta="Register interest"
            href={OFFICIAL_LINKS.intakeForm}
          />
          <Card
            title="Watchers"
            body="Watchers keep state contestable by replaying commitments and challenging invalid state before it can settle."
            cta="Register interest"
            href={OFFICIAL_LINKS.intakeForm}
          />
        </CardGrid>
      </Section>

      {/* The full security model moved to /developers#security — this section
          stays as a pointer (and a landing pad for older #security links). */}
      <Section
        id="security"
        title="Security."
        lead="The trust path, fault proofs, audit status, and disclosure route live with the developer documentation."
        tight
      >
        <CardGrid cols={2}>
          <Card
            title="Read the security model"
            body="One honest Watcher is enough to stop a bad block. Inspect the full trust path — commitments, challenges, and Cardano L1 settlement — on the Developers page."
            cta="Open security"
            href="/developers#security"
            ctaGlow
          />
        </CardGrid>
      </Section>

      <Section id="economics" title="Economics.">
        <CardGrid cols={3}>
          <Card
            title="Fees"
            body="Users pay fees in plain ADA — estimated at a fraction of L1 cost. Fees fund the Operators and Watchers who run the network."
          />
          <Card
            title="Rewards"
            body="Operators earn for sequencing and committing blocks; Watchers earn for verifying them. Reward parameters are finalized during testnet."
          />
          <Card
            title="Bonds"
            body="Operators post bonds that are forfeited if a fault proof succeeds against their block — misbehavior costs more than honesty pays."
          />
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
