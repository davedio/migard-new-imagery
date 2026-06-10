import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  LinksTable,
  Callout,
} from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { NextSteps } from "@/components/site/NextSteps";
import { GitHubIcon, XIcon, DiscordIcon } from "@/components/site/BrandIcons";

export const metadata: Metadata = {
  title: "Midgard Official Links",
  description:
    "Use official Midgard links for the website, docs, GitHub, contracts, community, support, and security routes.",
  openGraph: {
    title: "Midgard Official Links",
    images: [{ url: "/og/official-links.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/official-links.jpg"] },
};

export default function OfficialLinksPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="ink"
        label="Official links"
        title="Start from the official path"
        sub="Midgard is easy to inspect and hard to impersonate. Use official links for docs, GitHub, community, status, support, and security routes."
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
            { k: "Website", v: "midgard-gateway.vercel.app", href: OFFICIAL_LINKS.website, copy: true },
            { k: "Docs", v: "GitHub source/docs", href: OFFICIAL_LINKS.docs, copy: true },
            { k: "Contracts", v: "Deployed contracts", href: "/contracts" },
            { k: "GitHub", v: "Anastasia-Labs/midgard", href: OFFICIAL_LINKS.github, icon: <GitHubIcon size={16} />, copy: true },
            { k: "X", v: "@midgardprotocol", href: OFFICIAL_LINKS.x, icon: <XIcon size={14} />, copy: true },
            { k: "Discord", v: "Midgard Discord", href: OFFICIAL_LINKS.discord, icon: <DiscordIcon size={16} />, copy: true },
            { k: "Builder/Testnet intake", v: "Google form", href: OFFICIAL_LINKS.intakeForm },
            { k: "Newsletter", v: "Publishing soon", pending: true },
            { k: "Support", v: "Publishing soon", pending: true },
            { k: "Security contact", v: "Security policy (GitHub)", href: OFFICIAL_LINKS.securityPolicy, copy: true },
            { k: "Status", v: "Testnet status", href: "/contracts" },
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

      <Section id="security-contact" eyebrow="Security contact" title="Preserve evidence. Use official routes" tight>
        <Prose
          items={[
            {
              text: "If you see a suspicious link, account, or security issue, do not connect your wallet. Preserve the URL, account name, screenshot, timestamp, and where you saw it. Report through the official support, security, or community route once published.",
            },
          ]}
        />
      </Section>

      <NextSteps
        items={[
          {
            label: "Choose your path",
            sub: "Start as a user, start building, or run the protocol",
            href: "/get-started",
          },
          {
            label: "Read the FAQ",
            sub: "Grouped answers plus the protocol glossary",
            href: "/faq",
          },
          {
            label: "Verify the contracts",
            sub: "Every address on Cardano preprod",
            href: "/contracts",
          },
        ]}
      />
    </main>
  );
}
