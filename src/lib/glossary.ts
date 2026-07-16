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
    def: "A Layer 2 design that assumes blocks are valid by default and relies on fault proofs during a challenge window to catch bad state.",
  },
  "challenge-window": {
    term: "challenge window",
    def: "The dispute period after a state commitment lands on Cardano during which Watchers can submit a fault proof against it.",
  },
  watcher: {
    term: "Watcher",
    def: "An independent node that re-executes committed blocks and raises a fault proof if a commitment does not match the rules.",
  },
  operator: {
    term: "Operator",
    def: "A bonded participant who orders transactions into blocks and commits them to Cardano; invalid commitments can slash its collateral.",
  },
  settlement: {
    term: "settlement",
    def: "The point at which Layer 2 state becomes final on Cardano: the challenge window closes with no successful dispute.",
  },
  "fault-proof": {
    term: "fault proof",
    def: "An on-chain proof that a committed state transition is invalid, built by re-executing only the disputed transaction's inputs.",
  },
  "state-commitment": {
    term: "state commitment",
    def: "A compact cryptographic summary an Operator posts to Cardano for public verification or challenge.",
  },
  "layer-2": {
    term: "Layer 2",
    def: "A protocol that executes transactions off the base chain for speed and cost, while anchoring its security back to Layer 1.",
  },
  "cardano-l1": {
    term: "Cardano L1",
    def: "The base Cardano blockchain, where Midgard anchors its security and final settlement.",
  },
  bond: {
    term: "bond",
    def: "ADA an Operator locks as collateral on Cardano; a valid fault proof slashes it, making honest operation the profitable strategy.",
  },
  "soft-confirmation": {
    term: "soft confirmation",
    def: "The confirmation you can act on: reached in seconds (estimated), backed by the Operator's bond, ahead of final settlement.",
  },
  "state-queue": {
    term: "state queue",
    def: "The on-chain queue of committed block headers on Cardano, each awaiting its challenge window before folding into confirmed state.",
  },
  "data-availability": {
    term: "data availability",
    def: "Block data being public and retrievable so anyone can replay it; Midgard's dedicated layer is in development.",
  },
  "da-committee": {
    term: "data availability committee",
    def: "The planned set of nodes that attest a block's data is retrievable, separate from the Operators who sequence blocks.",
  },
  "archive-node": {
    term: "archive node",
    def: "A planned node type that stores full chain history so it can be served independently of the data-availability layer.",
  },
  "rpc-poisoning": {
    term: "RPC poisoning",
    def: "Feeding an app false chain data through a compromised RPC provider; Midgard's canonical state lives on Cardano, so you can verify it from your own node.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
