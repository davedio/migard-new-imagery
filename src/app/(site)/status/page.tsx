import type { Metadata } from "next";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Network Status | Midgard",
  description:
    "Honest, labeled status for Midgard: what is live on Cardano preprod, what is shown as a preview, what is a target, and what is still planned. Every line carries its real state.",
  openGraph: {
    title: "Network Status | Midgard",
    images: [{ url: "/og/security.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/security.jpg"] },
};

const legendRows = [
  {
    label: "Live",
    body: "Working now.",
  },
  {
    label: "Preprod · Preview · Target",
    body: "Real, but pre-alpha: deployed on preprod, shown as an example, or a goal not yet measured.",
  },
  {
    label: "Planned / Coming soon",
    body: "Not built yet.",
  },
] as const;

const deploymentRows = [
  { label: "Testnet", body: "Cardano preprod", meta: "Preprod" },
  { label: "Network era", body: "Conway", meta: "Live" },
  { label: "Core validators deployed", body: "7 of 13", meta: "Preprod" },
  { label: "State anchors", body: "6", meta: "Preprod" },
  { label: "First deployed", body: "25 Apr 2026", meta: "Preprod" },
] as const;

const accessRows = [
  {
    label: "SDK and source",
    body: "Open source — node, contracts, and TypeScript SDK in one repo.",
    meta: "Live",
  },
  {
    label: "Wallet support",
    body: "Announced through official channels as each phase confirms it.",
    meta: "Coming soon",
  },
  {
    label: "Operator registration",
    body: "Team-run today; broader registration opens as parameters mature.",
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
    body: "Seconds (estimated) — usable, pre-settlement confirmation.",
    meta: "Preview",
  },
  {
    label: "Throughput",
    body: "Up to 300x — estimated design target, unbenchmarked.",
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
    label: "Verify the contracts",
    body: "Check the Cardano preprod deployment yourself.",
    href: "/developers#contracts",
  },
  {
    label: "Official links",
    body: "Every canonical link, in one place.",
    href: "/official-links",
  },
  {
    label: "Questions",
    body: "Common questions about status, safety, and roles.",
    href: "/faq",
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
        sub="Every line carries its real state: live, on preprod, preview, a target, or planned. Nothing here pretends to be more finished than it is."
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
            kicker="Pre-alpha testnet"
            line="Midgard is a pre-alpha testnet on Cardano preprod. No real funds."
    sub="These figures describe the preprod deployment, not mainnet; verify the contracts yourself on the developers page."
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
