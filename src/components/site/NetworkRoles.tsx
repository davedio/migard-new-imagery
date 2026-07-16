import type { CSSProperties } from "react";
import { Section } from "./ui";
import { Reveal } from "./Reveal";
import { ExternalLinkNotice } from "./ExternalLinkNotice";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   NetworkRoles — reusable role cards. Keep this conservative: exact watcher
   rewards and operator bond ranges belong in approved economics material, not
   the public homepage copy.
   ========================================================================= */

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  padding: "22px 22px 20px",
};

const eyebrowStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 14.5,
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
  fontSize: 16,
  lineHeight: 1.6,
  color: "var(--text-dim)",
  flex: 1,
};

const metricStyle: CSSProperties = {
  marginTop: 16,
  fontFamily: "var(--font-mono)",
  fontSize: 14,
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
            <span style={eyebrowStyle}>Verify fault proofs</span>
            <h3 style={titleStyle}>Become a Watcher</h3>
            <p style={bodyStyle}>
              Monitor committed blocks, re-execute protocol activity, and help
              verify invalid commitments through the fault-proof path.
            </p>
            <a
              className="panel-cta-glow"
              href={OFFICIAL_LINKS.intakeForm}
              target="_blank"
              rel="noreferrer"
            >
              Review Watcher requirements →
              <ExternalLinkNotice />
            </a>
          </div>
        </Reveal>

        {/* Card 2 — Become an Operator */}
        <Reveal delay={70} style={{ display: "flex" }}>
          <div className="panel panel--select-glow" style={{ ...cardStyle, width: "100%" }}>
            <span style={eyebrowStyle}>Institutional Infrastructure</span>
            <h3 style={titleStyle}>Become an Operator</h3>
            <p style={bodyStyle}>
              Sequence and commit blocks as the network moves through staged
              testnet and toward broader infrastructure participation.
            </p>
            <div style={metricStyle}>Testnet parameters subject to approval</div>
            <a
              className="panel-cta-glow"
              href={OFFICIAL_LINKS.intakeForm}
              target="_blank"
              rel="noreferrer"
            >
              Register Interest →
              <ExternalLinkNotice />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
