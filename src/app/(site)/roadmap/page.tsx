/* Built but deliberately unlinked — the team flips it on when phases firm up.
   No nav, footer, or sitemap entry points here yet. */

import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { Card, CardGrid, PageHero, Section } from "@/components/site/ui";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("roadmap");

const phases = [
  {
    num: "01 · Next · Preprod",
    title: "Cardano preprod",
    body: "Protocol contracts are deployed on Cardano preprod. Public pre-alpha access and broader fault-proof coverage come next.",
  },
  {
    num: "02 · Next",
    title: "Public testnet",
    body: "Follows preprod, with broader role registration as parameters mature. It adds fuller fault-proof coverage, wallet support, a public explorer, and load hardening.",
  },
  {
    num: "03 · Later",
    title: "Mainnet",
    body: "Independent audits, full validator coverage, finalized economic parameters, and archive nodes. Then mainnet on Cardano.",
  },
] as const;

const exploreRows = [
  {
    label: "Walk the lifecycle",
    body: "Follow a transaction end to end.",
    href: "/learn",
  },
  {
    label: "Launch updates",
    body: "Follow public pre-alpha access and later release phases.",
    href: "/official-links",
  },
  {
    label: "Official links",
    body: "Every canonical link, in one place.",
    href: "/official-links",
  },
] as const;

export default function RoadmapPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="winding-road" variant="full" focus="48% 58%" mobileFocus="50% 64%" />
      <PageHero
        compact
        tone="cobalt"
        label="Roadmap"
        title="Paced by the work"
        sub="No dates. Midgard ships when the work is sound. Here is the path from pre-alpha to mainnet."
      />

      <Section
        id="phases"
        title="Three phases, all checkable"
        lead="The source and technical specification are public. Check each phase yourself."
      >
        <CardGrid cols={3}>
          {phases.map((p, i) => (
            <Card
              key={p.title}
              num={p.num}
              title={p.title}
              body={p.body}
              delay={i * 60}
            />
          ))}
        </CardGrid>
        <Statement line="Everything grows from Cardano." />
      </Section>

      <Section id="explore" title="Keep exploring." tight cols>
        <DataRows rows={exploreRows} ariaLabel="Where to go next" />
      </Section>
    </main>
  );
}
