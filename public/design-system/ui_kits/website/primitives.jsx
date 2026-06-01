/* Midgard UI Kit — shared primitives (ports of src/components/site/ui.tsx) */
const { useRef, useState, useEffect } = React;

/* reveal — render plainly visible (entrance handled by CSS elsewhere if desired) */
function Reveal({ children, style }) {
  return <div style={style}>{children}</div>;
}

function Eyebrow({ children, style }) {
  return <div className="eyebrow" style={style}>{children}</div>;
}

/* button that routes within the kit or opens external */
function LinkButton({ label, variant = "ghost", to, onNav, external }) {
  const cls = `btn btn--${variant}`;
  if (external) return <a className={cls} href={external} target="_blank" rel="noreferrer">{label}</a>;
  return <button className={cls} onClick={() => onNav && onNav(to)}>{label}</button>;
}

function Actions({ items, center, onNav }) {
  if (!items || !items.length) return null;
  return (
    <div className={`cta-row${center ? " cta-row--center" : ""}`}>
      {items.map((a) => <LinkButton key={a.label} {...a} onNav={onNav} />)}
    </div>
  );
}

function PageHero({ label, title, sub, body, actions, chips, onNav }) {
  return (
    <header className="page-hero">
      <div className="page-hero__inner">
        <Reveal><Eyebrow>{label}</Eyebrow></Reveal>
        <Reveal delay={60}><h1>{title}</h1></Reveal>
        {sub ? <Reveal delay={120}><p className="sub">{sub}</p></Reveal> : null}
        {body ? <Reveal delay={150}><p className="body">{body}</p></Reveal> : null}
        {chips ? <Reveal delay={180}><div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>{chips}</div></Reveal> : null}
        {actions && actions.length ? <Reveal delay={200}><Actions items={actions} onNav={onNav} /></Reveal> : null}
      </div>
    </header>
  );
}

function Section({ id, eyebrow, title, lead, tight, children }) {
  const hasHead = eyebrow || title || lead;
  return (
    <section id={id} className={`section${tight ? " section--tight" : ""}`}>
      <div className="section__inner">
        {hasHead ? (
          <Reveal><div className="section__head">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            {title ? <h2>{title}</h2> : null}
            {lead ? <p className="lead">{lead}</p> : null}
          </div></Reveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function Prose({ items }) {
  return (
    <Reveal><div className="prose">
      {items.map((p, i) => <p key={i} className={p.variant && p.variant !== "default" ? p.variant : undefined}>{p.text}</p>)}
    </div></Reveal>
  );
}

function Bullets({ items }) {
  return (
    <Reveal><ul className="bullets">
      {items.map((it, i) => <li key={i}><span>{it}</span></li>)}
    </ul></Reveal>
  );
}

function CardGrid({ children, cols }) {
  return <div className={`card-grid${cols === 2 ? " card-grid--2" : ""}`}>{children}</div>;
}

function Card({ num, title, body, cta, delay = 0 }) {
  return (
    <Reveal delay={delay} style={{ display: "flex" }}>
      <div className="card panel" style={{ width: "100%" }}>
        {num ? <div className="card__num">{num}</div> : null}
        <h3>{title}</h3>
        <p>{body}</p>
        {cta ? <div className="card__cta">{cta} →</div> : null}
      </div>
    </Reveal>
  );
}

function Layers({ items }) {
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

function Callout({ title, body, items }) {
  return (
    <Reveal><div className="callout">
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {items && items.length ? <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul> : null}
    </div></Reveal>
  );
}

function Faq({ groups }) {
  return (
    <div className="faq">
      {groups.map((g) => (
        <Reveal key={g.title}><div className="faq-group">
          <h3>{g.title}</h3>
          <div className="faq-list">
            {g.items.map((qa, i) => (
              <div className="faq-item" key={i}>
                <div className="q">{qa.q}</div>
                <div className="a">{qa.a}</div>
              </div>
            ))}
          </div>
        </div></Reveal>
      ))}
    </div>
  );
}

function LinksTable({ rows }) {
  return (
    <div className="links-table">
      {rows.map((r) => (
        <div className="links-row" key={r.k}>
          <span className="k">{r.k}</span>
          {r.pending || !r.href ? (
            <span className="v pending">{r.v}</span>
          ) : /^https?:\/\//.test(r.href) ? (
            <a className="v" href={r.href} target="_blank" rel="noreferrer">{r.v}</a>
          ) : (
            <button className="v" onClick={() => r.onNav && r.onNav(r.href)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>{r.v}</button>
          )}
        </div>
      ))}
    </div>
  );
}

function CtaBand({ eyebrow, title, lead, actions, onNav }) {
  return (
    <section className="cta-band">
      <div className="cta-band__inner">
        <Reveal>
          {eyebrow ? <Eyebrow style={{ justifyContent: "center", display: "inline-flex" }}>{eyebrow}</Eyebrow> : null}
          <h2>{title}</h2>
          {lead ? <p className="lead">{lead}</p> : null}
          <Actions items={actions} center onNav={onNav} />
        </Reveal>
      </div>
    </section>
  );
}

Object.assign(window, {
  Reveal, Eyebrow, LinkButton, Actions, PageHero, Section, Prose, Bullets,
  CardGrid, Card, Layers, Callout, Faq, LinksTable, CtaBand,
});
