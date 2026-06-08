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
import type { GrowthParams } from "./scene/GrowthTreeScene";
import { AboutFold } from "./site/AboutFold";

// Hero forks. Flip HERO_MODE to switch:
//   "growth" — procedural R3F world-tree that GROWS with scroll (GrowthTreeScene)
//   "static" — green PNG background + 2D canvas sap particles (StaticTreeHero)
// Any non-"growth" value falls back to StaticTreeHero.
const HERO_MODE: "growth" | "static" = "growth";

const GrowthTreeScene = dynamic(() => import("./scene/GrowthTreeScene"), {
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

function deriveParams(s: NetworkSnapshot): GrowthParams {
  const activity = clamp(s.l1.txCountWindow / 110);
  const speed = 0.06 + clamp((s.l2.throughput - 6) / 18) * 0.1;
  return {
    speed,
    proofStatus: s.l2.latestProofStatus,
    settled: s.l2.latestProofStatus === "settled",
    activity,
  };
}

function Reveal({
  children,
  style,
  delay = 0,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  className?: string;
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
      className={`reveal ${seen ? "in" : ""}${className ? ` ${className}` : ""}`}
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
        Speed | Scale | Security
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
      <div className="home-hero__cue" aria-hidden>
        <span className="home-hero__rail" />
        Scroll to take root
      </div>
    </header>
  );
}

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
    line: "Use Cardano apps that run on Midgard — same wallet, same ADA.",
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
    title: "Operators & Watchers",
    line: "For Midgard operators, batchers, and watchers.",
    cta: "See the protocol roles",
    href: "/get-started#network-roles",
  },
];

function ExploreGrid() {
  return (
    <section id="explore" className="home-explore">
      <Reveal className="home-explore__head">
        <h2 className="home-explore__title">Choose your path</h2>
        <p className="home-explore__lead">
          These roles overlap. Pick the one that fits what you&apos;re here to
          do.
        </p>
      </Reveal>
      <div className="home-explore__grid">
        {AUDIENCE_PATHS.map((a, i) => (
          <Reveal key={a.title} delay={i * 70} style={{ display: "flex" }}>
            <Link href={a.href} className="grow-card">
              <div className="grow-card__num">{a.n}</div>
              <h3 className="grow-card__title">{a.title}</h3>
              <p className="grow-card__line">{a.line}</p>
              <span className="grow-card__cta">
                {a.cta} <span className="arr" aria-hidden>→</span>
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
    <section className="home-closing">
      <Reveal className="home-closing__panel">
        <h2 className="home-closing__title">Scale Cardano. Settle on Cardano.</h2>
        <p className="home-closing__lead">
          Midgard is running on a pre-alpha testnet. Read the architecture,
          inspect the source, and bring an app that needs more speed and lower
          fees.
        </p>
        <div className="home-closing__actions">
          <Link className="btn btn--primary" href="/get-started">
            Start with a use case
          </Link>
          <Link className="btn btn--ghost" href="/contracts">
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
        {HERO_MODE === "growth" ? (
          <GrowthTreeScene params={params} progressRef={progress} motionOn={motionOn} />
        ) : (
          <StaticTreeHero snap={snap} motionOn={motionOn} />
        )}
      </div>

      <main className="content home">
        <Hero />
        <ExploreGrid />
        <AboutFold />
        <ClosingCTA />
      </main>

      <MotionToggle on={motionOn} onToggle={toggle} />
    </>
  );
}
