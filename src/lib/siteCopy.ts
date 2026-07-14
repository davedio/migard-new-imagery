import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    startCta: { label: "Start here: choose your path", href: "#paths" },
    /* Homepage positioning line. Keep titleLines in sync so the interactive
       heading preserves the intended line break. */
    title: "The scaling layer for UTXO finance.",
    /** The H1 line break — kept separate so ShatterHeading can split cleanly. */
    titleLines: ["The scaling layer", "for UTXO finance."],
    lead:
      "Midgard is an optimistic rollup that helps apps run faster and at a lower cost while keeping settlement and security anchored on Cardano.",
    primaryCta: { label: "See how it works", href: "/learn" },
    secondaryCta: { label: "Start building", href: "/developers" },
    tertiaryCta: { label: "Participate", href: "/participate" },
  },
  /** The proof strip under the hero lead — visitor-facing numbers, not KPIs.
      Forward-looking figures say "estimated" once and state the claim plainly. */
  stats: [
    { k: "Confirmations", v: "Seconds", s: "estimated, not minutes" },
    { k: "Fees", v: "In ADA", s: "a fraction of L1, estimated" },
    { k: "Security", v: "Cardano", s: "every block settles on the base layer" },
    { k: "Contracts", v: "Open source", s: "formal methods in progress, on preprod today" },
  ],
  /** The home "Choose your path" cards — verb-led per the 2026-07-03 call
      (use / build / participate), with the earn hook stated as an estimate. */
  paths: [
    {
      title: "Use",
      body: "Deposit, transact, withdraw. Use apps with confirmation in seconds while final settlement completes on Cardano after verification.",
      cta: "See the user path",
      href: "/users",
    },
    {
      title: "Build",
      body: "Same transaction logic, new speed. Your validators, tests, and tooling carry over — switching is close to one endpoint change.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Participate",
      body: "Run the network and earn for it. Operators sequence blocks for fees; Watchers who catch a bad block earn a share of the slashed bond.",
      cta: "Explore protocol roles",
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
    lead: "You never touch the lifecycle directly. Deposit once, transact as much as you like, and withdraw when you're done. Midgard runs everything else underneath.",
    resolved: {
      kicker: "Why that's safe",
      title: "You don't have to watch the pipeline — Watchers do it for you.",
      body: "Operators sequence and commit your activity in seconds — that's the speed you feel. Every commitment stays open to challenge while its data is public. One honest Watcher, out of any number, is enough to stop a bad block before it settles; after that, state settles through Cardano's own L1 consensus.",
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
      k: "Smart contracts",
      v: "Open source",
      s: "Public source with formal-methods work in progress, so security claims can be checked, not just asserted.",
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
      s: "Live on a pre-alpha testnet on Cardano preprod today. Mainnet follows audits and parameter finalization.",
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
    /** The page's ONE telling of the wallet-action / app-interaction /
        data-availability / fallback sentence (reading-rhythm redesign). */
    lead:
      "Start with the source, inspect the contract path, then map one UTXO flow to Midgard: wallet action, app interaction, data availability, fallback.",
  },
  /** The page's SINGLE telling of the source → contracts → app flow →
      trust path sequence, rendered as the horizontal IntegrationSteps
      stepper above the track grid. */
  integrationPath: [
    {
      title: "Source",
      body: "Clone the node and the contract implementation — the code you integrate against is the code you can read.",
      tone: "green",
    },
    {
      title: "Contracts",
      body: "Confirm the preprod topology, validator addresses, and state anchors below against a public explorer.",
      tone: "green",
    },
    {
      title: "App flow",
      body: "Prototype the flow end to end against the bridge and State Queue validators — deposit in, transact, withdraw out.",
      tone: "gold",
    },
    {
      title: "Trust path",
      body: "Before you rely on the flow, check what protects it: fault proofs, independent Watchers, Cardano L1 settlement.",
      tone: "cobalt",
    },
  ],
  tracks: [
    {
      title: "Application builders",
      body: "Map one UTXO app flow to Midgard: wallet action, contract path, data availability, fallback.",
      href: "/developers#query",
      cta: "Run the first query",
    },
    {
      title: "Protocol reviewers",
      body: "Audit the deployment itself: seven validator addresses, six reference-script hashes, and the genesis history are published below with explorer links.",
      href: "/developers#contracts",
      cta: "Inspect contracts",
    },
    {
      title: "Protocol Roles",
      body: "Run the network instead of building on it: Operators post a bond and produce blocks, Watchers replay commitments and file fault proofs. Register interest for the current testnet phase.",
      href: "/participate",
      cta: "Open Participate",
    },
    {
      title: "Midgard Stack",
      body: "Deploy the same machinery as your own L2 — custom deployments, reusable infrastructure, and deeper partner integrations once the base protocol path is clear.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Discuss stack path",
    },
  ],
  /** The security section content — folded into /learn#security.
      Trust path + fault proofs are one Prose telling; audit status and
      responsible disclosure stand as two emphasized data rows. */
  security: {
    title: "Security.",
    lead: "The trust path is inspectable end to end: fast confirmations up front, fault proofs and independent Watchers behind them, Cardano L1 settlement underneath.",
    prose: [
      "One honest Watcher, out of any number, is enough to catch and stop a bad block. Committed state stays open to challenge for the full window before it settles — fast confirmations up front never shortcut it.",
      "When a Watcher finds an invalid commitment, it is contested with an on-chain fault proof before it can become settled state. Security is enforced by Cardano L1, not by trusting Operators.",
    ],
    rows: [
      {
        label: "Audit status",
        body: "Open-source contracts with formal-methods work in progress, live on preprod. Independent audits are planned ahead of mainnet.",
      },
      {
        label: "Responsible disclosure",
        body: "Found a vulnerability? Report it privately via the intake form with evidence preserved — never post exploits publicly. Midgard will never ask for your seed phrase or private keys.",
        href: OFFICIAL_LINKS.intakeForm,
      },
    ],
  },
} as const;

/* The /economics page was folded into the audience pages (2026-07-11):
   each of /users, /developers, /participate carries its own economics
   section, and this matrix is the single cross-entity comparison view
   rendered on /learn#economics. Claims rules: estimates stated as
   estimates, no hard parameters, token-silent. */
export const ECONOMICS_MATRIX = {
  title: "Economics, across the network.",
  lead: "One view of what every participant pays and earns. Each audience page tells its own side in full.",
  rows: [
    {
      who: "Users",
      pay: "Fees in ADA — a fraction of L1 cost, estimated. Nothing new to hold.",
      get: "Confirmation in seconds (estimated), with settlement back on Cardano.",
      href: "/users#economics",
      cta: "User economics",
    },
    {
      who: "Builders",
      pay: "The same ADA fee model your users already pay — no separate asset to integrate.",
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
      pay: "Node runtime — anyone can run one.",
      get: "An estimated 30–50% of a slashed bond for a valid fault proof.",
      href: "/participate#economics",
      cta: "Role economics",
    },
    {
      who: "Cardano",
      pay: "—",
      get: "Every Midgard fee settles in ADA on the base layer that secures it.",
      href: "/learn#security",
      cta: "Security model",
    },
  ],
  thesis: {
    kicker: "The difference",
    line: "Most rollups take value from their base layer. Midgard is built to pay Cardano back.",
  },
  finePrint:
    "Bond, fee, and role-incentive parameters are finalized as testnet data comes in; a full economic breakdown follows once benchmarks are approved.",
} as const;
