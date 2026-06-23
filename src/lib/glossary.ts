/**
 * Shared protocol glossary — single source of truth for the <Term> inline
 * tooltip component (src/components/site/Term.tsx) and any page that wants a
 * one-line definition. Keys are stable slugs; keep definitions to a single
 * plain-text sentence (they render inside title attributes and tooltips).
 */
export const GLOSSARY = {
  eutxo: {
    term: "UTXO",
    def: "A ledger model where transactions consume and produce discrete outputs, helping keep validation local and parallelizable.",
  },
  "optimistic-rollup": {
    term: "optimistic rollup",
    def: "A Layer 2 design that assumes batches are valid by default and relies on fault proofs during a challenge window to catch bad state.",
  },
  "challenge-window": {
    term: "challenge window",
    def: "The dispute period after a state commitment lands on Cardano during which watchers can submit a fault proof against it.",
  },
  batcher: {
    term: "batcher",
    def: "The operator role that gathers Layer 2 transactions, orders them into a block, and commits the result to Cardano.",
  },
  watcher: {
    term: "watcher",
    def: "An independent node that re-executes committed blocks and raises a fault proof if a commitment does not match the rules.",
  },
  operator: {
    term: "operator",
    def: "A bonded participant who runs Midgard infrastructure, posting collateral that can be slashed for invalid commitments.",
  },
  settlement: {
    term: "settlement",
    def: "The point at which Layer 2 state becomes final on Cardano: the challenge window closes with no successful dispute.",
  },
  "fraud-proof": {
    term: "fault proof",
    def: "An on-chain proof that a committed state transition is invalid, built by re-executing only the disputed transaction's inputs.",
  },
  "fault-proof": {
    term: "fault proof",
    def: "An on-chain proof that a committed state transition is invalid, built by re-executing only the disputed transaction's inputs.",
  },
  "state-commitment": {
    term: "state commitment",
    def: "A compact cryptographic summary of Layer 2 state that the batcher posts to Cardano for anyone to verify or challenge.",
  },
  "layer-2": {
    term: "Layer 2",
    def: "A protocol that executes transactions off the base chain for speed and cost, while anchoring its security back to Layer 1.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
