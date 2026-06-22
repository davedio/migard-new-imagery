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
import { StateQueueViz } from "@/components/site/StateQueueViz";
import {
  Ledger,
  Marquee,
  Paths,
  Provenance,
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
  title,
  lead,
}: {
  n: string;
  title: string[];
  lead?: ReactNode;
}) {
  /* plain headings here — the shatter cursor effect belongs to the hero H1
     alone (review 2026-06-11) */
  return (
    <div className="v2-ch">
      <Rise>
        <div className="v2-ch__index">
          <span className="n">{n}</span>
          <span className="rule" />
        </div>
      </Rise>
      <Rise delay={0.08}>
        <h2>
          {title.map((t, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {t}
            </span>
          ))}
        </h2>
      </Rise>
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
  { id: "top", label: "Intro", stratum: "surface" },
  { id: "trunk", label: "Paths", stratum: "trunk" },
  { id: "canopy", label: "Thesis", stratum: "canopy" },
  { id: "roots", label: "Metrics", stratum: "roots" },
] as const;

const BAND_IDS = [
  "top",
  "trunk",
  "canopy",
  "roots",
  "queue",
  "prov",
] as const;

const subscribeNoop = () => () => {};

export default function DescentFlow({ treeSrc }: { treeSrc?: string }) {
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
    let maxS = 1; // the true scroll end — the connect is keyed to IT
    const measure = () => {
      vh = window.innerHeight;
      maxS = Math.max(1, document.documentElement.scrollHeight - vh);
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

      const canopyIndex = BAND_IDS.indexOf("canopy");
      const rootsIndex = BAND_IDS.indexOf("roots");
      const provIndex = BAND_IDS.indexOf("prov");
      const canopyT = tops[canopyIndex] ?? 0;
      const rootsT = tops[rootsIndex] ?? 0;
      const provT = tops[provIndex] ?? 0;
      const canopyH = heights[canopyIndex] ?? 1;
      const rootsH = heights[rootsIndex] ?? 1;

      /* ---- narrative phases (each owns ONE beat — calmer per scroll) ----
         helix    forms over the visible tree while the thesis is read
         collapse the strands wind down into ONE bright orb (ledger chapter)
         descend  the orb rides the trunk SLOWLY from provenance down
         rest     it CONNECTS into the blue cave WELL BEFORE the footer's
                  rooted tagline (client review 2026-06-12) — the whole
                  settle beat plays out about a viewport above the end   */
      const helix = smooth01(ramp(s, canopyT - vh * 0.55, canopyT + canopyH * 0.45));
      const collapse = smooth01(ramp(s, rootsT - vh * 0.45, rootsT + rootsH * 0.6));
      const descend = ramp(s, provT - vh * 0.35, maxS - vh * 1.45);
      const rest = smooth01(ramp(s, maxS - vh * 1.85, maxS - vh * 1.15));
      const bottom = ramp(s, maxS - vh * 1.45, maxS - vh * 0.9);

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
        if (active === "queue") active = "roots";
        if (active === "prov") active = "roots";
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
              <ShatterHeading
                as="h1"
                className="v2-hero__title"
                lines={["Scale UTXO finance.", "Keep L1 security."]}
                accents={{ "L1 security.": "green" }}
              />
            </Rise>
            <Rise delay={0.2}>
              <p className="v2-hero__lead">
                Midgard is an optimistic rollup that gives UTXO applications
                faster execution with settlement anchored to L1.
              </p>
            </Rise>
            <Rise delay={0.3}>
              <div className="v2-hero__actions">
                <Link className="btn btn--primary" href="#trunk">
                  Choose your path
                </Link>
                <Link className="btn-link--gold" href="/how-it-works">
                  See how it works
                </Link>
              </div>
            </Rise>
            <Rise delay={0.42}>
              <div className="v2-hero__meta">
                <span className="v2-hero__scrollcue">
                  <span className="line" aria-hidden />
                  Pre-alpha testnet
                </span>
              </div>
            </Rise>
          </div>
        </section>

        {/* ---------- 01 trunk / paths: immediate role routing ---------- */}
        <section id="trunk" className="v2-band v2-band--tight">
          <Chapter
            n="01"
            title={["Choose your path."]}
            lead="Users, builders, operators, and watchers overlap. Start with the role that fits what you're here to do."
          />
          <Paths />
        </section>

        <Marquee />

        {/* ---------- 01 canopy / thesis (the helix forms here) ---------- */}
        <section id="canopy" className="v2-band v2-band--thesis">
          <div className="v2-ch">
            <Rise>
              <div className="v2-ch__index">
                <span className="n">02</span>
                <span className="rule" />
              </div>
            </Rise>
            {/* one line on desktop, wraps naturally on phones */}
            <Rise delay={0.06}>
              <h2 className="v2-thesis__h2">Fast UTXO execution. L1 security.</h2>
            </Rise>
          </div>
          <div className="v2-thesis__row">
            <Statement />
            <Rise delay={0.1} className="v2-thesis__cta">
              <Link className="btn btn--ghost" href="/how-it-works">
                Overview of Flow
              </Link>
            </Rise>
          </div>
        </section>

        {/* ---------- 02 roots / ledger (the helix collapses to ONE orb) -- */}
        <section id="roots" className="v2-band">
          <Chapter
            n="03"
            title={["Key metrics", "worth tracking."]}
            lead={
              <>
                The homepage should advertise indicators the team can track and
                defend: confirmation speed, settlement window, execution model,
                verification, fees, and current status.
              </>
            }
          />
          <Ledger />
        </section>

        {/* ---------- the state queue, in motion (moved from /how-it-works:
            it shows exactly what the ledger numbers above promise) ------- */}
        <section id="queue" className="v2-band v2-band--tight">
          <div className="v2-ch">
            <Rise>
              <div className="v2-ch__index">
                <span className="rule" style={{ flexBasis: 30 }} />
                <span className="stratum">On-chain state queue</span>
              </div>
            </Rise>
            <Rise delay={0.08}>
              <h2>Blocks commit. State confirms.</h2>
            </Rise>
            <Rise delay={0.14}>
              <p className="v2-ch__lead">
                Operators append committed blocks to a singly-linked queue.
                When a block&apos;s fault-proof window closes, it folds into
                the confirmed state — oldest first, one L1 transaction at a
                time.
              </p>
            </Rise>
          </div>
          <Rise delay={0.18}>
            <div className="v2-queue">
              <StateQueueViz />
            </div>
          </Rise>
        </section>

        {/* ---------- provenance (the descent begins here) ---------- */}
        <section id="prov" className="v2-band v2-band--tight">
          <Provenance />
        </section>

        {/* ---------- provenance — closing credibility block ---------- */}
        <section id="bedrock" className="v2-band v2-band--last" aria-hidden />
      </div>

      {mounted
        ? createPortal(
            <div ref={stageRef} className="v2-stage" data-stage>
              {/* keyed by plate so a theme flip re-reads the vein field */}
              <WorldTreeCanvas
                key={treeSrc}
                src={treeSrc}
                phasesRef={phasesRef}
                tickRef={tickRef}
              />
              <div className="v2-stage__veil" aria-hidden />
              <div className="v2-stage__mist" aria-hidden />
              <nav ref={railRef} className="v2-rail" aria-label="Page progress">
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
