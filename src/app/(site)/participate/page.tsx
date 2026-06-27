import type { Metadata } from "next";
import { GitHubIcon } from "@/components/site/BrandIcons";
import PageBackdrop from "@/components/site/PageBackdrop";
import { Card, CardGrid, CtaBand, Layers, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Participate | Midgard",
  description:
    "Operator and Watcher roles, network security, and economics for participating in Midgard.",
  openGraph: {
    title: "Participate | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
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
        sub="Operators, Watchers, security, and economics belong in one place."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Open GitHub", href: OFFICIAL_LINKS.github, variant: "ghost", icon: <GitHubIcon size={15} /> },
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

      <Section id="security" title="Security.">
        <CardGrid cols={3}>
          <Card
            title="Commitments"
            body="Operator work remains checkable because committed state can be replayed."
          />
          <Card
            title="Challenges"
            body="Invalid state can be contested before it becomes settled state."
          />
          <Card
            title="Reporting"
            body="Sensitive findings belong in the official security policy with evidence preserved."
            cta="Security policy"
            href={OFFICIAL_LINKS.securityPolicy}
          />
        </CardGrid>
      </Section>

      <Section id="economics" title="Economics.">
        <CardGrid cols={3}>
          <Card
            title="Fees"
            body="Fees in ADA belong in role and mechanism context, not in the homepage hero."
          />
          <Card
            title="Rewards"
            body="Rewards should connect to the work Operators and Watchers perform."
          />
          <Card
            title="Bonds"
            body="Bonding and challenge rules should be explained beside the roles they affect."
          />
        </CardGrid>
      </Section>

      <CtaBand
        title="Use the official path."
        lead="Register interest for operator, watcher, infrastructure, or deeper testnet participation."
        actions={[
          { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Open GitHub", href: OFFICIAL_LINKS.github, variant: "ghost", icon: <GitHubIcon size={15} /> },
        ]}
      />
    </main>
  );
}
