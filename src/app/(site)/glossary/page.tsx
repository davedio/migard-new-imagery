import type { Metadata } from "next";
import PageBackdrop from "@/components/site/PageBackdrop";
import { CtaBand, PageHero, Section } from "@/components/site/ui";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossary | Midgard",
  description: "Plain-language definitions for Midgard protocol terms.",
  openGraph: {
    title: "Glossary | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

const terms = Object.values(GLOSSARY);

export default function GlossaryPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="terraces" focus="50% 48%" />
      <PageHero
        compact
        tone="moss"
        title="Glossary."
        sub="Short definitions for the protocol terms used across Midgard."
        actions={[{ label: "How it works", href: "/how-it-works", variant: "primary" }]}
      />

      <Section title="Protocol terms.">
        <dl className="glossary">
          {terms.map((item) => (
            <div className="glossary__row" key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.def}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <CtaBand
        title="Need the full path?"
        lead="Use How it works for the transaction flow behind these terms."
        actions={[{ label: "How it works", href: "/how-it-works", variant: "primary" }]}
      />
    </main>
  );
}
