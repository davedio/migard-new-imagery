import Link from "next/link";
import type { ReactNode } from "react";
import { ConceptTree } from "@/components/minimal/ConceptTree";
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
    body: "How fast confirmations, fault-proof checks, Watcher replay, and final L1 settlement fit together.",
    cta: "Read security",
    href: "/security",
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

const QUICK_ROUTES = [
  {
    title: "Users",
    body: "Use apps with faster confirmations and inspectable settlement.",
    href: "/learn#roles",
  },
  {
    title: "Builders",
    body: "Map real eUTXO flows to the execution layer.",
    href: "/developers",
  },
  {
    title: "Protocol Roles",
    body: "Sequence activity, replay commitments, and challenge state.",
    href: "/developers#developer-paths",
  },
  {
    title: "Official channels",
    body: "Use the right path for security, source, interest, or support.",
    href: "#channels",
  },
] as const;

const USER_FLOW = ["Deposit", "Transact", "Withdraw"] as const;

const VALUE_STEPS = [
  {
    title: "Apps execute faster",
    body: "Users can receive soft confirmations before the final settlement path finishes.",
  },
  {
    title: "State stays checkable",
    body: "Commitments can be replayed, challenged, and inspected through the public contract surface.",
  },
  {
    title: "Final state settles on L1",
    body: "After verification, finalized state settles through the base-layer path.",
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
    detail: "Security model",
    href: "/security",
  },
  {
    label: "Report",
    detail: "Security policy",
    href: OFFICIAL_LINKS.securityPolicy,
  },
] as const;

const METRIC_STATUS = {
  "Soft confirmations": "Benchmark",
  "Settlement security": "Trust path",
  "Execution model": "Architecture",
  "Verified contracts": "Formal review",
  "Fault-proof coverage": "Challenge path",
  Status: "Current phase",
} as const;

export default function MinimalHome() {
  return (
    <main className="minimal-site">
      <section id="top" className="minimal-hero" aria-labelledby="minimal-hero-title">
        <div className="minimal-hero__copy">
          <h1 id="minimal-hero-title">{SITE_COPY.hero.title}</h1>
          <p>{SITE_COPY.hero.lead}</p>
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
        <ConceptTree />
      </section>

      <section className="minimal-route-strip" aria-label="Choose a Midgard route">
        {QUICK_ROUTES.map((route) => (
          <SmartLink className="minimal-route-card" href={route.href} key={route.title}>
            <strong>{route.title}</strong>
            <p>{route.body}</p>
          </SmartLink>
        ))}
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

      <section id="paths" className="minimal-section minimal-section--paths" aria-labelledby="minimal-paths-title">
        <div className="minimal-section__head">
          <h2 id="minimal-paths-title">Choose the route that matches your job.</h2>
          <p>Users want faster activity. Builders need source and contracts. Protocol Roles keep execution verifiable.</p>
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
          <h2 id="minimal-proof-title">Track the claims that matter.</h2>
          <p>Publish the indicators that reduce guesswork: speed, settlement, eUTXO fit, verification coverage, and status.</p>
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
        </div>
        <div className="minimal-channel-grid">
          {SITE_COPY.channels.map((channel) => (
            <SmartLink key={channel.title} className="minimal-channel-card" href={channel.href}>
              <span>{channel.intent}</span>
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
