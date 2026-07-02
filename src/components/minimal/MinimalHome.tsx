import Link from "next/link";
import type { ReactNode } from "react";
import ShatterHeading from "@/components/v2/ShatterHeading";
import DescentPreviewLoop from "@/components/minimal/DescentPreviewLoop";
import FireflyField from "@/components/minimal/FireflyField";
import { HeroStage } from "@/components/minimal/HeroStage";
import { MagneticPartnerBoard } from "@/components/minimal/MagneticPartnerBoard";
import { TrustFlowAnimation } from "@/components/minimal/TrustFlowAnimation";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OfficialChannelIcon, OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
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

const INSPECTION_PATHS = [
  {
    title: "Security model",
    body: "How fast confirmations, fault-proof checks, Watcher replay, and final Cardano L1 settlement fit together.",
    cta: "Read security",
    href: "/participate#security",
  },
  {
    title: "Contract surface",
    body: "Preprod validators, state anchors, reference scripts, topology, and genesis history in one place.",
    cta: "Inspect contracts",
    href: "/developers#contracts",
  },
  {
    title: "Source review",
    body: "Implementation details, node code, contracts, and issues for builders and protocol reviewers.",
    cta: "Open GitHub",
    href: OFFICIAL_LINKS.github,
  },
] as const;

const USER_FLOW = ["Deposit", "Transact", "Withdraw"] as const;

const VALUE_STEPS = [
  {
    title: "Apps feel faster",
    body: "Users can receive soft confirmations while final settlement is still pending.",
  },
  {
    title: "State stays checkable",
    body: "Commitments can be replayed, challenged, and inspected through the public contract surface.",
  },
  {
    title: "Cardano L1 settlement comes last",
    body: "After verification, finalized state settles through the Cardano L1 path.",
  },
] as const;

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
            </div>
          </div>
        </div>
        <div className="minimal-hero__visual-space" aria-hidden />
      </section>

      {/* The three value steps highlight in sync with the hero tree's
          canopy → trunk → roots descent (body[data-descent-stage]). */}
      <section className="minimal-thesis" aria-label="Midgard at a glance">
        <div className="minimal-thesis__rail" aria-hidden="true">
          <span />
        </div>
        {VALUE_STEPS.map((step, index) => (
          <article className="minimal-thesis__item" data-step={index} key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <section className="minimal-section minimal-section--trust" aria-labelledby="minimal-mechanism-title">
        <div className="minimal-section__head">
          <h2 id="minimal-mechanism-title">Fast execution first. Verification before final settlement.</h2>
          <p>
            Users get a faster usable signal while committed state remains replayable,
            challengeable, and settled only after verification.
          </p>
        </div>
        <TrustFlowAnimation
          steps={SITE_COPY.lifecycle}
          userSteps={USER_FLOW}
          copy={SITE_COPY.trustFlow}
        />
      </section>

      <section className="minimal-section minimal-section--descent" aria-labelledby="minimal-descent-title">
        <div className="minimal-section__head">
          <h2 id="minimal-descent-title">Watch a transaction travel the tree.</h2>
          <p>
            Execution in the canopy, verification in the trunk, settlement at the roots —
            the same journey every Midgard transaction makes.
          </p>
        </div>
        <div className="minimal-descent-stage">
          <DescentPreviewLoop>
            <SmartLink className="minimal-btn minimal-btn--ghost" href="/how-it-works">
              Watch it happen -&gt;
            </SmartLink>
          </DescentPreviewLoop>
        </div>
      </section>

      <section id="paths" className="minimal-section minimal-section--paths" aria-labelledby="minimal-paths-title">
        <div className="minimal-section__head">
          <h2 id="minimal-paths-title">Choose your path.</h2>
          <p>Users learn the flow. Developers inspect source and contracts. Protocol Roles participate in the network.</p>
        </div>
        <nav className="minimal-hero-routes" aria-label="Midgard path shortcuts">
          {SITE_COPY.paths.map((path) => (
            <SmartLink key={path.title} className="minimal-hero-route" href={path.href}>
              <strong>{path.title}</strong>
              <span>{path.cta}</span>
            </SmartLink>
          ))}
        </nav>
      </section>

      <EcosystemPartners />

      <section className="minimal-section minimal-section--inspect" aria-labelledby="minimal-inspect-title">
        <div className="minimal-section__head">
          <h2 id="minimal-inspect-title">Inspect before you trust speed.</h2>
          <p>Performance claims matter only when the trust path is visible: security model, contracts, and source.</p>
        </div>
        <div className="minimal-proof-surface">
          <div className="minimal-proof-rail" aria-hidden="true">
            <span>Speed claim</span>
            <i />
            <strong>Verified trust path</strong>
            <i />
            <span>Public review</span>
          </div>
          <div className="minimal-inspect-grid">
            {INSPECTION_PATHS.map((item, i) => (
              <SmartLink key={item.title} className="minimal-inspect-card" href={item.href}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <strong>
                  {item.cta === "Open GitHub" ? <GitHubIcon size={14} aria-hidden /> : null}
                  {item.cta} -&gt;
                </strong>
              </SmartLink>
            ))}
          </div>
        </div>
      </section>

      <section id="channels" className="minimal-section" aria-labelledby="minimal-channels-title">
        <div className="minimal-section__head">
          <h2 id="minimal-channels-title">Use the right official channel.</h2>
          <p>Security reports, source review, builder interest, and public questions belong in different places.</p>
          <OfficialSocialLinks
            className="minimal-channel-socials"
            linkClassName="minimal-channel-social"
            iconSize={18}
            showLabels
          />
        </div>
        <div className="minimal-channel-grid">
          {SITE_COPY.channels.map((channel) => (
            <SmartLink key={channel.title} className="minimal-channel-card" href={channel.href}>
              <div className="minimal-channel-card__head">
                <span>{channel.intent}</span>
                <span className="minimal-channel-card__icon">
                  <OfficialChannelIcon label={channel.title} size={20} />
                </span>
              </div>
              <h3>{channel.title}</h3>
              <p>{channel.body}</p>
              <strong>
                {channel.cta === "Open GitHub" ? <GitHubIcon size={14} aria-hidden /> : null}
                {channel.cta} -&gt;
              </strong>
            </SmartLink>
          ))}
        </div>
      </section>
    </main>
  );
}
