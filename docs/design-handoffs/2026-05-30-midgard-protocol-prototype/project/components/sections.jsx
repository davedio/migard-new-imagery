/* global React */
// sections.jsx — nav, category diagnosis, audience paths, readiness, footer.

const { useState } = React;

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

function Nav() {
  const links = ['Users', 'Builders', 'Partners', 'Docs'];
  return (
    <nav className="nav">
      <div className="nav__in">
        <a className="brand" href="#top" aria-label="Midgard home">
          <img src="assets/midgard-logo.png" alt="Midgard" />
          <span className="brand__name">Midgard</span>
        </a>
        <div className="nav__links">
          {links.map(l => <a key={l} className="nav__link" href={`#${l.toLowerCase()}`}>{l}</a>)}
        </div>
        <div className="nav__spacer" />
        <div className="nav__right">
          <span className="chip chip--testnet"><span className="dot" />Pre-Alpha Testnet</span>
          <a className="btn btn--primary" href="#builders">Verify Then Build</a>
        </div>
      </div>
    </nav>
  );
}

function CategoryDiagnosis() {
  return (
    <section className="section" id="why">
      <div className="wrap diag reveal">
        <div>
          <div className="eyebrow">Category diagnosis</div>
          <p className="diag__claim" style={{ marginTop: 20 }}>
            L2 fragmentation isn't a speed problem. It's a <em>trust</em> problem.
          </p>
          <p className="diag__body">
            Most scaling pitches sell throughput and ask you to take the rest on faith. Midgard inverts the order:
            the architecture has to earn trust before it asks anyone to build, migrate, or settle on it. Cardano L1
            stays the settlement and dispute anchor. Verify the path first.
          </p>
        </div>
        <div className="panel diag__proof">
          <div className="k">Mechanism</div>
          <div className="diag__metric" style={{ fontSize: 'clamp(28px,3.4vw,40px)', lineHeight: 1.05 }}>Optimistic rollup</div>
          <div className="srclabel" style={{ marginBottom: 16 }}>EUTXO-localized fraud proofs</div>
          <p className="note">Cardano-native scaling that keeps Layer 1 as the settlement and dispute-resolution anchor.
            Localized state can make fraud-proof design more targeted.</p>
          <div style={{ marginTop: 18 }}><span className="chip chip--proof"><span className="dot" />Technical design claim</span></div>
        </div>
      </div>
    </section>
  );
}

const AUDIENCE = [
  {
    id: 'users', q: 'Why trust it?', name: 'Users',
    lead: 'Understand what Midgard is, what it supports, and where to verify, before you act.',
    layers: ['What Midgard is', 'What you can do', 'What is supported today', 'What risks remain', 'Where to verify'],
    cta: 'Learn why to trust it',
  },
  {
    id: 'builders', q: 'Can I verify then build?', name: 'Builders',
    lead: 'Read the architecture and its constraints, then build against a system you can check yourself.',
    layers: ['Architecture & constraints', 'Docs & examples', 'Midgard Builder Readiness', 'Technical working sessions', 'Office hours'],
    cta: 'Verify then build',
  },
  {
    id: 'partners', q: 'What role can we play safely?', name: 'Partners',
    lead: 'Enter through a functional readiness track. Co-marketing comes later, and only after approval.',
    layers: ['Functional readiness track', 'Approval path', 'Support boundaries', 'Co-marketing after approval'],
    cta: 'Join a readiness track',
  },
];

function PathCard({ p }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel path" id={p.id} onClick={() => setOpen(o => !o)}
      role="button" tabIndex="0" aria-expanded={open}
      onKeyDown={(e) => { if (e.key === 'Enter') setOpen(o => !o); }}>
      <div className="path__q">{p.q}</div>
      <h3>{p.name}</h3>
      <p className="path__lead">{p.lead}</p>
      <div className="path__layers" style={{ maxHeight: open ? p.layers.length * 40 + 8 : 0 }}>
        {p.layers.map((l, i) => (
          <div className="path__layer" key={l}><span className="n">{String(i + 1).padStart(2, '0')}</span>{l}</div>
        ))}
      </div>
      <div className="path__expand">{open ? 'collapse path' : '+ inspect path layers'}</div>
      <div className="path__cta">{p.cta} <Arrow /></div>
    </div>
  );
}

function AudiencePaths() {
  return (
    <section className="section" id="paths">
      <div className="wrap">
        <div className="shead reveal">
          <div className="eyebrow">Audience paths</div>
          <h2>One system. Three ways in.</h2>
          <p>Midgard keeps a single voice with persona modes, not three microsites. Start simple, then inspect deeper layers when you're ready.</p>
        </div>
        <div className="paths reveal">
          {AUDIENCE.map(p => <PathCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}

const READY = [
  { lbl: 'Architecture', txt: 'Defined', cls: 'proof', pct: 92 },
  { lbl: 'Network', txt: 'Pre-Alpha', cls: 'testnet', pct: 64 },
  { lbl: 'Builder docs', txt: 'In progress', cls: 'demo', pct: 48 },
  { lbl: 'Mainnet', txt: 'Planned', cls: 'planned', pct: 18 },
];

function ReadinessStrip() {
  return (
    <section className="section" id="readiness" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="shead reveal" style={{ marginBottom: 32 }}>
          <div className="eyebrow">Readiness, bold but qualified</div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)' }}>Where the path actually is.</h2>
        </div>
        <div className="ready reveal">
          {READY.map(c => (
            <div className="ready__cell" key={c.lbl}>
              <div className="lbl">{c.lbl}</div>
              <div className="stat"><span className={`chip chip--${c.cls}`}><span className="dot" />{c.txt}</span></div>
              <div className="bar"><i style={{ width: `${c.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="srclabel" style={{ marginTop: 16 }}>Demonstration data · illustrative readiness · claim strength inherits from the claims matrix on approval.</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__grid">
          <div className="foot__col">
            <a className="brand" href="#top" style={{ marginBottom: 18 }}>
              <img src="assets/midgard-logo.png" alt="Midgard" style={{ width: 30, height: 30 }} />
              <span className="brand__name">Midgard</span>
            </a>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, color: 'var(--text-hi)', maxWidth: '14ch', lineHeight: 1.1 }}>
              Trust the path.
            </p>
            <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--text-dim)', maxWidth: '34ch' }}>
              Cardano-native scaling, built so the architecture earns trust before it asks for it.
            </p>
          </div>
          <div className="foot__col">
            <h5>Explore</h5>
            <a href="#users">Users</a><a href="#builders">Builders</a><a href="#partners">Partners</a><a href="#why">Docs</a>
          </div>
          <div className="foot__col">
            <h5>Trust architecture</h5>
            <a href="#system">Trust layers</a><a href="#system">Proof &amp; challenge</a><a href="#system">Settlement</a><a href="#system">Cardano L1 anchor</a>
          </div>
        </div>
        <div className="foot__disc">
          NOTICE. This is a brand and architecture design surface, not a public claims document. All flows shown are
          demonstration data. Security, anchoring, testnet/mainnet status, partner, and token language are
          approval-dependent and inherit final strength from the Midgard claims matrix and relevant policies. No token,
          reward, airdrop, or eligibility is implied.
        </div>
        <div className="foot__base">
          <span>© 2026 Midgard · Dark Trust Architecture</span>
          <span>Verify Then Build · Secure Migration · Trust The Path</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, CategoryDiagnosis, AudiencePaths, ReadinessStrip, Footer });
