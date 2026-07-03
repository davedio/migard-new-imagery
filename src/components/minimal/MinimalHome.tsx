import Link from "next/link";
import type { ReactNode } from "react";
import ShatterHeading from "@/components/v2/ShatterHeading";
import DescentPreviewLoop from "@/components/minimal/DescentPreviewLoop";
import FireflyField from "@/components/minimal/FireflyField";
import { HeroStage } from "@/components/minimal/HeroStage";
import { MagneticPartnerBoard } from "@/components/minimal/MagneticPartnerBoard";
import { OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
import { DataRows, Statement, type DataRow } from "@/components/site/rhythm";
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
    body: "Node code, contracts, and implementation history — public on GitHub.",
    href: OFFICIAL_LINKS.github,
    external: true,
    meta: "↗",
  },
  {
    label: "Register interest",
    body: "Builders, Protocol Roles, infrastructure partners, and testnet participation.",
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
    <section className="minimal-partners" aria-labelledby="minimal-partners-title">
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
        {/* live-activity fireflies over the night plate (dark theme only) */}
        <FireflyField count={16} className="minimal-hero__fireflies" />
        <div className="minimal-hero__copy">
          <span className="minimal-status-chip">
            <i aria-hidden />
            {SITE_COPY.hero.status}
          </span>
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
              <SmartLink className="minimal-btn minimal-btn--quiet" href={SITE_COPY.hero.tertiaryCta.href}>
                {SITE_COPY.hero.tertiaryCta.label}
              </SmartLink>
            </div>
          </div>
        </div>
        <div className="minimal-hero__visual-space" aria-hidden />
      </section>

      {/* The pipeline lives ONCE on the site — told in full on
          /learn. Home keeps only this canvas trailer for it,
          closed by the trust line the page exists to say. */}
      <section
        className="minimal-section minimal-section--descent minimal-section--descent-cols"
        aria-labelledby="minimal-descent-title"
      >
        <div className="minimal-section__head">
          <h2 id="minimal-descent-title">Watch a transaction travel the tree.</h2>
          <p>
            Execution in the canopy, verification in the trunk, settlement at the roots —
            the same journey every Midgard transaction makes.
          </p>
          <Statement
            align="left"
            kicker={SITE_COPY.trustFlow.resolved.kicker}
            line={SITE_COPY.trustFlow.resolved.title}
            sub="Every commitment stays open to challenge — and one honest Watcher, out of any number, is enough to stop a bad block before it settles."
          />
        </div>
        <div className="minimal-descent-stage">
          <DescentPreviewLoop>
            <SmartLink className="minimal-btn minimal-btn--ghost" href="/learn">
              Watch it happen -&gt;
            </SmartLink>
          </DescentPreviewLoop>
        </div>
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
          <h2 id="minimal-verify-title">Inspect the claims.</h2>
          <p>
            Every claim on this page has a place you can check it — and every question
            has an official channel.
          </p>
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
