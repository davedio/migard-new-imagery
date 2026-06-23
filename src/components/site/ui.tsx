import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { CopyField } from "./CopyField";

/* =========================================================================
   Page primitives — server components that compose the design-system CSS
   classes defined in globals.css. Child pages import these so visual tweaks
   propagate from a single source of truth.
   ========================================================================= */

/* ---- buttons / actions ---- */

export type ActionLink = {
  label: string;
  href: string;
  variant?: "primary" | "ghost";
  /** Optional leading icon (e.g. a brand glyph) rendered before the label. */
  icon?: ReactNode;
};

export function LinkButton({ label, href, variant = "ghost", icon }: ActionLink) {
  const cls = `btn btn--${variant}`;
  const external = /^https?:\/\//.test(href);
  const inner = icon ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {icon}
      {label}
    </span>
  ) : (
    label
  );
  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  );
}

export function Actions({
  items,
  center,
}: {
  items?: ActionLink[];
  center?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`cta-row${center ? " cta-row--center" : ""}`}>
      {items.map((a) => (
        <LinkButton key={a.label} {...a} />
      ))}
    </div>
  );
}

/* ---- page hero ---- */

export function PageHero({
  label,
  title,
  sub,
  body,
  actions,
  chips,
  media,
  top,
  compact,
  tone,
}: {
  label?: string;
  title: ReactNode;
  sub?: ReactNode;
  body?: ReactNode;
  actions?: ActionLink[];
  chips?: ReactNode;
  /** Optional decorative background graphic layered behind the hero text (e.g. an interactive canvas). */
  media?: ReactNode;
  /** Optional slot rendered above the eyebrow (e.g. a <PartOf/> breadcrumb). */
  top?: ReactNode;
  /** ~60vh hero instead of full viewport — interior pages get content above the fold. */
  compact?: boolean;
  /** Subtle per-section tint over the shared fluid background so interior pages stop looking identical. */
  tone?: "emerald" | "moss" | "cobalt" | "ember" | "ink" | "tree";
}) {
  const cls = `page-hero${compact ? " page-hero--compact" : ""}${
    tone && tone !== "emerald" ? ` page-hero--tone-${tone}` : ""
  }`;
  return (
    <header className={cls}>
      {media ? (
        <div className="page-hero__media" aria-hidden="true">
          {media}
        </div>
      ) : null}
      <div className="page-hero__inner">
        {top}
        {label ? <div className="eyebrow">{label}</div> : null}
        <h1>{title}</h1>
        {sub ? (
          <p className="sub">{sub}</p>
        ) : null}
        {body ? (
          <p className="body">{body}</p>
        ) : null}
        {chips ? (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 22,
              flexWrap: "wrap",
            }}
          >
            {chips}
          </div>
        ) : null}
        {actions && actions.length > 0 ? (
          <Actions items={actions} />
        ) : null}
      </div>
    </header>
  );
}

/* ---- section ---- */

export function Section({
  id,
  eyebrow,
  title,
  lead,
  tight,
  glow,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  tight?: boolean;
  /** Add a soft ambient corner glow behind the section to fill below-fold voids. */
  glow?: "green" | "gold";
  children?: ReactNode;
}) {
  const hasHead = eyebrow || title || lead;
  const glowClass =
    glow === "green"
      ? " section--glow"
      : glow === "gold"
        ? " section--glow-gold"
        : "";
  return (
    <section
      id={id}
      className={`section${tight ? " section--tight" : ""}${glowClass}`}
    >
      <div className="section__inner">
        {hasHead ? (
          <Reveal>
            <div className="section__head">
              {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
              {title ? <h2>{title}</h2> : null}
              {lead ? <p className="lead">{lead}</p> : null}
            </div>
          </Reveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/* ---- prose ---- */

export type ProseItem = {
  text: ReactNode;
  variant?: "default" | "dim" | "emph";
};

export function Prose({ items }: { items: ProseItem[] }) {
  return (
    <Reveal>
      <div className="prose">
        {items.map((p, i) => (
          <p
            key={i}
            className={p.variant && p.variant !== "default" ? p.variant : undefined}
          >
            {p.text}
          </p>
        ))}
      </div>
    </Reveal>
  );
}

/* ---- card grid ---- */

export function CardGrid({
  children,
  cols,
}: {
  children: ReactNode;
  cols?: 2;
}) {
  return (
    <div className={`card-grid${cols === 2 ? " card-grid--2" : ""}`}>
      {children}
    </div>
  );
}

export function Card({
  num,
  title,
  body,
  cta,
  ctaIcon,
  href,
  ctaGlow = false,
  delay = 0,
}: {
  num?: string;
  title: ReactNode;
  body: ReactNode;
  cta?: string;
  /** Optional leading icon (e.g. a brand glyph) rendered before the cta text. */
  ctaIcon?: ReactNode;
  href?: string;
  /** Opt-in luminous CTA treatment for high-value path/action cards. */
  ctaGlow?: boolean;
  delay?: number;
}) {
  const external = href ? /^https?:\/\//.test(href) : false;
  const cardClass = `card panel${ctaGlow ? " card--cta-glow" : ""}`;
  const inner = (
    <>
      {num ? <div className="card__num">{num}</div> : null}
      <h3>{title}</h3>
      <p>{body}</p>
      {cta ? (
        <div className="card__cta">
          {ctaIcon ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              {ctaIcon}
              {cta} →
            </span>
          ) : (
            <>{cta} →</>
          )}
        </div>
      ) : null}
    </>
  );

  return (
    <Reveal delay={delay} style={{ display: "flex" }}>
      {href && external ? (
        <a
          href={href}
          className={cardClass}
          style={{ width: "100%" }}
          target="_blank"
          rel="noreferrer"
        >
          {inner}
        </a>
      ) : href ? (
        <Link href={href} className={cardClass} style={{ width: "100%" }}>
          {inner}
        </Link>
      ) : (
        <div className={cardClass} style={{ width: "100%" }}>
          {inner}
        </div>
      )}
    </Reveal>
  );
}

/* ---- bullet list ---- */

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <Reveal>
      <ul className="bullets">
        {items.map((it, i) => (
          <li key={i}>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/* ---- layer list (mechanism) ---- */

export type LayerItem = { n: string; name: string; desc: ReactNode };

export function Layers({ items }: { items: LayerItem[] }) {
  return (
    <div className="layers">
      {items.map((l, i) => (
        <Reveal key={l.name} delay={i * 50}>
          <div className="layer-row panel">
            <div className="n">{l.n}</div>
            <div className="name">{l.name}</div>
            <div className="desc">{l.desc}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---- faq ---- */

export type FaqQA = { q: ReactNode; a: ReactNode };
export type FaqGroup = { title: string; items: FaqQA[] };

/** Stable anchor slug for a FAQ group title, e.g. "Wallets and partners" -> faq-wallets-and-partners */
export function faqGroupId(title: string): string {
  return `faq-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export function Faq({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="faq">
      {groups.map((g) => (
        <Reveal key={g.title}>
          <div className="faq-group" id={faqGroupId(g.title)} style={{ scrollMarginTop: 110 }}>
            <h3>{g.title}</h3>
            <div className="faq-list">
              {g.items.map((qa, i) => (
                <div className="faq-item" key={i}>
                  <div className="q">{qa.q}</div>
                  <div className="a">{qa.a}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---- callout (safety) ---- */

export function Callout({
  title,
  body,
  items,
}: {
  title?: string;
  body?: ReactNode;
  items?: ReactNode[];
}) {
  return (
    <Reveal>
      <div className="callout">
        {title ? <h3>{title}</h3> : null}
        {body ? <p>{body}</p> : null}
        {items && items.length > 0 ? (
          <ul>
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Reveal>
  );
}

/* ---- cta band ---- */

export function CtaBand({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ActionLink[];
}) {
  return (
    <section className="cta-band">
      <div className="cta-band__inner">
        <Reveal>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h2>{title}</h2>
          {lead ? <p className="lead">{lead}</p> : null}
          <Actions items={actions} center />
        </Reveal>
      </div>
    </section>
  );
}

/* ---- links table (official links) ---- */

export type LinkRow = {
  k: string;
  v: string;
  href?: string;
  pending?: boolean;
  /** Optional leading icon (e.g. a brand glyph) rendered before the key. */
  icon?: ReactNode;
  /** Show the full URL with a copy button (anti-phishing pattern). */
  copy?: boolean;
};

export function LinksTable({ rows }: { rows: LinkRow[] }) {
  return (
    <div className="links-table">
      {rows.map((r) => (
        <div className="links-row" key={r.k} data-has-copy={Boolean(r.copy && r.href)}>
          <span className="k">
            {r.icon ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                {r.icon}
                {r.k}
              </span>
            ) : (
              r.k
            )}
          </span>
          {r.pending || !r.href ? (
            <span className="v pending">{r.v}</span>
          ) : /^https?:\/\//.test(r.href) ? (
            <a className="v" href={r.href} target="_blank" rel="noreferrer">
              {r.v}
            </a>
          ) : (
            <Link className="v" href={r.href}>
              {r.v}
            </Link>
          )}
          {r.copy && r.href && /^https?:\/\//.test(r.href) ? (
            /* anti-phishing: the FULL canonical URL, visible and copyable */
            <span className="links-row__url">
              <CopyField value={r.href} label={r.k} />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
