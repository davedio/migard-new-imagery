import { GitHubIcon } from "@/components/site/BrandIcons";
import { ContractsReference } from "@/components/site/ContractsReference";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import IntegrationSteps from "@/components/site/IntegrationSteps";
import { DataRows } from "@/components/site/rhythm";
import { Card, CardGrid, CtaBand, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY } from "@/lib/siteCopy";

/* /developers — reading-rhythm layout (see .review/card-rhythm-redesign-2026-07-02.md):
   hero (the one telling of the wallet-action…fallback sentence) → ONE sticky
   JumpChips bar tracking the whole page → ONE Grid (developer paths, with the
   integration-path stepper as the page's single path telling) → contracts
   reference (header band, topology set-piece, table of record, genesis, query)
   → one closing CTA band. Security now lives in the Learn section.
   Motion: the Grid keeps its group entrance; everything else is static. */

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
          { label: "Contracts", href: "/developers#contracts", variant: "primary" },
          { label: "Security", href: "/learn#security", variant: "ghost" },
          {
            label: "GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
            icon: <GitHubIcon size={15} />,
          },
        ]}
      />

      {/* The page's ONE sticky nav — tracks the whole page, including the
          contracts reference (which no longer carries its own toc). */}
      <JumpChips
        items={[
          { id: "start", label: "Paths" },
          { id: "economics", label: "Economics" },
          { id: "contracts", label: "Contracts" },
          { id: "query", label: "Query" },
          { id: "defense", label: "Fault proofs" },
          { id: "reference", label: "Reference" },
        ]}
      />

      <Section
        id="start"
        title="Choose your developer path."
        lead="One sequence for everyone, then four tracks with different next steps."
        glow="green"
        cols
      >
        <div className="motion-band">
          <IntegrationSteps
            ariaLabel="Developer integration path"
            steps={DEVELOPER_COPY.integrationPath}
          />
        </div>
        <CardGrid cols={2}>
          {DEVELOPER_COPY.tracks.map((track, i) => (
            <Card
              key={track.title}
              num={String(i + 1).padStart(2, "0")}
              title={track.title}
              body={track.body}
              cta={track.cta}
              href={track.href}
              delay={i * 50}
            />
          ))}
        </CardGrid>
      </Section>

      {/* The builder side of network economics — /economics folded into the
          audience pages 2026-07-11; the cross-view lives on /learn#economics. */}
      <Section
        id="economics"
        title="Economics for builders."
        lead="No new asset in your integration, no separate fee market to explain to users."
        cols
      >
        <DataRows
          ariaLabel="Builder economics"
          rows={[
            {
              label: "Fee model",
              body: "Denominated in ADA end to end. Your users transact with the wallet and asset they already have.",
            },
            {
              label: "Cost profile",
              body: "Execution happens off-chain; only compact data commits to Cardano. Measured fee comparisons will be published once benchmarked.",
            },
            {
              label: "What your users pay",
              body: "Designed for a fraction of L1 cost and confirmations in seconds; both are estimates pending benchmarks.",
            },
            {
              label: "The whole picture",
              body: "Compare what every participant pays and earns across the network.",
              href: "/learn#economics",
            },
          ]}
        />
      </Section>

      <ContractsReference />

      {/* Technical security depth lives HERE per the 2026-07-08 persona
          split: Learn keeps the plain-language summary, Participate keeps
          the incentive framing, developers get the mechanism. DA/DAC detail
          is allowed in this technical context (and FAQs) only. */}
      <Section
        id="defense"
        title="How the protocol defends itself."
        lead="An invalid transaction, a bad commitment, withheld data, an operator gone dark: each is a fault, and each can be checked on Cardano. Fault is broader than fraud on purpose — not every failure is intentional."
        cols
      >
        <CardGrid cols={2}>
          <Card
            num="01"
            title="Operators commit and bond"
            body="An Operator sequences a block, commits its header to the L1 state queue, and locks a bond as collateral against that commitment."
          />
          <Card
            num="02"
            title="Watchers verify"
            body="Watchers run independently. They replay every committed block against the posted data, the UTXO rules, and the L1 header."
            delay={50}
          />
          <Card
            num="03"
            title="A fault proof slashes"
            body="If a block is faulty, a Watcher submits a compact fault proof to Cardano. It slashes the Operator's bond, reverts the block, and rewards the prover."
            delay={100}
          />
          <Card
            num="04"
            title="The window is the guarantee"
            body="A block folds into confirmed state only after its challenge window passes with no valid fault proof — fast confirmations up front never shortcut it."
            delay={150}
          />
        </CardGrid>
        <div className="prose">
          <p className="dim">
            The protocol enforces custody (scripts, not keys),
            validity (fault proofs), and settlement on Cardano. What an app, RPC, or
            explorer <em>shows</em> you still depends on the data source it reads — a
            compromised RPC feed can lie about what you see (RPC poisoning) but cannot
            rewrite Midgard&apos;s canonical state, which lives on Cardano. For the strongest
            assurance, verify against your own node. Block-data retrievability is designed
            to be handled by a dedicated data-availability layer with committee
            attestation; that layer is in active development, with long-term history
            planned for separate archive nodes.
          </p>
        </div>
      </Section>

      <Section
        id="reference"
        title="Keep these handy."
        lead="Midgard is pre-alpha. The node, contracts, and SDK are open source and you can build against them today; a hosted public RPC endpoint arrives with a later phase. For now, run against the local node and Cardano preprod."
        tight
        cols
      >
        <CardGrid cols={2}>
          <Card
            title="GitHub"
            body="The node, the contracts, and the TypeScript SDK — one repo."
            cta="Open the repo"
            href={OFFICIAL_LINKS.github}
            ctaIcon={<GitHubIcon size={14} />}
          />
          <Card
            title="Whitepaper"
            body="The full protocol design, end to end."
            cta="Read the spec"
            href="https://anastasia-labs.github.io/midgard/midgard.pdf"
            delay={50}
          />
          <Card
            title="Contract addresses"
            body="Verify every validator and state anchor on Cardano preprod."
            cta="Inspect contracts"
            href="/developers#contracts"
            delay={100}
          />
          <Card
            title="Discord"
            body="Pre-alpha testnet access and developer support."
            cta="Join Discord"
            href={OFFICIAL_LINKS.discord}
            delay={150}
          />
        </CardGrid>
      </Section>

      <CtaBand
        title="Bring a concrete flow."
        lead="Bring the flow your app depends on — it can be mapped, tested on preprod, and challenged in the open."
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
