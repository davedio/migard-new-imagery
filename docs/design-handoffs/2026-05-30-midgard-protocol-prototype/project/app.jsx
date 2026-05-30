/* global React, ReactDOM, TrustEngine, TrustLayers, Nav, CategoryDiagnosis, AudiencePaths, ReadinessStrip, Footer, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider */
const { useEffect, useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "texture": "stone",
  "hero": "worldtree",
  "display": "poppins",
  "motion": "cinematic",
  "green": 100,
  "gold": 100
}/*EDITMODE-END*/;

const HERO_LABELS = { worldtree: 'World-Tree Topology', proofgate: 'Proof Gate', engine: 'Trust Engine Interior' };

function Hero({ t }) {
  const [enter, setEnter] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setEnter(true)); return () => cancelAnimationFrame(id); }, []);
  const cinematic = t.motion === 'cinematic';
  return (
    <header className={`hero ${enter && cinematic ? 'hero--enter' : ''}`} id="top">
      <div className="hero__stage">
        <TrustEngine direction={t.hero} green={t.green / 100} />
      </div>
      <div className="hero__content">
        <div className="hero__eyebrow"><span className="eyebrow">Cardano-native L2 · Trust Architecture</span></div>
        <h1>Scaling you can<br /><span className="accent">verify</span>, not just believe.</h1>
        <p className="hero__sub">
          Midgard is a Cardano-native Layer 2 built as trust architecture. Activity, proof, challenge,
          and settlement you can inspect before you commit a single transaction.
        </p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#system">Verify Then Build</a>
          <a className="btn btn--ghost" href="#system">Explore the architecture</a>
        </div>
        <div className="hero__chips">
          <span className="chip chip--testnet"><span className="dot" />Pre-Alpha Testnet</span>
          <span className="chip chip--demo"><span className="dot" />Demonstration data</span>
          <span className="chip chip--l1"><span className="dot" />Cardano L1 anchor · claim-dependent</span>
        </div>
      </div>
      <div className="hero__scroll"><span>Trust the path</span><span className="line" /></div>
    </header>
  );
}

function SystemSection() {
  return (
    <section className="section" id="system">
      <div className="wrap">
        <div className="shead reveal">
          <div className="eyebrow">Living trust architecture</div>
          <h2>Watch a single action move through the trust path.</h2>
          <p>Six layers. Nothing is trusted on arrival. It is batched, proven, open to challenge, settled, and
            anchored to Cardano L1. Run the path, or inspect any layer.</p>
        </div>
        <div className="reveal"><TrustLayers /></div>
      </div>
    </section>
  );
}

function applyRoot(t) {
  const el = document.documentElement;
  el.setAttribute('data-texture', t.texture);
  el.setAttribute('data-display', t.display);
  el.setAttribute('data-motion', t.motion === 'static' ? 'static' : 'on');
  el.style.setProperty('--signal-speed', t.motion === 'subtle' ? '0.55' : '1');
  el.style.setProperty('--green-intensity', String(t.green / 100));
  const g = t.gold / 100;
  el.style.setProperty('--gold-intensity', String(g));
  el.style.setProperty('--eg-gold-1', `rgba(228,168,66,${g.toFixed(3)})`);
  el.style.setProperty('--eg-gold-2', `rgba(183,121,31,${(0.5 * g).toFixed(3)})`);
  el.style.setProperty('--gold-line', `rgba(183,121,31,${(0.42 * g).toFixed(3)})`);
  el.style.setProperty('--gold-ghost', `rgba(183,121,31,${(0.14 * g).toFixed(3)})`);
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  });
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => applyRoot(t), [t]);
  useReveal();

  return (
    <>
      <Nav />
      <Hero t={t} />
      <CategoryDiagnosis />
      <SystemSection />
      <AudiencePaths />
      <ReadinessStrip />
      <Footer />

      <TweaksPanel>
        <TweakSection label="Texture route" />
        <TweakRadio label="World" value={t.texture}
          options={[{ value: 'stone', label: 'Stone + Light' }, { value: 'rootwork', label: 'Organic Rootwork' }]}
          onChange={(v) => setTweak('texture', v)} />
        <TweakSection label="Hero direction" />
        <TweakRadio label="Engine" value={t.hero}
          options={[{ value: 'worldtree', label: 'World-Tree' }, { value: 'proofgate', label: 'Proof Gate' }, { value: 'engine', label: 'Interior' }]}
          onChange={(v) => setTweak('hero', v)} />
        <TweakSection label="Type & motion" />
        <TweakRadio label="Display font" value={t.display}
          options={[{ value: 'poppins', label: 'Poppins' }, { value: 'unbounded', label: 'Unbounded' }]}
          onChange={(v) => setTweak('display', v)} />
        <TweakRadio label="Motion" value={t.motion}
          options={[{ value: 'cinematic', label: 'Cinematic' }, { value: 'subtle', label: 'Subtle' }, { value: 'static', label: 'Static' }]}
          onChange={(v) => setTweak('motion', v)} />
        <TweakSection label="Signal" />
        <TweakSlider label="Green trust signal" value={t.green} min={20} max={100} unit="%" onChange={(v) => setTweak('green', v)} />
        <TweakSlider label="Gold proof emphasis" value={t.gold} min={30} max={100} unit="%" onChange={(v) => setTweak('gold', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
