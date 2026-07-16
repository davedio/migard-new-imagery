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
          { label: "Preprod launch", href: "/status", variant: "primary" },
          { label: "Security", href: "/learn#security", variant: "ghost" },
          {
            label: "GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "ghost",
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
        lead="No new asset in your integration and no separate fee market to explain to users."
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
        lead="An invalid transaction, a bad commitment, withheld data, an operator gone dark: each is a fault, and each can be checked on Cardano. Fault is broader than fraud on purpose; not every failure is intentional."
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
            body="A block folds into confirmed state only after its challenge window passes with no valid fault proof. Fast confirmations up front never shortcut it."
            delay={150}
          />
        </CardGrid>
        <div className="prose">
          <p className="dim">
            The protocol enforces custody (scripts, not keys),
            validity (fault proofs), and settlement on Cardano. What an app, RPC, or
            explorer <em>shows</em> you still depends on the data source it reads: a
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
        lead="Midgard is pre-alpha. The source is open; Cardano preprod access arrives soon. A hosted public RPC endpoint follows later."
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
