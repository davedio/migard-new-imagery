import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/ui";
import { NextSteps } from "@/components/site/NextSteps";

export const metadata: Metadata = {
  title: "Midgard Changelog",
  description:
    "What actually shipped on the Midgard gateway and testnet, in order: deployments, site releases, and status changes.",
};

/* Honest, sparse, append-only. Newest first. Each entry is something that
   actually happened — no roadmap items, no intentions. */
const ENTRIES: {
  date: string;
  tag: "site" | "testnet" | "docs";
  title: string;
  body: string;
}[] = [
  {
    date: "2026-06",
    tag: "site",
    title: "Gateway redesign",
    body: "Calmer motion sitewide, protocol dropdown navigation, plain-text journey recap, glossary and tooltips, About, Roadmap, Changelog, and Brand pages, full footer sitemap, per-page metadata.",
  },
  {
    date: "2026-05",
    tag: "site",
    title: "Gateway launch",
    body: "First public version of this site: the world-tree home, the scroll transaction journey, security and contracts pages, FAQ, and official links.",
  },
  {
    date: "2026-05",
    tag: "testnet",
    title: "Pre-alpha preprod deployment",
    body: "Core validators, state anchors, and reference scripts deployed to Cardano preprod. Addresses published on the contracts page with a static snapshot; live query planned.",
  },
  {
    date: "2025",
    tag: "docs",
    title: "Whitepaper published",
    body: "The Midgard whitepaper describing the Cardano-native optimistic rollup design, the state queue, and the challenge model.",
  },
];

const TAG_LABEL: Record<(typeof ENTRIES)[number]["tag"], string> = {
  site: "Site",
  testnet: "Testnet",
  docs: "Docs",
};

export default function ChangelogPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="ink"
        label="Changelog"
        title="What actually shipped"
        sub="Deployments, site releases, and status changes, newest first. If it's here, it happened. The roadmap holds what's next."
        actions={[
          { label: "View the roadmap", href: "/roadmap", variant: "ghost" },
          { label: "Network status", href: "/contracts#network-status", variant: "primary" },
        ]}
      />

      <Section tight>
        <ol className="changelog">
          {ENTRIES.map((e) => (
            <li className="changelog__entry" key={`${e.date}-${e.title}`}>
              <div className="changelog__meta">
                <span className="changelog__date">{e.date}</span>
                <span className="changelog__tag" data-tag={e.tag}>
                  {TAG_LABEL[e.tag]}
                </span>
              </div>
              <div className="changelog__body">
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <NextSteps
        items={[
          {
            label: "See the road to mainnet",
            sub: "The four phases ahead",
            href: "/roadmap",
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
