import { GitHubIcon } from "@/components/site/BrandIcons";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows } from "@/components/site/rhythm";
import { Card, CardGrid, CtaBand, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY } from "@/lib/siteCopy";

/* /developers — reading-rhythm layout (see .review/card-rhythm-redesign-2026-07-02.md):
   hero (the one telling of the wallet-action…fallback sentence) → ONE sticky
   JumpChips bar tracking the whole page → ONE three-card developer-path grid
   → preprod-contract launch note → one closing CTA band. Security now lives
   in the Learn section.
   Motion: the cards use the site’s quiet stagger; everything else is static. */

export default function DeveloperLanding() {
  return (
    <main className="page-main developer-page">
      {/* Dave's pick (2026-07-11): the original forest-path tree stays on
          Developers — the stone-gateway experiment is retired. */}
      <PageBackdrop name="forest-path" focus="54% 48%" mobileFocus="70% 54%" />
      <PageHero
        compact
        tone="tree"
        title={DEVELOPER_COPY.hero.title}
        sub={DEVELOPER_COPY.hero.lead}
        actions={[
          {
            label: "GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "primary",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />

      {/* The page's ONE sticky nav tracks the developer launch path. */}
      <JumpChips
        items={[
          { id: "start", label: "Paths" },
          { id: "economics", label: "Economics" },
          { id: "contracts", label: "Contracts" },
          { id: "defense", label: "Fault proofs" },
          { id: "reference", label: "Reference" },
        ]}
      />

      <Section
        id="start"
        title="Choose your developer path."
        lead="Build with Midgard, help run the network, or extend the stack."
        glow="green"
      >
        <CardGrid cols={3}>
          {DEVELOPER_COPY.paths.map((path, i) => (
            <Card
              key={path.title}
              num={String(i + 1).padStart(2, "0")}
              title={path.title}
              body={path.body}
              cta={path.cta}
              href={path.href}
              ctaGlow
              delay={i * 50}
            />
          ))}
        </CardGrid>
      </Section>

      {/* The builder side of network economics — /economics folded into the
          audience pages 2026-07-11; the cross-view lives on /#economics. */}
      <Section
        id="economics"
        title="Economics for builders."
        lead="No new asset or separate fee market."
        cols
      >
        <DataRows
          ariaLabel="Builder economics"
          rows={[
            {
              label: "Fee model",
              body: "Paid in ADA end to end. Your users transact with the wallet and asset they already have.",
            },
            {
              label: "Cost profile",
              body: "Execution happens off-chain; only compact data is committed to Cardano. Measured fee comparisons will be published once benchmarked.",
            },
            {
              label: "What your users pay",
              body: "Designed for an estimated 10 to 30x lower cost than L1, and confirmations in seconds; both are estimates pending benchmarks.",
            },
            {
              label: "The whole picture",
              body: "Compare what every participant pays and earns across the network.",
              href: "/#economics",
            },
          ]}
        />
      </Section>

      <Section
        id="contracts"
        title="Preprod contracts, coming soon."
        lead="Midgard will be live soon on Cardano preprod. Contract addresses, state anchors, and explorer links will be published at launch."
        cols
      >
        <DataRows
          ariaLabel="Preprod contract publication"
          rows={[
            {
              label: "Public source",
              body: "Review the protocol source and implementation history on GitHub.",
              href: OFFICIAL_LINKS.github,
              external: true,
            },
            {
              label: "Launch status",
              body: "Follow the Cardano preprod launch and contract publication.",
              href: "/status",
            },
          ]}
        />
      </Section>

      {/* Technical security depth lives HERE per the 2026-07-08 persona
          split: Learn keeps the plain-language summary, Participate keeps
          the incentive framing, developers get the mechanism. DA/DAC detail
          is allowed in this technical context (and FAQs) only. */}
      <Section
        id="defense"
        title="How the protocol defends itself."
        lead="Faults, including invalid transactions, bad commitments, unavailable data, or an Operator gone dark, can be checked on Cardano."
        cols
      >
        <CardGrid cols={2}>
          <Card
            num="01"
            title="Operators commit and bond"
            body="An Operator commits a block to the L1 state queue and locks a bond as collateral."
          />
          <Card
            num="02"
            title="Watchers verify"
            body="Watchers independently replay committed blocks against posted data, UTXO rules, and the L1 header."
            delay={50}
          />
          <Card
            num="03"
            title="A fault proof slashes"
            body="A valid fault proof on Cardano slashes the bond, reverts the block, and rewards the prover."
            delay={100}
          />
          <Card
            num="04"
            title="The window is the guarantee"
            body="A block becomes confirmed only after its challenge window closes with no valid fault proof."
            delay={150}
          />
        </CardGrid>
        <div className="prose">
          <p className="dim">
            The protocol enforces custody through scripts, validity through fault proofs,
            and settlement on Cardano. Apps, RPCs, and explorers can still misreport what
            you see; verify against your own node for the strongest assurance. A dedicated
            data-availability layer is in development, with archive nodes planned for
            long-term history.
          </p>
        </div>
      </Section>

      <Section
        id="reference"
        title="Keep these handy."
        lead="Source is open; Cardano preprod access is coming soon. A hosted public RPC follows later."
        tight
        cols
      >
        <CardGrid cols={2}>
          <Card
            title="GitHub"
            body="Node, contracts, and TypeScript SDK."
            cta="Open the repo"
            href={OFFICIAL_LINKS.github}
            ctaIcon={<GitHubIcon size={14} />}
          />
          <Card
            title="Whitepaper (coming soon)"
            body="The full protocol design will be published soon."
            delay={50}
          />
          <Card
            title="Preprod contracts"
            body="Contract addresses and state anchors will be published at launch."
            cta="Follow launch status"
            href="/status"
            delay={100}
          />
          <Card
            title="Discord"
            body="Developer support and updates on the upcoming pre-alpha testnet."
            cta="Join Discord"
            href={OFFICIAL_LINKS.discord}
            delay={150}
          />
        </CardGrid>
      </Section>

      <CtaBand
        title="Bring a concrete flow."
        lead="Bring the flow your app depends on: it can be mapped, prepared for preprod, and challenged in the open."
        actions={[
          {
            label: "Open GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "primary",
            icon: <GitHubIcon size={15} />,
          },
          { label: "Join Discord", href: OFFICIAL_LINKS.discord, variant: "ghost" },
        ]}
      />
    </main>
  );
}
