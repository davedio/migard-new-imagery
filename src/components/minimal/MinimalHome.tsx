import Link from "next/link";
import type { ReactNode } from "react";
import { ConceptTree } from "@/components/minimal/ConceptTree";
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
        </div>
        <ConceptTree />
      </section>

      <section className="minimal-section minimal-section--paths" aria-labelledby="minimal-paths-title">
        <div className="minimal-section__head">
          <h2 id="minimal-paths-title">Choose the right path.</h2>
          <p>Three clear routes: use Midgard, build on Midgard, or help run and verify the protocol.</p>
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
          <h2 id="minimal-mechanism-title">Fast execution, then verification.</h2>
          <p>
            The user experience is simple. The protocol path underneath stays
            explicit enough for serious reviewers.
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
          <h2 id="minimal-proof-title">What to evaluate first.</h2>
          <p>Midgard should earn trust through inspectable mechanics, not vague claims.</p>
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

      <section className="minimal-section" aria-labelledby="minimal-channels-title">
        <div className="minimal-section__head">
          <h2 id="minimal-channels-title">Go to the right place.</h2>
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
