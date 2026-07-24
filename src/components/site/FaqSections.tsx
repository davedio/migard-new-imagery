import Link from "next/link";
import { faqGroupId, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   FaqSections — the grouped Q&A embedded on /learn.

   Copy-alignment expansion (2026-07-08): grew back from 12 to ~21 questions,
   adopting the high-value visitor-anxiety answers from the aligned copy doc
   (token, Hydra, custody, liveness, cost, wallet, speed, earnings, mainnet)
   with the claims rulings applied — token answers are present-tense scoped
   only (Base-style: state today's facts, promise nothing about the future),
   no hard-finality durations, no wallet names, no "mathematically verified".
   The page-level benchmark note carries performance, cost, and reward status.
   Rows render statically — no reveal
   slabs. Styles come from the existing .faq-* and .faq-basics-shell classes.
   ========================================================================= */

export const FAQ_GROUPS = [
  {
    title: "Product status",
    items: [
      {
        q: "What is Midgard?",
        a: "Midgard is a Cardano-native optimistic rollup for faster, lower-cost UTXO finance while verified state settles through Cardano L1.",
      },
      {
        q: "Is Midgard live?",
        a: "Protocol contracts are deployed on Cardano preprod. Public pre-alpha access and mainnet are not live. Check Network Status and GitHub before integrating.",
      },
      {
        q: "Does Midgard have a token?",
        a: "There is no Midgard token. Fees are paid in ADA; anyone selling a Midgard token is a scam. Check official links.",
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
        a: "Midgard is designed for Cardano dApps that use UTXO transaction logic. Integration requirements will be documented with public pre-alpha access.",
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
        a: "Fees are paid in ADA. Midgard executes off-chain and commits compact data to Cardano.",
      },
      {
        q: "Do I need a new wallet or asset?",
        a: "Fees are paid in ADA, and no separate Midgard fee asset is required. Supported wallet flows will be announced through official channels.",
      },
      {
        q: "How fast are transactions?",
        a: "You get a soft confirmation in seconds; your transaction is usable right away. Final settlement follows on Cardano after the block's challenge window closes with no valid fault proof.",
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
        a: "No. No protocol is immune to vulnerabilities. Midgard reduces specific risks through public contracts, fault proofs, independent Watchers, and Cardano settlement, but application code, wallets, infrastructure, data availability, and implementation bugs can still create risk.",
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
        a: "Operators earn from committed transactions, deposits, and withdrawals. A valid fault proof earns its prover 30–50% of the required Operator bond.",
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
        a: "Report it privately through the Vulnerability Disclosure Policy. Preserve logs and other evidence, and never post exploit details publicly. Midgard will never ask for your seed phrase, private key, recovery phrase, or password.",
        href: `${OFFICIAL_LINKS.securityPolicy}#how-to-report`,
        cta: "Open private reporting instructions",
      },
    ],
  },
] as const;

export default function FaqSections({ cols = false }: { cols?: boolean }) {
  return (
    <Section
      id="faq"
      title="Frequently asked questions"
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
                      <p className="a">
                        {qa.a}
                        {"href" in qa && qa.href ? (
                          <>
                            {" "}
                            <Link href={qa.href}>{qa.cta} →</Link>
                          </>
                        ) : null}
                      </p>
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
