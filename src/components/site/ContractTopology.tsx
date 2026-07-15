"use client";

import { useEffect, useRef } from "react";
import styles from "./contracts.module.css";

const MOBILE_TOPOLOGY = [
  {
    title: "Hub Oracle",
    body: "Reference point for validator topology and fault-proof catalogue data.",
    tone: "green",
  },
  {
    title: "State Queue",
    body: "Committed blocks sit in order so Watchers can replay and challenge state.",
    tone: "green",
  },
  {
    title: "Fault-proof path",
    body: "Computation threads and proofs connect back to the committed state.",
    tone: "gold",
  },
  {
    title: "Settlement",
    body: "Deposits, tx orders, withdrawals, and verified state meet the final settlement path.",
    tone: "neutral",
  },
] as const;

/**
 * The full Midgard contract topology — thirteen validators laid out as a
 * left-to-right pipeline (Hub Oracle → Scheduler → State Queue → Settlement)
 * with the Operator Directory below it and the fault-proof system (gold) wired
 * back into the State Queue.
 *
 * Visuals only — the protocol facts live in the cards below the diagram.
 * Edges "draw in" on first view and the whole graph supports hover-to-focus;
 * both are skipped under prefers-reduced-motion (final state shows at once).
 */
export function ContractTopology() {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let io: IntersectionObserver | null = null;
    if (!reduce) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              svg.classList.add(styles.animate);
              io?.disconnect();
            }
          }
        },
        { threshold: 0.2 },
      );
      io.observe(svg);
    }

    const clear = () => {
      svg.classList.remove(styles.hovering);
      svg
        .querySelectorAll(`.${styles.active}`)
        .forEach((el) => el.classList.remove(styles.active));
    };

    const onOver = (ev: Event) => {
      const node = (ev.target as Element).closest("[data-node]");
      if (!node) {
        if (svg.classList.contains(styles.hovering)) clear();
        return;
      }
      const id = node.getAttribute("data-node");
      if (!id) return;
      clear();
      svg.classList.add(styles.hovering);
      const activate = (sel: string) =>
        svg.querySelectorAll(sel).forEach((n) => n.classList.add(styles.active));
      activate(`[data-node="${id}"]`);
      svg.querySelectorAll<SVGElement>("[data-edge]").forEach((edge) => {
        const peers = (edge.getAttribute("data-edge") ?? "").split(" ");
        if (peers.includes(id)) {
          edge.classList.add(styles.active);
          peers.forEach((p) => activate(`[data-node="${p}"]`));
        }
      });
      if (["fpcat", "compthread", "fraudproof", "fpzone"].includes(id)) {
        activate(`[data-node="fpzone"]`);
      }
    };

    svg.addEventListener("pointerover", onOver);
    svg.addEventListener("pointerleave", clear);
    return () => {
      io?.disconnect();
      svg.removeEventListener("pointerover", onOver);
      svg.removeEventListener("pointerleave", clear);
    };
  }, []);

  const mono = "var(--font-mono)";

  return (
    <div className={styles.topoWrap} tabIndex={0}>
      <div className={styles.topoMobile} aria-label="Midgard contract topology summary">
        {MOBILE_TOPOLOGY.map((item, index) => (
          <article className={styles.topoMobileStep} data-tone={item.tone} key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <svg
        ref={ref}
        viewBox="0 0 960 345"
        className={styles.topo}
        role="img"
        aria-label="Full Midgard contract topology: a left-to-right pipeline Hub Oracle to Scheduler to State Queue to Settlement; the Operator Directory (Active, Registered, Retired) sits below the pipeline and is referenced by Scheduler, State Queue, and Settlement; Deposit, Tx Order, and Withdrawal feed up into Settlement; the fault-proof system connects back to the State Queue via a Computation Thread and Fault Proof."
      >
        <defs>
          <filter id="topo-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="topo-ah" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" style={{ fill: "var(--text-faint)" }} />
          </marker>
          <marker id="topo-ah-g" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" style={{ fill: "var(--midgard-green)" }} />
          </marker>
          <marker id="topo-ah-a" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" style={{ fill: "var(--gold)" }} />
          </marker>
        </defs>

        {/* Fault-proof system zone */}
        <g data-node="fpzone">
          <rect x="50" y="174" width="340" height="158" rx="8" fill="rgba(207,154,46,0.04)" stroke="rgba(207,154,46,0.2)" strokeWidth="1" strokeDasharray="4 3" className={styles.diagramNode} style={{ animationDelay: "200ms" }} />
          <text x="62" y="189" fill="var(--gold)" opacity="0.5" fontSize="14" fontFamily={mono} fontWeight="600" letterSpacing="0.08em" className={styles.diagramNode} style={{ animationDelay: "200ms" }}>FAULT PROOF SYSTEM</text>
        </g>

        {/* Pipeline edges */}
        <line data-edge="hub scheduler" x1="185" y1="90" x2="255" y2="90" pathLength={1} strokeWidth="1.5" opacity="0.45" markerEnd="url(#topo-ah-g)" className={styles.diagramLine} style={{ stroke: "var(--midgard-green)", animationDelay: "250ms" }} />
        <line data-edge="scheduler statequeue" x1="375" y1="90" x2="455" y2="90" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.25" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "430ms" }} />
        <line data-edge="statequeue settlement" x1="585" y1="90" x2="685" y2="90" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.25" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "580ms" }} />

        {/* Hub Oracle → everything it anchors */}
        <line data-edge="hub fpcat" x1="90" y1="108" x2="131" y2="196" pathLength={1} strokeWidth="1" opacity="0.35" markerEnd="url(#topo-ah-g)" className={styles.diagramLine} style={{ stroke: "var(--midgard-green)", animationDelay: "350ms" }} />
        <line data-edge="hub compthread" x1="155" y1="108" x2="300" y2="196" pathLength={1} strokeWidth="1" opacity="0.3" markerEnd="url(#topo-ah-g)" className={styles.diagramLine} style={{ stroke: "var(--midgard-green)", animationDelay: "350ms" }} />
        <line data-edge="hub opdir" x1="185" y1="90" x2="310" y2="130" pathLength={1} strokeWidth="1" opacity="0.35" markerEnd="url(#topo-ah-g)" className={styles.diagramLine} style={{ stroke: "var(--midgard-green)", animationDelay: "300ms" }} />

        {/* Pipeline → Operator Directory */}
        <line data-edge="scheduler opdir" x1="315" y1="105" x2="345" y2="130" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.22" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "430ms" }} />
        <line data-edge="statequeue opdir" x1="520" y1="108" x2="490" y2="130" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.22" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "580ms" }} />
        <line data-edge="settlement opdir" x1="700" y1="105" x2="556" y2="145" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.18" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "700ms" }} />

        {/* Fault system internal edges (gold) */}
        <line data-edge="fpcat compthread" x1="200" y1="210" x2="224" y2="210" pathLength={1} stroke="var(--gold)" strokeWidth="1" opacity="0.5" markerEnd="url(#topo-ah-a)" className={styles.diagramLine} style={{ animationDelay: "520ms" }} />
        <line data-edge="compthread fraudproof" x1="300" y1="224" x2="300" y2="300" pathLength={1} stroke="var(--gold)" strokeWidth="1" opacity="0.5" markerEnd="url(#topo-ah-a)" className={styles.diagramLine} style={{ animationDelay: "680ms" }} />
        <path data-edge="compthread statequeue" d="M 376,210 L 586,210 L 586,90 L 585,90" pathLength={1} stroke="var(--gold)" strokeWidth="1" opacity="0.45" fill="none" markerEnd="url(#topo-ah-a)" className={styles.diagramLine} style={{ animationDelay: "820ms" }} />
        <path data-edge="fraudproof statequeue" d="M 360,314 L 586,314 L 586,90 L 585,90" stroke="var(--gold)" strokeWidth="1" opacity="0.3" fill="none" strokeDasharray="5 4" markerEnd="url(#topo-ah-a)" />

        {/* Bridge → Settlement */}
        <line data-edge="deposit settlement" x1="643" y1="196" x2="700" y2="105" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.2" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "730ms" }} />
        <line data-edge="txorder settlement" x1="755" y1="196" x2="755" y2="105" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.2" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "730ms" }} />
        <line data-edge="withdrawal settlement" x1="867" y1="196" x2="800" y2="105" pathLength={1} stroke="currentColor" strokeWidth="1" opacity="0.2" markerEnd="url(#topo-ah)" className={styles.diagramLine} style={{ animationDelay: "730ms" }} />

        {/* Edge labels */}
        <text data-edge="statequeue settlement" x="635" y="67" textAnchor="middle" fill="currentColor" opacity="0.28" fontSize="14" fontFamily={mono}>on maturation</text>
        <text data-edge="compthread statequeue" x="481" y="205" textAnchor="middle" fill="var(--gold)" opacity="0.5" fontSize="14" fontFamily={mono}>challenges</text>
        <text data-edge="fraudproof statequeue" x="465" y="325" textAnchor="middle" fill="var(--gold)" opacity="0.4" fontSize="14" fontFamily={mono}>fault removal</text>

        {/* Operator Directory */}
        <text data-node="opdir" x="413" y="126" textAnchor="middle" fill="currentColor" opacity="0.22" fontSize="14" fontFamily={mono} fontWeight="600" letterSpacing="0.07em" className={styles.diagramNode} style={{ animationDelay: "260ms" }}>OPERATOR DIRECTORY</text>
        <g data-node="opdir" className={styles.diagramNode} style={{ animationDelay: "280ms" }}>
          <rect x="270" y="130" width="92" height="32" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="316" y="150" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14" fontFamily={mono}>Active</text>
        </g>
        <g data-node="opdir" className={styles.diagramNode} style={{ animationDelay: "320ms" }}>
          <rect x="367" y="130" width="92" height="32" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="413" y="150" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14" fontFamily={mono}>Registered</text>
        </g>
        <g data-node="opdir" className={styles.diagramNode} style={{ animationDelay: "360ms" }}>
          <rect x="464" y="130" width="92" height="32" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="510" y="150" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14" fontFamily={mono}>Retired</text>
        </g>

        {/* User bridge validators */}
        <text data-node="bridge" x="756" y="189" textAnchor="middle" fill="currentColor" opacity="0.24" fontSize="14" fontFamily={mono} fontWeight="600" letterSpacing="0.08em" className={styles.diagramNode} style={{ animationDelay: "650ms" }}>USER BRIDGE</text>
        <g data-node="deposit" className={styles.diagramNode} style={{ animationDelay: "650ms" }}>
          <rect x="593" y="196" width="100" height="28" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="643" y="214" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14" fontFamily={mono}>Deposit</text>
        </g>
        <g data-node="txorder" className={styles.diagramNode} style={{ animationDelay: "665ms" }}>
          <rect x="705" y="196" width="100" height="28" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="755" y="214" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14" fontFamily={mono}>Tx Order</text>
        </g>
        <g data-node="withdrawal" className={styles.diagramNode} style={{ animationDelay: "680ms" }}>
          <rect x="817" y="196" width="100" height="28" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="867" y="214" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14" fontFamily={mono}>Withdrawal</text>
        </g>

        {/* Fault system nodes (gold) */}
        <g data-node="fpcat" className={styles.diagramNode} style={{ animationDelay: "400ms" }}>
          <rect x="62" y="196" width="138" height="28" rx="4" fill="rgba(207,154,46,0.08)" stroke="var(--gold-dim)" strokeWidth="1" />
          <text x="131" y="214" textAnchor="middle" fill="var(--gold-bright)" opacity="0.85" fontSize="14" fontFamily={mono}>FP Catalogue</text>
        </g>
        <g data-node="compthread" className={styles.diagramNode} style={{ animationDelay: "430ms" }}>
          <rect x="224" y="196" width="152" height="28" rx="4" fill="rgba(207,154,46,0.08)" stroke="var(--gold-dim)" strokeWidth="1" />
          <text x="300" y="214" textAnchor="middle" fill="var(--gold-bright)" opacity="0.85" fontSize="14" fontFamily={mono}>Computation Thread</text>
        </g>
        <g data-node="fraudproof" className={styles.diagramNode} style={{ animationDelay: "600ms" }}>
          <rect x="240" y="300" width="120" height="28" rx="4" fill="rgba(207,154,46,0.12)" stroke="var(--gold)" strokeWidth="1.5" />
          <text x="300" y="318" textAnchor="middle" fill="var(--gold-bright)" opacity="0.95" fontSize="14" fontFamily={mono}>Fault Proof</text>
        </g>

        {/* Pipeline nodes */}
        <g data-node="hub" className={styles.diagramNode} style={{ animationDelay: "50ms" }}>
          <rect x="55" y="72" width="130" height="36" rx="6" fillOpacity="0.14" strokeWidth="2" filter="url(#topo-glow)" style={{ fill: "var(--midgard-green)", stroke: "var(--midgard-green)" }} />
          <text x="120" y="94" textAnchor="middle" fontSize="14.5" fontWeight="700" fontFamily={mono} style={{ fill: "var(--green-bright)" }}>Hub Oracle</text>
        </g>
        <g data-node="scheduler" className={styles.diagramNode} style={{ animationDelay: "200ms" }}>
          <rect x="255" y="75" width="120" height="30" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="315" y="94" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14.5" fontFamily={mono}>Scheduler</text>
        </g>
        <g data-node="statequeue" className={styles.diagramNode} style={{ animationDelay: "350ms" }}>
          <rect x="455" y="72" width="130" height="36" rx="5" fillOpacity="0.1" strokeWidth="1.5" filter="url(#topo-glow)" style={{ fill: "var(--midgard-green)", stroke: "var(--midgard-green)" }} />
          <text x="520" y="94" textAnchor="middle" fontSize="14.5" fontWeight="600" fontFamily={mono} style={{ fill: "var(--green-bright)" }}>State Queue</text>
        </g>
        <g data-node="settlement" className={styles.diagramNode} style={{ animationDelay: "500ms" }}>
          <rect x="685" y="75" width="120" height="30" rx="4" fill="var(--panel)" stroke="var(--panel-edge-strong)" strokeWidth="1" />
          <text x="745" y="94" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="14.5" fontFamily={mono}>Settlement</text>
        </g>
      </svg>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <i className={styles.legendLineGreen} /> Hub Oracle reference
        </span>
        <span className={styles.legendItem}>
          <i className={styles.legendLineNeutral} /> Operational flow
        </span>
        <span className={styles.legendItem}>
          <i className={styles.legendLineGold} /> Fault-proof path
        </span>
      </div>
    </div>
  );
}
