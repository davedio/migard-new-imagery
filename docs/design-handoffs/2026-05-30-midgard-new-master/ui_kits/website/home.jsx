/* Midgard UI Kit — Home (port of src/components/Gateway.tsx) */
const { useRef: useRefHome, useState: useStateHome, useEffect: useEffectHome } = React;

const short = (h) => `${h.slice(0, 8)}…${h.slice(-6)}`;

function layerMetrics(layer, s) {
  switch (layer.key) {
    case "activity": return [["Txns / block window", fmt(s.l1.txCountWindow)], ["L1 estimate", `${s.l1.tps} tps`]];
    case "batch": return [["Queue depth", `${fmt(s.l2.batchQueueDepth)} ops`], ["L2 throughput", `${s.l2.throughput} ops/s`], ["Latest batch", short(s.l2.latestBatchId)]];
    case "proof": return [["Proof status", s.l2.latestProofStatus.toUpperCase()], ["Commitment", short(s.l2.latestBatchId)]];
    case "challenge": return [["Challenge window", s.l2.challengeWindowOpen ? "OPEN" : "CLOSED"], ["Watchers", s.l2.challengeWindowOpen ? "8 active" : "idle"]];
    case "settlement": return [["Finalized", s.l2.latestProofStatus === "settled" ? "YES" : "pending"], ["Settlement tx", short("0x" + (s.l2.latestBatchId.slice(2) + "a1b2c3"))]];
    case "l1": return [["Block height", fmt(s.l1.blockHeight)], ["Epoch", fmt(s.l1.epoch)], ["Latest block", short(s.l1.latestBlockHash)]];
    default: return [];
  }
}

function HomeHero({ onNav }) {
  return (
    <header style={{ minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(20px,5vw,64px)", maxWidth: 720 }}>
      <Eyebrow style={{ marginBottom: 22 }}>Cardano-native optimistic rollup</Eyebrow>
      <h1 style={{ fontSize: "clamp(30px,4.6vw,54px)", lineHeight: 1.05 }}>
        Built for Throughput.<br />Secured by <span style={{ color: "var(--green-bright)" }}>Math</span>.
      </h1>
      <p style={{ marginTop: 22, maxWidth: 540, color: "var(--text)", fontSize: "clamp(15px,1.6vw,18px)" }}>
        Midgard brings high-throughput Layer 2 blockchain performance, rooted directly in the mathematical rigor of Cardano.
      </p>
      <p style={{ marginTop: 14, maxWidth: 540, color: "var(--text-dim)", fontSize: "clamp(14px,1.5vw,16px)" }}>
        This is not speed for the sake of a number. It is throughput with a trust path.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn--primary" onClick={() => onNav("testnet")}>Explore Testnet →</button>
        <button className="btn btn--ghost" onClick={() => onNav("how-it-works")}>See How It Works</button>
        <button className="btn" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-dim)", textDecoration: "underline", textUnderlineOffset: 4, padding: "0" }} onClick={() => onNav("builders")}>Build on Midgard</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
        <span className="chip chip--testnet"><span className="dot" />Pre-Alpha Testnet</span>
        <span className="chip chip--demo"><span className="dot" />Simulated · connects to live data at launch</span>
        <span className="chip chip--l1"><span className="dot" />Cardano L1 anchor · claim-dependent</span>
      </div>
      <div style={{ marginTop: 54, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--text-dim)", textTransform: "uppercase" }}>
        ↓ Speed only matters if the path can be checked
      </div>
    </header>
  );
}

const homeH2 = { fontSize: "clamp(26px,3.4vw,40px)", lineHeight: 1.1, marginTop: 14, maxWidth: 660 };
const homeLead = { marginTop: 18, maxWidth: 620, fontSize: "clamp(15px,1.6vw,17px)", color: "var(--text)" };
const homePad = "clamp(72px,11vh,150px) clamp(20px,5vw,64px)";

function AudiencePaths({ onNav }) {
  return (
    <section style={{ padding: homePad }}>
      <Reveal style={{ maxWidth: 680 }}>
        <Eyebrow>Choose your path</Eyebrow>
        <h2 style={homeH2}>One system. Three ways in.</h2>
      </Reveal>
      <div style={{ marginTop: 34, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", maxWidth: 980 }}>
        {window.MIDGARD_DATA.audience.map((a, i) => (
          <Reveal key={a.title} delay={i * 90}>
            <div className="panel" style={{ padding: "24px 24px 22px", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--gold-bright)" }}>0{i + 1}</div>
              <h3 style={{ fontSize: 22, marginTop: 8 }}>{a.title}</h3>
              <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text)", flex: 1 }}>{a.line}</p>
              <button onClick={() => onNav(a.key)} style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--green-bright)", textDecoration: "underline", textUnderlineOffset: 4, background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}>{a.cta} →</button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function MechanismIntro() {
  return (
    <section style={{ padding: homePad }}>
      <Reveal style={{ maxWidth: 680 }}>
        <Eyebrow>Trust architecture</Eyebrow>
        <h2 style={homeH2}>Speed only matters if the path can be checked.</h2>
        <p style={homeLead}>Activity happens on L2. Transactions are batched. State transitions anchor back to Cardano L1. Disputes have a challenge path. Settlement returns to the base layer.</p>
        <p style={{ ...homeLead, marginTop: 14, color: "var(--text-dim)" }}>Not a detached network. Not another bridge maze. A Cardano-native execution path with Cardano still in the trust loop.</p>
        <div style={{ marginTop: 26, fontFamily: "var(--font-mono)", fontSize: "clamp(12px,1.3vw,14px)", letterSpacing: "0.12em", color: "var(--green-bright)" }}>
          Activity. Batch. Proof. Challenge. Settlement. Cardano L1.
        </div>
      </Reveal>
    </section>
  );
}

function LayerSection({ layer, snap, index }) {
  const ref = useRefHome(null);
  const [seen, setSeen] = useStateHome(false);
  useEffectHome(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setSeen(true)), { threshold: 0.35 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const side = index % 2 === 0 ? "flex-start" : "flex-end";
  return (
    <section ref={ref} id={layer.key} style={{ minHeight: "78vh", display: "flex", alignItems: "center", justifyContent: side, padding: "0 clamp(20px,5vw,64px)" }}>
      <div className={`panel reveal ${seen ? "in" : ""}`} style={{ width: "min(420px,100%)", padding: "26px 26px 22px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.22em", color: "var(--gold-bright)" }}>LAYER {layer.n} / 06</div>
        <h2 style={{ fontSize: 26, marginTop: 8 }}>{layer.name}</h2>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{layer.role}</div>
        <p style={{ marginTop: 14, fontSize: 14.5, color: "var(--text)" }}>{layer.desc}</p>
        <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
          {layerMetrics(layer, snap).map(([k, v]) => <MetricRow key={k} k={k} v={v} />)}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {layer.chips.map(([cls, txt]) => <span className={`chip chip--${cls}`} key={txt}><span className="dot" />{txt}</span>)}
        </div>
      </div>
    </section>
  );
}

function WhyItMatters() {
  return (
    <section style={{ padding: homePad }}>
      <Reveal style={{ maxWidth: 680 }}>
        <Eyebrow>The category problem</Eyebrow>
        <h2 style={homeH2}>Throughput pressure should not become ecosystem exit pressure.</h2>
        <p style={homeLead}>When an ecosystem cannot scale, builders leave to find capacity elsewhere. Midgard keeps that pressure inside Cardano — you get room to grow without trading away what made Cardano worth building on.</p>
        <ul className="bullets" style={{ maxWidth: 560 }}>
          {window.MIDGARD_DATA.why.map((b) => <li key={b}><span>{b}</span></li>)}
        </ul>
      </Reveal>
    </section>
  );
}

function ProductThesis() {
  return (
    <section style={{ padding: homePad }}>
      <Reveal style={{ maxWidth: 680 }}>
        <Eyebrow>Product thesis</Eyebrow>
        <h2 style={homeH2}>Midgard is practical scaling.</h2>
        <p style={homeLead}>Not a new world that asks you to abandon the old one. A higher-throughput execution path for the apps, wallets, and assets that already live on Cardano — with the trust path intact.</p>
        <p style={{ marginTop: 22, maxWidth: 640, fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.3, color: "var(--text-hi)" }}>
          That is the point: make Cardano more usable without making it <span style={{ color: "var(--green-bright)" }}>less Cardano</span>.
        </p>
      </Reveal>
    </section>
  );
}

function ProofObjects({ onNav }) {
  return (
    <section style={{ padding: homePad }}>
      <Reveal style={{ maxWidth: 680 }}>
        <Eyebrow>What it brings into focus</Eyebrow>
        <h2 style={homeH2}>What Midgard brings into focus</h2>
      </Reveal>
      <div style={{ marginTop: 34, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", maxWidth: 980 }}>
        {window.MIDGARD_DATA.proofs.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <div className="panel" style={{ padding: "22px 22px 20px", height: "100%" }}>
              <h3 style={{ fontSize: 18, color: "var(--text-hi)" }}>{p.title}</h3>
              <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-dim)" }}>{p.line}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA({ onNav }) {
  return (
    <section style={{ padding: "clamp(96px,16vh,200px) clamp(20px,5vw,64px)" }}>
      <Reveal style={{ maxWidth: 720, marginInline: "auto", textAlign: "center" }}>
        <Eyebrow style={{ justifyContent: "center", display: "inline-flex" }}>Build on Midgard</Eyebrow>
        <h2 style={{ ...homeH2, maxWidth: "none", marginInline: "auto" }}>Build where the path can be verified.</h2>
        <p style={{ ...homeLead, marginInline: "auto" }}>Higher throughput, Cardano-native, with a trust path that resolves to L1. Start building, or read how the system holds together.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn--primary" onClick={() => onNav("builders")}>Build On Midgard</button>
          <button className="btn btn--ghost" onClick={() => onNav("how-it-works")}>How It Works</button>
        </div>
      </Reveal>
    </section>
  );
}

function HomePage({ snap, onNav }) {
  return (
    <main className="content">
      <HomeHero onNav={onNav} />
      <AudiencePaths onNav={onNav} />
      <MechanismIntro />
      {window.MIDGARD_DATA.layers.map((l, i) => <LayerSection key={l.key} layer={l} snap={snap} index={i} />)}
      <WhyItMatters />
      <ProductThesis />
      <ProofObjects onNav={onNav} />
      <ClosingCTA onNav={onNav} />
    </main>
  );
}

Object.assign(window, { HomePage });
