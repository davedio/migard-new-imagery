/* Midgard UI Kit — chrome: SiteNav, SiteFooter, AmbientScene */
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

/* WebGL fluid field — ambient background for interior (child) pages.
   Same domain-warped fbm fluid as the experiment, tuned calm + dim so page
   text stays legible. Colors baked to match globals.css. */
const FLUID_VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }";
const FLUID_FRAG = [
  "precision highp float;",
  "uniform vec2 u_res; uniform float u_time, u_gravity, u_speed, u_swirl;",
  "float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }",
  "float noise(vec2 p){ vec2 i=floor(p), f=fract(p);",
  "  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));",
  "  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }",
  "float fbm(vec2 p){ float v=0.,a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);",
  "  for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }",
  "void main(){",
  "  vec2 uv=gl_FragCoord.xy/u_res.xy;",
  "  vec2 p=(gl_FragCoord.xy-0.5*u_res.xy)/u_res.y; p*=2.2;",
  "  float t=u_time*0.10*u_speed;",
  "  vec2 grav=vec2(0.0, t*u_gravity*1.5);",
  "  float ang=u_swirl*0.6*sin(t*0.5+length(p));",
  "  mat2 rot=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));",
  "  vec2 ps=rot*p;",
  "  vec2 q=vec2(fbm(ps+grav), fbm(ps+vec2(5.2,1.3)-grav));",
  "  vec2 r=vec2(fbm(ps+1.8*q+vec2(1.7,9.2)+0.15*t), fbm(ps+1.8*q+vec2(8.3,2.8)-0.12*t));",
  "  float f=fbm(ps+1.8*r+grav);",
  "  vec3 ink=vec3(0.020,0.055,0.035), green=vec3(0.125,0.745,0.263), gbri=vec3(0.231,0.909,0.388), gold=vec3(0.878,0.639,0.235);",
  "  vec3 col=ink;",
  "  col=mix(col, green*0.7, smoothstep(0.30,0.72,f));",
  "  col=mix(col, gbri, smoothstep(0.60,0.98,f));",
  "  float veins=pow(max(0.0,r.x*f),1.6);",
  "  col=mix(col, gold, smoothstep(0.55,0.95,veins)*0.8);",
  "  col+=gbri*0.06*smoothstep(0.7,1.0,f);",
  "  float vig=smoothstep(1.25,0.25,length(uv-0.5));",
  "  col*=mix(0.45,1.05,vig);",
  "  gl_FragColor=vec4(col,1.0);",
  "}",
].join("\n");

function FluidField() {
  const ref = useRefC(null);
  useEffectC(() => {
    const cvs = ref.current; if (!cvs) return;
    const gl = cvs.getContext("webgl") || cvs.getContext("experimental-webgl");
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, FLUID_VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FLUID_FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res"), uTime = gl.getUniformLocation(prog, "u_time"),
          uG = gl.getUniformLocation(prog, "u_gravity"), uS = gl.getUniformLocation(prog, "u_speed"), uW = gl.getUniformLocation(prog, "u_swirl");
    // calm, dim background params (legibility for page text)
    const G = 0.6, S = 0.6, Wl = 0.45;
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); cvs.width = cvs.clientWidth * dpr; cvs.height = cvs.clientHeight * dpr; gl.viewport(0, 0, cvs.width, cvs.height); };
    addEventListener("resize", resize); resize();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now(); let raf = 0;
    const frame = (now) => {
      gl.uniform2f(uRes, cvs.width, cvs.height); gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform1f(uG, G); gl.uniform1f(uS, S); gl.uniform1f(uW, Wl);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} aria-hidden />;
}

/* fixed background scene — tree glow on home, WebGL fluid field on child pages */
function AmbientScene({ mode }) {
  return (
    <div className="kit-scene">
      <div className="world-bg" style={{ position: "absolute" }} />
      {mode === "home" ? (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(assets/hero-tree-green.png)", backgroundSize: "cover",
          backgroundPosition: "50% 40%", filter: "brightness(0.34) saturate(0.85)", opacity: 0.7,
        }} />
      ) : (
        <React.Fragment>
          <FluidField />
          {/* darkening veil keeps page text legible over the fluid */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,13,9,0.5), rgba(5,12,8,0.62))" }} />
        </React.Fragment>
      )}
      <div className="world-grain" style={{ position: "absolute" }} />
    </div>
  );
}

function NavLogo({ onNav }) {
  return (
    <button className="site-nav__logo" onClick={() => onNav("home")} aria-label="Midgard home" style={{ background: "none", border: "none", cursor: "pointer" }}>
      <img src="assets/midgard-icon.png" alt="" />
      <span className="wm">Midgard</span>
    </button>
  );
}

function SiteNav({ active, onNav }) {
  const [open, setOpen] = useStateC(false);
  const data = window.MIDGARD_DATA;
  const go = (k) => { setOpen(false); onNav(k); };
  return (
    <React.Fragment>
      <nav className="site-nav">
        <NavLogo onNav={go} />
        <div className="site-nav__links">
          {data.nav.map((it) => (
            <button key={it.key} className="site-nav__link" data-active={active === it.key} onClick={() => go(it.key)}>{it.label}</button>
          ))}
        </div>
        <div className="site-nav__right">
          <button className="btn btn--primary site-nav__cta-desktop" onClick={() => go("get-started")}>Get Started</button>
          <button className="site-nav__burger" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>{open ? "✕" : "☰"}</button>
        </div>
      </nav>
      <div className="site-nav__mobile" data-open={open}>
        {data.nav.map((it) => <a key={it.key} data-active={active === it.key} onClick={() => go(it.key)}>{it.label}</a>)}
        <button className="btn btn--primary" onClick={() => go("get-started")}>Get Started</button>
      </div>
    </React.Fragment>
  );
}

/* recognizable brand glyphs for the official channels (inline SVG, like SiteFooter.tsx) */
const SOCIAL_ICONS = {
  GitHub: "M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.49.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.86.12 3.16.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.36.81 1.09.81 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.22.68.83.56C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z",
  X: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  Discord: "M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.444.88-.608 1.28a18.27 18.27 0 0 0-5.487 0A12.6 12.6 0 0 0 9.18 3a19.74 19.74 0 0 0-4.435 1.37C1.93 8.59 1.16 12.71 1.54 16.77a19.93 19.93 0 0 0 6.06 3.06c.49-.67.93-1.38 1.3-2.13-.71-.27-1.39-.6-2.03-.99.17-.12.34-.25.5-.38a14.23 14.23 0 0 0 12.18 0c.16.13.33.26.5.38-.64.39-1.32.72-2.03.99.37.75.81 1.46 1.3 2.13a19.9 19.9 0 0 0 6.06-3.06c.45-4.69-.77-8.78-3.2-12.4zM8.02 14.33c-1.18 0-2.15-1.09-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.15 2.42 0 1.33-.95 2.42-2.15 2.42zm7.96 0c-1.18 0-2.15-1.09-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.15 2.42 0 1.33-.94 2.42-2.15 2.42z",
};

function SocialIcon({ label, href }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} style={{ display: "inline-flex", color: "var(--text-dim)" }}>
      <svg viewBox="0 0 24 24" width={19} height={19} fill="currentColor" aria-hidden focusable="false">
        <path d={SOCIAL_ICONS[label]} />
      </svg>
    </a>
  );
}

function SiteFooter({ onNav }) {
  const L = window.MIDGARD_DATA.links;
  const explore = [["Home", "home"], ["How It Works", "how-it-works"], ["Security", "security"], ["Get Started", "get-started"], ["About", "about"]];
  const resources = [["Testnet status", "testnet"], ["FAQ", "faq"], ["Official links", "official-links"], ["Security contact", "official-links"]];
  const channels = [["Docs", L.docs], ["GitHub", L.github], ["Discord", L.discord], ["X", L.x]];
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <div className="lock"><img src="assets/midgard-icon.png" alt="" /><span className="wm">Midgard</span></div>
          <p>Built by Anastasia Labs. A Cardano-native Layer 2 built for throughput and a trust path you can inspect.</p>
          <div className="chips">
            <span className="chip chip--demo"><span className="dot" />Fees paid in ADA</span>
            <span className="chip chip--testnet"><span className="dot" />Settles on Cardano L1</span>
            <span className="chip chip--demo"><span className="dot" />Pre-alpha testnet</span>
          </div>
          <div className="site-footer__social" aria-label="Official channels">
            <SocialIcon label="GitHub" href={L.github} />
            <SocialIcon label="X" href={L.x} />
            <SocialIcon label="Discord" href={L.discord} />
          </div>
        </div>
        <div className="site-footer__col">
          <h4>Explore</h4>
          <ul>{explore.map(([l, k]) => <li key={l}><a onClick={() => onNav(k)}>{l}</a></li>)}</ul>
        </div>
        <div className="site-footer__col">
          <h4>Resources</h4>
          <ul>{resources.map(([l, k]) => <li key={l}><a onClick={() => onNav(k)}>{l}</a></li>)}</ul>
        </div>
        <div className="site-footer__col">
          <h4>Channels</h4>
          <ul>{channels.map(([l, href]) => <li key={l}><a href={href} target="_blank" rel="noreferrer">{l}</a></li>)}</ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="site-footer__legal"><span>Terms publishing soon</span><span>Privacy publishing soon</span></div>
        <span className="meta">© 2026 Midgard · Always start from official links</span>
      </div>
    </footer>
  );
}

Object.assign(window, { AmbientScene, SiteNav, SiteFooter });
