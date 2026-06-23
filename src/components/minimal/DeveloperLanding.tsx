import { GitHubIcon } from "@/components/site/BrandIcons";
import { Card, CardGrid, CtaBand, Layers, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY } from "@/lib/siteCopy";

export default function DeveloperLanding() {
  return (
    <main className="page-main developer-page">
      <PageHero
        compact
        tone="tree"
        title={DEVELOPER_COPY.hero.title}
        sub={DEVELOPER_COPY.hero.lead}
        actions={[
          {
            label: "Open GitHub",
            href: OFFICIAL_LINKS.github,
            variant: "primary",
            icon: <GitHubIcon size={15} />,
          },
          { label: "Inspect contracts", href: "/contracts", variant: "ghost" },
        ]}
      />

      <Section
        title="Start from the right surface."
        lead="Most reviewers do not need the same first link. Pick the surface that matches what you are trying to prove."
      >
        <CardGrid>
          {DEVELOPER_COPY.entryPoints.map((item, i) => (
            <Card
              key={item.label}
              num={String(i + 1).padStart(2, "0")}
              title={item.label}
              body={item.detail}
              cta={item.label === "GitHub" ? "Open GitHub" : `Open ${item.label.toLowerCase()}`}
              ctaIcon={item.label === "GitHub" ? <GitHubIcon size={14} /> : undefined}
              href={item.href}
            />
          ))}
        </CardGrid>
      </Section>

      <Section
        id="developer-paths"
        title="Choose your developer path."
        lead="Application builders, protocol reviewers, and protocol roles need different next steps."
        glow="green"
      >
        <CardGrid>
          {DEVELOPER_COPY.tracks.map((track, i) => (
            <Card
              key={track.title}
              num={String(i + 1).padStart(2, "0")}
              title={track.title}
              body={track.body}
              cta={track.cta}
              ctaIcon={track.href === OFFICIAL_LINKS.github ? <GitHubIcon size={14} /> : undefined}
              href={track.href}
              ctaGlow
            />
          ))}
        </CardGrid>
      </Section>

      <Section
        title="The builder checklist."
        lead="Use this as the first review path before a deeper integration conversation."
        tight
      >
        <Layers
          items={[
            { n: "01", name: "Read", desc: "Start with GitHub and the plain-language overview." },
            { n: "02", name: "Inspect", desc: "Open the contract addresses, topology, and state anchors." },
            { n: "03", name: "Model", desc: "Map your user flow to deposit, transact, withdraw, and fallback behavior." },
            { n: "04", name: "Verify", desc: "Review the fault-proof path, Watcher role, and settlement assumptions." },
          ]}
        />
      </Section>

      <CtaBand
        title="Bring a concrete flow."
        lead="The fastest useful developer conversation starts with a wallet action, dApp interaction, indexer need, or protocol path that can be mapped to Midgard."
        actions={[
          {
            label: "View GitHub",
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
