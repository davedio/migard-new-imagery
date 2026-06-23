import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const SITE_COPY = {
  hero: {
    title: "The secure scaling layer for UTXO finance",
    lead:
      "Midgard gives UTXO applications faster execution while verified state settles with L1 security through mathematically verified smart contracts and fault-proof checks.",
    primaryCta: { label: "Choose your path", href: "#paths" },
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
      body: "Build UTXO applications that need faster execution without leaving the UTXO model.",
      cta: "Start building",
      href: "/developers",
    },
    {
      title: "Protocol Roles",
      body: "Operators & Watchers keep Midgard running and verifiable. Operators sequence transactions; Watchers replay commitments and challenge invalid state.",
      cta: "Explore protocol roles",
      href: "/developers#developer-paths",
    },
  ],
  lifecycle: [
    ["Submit", "A user sends a transaction to Midgard."],
    ["Sequence", "An operator orders valid activity into an L2 block."],
    ["Commit", "Compact state is posted to the L1 settlement path."],
    ["Data availability check", "Availability is checked so commitments can be inspected."],
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
      v: "UTXO-native",
      s: "Track how well applications preserve UTXO design while gaining faster execution.",
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
      title: "GitHub",
      body: "Source, contracts, node code, and implementation details.",
      href: OFFICIAL_LINKS.github,
    },
    {
      title: "Security policy",
      body: "Use this route for vulnerabilities, impersonation, and security-sensitive reports.",
      href: OFFICIAL_LINKS.securityPolicy,
    },
    {
      title: "Discord",
      body: "Use this route for non-sensitive community questions and early builder discussion.",
      href: OFFICIAL_LINKS.discord,
    },
    {
      title: "Intake form",
      body: "Use this route for builders, operators, Watchers, infrastructure, and testnet participation.",
      href: OFFICIAL_LINKS.intakeForm,
    },
  ],
} as const;

export const DEVELOPER_COPY = {
  hero: {
    title: "Build on Midgard.",
    lead:
      "Start with the source, inspect the contracts, and use the transaction path to decide where your application plugs in.",
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
      body: "Use Midgard when a UTXO application needs faster execution, familiar wallet flows, and a settlement path users can inspect.",
      href: OFFICIAL_LINKS.github,
      cta: "Open GitHub",
    },
    {
      title: "Protocol reviewers",
      body: "Review the validator topology, state anchors, reference scripts, and preprod deployment history.",
      href: "/contracts",
      cta: "Inspect contracts",
    },
    {
      title: "Protocol Roles",
      body: "Operators and Watchers keep the system live and checkable. Participation details should follow approved testnet status.",
      href: OFFICIAL_LINKS.intakeForm,
      cta: "Register interest",
    },
  ],
} as const;
