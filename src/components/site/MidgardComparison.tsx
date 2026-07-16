/* ============================================================
   MidgardComparison — the homepage's plain-language comparison
   of Midgard, EVM rollups, and sidechains/appchains. Keep the
   claims conditional and decision-oriented rather than absolute.
   ============================================================ */

const decisionGrid = [
  {
    label: "Midgard",
    title: "UTXO apps that need faster execution",
    best: "Applications that want faster activity without leaving the UTXO model.",
    caution: "Pre-alpha testnet coming soon; verify current benchmarks and parameters before integrating.",
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

export default function MidgardComparison() {
  return (
    <div className="faq-decision-grid" aria-label="Decision grid for common L2 patterns">
      {decisionGrid.map((card) => (
        <DecisionCard key={card.label} card={card} />
      ))}
    </div>
  );
}
