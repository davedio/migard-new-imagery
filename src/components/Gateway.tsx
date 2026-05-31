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
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

const SECTION_PAD = "clamp(76px,10vh,142px) var(--gut)";

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

function getHeroSafeRightEdge(viewportWidth: number) {
  if (viewportWidth <= 720) return viewportWidth - 22;
  if (viewportWidth <= 1599) return viewportWidth * 0.42;
  if (viewportWidth <= 1900) return viewportWidth * 0.5;
  return viewportWidth * 0.58;
}

function useHeroAutoFit() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = ref.current;
    if (!hero || typeof window === "undefined") return;

    let frame = 0;

    const computeFit = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const title = hero.querySelector<HTMLElement>("h1");
        if (!title) return;

        hero.style.setProperty("--hero-fit", "1");

        const viewportWidth =
          window.visualViewport?.width ?? document.documentElement.clientWidth;
        const viewportHeight =
          window.visualViewport?.height ?? document.documentElement.clientHeight;
        const heroRect = hero.getBoundingClientRect();
        const copyRects = Array.from(
          hero.querySelectorAll<HTMLElement>(
            "h1, .home-hero__lead, .home-hero__sublead",
          ),
        ).map((node) => node.getBoundingClientRect());
        const childRects = Array.from(hero.children).map((child) =>
          child.getBoundingClientRect(),
        );

        const copyLeft = Math.min(...copyRects.map((rect) => rect.left));
        const copyRight = Math.max(...copyRects.map((rect) => rect.right));
        const copyWidth = Math.max(1, copyRight - copyLeft);
        const safeRight = getHeroSafeRightEdge(viewportWidth);
        const edgeFit =
          viewportWidth <= 720 ? 1 : (safeRight - copyLeft) / copyWidth;

        const contentTop = Math.min(...childRects.map((rect) => rect.top));
        const contentBottom = Math.max(...childRects.map((rect) => rect.bottom));
        const contentHeight = Math.max(1, contentBottom - contentTop);
        const usableHeight =
          Math.min(heroRect.height, viewportHeight * 0.92) -
          (viewportWidth <= 720 ? 28 : 54);
        const heightFit = usableHeight / contentHeight;
        const titleHeightLimit =
          viewportWidth <= 720
            ? viewportHeight * 0.26
            : viewportWidth <= 1599
              ? 156
              : viewportHeight * 0.2;
        const titleHeightFit =
          titleHeightLimit / Math.max(1, title.getBoundingClientRect().height);
        const titleWidthFit =
          title.clientWidth / Math.max(1, title.scrollWidth);
        const minFit = viewportWidth <= 720 ? 0.82 : 0.68;
        const nextFit = clamp(
          Math.min(edgeFit, heightFit, titleHeightFit, titleWidthFit),
          minFit,
          1,
        );

        hero.style.setProperty("--hero-fit", nextFit.toFixed(3));
      });
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(computeFit);
    resizeObserver?.observe(hero);
    Array.from(hero.children).forEach((child) => resizeObserver?.observe(child));

    const mutationObserver = new MutationObserver(computeFit);
    mutationObserver.observe(hero, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", computeFit);
    window.addEventListener("orientationchange", computeFit);
    void document.fonts?.ready.then(computeFit);
    computeFit();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", computeFit);
      window.removeEventListener("orientationchange", computeFit);
    };
  }, []);

  return ref;
}

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
  const heroRef = useHeroAutoFit();

  return (
    <header ref={heroRef} className="home-hero">
      <div className="eyebrow home-hero__eyebrow">
        Scalability&nbsp;&nbsp;|&nbsp;&nbsp;Speed&nbsp;&nbsp;|&nbsp;&nbsp;Security
      </div>
      <h1>
        Built to Scale.<br />
        Secured by <span style={{ color: "var(--green-bright)" }}>Math</span>
      </h1>
      <p className="home-hero__lead">
        Midgard is a Cardano-native optimistic Layer 2 rollup. It runs
        applications at L2 speed and settles them through a trust path anchored
        to Cardano L1.
      </p>
      <p className="home-hero__sublead">
        Same eUTXO model, familiar tooling, fees paid in ADA. Speed you can
        inspect without trading away correctness.
      </p>
      <div className="home-hero__actions">
        <Link className="btn btn--primary" href="/get-started">
          Get Started
        </Link>
        <Link className="btn btn--ghost" href="/how-it-works">
          See How It Works
        </Link>
      </div>
      <div className="home-hero__cue">
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
        <div className="eyebrow">How it works</div>
        <h2 style={h2Style}>Instant execution. On-chain verification.</h2>
        <p style={leadStyle}>
          A transaction is valid when it is checked against eUTXO rules, then
          ordered, committed, watched, and settled through the Cardano L1 trust
          path.
        </p>
        <p style={{ ...leadStyle, marginTop: 14, color: "var(--text-dim)" }}>
          Independent Watchers can replay committed blocks and use fraud proofs
          to contest invalid state. Speed up front, verification underneath.
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
  { title: "How It Works", line: "Understand the mechanism.", cta: "Follow the path", href: "/how-it-works" },
  { title: "Security", line: "Inspect the guarantees.", cta: "See the trust case", href: "/security" },
  { title: "Get Started", line: "Build, operate, watch, integrate, or support.", cta: "Choose your role", href: "/get-started" },
  { title: "About", line: "Learn who builds it and why.", cta: "Read the thesis", href: "/about" },
];

function AudiencePaths() {
  return (
    <section id="paths" style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">Site path</div>
        <h2 style={h2Style}>Understand it, trust it, get started, know who builds it.</h2>
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
  "Cardano-native development patterns.",
  "Fees paid in ADA.",
  "L1 settlement.",
  "Inspectable proof paths.",
  "Lower-friction application flow.",
  "A user experience that can feel native instead of foreign.",
];

function WhyItMatters() {
  return (
    <section style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">The problem</div>
        <h2 style={h2Style}>
          Security should not be the price you pay for scale.
        </h2>
        <p style={leadStyle}>
          As activity grows on Cardano, fees rise and throughput hits a ceiling.
          The usual escape routes ask builders and users to accept a weaker or
          less familiar security model.
        </p>
        <p style={{ ...leadStyle, marginTop: 14, color: "var(--text-dim)" }}>
          Midgard scales Cardano without leaving the trust path behind.
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
        <div className="eyebrow">Who builds it</div>
        <h2 style={h2Style}>Built by Anastasia Labs.</h2>
        <p style={leadStyle}>
          Midgard comes from a team building Cardano infrastructure and
          open-source tooling for serious on-chain systems.
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
          The point is simple: make Cardano more usable without making it{" "}
          <span style={{ color: "var(--green-bright)" }}>less Cardano</span>.
        </p>
        <Link href="/about" style={{ display: "inline-flex", marginTop: 24, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--green-bright)", textDecoration: "underline", textUnderlineOffset: 4 }}>
          About Midgard →
        </Link>
      </Reveal>
    </section>
  );
}

const PROOFS: { title: string; line: string }[] = [
  { title: "Anchored to Cardano", line: "State commitments and settlement route through the L1 trust path." },
  { title: "Verifiable by anyone", line: "Watchers and challenge mechanics keep invalid state contestable." },
  { title: "Same Cardano", line: "The builder path is designed around eUTXO continuity and familiar tooling." },
  { title: "Fees paid in ADA", line: "Scaling should extend the Cardano economy, not route value through a bridge token." },
  { title: "Live status path", line: "Pre-alpha testnet surfaces separate live, simulated, and pending facts." },
  { title: "Official links", line: "The safest user path starts from canonical channels and clear status labels." },
];

function ProofObjects() {
  return (
    <section style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">Security and economics</div>
        <h2 style={h2Style}>Scale Cardano. Keep the proof.</h2>
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
        <div className="eyebrow">Official channels</div>
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <a className="btn btn--ghost" href={OFFICIAL_LINKS.github} target="_blank" rel="noreferrer">
            Explore on GitHub
          </a>
          <a className="btn btn--ghost" href={OFFICIAL_LINKS.x} target="_blank" rel="noreferrer">
            Follow on X
          </a>
          <a className="btn btn--ghost" href={OFFICIAL_LINKS.discord} target="_blank" rel="noreferrer">
            Join Discord
          </a>
        </div>
      </Reveal>
    </section>
  );
}

const QUESTIONS = [
  {
    q: "What is Midgard?",
    a: "A Cardano-native optimistic rollup that runs applications at Layer 2 speed and settles through a trust path anchored to Cardano L1.",
  },
  {
    q: "How are fees paid?",
    a: "In ADA.",
  },
  {
    q: "Is it a sidechain?",
    a: "No. Midgard is positioned as a rollup path with commitments, challenge mechanics, and settlement tied back to Cardano L1.",
  },
  {
    q: "What is live now?",
    a: "A pre-alpha testnet/status path, with website activity clearly labeled where demonstration data is being used.",
  },
];

function CommonQuestions() {
  return (
    <section style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <div className="eyebrow">Common questions</div>
        <h2 style={h2Style}>Answered plainly.</h2>
      </Reveal>
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gap: 14,
          maxWidth: 860,
        }}
      >
        {QUESTIONS.map((item, i) => (
          <Reveal key={item.q} delay={i * 70}>
            <div className="panel" style={{ padding: "20px 22px" }}>
              <h3 style={{ fontSize: 17, color: "var(--text-hi)" }}>{item.q}</h3>
              <p style={{ marginTop: 8, color: "var(--text-dim)", fontSize: 14.5 }}>{item.a}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal style={{ marginTop: 24 }}>
        <Link href="/faq" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--green-bright)", textDecoration: "underline", textUnderlineOffset: 4 }}>
          Read the FAQ →
        </Link>
      </Reveal>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section style={{ padding: "clamp(96px,15vh,188px) var(--gut)" }}>
      <Reveal style={{ maxWidth: 720, marginInline: "auto", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center", display: "inline-flex" }}>
          Closing
        </div>
        <h2 style={{ ...h2Style, maxWidth: "none", marginInline: "auto" }}>
          Scale Cardano. Keep the proof.
        </h2>
        <p style={{ ...leadStyle, marginInline: "auto" }}>
          Midgard is live in testnet/status form now. Read the architecture,
          inspect the source, and build on a scaling path you can verify end to
          end.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn--primary" href="/get-started">
            Get Started
          </Link>
          <Link className="btn btn--ghost" href="/testnet">
            Testnet status
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
        padding: "0 var(--gut)",
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
        <CommonQuestions />
        <ClosingCTA />
      </main>

      <MotionToggle on={motionOn} onToggle={() => setMotionOn((m) => !m)} />
    </>
  );
}
