import Link from "next/link";
import type { ReactNode } from "react";
import { HeroStage } from "@/components/minimal/HeroStage";
import { MagneticPartnerBoard } from "@/components/minimal/MagneticPartnerBoard";
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
    href: "/learn#security-overview",
  },
  {
    title: "Contract surface",
    body: "Preprod validators, state anchors, reference scripts, topology, and genesis history in one place.",
    cta: "Inspect contracts",
    href: "/contracts",
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

const HERO_ROUTES = [
  {
    label: "Use",
    detail: "User path",
    href: "/learn#roles",
  },
  {
    label: "Build",
    detail: "Developer path",
    href: "/developers",
  },
  {
    label: "Verify",
    detail: "Independent verification",
    href: "/developers#developer-paths",
  },
] as const;

const METRIC_STATUS = {
  "Soft confirmations": "Benchmark",
  "Settlement security": "Trust path",
  "Execution model": "Architecture",
  "Verified smart contracts": "Formal methods",
  "Independent verification": "Challenge path",
  Status: "Current phase",
} as const;

function EcosystemPartners() {
  return (
    <section className="minimal-partners" aria-labelledby="minimal-partners-title">
      <h2 id="minimal-partners-title">Ecosystem Partners</h2>
      <MagneticPartnerBoard partners={ECOSYSTEM_PARTNERS} />
    </section>
  );
}

export default function MinimalHome() {
  return (
    <main className="minimal-site">
      <HeroStage />
      <section id="top" className="minimal-hero" aria-labelledby="minimal-hero-title">
        <div className="minimal-hero__copy">
          <h1 id="minimal-hero-title">{SITE_COPY.hero.title}</h1>
          <p>{SITE_COPY.hero.lead}</p>
          <div className="minimal-hero__dock">
            <div className="minimal-actions">
              <SmartLink className="minimal-btn minimal-btn--primary" href={SITE_COPY.hero.primaryCta.href}>
                {SITE_COPY.hero.primaryCta.label}
              </SmartLink>
              <SmartLink className="minimal-btn minimal-btn--ghost" href={SITE_COPY.hero.secondaryCta.href}>
                {SITE_COPY.hero.secondaryCta.label}
              </SmartLink>
            </div>
            <nav className="minimal-hero-routes" aria-label="Fast Midgard routes">
              {HERO_ROUTES.map((route) => (
                <SmartLink className="minimal-hero-route" href={route.href} key={route.label}>
                  <strong>{route.label}</strong>
                  <span>{route.detail}</span>
                </SmartLink>
              ))}
            </nav>
          </div>
        </div>
        <div className="minimal-hero__visual-space" aria-hidden />
      </section>

      <section className="minimal-thesis" aria-label="Midgard at a glance">
        <div className="minimal-thesis__rail" aria-hidden="true">
          <span />
        </div>
        {VALUE_STEPS.map((step, index) => (
          <article className="minimal-thesis__item" key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <EcosystemPartners />

      <section id="paths" className="minimal-section minimal-section--paths" aria-labelledby="minimal-paths-title">
        <div className="minimal-section__head">
          <h2 id="minimal-paths-title">Pick the role that matches what you need.</h2>
          <p>Users learn the flow. Builders inspect source and contracts. Protocol Roles participate in the network.</p>
        </div>
        <div className="minimal-card-grid minimal-card-grid--3">
          {SITE_COPY.paths.map((path) => (
            <SmartLink key={path.title} className="minimal-card minimal-card--link" href={path.href}>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
              <span>{path.cta} -&gt;</span>
            </SmartLink>
          ))}
        </div>
      </section>

      <section className="minimal-section minimal-section--split" aria-labelledby="minimal-mechanism-title">
        <div className="minimal-section__head">
          <h2 id="minimal-mechanism-title">Fast execution first. Verification before final settlement.</h2>
          <p>
            Users get a faster usable signal while committed state remains replayable,
            challengeable, and settled only after verification.
          </p>
        </div>
        <div className="minimal-flow-board" aria-label="Midgard user and protocol flow">
          <div className="minimal-user-path" aria-label="User experience">
            <span>User sees</span>
            <ol>
              {USER_FLOW.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="minimal-flow-list" aria-label="Protocol verification path">
            {SITE_COPY.lifecycle.map(([label, body], i) => (
              <div className="minimal-flow-row" data-zone={i < 3 ? "speed" : "verify"} key={label}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="minimal-section" aria-labelledby="minimal-proof-title">
        <div className="minimal-section__head">
          <h2 id="minimal-proof-title">Track the claims people can verify.</h2>
          <p>Publish the indicators that reduce guesswork: speed, settlement, UTXO fit, verification coverage, and status.</p>
        </div>
        <div className="minimal-metrics">
          {SITE_COPY.proofPoints.map((item) => (
            <div className="minimal-metric" key={item.k}>
              <div>
                <span>{item.k}</span>
                <em>{METRIC_STATUS[item.k]}</em>
              </div>
              <strong>{item.v}</strong>
              <p>{item.s}</p>
              {"href" in item ? (
                <a className="minimal-metric__link" href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.cta} -&gt;
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>

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
                <strong>{item.cta} -&gt;</strong>
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
              <strong>{channel.cta} -&gt;</strong>
            </SmartLink>
          ))}
        </div>
      </section>
    </main>
  );
}
