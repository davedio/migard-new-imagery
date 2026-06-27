import type { Metadata } from "next";
import PageBackdrop from "@/components/site/PageBackdrop";
import { Card, CardGrid, CtaBand, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Learn | Midgard",
  description:
    "A plain-language index for Midgard: how it works, FAQ, glossary, and current pre-alpha status.",
  openGraph: {
    title: "Learn | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

export default function LearnPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="terraces" focus="50% 48%" />
      <PageHero
        compact
        tone="moss"
        title="Learn Midgard."
        sub="Start with How it works, then use FAQ and Glossary when you need definitions."
        actions={[
          { label: "How it works", href: "/how-it-works", variant: "primary" },
          { label: "FAQ", href: "/faq", variant: "ghost" },
        ]}
      />

      <Section title="Start here.">
        <CardGrid cols={2}>
          <Card
            num="01"
            title="How it works"
            body="Execution, verification, data availability, Watchers, and settlement in one overview."
            cta="Open How it works"
            href="/how-it-works"
          />
          <Card
            num="02"
            title="FAQ"
            body="Common questions about trust models, user flow, security, and testnet status."
            cta="Open FAQ"
            href="/faq"
          />
          <Card
            num="03"
            title="Glossary"
            body="Short definitions for the protocol terms used across the site."
            cta="Open Glossary"
            href="/glossary"
          />
          <Card
            num="04"
            title="Road Map"
            body="Road Map is intentionally unlinked while the site stays in pre-alpha cleanup."
          />
        </CardGrid>
      </Section>

      <CtaBand
        title="Move from Learn to mechanism."
        lead="The How it works page is the main overview for anyone coming from Home."
        actions={[{ label: "How it works", href: "/how-it-works", variant: "primary" }]}
      />
    </main>
  );
}
