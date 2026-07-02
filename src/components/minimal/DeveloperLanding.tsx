import { GitHubIcon } from "@/components/site/BrandIcons";
import { ContractsReference } from "@/components/site/ContractsReference";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, StepRail } from "@/components/site/rhythm";
import { Card, CardGrid, CtaBand, PageHero, Prose, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY } from "@/lib/siteCopy";

/* /developers — reading-rhythm layout (see .review/card-rhythm-redesign-2026-07-02.md):
   hero (the one telling of the wallet-action…fallback sentence) → ONE sticky
   JumpChips bar tracking the whole page → ONE Grid (developer paths, with the
   integration-path StepRail as the page's single path telling) → contracts
   reference (header band, topology set-piece, table of record, genesis, query)
   → security (Prose + two data rows) → one closing CTA band.
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
          { label: "Security", href: "/developers#security", variant: "ghost" },
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
          { id: "security", label: "Security" },
        ]}
      />

      <Section
        id="start"
        title="Choose your developer path."
        lead="One sequence for everyone, then four tracks with different next steps."
        glow="green"
      >
        <StepRail
          ariaLabel="Developer integration path"
          steps={DEVELOPER_COPY.integrationPath}
        />
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

      <Section
        id="security"
        title={DEVELOPER_COPY.security.title}
        lead={DEVELOPER_COPY.security.lead}
      >
        <Prose items={DEVELOPER_COPY.security.prose.map((text) => ({ text }))} />
        <DataRows
          ariaLabel="Audit status and responsible disclosure"
          rows={DEVELOPER_COPY.security.rows.map((row) => ({
            label: row.label,
            body: row.body,
            href: "href" in row ? row.href : undefined,
            external: "href" in row ? /^https?:\/\//.test(row.href) : undefined,
          }))}
        />
      </Section>

      <CtaBand
        title="Bring a concrete flow."
        lead="Abstract interest stalls; a real flow gets a real answer. Bring the one your app depends on and it can be mapped, tested on preprod, and challenged in the open."
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
