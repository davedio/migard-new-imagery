import { GitHubIcon } from "@/components/site/BrandIcons";
import { ContractsReference } from "@/components/site/ContractsReference";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import IntegrationSteps from "@/components/site/IntegrationSteps";
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
      <PageBackdrop name="forest-path" focus="54% 48%" />
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
          { id: "contracts", label: "Contracts" },
          { id: "query", label: "Query" },
        ]}
      />

      <Section
        id="start"
        title="Choose your developer path."
        lead="One sequence for everyone, then four tracks with different next steps."
        glow="green"
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

      <ContractsReference />

      <CtaBand
        title="Bring a concrete flow."
        lead="Bring the flow your app depends on — it can be mapped and tested on preprod today. Bring the one your app depends on and it can be mapped, tested on preprod, and challenged in the open."
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
