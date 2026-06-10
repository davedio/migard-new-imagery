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

const LightOrbLayer = dynamic(() => import("../LightOrbLayer"), { ssr: false });

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
  ...rest
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "div" | "p";
  className?: string;
  delay?: number;
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
            {line}
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
  children,
}: {
  id: string;
  plate: string;
  position?: string;
  mobilePosition?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { motionOn } = useMotionPref();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-4.5%", "4.5%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.07, 1.02]);

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
      <Lines as="h2" lines={title} delay={0.08} />
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

  /* scroll parallax — the plate sinks slower than the page */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-26%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

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
    <section ref={heroRef} id="top" className="v2-scene" data-scene="hero">
      <div className="v2-scene__stage" aria-hidden>
        <div ref={plateOuter} style={{ position: "absolute", inset: 0 }}>
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
                backgroundPosition: "72% 38%",
                ["--pos-mobile" as string]: "78% 32%",
                y: motionOn ? plateY : 0,
                scale: motionOn ? plateScale : 1,
              }}
            />
          </motion.div>
        </div>
        <Motes heroRef={heroRef} />
        <div className="v2-scene__veil" data-variant="hero" />
      </div>

      <div className="v2-scene__body">
        <motion.div
          className="v2-hero"
          style={motionOn ? { y: copyY, opacity: copyOpacity } : undefined}
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.86", "end 0.5"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
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
  return (
    <div className="v2-paths">
      <div className="v2-paths__head">
        <Rise>
          <div className="v2-ch__index">
            <span className="n">02</span>
            <span className="rule" />
            <span className="stratum">Trunk — three ways in</span>
          </div>
        </Rise>
        <Lines as="h2" delay={0.08} lines={[<>Choose</>, <>your path.</>]} />
        <Rise delay={0.16}>
          <p className="v2-ch__lead">
            These roles overlap. Pick the one that fits what you&apos;re here
            to do.
          </p>
        </Rise>
      </div>
      <div className="v2-paths__rows">
        {PATHS.map((p, i) => (
          <Rise key={p.n} delay={i * 0.08}>
            <Link href={p.href} className="v2-path">
              <span className="num">{p.n}</span>
              <span className="body">
                <span className="title">{p.title}</span>
                <span className="line" style={{ display: "block" }}>
                  {p.line}
                </span>
              </span>
              <span className="cta">
                {p.cta} <span aria-hidden>→</span>
              </span>
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
  return (
    <div className="v2-ledger">
      <Rise>
        <div className="v2-ledger__grid">
          {LEDGER.map((c) => (
            <div className="v2-ledger__cell" key={c.k}>
              <div className="k">{c.k}</div>
              <div className="v" data-accent={c.accent}>
                {c.v}
              </div>
              <div className="s">{c.s}</div>
            </div>
          ))}
        </div>
      </Rise>
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
  return (
    <div className="v2-road">
      <div className="v2-road__list">
        {PHASES.map((p, i) => (
          <Rise key={p.n} delay={i * 0.07}>
            <div className="v2-road__row" data-state={p.state}>
              <span className="n">{p.n}</span>
              <span className="name">{p.name}</span>
              <span className="stat">{p.stat}</span>
              <p className="desc">{p.desc}</p>
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

      <Scene id="canopy" plate={PLATES.canopy} position="74% 40%">
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
      >
        <div style={{ paddingTop: "clamp(72px, 13vh, 160px)" }} />
        <Paths />
      </Scene>

      <Scene
        id="roots"
        plate={PLATES.roots}
        position="68% 64%"
        mobilePosition="74% 60%"
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

      <Scene id="stone" plate={PLATES.stone} position="56% 48%">
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
