"use client";

/* ============================================================================
   Shared home-page content blocks — copy, cards, tiles, roadmap, closing.
   Used by BOTH presentation paths:
     · DescentFlow (motion on)  — pinned overlays over the one-flow stage
     · HomeV2 fallback (motion off) — plain stacked sections
   Copy here is the finalized site language; presentation lives elsewhere.
   ========================================================================== */

import Link from "next/link";
import { animate, motion } from "motion/react";
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useMotionPref } from "@/lib/motion";
import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Soft fade-rise for body copy and blocks (used by the fallback path and
    inside overlays, where it plays once the overlay becomes visible). */
export function Rise({
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
/*  hero HUD                                                               */
/* ---------------------------------------------------------------------- */

function format(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function HeroHud() {
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

export function Marquee() {
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
/*  thesis statement (word-by-word scroll brighten)                        */
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

/**
 * The thesis statement. Each paragraph clips into place once and then sits
 * FULLY readable — the old word-by-word scroll brighten left readers staring
 * at half-dimmed copy (review 2026-06-11: "no rolling fade").
 */
export function Statement() {
  const { motionOn } = useMotionPref();

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
    <div className="v2-statement">
      {paragraphs.out.map((words, pi) => (
        /* each paragraph CLIPS into place — snaps up out of a masked row,
           quick and decisive (review 2026-06-11: "clip into place").
           The viewport observer lives on the UNCLIPPED mask wrapper — a
           fully-translated child inside overflow:hidden has an empty
           intersection rect and would never report "in view". */
        <motion.span
          className="v2-mask"
          key={pi}
          initial={motionOn ? "hidden" : false}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          <motion.p
            variants={{
              hidden: { y: "104%" },
              show: {
                y: "0%",
                transition: { duration: 0.55, ease: EASE_EXPO, delay: pi * 0.14 },
              },
            }}
          >
            {words.map(({ w, cls, i }) => (
              <span
                key={i}
                className={`w${cls ? ` ${cls}` : ""}`}
                style={{ ["--i" as string]: (i / paragraphs.total).toFixed(4) }}
              >
                {w}{" "}
              </span>
            ))}
          </motion.p>
        </motion.span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  trunk / paths                                                          */
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

export function Paths() {
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
/*  roots / ledger                                                         */
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

export function Ledger() {
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
/*  proofs / eUTXO duel + provenance                                       */
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

export function Duel() {
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

export function Provenance({ compact = false }: { compact?: boolean }) {
  return (
    <div className="v2-prov" data-compact={compact || undefined}>
      <div>
        <Rise>
          <div className="v2-ch__index">
            <span className="rule" style={{ flexBasis: 30 }} />
            <span className="stratum">Who builds it</span>
          </div>
        </Rise>
        <Rise delay={0.06}>
          <h2 className="v2-prov__title">
            Built by
            <br />
            Anastasia Labs.
          </h2>
        </Rise>
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
            <Link className="btn btn--ghost" href="/contracts">
              See the contracts
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
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  depth rail + motion toggle                                             */
/* ---------------------------------------------------------------------- */

export const STRATA = [
  { id: "top", label: "Surface", stratum: "surface" },
  { id: "canopy", label: "Canopy · L2", stratum: "canopy" },
  { id: "trunk", label: "Trunk · Paths", stratum: "trunk" },
  { id: "roots", label: "Roots · Ledger", stratum: "roots" },
  { id: "proofs", label: "Proofs · eUTXO", stratum: "proofs" },
  { id: "bedrock", label: "Bedrock · L1", stratum: "bedrock" },
] as const;

export function MotionToggle() {
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
