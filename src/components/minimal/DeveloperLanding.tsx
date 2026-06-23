import Link from "next/link";
import type { ReactNode } from "react";
import { DEVELOPER_COPY } from "@/lib/siteCopy";

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

function DevLink({
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

export default function DeveloperLanding() {
  return (
    <main className="minimal-site minimal-page">
      <section className="minimal-page-hero">
        <div>
          <h1>{DEVELOPER_COPY.hero.title}</h1>
          <p>{DEVELOPER_COPY.hero.lead}</p>
        </div>
        <div className="minimal-entry-panel" aria-label="Developer entry points">
          <span>Developer entry points</span>
          <div>
            {DEVELOPER_COPY.entryPoints.map((item) => (
              <DevLink key={item.label} href={item.href}>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </DevLink>
            ))}
          </div>
        </div>
      </section>

      <section className="minimal-section">
        <div className="minimal-card-grid minimal-card-grid--3">
          {DEVELOPER_COPY.tracks.map((track) => (
            <DevLink key={track.title} className="minimal-card minimal-card--link" href={track.href}>
              <h3>{track.title}</h3>
              <p>{track.body}</p>
              <span>{track.cta} -&gt;</span>
            </DevLink>
          ))}
        </div>
      </section>

      <section className="minimal-section minimal-section--split" aria-labelledby="developer-flow-title">
        <div className="minimal-section__head">
          <h2 id="developer-flow-title">The builder checklist.</h2>
          <p>Use this as the first review path before a deeper integration conversation.</p>
        </div>
        <div className="minimal-flow-list">
          {[
            ["Read", "Start with GitHub and the protocol overview."],
            ["Inspect", "Open the contract addresses and state anchors."],
            ["Model", "Map your user flow to deposit, transact, and withdraw."],
            ["Verify", "Review the fault-proof and settlement assumptions."],
          ].map(([label, body], i) => (
            <div className="minimal-flow-row" key={label}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
