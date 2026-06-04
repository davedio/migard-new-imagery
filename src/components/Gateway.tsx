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
import { useMotionPref } from "@/lib/motion";
import type { NetworkSnapshot } from "@/lib/network";
import type { SceneParams } from "./scene/WorldTreeScene";

const SECTION_PAD = "clamp(48px,6.5vh,88px) var(--gut)";

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
      className="motion-toggle"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={`Motion ${on ? "on" : "off"}`}
      title={`Motion ${on ? "on" : "off"}`}
    >
      <span className="motion-toggle__glyph" data-on={on} aria-hidden />
    </button>
  );
}

function Hero() {
  const heroRef = useHeroAutoFit();

  return (
    <header ref={heroRef} className="home-hero">
      <div className="eyebrow home-hero__eyebrow">
        Scalability | Speed | Security
      </div>
      <h1>
        Built to scale<br />
        Rooted in{" "}
        <span style={{ color: "var(--green-bright)" }}>Cardano</span>
      </h1>
      <p className="home-hero__lead">
        Midgard is a Cardano-native optimistic rollup that gives applications a
        faster execution layer while keeping Cardano as the root of trust.
      </p>
      <div className="home-hero__actions">
        <Link className="btn btn--primary" href="/get-started">
          Get Started
        </Link>
        <a
          className="btn btn--ghost"
          href="https://anastasia-labs.github.io/midgard/midgard.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Whitepaper
        </a>
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

const AUDIENCE_PATHS: {
  n: string;
  title: string;
  line: string;
  cta: string;
  href: string;
}[] = [
  {
    n: "01",
    title: "Users",
    line: "Users through wallets or apps.",
    cta: "Start as a user",
    href: "/get-started#users",
  },
  {
    n: "02",
    title: "Builders",
    line: "For wallets and dApps, including DEXs, lending protocols, and any other applications.",
    cta: "Open builder path",
    href: "/get-started#builder-quickstart",
  },
  {
    n: "03",
    title: "Become a Midgard Operator or Watcher",
    line: "For operators, batchers, and watchers: sequence activity into blocks, then replay and challenge anything invalid before it settles to Cardano L1.",
    cta: "See the protocol roles",
    href: "/get-started#roles",
  },
];

function ExploreGrid() {
  return (
    <section id="explore" style={{ padding: SECTION_PAD }}>
      <Reveal style={{ maxWidth: 680 }}>
        <h2 style={h2Style}>Choose your path</h2>
        <p style={leadStyle}>
          Users, builders, and partners can overlap. Pick the path that matches
          what you need to understand first.
        </p>
      </Reveal>
      <div
        style={{
          marginTop: 34,
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          maxWidth: 1040,
        }}
      >
        {AUDIENCE_PATHS.map((a, i) => (
          <Reveal key={a.title} delay={i * 70}>
            <Link
              href={a.href}
              className="panel"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "20px 20px 18px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "var(--gold-bright)",
                }}
              >
                {a.n}
              </div>
              <h3 style={{ fontSize: 19, marginTop: 8, color: "var(--text-hi)" }}>
                {a.title}
              </h3>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: "var(--text-dim)",
                  flex: 1,
                }}
              >
                {a.line}
              </p>
              <span
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--green-bright)",
                }}
              >
                {a.cta} →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section style={{ padding: "clamp(60px,9vh,112px) var(--gut)" }}>
      <Reveal style={{ maxWidth: 720, marginInline: "auto", textAlign: "center" }}>
        <h2 style={{ ...h2Style, maxWidth: "none", marginInline: "auto" }}>
          Scale Cardano. Keep the proof.
        </h2>
        <p style={{ ...leadStyle, marginInline: "auto" }}>
          Midgard is live in testnet/status form now. Read the architecture,
          inspect the source, and bring an application that requires speed,
          throughput and finality.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn--primary" href="/get-started">
            Start with a use case
          </Link>
          <Link className="btn btn--ghost" href="/testnet">
            Testnet status
          </Link>
        </div>
      </Reveal>
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

  const { motionOn, toggle } = useMotionPref();

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
        <ExploreGrid />
        <ClosingCTA />
      </main>

      <MotionToggle on={motionOn} onToggle={toggle} />
    </>
  );
}
