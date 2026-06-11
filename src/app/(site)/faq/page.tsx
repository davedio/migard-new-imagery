import type { Metadata } from "next";
import { PageHero, Section, Faq, faqGroupId } from "@/components/site/ui";
import { EutxoDuel } from "@/components/site/EutxoDuel";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Midgard FAQ",
  description:
    "Answers to common Midgard questions about what it is, how it works, ADA fees, the three roles (users, builders, operators & watchers), security, and testnet.",
  openGraph: {
    title: "Midgard FAQ",
    images: [{ url: "/og/faq.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/faq.jpg"] },
};

/* One source of truth: rendered by <Faq> AND serialized into FAQPage JSON-LD,
   so search results and the page can never drift apart. */
const FAQ_GROUPS = [
  {
    title: "Product status",
    items: [
      {
        q: "What is Midgard?",
        a: "Midgard is a Cardano-native optimistic rollup. It gives Cardano applications a higher-throughput Layer 2 path while keeping Cardano Layer 1 in the trust and settlement story.",
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
        a: "No. Midgard is positioned as a rollup path: Layer 2 execution with commitments, challenge mechanics, and settlement tied back to Cardano Layer 1.",
      },
      {
        q: "What does optimistic rollup mean?",
        a: "It means activity can move quickly on Layer 2, while disputed activity can be challenged through the protocol and settlement returns to Cardano Layer 1.",
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
        a: "Yes. Midgard is built around three roles — users, builders (wallets and dApps), and operators & watchers — and welcomes serious participants across all three.",
      },
    ],
  },
  {
    title: "Security and support",
    items: [
      {
        q: "What is the security story?",
        a: "Midgard's trust story is built around Cardano Layer 1 anchoring, eUTXO-aware design, commitments, challenge mechanics, watchers, and settlement.",
      },
      {
        q: "Where do I report a security issue?",
        a: "Use the security policy linked from the Security page and the footer. Start from Official Links and preserve evidence.",
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
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((g) =>
    g.items.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: { "@type": "Answer", text: qa.a },
    })),
  ),
};

export default function FaqPage() {
  return (
    <main className="page-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHero
        compact
        tone="moss"
        label="FAQ"
        title="Frequently asked questions"
        sub="Common questions about what Midgard is, how it works, ADA fees, builders, participant roles, security, and testnet status."
        chips={
          <>
            {FAQ_GROUPS.map((g) => (
              <a className="chip" href={`#${faqGroupId(g.title)}`} key={g.title}>
                {g.title}
              </a>
            ))}
            <a className="chip" href="#why-eutxo">
              Why eUTXO
            </a>
            <a className="chip" href="#glossary">
              Glossary
            </a>
          </>
        }
        actions={[
          { label: "Read how it works", href: "/how-it-works", variant: "primary" },
          {
            label: "Whitepaper",
            href: "https://anastasia-labs.github.io/midgard/midgard.pdf",
            variant: "ghost",
          },
          { label: "Open official links", href: "/official-links", variant: "ghost" },
        ]}
      />

      <Section>
        <Faq groups={FAQ_GROUPS.slice(0, 4)} />
      </Section>

      {/* relocated from the home proofs chapter — inline with the security
          questions it answers */}
      <Section
        id="why-eutxo"
        eyebrow="Why eUTXO"
        title="Why eUTXO builds a better rollup"
        lead="Cardano's eUTXO model makes fraud proofs surgical: Midgard re-executes only the inputs of a bad transaction — no global state scan."
        tight
      >
        <EutxoDuel />
      </Section>

      <Section>
        <Faq groups={FAQ_GROUPS.slice(4)} />
      </Section>

      <Section
        id="glossary"
        eyebrow="Glossary"
        title="The words that keep coming up"
        lead="One-line definitions for the protocol vocabulary used across this site. The same definitions power the inline tooltips."
        tight
      >
        <dl className="glossary">
          {Object.entries(GLOSSARY).map(([key, entry]) => (
            <div className="glossary__row" key={key} id={`term-${key}`}>
              <dt>{entry.term}</dt>
              <dd>{entry.def}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </main>
  );
}
