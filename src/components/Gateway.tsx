"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useSpring } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";
import { useMotionPref } from "@/lib/motion";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import type { NetworkSnapshot } from "@/lib/network";
import type { JourneyParams } from "./scene/JourneyScene";
import { AboutFold } from "./site/AboutFold";

/* ============================================================
   Gateway — the FLAGSHIP home composition.

   Scroll = riding a transaction through Midgard's lifecycle, TOP->DOWN
   (canopy -> roots). A fixed 3D stage holds the world-tree + the
   transaction journey (JourneyScene); the scrolling .content sits over
   it. We add three RESN-class interaction systems, all desktop +
   motion-on only and fully bypassed under reduced motion:

     1. inertial smooth scroll (useSmoothScroll) — native scrollbar
        kept, content layer rAF-lerped for weight.
     2. a custom cursor (CustomCursor) with magnetic targets + labels.
     3. a spring-smoothed scroll progress feeding BOTH the 3D scene
        (buttery beats) and the HUD chapter labels.
   ============================================================ */

const JourneyScene = dynamic(() => import("./scene/JourneyScene"), {
  ssr: false,
});
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const ChapterLabels = dynamic(() => import("./scene/ChapterLabels"), {
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

function deriveParams(s: NetworkSnapshot): JourneyParams {
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
  variant = "up",
}: {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  className?: string;
  variant?: "up" | "mask";
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
      className={`reveal reveal--${variant} ${seen ? "in" : ""}${
        className ? ` ${className}` : ""
      }`}
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
      data-cursor={on ? "motion off" : "motion on"}
      data-magnetic
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
        <Link
          className="btn btn--primary"
          href="/get-started"
          data-cursor="enter"
          data-magnetic
        >
          Get Started
        </Link>
        <a
          className="btn btn--ghost"
          href="https://anastasia-labs.github.io/midgard/midgard.pdf"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="open"
          data-magnetic
        >
          Whitepaper
        </a>
      </div>
      <div className="home-hero__cue" aria-hidden>
        <span className="home-hero__rail" />
        Scroll to follow a transaction
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
          <Reveal key={a.title} delay={i * 90} variant="mask" style={{ display: "flex" }}>
            <Link
              href={a.href}
              className="grow-card"
              data-cursor={a.title.toLowerCase()}
              data-magnetic
              data-tilt
            >
              <div className="grow-card__num">{a.n}</div>
              <h3 className="grow-card__title">{a.title}</h3>
              <p className="grow-card__line">{a.line}</p>
              <span className="grow-card__cta">
                {a.cta} <span className="arr" aria-hidden>→</span>
              </span>
              <span className="grow-card__sheen" aria-hidden />
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
          <Link
            className="btn btn--primary"
            href="/get-started"
            data-cursor="enter"
            data-magnetic
          >
            Start with a use case
          </Link>
          <Link
            className="btn btn--ghost"
            href="/contracts"
            data-cursor="view"
            data-magnetic
          >
            Testnet status
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ----------------------------------------------------------------
   Lightweight 3D-tilt for cards (data-tilt). Pointer-position drives
   a small rotateX/rotateY via CSS vars; resets on leave. Desktop +
   motion-on only (gated by the parent). Composes with the magnetic
   translate (different vars) and the card's own hover styles.
   ---------------------------------------------------------------- */
function useCardTilt(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt]"),
    );
    const handlers: Array<() => void> = [];
    cards.forEach((card) => {
      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-py * 7).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(px * 9).toFixed(2)}deg`);
        card.style.setProperty("--sheen-x", `${((px + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty("--sheen-y", `${((py + 0.5) * 100).toFixed(1)}%`);
      };
      const onLeave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      handlers.push(() => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      });
    });
    return () => handlers.forEach((h) => h());
  }, [active]);
}

/* Render fixed overlay layers into <body>, OUTSIDE the smooth-scroll
   transform wrapper. A `position: fixed` element inside a transformed
   ancestor is positioned relative to that ancestor and would be dragged
   by the scroll translate; portaling to body keeps the 3D stage, HUD,
   cursor and toggle truly viewport-fixed. SSR-safe (renders nothing
   until mounted). */
function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function Gateway() {
  const { data: snap } = useNetworkSnapshot();
  const { motionOn, toggle } = useMotionPref();

  // desktop + motion-on gate for the heavy interaction systems
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const advanced = motionOn && finePointer;

  // --- smoothed scroll progress that BOTH the scene and HUD read ---
  // The smooth-scroll hook writes a rAF-lerped 0..1 into smoothProgressRef.
  // We mirror it into a spring MotionValue for the HUD (buttery, no jumps).
  // The hook targets the (site) layout's [data-scroll-content] wrapper.
  const smoothProgressRef = useRef(0);
  useSmoothScroll(smoothProgressRef, motionOn);

  // A spring MotionValue the HUD subscribes to; fed each frame from the ref.
  const springProgress = useSpring(0, { stiffness: 90, damping: 26, mass: 0.6 });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      springProgress.set(smoothProgressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [springProgress]);

  // shared pointer ref the scene reads so canopy sparks follow the cursor.
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!advanced || typeof window === "undefined") return;
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [advanced]);

  useCardTilt(advanced);

  const params = deriveParams(snap);

  return (
    <>
      {/* Fixed/viewport layers live in <body>, escaping the smooth-scroll
          transform wrapper so they stay truly fixed (see BodyPortal). */}
      <BodyPortal>
        <div className="scene-stage">
          <JourneyScene
            params={params}
            progressRef={smoothProgressRef}
            pointerRef={pointerRef}
            motionOn={motionOn}
          />
        </div>
        <ChapterLabels progress={springProgress} enabled={motionOn} />
        <CustomCursor enabled={advanced} />
        <MotionToggle on={motionOn} onToggle={toggle} />
      </BodyPortal>

      {/* The scrolling content. The (site) layout wraps this + the footer in
          [data-scroll-content], which the inertial-scroll hook translates. */}
      <main className="content home">
        <Hero />
        <ExploreGrid />
        <AboutFold />
        <ClosingCTA />
      </main>
    </>
  );
}
