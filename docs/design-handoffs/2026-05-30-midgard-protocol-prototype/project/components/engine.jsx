/* global React */
// engine.jsx — code-native "trust architecture" hero visuals.
// Three directions, all dark ancient-tech: gold proof circuitry on stone,
// controlled green verification signal. NOT a stick-frame tree.

const { useMemo } = React;

/* ---------- geometry helpers ---------- */
function branch(x, y, angle, len, depth, segs, nodes, side) {
  if (depth <= 0) return;
  const x2 = x + Math.sin(angle) * len;
  const y2 = y - Math.cos(angle) * len;
  // slight curve via control point for a "rail" feel
  const cx = x + Math.sin(angle) * len * 0.5 - side * len * 0.12;
  const cy = y - Math.cos(angle) * len * 0.5;
  segs.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, depth });
  nodes.push({ x: x2, y: y2, depth });
  const spread = 0.42 + (4 - depth) * 0.05;
  branch(x2, y2, angle - spread, len * 0.72, depth - 1, segs, nodes, -1);
  branch(x2, y2, angle + spread, len * 0.72, depth - 1, segs, nodes, 1);
  // occasional third inner rail
  if (depth > 2) branch(x2, y2, angle + (side * 0.1), len * 0.55, depth - 2, segs, nodes, side);
}

function buildWorldTree() {
  const canopy = { segs: [], nodes: [] };
  // canopy fans from aperture top (500, 300) upward
  branch(500, 300, -0.34, 150, 4, canopy.segs, canopy.nodes, -1);
  branch(500, 300, 0.34, 150, 4, canopy.segs, canopy.nodes, 1);
  branch(500, 300, 0, 140, 4, canopy.segs, canopy.nodes, 0);
  const roots = { segs: [], nodes: [] };
  // roots descend from trunk base (500, 720) downward (angle ~ PI)
  branch(500, 720, Math.PI - 0.3, 120, 3, roots.segs, roots.nodes, -1);
  branch(500, 720, Math.PI + 0.3, 120, 3, roots.segs, roots.nodes, 1);
  branch(500, 720, Math.PI, 110, 3, roots.segs, roots.nodes, 0);
  return { canopy, roots };
}

/* signal-carrying paths picked from canopy for animation */
function pickSignals(segs, n) {
  const deep = segs.filter(s => s.depth >= 3);
  return deep.slice(0, n);
}

/* ---------- shared defs ---------- */
function EngineDefs() {
  return (
    <defs>
      <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--eg-gold-1)" />
        <stop offset="1" stopColor="var(--eg-gold-2)" />
      </linearGradient>
      <linearGradient id="stoneFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#16241B" />
        <stop offset="1" stopColor="#0A130D" />
      </linearGradient>
      <radialGradient id="apertureGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#20BE43" stopOpacity="0.5" />
        <stop offset="0.6" stopColor="#20BE43" stopOpacity="0.08" />
        <stop offset="1" stopColor="#20BE43" stopOpacity="0" />
      </radialGradient>
      <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id="glowGreen" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3.5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

/* bedrock / settlement strata */
function Bedrock({ y0 = 760, step = 26, rows = 6 }) {
  return (
    <g opacity="0.9">
      {Array.from({ length: rows }).map((_, i) => {
        const y = y0 + i * step;
        const op = 0.4 - i * 0.05;
        return (
          <g key={i}>
            <line x1="120" y1={y} x2="880" y2={y} stroke="#D7E2D8" strokeOpacity={op} strokeWidth="1" />
            {/* gold ledger blocks */}
            {i < 4 && Array.from({ length: 7 }).map((__, j) => (
              <rect key={j} x={200 + j * 90} y={y + 4} width="60" height={step - 10}
                fill="none" stroke="url(#goldStroke)" strokeWidth="1" opacity={0.5 - i * 0.08} rx="1" />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/* ============ DIRECTION 1: WORLD-TREE TOPOLOGY ============ */
function WorldTree({ green }) {
  const { canopy, roots } = useMemo(buildWorldTree, []);
  const signals = useMemo(() => pickSignals(canopy.segs, 5), [canopy]);
  return (
    <g>
      {/* aperture glow */}
      <circle cx="500" cy="320" r="180" fill="url(#apertureGlow)" opacity={green} />
      {/* roots */}
      <g stroke="url(#goldStroke)" fill="none" strokeWidth="1.4" opacity="0.55" strokeLinecap="round">
        {roots.segs.map((s, i) => <path key={i} d={s.d} />)}
      </g>
      {/* bedrock */}
      <Bedrock />
      {/* trunk column (stone axis) */}
      <polygon points="478,720 522,720 512,330 488,330" fill="url(#stoneFill)" stroke="url(#goldStroke)" strokeWidth="1.2" />
      <line x1="500" y1="715" x2="500" y2="335" stroke="#20BE43" strokeWidth="2" opacity={0.5 * green}
        className="flow-dash" filter="url(#glowGreen)" />
      {/* proof aperture rings */}
      <g fill="none" stroke="url(#goldStroke)">
        <circle cx="500" cy="320" r="92" strokeWidth="1.5" />
        <circle cx="500" cy="320" r="66" strokeWidth="1" opacity="0.7" />
        <circle cx="500" cy="320" r="40" strokeWidth="1" opacity="0.5" />
      </g>
      <circle cx="500" cy="320" r="6" fill="#3BE863" filter="url(#glowGreen)" className="pulse-node" opacity={green} />
      {/* canopy rails */}
      <g stroke="url(#goldStroke)" fill="none" strokeWidth="1.5" strokeLinecap="round">
        {canopy.segs.map((s, i) => (
          <path key={i} d={s.d} opacity={0.3 + s.depth * 0.16} />
        ))}
      </g>
      {/* green signal travelling outward on select rails */}
      <g stroke="#3BE863" fill="none" strokeWidth="1.6" filter="url(#glowGreen)">
        {signals.map((s, i) => (
          <path key={i} d={s.d} className="flow-dash" style={{ animationDelay: `${i * 0.5}s`, opacity: green }} />
        ))}
      </g>
      {/* verification nodes */}
      <g fill="#3BE863" filter="url(#glowGreen)">
        {canopy.nodes.filter(n => n.depth <= 2).slice(0, 14).map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={2.2} className="pulse-node"
            style={{ animationDelay: `${(i % 6) * 0.4}s`, opacity: green }} />
        ))}
      </g>
    </g>
  );
}

/* ============ DIRECTION 2: PROOF GATE ============ */
function ProofGate({ green }) {
  return (
    <g>
      <circle cx="500" cy="430" r="200" fill="url(#apertureGlow)" opacity={green} />
      {/* two monoliths */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <polygon
            points={`${500 + s * 150},250 ${500 + s * 250},250 ${500 + s * 268},780 ${500 + s * 132},780`}
            fill="url(#stoneFill)" stroke="url(#goldStroke)" strokeWidth="1.4" />
          {/* carved gold channels */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={i} x1={500 + s * (165 + i * 22)} y1="300" x2={500 + s * (175 + i * 22)} y2="760"
              stroke="url(#goldStroke)" strokeWidth="1" opacity={0.5 - i * 0.07} />
          ))}
          {/* green channel */}
          <line x1={500 + s * 165} y1="300" x2={500 + s * 178} y2="760" stroke="#20BE43" strokeWidth="1.6"
            className="flow-dash" filter="url(#glowGreen)" style={{ opacity: 0.7 * green, animationDelay: `${s > 0 ? 0.6 : 0}s` }} />
        </g>
      ))}
      {/* lintel */}
      <polygon points="350,250 650,250 650,290 350,290" fill="url(#stoneFill)" stroke="url(#goldStroke)" strokeWidth="1.2" />
      {/* circular proof aperture */}
      <g fill="none" stroke="url(#goldStroke)">
        <circle cx="500" cy="450" r="120" strokeWidth="1.6" />
        <circle cx="500" cy="450" r="88" strokeWidth="1" opacity="0.7" />
        <circle cx="500" cy="450" r="54" strokeWidth="1" opacity="0.5" />
      </g>
      <circle cx="500" cy="450" r="120" fill="none" stroke="#3BE863" strokeWidth="2" opacity={green}
        strokeDasharray="10 250" className="flow-dash" filter="url(#glowGreen)" />
      <circle cx="500" cy="450" r="7" fill="#3BE863" filter="url(#glowGreen)" className="pulse-node" opacity={green} />
      {/* settlement rail */}
      <Bedrock y0="800" rows={5} />
    </g>
  );
}

/* ============ DIRECTION 3: TRUST ENGINE INTERIOR ============ */
function EngineInterior({ green }) {
  const rings = [200, 160, 120, 80, 44];
  const spokes = 12;
  return (
    <g>
      <circle cx="500" cy="470" r="240" fill="url(#apertureGlow)" opacity={green * 0.8} />
      {/* outer chamber (octagon) */}
      <polygon points="500,200 712,288 800,470 712,652 500,740 288,652 200,470 288,288"
        fill="url(#stoneFill)" stroke="url(#goldStroke)" strokeWidth="1.6" opacity="0.95" />
      {/* radial spokes */}
      <g stroke="url(#goldStroke)" strokeWidth="1" opacity="0.5">
        {Array.from({ length: spokes }).map((_, i) => {
          const a = (i / spokes) * Math.PI * 2;
          return <line key={i} x1="500" y1="470" x2={500 + Math.cos(a) * 220} y2={470 + Math.sin(a) * 220} />;
        })}
      </g>
      {/* concentric proof rings */}
      <g fill="none" stroke="url(#goldStroke)">
        {rings.map((r, i) => <circle key={i} cx="500" cy="470" r={r} strokeWidth={1.4 - i * 0.12} opacity={0.8 - i * 0.1} />)}
      </g>
      {/* rotating green signal ring */}
      <circle cx="500" cy="470" r="160" fill="none" stroke="#3BE863" strokeWidth="2"
        strokeDasharray="8 60" className="flow-dash" filter="url(#glowGreen)" opacity={green} />
      <circle cx="500" cy="470" r="120" fill="none" stroke="#20BE43" strokeWidth="1.5"
        strokeDasharray="6 80" className="flow-dash" filter="url(#glowGreen)" opacity={green * 0.7}
        style={{ animationDirection: 'reverse' }} />
      {/* verification points at spoke/ring intersections */}
      <g fill="#3BE863" filter="url(#glowGreen)">
        {Array.from({ length: spokes }).map((_, i) => {
          const a = (i / spokes) * Math.PI * 2;
          return <circle key={i} cx={500 + Math.cos(a) * 120} cy={470 + Math.sin(a) * 120} r="2.4"
            className="pulse-node" style={{ animationDelay: `${(i % 5) * 0.35}s`, opacity: green }} />;
        })}
      </g>
      <circle cx="500" cy="470" r="8" fill="#3BE863" filter="url(#glowGreen)" className="pulse-node" opacity={green} />
    </g>
  );
}

function TrustEngine({ direction = 'worldtree', green = 1 }) {
  return (
    <svg className="hero__svg" viewBox="0 0 1000 1040" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <EngineDefs />
      {direction === 'worldtree' && <WorldTree green={green} />}
      {direction === 'proofgate' && <ProofGate green={green} />}
      {direction === 'engine' && <EngineInterior green={green} />}
    </svg>
  );
}

Object.assign(window, { TrustEngine });
