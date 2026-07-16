import type { Metadata } from "next";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Network Status | Midgard",
  description:
    "Honest, labeled status for Midgard: what is available now, what is coming soon on Cardano preprod, and what remains planned.",
  openGraph: {
    title: "Network Status | Midgard",
    images: [{ url: "/og/security.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/security.jpg"] },
};

const legendRows = [
  {
    label: "Available now",
    body: "Public source, documentation, and official channels.",
  },
  {
    label: "Coming soon",
    body: "The next Cardano preprod phase.",
  },
  {
    label: "Target / Planned",
    body: "A design goal or later phase, not yet measured or released.",
  },
] as const;

const deploymentRows = [
  {
    label: "Cardano preprod",
    body: "Midgard will be live soon on Cardano preprod.",
    meta: "Coming soon",
  },
  {
    label: "Public testnet",
    body: "Follows the preprod phase.",
    meta: "Planned",
  },
  {
    label: "Mainnet",
    body: "Follows audits and parameter finalization.",
    meta: "Planned",
  },
] as const;

const accessRows = [
  {
    label: "SDK and source",
    body: "Open source: node, contracts, and TypeScript SDK.",
    meta: "Available now",
  },
  {
    label: "Wallet support",
    body: "Announced through official channels as each phase confirms it.",
    meta: "Coming soon",
  },
  {
    label: "Operator registration",
    body: "Opens as testnet phases mature.",
    meta: "Planned",
  },
  {
    label: "Public explorer",
    body: "Not yet.",
    meta: "Coming soon",
  },
  {
    label: "Public testnet",
    body: "Not yet.",
    meta: "Coming soon",
  },
] as const;

const performanceRows = [
  {
    label: "Soft confirmation",
    body: "Seconds (estimated): usable before settlement.",
    meta: "Preview",
  },
  {
    label: "Throughput",
    body: "Up to 300x: estimated design target, unbenchmarked.",
    meta: "Target",
  },
] as const;

const mainnetRows = [
  {
    label: "Data availability layer",
    body: "In active development.",
    meta: "Planned",
  },
  {
    label: "Archive nodes",
    body: "Full chain history, independent of the DA layer.",
    meta: "Planned",
  },
  {
    label: "Security audits",
    body: "Independent audits ahead of mainnet.",
    meta: "Planned",
  },
  {
    label: "Mainnet",
    body: "Not yet.",
    meta: "Planned",
  },
] as const;

const exploreRows = [
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
  {
    label: "FAQs",
    body: "Common questions about status, safety, and roles.",
    href: "/learn#faq",
  },
] as const;

export default function StatusPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="signal-cairn" variant="full" focus="74% 56%" mobileFocus="72% 58%" />
      <PageHero
        compact
        tone="ink"
        label="Network status"
        title="Honest status."
        sub="Every line is labeled: available now, coming soon, target, or planned. Nothing claims to be more finished than it is."
      />

      <JumpChips
        items={[
          { id: "legend", label: "How to read" },
          { id: "deployment", label: "Deployment" },
          { id: "access", label: "Access" },
          { id: "performance", label: "Performance" },
          { id: "mainnet", label: "Path to mainnet" },
        ]}
      />

      <Section
        id="legend"
        title="How to read this page."
        cols
        aside={
          <Statement
            align="left"
            variant="supporting"
            kicker="Cardano preprod"
            line="Midgard will be live soon on Cardano preprod. No real funds."
            sub="Pre-alpha launch phase; no real funds. Verify source and contracts before use."
          />
        }
      >
        <DataRows rows={legendRows} ariaLabel="Status label legend" />
      </Section>

      <Section id="deployment" title="Deployment." cols>
        <DataRows rows={deploymentRows} ariaLabel="Deployment status" />
      </Section>

      <Section id="access" title="Access." cols>
        <DataRows rows={accessRows} ariaLabel="Access status" />
      </Section>

      <Section id="performance" title="Performance." cols>
        <DataRows rows={performanceRows} ariaLabel="Performance status" />
      </Section>

      <Section id="mainnet" title="Path to mainnet." cols>
        <DataRows rows={mainnetRows} ariaLabel="Path to mainnet status" />
      </Section>

      <Section title="Keep exploring." tight cols>
        <DataRows rows={exploreRows} ariaLabel="Related pages" />
      </Section>
    </main>
  );
}
