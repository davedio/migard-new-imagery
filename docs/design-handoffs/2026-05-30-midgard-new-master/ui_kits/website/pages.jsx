/* Midgard UI Kit — interior pages (how-it-works, users, builders, security) + splash */

function Splash({ onEnter }) {
  return (
    <main className="splash">
      <div className="splash__bg" aria-hidden />
      <div className="splash__veil" aria-hidden />
      <div className="splash__content">
        <div className="splash__lock">
          <img src="assets/midgard-icon.png" alt="" />
          <span className="wm">Midgard</span>
        </div>
        <button className="splash__enter" onClick={onEnter}>Enter Midgard</button>
      </div>
    </main>
  );
}

function HowItWorksPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Mechanism"
        title="Trust architecture, not throughput theater."
        sub="Midgard is designed to make Cardano-native L2 activity faster to use and easier to reason about."
        actions={[{ label: "Inspect the layers", to: "how-it-works", variant: "primary" }, { label: "Read docs", to: "docs", variant: "ghost" }]}
      />
      <Section eyebrow="Rollup, not sidechain" title="A rollup keeps Cardano in the trust path.">
        <Prose items={[
          { text: "A sidechain has its own ledger, consensus, and security assumptions. A rollup is different. It processes activity off L1 while publishing commitments, disputes, or settlement-relevant information back to the L1 it depends on." },
          { text: "Midgard is a Cardano-native optimistic rollup. Its trust story runs through Cardano L1 anchoring, challenge mechanics, and settlement. Not through a separate-chain narrative.", variant: "dim" },
        ]} />
      </Section>
      <Section eyebrow="Optimistic rollup" title="Optimistic means fast movement with a dispute path.">
        <Prose items={[
          { text: "In an optimistic rollup, activity can move quickly because the system does not re-prove every transaction up front. Instead, invalid activity can be challenged through the protocol." },
          { text: "That is the tradeoff:", variant: "dim" },
        ]} />
        <Bullets items={["Faster L2 activity.", "Later L1 settlement.", "A challenge path for disputes."]} />
        <Prose items={[{ text: "Midgard turns that into a Cardano-native architecture.", variant: "emph" }]} />
      </Section>
      <Section id="layers" eyebrow="Layer explainer" title="The six layers">
        <Layers items={window.MIDGARD_DATA.layers.map((l) => ({ n: l.n, name: l.name, desc: l.role }))} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Go deeper" title="Go deeper than the headline."
        lead="The architecture is meant to be inspected — in the docs, and on testnet."
        actions={[{ label: "Read docs", to: "docs", variant: "primary" }, { label: "Explore testnet", to: "testnet", variant: "ghost" }]}
      />
    </main>
  );
}

function UsersPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="User path"
        title="Trust comes before action."
        sub="Midgard is designed to make Cardano applications faster and more usable without turning the user experience into a chain-switching maze."
        actions={[{ label: "Start with the basics", to: "users", variant: "primary" }, { label: "Open official links", to: "official-links", variant: "ghost" }]}
      />
      <Section eyebrow="What Midgard is" title="What Midgard is">
        <Prose items={[
          { text: "Midgard is a Cardano-native optimistic rollup. It moves application activity into a higher-throughput L2 environment while anchoring the trust path back to Cardano L1." },
          { text: "In normal language: Midgard is built so Cardano applications can feel better without users and builders leaving Cardano behind.", variant: "dim" },
        ]} />
      </Section>
      <Section eyebrow="Under the surface" title="What happens under the surface">
        <Bullets items={["Applications create activity on L2.", "Activity is batched.", "State commitments anchor back to Cardano.", "Disputed activity can move through challenge mechanics.", "Final settlement returns to Cardano L1."]} />
        <Prose items={[{ text: "Users do not need to become protocol engineers, but the system should still be explainable. That is the standard.", variant: "emph" }]} />
      </Section>
      <Section id="safety" tight>
        <Callout title="Use official links." body="Midgard will never ask for your seed phrase, private key, recovery phrase, password, or wallet-draining approval. Start from official links and ignore unsolicited support messages." />
        <div style={{ marginTop: 22 }}><Actions onNav={onNav} items={[{ label: "Open official links", to: "official-links", variant: "ghost" }]} /></div>
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Start calm" title="Start calm. Stay official."
        lead="If you are new to Midgard, begin with the testnet hub, read the status label, and use the links published there."
        actions={[{ label: "Open testnet hub", to: "testnet", variant: "primary" }, { label: "Read FAQ", to: "faq", variant: "ghost" }]}
      />
    </main>
  );
}

function BuildersPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Builder path"
        title="Build On Midgard."
        sub="Midgard is for Cardano builders who need more throughput without treating migration as the only serious option."
        body="Your users should not have to leave the ecosystem. Your team should not have to rebuild around a foreign stack just to reach a higher-capacity path."
        actions={[{ label: "Read technical docs", to: "docs", variant: "primary" }, { label: "Inspect GitHub", to: "official-links", variant: "ghost" }]}
      />
      <Section eyebrow="Start with inspection" title="Start with inspection.">
        <CardGrid cols={2}>
          <Card num="01" title="Read the architecture" body="Understand the rollup model, state transition path, challenge design, settlement assumptions, and current integration surface." delay={0} />
          <Card num="02" title="Inspect the implementation" body="Review the repository, contracts, SDK, node surfaces, and testnet materials." delay={70} />
          <Card num="03" title="Map your app" body="Identify which flows need throughput, which state must remain on L1, which can move to L2, and where users need the experience to feel seamless." delay={140} />
          <Card num="04" title="Build toward readiness" body="Bring concrete integration questions. Midgard is not looking for passive attention. It needs builders who can test the path." delay={210} />
        </CardGrid>
      </Section>
      <Section eyebrow="Developer continuity" title="Less migration pain. More Cardano leverage.">
        <Prose items={[
          { text: "Midgard is designed to keep Cardano builders in the Cardano mental model: familiar wallets, familiar transaction assumptions, familiar tooling patterns, and a path back to L1 settlement." },
          { text: "Some flows will need careful integration. That is fine. Serious infrastructure is built by making constraints visible and then solving them.", variant: "dim" },
        ]} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Bring the proof" title="Bring the proof with you."
        lead="If you are building on Midgard, do not build from a headline. Build from the architecture, the source, the docs, the testnet behavior, and the constraints you can actually inspect."
        actions={[{ label: "Open docs", to: "docs", variant: "primary" }, { label: "Join builder readiness", to: "testnet", variant: "ghost" }]}
      />
    </main>
  );
}

function SecurityPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Trust posture"
        title="Security starts at the base."
        sub="Midgard's trust path is rooted directly in Cardano Layer 1: formal methods, functional programming, eUTXO-aware design, challenge mechanics, and settlement."
        actions={[{ label: "Explore trust architecture", to: "security", variant: "primary" }, { label: "Read docs", to: "docs", variant: "ghost" }]}
      />
      <Section eyebrow="Trust posture" title="Security should be explained, not performed.">
        <Prose items={[{ text: "Midgard's security story is not a magic word. It is a sequence of mechanisms:" }]} />
        <Bullets items={["Cardano L1 anchoring", "mathematical rigor", "formal-methods engineering culture", "functional programming roots", "eUTXO-aware design", "batch publication", "fraud-proof and challenge paths", "settlement assumptions", "operational readiness"]} />
        <Prose items={[{ text: "The more legible the mechanism, the stronger the brand.", variant: "emph" }]} />
      </Section>
      <Section eyebrow="Cardano L1" title="Cardano stays in the loop.">
        <Prose items={[
          { text: "Midgard is designed so L2 activity does not drift into a detached security model. State transitions and settlement tie back to Cardano L1." },
          { text: "That is why Midgard can be bold without sounding reckless. The system has a path back to the base layer.", variant: "dim" },
        ]} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Trust path" title="Read the path, then test it."
        lead="The trust story is meant to be inspected. Read how it fits together, then watch it behave on testnet."
        actions={[{ label: "How it works", to: "how-it-works", variant: "primary" }, { label: "Explore testnet", to: "testnet", variant: "ghost" }]}
      />
    </main>
  );
}

/* lightweight stub for nav targets we don't fully build (docs, testnet, faq, etc.) */
function StubPage({ pageKey, onNav }) {
  const titles = {
    docs: ["Docs", "Technical documentation"],
    testnet: ["Testnet", "Pre-alpha testnet hub"],
    faq: ["FAQ", "Frequently asked questions"],
    partners: ["Partners", "Partner tracks"],
    "official-links": ["Official Links", "Verified Midgard links"],
  };
  const [t, sub] = titles[pageKey] || ["Page", "Coming soon"];
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Pre-alpha" title={t}
        sub={`${sub}. This surface is a stub in the UI kit — the marketing gateway focuses on the home, users, builders, how-it-works, and security pages.`}
        actions={[{ label: "Back to home", to: "home", variant: "primary" }, { label: "Read how it works", to: "how-it-works", variant: "ghost" }]}
        chips={<React.Fragment><span className="chip chip--testnet"><span className="dot" />Pre-Alpha Testnet</span><span className="chip chip--demo"><span className="dot" />Simulated data</span></React.Fragment>}
      />
    </main>
  );
}

Object.assign(window, { Splash, HowItWorksPage, UsersPage, BuildersPage, SecurityPage, StubPage });
