import { faqGroupId, Section } from "@/components/site/ui";

/* =========================================================================
   FaqSections — the grouped Q&A (formerly the /faq page) mounted as the
   #faq anchor section on /how-it-works, plus a single compact
   "How Midgard compares" block (the page's ONE card grid).

   Reading-rhythm redesign (2026-07-02): pruned from 17 questions to 12 —
   the duplicated / self-referential ones are gone (fees now live in the
   proof-metrics strip; "who is it for" / "where do builders start" /
   "what do Protocol Roles do" restated the page or other answers). Rows
   render statically — no reveal slabs; the decision grid gets the page's
   single group entrance. Styles come from the existing .faq-*,
   .faq-basics-shell, and .faq-decision-* classes.
   ========================================================================= */

const faqGroups = [
  {
    title: "Product status",
    items: [
      {
        q: "What is Midgard?",
        a: "Midgard is an optimistic rollup for UTXO finance. Applications execute faster, while verified state settles through Cardano L1.",
      },
      {
        q: "Is Midgard live?",
        a: "Midgard is live on a public pre-alpha testnet — not mainnet yet. Check GitHub for current parameters and status before integrating.",
      },
      {
        q: "Is Midgard a sidechain?",
        a: "No. Midgard is a rollup: L2 execution, committed state, fault-proof verification, and settlement through Cardano L1.",
      },
      {
        q: "Can existing UTXO apps use Midgard?",
        a: "That is the goal: give UTXO applications a faster execution layer while preserving familiar development and security assumptions where possible.",
      },
      {
        q: "What does LayerZero or another bridge change?",
        a: "Bridge integrations can affect liquidity and user reach, but bridge and DVN assumptions are separate from Midgard protocol guarantees. Midgard can settle through Cardano L1 while bridge security still depends on the bridge configuration.",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        q: "What is the main security claim?",
        a: "Finalized state settles through Cardano L1 after verification. The security model depends on mathematically verified contracts, UTXO-local fault proofs, data availability, and at least one honest Watcher.",
      },
      {
        q: "Does that mean Midgard is impossible to hack?",
        a: "No responsible protocol should promise that. The point is that the attack surface is narrower than many on-chain finance systems, and the most important logic can be inspected, challenged, and formally checked.",
      },
      {
        q: "What do Watchers do?",
        a: "Watchers inspect committed blocks, replay the relevant state transition, and raise a fault proof if an Operator commits invalid state. Midgard safety requires at least one honest Watcher with the data needed to check the block.",
      },
      {
        q: "Why does UTXO matter?",
        a: "UTXO state is local. A fault proof can focus on referenced inputs and one disputed transition instead of replaying broad global account state.",
      },
    ],
  },
  {
    title: "Protocol Roles and status",
    items: [
      {
        q: "Can anyone run an Operator or Watcher today?",
        a: "Midgard is pre-alpha. Participation is staged: initial operation is internal-team-led, with broader Operator and Watcher registration opened as parameters mature.",
      },
      {
        q: "What should I check before relying on Midgard?",
        a: "Check current testnet status, contract surfaces, source code, challenge-window assumptions, Operator behavior, and published benchmark data.",
      },
      {
        q: "Where do I report a security issue?",
        a: "Use the official security-policy route and preserve evidence. Midgard will never ask for your seed phrase, private key, recovery phrase, or password.",
      },
    ],
  },
];

const basicsRail = [
  {
    label: "Product status",
    href: `#${faqGroupId("Product status")}`,
    detail: "What Midgard is, current status, and whether existing apps fit.",
  },
  {
    label: "Security",
    href: `#${faqGroupId("Security")}`,
    detail: "Claims, attack surface, Watchers, and UTXO fit.",
  },
  {
    label: "Protocol Roles",
    href: `#${faqGroupId("Protocol Roles and status")}`,
    detail: "Who runs the network today, what to check, and where to report.",
  },
] as const;

const decisionGrid = [
  {
    label: "Midgard",
    title: "UTXO apps that need faster execution",
    best: "Applications that want faster activity without leaving the UTXO model.",
    caution: "Pre-alpha testnet today — verify current benchmarks and parameters before integrating.",
    inspect: "Security model, contracts, source, and current testnet status.",
    tone: "midgard",
  },
  {
    label: "EVM rollups",
    title: "EVM apps that need mature tooling",
    best: "Teams optimizing for EVM liquidity, wallets, infrastructure, and existing app patterns.",
    caution: "Bridge, sequencer, proof, upgrade, and escape rules can change the real trust model.",
    inspect: "Bridge design, fraud or validity proof rules, sequencer controls, and upgrade keys.",
    tone: "neutral",
  },
  {
    label: "Sidechains / appchains",
    title: "Apps that need custom execution",
    best: "Teams that want a separate execution environment with more control over chain parameters.",
    caution: "Security often depends on a separate validator set, bridge custody, and governance process.",
    inspect: "Validator set, bridge assumptions, withdrawal path, and who can change the rules.",
    tone: "watch",
  },
] as const;

function DecisionCard({ card }: { card: (typeof decisionGrid)[number] }) {
  return (
    <article className="faq-decision-card" data-tone={card.tone}>
      <span className="faq-decision-card__label">{card.label}</span>
      <h3>{card.title}</h3>
      <dl>
        <div>
          <dt>Best for</dt>
          <dd>{card.best}</dd>
        </div>
        <div>
          <dt>Main caution</dt>
          <dd>{card.caution}</dd>
        </div>
        <div>
          <dt>Inspect first</dt>
          <dd>{card.inspect}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function FaqSections() {
  return (
    <>
      <Section
        id="faq"
        title="Questions."
        lead="Short answers on what Midgard is, how its security works, and what to check before relying on it."
      >
        <div className="faq-basics-shell">
          {/* flat static rows — no reveal slabs (rhythm rule: Rows are simply there) */}
          <div className="faq">
            {faqGroups.map((g) => (
              <div
                className="faq-group"
                id={faqGroupId(g.title)}
                style={{ scrollMarginTop: 110 }}
                key={g.title}
              >
                <h3>{g.title}</h3>
                <div className="faq-list">
                  {g.items.map((qa) => (
                    <div className="faq-item" key={qa.q}>
                      <div className="q">{qa.q}</div>
                      <div className="a">{qa.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="faq-topic-rail" aria-label="FAQ topic shortcuts">
            <span>Jump to topic</span>
            {basicsRail.map((item) => (
              <a href={item.href} key={item.label}>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </a>
            ))}
          </aside>
        </div>
      </Section>

      <Section
        id="comparison"
        title="How Midgard compares."
        lead="Three common paths side by side: what each is best for, its main caution, and what to inspect before you commit."
        tight
      >
        <div className="faq-decision-grid" aria-label="Decision grid for common L2 patterns">
          {decisionGrid.map((card) => (
            <DecisionCard key={card.label} card={card} />
          ))}
        </div>
      </Section>
    </>
  );
}
