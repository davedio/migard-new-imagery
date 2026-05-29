import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  Bullets,
  Callout,
  Actions,
  CtaBand,
} from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Midgard For Users",
  description:
    "Learn what Midgard is, why Cardano remains in the trust path, how testnet participation works, and how to use official Midgard links.",
};

export default function UsersPage() {
  return (
    <main className="page-main">
      <PageHero
        label="User path"
        title="Trust comes before action."
        sub="Midgard is designed to make Cardano applications faster and more usable without turning the user experience into a chain-switching maze."
        actions={[
          { label: "Start with the basics", href: "#what-midgard-is", variant: "primary" },
          { label: "Open official links", href: "/official-links", variant: "ghost" },
        ]}
      />

      <Section id="what-midgard-is" eyebrow="What Midgard is" title="What Midgard is">
        <Prose
          items={[
            {
              text: "Midgard is a Cardano-native optimistic rollup. It moves application activity into a higher-throughput L2 environment while anchoring the trust path back to Cardano L1.",
            },
            {
              text: "In normal language: Midgard is built so Cardano applications can feel better without users and builders leaving Cardano behind.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Why it matters"
        title="Better application flow. Same Cardano center."
      >
        <Prose
          items={[
            {
              text: "The best L2 experience should not feel like a separate universe. Users should not need a long explanation before they understand what they are touching.",
            },
            { text: "Midgard's direction is simple:", variant: "dim" },
          ]}
        />
        <Bullets
          items={[
            "Keep Cardano in the trust path.",
            "Make application activity faster.",
            "Let wallets and dApps make the experience feel natural.",
            "Make the system easier to inspect as it matures.",
          ]}
        />
      </Section>

      <Section eyebrow="Under the surface" title="What happens under the surface">
        <Bullets
          items={[
            "Applications create activity on L2.",
            "Activity is batched.",
            "State commitments anchor back to Cardano.",
            "Disputed activity can move through challenge mechanics.",
            "Final settlement returns to Cardano L1.",
          ]}
        />
        <Prose
          items={[
            {
              text: "Users do not need to become protocol engineers, but the system should still be explainable. That is the standard.",
              variant: "emph",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Testnet"
        title="Testnet is for learning the path."
        tight
      >
        <Prose
          items={[
            {
              text: "Testnet gives users, builders, and partners a place to inspect Midgard before production assumptions are placed on top of it. It is where the experience gets sharper, the docs get clearer, and the integration path becomes real.",
            },
          ]}
        />
        <Actions items={[{ label: "Explore testnet", href: "/testnet", variant: "ghost" }]} />
      </Section>

      <Section id="safety" tight>
        <Callout
          title="Use official links."
          body="Midgard will never ask for your seed phrase, private key, recovery phrase, password, or wallet-draining approval. Start from official links and ignore unsolicited support messages."
        />
        <Actions
          items={[{ label: "Open official links", href: "/official-links", variant: "ghost" }]}
        />
      </Section>

      <CtaBand
        eyebrow="Start calm"
        title="Start calm. Stay official."
        lead="If you are new to Midgard, begin with the testnet hub, read the status label, and use the links published there."
        actions={[
          { label: "Open testnet hub", href: "/testnet", variant: "primary" },
          { label: "Read FAQ", href: "/faq", variant: "ghost" },
        ]}
      />
    </main>
  );
}
