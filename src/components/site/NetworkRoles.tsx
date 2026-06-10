import type { CSSProperties } from "react";
import { Section } from "./ui";
import { Reveal } from "./Reveal";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   NetworkRoles — the "Three roles. One protocol." section ported verbatim
   from the Anastasia reference site (#developers), restyled to the gateway
   design system. The heading is reworded per request; all card copy, the
   code snippet, the metrics, and the CTAs are reproduced as written.
   ========================================================================= */

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  padding: "22px 22px 20px",
};

const eyebrowStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--gold-bright)",
};

const titleStyle: CSSProperties = {
  marginTop: 10,
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

const metricStyle: CSSProperties = {
  marginTop: 16,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.04em",
  color: "var(--green-bright)",
};

export function NetworkRoles() {
  return (
    <Section
      id="network-roles"
      title="Explore the network roles to participate in the Midgard protocol."
    >
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          marginTop: 30,
          maxWidth: 1100,
        }}
      >
        {/* Card 1 — Become a Watcher */}
        <Reveal style={{ display: "flex" }}>
          <div className="panel panel--select-glow" style={{ ...cardStyle, width: "100%" }}>
            <span style={eyebrowStyle}>Submit Fraud Proofs</span>
            <h3 style={titleStyle}>Become a Watcher</h3>
            <p style={bodyStyle}>
              Catch fraudulent blocks, prove it on L1, and earn 30–50% of the
              slashed bond. Anyone can run a Watcher. The protocol pays you to
              keep operators honest.
            </p>
            <a
              className="panel-cta-glow"
              href={OFFICIAL_LINKS.intakeForm}
              target="_blank"
              rel="noreferrer"
            >
              Earn: 30–50% of slashed bond →
            </a>
          </div>
        </Reveal>

        {/* Card 2 — Become an Operator */}
        <Reveal delay={70} style={{ display: "flex" }}>
          <div className="panel panel--select-glow" style={{ ...cardStyle, width: "100%" }}>
            <span style={eyebrowStyle}>Institutional Infrastructure</span>
            <h3 style={titleStyle}>Become an Operator</h3>
            <p style={bodyStyle}>
              Sequence and commit blocks in rotating 1-hour shifts. Earn fees
              from every L2 transaction, deposit, and withdrawal.
            </p>
            <div style={metricStyle}>Bond: 50K–200K ADA</div>
            <a
              className="panel-cta-glow"
              href={OFFICIAL_LINKS.intakeForm}
              target="_blank"
              rel="noreferrer"
            >
              Register Interest →
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
