/* Built but deliberately unlinked — the team flips it on when phases firm up.
   No nav, footer, or sitemap entry points here yet. */

import type { Metadata } from "next";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { Card, CardGrid, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Roadmap | Midgard",
  description:
    "The Midgard roadmap from Cardano preprod to mainnet: work-paced, date-free, and checkable.",
  openGraph: {
    title: "Roadmap | Midgard",
    images: [{ url: "/og/roadmap.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/roadmap.jpg"] },
};

const phases = [
  {
    num: "01 · Next · Preprod",
    title: "Cardano preprod",
    body: "Midgard will be live soon on Cardano preprod. The core optimistic lifecycle and fault-proof coverage are being prepared for that phase.",
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
    body: "Follow the Cardano preprod launch and contract publication.",
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
        title="Paced by the work."
        sub="No dates. Midgard ships when the work is sound. Here is the path from pre-alpha to mainnet."
      />

      <Section
        id="phases"
        title="Three phases, all checkable."
        lead="The source is open. The whitepaper is coming soon. Check each phase yourself."
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
