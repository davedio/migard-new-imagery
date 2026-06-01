import type { Metadata } from "next";
import { PageHero, Section, Faq, CtaBand } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Midgard FAQ",
  description:
    "Answers to common Midgard questions about what it is, how it works, ADA fees, users, builders, wallets, partners, security, and testnet.",
};

export default function FaqPage() {
  return (
    <main className="page-main">
      <PageHero
        label="FAQ"
        title="Questions, answered plainly."
        sub="Common questions about what Midgard is, how it works, ADA fees, builders, participant roles, security, and testnet status."
        actions={[
          { label: "Read how it works", href: "/how-it-works", variant: "primary" },
          { label: "Open official links", href: "/official-links", variant: "ghost" },
        ]}
      />

      <Section>
        <Faq
          groups={[
            {
              title: "Product status",
              items: [
                {
                  q: "What is Midgard?",
                  a: "Midgard is a Cardano-native optimistic rollup. It gives Cardano applications a higher-throughput L2 path while keeping Cardano L1 in the trust and settlement story.",
                },
                {
                  q: "Why does Midgard matter?",
                  a: "Because promising Cardano applications should not have to leave Cardano when they need more capacity. Midgard gives builders a path to scale while staying aligned with Cardano's architecture, tooling, and ADA-based economics.",
                },
                {
                  q: "How are fees paid?",
                  a: "Fees are paid in ADA.",
                },
                {
                  q: "Is Midgard a sidechain?",
                  a: "No. Midgard is positioned as a rollup path: L2 execution with commitments, challenge mechanics, and settlement tied back to Cardano L1.",
                },
                {
                  q: "What does optimistic rollup mean?",
                  a: "It means activity can move quickly on L2, while disputed activity can be challenged through the protocol and settlement returns to Cardano L1.",
                },
              ],
            },
            {
              title: "Builders",
              items: [
                {
                  q: "Can existing Cardano apps use Midgard?",
                  a: "Midgard is designed to preserve Cardano-native development patterns where possible. The goal is to reduce migration burden and keep builders in the Cardano mental model.",
                },
                {
                  q: "Where should builders start?",
                  a: "Start with the Get Started page, source repository, docs, testnet status, and builder readiness path.",
                },
                {
                  q: "What should builders inspect first?",
                  a: "Inspect the architecture, supported flows, wallet assumptions, state movement, settlement path, and user experience before building public flows.",
                },
              ],
            },
            {
              title: "Wallets and partners",
              items: [
                {
                  q: "Why do wallets matter?",
                  a: "Wallets can make Midgard feel natural. The strongest user experience is one where Midgard feels like a Cardano path, not a foreign network.",
                },
                {
                  q: "Can my wallet, dApp, or infrastructure project integrate?",
                  a: "Yes. Midgard needs serious wallets, dApps, infrastructure providers, analytics teams, security contributors, operators, and Watchers.",
                },
                {
                  q: "What makes a good partner?",
                  a: "A good partner makes Midgard easier to use, easier to inspect, safer to operate, or more useful for real applications.",
                },
              ],
            },
            {
              title: "Security and support",
              items: [
                {
                  q: "What is the security story?",
                  a: "Midgard's trust story is built around Cardano L1 anchoring, eUTXO-aware design, commitments, challenge mechanics, watchers, and settlement.",
                },
                {
                  q: "Where do I report a security issue?",
                  a: "Use the official security contact route once published. Until then, start from Official Links and preserve evidence.",
                },
                {
                  q: "Where do I get support?",
                  a: "Use the official support route once published. Midgard will never ask for your seed phrase, private key, recovery phrase, password, or wallet-draining approval.",
                },
              ],
            },
            {
              title: "Testnet",
              items: [
                {
                  q: "What is testnet for?",
                  a: "Testnet is where builders, users, and partners inspect the path before production weight is placed on it.",
                },
                {
                  q: "What should I do first?",
                  a: "Start from the official Midgard site, read the status label, inspect the docs/source, and use official links.",
                },
              ],
            },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Still curious"
        title="Start from the official path."
        lead="Use official links, read the docs, and explore the testnet path."
        actions={[
          { label: "Open official links", href: "/official-links", variant: "primary" },
          { label: "Read docs ↗", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />
    </main>
  );
}
