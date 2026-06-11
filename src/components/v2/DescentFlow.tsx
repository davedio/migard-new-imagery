"use client";

/* ============================================================================
   DescentFlow — the Corn-Revolution grammar, kept honest to the DOM.

   How the Corn site works (verified by inspection, 2026-06-10): one WebGL
   canvas, no native scroll, wheel → target, render value lerps at ~0.1/frame,
   text layers screen-locked and faded per chapter. We keep native scroll
   (a11y, anchors, SEO) and reproduce the rest:

     · the page flow is just invisible RUNWAY sections — they give the
       scrollbar its length and the anchors their targets
     · ONE fixed stage (portaled to <body>) holds the canvas and every
       chapter overlay; overlays FADE in place — they never translate with
       the page, exactly like the Corn chapters
     · a single rAF lerps a smoothed scroll value (ease 0.11) and drives
       plates, particles and overlay opacities from it — nothing layouts,
       nothing repaints except the canvas and cheap opacity flips

   The descent narrative across the runways:
     hero    the tree, whole — orbs ride the painted veins
     canopy  the tree recedes; the lights detach into the double helix
     trunk   the helix consolidates BACK into the tree (choose your path)
     roots   one settlement orb ignites, swallowing nearby lights
     proofs  it rides the trunk veins downward — the camera follows
     bedrock it crosses into the blue strata (roadmap)
     close   it comes to rest in bedrock blue; a soft blue detonation —
             settled on L1 — over the roots close-up plate
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
  ClosingActions,
  Duel,
  HeroHud,
  Ledger,
  Marquee,
  Paths,
  Provenance,
  Road,
  Statement,
  clamp01,
} from "./HomeContent";

const smooth01 = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------------------------------------------------------------- */
/*  runway map — heights in vh; ids are the site's stable anchors          */
/* ---------------------------------------------------------------------- */

const BANDS = [
  { id: "top", h: 220 },
  { id: "canopy", h: 250 },
  { id: "trunk", h: 215 },
  { id: "roots", h: 215 },
  { id: "proofs", h: 235 },
  { id: "prov", h: 185 },
  { id: "bedrock", h: 225 },
  { id: "close", h: 215 },
] as const;

type BandId = (typeof BANDS)[number]["id"];

/** opacity envelope: fade in over [i0,i1] of band progress, out over [o0,o1] */
function envelope(bp: number, i0 = 0.05, i1 = 0.2, o0 = 0.8, o1 = 0.95) {
  return Math.min(smooth01((bp - i0) / (i1 - i0)), 1 - smooth01((bp - o0) / (o1 - o0)));
}

/* ---------------------------------------------------------------------- */
/*  overlays — pinned, fading, never translating                          */
/* ---------------------------------------------------------------------- */

function Overlay({
  band,
  refMap,
  className,
  align = "center",
  children,
}: {
  band: BandId;
  refMap: React.RefObject<Map<BandId, HTMLDivElement>>;
  className?: string;
  align?: "center" | "end";
  children: ReactNode;
}) {
  return (
    <div
      ref={(el) => {
        if (el) refMap.current.set(band, el);
        else refMap.current.delete(band);
      }}
      className={`v2-ov${className ? ` ${className}` : ""}`}
      data-band={band}
      data-align={align}
      style={{ opacity: 0 }}
    >
      <div className="v2-ov__inner">{children}</div>
    </div>
  );
}

/** Chapter heading block for overlays — same grammar as the fallback path,
    but headings carry the Corn shatter cursor effect. */
function OvChapter({
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
    <div className="v2-ch v2-ch--ov">
      <div className="v2-ch__index">
        <span className="n">{n}</span>
        <span className="rule" />
        <span className="stratum">{stratum}</span>
      </div>
      <ShatterHeading as="h2" lines={title} />
      {lead ? <p className="v2-ch__lead">{lead}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  rail (driven by the same smoothed value — no IntersectionObserver)     */
/* ---------------------------------------------------------------------- */

const RAIL: { id: BandId; label: string; stratum: string }[] = [
  { id: "top", label: "Surface", stratum: "surface" },
  { id: "canopy", label: "Canopy · L2", stratum: "canopy" },
  { id: "trunk", label: "Trunk · Paths", stratum: "trunk" },
  { id: "roots", label: "Roots · Ledger", stratum: "roots" },
  { id: "proofs", label: "Proofs · eUTXO", stratum: "proofs" },
  { id: "bedrock", label: "Bedrock · L1", stratum: "bedrock" },
];

/* ---------------------------------------------------------------------- */
/*  the flow                                                               */
/* ---------------------------------------------------------------------- */

const subscribeNoop = () => () => {};

export default function DescentFlow() {
  const { motionOn } = useMotionPref();
  /* false during SSR/hydration, true after — gates the body portal */
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const flowRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayEls = useRef(new Map<BandId, HTMLDivElement>());
  const railRef = useRef<HTMLElement>(null);
  const phasesRef = useRef<DescentPhases>({ ...PHASES_REST });
  const tickRef = useRef<((dt: number) => void) | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const flow = flowRef.current;
    const stage = stageRef.current;
    if (!flow || !stage) return;

    /* ---- band geometry (re-measured on resize / content settle) ---- */
    let tops: number[] = [];
    let heights: number[] = [];
    let vh = window.innerHeight;
    const measure = () => {
      vh = window.innerHeight;
      const els = BANDS.map((b) => document.getElementById(`band-${b.id}`));
      tops = els.map((el) => (el ? el.offsetTop + (flow.offsetTop || 0) : 0));
      heights = els.map((el) => (el ? el.offsetHeight : 1));
    };
    measure();

    /* band progress: 0 when the band top hits the viewport top, 1 when its
       bottom meets the viewport bottom (the pinned dwell) */
    const bandP = (i: number, s: number) =>
      clamp01((s - tops[i]) / Math.max(1, heights[i] - vh));

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const EASE = coarse ? 0.3 : 0.11; // corn ships ~0.1 on desktop wheel

    let smooth = window.scrollY;
    let target = window.scrollY;
    let raf = 0;
    let last = performance.now();
    let running = false;
    const lastOpacity = new Map<BandId, number>();
    /* per-frame write caches — a skipped write is a skipped style recalc */
    let lastStageOpacity = "";
    let lastProg = -1;
    /* while the entry splash covers the page, the whole stage is invisible —
       skip everything except the scroll lerp. Re-checked ~1x/second. */
    let splashEl: Element | null = null;
    let splashCheckAt = 0;

    const onScroll = () => {
      target = window.scrollY;
    };
    const onResize = () => {
      measure();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      /* frame-rate-independent lerp */
      smooth += (target - smooth) * Math.min(1, 1 - Math.pow(1 - EASE, dt * 60));
      if (Math.abs(target - smooth) < 0.04) smooth = target;
      const s = smooth;

      if (now > splashCheckAt) {
        splashCheckAt = now + 1000;
        splashEl = document.querySelector(".splash--overlay");
      }
      if (splashEl?.isConnected) return; // covered — draw nothing

      const bp = BANDS.map((_, i) => bandP(i, s));
      const [pHero, pCanopy, pTrunk, pRoots, pProofs, pProv, pBedrock, pClose] = bp;

      /* ---- narrative phases ---- */
      const helix = smooth01((pCanopy - 0.02) / 0.6);
      const regroup = smooth01((pTrunk - 0.02) / 0.55);
      /* black dwell: rises BEFORE the thesis copy lands (the words need a
         dark room), falls as the tree returns */
      const black =
        smooth01((pCanopy - 0.1) / 0.38) * (1 - smooth01((pTrunk - 0.05) / 0.5));
      /* one continuous descent from the roots band into deep bedrock */
      const descStart = tops[3]; // roots
      const descEnd = tops[6] + (heights[6] - vh) * 0.85; // deep in bedrock
      const descend = clamp01((s - descStart) / Math.max(1, descEnd - descStart));
      const rest = smooth01((pClose - 0.05) / 0.55);
      const rootsFade = smooth01((pClose - 0.02) / 0.4);
      /* hold the stage until the burst has played at the true bottom; the
         footer takes over only in the last few percent */
      const stageFade = smooth01((pClose - 0.965) / 0.035);

      /* ---- camera ---- */
      const camX = 0.88 + 0.12 * smooth01((pCanopy - 0.05) / 0.55);
      /* the frame follows the settlement orb down the tree */
      const camY = lerp(0.38, 0.8, smooth01((descend - 0.05) / 0.85));
      const zoom =
        1 +
        0.05 * smooth01((pHero - 0.1) / 0.9) +
        0.07 * smooth01((descend - 0.1) / 0.8);

      const ph = phasesRef.current;
      ph.helix = helix;
      ph.regroup = regroup;
      ph.descend = descend;
      ph.rest = rest;
      ph.bottom = pClose;
      ph.black = black;
      ph.rootsFade = rootsFade;
      ph.camX = camX;
      ph.camY = camY;
      ph.zoom = zoom;

      /* ---- stage fade at the very end (the footer takes over) ---- */
      const stageOpacity = (1 - stageFade).toFixed(3);
      if (stageOpacity !== lastStageOpacity) {
        lastStageOpacity = stageOpacity;
        stage.style.opacity = stageOpacity;
        stage.style.visibility = stageFade >= 1 ? "hidden" : "visible";
      }

      /* ---- overlay envelopes (opacity only — corn never translates) ---- */
      const env: Record<BandId, number> = {
        top: Math.min(1, 1 - smooth01((pHero - 0.55) / 0.28)),
        canopy: envelope(pCanopy, 0.2, 0.38, 0.78, 0.94),
        trunk: envelope(pTrunk, 0.12, 0.3, 0.82, 0.96),
        roots: envelope(pRoots, 0.1, 0.28, 0.82, 0.96),
        proofs: envelope(pProofs, 0.1, 0.28, 0.82, 0.96),
        prov: envelope(pProv, 0.1, 0.28, 0.8, 0.95),
        bedrock: envelope(pBedrock, 0.1, 0.28, 0.82, 0.96),
        close: smooth01((pClose - 0.3) / 0.3),
      };
      for (const [band, el] of overlayEls.current) {
        const o = env[band] ?? 0;
        if (Math.abs((lastOpacity.get(band) ?? -1) - o) > 0.002) {
          el.style.opacity = o.toFixed(3);
          lastOpacity.set(band, o);
          const active = o > 0.32;
          if ((el.dataset.active === "true") !== active) {
            el.dataset.active = String(active);
          }
        }
      }
      /* thesis word-brighten rides the canopy dwell */
      const prog = clamp01((pCanopy - 0.22) / 0.42);
      if (Math.abs(prog - lastProg) > 0.002) {
        lastProg = prog;
        overlayEls.current.get("canopy")?.style.setProperty("--prog", prog.toFixed(4));
      }

      /* ---- rail active state ---- */
      const rail = railRef.current;
      if (rail) {
        let active: BandId = "top";
        for (let i = 0; i < BANDS.length; i++) {
          if (s >= tops[i] - vh * 0.45) active = BANDS[i].id;
        }
        if (rail.dataset.current !== active) {
          rail.dataset.current = active;
          for (const item of rail.querySelectorAll<HTMLElement>("[data-band]")) {
            item.dataset.active = String(item.dataset.band === active);
          }
        }
      }

      /* ---- hand the frame to the canvas ---- */
      tickRef.current?.(dt);

      if (process.env.NODE_ENV !== "production") {
        /* live tuning hook: window.__mgPhases in dev builds only */
        (window as unknown as { __mgPhases?: object }).__mgPhases = {
          ...ph,
          smooth: s,
          bands: bp.map((v) => Number(v.toFixed(3))),
        };
      }
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
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(measure);
    ro.observe(flow);
    /* fonts/images settling change band offsets */
    const settle = window.setTimeout(measure, 600);
    start();

    return () => {
      stop();
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, [mounted, motionOn]);

  const jump = (id: BandId) =>
    document.getElementById(`band-${id}`)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {/* invisible runways: scroll length + anchor targets */}
      <div ref={flowRef} className="v2-flow" aria-hidden>
        {BANDS.map((b) => (
          <section
            key={b.id}
            id={`band-${b.id}`}
            data-band={b.id}
            style={{ height: `${b.h}svh` }}
          />
        ))}
      </div>

      {mounted
        ? createPortal(
            <div ref={stageRef} className="v2-stage" data-stage>
              <WorldTreeCanvas phasesRef={phasesRef} tickRef={tickRef} />
              <div className="v2-stage__veil" aria-hidden />

              {/* ---------- hero ---------- */}
              <Overlay band="top" refMap={overlayEls} align="end" className="v2-ov--hero">
                <span className="v2-hero__eyebrow">
                  <span className="tick" aria-hidden />
                  Speed · Scale · Security
                </span>
                <ShatterHeading
                  as="h1"
                  className="v2-hero__title"
                  lines={["Built to scale.", "Rooted in Cardano."]}
                  accents={{ "Cardano.": "green" }}
                />
                <p className="v2-hero__lead">
                  Midgard is a Cardano-native optimistic rollup that gives
                  applications a faster execution layer while keeping Cardano
                  as the root of trust.
                </p>
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
                <div className="v2-hero__meta">
                  <HeroHud />
                  <span className="v2-hero__scrollcue">
                    <span className="line" aria-hidden />
                    Descend
                  </span>
                </div>
              </Overlay>

              {/* ---------- 01 canopy / thesis ---------- */}
              <Overlay band="canopy" refMap={overlayEls} className="v2-ov--thesis">
                <div className="v2-ch__index">
                  <span className="n">01</span>
                  <span className="rule" />
                  <span className="stratum">Canopy — the thesis</span>
                </div>
                <ShatterHeading as="h2" lines={["Scale that stays", "on Cardano."]} />
                <Statement mode="external" />
                <div className="v2-ov__marquee">
                  <Marquee />
                </div>
              </Overlay>

              {/* ---------- 02 trunk / paths ---------- */}
              <Overlay band="trunk" refMap={overlayEls}>
                <OvChapter
                  n="02"
                  stratum="Trunk — three ways in"
                  title={["Choose your path."]}
                  lead="These roles overlap. Pick the one that fits what you're here to do."
                />
                <Paths />
              </Overlay>

              {/* ---------- 03 roots / ledger ---------- */}
              <Overlay band="roots" refMap={overlayEls}>
                <OvChapter
                  n="03"
                  stratum="Roots — protocol at a glance"
                  title={["Fast confirmations now,", "final settlement on Cardano."]}
                  lead={
                    <>
                      The numbers behind Midgard&apos;s pre-alpha testnet:{" "}
                      <strong>usable speed today</strong>, with final settlement
                      on Cardano.
                    </>
                  }
                />
                <Ledger />
              </Overlay>

              {/* ---------- 04 proofs / duel ---------- */}
              <Overlay band="proofs" refMap={overlayEls}>
                <OvChapter
                  n="04"
                  stratum="Proofs — why eUTXO"
                  title={["Why eUTXO builds", "a better rollup."]}
                  lead={
                    <>
                      Cardano&apos;s eUTXO model makes fraud proofs surgical:
                      Midgard re-executes only the inputs of a bad transaction —{" "}
                      <strong>no global state scan</strong>.
                    </>
                  }
                />
                <Duel />
              </Overlay>

              {/* ---------- 04b provenance ---------- */}
              <Overlay band="prov" refMap={overlayEls}>
                <Provenance compact />
              </Overlay>

              {/* ---------- 05 bedrock / roadmap ---------- */}
              <Overlay band="bedrock" refMap={overlayEls}>
                <OvChapter
                  n="05"
                  stratum="Bedrock — the path to mainnet"
                  title={["Paced by the work,", "not by dates."]}
                  lead="Midgard is pre-alpha. The route from today's testnet to settlement on Cardano mainnet runs through four phases."
                />
                <Road />
              </Overlay>

              {/* ---------- close ---------- */}
              <Overlay band="close" refMap={overlayEls} className="v2-ov--close">
                <div className="v2-ch__index">
                  <span className="rule" style={{ flexBasis: 30 }} />
                  <span className="stratum">The gateway is open</span>
                </div>
                <ShatterHeading as="h2" lines={["Scale Cardano.", "Settle on Cardano."]} />
                <ClosingActions />
              </Overlay>

              {/* ---------- depth rail ---------- */}
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
