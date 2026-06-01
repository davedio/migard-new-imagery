/* Midgard UI Kit — interior pages (ports of src/app/(site)/*) + splash */

const L = () => window.MIDGARD_DATA.links;

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

/* ---- How It Works ---- */
function HowItWorksPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="How it works"
        title="One trust path, end to end."
        sub="Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back through Cardano L1."
        actions={[{ label: "Get Started", to: "get-started", variant: "primary" }, { label: "Security", to: "security", variant: "ghost" }]}
      />
      <Section id="layers" eyebrow="Layer explainer" title="Five lifecycle steps, one trust path."
        lead="The lifecycle is the moving system. The layer rows below show the underlying architecture Midgard keeps inspectable.">
        <Layers items={window.MIDGARD_DATA.layers} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Go deeper" title="Go deeper than the headline."
        lead="Midgard's architecture is meant to be inspected in source, docs, status surfaces, and the security path."
        actions={[{ label: "Get Started", to: "get-started", variant: "primary" }, { label: "Security", to: "security", variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- About ---- */
function AboutPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="About"
        title="Scale Cardano without making it less Cardano."
        sub="Midgard is a Cardano-native optimistic rollup from Anastasia Labs, built so Cardano can scale while keeping the model, tooling, and rigor that made it Cardano."
        actions={[{ label: "Read how it works", to: "how-it-works", variant: "primary" }, { label: "Explore docs ↗", external: L().docs, variant: "ghost" }]}
      />
      <Section eyebrow="The thesis" title="Throughput, with correctness intact.">
        <Prose items={[
          { text: "The usual way to scale a chain is to leave it: move to a faster network, accept a weaker or less familiar security model, learn a foreign stack, and fragment liquidity on the way out." },
          { text: "Midgard takes the harder route. Applications run at Layer 2 speed in a Cardano-native environment, and the trust path settles back to Cardano L1.", variant: "emph" },
          { text: "Scale is the goal. Correctness is the constraint that does not move.", variant: "dim" },
        ]} />
      </Section>
      <Section eyebrow="Who builds it" title="Built by Anastasia Labs.">
        <Prose items={[
          { text: "Midgard comes from Anastasia Labs, a team building Cardano infrastructure and open-source tooling for serious on-chain systems." },
          { text: "The protocol is open, the implementation can be inspected, and the status surface should make what is live, planned, and simulated clear.", variant: "dim" },
        ]} />
        <Actions onNav={onNav} items={[{ label: "View GitHub", external: L().github, variant: "ghost" }]} />
      </Section>
      <Section eyebrow="Where we are" title="Live on testnet surfaces, not mainnet promises.">
        <CardGrid cols={2}>
          <Card title="Pre-alpha testnet" body="The preview should keep pre-alpha and testnet status visible, especially where simulated data or pending status surfaces are involved." />
          <Card title="Public status path" body="The status page is the right place for contracts, deployment history, supported flows, and current caveats." cta="View status" />
        </CardGrid>
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="In short" title="Not just speed. A trust path you can check."
        lead="Midgard is L2 execution, challengeable invalid state, and settlement back to Cardano L1 — fast where it can be, final where it must be."
        actions={[{ label: "How it works", to: "how-it-works", variant: "primary" }, { label: "Get Started", to: "get-started", variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- Get Started ---- */
function GetStartedPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Get Started"
        title="Get Started"
        sub="Build, operate, watch, integrate, support, or test the Cardano-native L2 path. Start with source, status, and a clear role."
        actions={[{ label: "Register interest", external: L().intakeForm, variant: "primary" }, { label: "Read the docs", external: L().docs, variant: "ghost" }]}
      />
      <Section eyebrow="Where to start" title="One concrete builder sequence.">
        <CardGrid cols={2}>
          <Card num="01" title="Read the architecture" body="Review the rollup model, state queue, settlement path, and challenge mechanics before you ship a user flow." cta="Read docs" delay={0} />
          <Card num="02" title="Inspect the implementation" body="Use the repository to inspect contracts, SDK surfaces, node code, and testnet-facing materials." cta="View GitHub" delay={70} />
          <Card num="03" title="Check the status" body="Use the testnet status page for what is live now, what is simulated in the preview, and what still needs final confirmation." cta="View status" delay={140} />
          <Card num="04" title="Bring concrete questions" body="The best feedback names a flow, a constraint, a wallet state, or a fallback path that needs to work." cta="Register interest" delay={210} />
        </CardGrid>
      </Section>
      <Section id="roles" eyebrow="Roles" title="Find the role you can fill.">
        <CardGrid>
          {window.MIDGARD_DATA.roles.map((r, i) => (
            <Card key={r.title} num={r.n} title={r.title} body={r.body} cta={r.cta || undefined} delay={i * 60} />
          ))}
        </CardGrid>
      </Section>
      <Section eyebrow="Integration" title="Map the flows before users touch them.">
        <Layers items={[
          { n: "01", name: "Throughput flow", desc: "Decide which application actions should execute through Midgard and which should remain directly on L1." },
          { n: "02", name: "Wallet path", desc: "Define signing, status, fallback, and support states before users touch a live flow." },
          { n: "03", name: "Settlement path", desc: "Separate fast soft confirmation from later L1 settlement in the user interface and product logic." },
          { n: "04", name: "Error path", desc: "Make failed, challenged, delayed, or unsupported states legible instead of hiding them in vague status text." },
        ]} />
      </Section>
      <Section id="users" eyebrow="For users" title="Faster Cardano apps. Same wallet. Same ADA.">
        <Prose items={[
          { text: "For most people, Midgard should feel like Cardano getting faster: the same wallet, the same ADA, lower-friction application use, and the same L1 trust anchor underneath." },
          { text: "The user job is simple: start from official links, read the status, and do not sign anything you do not understand.", variant: "dim" },
        ]} />
      </Section>
      <Section eyebrow="Stay safe" title="Use official links." tight>
        <Callout title="Midgard will never ask for private wallet secrets."
          body="Do not share your seed phrase, private key, recovery phrase, password, or wallet-draining approval. Ignore unsolicited support messages and start from official links." />
        <div style={{ marginTop: 22 }}><Actions onNav={onNav} items={[{ label: "Open official links", to: "official-links", variant: "ghost" }]} /></div>
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Get Started" title="Bring a role, not just attention."
        lead="Tell us where you plug in: building, operating, watching, integrating, monitoring, educating, or making the user path safer."
        actions={[{ label: "Register interest", external: L().intakeForm, variant: "primary" }, { label: "Join Discord", external: L().discord, variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- Security ---- */
function SecurityPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Security"
        title="Secured by Cardano. Provable by anyone."
        sub="Midgard's trust rests on Cardano Layer 1 and a set of mechanisms the public surface should make inspectable."
        actions={[{ label: "Get Started", to: "get-started", variant: "primary" }, { label: "Read docs", external: L().docs, variant: "ghost" }]}
      />
      <Section eyebrow="Anchored to Cardano L1" title="The trust path returns to the base layer.">
        <Prose items={[
          { text: "Midgard is designed to anchor L2 state transitions to Cardano L1 and use Cardano smart contracts for verification." },
          { text: "That means the security story should be explained as a mechanism: commitments, challenge paths, settlement assumptions, and the base-layer contracts that make invalid state contestable.", variant: "dim" },
        ]} />
      </Section>
      <Section id="guarantees" eyebrow="Guarantees" title="Four guarantees to inspect.">
        <Layers items={[
          { n: "01", name: "Finality", desc: "Midgard separates fast soft confirmation from later L1-anchored settlement after the challenge or maturity period." },
          { n: "02", name: "Censorship resistance", desc: "The protocol design uses L1 deadlines and challenge surfaces so ordering and inclusion rules can be enforced instead of merely promised." },
          { n: "03", name: "Liveness", desc: "Midgard is designed with L1-enforced escape and recovery paths, with public failure modes still needing careful status copy." },
          { n: "04", name: "L1 anchoring", desc: "State transitions are designed to route through Cardano L1 verification and settlement surfaces." },
        ]} />
      </Section>
      <Section eyebrow="Watchers" title="The network should pay attention to itself.">
        <Prose items={[
          { text: "Every committed block should be inspectable. Watchers replay transactions against the public state and use the fraud-proof path when an operator submits invalid state." },
          { text: "Midgard's eUTXO-localized design is intended to make fraud proofs more targeted than global account-state replay, but public cost and operations claims should stay qualified until benchmarked.", variant: "dim" },
        ]} />
        <Actions onNav={onNav} items={[{ label: "Become a Watcher", external: L().intakeForm, variant: "ghost" }]} />
      </Section>
      <Section id="security-contact" eyebrow="Disclosure" title="Security reporting belongs in the open path." tight>
        <Callout title="Responsible disclosure route pending."
          body="As Midgard matures, security review, monitoring, and a responsible-disclosure route should become part of the public trust surface. For now, start from official links and preserve evidence." />
        <div style={{ marginTop: 22 }}><Actions onNav={onNav} items={[{ label: "Open official links", to: "official-links", variant: "ghost" }]} /></div>
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Trust path" title="Trust is something the page should let you check."
        lead="Read the mechanism, inspect the source, and use the testnet status surface to separate live, simulated, and pending claims."
        actions={[{ label: "Get Started", to: "get-started", variant: "primary" }, { label: "View status", to: "testnet", variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- Testnet (with live network widget) ---- */
function NetworkStatusWidget({ snap }) {
  const time = new Date(snap.updatedAt).toLocaleTimeString("en-US");
  return (
    <div className="panel" style={{ marginTop: 28, padding: "14px 16px", display: "grid", gap: 8, maxWidth: 340 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span className="chip chip--live"><span className="dot" />Live L1 · sim L2</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>{time}</span>
      </div>
      <MetricRow k="L1 block" v={`#${fmt(snap.l1.blockHeight)}`} />
      <MetricRow k="Batch queue" v={`${fmt(snap.l2.batchQueueDepth)} ops`} />
      <MetricRow k="Proof" v={snap.l2.latestProofStatus.toUpperCase()} />
    </div>
  );
}

function TestnetPage({ snap, onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Testnet status"
        title="Midgard on Cardano preprod."
        sub="Midgard is a pre-alpha testnet. The protocol status surface is where builders inspect what is deployed, what is simulated, and what still needs confirmation."
        chips={<React.Fragment>
          <span className="chip chip--testnet"><span className="dot" />Pre-alpha testnet</span>
          <span className="chip chip--demo"><span className="dot" />Demo L2 activity; live data source pending</span>
        </React.Fragment>}
        actions={[{ label: "What is live", to: "testnet", variant: "primary" }, { label: "Get Started", to: "get-started", variant: "ghost" }]}
      />
      <Section id="whats-live" eyebrow="What is live" title="Deployed and verifiable surfaces.">
        <Prose items={[
          { text: "The public status path should show preprod contract deployment information, source references, deployment history, and a clear label for any activity that is simulated in this preview." },
          { text: "Some activity shown in the website prototype is simulated and connects to live data at launch; the contract and deployment surfaces should be checked against the latest status source before public amplification.", variant: "dim" },
        ]} />
        {snap ? <NetworkStatusWidget snap={snap} /> : null}
      </Section>
      <Section id="contracts" eyebrow="Contracts" title="Inspect the contract path.">
        <CardGrid>
          <Card title="Protocol contracts" body="Use the status surface to inspect the current preprod contract addresses and understand which validators each address represents." delay={0} />
          <Card title="State anchors" body="State anchors should show the current public handles for committed blocks, confirmed state, and settlement-relevant surfaces." delay={60} />
          <Card title="Source" body="The repository is where builders inspect implementation progress, SDK surfaces, node behavior, and proof machinery." cta="Explore on GitHub" delay={120} />
          <Card title="Deployment history" body="The deployment history should make the path from genesis to first settlement legible and refreshable." delay={180} />
          <Card title="Live node view" body="A node view can show soft confirmations and block sealing, but the page must label simulated versus live data clearly." delay={240} />
          <Card title="Contract caveats" body="Counts, addresses, and parameter values should be refreshed before press, investor, or policy use." delay={300} />
        </CardGrid>
      </Section>
      <Section eyebrow="Proof queue" title="What should become visible next">
        <Bullets items={["Clear docs path.", "Contracts and deployment surfaces.", "Builder quickstart.", "Wallet and dApp integration tracks.", "Activity and settlement dashboards.", "Security reporting route.", "Support route.", "Post-testnet proof report."]} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Testnet" title="Start from the official path."
        lead="Use the status surfaces published on official links, and bring concrete feedback."
        actions={[{ label: "Get Started", to: "get-started", variant: "primary" }, { label: "Join Discord", external: L().discord, variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- FAQ ---- */
function FaqPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="FAQ"
        title="Questions, answered plainly."
        sub="Common questions about what Midgard is, how it works, ADA fees, builders, participant roles, security, and testnet status."
        actions={[{ label: "Read how it works", to: "how-it-works", variant: "primary" }, { label: "Open official links", to: "official-links", variant: "ghost" }]}
      />
      <Section>
        <Faq groups={[
          { title: "Product status", items: [
            { q: "What is Midgard?", a: "Midgard is a Cardano-native optimistic rollup. It gives Cardano applications a higher-throughput L2 path while keeping Cardano L1 in the trust and settlement story." },
            { q: "Why does Midgard matter?", a: "Because promising Cardano applications should not have to leave Cardano when they need more capacity. Midgard gives builders a path to scale while staying aligned with Cardano's architecture, tooling, and ADA-based economics." },
            { q: "How are fees paid?", a: "Fees are paid in ADA." },
            { q: "Is Midgard a sidechain?", a: "No. Midgard is positioned as a rollup path: L2 execution with commitments, challenge mechanics, and settlement tied back to Cardano L1." },
            { q: "What does optimistic rollup mean?", a: "It means activity can move quickly on L2, while disputed activity can be challenged through the protocol and settlement returns to Cardano L1." },
          ] },
          { title: "Builders", items: [
            { q: "Can existing Cardano apps use Midgard?", a: "Midgard is designed to preserve Cardano-native development patterns where possible. The goal is to reduce migration burden and keep builders in the Cardano mental model." },
            { q: "Where should builders start?", a: "Start with the Get Started page, source repository, docs, testnet status, and builder readiness path." },
            { q: "What should builders inspect first?", a: "Inspect the architecture, supported flows, wallet assumptions, state movement, settlement path, and user experience before building public flows." },
          ] },
          { title: "Wallets and partners", items: [
            { q: "Why do wallets matter?", a: "Wallets can make Midgard feel natural. The strongest user experience is one where Midgard feels like a Cardano path, not a foreign network." },
            { q: "Can my wallet, dApp, or infrastructure project integrate?", a: "Yes. Midgard needs serious wallets, dApps, infrastructure providers, analytics teams, security contributors, operators, and Watchers." },
            { q: "What makes a good partner?", a: "A good partner makes Midgard easier to use, easier to inspect, safer to operate, or more useful for real applications." },
          ] },
          { title: "Security and support", items: [
            { q: "What is the security story?", a: "Midgard's trust story is built around Cardano L1 anchoring, eUTXO-aware design, commitments, challenge mechanics, watchers, and settlement." },
            { q: "Where do I report a security issue?", a: "Use the official security contact route once published. Until then, start from Official Links and preserve evidence." },
            { q: "Where do I get support?", a: "Use the official support route once published. Midgard will never ask for your seed phrase, private key, recovery phrase, password, or wallet-draining approval." },
          ] },
          { title: "Testnet", items: [
            { q: "What is testnet for?", a: "Testnet is where builders, users, and partners inspect the path before production weight is placed on it." },
            { q: "What should I do first?", a: "Start from the official Midgard site, read the status label, inspect the docs/source, and use official links." },
          ] },
        ]} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Still curious" title="Start from the official path."
        lead="Use official links, read the docs, and explore the testnet path."
        actions={[{ label: "Open official links", to: "official-links", variant: "primary" }, { label: "Read docs ↗", external: L().docs, variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- Docs ---- */
function DocsPage({ onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Docs"
        title="Start with source, status, and a concrete flow."
        sub="The technical docs live in the official repository. This page explains what to inspect before you build or port a Cardano app flow."
        actions={[{ label: "Open official docs", external: L().docs, variant: "primary" }, { label: "Builder quickstart", to: "get-started", variant: "ghost" }]}
      />
      <Section eyebrow="How to use the docs" title="Where to start."
        lead="The useful sequence is not a tour of every file. It is the shortest route from architecture to a flow you can test.">
        <CardGrid cols={2}>
          <Card num="01" title="Architecture" body="The rollup model: state queue, operators, watchers, the challenge path, and settlement to Cardano L1." cta="Open docs" delay={0} />
          <Card num="02" title="Source" body="Inspect the official code before trusting any website copy as technical truth." cta="View GitHub" delay={70} />
          <Card num="03" title="Status" body="What is deployed, what is pending, and what still needs a refresh." cta="View testnet" delay={140} />
          <Card num="04" title="Integration flow" body="Bring one real flow — a wallet, dApp, or protocol action — and map where L2 helps." cta="Start path" delay={210} />
        </CardGrid>
      </Section>
      <Section eyebrow="Current boundary" title="Website copy is not the final technical spec." tight>
        <Prose items={[{ text: "This site translates Midgard for users, builders, and partners. Final technical claims should be checked against the official source, current testnet status, and approval-ready claim controls before public amplification." }]} />
      </Section>
      <CtaBand onNav={onNav}
        eyebrow="Builder path" title="Bring the flow you want to make faster."
        lead="The best next step is a concrete Cardano action: a wallet state, dApp interaction, protocol path, indexer need, or fallback behavior."
        actions={[{ label: "Open official docs", external: L().docs, variant: "primary" }, { label: "Register interest", external: L().intakeForm, variant: "ghost" }]}
      />
    </main>
  );
}

/* ---- Official Links ---- */
function OfficialLinksPage({ onNav }) {
  const Lk = L();
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Official links"
        title="Start from the official path."
        sub="Midgard should be easy to inspect and hard to impersonate. Use official links for docs, GitHub, community, status, support, and security routes."
        actions={[{ label: "View official links", to: "official-links", variant: "primary" }, { label: "Open docs ↗", external: Lk.docs, variant: "ghost" }]}
      />
      <Section id="links" eyebrow="Official links" title="Canonical Midgard links"
        lead="These are the channels to trust. Links are published here as each surface goes live — anything not listed here is not official.">
        <LinksTable rows={[
          { k: "Website", v: "midgard-gateway.vercel.app", href: Lk.website },
          { k: "Docs", v: "GitHub source/docs", href: Lk.docs },
          { k: "Contracts", v: "Testnet status", href: "testnet", onNav },
          { k: "GitHub", v: "Anastasia-Labs/midgard", href: Lk.github },
          { k: "X", v: "@midgardprotocol", href: Lk.x },
          { k: "Discord", v: "Midgard Discord", href: Lk.discord },
          { k: "Builder/Testnet intake", v: "Google form", href: Lk.intakeForm },
          { k: "Newsletter", v: "Publishing soon", pending: true },
          { k: "Support", v: "Publishing soon", pending: true },
          { k: "Security contact", v: "Publishing soon", pending: true },
          { k: "Status", v: "Testnet status", href: "testnet", onNav },
        ]} />
      </Section>
      <Section eyebrow="Safety" title="Stay safe">
        <Callout title="Midgard will never ask for private wallet secrets."
          body="Do not share your seed phrase, private key, recovery phrase, password, or unnecessary personal information. Do not sign approvals you do not understand. Do not trust unsolicited support messages."
          items={["Seed phrase or private key requests", "Urgent wallet connection requests", "Lookalike domains", "Fake support accounts", "Screenshots that hide the real URL", "Direct-message support pretending to be official"]} />
      </Section>
      <Section id="security-contact" eyebrow="Security contact" title="Preserve evidence. Use official routes." tight>
        <Prose items={[{ text: "If you see a suspicious link, account, or security issue, do not connect your wallet. Preserve the URL, account name, screenshot, timestamp, and where you saw it. Report through the official support, security, or community route once published." }]} />
      </Section>
    </main>
  );
}

/* lightweight stub for any unrouted nav target */
function StubPage({ pageKey, onNav }) {
  return (
    <main className="page-main">
      <PageHero onNav={onNav}
        label="Pre-alpha" title="Page"
        sub="This surface is a stub in the UI kit. The marketing gateway focuses on home, how-it-works, security, testnet, FAQ, about, docs, get-started, and official-links."
        actions={[{ label: "Back to home", to: "home", variant: "primary" }, { label: "Read how it works", to: "how-it-works", variant: "ghost" }]}
        chips={<React.Fragment><span className="chip chip--testnet"><span className="dot" />Pre-alpha testnet</span><span className="chip chip--demo"><span className="dot" />Simulated data</span></React.Fragment>}
      />
    </main>
  );
}

Object.assign(window, { Splash, HowItWorksPage, AboutPage, GetStartedPage, SecurityPage, TestnetPage, FaqPage, DocsPage, OfficialLinksPage, StubPage });
