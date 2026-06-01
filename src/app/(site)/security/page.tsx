import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Layers,
  Callout,
  Actions,
  CtaBand,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import RootworkShowcase from "@/components/site/RootworkShowcase";

export const metadata: Metadata = {
  title: "Midgard Security",
  description:
    "Midgard's trust posture is built around Cardano L1 anchoring, eUTXO-aware fraud proofs, watchers, challenge paths, and public status surfaces.",
};

export default function SecurityPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Security"
        title="Secured by Cardano. Provable by anyone."
        sub="Midgard's trust rests on Cardano Layer 1 and a set of mechanisms the public surface should make inspectable."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "Read docs", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section eyebrow="Anchored to Cardano L1" title="The trust path returns to the base layer.">
        <Prose
          items={[
            {
              text: "Midgard is designed to anchor L2 state transitions to Cardano L1 and use Cardano smart contracts for verification.",
            },
            {
              text: "That means the security story should be explained as a mechanism: commitments, challenge paths, settlement assumptions, and the base-layer contracts that make invalid state contestable.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      {/*
        "Living Roots" 3D showcase — data-driven by the simulated network snapshot.
        Sap-flow speed = snap.l2.throughput / 40; Proof ring = snap.l2.latestProofStatus.
        Placed here to bridge the "trust path" prose above with the four-guarantee
        detail below; the roots metaphor (L2 activity → proof → L1 settlement)
        makes the protocol flow legible before the written guarantees enumerate it.
      */}
      <RootworkShowcase />

      <Section id="guarantees" eyebrow="Guarantees" title="Four guarantees to inspect.">
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
              desc: "The protocol design uses L1 deadlines and challenge surfaces so ordering and inclusion rules can be enforced instead of merely promised.",
            },
            {
              n: "03",
              name: "Liveness",
              desc: "Midgard is designed with L1-enforced escape and recovery paths, with public failure modes still needing careful status copy.",
            },
            {
              n: "04",
              name: "L1 anchoring",
              desc: "State transitions are designed to route through Cardano L1 verification and settlement surfaces.",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Watchers" title="The network should pay attention to itself.">
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

      <Section id="security-contact" eyebrow="Disclosure" title="Security reporting belongs in the open path." tight>
        <Callout
          title="Responsible disclosure route pending."
          body="As Midgard matures, security review, monitoring, and a responsible-disclosure route should become part of the public trust surface. For now, start from official links and preserve evidence."
        />
        <Actions
          items={[
            { label: "Open official links", href: "/official-links#security-contact", variant: "ghost" },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Trust path"
        title="Trust is something the page should let you check."
        lead="Read the mechanism, inspect the source, and use the testnet status surface to separate live, simulated, and pending claims."
        actions={[
          { label: "Get Started", href: "/get-started", variant: "primary" },
          { label: "View status", href: "/testnet", variant: "ghost" },
        ]}
      />
    </main>
  );
}
