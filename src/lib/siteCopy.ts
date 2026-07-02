import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    /** Honest state-of-the-network chip shown above the H1. */
    status: "Pre-alpha public testnet",
    title: "Built for speed. Settled on Cardano.",
    /** The H1 line break — kept separate so ShatterHeading can split cleanly. */
    titleLines: ["Built for speed.", "Settled on Cardano."],
    lead:
      "Midgard is an optimistic rollup for Cardano: transactions confirm in seconds, fees stay in plain ADA, and every block settles back to Cardano L1.",
    primaryCta: { label: "See how it works", href: "/how-it-works" },
    secondaryCta: { label: "Start building", href: "/developers" },
    tertiaryCta: { label: "Choose your path", href: "#paths" },
  },
  /** The proof strip under the hero lead — visitor-facing numbers, not KPIs.
      Forward-looking figures say "estimated" once and state the claim plainly. */
  stats: [
    { k: "Confirmations", v: "Seconds", s: "estimated, not minutes" },
    { k: "Fees", v: "Plain ADA", s: "a fraction of L1, estimated" },
    { k: "Security", v: "Cardano L1", s: "every block settles on the base layer" },
    { k: "Contracts", v: "Formally verified", s: "public source, on preprod today" },
  ],
  paths: [
    {
      title: "Users",
      body: "Deposit, transact, withdraw. Use the app while final settlement completes after verification.",
      cta: "Learn the user path",
      href: "/how-it-works",
    },
    {
      title: "Builders",
      body: "Map one UTXO app flow to Midgard: wallet action, contract path, data availability, fallback.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Protocol Roles",
      body: "Run Operator or Watcher nodes to verify commitments, challenge invalid state, and help secure the path to Cardano L1 settlement.",
      cta: "Explore Protocol Roles",
      href: "/participate",
    },
  ],
  partnersIntro:
    "Teams across the Cardano ecosystem building with Midgard, integrating it, or supporting the network.",
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
    lead: "Deposit. Transact. Withdraw. Everything else is the pipeline working underneath.",
    resolved: {
      kicker: "Why that's safe",
      title: "You don't have to watch the pipeline. It watches itself.",
      body: "Operators sequence and commit your activity in seconds — that's the speed you feel. Every commitment stays open to challenge during data availability, and it only takes one honest Watcher, out of any number, to catch and stop a bad block before it settles. If no valid fault proof succeeds, state settles through Cardano's own L1 consensus.",
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
        detail: "Final settlement lands on the same base layer securing all of Cardano.",
      },
    ],
  },
  proofPoints: [
    {
      k: "Soft confirmations",
      v: "Seconds",
      s: "Your transaction is usable in seconds (estimated), while final settlement completes behind it.",
    },
    {
      k: "Settlement security",
      v: "Cardano L1",
      s: "Verified state settles on the same base layer that secures all of Cardano.",
    },
    {
      k: "Execution model",
      v: "UTXO-native",
      s: "Applications keep their UTXO design and gain faster execution — no EVM translation layer.",
    },
    {
      k: "Verified smart contracts",
      v: "Formal methods",
      s: "Contracts ship with formal verification and public source, so security claims are checkable mathematics, not marketing.",
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
      s: "Live on a public pre-alpha testnet today. Mainnet follows audits and parameter finalization.",
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
      body: "Builders, Protocol Roles, infrastructure partners, and testnet participation.",
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
    title: "Build fast apps that settle on Cardano.",
    lead:
      "Start with the source, inspect the contract path, then map one UTXO flow to Midgard: wallet action, app interaction, data availability, fallback.",
  },
  entryPoints: [
    {
      label: "Contracts",
      detail: "Addresses, topology, state anchors",
      href: "/developers#contracts",
    },
    {
      label: "Security",
      detail: "Trust path, disclosure, audit status",
      href: "/developers#security",
    },
    {
      label: "GitHub",
      detail: "Source, docs, contracts, node code",
      href: OFFICIAL_LINKS.github,
    },
  ],
  tracks: [
    {
      title: "Application builders",
      body: "Map a real UTXO flow to Midgard: wallet action, dApp interaction, indexer need, and fallback path.",
      href: OFFICIAL_LINKS.github,
      cta: "Open GitHub",
    },
    {
      title: "Protocol reviewers",
      body: "Review validator topology, state anchors, reference scripts, and preprod deployment history before relying on the contract path.",
      href: "/developers#contracts",
      cta: "Inspect contracts",
    },
    {
      title: "Protocol Roles",
      body: "Run Operator or Watcher nodes to verify commitments, challenge invalid state, and help secure the path to Cardano L1 settlement. Register interest when the current testnet phase matches your role.",
      href: "/participate",
      cta: "Open Participate",
    },
    {
      title: "Midgard Stack",
      body: "Explore custom deployments, reusable L2 infrastructure, and deeper partner integrations after the base protocol path is clear.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Discuss stack path",
    },
  ],
  /** The security section content — folded into /developers#security. */
  security: {
    title: "Security.",
    lead: "The trust path is inspectable end to end: fast confirmations up front, fault proofs and independent Watchers behind them, Cardano L1 settlement underneath.",
    cards: [
      {
        title: "Trust path",
        body: "One honest Watcher, out of any number, is enough to catch and stop a bad block. Committed state stays open to challenge for the full challenge window before it settles.",
      },
      {
        title: "Fault proofs",
        body: "Invalid state is contested with an on-chain fault proof before it becomes settled state — security is enforced by Cardano L1, not by trusting Operators.",
      },
      {
        title: "Audit status",
        body: "Formally verified contracts with public source, live on preprod. Independent audits are planned ahead of mainnet.",
      },
      {
        title: "Responsible disclosure",
        body: "Found a vulnerability? Report it privately with evidence preserved — never post exploits publicly. Midgard will never ask for your seed phrase or private keys.",
        cta: "Contact via intake form",
        href: OFFICIAL_LINKS.intakeForm,
      },
    ],
  },
} as const;
