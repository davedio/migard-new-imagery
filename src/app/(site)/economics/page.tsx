import type { Metadata } from "next";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { Statement } from "@/components/site/rhythm";
import { DataRows } from "@/components/site/rhythm";
import { Card, CardGrid, PageHero, Prose, Section } from "@/components/site/ui";
import { ECONOMICS_COPY } from "@/lib/siteCopy";

export const metadata: Metadata = {
  title: "Economics & Security | Midgard",
  description:
    "What users, builders, Operators, and Watchers each get from Midgard — fees in plain ADA, a verifiable security model, and bonded roles that earn for the work.",
  openGraph: {
    title: "Economics & Security | Midgard",
    images: [{ url: "/og/security.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/security.jpg"] },
};

/* Reading rhythm (see .review/card-rhythm-redesign-2026-07-02.md):
   hero → chips → the page's one Grid (what each audience gets) →
   Statement (the differentiator) → Prose (honest status) → Rows
   (routes to where each fact is told in full). No Set-piece — this
   is an orientation hub, not a story page; it stays quiet like
   /participate and ends on Rows. */

export default function EconomicsPage() {
  const { hero, paths, thesis, status, explore } = ECONOMICS_COPY;

  return (
    <main className="page-main">
      <PageBackdrop name="canopy-light" focus="55% 40%" />
      <PageHero compact tone="cobalt" label={hero.label} title={hero.title} sub={hero.sub} actions={[...hero.actions]} />

      <JumpChips
        items={[
          { id: "paths", label: "What you get" },
          { id: "thesis", label: "Why it's different" },
          { id: "status", label: "Status" },
          { id: "explore", label: "Explore" },
        ]}
      />

      <Section id="paths" title="What you get.">
        <CardGrid cols={3}>
          {paths.map((p, i) => (
            <Card key={p.title} title={p.title} body={p.body} cta={p.cta} href={p.href} delay={i * 60} />
          ))}
        </CardGrid>
      </Section>

      <Section id="thesis">
        <Statement kicker={thesis.kicker} line={thesis.line} sub={thesis.sub} />
      </Section>

      <Section id="status" title="Where this stands.">
        <Prose items={status.paragraphs.map((text) => ({ text }))} />
      </Section>

      <Section id="explore" title="Go deeper.">
        <DataRows ariaLabel="Where each fact is told in full" rows={[...explore]} />
      </Section>
    </main>
  );
}
