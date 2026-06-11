"use client";

/* ============================================================================
   DescentFlow — one continuous stage, normally-flowing text.

   Round 2 (client review 2026-06-11): the fully-pinned corn grammar made
   every scroll tick feel overloaded ("so much happens with every scroll…
   it gets stuck in stage 2"). The text now FLOWS vertically with the page
   like any document — only the BACKGROUND is choreographed:

     · ONE fixed stage behind the content: a single canvas drawing the
       tree, the particles and the plate crossfades (never any image
       subsections)
     · the tree never leaves: the helix grows bright OVER it, then slowly
       collapses into a single settlement orb that rides the trunk down —
       deliberately, across four sections — and detonates blue at the
       bottom over the roots close-up
     · chapter copy scrolls naturally and earns soft whileInView reveals;
       a single rAF lerps the scroll (ease 0.11) and drives ONLY the
       canvas phases + the depth rail
   ========================================================================== */

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMotionPref } from "@/lib/motion";
import WorldTreeCanvas, { PHASES_REST, type DescentPhases } from "./WorldTreeCanvas";
import ShatterHeading from "./ShatterHeading";
import {
  Duel,
  HeroHud,
  Ledger,
  Marquee,
  Paths,
  Provenance,
  Road,
  Statement,
  Rise,
  clamp01,
} from "./HomeContent";

const smooth01 = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------------------------------------------------------------- */
/*  chapter heading (in-flow)                                              */
/* ---------------------------------------------------------------------- */

function Chapter({
  n,
  stratum,
  title,
  lead,
}: {
  n: string;
  stratum: string;
  title: string[];
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
      <ShatterHeading as="h2" lines={title} />
      {lead ? (
        <Rise delay={0.14}>
          <p className="v2-ch__lead">{lead}</p>
        </Rise>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  depth rail                                                             */
/* ---------------------------------------------------------------------- */

const RAIL = [
  { id: "top", label: "Surface", stratum: "surface" },
  { id: "canopy", label: "Canopy · L2", stratum: "canopy" },
  { id: "trunk", label: "Trunk · Paths", stratum: "trunk" },
  { id: "roots", label: "Roots · Ledger", stratum: "roots" },
  { id: "proofs", label: "Proofs · eUTXO", stratum: "proofs" },
  { id: "bedrock", label: "Bedrock · L1", stratum: "bedrock" },
] as const;

const BAND_IDS = [
  "top",
  "canopy",
  "trunk",
  "roots",
  "proofs",
  "prov",
  "bedrock",
] as const;

const subscribeNoop = () => () => {};

export default function DescentFlow() {
  const { motionOn } = useMotionPref();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const flowRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const phasesRef = useRef<DescentPhases>({ ...PHASES_REST });
  const tickRef = useRef<((dt: number) => void) | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const flow = flowRef.current;
    const stage = stageRef.current;
    if (!flow || !stage) return;

    /* ---- section geometry ---- */
    const tops: number[] = [];
    const heights: number[] = [];
    let vh = window.innerHeight;
    const measure = () => {
      vh = window.innerHeight;
      BAND_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        tops[i] = el ? el.offsetTop + (flow.offsetTop || 0) : 0;
        heights[i] = el ? el.offsetHeight : 1;
      });
    };
    measure();

    /* ramp from scroll position a..b */
    const ramp = (s: number, a: number, b: number) =>
      clamp01((s - a) / Math.max(1, b - a));

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const EASE = coarse ? 0.3 : 0.11;

    let smooth = window.scrollY;
    let target = window.scrollY;
    let raf = 0;
    let last = performance.now();
    let running = false;
    let splashEl: Element | null = null;
    let splashCheckAt = 0;

    const onScroll = () => {
      target = window.scrollY;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      smooth += (target - smooth) * Math.min(1, 1 - Math.pow(1 - EASE, dt * 60));
      if (Math.abs(target - smooth) < 0.04) smooth = target;
      const s = smooth;

      if (now > splashCheckAt) {
        splashCheckAt = now + 1000;
        splashEl = document.querySelector(".splash--overlay");
      }
      if (splashEl?.isConnected) return; // covered — draw nothing

      const [, canopyT, trunkT, rootsT, , , bedrockT] = tops;
      const [, canopyH, trunkH, , , , bedrockH] = heights;
      const bedrockEnd = bedrockT + bedrockH;

      /* ---- narrative phases (each owns ONE beat — calmer per scroll) ----
         helix    forms over the visible tree while the thesis is read
         collapse the strands wind down into ONE bright orb (paths chapter)
         descend  the orb rides the trunk SLOWLY from roots to bedrock
         rest     it seats into THIS tree's roots; burst at the bottom   */
      const helix = smooth01(ramp(s, canopyT - vh * 0.55, canopyT + canopyH * 0.45));
      const collapse = smooth01(ramp(s, trunkT - vh * 0.45, trunkT + trunkH * 0.6));
      const descend = ramp(s, rootsT - vh * 0.35, bedrockEnd - vh * 1.1);
      const rest = smooth01(ramp(s, bedrockEnd - vh * 1.7, bedrockEnd - vh * 0.7));
      const bottom = ramp(s, bedrockEnd - vh * 1.1, bedrockEnd - vh * 0.2);

      /* the tree NEVER goes dark — just a gentle dim under the helix so the
         strands read, lifting as they collapse into the orb */
      const black = 0.32 * helix * (1 - collapse);

      const ph = phasesRef.current;
      ph.helix = helix;
      ph.collapse = collapse;
      ph.descend = descend;
      ph.rest = rest;
      ph.bottom = bottom;
      ph.black = black;
      ph.camX = 0.88 + 0.12 * smooth01(ramp(s, canopyT - vh * 0.6, canopyT + canopyH * 0.4));
      ph.camY = lerp(0.38, 0.8, smooth01((descend - 0.04) / 0.92));
      ph.zoom =
        1 +
        0.04 * smooth01(ramp(s, 0, canopyT)) +
        0.06 * smooth01((descend - 0.08) / 0.84);

      /* ---- rail ---- */
      const rail = railRef.current;
      if (rail) {
        let active: string = "top";
        for (let i = 0; i < BAND_IDS.length; i++) {
          if (s >= tops[i] - vh * 0.45) active = BAND_IDS[i];
        }
        if (active === "prov") active = "proofs";
        if (rail.dataset.current !== active) {
          rail.dataset.current = active;
          for (const item of rail.querySelectorAll<HTMLElement>("[data-band]")) {
            item.dataset.active = String(item.dataset.band === active);
          }
        }
      }

      tickRef.current?.(dt);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(measure);
    ro.observe(flow);
    const settle = window.setTimeout(measure, 600);
    start();

    return () => {
      stop();
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, [mounted, motionOn]);

  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {/* content flows normally — only the background is choreographed */}
      <div ref={flowRef} className="v2-flow">
        {/* ---------- hero ---------- */}
        <section id="top" className="v2-band v2-band--hero">
          <div className="v2-band__hero">
            <Rise>
              <span className="v2-hero__eyebrow">
                <span className="tick" aria-hidden />
                Speed · Scale · Security
              </span>
            </Rise>
            <ShatterHeading
              as="h1"
              className="v2-hero__title"
              lines={["Built to scale.", "Rooted in Cardano."]}
              accents={{ "Cardano.": "green" }}
            />
            <Rise delay={0.2}>
              <p className="v2-hero__lead">
                Midgard is a Cardano-native optimistic rollup that gives
                applications a faster execution layer while keeping Cardano as
                the root of trust.
              </p>
            </Rise>
            <Rise delay={0.3}>
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
            <Rise delay={0.42}>
              <div className="v2-hero__meta">
                <HeroHud />
                <span className="v2-hero__scrollcue">
                  <span className="line" aria-hidden />
                  Descend
                </span>
              </div>
            </Rise>
          </div>
        </section>

        <Marquee />

        {/* ---------- 01 canopy / thesis (the helix forms here) ---------- */}
        <section id="canopy" className="v2-band v2-band--thesis">
          <div className="v2-ch">
            <Rise>
              <div className="v2-ch__index">
                <span className="n">01</span>
                <span className="rule" />
                <span className="stratum">Canopy — the thesis</span>
              </div>
            </Rise>
            <ShatterHeading as="h2" lines={["Scale that stays", "on Cardano."]} />
          </div>
          <Statement />
        </section>

        {/* ---------- 02 trunk / paths (the helix collapses to ONE orb) --- */}
        <section id="trunk" className="v2-band">
          <Chapter
            n="02"
            stratum="Trunk — three ways in"
            title={["Choose your path."]}
            lead="These roles overlap. Pick the one that fits what you're here to do."
          />
          <Paths />
        </section>

        {/* ---------- 03 roots / ledger (the orb starts its slow ride) ---- */}
        <section id="roots" className="v2-band">
          <Chapter
            n="03"
            stratum="Roots — protocol at a glance"
            title={["Fast confirmations now,", "final settlement on Cardano."]}
            lead={
              <>
                The numbers behind Midgard&apos;s pre-alpha testnet:{" "}
                <strong>usable speed today</strong>, with final settlement on
                Cardano.
              </>
            }
          />
          <Ledger />
        </section>

        {/* ---------- 04 proofs ---------- */}
        <section id="proofs" className="v2-band">
          <Chapter
            n="04"
            stratum="Proofs — why eUTXO"
            title={["Why eUTXO builds", "a better rollup."]}
            lead={
              <>
                Cardano&apos;s eUTXO model makes fraud proofs surgical: Midgard
                re-executes only the inputs of a bad transaction —{" "}
                <strong>no global state scan</strong>.
              </>
            }
          />
          <Duel />
        </section>

        {/* ---------- 04b provenance ---------- */}
        <section id="prov" className="v2-band v2-band--tight">
          <Provenance />
        </section>

        {/* ---------- 05 bedrock / roadmap — the last word belongs to the
            tree: the orb seats into its roots and detonates blue right
            here, no closing copy (review 2026-06-11: "we don't have to
            list it in plain text") ---------- */}
        <section id="bedrock" className="v2-band v2-band--last">
          <Chapter
            n="05"
            stratum="Bedrock — the path to mainnet"
            title={["Paced by the work,", "not by dates."]}
            lead="Midgard is pre-alpha. The route from today's testnet to settlement on Cardano mainnet runs through four phases."
          />
          <Road />
        </section>
      </div>

      {mounted
        ? createPortal(
            <div ref={stageRef} className="v2-stage" data-stage>
              <WorldTreeCanvas phasesRef={phasesRef} tickRef={tickRef} />
              <div className="v2-stage__veil" aria-hidden />
              <nav ref={railRef} className="v2-rail" aria-label="Page strata">
                {RAIL.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="v2-rail__item"
                    data-band={r.id}
                    data-stratum={r.stratum}
                    onClick={() => jump(r.id)}
                  >
                    <span className="lbl">{r.label}</span>
                    <span className="dot" aria-hidden />
                  </button>
                ))}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
