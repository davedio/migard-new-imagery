import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    /* Homepage positioning line. Keep titleLines in sync so the interactive
       heading preserves the intended line break. */
    title: "The execution layer for UTXO finance.",
    /** The H1 line break — kept separate so ShatterHeading can split cleanly. */
    titleLines: ["The execution layer", "for UTXO finance."],
    lead:
      "Midgard gives Cardano applications faster, lower-cost execution, with settlement and security anchored to Cardano L1.",
    primaryCta: { label: "Midgard Overview", href: "/learn" },
    secondaryCta: { label: "Developers", href: "/developers" },
  },
  /** The proof strip under the hero lead — visitor-facing numbers, not KPIs.
      Forward-looking figures say "estimated" once and state the claim plainly. */
  stats: [
    { k: "Confirmations", v: "Seconds", s: "Not minutes" },
    { k: "Fees", v: "Lower-cost fees", s: "Paid in ADA" },
    { k: "Security", v: "Verified smart contracts", s: "Settled securely on Cardano" },
    { k: "Contracts", v: "Open source", s: "Formally verified fault proofs" },
  ],
  /** The home "Choose your path" cards — verb-led per the 2026-07-03 call
      (build / participate / use), with the earn hook stated as an estimate. */
  paths: [
    {
      title: "Build",
      body: "Developers keep familiar transaction logic at a new speed. Validators, tests, and tooling port over with an endpoint change.",
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
      body: "Deposit, transact, and withdraw using your favorite apps. Get confirmations in seconds (estimated), while transactions settle securely on Cardano.",
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
      s: "Your transaction is usable in seconds (estimated), while verified state continues toward settlement through Cardano L1.",
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
      cta: "Read about Blaster",
      href: OFFICIAL_LINKS.blaster,
    },
    {
      k: "Independent verification",
      v: "Contestable state",
      s: "Committed state can be independently replayed, challenged, and verified by anyone before it settles.",
    },
    {
      k: "Status",
      v: "Pre-alpha testnet",
      s: "Coming soon on Cardano preprod. Mainnet follows audits and parameter finalization.",
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
    {
      intent: "Ask community questions",
      title: "Discord",
      body: "Non-sensitive questions, community discussion, and early builder coordination.",
      cta: "Join Discord",
      href: OFFICIAL_LINKS.discord,
    },
  ],
} as const;

export const DEVELOPER_COPY = {
  hero: {
    title: "Build fast apps with Cardano-rooted settlement.",
    /** The page's ONE telling of the wallet-action / app-interaction /
        data-availability / fallback sentence (reading-rhythm redesign). */
    lead:
      "Build with familiar UTXO logic for faster execution. The source, contracts, and Cardano settlement path are open to inspect.",
  },
  /** Three concise ways into the developer experience. Each card is a
      complete starting point, rather than a step in a required sequence. */
  paths: [
    {
      title: "Build with Midgard",
      body: "Review the public source and prepare your UTXO app for Cardano preprod.",
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
      title: "Extend the stack",
      body: "Use Midgard's infrastructure for a deeper integration or your own L2.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Discuss the stack",
    },
  ],
  /** The security section content — folded into /learn#security.
      Trust path + fault proofs are one Prose telling; audit status and
      responsible disclosure stand as two emphasized data rows. */
  security: {
    title: "Security.",
    lead: "The trust path is inspectable end to end: fast confirmations up front, fault proofs and independent Watchers behind them, Cardano L1 settlement underneath.",
    prose: [
      "One honest Watcher, out of any number, is enough to catch and stop a bad block. Committed state stays open to challenge for the full window before it settles. Fast confirmations up front never shortcut it.",
      "When a Watcher finds an invalid commitment, it is contested with an on-chain fault proof before it can become settled state. Security is enforced by Cardano L1, not by trusting Operators.",
    ],
    rows: [
      {
        label: "Testnet and audit status",
        body: "The pre-alpha testnet will be live soon on Cardano preprod. Public testnet follows; independent audits are planned ahead of mainnet, and formal-methods work is in progress.",
      },
      {
        label: "Responsible disclosure",
        body: "Found a vulnerability? Report it privately via the intake form. Never post exploits publicly. Midgard will never ask for your seed phrase or private keys.",
        href: OFFICIAL_LINKS.intakeForm,
      },
    ],
  },
} as const;

/* The /economics page was folded into the audience pages (2026-07-11):
   each of /users, /developers, /participate carries its own economics
   section, and this matrix is the single cross-entity comparison view
   rendered on /#economics. Claims rules: estimates stated as
   estimates, no hard parameters, token-silent. */
export const ECONOMICS_MATRIX = {
  title: "Economics, across the network.",
  lead: "What each participant pays and earns. Each audience page has the detail.",
  rows: [
    {
      who: "Users",
      pay: "Fees in ADA, estimated 10 to 30x cheaper than L1.",
      get: "Confirmation in seconds, with settlement back on Cardano.",
      href: "/users#economics",
      cta: "User economics",
    },
    {
      who: "Builders",
      pay: "The same ADA fee model for your users.",
      get: "Faster execution for unchanged UTXO contracts, with public source to verify.",
      href: "/developers#economics",
      cta: "Builder economics",
    },
    {
      who: "Operators",
      pay: "A bond locked on Cardano while sequencing in rotating shifts.",
      get: "Fees from every transaction, deposit, and withdrawal they commit.",
      href: "/participate#economics",
      cta: "Role economics",
    },
    {
      who: "Watchers",
      pay: "Running a node; open to anyone.",
      get: "Target reward: 30–50% of a slashed bond for a valid fault proof.",
      href: "/participate#economics",
      cta: "Role economics",
    },
    {
      who: "Cardano",
      pay: "N/A",
      get: "Fees are paid in ADA, and Midgard state settles on the base layer that secures it.",
      href: "/learn#security",
      cta: "Security model",
    },
  ],
  thesis: {
    kicker: "The difference",
    line: "Most rollups extract value from their base layer. Midgard is built to pay Cardano back.",
  },
  finePrint:
    "Bond, fee, and role-incentive parameters are finalized as testnet data comes in; a full economic breakdown follows once benchmarks are published.",
} as const;
