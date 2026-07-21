import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("status");

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
    body: "Benchmark status: Performance figures labeled Target are current design goals. Public testnet results will replace them after benchmarking. Planned marks a later phase that has not been released.",
  },
] as const;

const deploymentRows = [
  {
    label: "Preprod contracts",
    body: "Protocol contracts and the genesis snapshot are public on Cardano preprod.",
    meta: "Available now",
  },
  {
    label: "Public pre-alpha access",
    body: "The next public test phase on Cardano preprod.",
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
    body: "Planned for a later release.",
    meta: "Planned",
  },
  {
    label: "Public testnet",
    body: "Planned after the preprod phase.",
    meta: "Planned",
  },
] as const;

const performanceRows = [
  {
    label: "Soft confirmation",
    body: "Seconds: usable before settlement.",
    meta: "Target",
  },
  {
    label: "Throughput",
    body: "Up to 300x throughput.",
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
    body: "Release follows independent audits, full validator coverage, and parameter finalization.",
    meta: "Planned",
  },
] as const;

const exploreRows = [
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
        title="Current network status"
        sub="What is available now, what comes next on Cardano preprod, and what remains planned."
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
        title="How to read this page"
        cols
        aside={
          <Statement
            align="left"
            variant="supporting"
            kicker="Cardano preprod"
            line="Contracts are deployed on Cardano preprod. Public pre-alpha access is coming soon; mainnet is not live."
            sub="Use test ADA, and verify source, contracts, and official links before use."
          />
        }
      >
        <DataRows rows={legendRows} ariaLabel="Status label legend" />
      </Section>

      <Section id="deployment" title="Deployment" cols>
        <DataRows rows={deploymentRows} ariaLabel="Deployment status" />
      </Section>

      <Section id="access" title="Access" cols>
        <DataRows rows={accessRows} ariaLabel="Access status" />
      </Section>

      <Section id="performance" title="Performance" cols>
        <DataRows rows={performanceRows} ariaLabel="Performance status" />
      </Section>

      <Section id="mainnet" title="Path to mainnet" cols>
        <DataRows rows={mainnetRows} ariaLabel="Path to mainnet status" />
      </Section>

      <Section title="Keep exploring." tight cols>
        <DataRows rows={exploreRows} ariaLabel="Related pages" />
      </Section>
    </main>
  );
}
