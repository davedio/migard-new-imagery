/* Built but deliberately unlinked — the team flips it on when phases firm up.
   No nav, footer, or sitemap entry points here yet. */

import type { Metadata } from "next";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { Card, CardGrid, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Roadmap | Midgard",
  description:
    "The Midgard roadmap from pre-alpha to mainnet: work-paced, date-free, and checkable. See what is live on Cardano preprod today and what comes next.",
  openGraph: {
    title: "Roadmap | Midgard",
    images: [{ url: "/og/roadmap.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/roadmap.jpg"] },
};

const phases = [
  {
    num: "01 · Now · Preprod",
    title: "Pre-alpha testnet",
    body: "Core validators are deployed on Cardano preprod, verifiable on the developers page. The core optimistic lifecycle runs on preprod — submit, sequence, commit, watch, settle — with data-availability attestation and the full fault-proof catalogue in active development.",
  },
  {
    num: "02 · Next",
    title: "Public testnet",
    body: "Run by the internal team at first, then broader Operator and Watcher registration as parameters mature. Fuller fault-proof coverage across transaction types, broader wallet support, a public explorer, and hardening under real-world load.",
  },
  {
    num: "03 · Later",
    title: "Mainnet",
    body: "Independent security audits of the on-chain and off-chain code. Full validator coverage with economic parameters finalized. Archive nodes so anyone can keep the full chain history. Mainnet deployment on Cardano.",
  },
] as const;

const exploreRows = [
  {
    label: "Walk the lifecycle",
    body: "Follow a transaction end to end.",
    href: "/learn",
  },
  {
    label: "Verify the contracts",
    body: "Check the Cardano preprod deployment.",
    href: "/developers#contracts",
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
      <PageBackdrop name="winding-road" variant="full" focus="45% 55%" />
      <PageHero
        compact
        tone="cobalt"
        label="Roadmap"
        title="Paced by the work."
        sub="No dates. Midgard ships when the work is proven sound. Here is the path from pre-alpha to mainnet, and where we are on it."
      />

      <Section
        id="phases"
        title="Three phases, all checkable."
        lead="The contracts are on preprod, the source is open, and the claims trace back to the whitepaper. Check any phase yourself."
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

      <Section id="explore" title="Keep exploring." tight>
        <DataRows rows={exploreRows} ariaLabel="Where to go next" />
      </Section>
    </main>
  );
}
