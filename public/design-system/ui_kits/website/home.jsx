/* Midgard UI Kit — Home (port of src/components/Gateway.tsx) */

const MECHANISM = ["Activity", "Batch", "Proof", "Challenge", "Settlement", "Cardano L1"];

const homeH2 = { fontSize: "clamp(26px,3.4vw,40px)", lineHeight: 1.1, marginTop: 14, maxWidth: 660 };
const homeLead = { marginTop: 18, maxWidth: 620, fontSize: "clamp(15px,1.6vw,17px)", color: "var(--text)" };
const homePad = "clamp(76px,10vh,142px) clamp(22px,4.8vw,80px)";

function HomeHero({ onNav }) {
  return (
    <header className="home-hero">
      <Eyebrow style={{ marginBottom: 22 }}>Scalability | Speed | Security</Eyebrow>
      <h1 style={{ fontSize: "clamp(40px,5.4vw,58px)", lineHeight: 1.03, letterSpacing: 0 }}>
        Built to scale.<br />Rooted in <span style={{ color: "var(--green-bright)" }}>Cardano.</span>
      </h1>
      <p style={{ marginTop: 24, maxWidth: 620, color: "var(--text)", fontSize: "clamp(16px,1.5vw,18px)", lineHeight: 1.55 }}>
        Midgard is a Cardano-native optimistic rollup that gives applications a faster execution layer while keeping Cardano as the root of trust.
      </p>
      <p style={{ marginTop: 14, maxWidth: 600, color: "var(--text-dim)", fontSize: "clamp(15px,1.4vw,16px)", lineHeight: 1.55 }}>
        Faster transaction execution for dApps, DEXs, lending protocols, wallets, and other flows that require speed and throughput.
      </p>
      <ol aria-label="Midgard mechanism" style={{ display: "flex", flexWrap: "wrap", gap: 8, listStyle: "none", margin: "22px 0 0", padding: 0, maxWidth: 620 }}>
        {MECHANISM.map((step) => (
          <li key={step} style={{
            display: "inline-flex", alignItems: "center", minHeight: 30, padding: "6px 10px",
            border: "1px solid rgba(207,154,46,0.32)", borderRadius: "var(--r-sm)",
            background: "rgba(5,12,8,0.48)", color: "var(--text)",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.02em", whiteSpace: "nowrap",
            backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
          }}>{step}</li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn--primary" onClick={() => onNav("how-it-works")}>How It Works</button>
        <button className="btn btn--ghost" onClick={() => onNav("get-started")}>Get Started</button>
      </div>
    </header>
  );
}

function ExploreGrid({ onNav }) {
  return (
    <section style={{ padding: homePad }}>
      <Reveal style={{ maxWidth: 680 }}>
        <h2 style={homeH2}>Start with your question, not a label.</h2>
        <p style={homeLead}>Users, builders, and partners can overlap. Pick the path that matches what you need to understand first.</p>
      </Reveal>
      <div id="explore" style={{ marginTop: 34, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", maxWidth: 1040 }}>
        {window.MIDGARD_DATA.explore.map((a, i) => (
          <Reveal key={a.title} delay={i * 70}>
            <button onClick={() => onNav(a.key)} className="panel" style={{
              display: "flex", flexDirection: "column", height: "100%", width: "100%",
              padding: "20px 20px 18px", textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit",
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--gold-bright)" }}>{a.n}</div>
              <h3 style={{ fontSize: 19, marginTop: 8, color: "var(--text-hi)" }}>{a.title}</h3>
              <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-dim)", flex: 1 }}>{a.line}</p>
              <span style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--green-bright)" }}>{a.cta} →</span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA({ onNav }) {
  return (
    <section style={{ padding: "clamp(96px,15vh,188px) clamp(22px,4.8vw,80px)" }}>
      <Reveal style={{ maxWidth: 720, marginInline: "auto", textAlign: "center" }}>
        <Eyebrow style={{ justifyContent: "center", display: "inline-flex" }}>Closing</Eyebrow>
        <h2 style={{ ...homeH2, maxWidth: "none", marginInline: "auto" }}>Scale Cardano. Keep the proof.</h2>
        <p style={{ ...homeLead, marginInline: "auto" }}>Midgard is live in testnet/status form now. Read the architecture, inspect the source, and bring a concrete flow that needs more Cardano throughput.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn--primary" onClick={() => onNav("get-started")}>Start with a use case</button>
          <button className="btn btn--ghost" onClick={() => onNav("testnet")}>Testnet status</button>
        </div>
      </Reveal>
    </section>
  );
}

function HomePage({ snap, onNav }) {
  return (
    <main className="content">
      <HomeHero onNav={onNav} />
      <ExploreGrid onNav={onNav} />
      <ClosingCTA onNav={onNav} />
    </main>
  );
}

Object.assign(window, { HomePage });
