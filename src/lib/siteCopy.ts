import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    title: "The execution layer for eUTXO finance",
    lead:
      "Midgard lets eUTXO apps execute faster without making users trade away security: mathematically verified contracts, fault-proof checks, and final L1 settlement.",
    primaryCta: { label: "Find your path", href: "#paths" },
    secondaryCta: { label: "See how it works", href: "/how-it-works" },
  },
  paths: [
    {
      title: "Users",
      body: "Deposit assets, transact faster, and withdraw through the L1 settlement path.",
      cta: "Start as a user",
      href: "/learn#roles",
    },
    {
      title: "Builders",
      body: "Build apps that need faster execution without leaving the eUTXO model.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Protocol Roles",
      body: "Operators sequence transactions. Watchers replay commitments and challenge invalid state, so faster execution stays verifiable.",
      cta: "Explore protocol roles",
      href: "/developers#developer-paths",
    },
  ],
  lifecycle: [
    ["Submit", "A user sends a transaction to Midgard."],
    ["Sequence", "An operator orders valid transactions into an L2 block."],
    ["Commit", "Compact state is posted to the L1 settlement path."],
    ["Make data checkable", "The data behind each commitment stays available for review."],
    ["Watch", "Watchers replay state and use the fault-proof path if needed."],
    ["Settle", "Verified state reaches final L1 settlement."],
  ],
  proofPoints: [
    {
      k: "Soft confirmations",
      v: "Seconds",
      s: "Track the time from submitted activity to usable pre-settlement confirmation.",
    },
    {
      k: "Settlement security",
      v: "L1 finality",
      s: "Track when verified state reaches the final settlement path.",
    },
    {
      k: "Execution model",
      v: "eUTXO-native",
      s: "Track how well applications preserve eUTXO design while gaining faster execution.",
    },
    {
      k: "Verified contracts",
      v: "Formal methods",
      s: "Track which core contracts have completed mathematical verification.",
    },
    {
      k: "Fault-proof coverage",
      v: "Contestable state",
      s: "Track the commitments that independent Watchers can replay and challenge.",
    },
    {
      k: "Status",
      v: "Pre-alpha",
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
      body: "Builders, Protocol Roles, infrastructure partners, and testnet participation. Operators sequence activity; Watchers replay and challenge state.",
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
    title: "Build on Midgard.",
    lead:
      "Start with source code, contracts, security, or Protocol Roles. Then map your app flow to the protocol path.",
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
      label: "Whitepaper",
      detail: "Protocol design notes",
      href: OFFICIAL_LINKS.whitepaper,
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
      body: "Use Midgard when an eUTXO application needs faster execution, familiar wallet flows, and a settlement path users can inspect.",
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
      body: "Operators sequence activity. Watchers replay commitments and challenge invalid state. Participation details should follow approved testnet status.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Register interest",
    },
  ],
} as const;
