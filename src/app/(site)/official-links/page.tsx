import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  LinksTable,
  Callout,
  Actions,
} from "@/components/site/ui";

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
        sub="Midgard should be easy to inspect and hard to impersonate. Use official links for docs, contracts, GitHub, community, support, and security routes."
        actions={[
          { label: "View official links", href: "#links", variant: "primary" },
          { label: "Open docs", href: "/docs", variant: "ghost" },
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
            { k: "Website", v: "Publishing soon", pending: true },
            { k: "Docs", v: "Publishing soon", pending: true },
            { k: "Contracts", v: "Publishing soon", pending: true },
            { k: "GitHub", v: "Publishing soon", pending: true },
            { k: "X", v: "Publishing soon", pending: true },
            { k: "Discord", v: "Publishing soon", pending: true },
            { k: "Newsletter", v: "Publishing soon", pending: true },
            { k: "Support", v: "Publishing soon", pending: true },
            { k: "Security", v: "Publishing soon", pending: true },
            { k: "Status", v: "Publishing soon", pending: true },
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

      <Section eyebrow="Reporting" title="Preserve evidence. Use official routes." tight>
        <Prose
          items={[
            {
              text: "If you see a suspicious link or account, do not connect your wallet. Preserve the URL, account name, screenshot, timestamp, and where you saw it. Report through the official support, security, or community route.",
            },
          ]}
        />
        <Actions
          items={[{ label: "Report suspicious activity", href: "#links", variant: "ghost" }]}
        />
      </Section>
    </main>
  );
}
