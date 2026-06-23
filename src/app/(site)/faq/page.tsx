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
    "Plain-language answers about Midgard, eUTXO finance, security, fees, builders, Protocol Roles, and how to compare Midgard with other L2 designs.",
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
    midgard: "Built for eUTXO finance and local state transitions.",
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

const comparisonChartRows = [
  {
    k: "Security anchor",
    midgard: { level: "strong", label: "L1 settlement after verification" },
    evm: { level: "strong", label: "L1 settlement, bridge rules vary" },
    sidechain: { level: "watch", label: "Separate security set" },
  },
  {
    k: "eUTXO fit",
    midgard: { level: "strong", label: "Built for eUTXO finance" },
    evm: { level: "watch", label: "Mostly account-model execution" },
    sidechain: { level: "varies", label: "Depends on the chain" },
  },
  {
    k: "Verification path",
    midgard: { level: "strong", label: "Fault proofs plus Watcher replay" },
    evm: { level: "varies", label: "Optimistic, validity, or hybrid" },
    sidechain: { level: "watch", label: "Often validator-trust based" },
  },
  {
    k: "Contract assurance",
    midgard: { level: "strong", label: "Formal-methods first" },
    evm: { level: "varies", label: "Varies by protocol and app" },
    sidechain: { level: "varies", label: "Varies by implementation" },
  },
  {
    k: "Bridge exposure",
    midgard: { level: "medium", label: "Narrow settlement path to inspect" },
    evm: { level: "varies", label: "Bridge and upgrade rules matter" },
    sidechain: { level: "watch", label: "Bridge risk is often central" },
  },
] as const;

const modelCards = [
  {
    label: "Midgard",
    title: "eUTXO rollup path",
    tone: "midgard",
    points: [
      "Faster eUTXO execution",
      "Fault-proof verification with Watcher replay",
      "Final settlement through the L1 path after verification",
    ],
    scores: [
      ["eUTXO fit", "strong"],
      ["Verification", "strong"],
      ["Bridge exposure", "medium"],
    ],
  },
  {
    label: "EVM rollups",
    title: "Account-model L2s",
    tone: "neutral",
    points: [
      "Often mature tooling and liquidity",
      "Security depends on bridge, proof, sequencer, and upgrade rules",
      "Execution model is usually not eUTXO-native",
    ],
    scores: [
      ["eUTXO fit", "watch"],
      ["Verification", "varies"],
      ["Bridge exposure", "varies"],
    ],
  },
  {
    label: "Sidechains / appchains",
    title: "Separate execution chains",
    tone: "watch",
    points: [
      "Can be fast and flexible",
      "Security often depends on a separate validator set",
      "Bridge exposure is usually central to the risk model",
    ],
    scores: [
      ["eUTXO fit", "varies"],
      ["Verification", "watch"],
      ["Bridge exposure", "watch"],
    ],
  },
] as const;

const trustPath = [
  {
    k: "Execution",
    midgard: "eUTXO-local activity runs faster.",
    watch: "Check what execution model changed.",
  },
  {
    k: "Commitment",
    midgard: "Operators commit state for inspection.",
    watch: "Check who can see and replay it.",
  },
  {
    k: "Challenge",
    midgard: "Watchers can use the fault-proof path.",
    watch: "Check the proof and challenge rules.",
  },
  {
    k: "Settlement",
    midgard: "Finalized state settles after verification.",
    watch: "Check what becomes final and when.",
  },
] as const;

const levelLabels = {
  strong: "Strong fit",
  medium: "Inspect details",
  varies: "Varies",
  watch: "Higher caution",
} as const;

const comparisonLegend = [
  ["strong", levelLabels.strong],
  ["medium", levelLabels.medium],
  ["varies", levelLabels.varies],
  ["watch", levelLabels.watch],
] as const;

function ComparisonCell({
  label,
  cell,
}: {
  label: string;
  cell: { level: "strong" | "medium" | "varies" | "watch"; label: string };
}) {
  return (
    <div className="comparison-chart__cell">
      <span className="comparison-chart__mobile-label">{label}</span>
      <span className="comparison-chart__score">
        <span className="comparison-chart__bar" data-level={cell.level} />
        <em>{levelLabels[cell.level]}</em>
      </span>
      <p>{cell.label}</p>
    </div>
  );
}

function ModelCard({
  card,
}: {
  card: (typeof modelCards)[number];
}) {
  return (
    <article className="faq-model-card" data-tone={card.tone}>
      <span>{card.label}</span>
      <h3>{card.title}</h3>
      <ul>
        {card.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <div className="faq-model-card__scores" aria-label={`${card.label} comparison scores`}>
        {card.scores.map(([label, level]) => (
          <div className="faq-model-card__score" key={label}>
            <span>{label}</span>
            <i data-level={level} />
          </div>
        ))}
      </div>
    </article>
  );
}

export default function FaqPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="moss"
        title="Questions, answered plainly."
        sub="Plain answers on what Midgard is, why it matters, how security works, and where to inspect the claims."
        actions={[
          { label: "Compare L2 models", href: "#comparison", variant: "primary" },
          { label: "Read security", href: "/security", variant: "ghost" },
        ]}
      />

      <Section
        id="comparison"
        title="Compare the trust model first."
        lead="Do not compare L2s only by speed. Compare what executes faster, what can be independently checked, and what finally settles."
      >
        <div className="faq-model-cards" aria-label="High-level comparison of Midgard, EVM rollups, and sidechains">
          {modelCards.map((card) => (
            <ModelCard key={card.label} card={card} />
          ))}
        </div>
        <div className="faq-trust-path" aria-label="Trust path from execution to settlement">
          {trustPath.map((step, index) => (
            <article className="faq-trust-path__step" key={step.k}>
              <span className="faq-trust-path__n">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.k}</h3>
              <p>{step.midgard}</p>
              <small>{step.watch}</small>
            </article>
          ))}
        </div>
        <div className="comparison-chart__legend" aria-label="Comparison chart legend">
          <strong>How to read the chart</strong>
          {comparisonLegend.map(([level, label]) => (
            <span key={level}>
              <i data-level={level} />
              {label}
            </span>
          ))}
        </div>
        <div className="comparison-chart" aria-label="Qualitative comparison chart for Midgard and common L2 patterns">
          <div className="comparison-chart__head" aria-hidden>
            <span>Question</span>
            <span>Midgard</span>
            <span>EVM rollups</span>
            <span>Sidechains / appchains</span>
          </div>
          {comparisonChartRows.map((row) => (
            <div className="comparison-chart__row" key={row.k}>
              <div className="comparison-chart__k">{row.k}</div>
              <ComparisonCell label="Midgard" cell={row.midgard} />
              <ComparisonCell label="EVM rollups" cell={row.evm} />
              <ComparisonCell label="Sidechains / appchains" cell={row.sidechain} />
            </div>
          ))}
        </div>
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

      <Section id="basics">
        <Faq
          groups={[
            {
              title: "Product status",
              items: [
                {
                  q: "What is Midgard?",
                  a: "Midgard is the execution layer for eUTXO finance: an optimistic rollup that gives applications faster execution while keeping settlement anchored to L1.",
                },
                {
                  q: "Why does Midgard matter?",
                  a: "eUTXO applications should not have to choose between speed and security. Midgard gives them a faster execution path without abandoning the security model that makes the base layer valuable.",
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
                  a: "No responsible protocol should promise that. The point is that the attack surface is narrower than many on-chain finance systems, and the most important logic can be inspected, challenged, and formally checked.",
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
                  a: "Users, builders, and Protocol Roles. Operators and Watchers are grouped together because both keep Midgard running and verifiable.",
                },
                {
                  q: "Can existing eUTXO apps use Midgard?",
                  a: "That is the goal: give eUTXO applications a faster execution layer while preserving familiar development and security assumptions where possible.",
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

      <Section title="What to inspect next.">
        <CardGrid cols={2}>
          <Card
            title="Read how it works"
            body="Follow deposit, transact, withdraw, commitment, data availability checks, fault-proof verification, and settlement."
            cta="Open flow"
            href="/how-it-works"
          />
          <Card
            title="Review security"
            body="Inspect the trust path, security guarantees, watcher role, and responsible-disclosure route."
            cta="Read security"
            href="/security"
          />
          <Card
            title="Inspect the source"
            body="Use GitHub to check the implementation rather than treating website copy as the final technical spec."
            cta="Open GitHub"
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

      <Section title="Use official paths only." tight>
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
        title="Start with the mechanism."
        lead="The right question is not only whether Midgard is faster. It is what has to be trusted after Midgard makes eUTXO execution faster."
        actions={[
          { label: "Read how it works", href: "/how-it-works", variant: "primary" },
          { label: "Read security", href: "/security", variant: "ghost" },
        ]}
      />
    </main>
  );
}
