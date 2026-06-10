import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Layers,
  Callout,
  Actions,
} from "@/components/site/ui";
import { NextSteps } from "@/components/site/NextSteps";
import { PartOf } from "@/components/site/PartOf";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Midgard Security",
  description:
    "Midgard's trust posture is built around Cardano L1 anchoring, eUTXO-aware fraud proofs, watchers, challenge paths, and public status surfaces.",
};

export default function SecurityPage() {
  return (
    <main className="page-main">
      <PageHero
        top={<PartOf parentHref="/how-it-works" parentLabel="How it works" />}
        title="Secured by Cardano. Provable by anyone"
        sub="Midgard's security rests on Cardano Layer 1. Anyone can inspect the commitments, challenge invalid blocks, and verify how settlement works."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "Read docs", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section title="Anchored to Cardano">
        <Prose
          items={[
            {
              text: "Midgard is designed to anchor Layer 2 state transitions to Cardano and use Cardano smart contracts for verification.",
            },
            {
              text: "Here's the mechanism: operators commit blocks to Cardano, anyone can challenge an invalid block during the challenge window, and Cardano contracts settle the result. You can watch the full journey on the How It Works page.",
              variant: "dim",
            },
          ]}
        />
        <Actions
          items={[
            {
              label: "Watch the challenge window in motion",
              href: "/how-it-works#step-watch",
              variant: "ghost",
            },
          ]}
        />
      </Section>

      <Section id="guarantees" title="Guarantees">
        <Layers
          items={[
            {
              n: "01",
              name: "Finality",
              desc: "Midgard separates fast soft confirmation from later L1-anchored settlement after the challenge or maturity period.",
            },
            {
              n: "02",
              name: "Censorship resistance",
              desc: "Cardano deadlines and challenge paths enforce ordering and inclusion rules.",
            },
            {
              n: "03",
              name: "Liveness",
              desc: "If an operator stalls, Cardano-enforced escape paths let users exit and the network recover.",
            },
            {
              n: "04",
              name: "L1 anchoring",
              desc: "State transitions are designed to route through Cardano L1 verification and settlement surfaces.",
            },
          ]}
        />
      </Section>

      <Section title="Watchers">
        <Prose
          items={[
            {
              text: "Every committed block should be inspectable. Watchers replay transactions against the public state and use the fraud-proof path when an operator submits invalid state.",
            },
            {
              text: "Midgard's eUTXO-localized design is intended to make fraud proofs more targeted than global account-state replay, but public cost and operations claims should stay qualified until benchmarked.",
              variant: "dim",
            },
          ]}
        />
        <Actions
          items={[
            { label: "Become a Watcher", href: OFFICIAL_LINKS.intakeForm, variant: "ghost" },
          ]}
        />
      </Section>

      <Section id="contact" eyebrow="Security reporting" title="Responsible disclosure" tight>
        <Callout body="Found something? Report it through the security policy on GitHub or start from the official links page. As Midgard matures, security review, monitoring, and a responsible-disclosure route are part of the public trust surface." />
        <Actions
          items={[
            {
              label: "Read the security policy",
              href: OFFICIAL_LINKS.securityPolicy,
              variant: "ghost",
            },
            {
              label: "Open official links",
              href: "/official-links#security-contact",
              variant: "ghost",
            },
          ]}
        />
      </Section>

      <NextSteps
        items={[
          {
            label: "Verify the addresses yourself",
            sub: "Every validator and state anchor on Cardano preprod",
            href: "/contracts",
          },
          {
            label: "Watch the challenge window in motion",
            sub: "Ride a transaction down the world tree",
            href: "/how-it-works",
          },
          {
            label: "Choose your path",
            sub: "Start as a user, start building, or run the protocol",
            href: "/get-started",
          },
        ]}
      />
    </main>
  );
}
