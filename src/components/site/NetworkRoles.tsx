import type { CSSProperties } from "react";
import { Section } from "./ui";
import { Reveal } from "./Reveal";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "./BrandIcons";

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

const ctaStyle: CSSProperties = {
  marginTop: 12,
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  color: "var(--text-hi)",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
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
        {/* Card 1 — For Developers */}
        <Reveal style={{ display: "flex" }}>
          <div className="panel" style={{ ...cardStyle, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={eyebrowStyle}>For Developers</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--green-bright)",
                  border: "1px solid rgba(32,190,67,0.4)",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                L2
              </span>
            </div>
            <pre
              style={{
                marginTop: 14,
                marginBottom: 0,
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                lineHeight: 1.65,
                background: "rgba(3,8,5,0.5)",
                border: "1px solid var(--panel-edge)",
                borderRadius: "var(--r)",
                padding: "14px 16px",
                overflowX: "auto",
                whiteSpace: "pre",
              }}
            >
              <span style={{ color: "var(--text-faint)" }}>-- only the endpoint changes</span>
              {"\n"}
              <span style={{ color: "var(--text-hi)" }}>const tx = await lucid</span>
              {"\n"}
              <span style={{ color: "var(--green-bright)" }}>  .newTx()</span>
              {"\n"}
              <span style={{ color: "var(--green-bright)" }}>  .collectFrom(utxo)</span>
              {"\n"}
              <span style={{ color: "var(--text-faint)" }}>-- Same logic. New speed.</span>
            </pre>
            <a
              style={ctaStyle}
              href={OFFICIAL_LINKS.github}
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon size={13} />
              Explore the SDK →
            </a>
          </div>
        </Reveal>

        {/* Card 2 — Become a Watcher */}
        <Reveal delay={70} style={{ display: "flex" }}>
          <div className="panel" style={{ ...cardStyle, width: "100%" }}>
            <span style={eyebrowStyle}>Submit Fraud Proofs</span>
            <h3 style={titleStyle}>Become a Watcher</h3>
            <p style={bodyStyle}>
              Catch fraudulent blocks, prove it on L1, and earn 30–50% of the
              slashed bond. Anyone can run a Watcher. The protocol pays you to
              keep operators honest.
            </p>
            <a
              style={{ ...metricStyle, textDecoration: "none", display: "block" }}
              href={OFFICIAL_LINKS.intakeForm}
              target="_blank"
              rel="noreferrer"
            >
              Earn: 30–50% of slashed bond →
            </a>
          </div>
        </Reveal>

        {/* Card 3 — Become an Operator */}
        <Reveal delay={140} style={{ display: "flex" }}>
          <div className="panel" style={{ ...cardStyle, width: "100%" }}>
            <span style={eyebrowStyle}>Institutional Infrastructure</span>
            <h3 style={titleStyle}>Become an Operator</h3>
            <p style={bodyStyle}>
              Sequence and commit blocks in rotating 1-hour shifts. Earn fees
              from every L2 transaction, deposit, and withdrawal.
            </p>
            <div style={metricStyle}>Bond: 50K–200K ADA</div>
            <a
              style={ctaStyle}
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
