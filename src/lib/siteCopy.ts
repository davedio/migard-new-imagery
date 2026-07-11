import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    /** Honest state-of-the-network chip shown above the H1 — links to /status.
        "public" deliberately absent: the public-testnet phase is still ahead. */
    status: "Pre-alpha testnet",
    /* Headline + subhead agreed on the 2026-07-10 call (Dave + Harun) —
       replaces "The execution layer for UTXO finance". */
    title: "Scaling UTXO finance",
    /** The H1 line break — kept separate so ShatterHeading can split cleanly. */
    titleLines: ["Scaling", "UTXO finance"],
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
      body: "Run the network and earn for it. Operators sequence blocks for fees; Watchers who catch a bad block earn an estimated 30–50% of the slashed bond.",
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

/** /economics — the one page that tells every audience what they get,
    fast. Reuses established claims only (fees in ADA, L1 settlement,
    formal methods in progress, bonded roles); role rewards quoted as
    estimates per the 2026-07-08 claims ruling. Deeper mechanics stay
    told once elsewhere — this page routes to them rather than
    repeating them. */
export const ECONOMICS_COPY = {
  hero: {
    label: "Economics & Security",
    title: "What you get from Midgard.",
    sub: "Fees are paid in ADA. Security is enforced by Cardano, not by trust. See what using it, building on it, or running it actually gets you.",
    actions: [
      { label: "Register interest", href: OFFICIAL_LINKS.intakeForm, variant: "primary" as const },
      { label: "See how it works", href: "/learn", variant: "ghost" as const },
    ],
  },
  /** The page's one Grid — three parallel audiences, each picking their
      own path. Every card links onward to that audience's deeper page. */
  paths: [
    {
      title: "Users",
      body: "Fees are paid in ADA — nothing new to hold. Transactions confirm in seconds, and every commitment settles back to Cardano underneath.",
      cta: "See the user page",
      href: "/users",
    },
    {
      title: "Builders",
      body: "A fee model denominated in ADA, contracts with public source and formal-methods work in progress, and a security model your users can check for themselves — not take on faith.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Operators & Watchers",
      body: "Bonded roles built for real work: Operators sequence and commit blocks for fees; Watchers earn an estimated 30–50% of a slashed bond for a valid fault proof. Full parameters are finalized during testnet.",
      cta: "See roles & register",
      href: "/participate",
    },
  ],
  /** The page's one Statement — the differentiator, stated once. */
  thesis: {
    kicker: "The difference",
    line: "Most rollups take value from their base layer. Midgard is built to pay Cardano back.",
    sub: "You pay fees in ADA, with nothing new to hold. Every block anchors back to the same base layer securing all of Cardano.",
  },
  /** Prose — the honest, hedged status note. No numbers, no dates. */
  status: {
    kicker: "Where this stands",
    paragraphs: [
      "Midgard is a pre-alpha testnet on Cardano preprod. No real funds — every claim above is checkable against public source and preprod contracts, not just asserted.",
      "Bond, fee, and role-incentive parameters are being finalized as testnet data comes in. A full breakdown of the network's economic design follows once benchmarks and parameters are approved.",
    ],
  },
  /** Rows — the page ends quiet, routing to where each fact is told in full. */
  explore: [
    {
      label: "Operator & Watcher economics",
      body: "Bonds, rewards, and the full roles breakdown.",
      href: "/participate#economics",
    },
    {
      label: "Security model",
      body: "Fault proofs, the trust path, and audit status.",
      href: "/learn#security",
    },
    {
      label: "Protocol terms",
      body: "Short definitions for the words used across these pages.",
      href: "/glossary",
    },
    {
      label: "Questions",
      body: "Common questions about status, security, and roles.",
      href: "/faq",
    },
  ],
} as const;
