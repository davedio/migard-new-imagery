"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useScroll, useMotionValueEvent } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";
import type { NetworkSnapshot } from "@/lib/network";
import type { SceneParams } from "./scene/WorldTreeScene";

const SECTION_PAD = "clamp(72px,11vh,150px) clamp(20px,5vw,64px)";

// Two hero forks coexist. Flip this to switch:
//   "static" — green PNG background + 2D canvas sap particles (StaticTreeHero)
//   "three"  — procedural Three.js / R3F world-tree (WorldTreeScene)
const HERO_MODE: "static" | "three" = "static";

const WorldTreeScene = dynamic(() => import("./scene/WorldTreeScene"), {
  ssr: false,
});

const StaticTreeHero = dynamic(() => import("./scene/StaticTreeHero"), {
  ssr: false,
});

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

function deriveParams(s: NetworkSnapshot): SceneParams {
  const activity = clamp(s.l1.txCountWindow / 110);
  const speed = 0.05 + clamp((s.l2.throughput - 6) / 18) * 0.09;
  return {
    speed,
    proofStatus: s.l2.latestProofStatus,
    challengeOpen: s.l2.challengeWindowOpen,
    settled: s.l2.latestProofStatus === "settled",
    activity,
  };
}

const fmt = (n: number) => n.toLocaleString("en-US");
const short = (hash: string) => `${hash.slice(0, 8)}…${hash.slice(-6)}`;

type Layer = {
  n: string;
  key: string;
  name: string;
  role: string;
  desc: string;
  chips: [string, string][];
  metric: (s: NetworkSnapshot) => { label: string; value: string }[];
};

const LAYERS: Layer[] = [
  {
    n: "01",
    key: "activity",
    name: "Activity",
    role: "Users & apps create activity on L2",
    desc: "Users and applications create activity in the higher-throughput L2 environment. Nothing is settled yet — it is fast movement that still owes a trip back to Cardano.",
    chips: [["testnet", "Pre-Alpha Testnet"], ["demo", "Simulated data"]],
    metric: (s) => [
      { label: "Txns / block window", value: fmt(s.l1.txCountWindow) },
      { label: "L1 estimate", value: `${s.l1.tps} tps` },
    ],
  },
  {
    n: "02",
    key: "batch",
    name: "Batch",
    role: "Activity is aggregated off-chain",
    desc: "Activity is organized into batches and state transitions off-chain. Aggregation is where throughput comes from — many actions resolve against a single anchor back to L1.",
    chips: [["testnet", "Pre-Alpha Testnet"], ["demo", "Simulated data"]],
    metric: (s) => [
      { label: "Queue depth", value: `${fmt(s.l2.batchQueueDepth)} ops` },
      { label: "L2 throughput", value: `${s.l2.throughput} ops/s` },
      { label: "Latest batch", value: short(s.l2.latestBatchId) },
    ],
  },
  {
    n: "03",
    key: "proof",
    name: "Proof",
    role: "State transitions are committed",
    desc: "The system publishes commitments and evidence so the path can be checked. The proof is the unit of trust, not the operator.",
    chips: [["proof", "Proof object"], ["demo", "Simulated data"]],
    metric: (s) => [
      { label: "Proof status", value: s.l2.latestProofStatus.toUpperCase() },
      { label: "Commitment", value: short(s.l2.latestBatchId) },
    ],
  },
  {
    n: "04",
    key: "challenge",
    name: "Challenge",
    role: "Disputed activity can be contested",
    desc: "Disputed activity can be contested through the protocol's challenge mechanics. Trust does not require believing the operator — it requires that someone can prove them wrong.",
    chips: [["testnet", "Design intent"], ["demo", "Simulated data"]],
    metric: (s) => [
      {
        label: "Challenge window",
        value: s.l2.challengeWindowOpen ? "OPEN" : "CLOSED",
      },
      { label: "Watchers", value: s.l2.challengeWindowOpen ? "8 active" : "idle" },
    ],
  },
  {
    n: "05",
    key: "settlement",
    name: "Settlement",
    role: "The path returns to the base layer",
    desc: "Settlement brings the path back to Cardano L1. Fast L2 activity and final L1 settlement are different pieces of the same trust path.",
    chips: [["proof", "Settlement cue"], ["demo", "Simulated data"]],
    metric: (s) => [
      {
        label: "Finalized",
        value: s.l2.latestProofStatus === "settled" ? "YES" : "pending",
      },
      { label: "Settlement tx", value: short(s.l2.latestSettlementTx) },
    ],
  },
  {
    n: "06",
    key: "l1",
    name: "Cardano L1",
    role: "Cardano stays in the trust loop",
    desc: "Cardano remains the base layer for the trust story. Fees are paid in ADA, and the path resolves to the chain you already trust.",
    chips: [["l1", "Cardano L1"], ["planned", "Claim approval-dependent"]],
    metric: (s) => [
      { label: "Block height", value: fmt(s.l1.blockHeight) },
      { label: "Epoch", value: fmt(s.l1.epoch) },
      { label: "Latest block", value: short(s.l1.latestBlockHash) },
    ],
  },
];

function Reveal({
  children,
  style,
  delay = 0,
}: {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${seen ? "in" : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

// Floating motion toggle (bottom-right). Shared nav/footer chrome now comes
// from the (site) layout; the home scene keeps only this control.
function MotionToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="btn btn--ghost"
      onClick={onToggle}
      aria-pressed={on}
      style={{
        position: "fixed",
        right: "clamp(16px,4vw,40px)",
        bottom: 22,
        zIndex: 45,
        padding: "8px 14px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        background: "rgba(7,18,11,0.6)",
      }}
    >
      Motion: {on ? "On" : "Off"}
    </button>
  );
}

function Hero() {
  return (
    <header
      style={{
        minHeight: "92svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 clamp(20px,5vw,64px)",
        maxWidth: 720,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 22 }}>
        Cardano-native optimistic rollup
      </div>
      <h1 style={{ fontSize: "clamp(30px, 4.6vw, 54px)", lineHeight: 1.05 }}>
        Built for Throughput.<br />
        Secured by <span style={{ color: "var(--green-bright)" }}>Math</span>.
      </h1>
      <p style={{ marginTop: 22, maxWidth: 540, color: "var(--text)", fontSize: "clamp(15px,1.6vw,18px)" }}>
        Midgard brings high-throughput Layer 2 blockchain performance, rooted
        directly in the mathematical rigor of Cardano.
      </p>
      <p style={{ marginTop: 14, maxWidth: 540, color: "var(--text-dim)", fontSize: "clamp(14px,1.5vw,16px)" }}>
        This is not speed for the sake of a number. It is throughput with a
        trust path.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", alignItems: "center" }}>
        <Link className="btn btn--primary" href="/testnet">
          Explore Testnet →
        </Link>
        <Link className="btn btn--ghost" href="/how-it-works">
          See How It Works
        </Link>
        <Link href="/builders" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-dim)", textDecoration: "underline", textUnderlineOffset: 4 }}>
          Build on Midgard
        </Link>
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

const h2Style: CSSProperties = {
  fontSize: "clamp(26px,3.4vw,40px)",
  lineHeight: 1.1,
  marginTop: 14,
  maxWidth: 660,
};
const leadStyle: CSSProperties = {
  marginTop: 18,
  maxWidth: 620,
  fontSize: "clamp(15px,1.6vw,17px)",
  color: "var(--text)",
};

function MechanismIntro() {
  return (
    <section id="system" style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">Trust architecture</div>
        <h2 style={h2Style}>Speed only matters if the path can be checked.</h2>
        <p style={leadStyle}>
          Activity happens on L2. Transactions are batched. State transitions
          anchor back to Cardano L1. Disputes have a challenge path. Settlement
          returns to the base layer.
        </p>
        <p style={{ ...leadStyle, marginTop: 14, color: "var(--text-dim)" }}>
          Not a detached network. Not another bridge maze. A Cardano-native
          execution path with Cardano still in the trust loop.
        </p>
        <div
          style={{
            marginTop: 26,
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(12px,1.3vw,14px)",
            letterSpacing: "0.12em",
            color: "var(--green-bright)",
          }}
        >
          Activity. Batch. Proof. Challenge. Settlement. Cardano L1.
        </div>
      </Reveal>
    </section>
  );
}

const AUDIENCE: { title: string; line: string; cta: string; href: string }[] = [
  { title: "Users", line: "Understand the path.", cta: "Start with users", href: "/users" },
  { title: "Builders", line: "Build with context.", cta: "Open builder path", href: "/builders" },
  { title: "Partners", line: "Make the system useful.", cta: "Explore partner tracks", href: "/partners" },
];

function AudiencePaths() {
  return (
    <section id="paths" style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">Choose your path</div>
        <h2 style={h2Style}>One system. Three ways in.</h2>
      </Reveal>
      <div
        style={{
          marginTop: 34,
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          maxWidth: 980,
        }}
      >
        {AUDIENCE.map((a, i) => (
          <Reveal key={a.title} delay={i * 90}>
            <div
              className="panel"
              style={{ padding: "24px 24px 22px", height: "100%", display: "flex", flexDirection: "column" }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--gold-bright)" }}>
                0{i + 1}
              </div>
              <h3 style={{ fontSize: 22, marginTop: 8 }}>{a.title}</h3>
              <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text)", flex: 1 }}>{a.line}</p>
              <Link href={a.href} style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--green-bright)", textDecoration: "underline", textUnderlineOffset: 4 }}>
                {a.cta} →
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const WHY_BULLETS = [
  "More capacity.",
  "Cardano-native development patterns.",
  "ADA fees.",
  "L1 settlement.",
  "Inspectable proof paths.",
  "A user experience that can become normal instead of foreign.",
];

function WhyItMatters() {
  return (
    <section style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">The category problem</div>
        <h2 style={h2Style}>
          Throughput pressure should not become ecosystem exit pressure.
        </h2>
        <p style={leadStyle}>
          When an ecosystem cannot scale, builders leave to find capacity
          elsewhere. Midgard keeps that pressure inside Cardano — you get room
          to grow without trading away what made Cardano worth building on.
        </p>
        <ul className="bullets" style={{ maxWidth: 560 }}>
          {WHY_BULLETS.map((b) => (
            <li key={b}>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function ProductThesis() {
  return (
    <section style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">Product thesis</div>
        <h2 style={h2Style}>Midgard is practical scaling.</h2>
        <p style={leadStyle}>
          Not a new world that asks you to abandon the old one. A higher-throughput
          execution path for the apps, wallets, and assets that already live on
          Cardano — with the trust path intact.
        </p>
        <p
          style={{
            marginTop: 22,
            maxWidth: 640,
            fontSize: "clamp(17px,2vw,22px)",
            lineHeight: 1.3,
            color: "var(--text-hi)",
          }}
        >
          That is the point: make Cardano more usable without making it{" "}
          <span style={{ color: "var(--green-bright)" }}>less Cardano</span>.
        </p>
      </Reveal>
    </section>
  );
}

const PROOFS: { title: string; line: string }[] = [
  { title: "Cardano-native execution", line: "Runs in Cardano's model, not adjacent to it." },
  { title: "Developer continuity", line: "Familiar patterns, wallets, and tooling carry over." },
  { title: "Trust architecture", line: "Proofs, challenges, and L1 settlement keep the path checkable." },
  { title: "ADA economics", line: "Fees are paid in ADA. The economic loop stays on Cardano." },
];

function ProofObjects() {
  return (
    <section style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">What it brings into focus</div>
        <h2 style={h2Style}>What Midgard brings into focus</h2>
      </Reveal>
      <div
        style={{
          marginTop: 34,
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          maxWidth: 980,
        }}
      >
        {PROOFS.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <div className="panel" style={{ padding: "22px 22px 20px", height: "100%" }}>
              <h3 style={{ fontSize: 18, color: "var(--text-hi)" }}>{p.title}</h3>
              <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-dim)" }}>{p.line}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal style={{ marginTop: 28 }}>
        <Link href="/testnet" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--green-bright)", textDecoration: "underline", textUnderlineOffset: 4 }}>
          Explore testnet →
        </Link>
      </Reveal>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section style={{ padding: "clamp(96px,16vh,200px) clamp(20px,5vw,64px)" }}>
      <Reveal style={{ maxWidth: 720, marginInline: "auto", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center", display: "inline-flex" }}>
          Build on Midgard
        </div>
        <h2 style={{ ...h2Style, maxWidth: "none", marginInline: "auto" }}>
          Build where the path can be verified.
        </h2>
        <p style={{ ...leadStyle, marginInline: "auto" }}>
          Higher throughput, Cardano-native, with a trust path that resolves to
          L1. Start building, or read how the system holds together.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn--primary" href="/builders">
            Build On Midgard
          </Link>
          <Link className="btn btn--ghost" href="/how-it-works">
            How It Works
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function LayerSection({
  layer,
  snap,
  index,
}: {
  layer: Layer;
  snap: NetworkSnapshot;
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const side = index % 2 === 0 ? "flex-start" : "flex-end";
  return (
    <section
      ref={ref}
      id={layer.key}
      style={{
        minHeight: "78svh",
        display: "flex",
        alignItems: "center",
        justifyContent: side,
        padding: "0 clamp(20px,5vw,64px)",
      }}
    >
      <div
        className={`panel reveal ${seen ? "in" : ""}`}
        style={{ width: "min(420px, 100%)", padding: "26px 26px 22px" }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.22em", color: "var(--gold-bright)" }}>
          LAYER {layer.n} / 06
        </div>
        <h2 style={{ fontSize: 26, marginTop: 8 }}>{layer.name}</h2>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
          {layer.role}
        </div>
        <p style={{ marginTop: 14, fontSize: 14.5, color: "var(--text)" }}>{layer.desc}</p>

        <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
          {layer.metric(snap).map((m) => (
            <div key={m.label} className="metric-row">
              <span className="k">{m.label}</span>
              <span className="v">{m.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {layer.chips.map(([cls, txt]) => (
            <span className={`chip chip--${cls}`} key={txt}>
              <span className="dot" />
              {txt}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveHUD({ snap }: { snap: NetworkSnapshot }) {
  const live = snap.source !== "demo";
  return (
    <div
      className="panel"
      style={{
        position: "fixed",
        left: "clamp(16px,4vw,40px)",
        bottom: 22,
        zIndex: 40,
        padding: "12px 16px",
        display: "grid",
        gap: 6,
        minWidth: 220,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span className={`chip chip--${live ? "live" : "demo"}`}>
          <span className="dot" />
          {live ? "Live L1 · sim L2" : "Simulated feed"}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
          {new Date(snap.updatedAt).toLocaleTimeString("en-US")}
        </span>
      </div>
      <Row k="L1 block" v={`#${fmt(snap.l1.blockHeight)}`} />
      <Row k="Batch queue" v={`${fmt(snap.l2.batchQueueDepth)} ops`} />
      <Row k="Proof" v={snap.l2.latestProofStatus.toUpperCase()} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="metric-row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export default function Gateway() {
  const { data: snap } = useNetworkSnapshot();
  const progress = useRef(0);
  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
  });

  const [motionOn, setMotionOn] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) return;
    const frame = requestAnimationFrame(() => setMotionOn(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  const params = deriveParams(snap);

  return (
    <>
      <div className="scene-stage">
        {HERO_MODE === "three" ? (
          <WorldTreeScene params={params} progressRef={progress} motionOn={motionOn} />
        ) : (
          <StaticTreeHero snap={snap} motionOn={motionOn} />
        )}
      </div>

      <main className="content">
        <Hero />
        <AudiencePaths />
        <MechanismIntro />
        {LAYERS.map((layer, i) => (
          <LayerSection key={layer.key} layer={layer} snap={snap} index={i} />
        ))}
        <WhyItMatters />
        <ProductThesis />
        <ProofObjects />
        <ClosingCTA />
      </main>

      <MotionToggle on={motionOn} onToggle={() => setMotionOn((m) => !m)} />
      <LiveHUD snap={snap} />
    </>
  );
}
