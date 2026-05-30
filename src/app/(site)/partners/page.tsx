import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CardGrid,
  Card,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Partner With Midgard",
  description:
    "Wallets, dApps, infrastructure providers, analytics teams, security contributors, and ecosystem operators can help make Midgard usable, inspectable, and trusted.",
};

export default function PartnersPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Partner path"
        title="Do not bring logos. Bring a launch job."
        sub="Midgard partner work starts with function: what role you play, what flow you support, and what the system becomes better at because you are there."
        actions={[
          { label: "Explore readiness tracks", href: "#readiness", variant: "primary" },
          { label: "Request partner intake", href: OFFICIAL_LINKS.intakeForm, variant: "ghost" },
        ]}
      />

      <Section
        eyebrow="Partner philosophy"
        title="Partners should make the system more usable, inspectable, or safe."
      >
        <Prose
          items={[
            {
              text: "Midgard does not need decorative ecosystem noise. It needs wallets that make the path usable, dApps that prove real flows, infrastructure that keeps builders moving, analytics that make activity legible, and security contributors who improve trust before scale arrives.",
            },
            { text: "The strongest partner story is not a logo cloud.", variant: "dim" },
            { text: "It is a working path.", variant: "emph" },
          ]}
        />
      </Section>

      <Section
        id="readiness"
        eyebrow="Readiness tracks"
        title="Where partners plug in"
        lead="Start from the job, not the logo. Each track is a concrete way to make Midgard more usable, inspectable, or safe."
      >
        <CardGrid>
          <Card
            num="01"
            title="Wallets"
            body="Make Midgard feel normal to Cardano users: clear signing, clear routing, clear support, clear status."
            delay={0}
          />
          <Card
            num="02"
            title="dApps"
            body="Show what Cardano-native applications can do when throughput stops being the ceiling."
            delay={60}
          />
          <Card
            num="03"
            title="Infrastructure"
            body="Support RPC, API, indexing, monitoring, dashboards, and reliability surfaces that help builders operate with confidence."
            delay={120}
          />
          <Card
            num="04"
            title="Analytics"
            body="Make L2 activity, settlement, testing, and post-launch proof easy to inspect."
            delay={180}
          />
          <Card
            num="05"
            title="Security"
            body="Support review, disclosure, monitoring, incident pathways, and adversarial thinking before broad traffic arrives."
            delay={240}
          />
          <Card
            num="06"
            title="Community and media"
            body={'Explain the category clearly. Make Midgard understandable without reducing it to "faster and cheaper."'}
            delay={300}
          />
        </CardGrid>
      </Section>

      <CtaBand
        eyebrow="Start with the job"
        title="Start with the job."
        lead="Tell us what you want to make easier, safer, faster, or more inspectable. Midgard partnerships should start with utility and become public only when the work is real."
        actions={[
          { label: "Request partner intake", href: OFFICIAL_LINKS.intakeForm, variant: "primary" },
          { label: "Join Discord", href: OFFICIAL_LINKS.discord, variant: "ghost" },
        ]}
      />
    </main>
  );
}
