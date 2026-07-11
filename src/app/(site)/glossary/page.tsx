import type { Metadata } from "next";
import GlossaryList from "@/components/site/GlossaryList";
import PageBackdrop from "@/components/site/PageBackdrop";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Glossary | Midgard",
  description: "Short definitions for Midgard protocol terms.",
  openGraph: {
    title: "Glossary | Midgard",
    images: [{ url: "/og/faq.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/faq.jpg"] },
};

export default function GlossaryPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="trunk-mist" variant="full" focus="60% 46%" />
      <PageHero
        compact
        tone="ink"
        label="Glossary"
        title="Glossary."
        sub="Short definitions for the protocol terms used across Midgard."
        actions={[
          { label: "Read FAQ", href: "/faq", variant: "primary" },
          { label: "Learn how it works", href: "/learn", variant: "ghost" },
        ]}
      />
      <Section id="glossary" title="Protocol terms." lead="Flat definitions, no hidden glossary cards." tight cols>
        <GlossaryList />
      </Section>
    </main>
  );
}
