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

export default function MinimalHome() {
  return (
    <main className="minimal-site">
      <section className="minimal-hero" aria-labelledby="minimal-hero-title">
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
          <div className="minimal-hero__proof-strip" aria-label="Core Midgard promise">
            <span>Soft confirmation first</span>
            <span>Fault-proof checks before settlement</span>
            <span>L1 security after verification</span>
          </div>
        </div>
        <ConceptTree />
      </section>

      <section id="paths" className="minimal-section minimal-section--paths" aria-labelledby="minimal-paths-title">
        <div className="minimal-section__head">
          <h2 id="minimal-paths-title">Choose the path that matches your job.</h2>
          <p>Users, Builders, and Protocol Roles need different first steps. Start with the job, then choose the channel.</p>
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
            The user path stays simple: deposit, transact, withdraw. The protocol
            path underneath stays explicit enough for serious reviewers to inspect.
          </p>
        </div>
        <div className="minimal-flow-list">
          {SITE_COPY.lifecycle.map(([label, body], i) => (
            <div className="minimal-flow-row" key={label}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="minimal-section" aria-labelledby="minimal-proof-title">
        <div className="minimal-section__head">
          <h2 id="minimal-proof-title">Evaluate the claims that matter.</h2>
          <p>Midgard should earn trust through inspectable mechanics, current status, and metrics that serious users can verify.</p>
        </div>
        <div className="minimal-metrics">
          {SITE_COPY.proofPoints.map((item) => (
            <div className="minimal-metric" key={item.k}>
              <span>{item.k}</span>
              <strong>{item.v}</strong>
              <p>{item.s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="minimal-section minimal-section--inspect" aria-labelledby="minimal-inspect-title">
        <div className="minimal-section__head">
          <h2 id="minimal-inspect-title">Inspect before you trust speed.</h2>
          <p>Performance claims only matter after the trust path is clear: security model, contracts, and source.</p>
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
      </section>

      <section className="minimal-section" aria-labelledby="minimal-channels-title">
        <div className="minimal-section__head">
          <h2 id="minimal-channels-title">Use the right official channel.</h2>
          <p>Each channel has a job. Start from official surfaces before you trust links or claims.</p>
        </div>
        <div className="minimal-card-grid minimal-card-grid--4">
          {SITE_COPY.channels.map((channel) => (
            <SmartLink key={channel.title} className="minimal-card minimal-card--link" href={channel.href}>
              <h3>{channel.title}</h3>
              <p>{channel.body}</p>
              <span>Open -&gt;</span>
            </SmartLink>
          ))}
        </div>
      </section>
    </main>
  );
}
