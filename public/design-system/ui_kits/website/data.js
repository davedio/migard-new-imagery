/* Midgard UI Kit — page content (mirrors the midgard-gateway product copy) */
window.MIDGARD_DATA = {
  /* top nav (src/components/site/SiteNav.tsx) — CTA "Get Started" is rendered separately */
  nav: [
    { label: "Home", key: "home" },
    { label: "How It Works", key: "how-it-works" },
    { label: "Security", key: "security" },
    { label: "Testnet", key: "testnet" },
    { label: "FAQ", key: "faq" },
    { label: "About", key: "about" },
    { label: "Docs", key: "docs" },
  ],

  /* home "Start here" explore grid (src/components/Gateway.tsx → AUDIENCE_PATHS) */
  explore: [
    { n: "01", title: "Using Midgard", key: "get-started",
      line: "Start here if Midgard reaches you through a wallet or app: what changes, what stays Cardano, and what to check before action.",
      cta: "Start as a user" },
    { n: "02", title: "Building or porting", key: "get-started",
      line: "For dApps, DEXs, lending markets, wallets, and protocols: inspect the source, then map the flow that needs L2 capacity.",
      cta: "Open builder path" },
    { n: "03", title: "Operating Midgard", key: "get-started",
      line: "For operators, batchers, and watchers: sequence activity into blocks, then replay and challenge anything invalid before it settles to Cardano L1.",
      cta: "See the protocol roles" },
    { n: "04", title: "Inspecting the mechanism", key: "how-it-works",
      line: "Follow the full route from activity to batch, proof, challenge, settlement, and Cardano L1.",
      cta: "See how it works" },
  ],

  /* six lifecycle layers (How It Works) */
  layers: [
    { n: "01", key: "activity", name: "Activity",
      desc: "Users and applications create activity in the L2 environment." },
    { n: "02", key: "batch", name: "Batch",
      desc: "Activity is organized into batches or state transitions." },
    { n: "03", key: "proof", name: "Proof",
      desc: "The system uses commitments and evidence so the path can be checked." },
    { n: "04", key: "challenge", name: "Challenge",
      desc: "Disputed activity can be contested through the protocol's challenge mechanics." },
    { n: "05", key: "settlement", name: "Settlement",
      desc: "Settlement brings the path back to Cardano L1." },
    { n: "06", key: "l1", name: "Cardano L1",
      desc: "Cardano remains the base layer for the trust story." },
  ],

  /* participant roles (Get Started) */
  roles: [
    { n: "01", title: "Builders", cta: null,
      body: "Bring real application flows that need more throughput and help prove where L2 execution makes Cardano more usable." },
    { n: "02", title: "Operators", cta: "Register interest",
      body: "Sequence and commit blocks in rotating shifts. Operators are part of the throughput path and final parameters should be confirmed from the status surface." },
    { n: "03", title: "Watchers", cta: "Become a Watcher",
      body: "Replay committed blocks, inspect state transitions, and use the challenge path when something invalid is found." },
    { n: "04", title: "Wallets", cta: null,
      body: "Make Midgard feel native to Cardano users: same signing clarity, same ADA context, and status text that explains what is happening." },
    { n: "05", title: "Apps and infrastructure", cta: null,
      body: "Keep users and builders moving with dApp flows, endpoints, indexing, monitoring, reliability surfaces, and clear failure states." },
    { n: "06", title: "Partners", cta: "Join a readiness track",
      body: "The strongest partner enters through function: what you make easier, safer, faster, or more inspectable." },
  ],

  /* canonical official links (src/lib/officialLinks.ts) */
  links: {
    website: "https://midgard-gateway.vercel.app",
    docs: "https://github.com/Anastasia-Labs/midgard",
    github: "https://github.com/Anastasia-Labs/midgard",
    x: "https://x.com/midgardprotocol",
    discord: "https://discord.gg/ZpjgHKWaZx",
    intakeForm: "https://docs.google.com/forms/d/e/1FAIpQLSfqXeRid4e2k_ZkMPf1t-UJYb9xi0nuc9q0jm77Bm8LdDdxAg/viewform",
  },
};
