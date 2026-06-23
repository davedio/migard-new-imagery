import type { Metadata } from "next";
import {
  Actions,
  Callout,
  Card,
  CardGrid,
  CtaBand,
  Faq,
  PageHero,
  Section,
} from "@/components/site/ui";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "FAQ | Midgard",
  description:
    "Plain-language answers about Midgard, UTXO finance, security, fees, builders, operators, watchers, and how to compare Midgard with other L2 designs.",
  openGraph: {
    title: "FAQ | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

const comparisonRows = [
  {
    k: "Settlement",
    midgard: "Final state settles through the L1 path after verification.",
    other: "Often depends on a bridge, multisig, sequencer, or separate settlement assumptions.",
  },
  {
    k: "Execution model",
    midgard: "Built for UTXO finance and eUTXO-local state transitions.",
    other: "Often built around account-state execution or a chain-specific VM.",
  },
  {
    k: "Attack surface",
    midgard: "Smaller, more local proof targets with mathematically verified contracts.",
    other: "Can expose broad shared state, bridge complexity, and larger contract surfaces.",
  },
  {
    k: "Verification",
    midgard: "Fault-proof path plus independent Watcher replay.",
    other: "Ranges from optimistic proofs to validity proofs to trusted operator models.",
  },
];

export default function FaqPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="moss"
        label="FAQ"
        title="Questions, answered plainly."
        sub="A shorter path through what Midgard is, why it matters, how security works, and where to inspect the claims."
        actions={[
          { label: "Compare L2 models", href: "#comparison", variant: "primary" },
          { label: "Read security", href: "/security", variant: "ghost" },
        ]}
      />

      <Section id="basics">
        <Faq
          groups={[
            {
              title: "Product status",
              items: [
                {
                  q: "What is Midgard?",
                  a: "Midgard is an optimistic rollup for UTXO finance. It gives applications faster execution while keeping settlement anchored to L1.",
                },
                {
                  q: "Why does Midgard matter?",
                  a: "UTXO applications should not have to choose between speed and security. Midgard gives them a faster execution path without abandoning the security model that makes the base layer valuable.",
                },
                {
                  q: "Is Midgard live?",
                  a: "Midgard is in pre-alpha testnet. Public claims should be checked against current status, measured benchmarks, source code, and approved protocol parameters.",
                },
                {
                  q: "Is Midgard a sidechain?",
                  a: "No. Midgard is positioned as a rollup path: L2 execution, committed state, fault-proof verification, and settlement through the L1 path.",
                },
              ],
            },
            {
              title: "Security",
              items: [
                {
                  q: "What is the main security claim?",
                  a: "Finalized state is designed to inherit the full security of the L1 settlement layer, while Midgard reduces the attack surface through eUTXO-local state, mathematically verified contracts, and fault-proof verification.",
                },
                {
                  q: "Does that mean Midgard is impossible to hack?",
                  a: "No responsible protocol should promise that. The point is that the attack surface is much lower than many DeFi systems, and the most important logic can be inspected, challenged, and formally checked.",
                },
                {
                  q: "What do Watchers do?",
                  a: "Watchers inspect committed blocks, replay the relevant state transition, and use the fault-proof path if an operator submits invalid state.",
                },
                {
                  q: "Why does eUTXO matter?",
                  a: "eUTXO state is more local. That helps narrow what must be inspected and can reduce the broad shared-state risk that shows up in many account-model DeFi exploits.",
                },
              ],
            },
            {
              title: "Users and builders",
              items: [
                {
                  q: "Who is Midgard for?",
                  a: "Users, builders, and protocol roles. Operators and Watchers are grouped together because both keep Midgard running and verifiable.",
                },
                {
                  q: "Can existing UTXO apps use Midgard?",
                  a: "That is the goal: give UTXO applications a faster execution layer while preserving familiar development and security assumptions where possible.",
                },
                {
                  q: "Where should builders start?",
                  a: "Start with the source, the How It Works page, and one concrete flow you want to make faster.",
                },
                {
                  q: "How are fees paid?",
                  a: "The current public positioning is ADA fees with no separate gas token.",
                },
              ],
            },
            {
              title: "Protocol roles and status",
              items: [
                {
                  q: "What do protocol roles do?",
                  a: "Operators order L2 activity, produce blocks, and commit state. Watchers inspect commitments and use the fault-proof path if an operator submits invalid state.",
                },
                {
                  q: "What should I check before relying on Midgard?",
                  a: "Check current testnet status, contract surfaces, source code, challenge-window assumptions, operator behavior, and published benchmark data.",
                },
                {
                  q: "Where do I report a security issue?",
                  a: "Use the official security-policy route and preserve evidence. Midgard will never ask for your seed phrase, private key, recovery phrase, or password.",
                },
              ],
            },
          ]}
        />
      </Section>

      <Section
        id="comparison"
        eyebrow="L2 comparison"
        title="Compare the trust model, not just the speed claim."
        lead="A faster L2 is only useful if users can understand what security changed. This is the comparison lens Midgard should keep making visible."
      >
        <div className="comparison-matrix">
          <div className="comparison-matrix__head" aria-hidden>
            <span>Dimension</span>
            <span>Midgard</span>
            <span>Other L2 patterns</span>
          </div>
          {comparisonRows.map((row) => (
            <div className="comparison-matrix__row" key={row.k}>
              <div className="comparison-matrix__k">{row.k}</div>
              <div>
                <span className="comparison-matrix__bar comparison-matrix__bar--midgard" />
                <p>{row.midgard}</p>
              </div>
              <div>
                <span className="comparison-matrix__bar" />
                <p>{row.other}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout
          title="This page should stay current."
          body="As benchmarks, bridge integrations, and protocol parameters mature, this comparison should become more quantitative. For now, it keeps the evaluation criteria visible without pretending pre-alpha numbers are final."
        />
      </Section>

      <Section eyebrow="Good next steps" title="What to inspect next.">
        <CardGrid cols={2}>
          <Card
            title="Read how it works"
            body="Follow deposit, transact, withdraw, commitment, DA attestation, fault-proof verification, and settlement."
            cta="Open flow"
            href="/how-it-works"
          />
          <Card
            title="Review security"
            body="Inspect the trust path, security guarantees, watcher role, and responsible-disclosure route."
            cta="Open security"
            href="/security"
          />
          <Card
            title="Inspect the source"
            body="Use GitHub to check the implementation rather than treating website copy as the final technical spec."
            cta="View GitHub"
            ctaIcon={<GitHubIcon size={14} />}
            href={OFFICIAL_LINKS.github}
          />
          <Card
            title="Bring a real flow"
            body="The fastest useful feedback comes from a wallet action, dApp interaction, protocol path, indexer need, or fallback behavior."
            cta="Share a flow"
            href={OFFICIAL_LINKS.intakeForm}
          />
        </CardGrid>
      </Section>

      <Section eyebrow="Safety" title="Use official paths only." tight>
        <Callout
          title="Midgard will never ask for wallet secrets."
          body="Do not share your seed phrase, private key, recovery phrase, password, or unnecessary personal information. Do not trust unsolicited support messages."
        />
        <Actions
          items={[
            {
              label: "Security policy",
              href: OFFICIAL_LINKS.securityPolicy,
              variant: "ghost",
            },
            {
              label: "Join Discord",
              href: OFFICIAL_LINKS.discord,
              variant: "ghost",
            },
          ]}
        />
      </Section>

      <CtaBand
        eyebrow="Still curious"
        title="Start with the mechanism."
        lead="The right question is not only whether Midgard is faster. It is what has to be trusted after Midgard makes UTXO execution faster."
        actions={[
          { label: "Read how it works", href: "/how-it-works", variant: "primary" },
          { label: "Open security", href: "/security", variant: "ghost" },
        ]}
      />
    </main>
  );
}
