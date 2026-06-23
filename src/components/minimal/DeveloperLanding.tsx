import Link from "next/link";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { Card, CardGrid, CtaBand, Layers, PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY } from "@/lib/siteCopy";
import styles from "@/components/site/developer.module.css";

const launchpad = [
  {
    label: "Review source",
    detail: "Open the node code, contract implementation, and public issues.",
    href: OFFICIAL_LINKS.github,
    cta: "Open GitHub",
    github: true,
  },
  {
    label: "Contract addresses",
    detail: "Check validator topology, state anchors, reference scripts, and the preprod snapshot.",
    href: "/contracts",
    cta: "Inspect contracts",
  },
  {
    label: "Security model",
    detail: "Understand the trust path, fault-proof checks, Watcher replay, and settlement assumptions.",
    href: "/security",
    cta: "Read security",
  },
  {
    label: "Protocol Roles",
    detail: "Register operator, Watcher, infrastructure, or testnet interest.",
    href: OFFICIAL_LINKS.intakeForm,
    cta: "Open intake form",
  },
] as const;

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

function LaunchpadLink({ item, index }: { item: (typeof launchpad)[number]; index: number }) {
  const isGitHubCard = "github" in item && item.github;
  const inner = (
    <>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <h3>
        {isGitHubCard ? <GitHubIcon size={18} aria-hidden /> : null}
        {item.label}
      </h3>
      <p>{item.detail}</p>
      <strong>{item.cta} -&gt;</strong>
    </>
  );

  if (isExternal(item.href)) {
    return (
      <a className={styles.launchCard} href={item.href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link className={styles.launchCard} href={item.href}>
      {inner}
    </Link>
  );
}

export default function DeveloperLanding() {
  return (
    <main className={`page-main developer-page ${styles.developerPage}`}>
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

      <section
        className={styles.launchpad}
        aria-labelledby="developer-launchpad-title"
      >
        <div className={styles.launchInner}>
          <div className={styles.launchCopy}>
            <h2 id="developer-launchpad-title">Open the source, then follow the path.</h2>
            <p>
              Builders, reviewers, operators, and Watchers need different proof points. Pick the link that matches the work.
            </p>
            <div className={styles.supportLinks} aria-label="Supporting documents">
              <span>Supporting docs</span>
              <a href={OFFICIAL_LINKS.whitepaper} target="_blank" rel="noreferrer">
                Whitepaper -&gt;
              </a>
            </div>
          </div>
          <div className={styles.launchGrid}>
            {launchpad.map((item, i) => (
              <LaunchpadLink key={item.label} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Section
        id="developer-paths"
        title="Choose your developer path."
        lead="Application builders, protocol reviewers, and Protocol Roles need different next steps."
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
