import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  LinksTable,
  Callout,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Midgard Official Links",
  description:
    "Use official Midgard links for the website, docs, GitHub, contracts, community, support, and security routes.",
};

export default function OfficialLinksPage() {
  return (
    <main className="page-main">
      <PageHero
        label="Official links"
        title="Start from the official path."
        sub="Midgard should be easy to inspect and hard to impersonate. Use official links for docs, GitHub, community, status, support, and security routes."
        actions={[
          { label: "View official links", href: "#links", variant: "primary" },
          { label: "Open docs ↗", href: OFFICIAL_LINKS.docs, variant: "ghost" },
        ]}
      />

      <Section
        id="links"
        eyebrow="Official links"
        title="Canonical Midgard links"
        lead="These are the channels to trust. Links are published here as each surface goes live — anything not listed here is not official."
      >
        <LinksTable
          rows={[
            { k: "Website", v: "midgard-gateway.vercel.app", href: OFFICIAL_LINKS.website },
            { k: "Docs", v: "GitHub source/docs", href: OFFICIAL_LINKS.docs },
            { k: "Contracts", v: "Testnet status", href: "/testnet#contracts" },
            { k: "GitHub", v: "Anastasia-Labs/midgard", href: OFFICIAL_LINKS.github },
            { k: "X", v: "@midgardprotocol", href: OFFICIAL_LINKS.x },
            { k: "Discord", v: "Midgard Discord", href: OFFICIAL_LINKS.discord },
            { k: "Builder/Testnet intake", v: "Google form", href: OFFICIAL_LINKS.intakeForm },
            { k: "Newsletter", v: "Publishing soon", pending: true },
            { k: "Support", v: "Publishing soon", pending: true },
            { k: "Security contact", v: "Publishing soon", pending: true },
            { k: "Status", v: "Testnet status", href: "/testnet" },
          ]}
        />
      </Section>

      <Section eyebrow="Safety" title="Stay safe">
        <Callout
          title="Midgard will never ask for private wallet secrets."
          body="Do not share your seed phrase, private key, recovery phrase, password, or unnecessary personal information. Do not sign approvals you do not understand. Do not trust unsolicited support messages."
          items={[
            "Seed phrase or private key requests",
            "Urgent wallet connection requests",
            "Lookalike domains",
            "Fake support accounts",
            "Screenshots that hide the real URL",
            "Direct-message support pretending to be official",
          ]}
        />
      </Section>

      <Section id="security-contact" eyebrow="Security contact" title="Preserve evidence. Use official routes." tight>
        <Prose
          items={[
            {
              text: "If you see a suspicious link, account, or security issue, do not connect your wallet. Preserve the URL, account name, screenshot, timestamp, and where you saw it. Report through the official support, security, or community route once published.",
            },
          ]}
        />
      </Section>
    </main>
  );
}
