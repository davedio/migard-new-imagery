"use client";

/* ============================================================================
   Shared home-page content blocks — copy, cards, tiles, and closing.
   Used by BOTH presentation paths:
     · DescentFlow (motion on)  — pinned overlays over the one-flow stage
     · HomeV2 fallback (motion off) — plain stacked sections
   Copy here is the finalized site language; presentation lives elsewhere.
   ========================================================================== */

import { motion } from "motion/react";
import Image from "next/image";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useMotionPref } from "@/lib/motion";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Shared wrapper for body copy and blocks across motion and fallback paths. */
export function Rise({
  children,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ecosystem partners                                                     */
/* ---------------------------------------------------------------------- */

const PARTNERS = [
  {
    name: "Liqwid",
    logo: "/ecosystem/liqwid.svg",
    width: 190,
    height: 60,
    tone: "dark",
  },
  {
    name: "Sundae Labs",
    logo: "/ecosystem/sundae-labs.png",
    width: 210,
    height: 36,
    tone: "light",
  },
  {
    name: "Input Output",
    logo: "/ecosystem/input-output.svg",
    width: 210,
    height: 27,
    tone: "dark",
  },
  {
    name: "Lace",
    logo: "/ecosystem/lace-wordmark.svg",
    width: 150,
    height: 50,
    tone: "dark",
  },
  {
    name: "Artifi Labs",
    logo: "/ecosystem/artifi-labs.png",
    width: 230,
    height: 43,
    tone: "dark",
  },
] as const;

/* ---------------------------------------------------------------------- */
/*  hero partner strip                                                     */
/* ---------------------------------------------------------------------- */

export function HeroHud() {
  return (
    <div className="v2-hero__logos" aria-label="Ecosystem partner logos">
      {PARTNERS.map((partner) => (
        <span className="v2-hero-logo" data-tone={partner.tone} key={partner.name}>
          <Image
            src={partner.logo}
            alt={partner.name}
            width={partner.width}
            height={partner.height}
            loading="eager"
            unoptimized={partner.logo.endsWith(".svg")}
          />
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  marquee                                                                */
/* ---------------------------------------------------------------------- */

const TERMS = [
  "Optimistic rollup",
  "L1 settlement",
  "Fault proofs",
  "eUTXO",
  "Familiar wallets",
  "Formal methods",
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

function PartnerSequence({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="v2-partners__seq" aria-hidden={hidden || undefined}>
      {PARTNERS.map((partner) => (
        <li key={partner.name}>
          <div
            className="v2-partner"
            data-tone={partner.tone}
            role="img"
            aria-label={partner.name}
          >
            <span className="v2-partner__plate">
              <Image
                src={partner.logo}
                alt=""
                width={partner.width}
                height={partner.height}
                loading="eager"
                unoptimized={partner.logo.endsWith(".svg")}
              />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PartnerMarquee() {
  return (
    <section className="v2-partners" aria-labelledby="ecosystem-partners-title">
      <div className="v2-partners__head">
        <p className="v2-partners__kicker">Network</p>
        <h2 id="ecosystem-partners-title">Ecosystem Partners</h2>
        <p className="v2-partners__sub">UTXO-native teams around Midgard.</p>
      </div>
      <div className="v2-partners__rail" aria-label="Ecosystem partner logos">
        <div className="v2-partners__track">
          <PartnerSequence />
          <PartnerSequence hidden />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/*  thesis statement (word-by-word scroll brighten)                        */
/* ---------------------------------------------------------------------- */

type Phrase = { text: string; cls?: string };

const THESIS: Phrase[][] = [
  [
    { text: "UTXO finance should not have to choose between speed and security." },
    { text: "Midgard gives UTXO applications faster execution" },
    { text: "with settlement anchored to L1." },
  ],
  [
    { text: "Security comes from", cls: "hi" },
    { text: "mathematically verified smart contracts," },
    { text: "fault-proof verification, and a smaller eUTXO attack surface.", cls: "hi" },
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

/* Two-page preview branch: the /get-started destinations are not part of
   this build, so the path cards route to the live community surfaces. */
const PATHS = [
  {
    n: "01",
    title: "Users",
    line: "Use UTXO finance applications with faster execution and familiar wallet flows.",
    cta: "Start as a user",
    href: OFFICIAL_LINKS.discord,
  },
  {
    n: "02",
    title: "Builders",
    line: "Build UTXO applications that need more throughput without leaving the UTXO model.",
    cta: "Start building",
    href: OFFICIAL_LINKS.github,
  },
  {
    n: "03",
    title: "Operators",
    line: "Run infrastructure for Midgard as the network moves through staged testnet and toward broader participation.",
    cta: "Register interest",
    href: OFFICIAL_LINKS.intakeForm,
  },
  {
    n: "04",
    title: "Watchers",
    line: "Monitor the protocol and participate in fault-proof verification.",
    cta: "Review the code",
    href: OFFICIAL_LINKS.github,
  },
] as const;

export function Paths() {
  const isGitHub = (href: string) => href === OFFICIAL_LINKS.github;

  return (
    <div className="v2-explore" id="explore">
      <div className="v2-explore__grid">
        {PATHS.map((p, i) => (
          <Rise key={p.n} delay={i * 0.07} style={{ display: "flex" }}>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel--select-glow v2-explore__card"
            >
              <div className="v2-explore__num">{p.n}</div>
              <h3>{p.title}</h3>
              <p>{p.line}</p>
              <span className="panel-cta-glow">
                {isGitHub(p.href) ? <GitHubIcon size={14} aria-hidden /> : null}
                {p.cta} →
              </span>
            </a>
          </Rise>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  roots / ledger                                                         */
/* ---------------------------------------------------------------------- */

const LEDGER: {
  k: string;
  v: ReactNode;
  s: string;
  accent?: "green" | "gold";
}[] = [
  {
    k: "Soft confirmations",
    v: "Seconds",
    s: "usable pre-alpha confirmation",
    accent: "green",
  },
  { k: "Settlement window", v: "3–7 days", s: "challenge window before settlement", accent: "gold" },
  { k: "Execution model", v: "eUTXO-native", s: "built for UTXO finance" },
  {
    k: "Verified contracts",
    v: "Formal methods",
    s: "mathematically verified smart contracts",
  },
  { k: "Fees", v: "ADA", s: "no separate gas token" },
  { k: "Status", v: "Pre-alpha", s: "public testnet status", accent: "gold" },
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
/*  provenance                                                             */
/* ---------------------------------------------------------------------- */

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
            Midgard Labs.
          </h2>
        </Rise>
      </div>
      <div className="v2-prov__body">
        <Rise>
          <p>
            Midgard is built by Midgard Labs for UTXO applications that need
            faster execution and L1 settlement.
          </p>
          <p>
            The protocol is open and the code can be inspected. As the testnet
            matures, public claims should stay tied to live status, measured
            benchmarks, and approved protocol parameters.
          </p>
        </Rise>
        <Rise delay={0.1}>
          <div className="v2-prov__actions">
            <a
              className="btn btn--ghost"
              href="https://anastasia-labs.github.io/midgard/midgard.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Whitepaper
            </a>
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
  { id: "top", label: "Intro", stratum: "surface" },
  { id: "canopy", label: "Thesis", stratum: "canopy" },
  { id: "trunk", label: "Paths", stratum: "trunk" },
  { id: "roots", label: "Metrics", stratum: "roots" },
  { id: "proofs", label: "Fault proofs · eUTXO", stratum: "proofs" },
  { id: "bedrock", label: "Settlement · L1", stratum: "bedrock" },
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
