import type { CSSProperties } from "react";
import { Section } from "./ui";
import { Reveal } from "./Reveal";

/* =========================================================================
   Roadmap — the honest, date-free "path to mainnet" for Midgard. Four phases,
   the current one flagged. Reuses the design-system Section/Reveal/panel
   patterns; each phase carries an accent tint (green for L2 phases, cobalt /
   Cardano-blue for the L1 mainnet milestone). Pre-alpha hedging is kept
   explicit in the copy.
   ========================================================================= */

type Accent = "green" | "gold" | "cobalt";

type Phase = {
  n: string;
  name: string;
  body: string;
  accent: Accent;
  current?: boolean;
};

const PHASES: Phase[] = [
  {
    n: "01",
    name: "Pre-alpha testnet",
    body: "Where Midgard is today: running on the Cardano preprod testnet so the rollup model can be exercised end to end. Expect rough edges — nothing here carries production weight yet.",
    accent: "green",
    current: true,
  },
  {
    n: "02",
    name: "Public testnet",
    body: "Wider participation opens up. Operators and watchers onboard to sequence blocks and submit fraud proofs, and builders bring real application flows onto the network.",
    accent: "green",
  },
  {
    n: "03",
    name: "Audit & hardening",
    body: "External security review of contracts and protocol, alongside the benchmarks that turn target throughput into measured throughput. Findings are addressed before mainnet weight is placed on Midgard.",
    accent: "gold",
  },
  {
    n: "04",
    name: "Mainnet",
    body: "Settlement on Cardano mainnet, with L1 as the root of trust. Timing follows the work — testnet maturity, audit outcomes, and benchmarks — not a fixed calendar date.",
    accent: "cobalt",
  },
];

const ACCENT_COLOR: Record<Accent, string> = {
  green: "var(--green-bright)",
  gold: "var(--gold-bright)",
  cobalt: "#5b8cff",
};

const ACCENT_BG: Record<Accent, string> = {
  green: "var(--green-ghost)",
  gold: "var(--gold-ghost)",
  cobalt: "rgba(0, 51, 173, 0.22)",
};

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  padding: "22px 22px 20px",
};

const numStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.2em",
};

const nameStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 20,
  color: "var(--text-hi)",
};

const bodyStyle: CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--text-dim)",
  flex: 1,
};

const badgeStyle: CSSProperties = {
  alignSelf: "flex-start",
  marginBottom: 16,
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "4px 9px",
  borderRadius: 999,
  border: "1px solid var(--green-bright)",
  color: "var(--green-bright)",
  background: "var(--green-ghost)",
};

export function Roadmap() {
  return (
    <Section
      id="roadmap"
      eyebrow="Roadmap"
      title="The path to mainnet"
      lead="Midgard is pre-alpha. The route from today's testnet to settlement on Cardano mainnet runs through four phases — paced by the work, not by dates."
      glow="green"
    >
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          marginTop: 30,
          maxWidth: 1180,
        }}
      >
        {PHASES.map((p, i) => {
          const color = ACCENT_COLOR[p.accent];
          return (
            <Reveal key={p.name} delay={i * 70} style={{ display: "flex" }}>
              <div
                className="panel"
                style={{
                  ...cardStyle,
                  width: "100%",
                  borderColor: p.current ? color : undefined,
                  boxShadow: p.current
                    ? `inset 0 0 0 1px ${ACCENT_BG[p.accent]}`
                    : undefined,
                }}
              >
                {p.current ? <span style={badgeStyle}>Current phase</span> : null}
                <div style={{ ...numStyle, color }}>{p.n}</div>
                <h3 style={nameStyle}>{p.name}</h3>
                <p style={bodyStyle}>{p.body}</p>
                <div
                  aria-hidden
                  style={{
                    marginTop: 18,
                    height: 3,
                    borderRadius: 999,
                    background: color,
                    opacity: p.current ? 0.9 : 0.5,
                  }}
                />
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
