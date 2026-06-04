import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Layers,
  Callout,
  Actions,
} from "@/components/site/ui";
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
        title="Secured by Cardano. Provable by anyone."
        sub="Midgard's security rests on Cardano Layer 1. Anyone can inspect the commitments, challenge invalid blocks, and verify how settlement works."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "Read docs", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section title="Anchored to Cardano.">
        <Prose
          items={[
            {
              text: "Midgard is designed to anchor L2 state transitions to Cardano L1 and use Cardano smart contracts for verification.",
            },
            {
              text: "Here's the mechanism: operators commit blocks to Cardano, anyone can challenge an invalid block during the challenge window, and Cardano contracts settle the result.",
              variant: "dim",
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

      <Section id="security-contact" eyebrow="Security reporting" title="Responsible disclosure" tight>
        <Callout
          body="As Midgard matures, security review, monitoring, and a responsible-disclosure route should become part of the public trust surface."
        />
        <Actions
          items={[
            { label: "Open official links", href: "/official-links#security-contact", variant: "ghost" },
          ]}
        />
      </Section>

    </main>
  );
}
