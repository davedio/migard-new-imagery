"use client";

/* ============================================================================
   HOME V2 — "THE DESCENT"
   One continuous cinematic fall down the world-tree:

     HERO        the tree, whole               (hero-wide plate)
     01 CANOPY   the thesis — L2 execution     (canopy-macro plate)
     02 TRUNK    choose your path              (strata-tall plate, trunk crop)
     03 ROOTS    the ledger — protocol facts   (roots-bedrock plate)
     04 STONE    why eUTXO + who builds it     (stone-rune plate)
     05 BEDROCK  the path to mainnet           (strata-tall plate, bedrock crop)
     CLOSE       the gateway is open           (hero-wide plate, roots crop)

   Each chapter pins a full-viewport plate (position:sticky) and lets the
   copy scroll over it; plates drift/scale a few percent against the scroll
   for layered depth (no plate-splitting). All copy is the finalized site
   language — presentation only.
   ========================================================================== */

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { useMotionPref } from "@/lib/motion";
import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";
import { StackChips } from "@/components/site/StackChips";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { WaveText } from "./CursorWave";

const LightOrbLayer = dynamic(() => import("../LightOrbLayer"), { ssr: false });
const HeroSapOrbs = dynamic(() => import("./HeroSapOrbs"), { ssr: false });

/* ---------------------------------------------------------------------- */
/*  plates                                                                 */
/* ---------------------------------------------------------------------- */

const PLATES = {
  hero: "/v2/hero-wide.avif",
  canopy: "/v2/canopy-macro.avif",
  strata: "/v2/strata-tall.avif",
  roots: "/v2/roots-bedrock.avif",
  stone: "/v2/stone-rune.avif",
} as const;

/* ---------------------------------------------------------------------- */
/*  shared bits                                                            */
/* ---------------------------------------------------------------------- */

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* Element-scoped scroll progress, computed from the element's own rect on
   every page-scroll tick. (motion's useScroll({target}) silently fell back
   to PAGE progress here — geometry we own is geometry that works.)
   Returns 0 when the element's top reaches the viewport bottom and 1 when
   its bottom reaches the viewport top. */
function useViewProgress(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll();
  return useTransform(scrollYProgress, () => {
    const el = ref.current;
    if (el == null || typeof window === "undefined") return 0;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return clamp01((vh - r.top) / (vh + r.height));
  });
}

/* Progress through a PINNED runway (section taller than the viewport whose
   stage is sticky): 0 while the section top is at/below the viewport top,
   1 when its bottom meets the viewport bottom. */
function usePinProgress(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll();
  return useTransform(scrollYProgress, () => {
    const el = ref.current;
    if (el == null || typeof window === "undefined") return 0;
    const r = el.getBoundingClientRect();
    const travel = Math.max(1, r.height - window.innerHeight);
    return clamp01(-r.top / travel);
  });
}

/** Masked line reveal — each line slides up out of an overflow-hidden row.
    The viewport observer lives on the UNCLIPPED mask wrapper (a fully
    translated child inside overflow:hidden has an empty intersection rect
    and would never report "in view"); the inner span animates via variant
    propagation. */
function Lines({
  lines,
  as: Tag = "div",
  className,
  delay = 0,
  wave = false,
  ...rest
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "div" | "p";
  className?: string;
  delay?: number;
  /** Corn-Revolution cursor wave: letters near the pointer lift + magnify. */
  wave?: boolean;
} & Record<string, unknown>) {
  const { motionOn } = useMotionPref();
  return (
    <Tag className={className} {...rest}>
      {lines.map((line, i) => (
        <motion.span
          className="v2-mask"
          key={i}
          initial={motionOn ? "hidden" : false}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        >
          <motion.span
            variants={{
              hidden: { y: "112%" },
              show: {
                y: "0%",
                transition: {
                  duration: 0.9,
                  ease: EASE_EXPO,
                  delay: delay + i * 0.09,
                },
              },
            }}
          >
            {wave ? <WaveText>{line}</WaveText> : line}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  );
}

/** Soft fade-rise for body copy and blocks. */
function Rise({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { motionOn } = useMotionPref();
  return (
    <motion.div
      className={className}
      style={style}
      initial={motionOn ? { opacity: 0, y: 28 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.85, ease: EASE_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------- */
/*  scene scaffold — sticky plate + scrolling body                         */
/* ---------------------------------------------------------------------- */

function Scene({
  id,
  plate,
  position = "center",
  mobilePosition,
  ghost,
  children,
}: {
  id: string;
  plate: string;
  position?: string;
  mobilePosition?: string;
  /** giant outlined stratum numeral pinned with the stage (editorial depth) */
  ghost?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { motionOn } = useMotionPref();
  const progress = useViewProgress(ref);
  const y = useTransform(progress, [0, 1], ["-4.5%", "4.5%"]);
  const scale = useTransform(progress, [0, 1], [1.07, 1.02]);
  const ghostY = useTransform(progress, [0, 1], ["6%", "-6%"]);

  return (
    <section ref={ref} id={id} className="v2-scene" data-scene={id}>
      <div className="v2-scene__stage" aria-hidden>
        <motion.div
          className="v2-scene__plate"
          style={{
            backgroundImage: `url(${plate})`,
            backgroundPosition: position,
            ["--pos-mobile" as string]: mobilePosition ?? position,
            y: motionOn ? y : 0,
            scale: motionOn ? scale : 1,
          }}
        />
        <div className="v2-scene__veil" />
        {ghost ? (
          <motion.div
            className="v2-scene__ghost"
            style={{ y: motionOn ? ghostY : 0 }}
          >
            {ghost}
          </motion.div>
        ) : null}
      </div>
      <div className="v2-scene__body">{children}</div>
    </section>
  );
}

/** Chapter heading — index, stratum, serif title, lead. */
function Chapter({
  n,
  stratum,
  title,
  lead,
}: {
  n: string;
  stratum: string;
  title: ReactNode[];
  lead?: ReactNode;
}) {
  return (
    <div className="v2-ch">
      <Rise>
        <div className="v2-ch__index">
          <span className="n">{n}</span>
          <span className="rule" />
          <span className="stratum">{stratum}</span>
        </div>
      </Rise>
      <Lines as="h2" lines={title} delay={0.08} wave />
      {lead ? (
        <Rise delay={0.18}>
          <p className="v2-ch__lead">{lead}</p>
        </Rise>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  hero                                                                   */
/* ---------------------------------------------------------------------- */

/** Drifting bioluminescent motes — cheap 2D canvas, stops when unseen. */
function Motes({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero || !motionOn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let W = 0;
    let H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    fit();

    type Mote = {
      x: number;
      y: number;
      r: number;
      vy: number;
      sway: number;
      phase: number;
      tw: number;
    };
    const motes: Mote[] = Array.from({ length: 26 }, (_, i) => ({
      // bias toward the tree on the right
      x: (0.42 + 0.58 * Math.pow((i * 0.617) % 1, 0.6)) * W,
      y: ((i * 0.387) % 1) * H,
      r: 0.8 + ((i * 0.731) % 1) * 2.1,
      vy: 6 + ((i * 0.519) % 1) * 12,
      sway: 8 + ((i * 0.823) % 1) * 18,
      phase: ((i * 0.293) % 1) * Math.PI * 2,
      tw: 0.5 + ((i * 0.477) % 1) * 1.4,
    }));

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;
      for (const m of motes) {
        m.y -= m.vy * dt;
        if (m.y < -8) {
          m.y = H + 8;
          m.x = (0.42 + 0.58 * Math.random()) * W;
        }
        const x = m.x + Math.sin(t * 0.6 + m.phase) * m.sway;
        const a = 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(t * m.tw + m.phase));
        ctx.beginPath();
        ctx.arc(x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110, 255, 160, ${a.toFixed(3)})`;
        ctx.shadowColor = "rgba(78, 243, 131, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // run only while the hero is on screen and the tab is visible
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.02 },
    );
    io.observe(hero);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", fit);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", fit);
    };
  }, [heroRef, motionOn]);

  if (!motionOn) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

function format(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function HeroHud() {
  const { data: snap } = useNetworkSnapshot();
  return (
    <div className="v2-hero__hud">
      <div className="v2-hud-cell">
        <div className="k">Cardano L1 block</div>
        <div className="v">{format(snap.l1.blockHeight)}</div>
      </div>
      <div className="v2-hud-cell">
        <div className="k">L2 throughput</div>
        <div className="v">
          <em>{snap.l2.throughput.toFixed(1)}</em> tx/s
        </div>
      </div>
      <div className="v2-hud-cell">
        <div className="k">Latest proof</div>
        <div className="v">{snap.l2.latestProofStatus.toUpperCase()}</div>
      </div>
      <div className="v2-hud-cell">
        <div className="k">Feed</div>
        <div className="v" style={{ color: "var(--gold-bright)" }}>
          SIMULATED · LIVE AT LAUNCH
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const plateOuter = useRef<HTMLDivElement>(null);
  const { motionOn } = useMotionPref();

  /* The Corn-Revolution grammar: the copy NEVER travels vertically — it sits
     pinned and fades while only the background moves. The hero owns a 230svh
     runway; the stage (plate + orbs + copy) is sticky for all of it. As you
     scroll, the plate zooms slowly and the sap orbs detach from the veins
     into a rising double-helix — the tree transforms into the network. */
  const heroProgress = usePinProgress(heroRef);
  const dissolveRef = useRef(0);
  useMotionValueEvent(heroProgress, "change", (v) => {
    dissolveRef.current = v;
  });
  const plateY = useTransform(heroProgress, [0, 1], ["0%", "4%"]);
  const plateScale = useTransform(heroProgress, [0, 1], [1, 1.09]);
  /* the camera turns TOWARD the tree as it transforms: background-position
     eases 72% -> 92% (HIGHER position-x pulls a right-side subject toward
     centre) so the trunk and its helix land ~3/4 frame instead of bleeding
     off the right edge. HeroSapOrbs mirrors this exact ramp — keep in sync. */
  const platePosX = useTransform(heroProgress, [0.15, 0.7], [72, 92]);
  const platePos = useMotionTemplate`${platePosX}% 38%`;
  /* the tree recedes a touch as the helix takes over — subtle, not a
     blackout, but enough contrast for the beads to burn bright */
  const recede = useTransform(heroProgress, [0.26, 0.75], [0, 0.36]);
  const copyOpacity = useTransform(heroProgress, [0, 0.1, 0.22], [1, 1, 0]);
  const copyScale = useTransform(heroProgress, [0, 0.22], [1, 0.97]);

  /* mouse parallax — lerped, fine pointers only, on its own wrapper so the
     transform never fights the scroll/intro layers */
  useEffect(() => {
    const el = plateOuter.current;
    if (!el || !motionOn) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -14;
      ty = (e.clientY / window.innerHeight - 0.5) * -10;
    };
    const tick = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(1.02)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [motionOn]);

  return (
    <section
      ref={heroRef}
      id="top"
      className="v2-scene v2-scene--hero"
      data-scene="hero"
    >
      <div className="v2-scene__stage">
        <div ref={plateOuter} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <motion.div
            style={{ position: "absolute", inset: 0 }}
            initial={motionOn ? { opacity: 0, scale: 1.09 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: EASE_EXPO }}
          >
            <motion.div
              className="v2-scene__plate"
              style={{
                backgroundImage: `url(${PLATES.hero})`,
                backgroundPosition: motionOn ? platePos : "72% 38%",
                ["--pos-mobile" as string]: "78% 32%",
                y: motionOn ? plateY : 0,
                scale: motionOn ? plateScale : 1,
              }}
            >
              {/* sap orbs share the plate's box + transforms, so they stay
                  glued to the painted veins through every parallax move;
                  past ~35% of the hero they detach into the helix */}
              <HeroSapOrbs progressRef={dissolveRef} />
              {/* the tree steps back as the network takes over */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#040705",
                  opacity: motionOn ? recede : 0,
                }}
              />
            </motion.div>
          </motion.div>
        </div>
        <Motes heroRef={heroRef} />
        <div className="v2-scene__veil" data-variant="hero" aria-hidden />

        {/* copy is pinned INSIDE the sticky stage: it fades, never travels */}
        <motion.div
          className="v2-hero"
          style={motionOn ? { opacity: copyOpacity, scale: copyScale } : undefined}
        >
          <div className="v2-hero__inner">
          <Rise>
            <span className="v2-hero__eyebrow">
              <span className="tick" aria-hidden />
              Speed · Scale · Security
            </span>
          </Rise>
          <Lines
            as="h1"
            delay={0.12}
            wave
            lines={[
              <>Built to scale.</>,
              <>
                Rooted in <span className="ital">Cardano</span>.
              </>,
            ]}
          />
          <Rise delay={0.32}>
            <p className="v2-hero__lead">
              Midgard is a Cardano-native optimistic rollup that gives
              applications a faster execution layer while keeping Cardano as
              the root of trust.
            </p>
          </Rise>
          <Rise delay={0.42}>
            <div className="v2-hero__actions">
              <Link className="btn btn--primary" href="/get-started">
                Get Started
              </Link>
              <a
                className="btn-link--gold"
                href="https://anastasia-labs.github.io/midgard/midgard.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the whitepaper
              </a>
            </div>
          </Rise>
            <Rise delay={0.55}>
              <div className="v2-hero__meta">
                <HeroHud />
                <span className="v2-hero__scrollcue">
                  <span className="line" aria-hidden />
                  Descend
                </span>
              </div>
            </Rise>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/*  marquee                                                                */
/* ---------------------------------------------------------------------- */

const TERMS = [
  "Optimistic rollup",
  "Settles on Cardano L1",
  "Fraud proofs",
  "eUTXO",
  "Same wallet · Same ADA",
  "24/7 watchers",
  "Open source",
  "Pre-alpha testnet",
];

function Marquee() {
  const seq = (hidden: boolean) => (
    <div className="v2-marquee__seq" aria-hidden={hidden || undefined}>
      {TERMS.map((t) => (
        <span key={t}>
          {t} <i aria-hidden>◆</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className="v2-marquee" aria-hidden>
      <div className="v2-marquee__track">
        {seq(false)}
        {seq(true)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  01 — canopy / thesis (word-by-word scroll brighten)                    */
/* ---------------------------------------------------------------------- */

type Phrase = { text: string; cls?: string };

const THESIS: Phrase[][] = [
  [
    { text: "The usual way to scale a blockchain is to leave it —" },
    { text: "move to a faster network, accept a weaker security model," },
    { text: "learn a new stack, and split your liquidity on the way out." },
  ],
  [
    { text: "Midgard keeps you on", cls: "hi" },
    { text: "Cardano.", cls: "hi-green" },
    { text: "Your apps run at Layer 2 speed, and every result", cls: "hi" },
    { text: "settles back to Cardano L1.", cls: "hi-green" },
  ],
];

function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { motionOn } = useMotionPref();
  /* 0 when the block's top crosses 86% of the viewport, 1 when its bottom
     reaches the middle — same grammar as the old target offsets, computed
     from the element's own rect. */
  const { scrollYProgress } = useScroll();
  const prog = useTransform(scrollYProgress, () => {
    const el = ref.current;
    if (el == null || typeof window === "undefined") return 0;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return clamp01((vh * 0.86 - r.top) / (vh * 0.36 + r.height));
  });
  useMotionValueEvent(prog, "change", (v) => {
    ref.current?.style.setProperty("--prog", v.toFixed(4));
  });

  // pre-split words with stable indices across both paragraphs
  const paragraphs = useMemo(() => {
    let count = 0;
    const out = THESIS.map((phrases) =>
      phrases.flatMap((p) =>
        p.text.split(" ").map((w) => ({ w, cls: p.cls, i: count++ })),
      ),
    );
    return { out, total: count };
  }, []);

  return (
    <div
      ref={ref}
      className="v2-statement"
      style={{ ["--prog" as string]: motionOn ? 0 : 2 }}
    >
      {paragraphs.out.map((words, pi) => (
        <p key={pi}>
          {words.map(({ w, cls, i }) => (
            <span
              key={i}
              className={`w${cls ? ` ${cls}` : ""}`}
              style={{ ["--i" as string]: (i / paragraphs.total).toFixed(4) }}
            >
              {w}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  02 — trunk / paths                                                     */
/* ---------------------------------------------------------------------- */

const PATHS = [
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
    cta: "Start building",
    href: "/get-started#builder-quickstart",
  },
  {
    n: "03",
    title: "Operators & Watchers",
    line: "For Midgard operators, batchers, and watchers.",
    cta: "Run the protocol",
    href: "/get-started#network-roles",
  },
] as const;

function Paths() {
  /* The approved card treatment from the original home: translucent glass
     panels (the plate reads through them) with the green edge-glow hover —
     the #explore id lights up the original globals.css rules. */
  return (
    <div className="v2-explore" id="explore">
      <div className="v2-explore__grid">
        {PATHS.map((p, i) => (
          <Rise key={p.n} delay={i * 0.07} style={{ display: "flex" }}>
            <Link href={p.href} className="panel panel--select-glow v2-explore__card">
              <div className="v2-explore__num">{p.n}</div>
              <h3>{p.title}</h3>
              <p>{p.line}</p>
              <span className="panel-cta-glow">{p.cta} →</span>
            </Link>
          </Rise>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  03 — roots / ledger                                                    */
/* ---------------------------------------------------------------------- */

function ThroughputValue() {
  const [n, setN] = useState(0);
  const done = useRef(false);
  return (
    <motion.div
      className="v2-ledger__cell-anim"
      onViewportEnter={() => {
        if (done.current) return;
        done.current = true;
        animate(0, 300, {
          duration: 1.7,
          ease: EASE_EXPO,
          onUpdate: (v) => setN(Math.round(v)),
        });
      }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      Up to ~{n}×
    </motion.div>
  );
}

const LEDGER: {
  k: string;
  v: ReactNode;
  s: string;
  accent?: "green" | "gold";
}[] = [
  {
    k: "Usable in seconds",
    v: "Seconds",
    s: "instant, usable confirmation",
    accent: "green",
  },
  { k: "Fully settled", v: "3–7 days", s: "L1 challenge window", accent: "gold" },
  {
    k: "Throughput",
    v: <ThroughputValue />,
    s: "target throughput · pre-benchmark",
  },
  { k: "Fraud proofs", v: "eUTXO-targeted", s: "surgical, not global" },
  { k: "Fees", v: "ADA", s: "settled on Cardano L1" },
  { k: "Status", v: "Pre-alpha", s: "Cardano preprod testnet", accent: "gold" },
];

function Ledger() {
  /* Compact stat tiles at the original StatTiles scale. */
  return (
    <div className="v2-ledger">
      <div className="v2-tiles">
        {LEDGER.map((c, i) => (
          <Rise key={c.k} delay={i * 0.05} style={{ display: "block" }}>
            <div className="panel v2-tile">
              <div className="k">{c.k}</div>
              <div className="v" data-accent={c.accent}>
                {c.v}
              </div>
              <div className="s">{c.s}</div>
            </div>
          </Rise>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  04 — stone / eUTXO duel + provenance                                   */
/* ---------------------------------------------------------------------- */

const DUEL = {
  us: {
    tag: "Midgard · eUTXO",
    title: "Surgical fraud proofs",
    thesis:
      "Deterministic eUTXO execution means a fraud proof re-runs only the specific inputs of a bad transaction — the referenced inputs, the validator, and the transaction hash. Verification is fast, cheap, and conclusive on Cardano L1.",
    points: [
      "Minimal data to verify a proof",
      "Cheap, conclusive L1 verification",
      "Lower bar to run a Watcher",
      "No global state scan",
    ],
  },
  them: {
    tag: "Account-model rollups",
    title: "Global state replay",
    thesis:
      "Account-based rollups replay transactions against shared global state across many contracts to prove fraud — heavier data, more computation, and higher operating cost to verify on L1.",
    points: [
      "Large data footprint",
      "Expensive L1 verification",
      "Heavier hardware for watchers",
      "Fewer independent watchers",
    ],
  },
};

function Duel() {
  return (
    <Rise>
      <div className="v2-duel">
        {(["us", "them"] as const).map((side) => {
          const d = DUEL[side];
          return (
            <div className="v2-duel__side" data-side={side} key={side}>
              <span className="tag">{d.tag}</span>
              <h3>{d.title}</h3>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--text-dim)",
                }}
              >
                {d.thesis}
              </p>
              <ul>
                {d.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Rise>
  );
}

function Provenance() {
  return (
    <div className="v2-prov">
      <div>
        <Rise>
          <div className="v2-ch__index">
            <span className="rule" style={{ flexBasis: 30 }} />
            <span className="stratum">Who builds it</span>
          </div>
        </Rise>
        <Lines
          as="h2"
          delay={0.06}
          wave
          className="v2-prov__title"
          lines={[<>Built by</>, <>Anastasia Labs.</>]}
          style={{
            margin: "22px 0 0",
            fontSize: "clamp(27px, 3.2vw, 50px)",
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            color: "var(--bone)",
            fontWeight: 500,
          }}
        />
      </div>
      <div className="v2-prov__body">
        <Rise>
          <p>
            Midgard is built by Anastasia Labs, a team that builds Cardano
            infrastructure and open-source developer tooling.
          </p>
          <p>
            The protocol is open and the code can be inspected. The status page
            shows what&apos;s live, what&apos;s planned, and what&apos;s still
            simulated.
          </p>
        </Rise>
        <Rise delay={0.1}>
          <div className="v2-prov__actions">
            <Link className="btn btn--ghost" href="/about">
              Read the full story
            </Link>
            <a
              className="btn btn--ghost"
              href={OFFICIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon size={14} aria-hidden /> View GitHub
            </a>
          </div>
        </Rise>
        <Rise delay={0.16}>
          <div className="v2-prov__chips">
            <StackChips />
          </div>
        </Rise>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  05 — bedrock / roadmap                                                 */
/* ---------------------------------------------------------------------- */

const PHASES = [
  {
    n: "01",
    name: "Pre-alpha testnet",
    desc: "Where Midgard is today: running on the Cardano preprod testnet so the rollup model can be exercised end to end. Expect rough edges — nothing here carries production weight yet.",
    state: "current",
    stat: "Current phase",
  },
  {
    n: "02",
    name: "Public testnet",
    desc: "Wider participation opens up. Operators and watchers onboard to sequence blocks and submit fraud proofs, and builders bring real application flows onto the network.",
    state: "next",
    stat: "Next",
  },
  {
    n: "03",
    name: "Audit & hardening",
    desc: "External security review of contracts and protocol, alongside the benchmarks that turn target throughput into measured throughput. Findings are addressed before mainnet weight is placed on Midgard.",
    state: "later",
    stat: "Planned",
  },
  {
    n: "04",
    name: "Mainnet",
    desc: "Settlement on Cardano mainnet, with L1 as the root of trust. Timing follows the work — testnet maturity, audit outcomes, and benchmarks — not a fixed calendar date.",
    state: "mainnet",
    stat: "Settles on L1",
  },
] as const;

function Road() {
  /* The original 4-up roadmap panel cards: accent number, body, accent bar,
     "Current phase" badge — at the original card scale. */
  return (
    <div className="v2-road">
      <div className="v2-road__grid">
        {PHASES.map((p, i) => (
          <Rise key={p.n} delay={i * 0.07} style={{ display: "flex" }}>
            <div className="panel v2-phase" data-state={p.state}>
              {p.state === "current" ? (
                <span className="v2-phase__badge">Current phase</span>
              ) : null}
              <div className="v2-phase__num">{p.n}</div>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="v2-phase__bar" aria-hidden />
            </div>
          </Rise>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  closing                                                                */
/* ---------------------------------------------------------------------- */

function Closing() {
  return (
    <div className="v2-close">
      <div className="v2-close__inner">
        <Rise>
          <div className="v2-ch__index">
            <span className="rule" style={{ flexBasis: 30 }} />
            <span className="stratum">The gateway is open</span>
          </div>
        </Rise>
        <Lines
          as="h2"
          delay={0.08}
          wave
          lines={[
            <>Scale Cardano.</>,
            <>
              <em>Settle</em> on Cardano.
            </>,
          ]}
        />
        <Rise delay={0.2}>
          <p className="v2-close__lead">
            Midgard is running on a pre-alpha testnet. Read the architecture,
            inspect the source, and bring an app that needs more speed and
            lower fees.
          </p>
        </Rise>
        <Rise delay={0.3}>
          <div className="v2-close__actions">
            <Link className="btn btn--primary" href="/get-started">
              Start with a use case
            </Link>
            <Link className="btn btn--ghost" href="/contracts">
              Testnet status
            </Link>
          </div>
        </Rise>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  depth rail                                                             */
/* ---------------------------------------------------------------------- */

const STRATA = [
  { id: "top", label: "Surface", stratum: "surface" },
  { id: "canopy", label: "Canopy · L2", stratum: "canopy" },
  { id: "trunk", label: "Trunk · Paths", stratum: "trunk" },
  { id: "roots", label: "Roots · Ledger", stratum: "roots" },
  { id: "stone", label: "Stone · eUTXO", stratum: "stone" },
  { id: "bedrock", label: "Bedrock · L1", stratum: "bedrock" },
] as const;

function DepthRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const sections = STRATA.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <nav className="v2-rail" aria-label="Page strata">
      {STRATA.map((s) => (
        <button
          key={s.id}
          type="button"
          className="v2-rail__item"
          data-active={active === s.id}
          data-stratum={s.stratum}
          onClick={() => jump(s.id)}
        >
          <span className="lbl">{s.label}</span>
          <span className="dot" aria-hidden />
        </button>
      ))}
    </nav>
  );
}

/* ---------------------------------------------------------------------- */
/*  motion toggle (same chrome classes as v1 so globals.css styles it)     */
/* ---------------------------------------------------------------------- */

function MotionToggle() {
  const { motionOn, toggle } = useMotionPref();
  return (
    <button
      type="button"
      className="motion-toggle"
      onClick={toggle}
      aria-pressed={motionOn}
      aria-label={motionOn ? "Turn motion effects off" : "Turn motion effects on"}
      title={motionOn ? "Turn motion effects off" : "Turn motion effects on"}
    >
      <span className="motion-toggle__glyph" data-on={motionOn} aria-hidden />
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/*  composition                                                            */
/* ---------------------------------------------------------------------- */

export default function HomeV2() {
  const { motionOn } = useMotionPref();
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <main className="v2-home" data-motion={motionOn ? "on" : "off"}>
      {/* React hoists these to <head> — the hero plate is the LCP image */}
      <link rel="preload" as="image" href={PLATES.hero} />
      <Hero />
      <Marquee />

      <Scene id="canopy" plate={PLATES.canopy} position="74% 40%" ghost="01">
        <Chapter
          n="01"
          stratum="Canopy — the thesis"
          title={[<>Scale that stays</>, <>on Cardano.</>]}
        />
        <Statement />
      </Scene>

      <Scene
        id="trunk"
        plate={PLATES.strata}
        position="50% 32%"
        mobilePosition="58% 32%"
        ghost="02"
      >
        <Chapter
          n="02"
          stratum="Trunk — three ways in"
          title={[<>Choose your path.</>]}
          lead="These roles overlap. Pick the one that fits what you're here to do."
        />
        <Paths />
      </Scene>

      <Scene
        id="roots"
        plate={PLATES.roots}
        position="68% 64%"
        mobilePosition="74% 60%"
        ghost="03"
      >
        <Chapter
          n="03"
          stratum="Roots — protocol at a glance"
          title={[<>Fast confirmations now,</>, <>final settlement on Cardano.</>]}
          lead={
            <>
              The numbers behind Midgard&apos;s pre-alpha testnet:{" "}
              <strong>usable speed today</strong>, with final settlement on
              Cardano.
            </>
          }
        />
        <Ledger />
      </Scene>

      <Scene id="stone" plate={PLATES.stone} position="56% 48%" ghost="04">
        <Chapter
          n="04"
          stratum="Stone — why eUTXO"
          title={[<>Why eUTXO builds</>, <>a better rollup.</>]}
          lead={
            <>
              Cardano&apos;s eUTXO model makes fraud proofs surgical: Midgard
              re-executes only the inputs of a bad transaction —{" "}
              <strong>no global state scan</strong>.
            </>
          }
        />
        <Duel />
        <Provenance />
      </Scene>

      <Scene
        id="bedrock"
        plate={PLATES.strata}
        position="50% 96%"
        mobilePosition="56% 96%"
        ghost="05"
      >
        <Chapter
          n="05"
          stratum="Bedrock — the path to mainnet"
          title={[<>Paced by the work,</>, <>not by dates.</>]}
          lead="Midgard is pre-alpha. The route from today's testnet to settlement on Cardano mainnet runs through four phases."
        />
        <Road />
        <Closing />
      </Scene>

      <DepthRail />
      <MotionToggle />
      <LightOrbLayer enabled={motionOn && finePointer} />
    </main>
  );
}
