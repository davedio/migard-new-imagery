import type { Metadata } from "next";
import {
  Actions,
  Callout,
  Card,
  CardGrid,
  CtaBand,
  Layers,
  PageHero,
  Prose,
  Section,
} from "@/components/site/ui";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Security | Midgard",
  description:
    "How Midgard approaches L1-rooted settlement, mathematically verified smart contracts, fault-proof verification, and eUTXO-local security.",
  openGraph: {
    title: "Security | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

export default function SecurityPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="ink"
        label="Security"
        title="Security you can inspect."
        sub="Midgard combines mathematically verified smart contracts, fault-proof verification, and eUTXO-local state so faster execution does not require a softer trust model."
        actions={[
          { label: "Read the mechanism", href: "#mechanism", variant: "primary" },
          {
            label: "View GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />

      <Section
        id="mechanism"
        eyebrow="Trust path"
        title="Fast confirmations first. L1-rooted settlement after verification."
        lead="Operators can give users fast soft confirmations, but finality depends on the base-layer settlement path and the challenge rules around committed state."
      >
        <Prose
          items={[
            {
              text: "Midgard is designed so invalid state is contestable. Watchers can inspect commitments, replay the relevant state transition, and use the fault-proof path when an operator submits something wrong.",
            },
            {
              text: "The security claim is not that nothing can ever fail. The claim is that finalized state inherits the full security of the L1 settlement layer, with a smaller and more inspectable attack surface than many DeFi systems.",
              variant: "emph",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Why it matters" title="The attack surface is narrower by design.">
        <CardGrid>
          <Card
            num="01"
            title="Mathematically verified contracts"
            body="Core settlement logic is built around formal methods so the most important contracts can be checked with more than conventional testing."
          />
          <Card
            num="02"
            title="Fault-proof verification"
            body="Operators do not get the final word. Committed state can be challenged before it becomes settled state."
          />
          <Card
            num="03"
            title="eUTXO-local state"
            body="UTXO structure helps localize what must be inspected, reducing the broad shared-state surface that attackers often exploit."
          />
          <Card
            num="04"
            title="Watcher visibility"
            body="Every committed block should be replayable and inspectable by independent Watchers, not only by the operator that produced it."
          />
          <Card
            num="05"
            title="Open-source review"
            body="Security improves when builders, operators, Watchers, and auditors can inspect the implementation directly."
            cta="View GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
          <Card
            num="06"
            title="Honest status labels"
            body="Public claims should stay tied to live status, measured benchmarks, approved parameters, and the current pre-alpha testnet boundary."
          />
        </CardGrid>
      </Section>

      <Section
        id="guarantees"
        eyebrow="Guarantees"
        title="What serious users should inspect."
        tight
      >
        <Layers
          items={[
            {
              n: "01",
              name: "Finality",
              desc: "Fast soft confirmation is separate from later settlement after the fault-proof window.",
            },
            {
              n: "02",
              name: "Validity",
              desc: "Committed state must be verifiable against the protocol rules, not accepted on operator reputation alone.",
            },
            {
              n: "03",
              name: "Availability",
              desc: "Data availability and attestation details belong in the deeper mechanism, where builders can inspect the assumptions.",
            },
            {
              n: "04",
              name: "Recovery",
              desc: "The escape and challenge surfaces should be clear before production value depends on them.",
            },
          ]}
        />
      </Section>

      <Section id="disclosure" eyebrow="Disclosure" title="Security reporting should be boring and official.">
        <Callout
          title="Use official routes and preserve evidence."
          body="Do not rely on unsolicited support messages. If you see a suspicious link, account, or security issue, preserve the URL, account name, screenshot, timestamp, and where you saw it."
          items={[
            "Never share a seed phrase, private key, recovery phrase, or password.",
            "Do not sign wallet approvals you do not understand.",
            "Start from the official website, GitHub, Discord, and security-policy links.",
          ]}
        />
        <Actions
          items={[
            {
              label: "Security policy",
              href: OFFICIAL_LINKS.securityPolicy,
              variant: "ghost",
            },
            { label: "Read the FAQ", href: "/faq", variant: "ghost" },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Next"
        title="Trust should be checkable."
        lead="Read the mechanism, inspect the source, and compare the security model before treating any performance claim as meaningful."
        actions={[
          { label: "Open FAQ", href: "/faq", variant: "primary" },
          {
            label: "View GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />
    </main>
  );
}
