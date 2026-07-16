import { faqGroupId, Section } from "@/components/site/ui";

/* =========================================================================
   FaqSections — the grouped Q&A embedded on /learn.

   Copy-alignment expansion (2026-07-08): grew back from 12 to ~21 questions,
   adopting the high-value visitor-anxiety answers from the aligned copy doc
   (token, Hydra, custody, liveness, cost, wallet, speed, earnings, mainnet)
   with the claims rulings applied — token answers are present-tense scoped
   only (Base-style: state today's facts, promise nothing about the future),
   percentages carry "estimated", no hard-finality durations, no wallet
   names, no "mathematically verified". Rows render statically — no reveal
   slabs. Styles come from the existing .faq-* and .faq-basics-shell classes.
   ========================================================================= */

export const FAQ_GROUPS = [
  {
    title: "Product status",
    items: [
      {
        q: "What is Midgard?",
        a: "Midgard is a Cardano-native optimistic rollup for UTXO finance, designed for faster, lower-cost execution while verified state settles through Cardano L1.",
      },
      {
        q: "Is Midgard live?",
        a: "Midgard will be live soon on Cardano preprod, not mainnet. Check Network Status and GitHub before integrating.",
      },
      {
        q: "Does Midgard have a token?",
        a: "There is no Midgard token, sale, or airdrop. Fees are paid in ADA; anyone selling a Midgard token is a scam. Check official links.",
      },
      {
        q: "How is Midgard different from Hydra?",
        a: "Hydra is a state channel for known, online participants. Midgard is an open optimistic rollup with shared state secured by fault proofs on Cardano.",
      },
      {
        q: "Is Midgard a bridge or a sidechain?",
        a: "Neither. A bridge changes asset custody, and a sidechain has its own consensus. Midgard is a rollup whose state is verified and settled through Cardano L1.",
      },
      {
        q: "When is mainnet?",
        a: "There is no date. Mainnet follows independent audits and parameter finalization.",
      },
      {
        q: "Can existing UTXO apps use Midgard?",
        a: "That is the goal: give UTXO applications a faster execution layer while preserving familiar development and security assumptions where possible.",
      },
      {
        q: "How does third-party bridge security relate to Midgard?",
        a: "A bridge can change liquidity and reach, but its security is separate from Midgard’s. Midgard settles through Cardano while a bridge depends on its own configuration.",
      },
    ],
  },
  {
    title: "Costs, wallets & funds",
    items: [
      {
        q: "What does it cost to use Midgard?",
        a: "Fees are paid in ADA. Midgard executes off-chain and commits compact data to Cardano; comparisons follow benchmarks.",
      },
      {
        q: "Do I need a new wallet or asset?",
        a: "No. You use ADA and a Cardano wallet you already have. Supported wallets are announced through official channels as each testnet phase confirms them.",
      },
      {
        q: "How fast are transactions?",
        a: "You get a soft confirmation in seconds (estimated); your transaction is usable right away. Final settlement follows on Cardano after the block's challenge window closes with no valid fault proof.",
      },
      {
        q: "Who holds my funds?",
        a: "Funds are locked by Cardano smart contracts, not a company or multisig bridge. No Operator key can move them.",
      },
      {
        q: "What if every operator goes offline?",
        a: "Your funds cannot be permanently stranded. If every Operator stops, you can submit directly to the L1 state queue; the protocol enforces that exit path.",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        q: "What is the main security claim?",
        a: "Finalized state settles through Cardano L1. Security relies on public contracts, available block data, fault proofs, and at least one honest Watcher.",
      },
      {
        q: "Does that mean Midgard is impossible to hack?",
        a: "No responsible protocol should promise that. The attack surface is narrower than many on-chain finance systems, and the most important logic can be inspected, challenged, and formally checked.",
      },
      {
        q: "What do Watchers do?",
        a: "Watchers replay committed blocks and submit fault proofs against invalid state. Safety requires one honest Watcher with the block data.",
      },
      {
        q: "Why does UTXO matter?",
        a: "In the UTXO model, each transaction carries everything needed to check it. A fault proof can re-run just the disputed transaction instead of replaying the chain's wider state.",
      },
    ],
  },
  {
    title: "Protocol roles and status",
    items: [
      {
        q: "Can anyone run an Operator or Watcher today?",
        a: "Midgard is pre-alpha. Initial operation is internal-team-led; broader registration opens as parameters mature.",
      },
      {
        q: "How do Operators and Watchers earn?",
        a: "Operators earn from committed transactions, deposits, and withdrawals. A valid fault proof targets an estimated 30–50% of the slashed bond; parameters finalize during testnet.",
      },
      {
        q: "How do I avoid scams?",
        a: "Use only official links. Midgard will never DM first or request seed phrases; there is no token to buy.",
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
] as const;

export default function FaqSections({ cols = false }: { cols?: boolean }) {
  return (
    <Section
      id="faq"
      title="Frequently asked questions."
      lead="Short answers on what Midgard is, how its security works, and what to check before relying on it."
      cols={cols}
    >
      <div className="faq-basics-shell">
        {/* flat static rows — no reveal slabs (rhythm rule: Rows are simply there) */}
        <div className="faq">
          {FAQ_GROUPS.map((g) => (
            <div
              className="faq-group"
              id={faqGroupId(g.title)}
              style={{ scrollMarginTop: 110 }}
              key={g.title}
            >
              <h3>{g.title}</h3>
              <div className="faq-list" role="list">
                {g.items.map((qa, index) => {
                  const questionId = `${faqGroupId(g.title)}-question-${index + 1}`;
                  return (
                    <article
                      className="faq-item"
                      role="listitem"
                      aria-labelledby={questionId}
                      key={qa.q}
                    >
                      <h4 className="q" id={questionId}>{qa.q}</h4>
                      <p className="a">{qa.a}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
