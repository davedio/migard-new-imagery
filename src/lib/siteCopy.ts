import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const BENCHMARK_STATUS_NOTES = {
  performanceCost:
    "Benchmark status: Performance and cost figures on this page are current design targets. Public testnet results will replace these targets after benchmarking.",
  costReward:
    "Benchmark status: Cost and reward figures on this page are current design targets. Public testnet results and finalized parameters will replace these targets.",
  performanceCostReward:
    "Benchmark status: Performance, cost, and reward figures on this page are current design targets. Public testnet results and finalized parameters will replace these targets.",
} as const;

export const SITE_COPY = {
  hero: {
    /* Homepage positioning line. Keep titleLines in sync so the interactive
       heading preserves the intended line break. */
    title: "The execution layer for UTXO finance",
    /** The H1 line break — kept separate so ShatterHeading can split cleanly. */
    titleLines: ["The execution layer", "for UTXO finance"],
    lead:
      "Midgard gives Cardano applications faster, lower-cost execution, with settlement and security anchored to Cardano L1.",
    primaryCta: { label: "Midgard Overview", href: "/learn" },
    secondaryCta: { label: "Developers", href: "/developers" },
  },
  /** The proof strip under the hero lead — visitor-facing numbers, not KPIs.
      The page-level benchmark note carries the status of forward-looking figures. */
  stats: [
    { k: "Confirmations", v: "Seconds", s: "Not minutes" },
    { k: "Fees", v: "Lower-cost fees", s: "Paid in ADA" },
    { k: "Security", v: "Fault proofs", s: "Settlement through Cardano" },
    { k: "Contracts", v: "Open source", s: "Public node and contract code" },
  ],
  /** The home "Choose your path" cards — verb-led per the 2026-07-03 call. */
  paths: [
    {
      title: "Build",
      body: "Map a Cardano dApp's UTXO flow to Midgard, then inspect the source, contracts, and settlement path.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Participate",
      body: "Help run the network and earn. Operators earn fees for ordering transactions into blocks; Watchers earn by stopping bad blocks before they settle.",
      cta: "Explore protocol roles",
      href: "/participate",
    },
    {
      title: "Use",
      body: "Cardano apps can offer deposits, transactions, and withdrawals with confirmations in seconds and settlement through Cardano.",
      cta: "See the user path",
      href: "/users",
    },
  ],
  partnersIntro:
    "Teams across the Cardano ecosystem that build with Midgard.",
  lifecycle: [
    ["Submit", "A user submits a transaction to Midgard, usually through an app or wallet."],
    ["Sequence", "An Operator orders valid transactions into an L2 block."],
    ["Commit", "The Operator posts a compact block header to the Cardano L1 settlement path."],
    ["Data availability", "Block data is published so Watchers and builders can inspect the commitment."],
    ["Watch", "Watchers replay committed blocks; a valid fault proof keeps bad state from settling."],
    ["Settle", "If no valid fault proof succeeds, verified state settles through Cardano L1."],
  ],
  trustFlow: {
    kicker: "Transaction path",
    title: "You only ever see three steps.",
    lead: "Deposit once, transact as much as you like, and withdraw when you're done. Midgard runs everything else underneath.",
    resolved: {
      kicker: "Why that's safe",
      title: "You don't have to watch the pipeline. Watchers do it for you.",
      body: "Operators sequence and commit your activity. That is the speed you feel. Every commitment stays open to challenge while its data is public. One honest Watcher, out of any number, is enough to stop a bad block before it settles; after that, state settles through Cardano's own L1 consensus.",
    },
    badges: [
      {
        label: "Operators",
        detail: "Sequence and commit every transaction, fast.",
      },
      {
        label: "Watchers",
        detail: "Only one honest Watcher, out of any number, is enough to catch a fault.",
      },
      {
        label: "Cardano L1",
        detail: "Verified state settles through the same base layer securing all of Cardano.",
      },
    ],
  },
  proofPoints: [
    {
      k: "Soft confirmations",
      v: "Seconds",
      s: "Your transaction is usable in seconds while verified state continues toward settlement through Cardano L1.",
    },
    {
      k: "Settlement security",
      v: "Cardano L1",
      s: "Verified state settles through the same base layer that secures all of Cardano.",
    },
    {
      k: "Execution model",
      v: "UTXO-native",
      s: "Applications keep their UTXO design and gain faster execution, with no EVM translation layer.",
    },
    {
      k: "Smart contracts",
      v: "Open source",
      s: "The contracts are public, so security claims can be checked against code.",
      cta: "Inspect the protocol source",
      href: OFFICIAL_LINKS.github,
    },
    {
      k: "Independent verification",
      v: "Contestable state",
      s: "Committed state can be independently replayed, challenged, and verified by anyone before it settles.",
    },
    {
      k: "Status",
      v: "Pre-alpha",
      s: "Preprod contracts are public. Public access comes next; mainnet follows audits and parameter finalization.",
    },
  ],
  channels: [
    {
      intent: "Report something sensitive",
      title: "Security policy",
      body: "Vulnerabilities, impersonation, exploits, and anything that should not be posted publicly.",
      cta: "Read security policy",
      href: OFFICIAL_LINKS.securityPolicy,
    },
    {
      intent: "Build or review code",
      title: "GitHub",
      body: "Source, contracts, node code, implementation details, and public technical review.",
      cta: "Open GitHub",
      href: OFFICIAL_LINKS.github,
    },
    {
      intent: "Register interest",
      title: "Intake form",
      body: "Builders, protocol roles, infrastructure partners, and testnet participation.",
      cta: "Open intake form",
      href: OFFICIAL_LINKS.intakeForm,
    },
  ],
} as const;

export const DEVELOPER_COPY = {
  hero: {
    title: "Build fast apps with Cardano-rooted settlement.",
    /** The page's ONE telling of the wallet-action / app-interaction /
        data-availability / fallback sentence (reading-rhythm redesign). */
    lead:
      "Build Cardano dApps with familiar UTXO logic and faster execution. The source, contracts, and Cardano settlement path are open to inspect.",
  },
  /** Three concise ways into the developer experience. Each card is a
      complete starting point, rather than a step in a required sequence. */
  paths: [
    {
      title: "Build with Midgard",
      body: "Review the source and prepare your Cardano dApp's UTXO flow for Midgard on preprod.",
      href: OFFICIAL_LINKS.github,
      cta: "Open GitHub",
    },
    {
      title: "Prepare to run the network",
      body: "Register interest to operate or watch Midgard when Cardano preprod opens.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Register interest",
    },
    {
      title: "Plan an integration",
      body: "Discuss a deeper Midgard integration, infrastructure partnership, or custom deployment.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Discuss an integration",
    },
  ],
  /** The security section content — folded into /learn#security.
      Trust path + fault proofs are one Prose telling; audit status and
      responsible disclosure stand as two emphasized data rows. */
  security: {
    title: "Security",
    lead: "The trust path is inspectable end to end: fast confirmations up front, fault proofs and independent Watchers behind them, Cardano L1 settlement underneath.",
    prose: [
      "One honest Watcher, out of any number, is enough to catch and stop a bad block. Committed state stays open to challenge for the full window before it settles. Fast confirmations up front never shortcut it.",
      "When a Watcher finds an invalid commitment, it is contested with an on-chain fault proof before it can become settled state. Security is enforced by Cardano L1, not by trusting Operators.",
    ],
    rows: [
      {
        label: "Testnet and audit status",
        body: "Protocol contracts are deployed on Cardano preprod. Public pre-alpha access comes next. Independent audits are planned ahead of mainnet, and formal-methods work is in progress.",
      },
      {
        label: "Private vulnerability reporting",
        body: "Found a vulnerability? Use the Vulnerability Disclosure Policy to report it privately. Preserve logs and other evidence, and never post exploit details publicly.",
        href: `${OFFICIAL_LINKS.securityPolicy}#how-to-report`,
      },
    ],
  },
} as const;

/* The /economics page was folded into the audience pages (2026-07-11):
   each of /users, /developers, /participate carries its own economics
   section, and this matrix is the single cross-entity comparison view
   rendered on /#economics. The page-level benchmark note carries the
   status of performance, cost, and reward figures. */
export const ECONOMICS_MATRIX = {
  title: "Economics, across the network",
  lead: "What each participant pays and earns. Each audience page has the detail.",
  rows: [
    {
      who: "Users",
      pay: "Fees paid directly in ADA, 10 to 30x lower than L1.",
      get: "Confirmations in seconds, with verified state settling on Cardano.",
      href: "/users#economics",
      cta: "User economics",
    },
    {
      who: "Builders",
      pay: "An ADA-denominated fee model for users, with no separate fee asset.",
      get: "Faster UTXO execution, with public protocol code and a technical specification to inspect how it works.",
      href: "/developers#economics",
      cta: "Builder economics",
    },
    {
      who: "Operators",
      pay: "An ADA bond locked on Cardano while the Operator sequences blocks in rotating shifts.",
      get: "Revenue from transaction, deposit, and withdrawal fees on blocks the Operator commits.",
      href: "/participate#economics",
      cta: "Role economics",
    },
    {
      who: "Watchers",
      pay: "Node compute, bandwidth, and uptime. No bond or selection is required.",
      get: "30–50% of the required Operator bond for a valid fault proof.",
      href: "/participate#economics",
      cta: "Role economics",
    },
    {
      who: "Cardano",
      pay: "No direct cost",
      get: "L1 transaction fees from Midgard activity, including slashing penalties paid to the Cardano treasury.",
      href: "/learn#security",
      cta: "Security model",
    },
  ],
  thesis: {
    kicker: "Why it matters",
    line: "Midgard uses paid Cardano L1 transactions for commitments and settlement, and routes slashing penalties to the Cardano treasury. It is built to pay Cardano back.",
  },
} as const;
