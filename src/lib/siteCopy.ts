import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    title: "The execution layer for UTXO finance",
    lead:
      "Midgard gives UTXO applications faster execution, then settles verified state through Cardano L1. The trust path is public: committed state, data availability, Watcher replay, fault proofs, and Cardano L1 settlement.",
    primaryCta: { label: "Choose your path", href: "#paths" },
    secondaryCta: { label: "See how it works", href: "/how-it-works" },
  },
  paths: [
    {
      title: "Users",
      body: "Deposit, transact, withdraw. Use the app while final settlement completes after verification.",
      cta: "Learn user path",
      href: "/learn#roles",
    },
    {
      title: "Builders",
      body: "Map one UTXO app flow to Midgard: wallet action, contract path, data availability, fallback.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Protocol Roles",
      body: "Participate in the Midgard network. Run Operator or Watcher nodes to verify commitments, challenge invalid state, and help secure the path to Cardano L1 settlement.",
      cta: "Explore Protocol Roles",
      href: "/developers#developer-paths",
    },
  ],
  lifecycle: [
    ["Submit", "A user submits a transaction to Midgard, usually through an app or wallet."],
    ["Sequence", "An operator orders valid transactions into an L2 block."],
    ["Commit", "The operator posts a compact block header to the Cardano L1 settlement path."],
    ["Data availability", "Block data is published so Watchers and builders can inspect the commitment."],
    ["Watch", "Watchers replay committed blocks; a valid fault proof keeps bad state from settling."],
    ["Settle", "If no valid fault proof succeeds, verified state settles through Cardano L1."],
  ],
  proofPoints: [
    {
      k: "Soft confirmations",
      v: "Seconds",
      s: "Track the time from submitted activity to usable pre-settlement confirmation.",
    },
    {
      k: "Settlement security",
      v: "Cardano L1",
      s: "Track when verified state reaches the Cardano L1 settlement path.",
    },
    {
      k: "Execution model",
      v: "UTXO-native",
      s: "Track how well applications preserve UTXO design while gaining faster execution.",
    },
    {
      k: "Verified contracts",
      v: "Formal methods",
      s: "Track which core contracts have completed mathematical verification.",
    },
    {
      k: "Watcher coverage",
      v: "Contestable state",
      s: "Track the commitments that independent Watchers can replay and challenge.",
    },
    {
      k: "Status",
      v: "Pre-alpha testnet",
      s: "Public claims stay tied to live code, measured results, and approved parameters.",
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
    title: "Build on the execution layer for UTXO finance.",
    lead:
      "Start with the source, inspect the contract path, then map one UTXO flow to Midgard: wallet action, app interaction, data availability, fallback.",
  },
  entryPoints: [
    {
      label: "GitHub",
      detail: "Source, contracts, node code",
      href: OFFICIAL_LINKS.github,
    },
    {
      label: "Contracts",
      detail: "Addresses, topology, state anchors",
      href: "/contracts",
    },
    {
      label: "Security",
      detail: "Trust path and assumptions",
      href: "/security",
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
      href: "/contracts",
      cta: "Inspect contracts",
    },
    {
      title: "Protocol Roles",
      body: "Participate in the Midgard network. Run Operator or Watcher nodes to verify commitments, challenge invalid state, and help secure the path to Cardano L1 settlement. Register interest when the current testnet phase matches your role.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Register interest",
    },
    {
      title: "Midgard Stack",
      body: "Explore custom deployments, reusable L2 infrastructure, and deeper partner integrations after the base protocol path is clear.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Discuss stack path",
    },
  ],
} as const;
