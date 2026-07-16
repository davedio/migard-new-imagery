import Link from "next/link";
import type { ReactNode } from "react";
import ShatterHeading from "@/components/v2/ShatterHeading";
import DescentPreviewLoop from "@/components/minimal/DescentPreviewLoop";
import { HeroStage } from "@/components/minimal/HeroStage";
import { MagneticPartnerBoard } from "@/components/minimal/MagneticPartnerBoard";
import { OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
import { DataRows, Statement, type DataRow } from "@/components/site/rhythm";
import { Card, CardGrid } from "@/components/site/ui";
import { ECOSYSTEM_PARTNERS } from "@/lib/ecosystemPartners";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { SITE_COPY } from "@/lib/siteCopy";

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

/* Verify & connect — the page's quiet closer: every proof surface and
   official channel as one flat directory (inspect + channels, deduped). */
const VERIFY_ROWS: readonly DataRow[] = [
  {
    label: "Official links",
    body: "The canonical list: if a link is not on it, it is not us.",
    href: "/official-links",
  },
  {
    label: "Network status",
    body: "Every metric labeled with its real state: live, preprod, preview, target, or planned.",
    href: "/status",
  },
  {
    label: "Security model",
    body: "Trust path, fault proofs, audit status, and responsible disclosure.",
    href: "/learn#security",
  },
  {
    label: "Contract surface",
    body: "Preprod validators, state anchors, reference scripts, and topology.",
    href: "/developers#contracts",
  },
  {
    label: "Source review",
    body: "Node code, contracts, and implementation history, public on GitHub.",
    href: OFFICIAL_LINKS.github,
    external: true,
    meta: "↗",
  },
  {
    label: "Register interest",
    body: "Builders, protocol roles, infrastructure partners, and testnet participation.",
    href: OFFICIAL_LINKS.intakeForm,
    external: true,
    meta: "↗",
  },
  {
    label: "Community",
    body: "Non-sensitive questions and early builder coordination on Discord.",
    href: OFFICIAL_LINKS.discord,
    external: true,
    meta: "↗",
  },
];

function EcosystemPartners() {
  return (
    <section id="ecosystem" className="minimal-partners" aria-labelledby="minimal-partners-title">
      <h2 id="minimal-partners-title">Ecosystem Partners</h2>
      <p className="minimal-partners__intro">{SITE_COPY.partnersIntro}</p>
      <MagneticPartnerBoard partners={ECOSYSTEM_PARTNERS} />
    </section>
  );
}

export default function MinimalHome() {
  return (
    <main className="minimal-site">
      <HeroStage />
      <section id="top" className="minimal-hero" aria-label={SITE_COPY.hero.title}>
        <div className="minimal-hero__copy">
          <ShatterHeading as="h1" lines={[...SITE_COPY.hero.titleLines]} />
          <p>{SITE_COPY.hero.lead}</p>
          <dl className="minimal-hero-stats" aria-label="Midgard at a glance">
            {SITE_COPY.stats.map((stat) => (
              <div className="minimal-hero-stat" key={stat.k}>
                <dt>{stat.k}</dt>
                <dd>
                  {stat.v}
                  <span>{stat.s}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="minimal-hero__dock">
            <div className="minimal-actions">
              <SmartLink className="minimal-btn minimal-btn--primary" href={SITE_COPY.hero.primaryCta.href}>
                {SITE_COPY.hero.primaryCta.label}
              </SmartLink>
              <SmartLink className="minimal-btn minimal-btn--ghost" href={SITE_COPY.hero.secondaryCta.href}>
                {SITE_COPY.hero.secondaryCta.label}
              </SmartLink>
            </div>
          </div>
        </div>
        <div className="minimal-hero__visual-space" aria-hidden />
      </section>

      {/* Choose your path — the role router, called up early per the
          2026-07-03 call ("why do I need to be here?" answered first).
          Verb-led cards from SITE_COPY.paths; earn hook stated as an
          estimate per the 2026-07-08 claims ruling. */}
      <section
        id="paths"
        className="minimal-section minimal-section--paths"
        aria-labelledby="minimal-paths-title"
      >
        <div className="minimal-section__head">
          <h2 id="minimal-paths-title">Choose your path.</h2>
          <p>Build, participate, or use Midgard.</p>
        </div>
        <CardGrid cols={3}>
          {SITE_COPY.paths.map((path, i) => (
            <Card
              key={path.title}
              num={String(i + 1).padStart(2, "0")}
              title={path.title}
              body={path.body}
              cta={path.cta}
              href={path.href}
              delay={i * 50}
            />
          ))}
        </CardGrid>
      </section>

      {/* The pipeline lives ONCE on the site — told in full on
          /learn. Home keeps only this canvas trailer for it,
          closed by the trust line the page exists to say. */}
      <section
        className="minimal-section minimal-section--descent minimal-section--descent-cols"
        data-tree-handoff
        aria-labelledby="minimal-descent-title"
      >
        <div className="minimal-section__head">
          <h2 id="minimal-descent-title">Watch the transaction lifecycle.</h2>
          <p>
            Follow a transaction from execution through verification to final settlement.
          </p>
          <Statement
            align="left"
            variant="supporting"
            kicker={SITE_COPY.trustFlow.resolved.kicker}
            line="Anyone can verify commitments during the challenge period."
            sub="One honest Watcher is enough to stop a bad block before it settles."
          />
        </div>
        <div className="minimal-descent-stage">
          <DescentPreviewLoop>
            <SmartLink className="minimal-btn minimal-btn--ghost" href="/learn">
              Follow a transaction →
            </SmartLink>
          </DescentPreviewLoop>
        </div>
      </section>

      {/* Problem → solution — per the 2026-07-10 call, the problem prose is
          gone entirely: the heading states the tension, the Statement carries
          the solution (the "second sentence only" decision), throughput still
          qualified as an estimate per the 2026-07-08 claims ruling. */}
      <section
        id="problem"
        className="minimal-section minimal-section--problem"
        aria-labelledby="minimal-problem-title"
      >
        <div className="minimal-section__head">
          <h2 id="minimal-problem-title">Scale without the security tradeoff</h2>
          <Statement
            align="left"
            variant="supporting"
            line="Midgard anchors its security to Cardano, unlike other L2s that ask you to accept a new security model."
          />
        </div>
        <CardGrid cols={4}>
          <Card
            num="01"
            title="DeFi without congestion"
            body="Swaps, lending, and orderbooks that keep moving when the base chain is busy."
          />
          <Card
            num="02"
            title="High-frequency apps"
            body="Real-time state that updates constantly, with confirmations in seconds (estimated)."
            delay={50}
          />
          <Card
            num="03"
            title="Easy payments"
            body="Low-fee transfers paid in ADA."
            delay={100}
          />
          <Card
            num="04"
            title="Cheaper infrastructure"
            body="The same scripts and tooling, designed to run at lower cost."
            delay={150}
          />
        </CardGrid>
      </section>

      <EcosystemPartners />

      {/* Verify & connect — the quiet closer: proof surfaces and official
          channels as one flat directory. */}
      <section
        id="channels"
        className="minimal-section minimal-section--verify minimal-section--cols"
        aria-labelledby="minimal-verify-title"
      >
        <div className="minimal-section__head">
          {/* Renamed from "Inspect the claims." — Dave on the 7/3 call:
              "I don't know what inspect the claims means." */}
          <h2 id="minimal-verify-title">Quick links</h2>
          <p>Helpful links to route you to the right place.</p>
          <OfficialSocialLinks
            className="minimal-channel-socials"
            linkClassName="minimal-channel-social"
            iconSize={18}
            showLabels
          />
        </div>
        <DataRows rows={VERIFY_ROWS} ariaLabel="Verification surfaces and official channels" />
      </section>
    </main>
  );
}
