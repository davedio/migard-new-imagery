/* global React */
// trustlayers.jsx — the Living Trust Architecture mechanism.
// Six inspectable layers + simulated signal flow + Explore mode.

const { useState, useEffect, useRef, useCallback } = React;

const LAYERS = [
  {
    n: '01', key: 'activity', name: 'Activity',
    role: 'User & app actions enter',
    desc: 'Transactions arrive from wallets and applications. Nothing is trusted yet. Every action is treated as an unverified claim about intended state.',
    meta: [['Input', 'Signed user / dapp txns'], ['Output', 'Ordered op stream'], ['Status', 'Pre-Alpha Testnet']],
    chips: [['testnet', 'Pre-Alpha Testnet'], ['demo', 'Demonstration data']],
  },
  {
    n: '02', key: 'batch', name: 'Batch',
    role: 'Operations aggregated off-chain',
    desc: 'Actions are collected and ordered into a batch off-chain. Aggregation is where throughput comes from. Many actions resolve against a single settlement event.',
    meta: [['Input', 'Ordered op stream'], ['Output', 'Committed batch + state root'], ['Mechanism', 'Off-chain aggregation']],
    chips: [['testnet', 'Pre-Alpha Testnet'], ['demo', 'Demonstration data']],
  },
  {
    n: '03', key: 'proof', name: 'Proof',
    role: 'State transition is committed',
    desc: 'Each batch publishes a commitment describing the resulting state. This is the object the rest of the system reasons about. The proof is the unit of trust, not the operator.',
    meta: [['Input', 'Committed batch'], ['Output', 'State commitment'], ['Mechanism', 'Cryptographic commitment']],
    chips: [['proof', 'Proof object'], ['demo', 'Demonstration data']],
  },
  {
    n: '04', key: 'challenge', name: 'Challenge',
    role: 'Dispute window contests bad state',
    desc: 'A challenge window lets independent watchers contest an invalid commitment before it finalizes. Trust does not require believing the operator. It requires that someone can prove them wrong.',
    meta: [['Input', 'State commitment'], ['Output', 'Verified / rejected'], ['Mechanism', 'Fraud-proof challenge']],
    chips: [['testnet', 'Design intent'], ['demo', 'Demonstration data']],
  },
  {
    n: '05', key: 'settlement', name: 'Settlement',
    role: 'Verified state is finalized',
    desc: 'State that survives the challenge window is finalized. From here the result is durable. It stops being a claim and becomes settled history.',
    meta: [['Input', 'Verified commitment'], ['Output', 'Finalized state'], ['Mechanism', 'Deterministic finality']],
    chips: [['proof', 'Settlement cue'], ['demo', 'Demonstration data']],
  },
  {
    n: '06', key: 'l1', name: 'Cardano L1',
    role: 'Anchored to base-layer bedrock',
    desc: 'Settlement commitments anchor to Cardano L1, the bedrock the whole structure rests on. The base layer is the permanence the trust path resolves to.',
    meta: [['Input', 'Finalized state'], ['Output', 'L1-anchored commitment'], ['Anchor', 'Cardano L1 (claim-dependent)']],
    chips: [['l1', 'Cardano L1'], ['planned', 'Claim approval-dependent']],
  },
];

const ROW_H = 74, GAP = 12, TOP = 16, W = 470;
const rowY = (i) => TOP + i * (ROW_H + GAP);
const DIAG_H = TOP * 2 + LAYERS.length * (ROW_H + GAP) - GAP;

function LayerDiagram({ active, onSelect, signalY, running }) {
  const spineX = 46;
  return (
    <svg viewBox={`0 0 ${W} ${DIAG_H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="list" aria-label="Trust layers">
      <defs>
        <linearGradient id="railGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B7791F" stopOpacity="0.5" />
          <stop offset="1" stopColor="#B7791F" stopOpacity="0.12" />
        </linearGradient>
        <filter id="lglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* spine */}
      <line x1={spineX} y1={rowY(0) + ROW_H / 2} x2={spineX} y2={rowY(5) + ROW_H / 2}
        stroke="#D7E2D8" strokeOpacity="0.14" strokeWidth="2" />
      {/* signal traveling down the spine */}
      {running && (
        <circle cx={spineX} cy={signalY} r="5" fill="#3BE863" filter="url(#lglow)" />
      )}

      {LAYERS.map((L, i) => {
        const y = rowY(i);
        const isActive = active === i;
        const cy = y + ROW_H / 2;
        const passed = running && signalY >= cy - 4;
        const lit = isActive || passed;
        return (
          <g key={L.key} role="listitem" tabIndex="0" className="layer-row"
            onClick={() => onSelect(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i); } }}
            aria-label={`${L.name}: ${L.role}`} style={{ cursor: 'pointer', outline: 'none' }}>
            {/* node on spine */}
            <circle cx={spineX} cy={cy} r={lit ? 6 : 4}
              fill={lit ? '#3BE863' : '#0E1B14'} stroke={lit ? '#3BE863' : '#B7791F'} strokeWidth="1.5"
              filter={lit ? 'url(#lglow)' : 'none'} style={{ transition: 'all .3s' }} />
            {/* connector */}
            <line x1={spineX + 8} y1={cy} x2={70} y2={cy} stroke="url(#railGold)" strokeWidth="1.4" />
            {/* layer rect */}
            <rect className="layer-rect" x="70" y={y} width={W - 78} height={ROW_H} rx="6"
              fill={isActive ? 'rgba(32,190,67,0.06)' : 'rgba(12,22,16,0.85)'}
              stroke={lit ? 'rgba(32,190,67,0.55)' : 'rgba(215,226,216,0.1)'} strokeWidth="1" />
            {/* index */}
            <text x="92" y={y + 30} fontFamily="'JetBrains Mono', monospace" fontSize="12"
              fill={lit ? '#3BE863' : '#B7791F'} letterSpacing="1">{L.n}</text>
            {/* name */}
            <text x="92" y={y + 52} fontFamily="'Poppins', sans-serif" fontSize="19" fontWeight="500"
              fill={lit ? '#EAF2EC' : '#B7C6BC'}>{L.name}</text>
            {/* role */}
            <text x={W - 26} y={y + 44} textAnchor="end" fontFamily="'JetBrains Mono', monospace"
              fontSize="11" fill="#7C8F84" letterSpacing="0.3">{L.role}</text>
            {/* mini rail ticks */}
            {[0, 1, 2, 3].map((t) => (
              <rect key={t} x={W - 26 - t * 9} y={y + 56} width="4" height="8" rx="1"
                fill={lit && t < 3 ? '#B7791F' : 'rgba(183,121,31,0.25)'} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function Inspector({ idx, explore }) {
  const L = LAYERS[idx];
  return (
    <div className="panel tla__inspect" key={L.key}>
      <div className="idx">LAYER {L.n} / 06</div>
      <h3>{L.name}</h3>
      <div className="role">{L.role}</div>
      <p className="desc">{L.desc}</p>
      {explore && (
        <div className="tla__meta">
          {L.meta.map(([k, v]) => (
            <div className="mrow" key={k}>
              <span className="lbl">{k}</span>
              <span className="val">{v}</span>
            </div>
          ))}
        </div>
      )}
      <div className="tla__chips">
        {L.chips.map(([cls, txt]) => (
          <span className={`chip chip--${cls}`} key={txt}><span className="dot" />{txt}</span>
        ))}
      </div>
    </div>
  );
}

function TrustLayers() {
  const [active, setActive] = useState(2);
  const [explore, setExplore] = useState(true);
  const [running, setRunning] = useState(false);
  const [signalY, setSignalY] = useState(0);
  const raf = useRef(0);

  const startY = rowY(0) + ROW_H / 2;
  const endY = rowY(5) + ROW_H / 2;

  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setRunning(true);
    if (reduce) { setSignalY(endY); setActive(5); setTimeout(() => setRunning(false), 400); return; }
    const dur = 4200;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const y = startY + eased * (endY - startY);
      setSignalY(y);
      const li = Math.min(Math.floor(eased * 6), 5);
      setActive(li);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setTimeout(() => setRunning(false), 600);
    };
    raf.current = requestAnimationFrame(tick);
  }, [startY, endY]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div className="tla">
      <div className="tla__diagram">
        <div className="tla__toolbar">
          <button className="btn btn--primary" onClick={run} disabled={running} style={{ opacity: running ? 0.6 : 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>
            {running ? 'Tracing signal…' : 'Run trust path'}
          </button>
          <button className="toggle" aria-pressed={explore} onClick={() => setExplore(e => !e)}>
            <span className="toggle__track"><span className="knob" /></span>
            Explore mode
          </button>
          <span className="chip chip--demo" style={{ marginLeft: 'auto' }}><span className="dot" />Demonstration data</span>
        </div>
        <div className="tla__svgwrap">
          <LayerDiagram active={active} onSelect={(i) => { setActive(i); }} signalY={signalY} running={running} />
        </div>
      </div>
      <Inspector idx={active} explore={explore} />
    </div>
  );
}

Object.assign(window, { TrustLayers });
