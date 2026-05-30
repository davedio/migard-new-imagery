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
          <button className="btn btn--primary site-nav__cta-desktop" onClick={() => go("testnet")}>Explore Testnet →</button>
          <button className="site-nav__burger" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>{open ? "✕" : "☰"}</button>
        </div>
      </nav>
      <div className="site-nav__mobile" data-open={open}>
        {data.nav.map((it) => <a key={it.key} data-active={active === it.key} onClick={() => go(it.key)}>{it.label}</a>)}
        <button className="btn btn--primary" onClick={() => go("testnet")}>Explore Testnet →</button>
      </div>
    </React.Fragment>
  );
}

function SiteFooter({ onNav }) {
  const explore = [["Users", "users"], ["Builders", "builders"], ["How It Works", "how-it-works"], ["Security", "security"]];
  const resources = [["Docs", "docs"], ["Testnet", "testnet"], ["FAQ", "faq"], ["Official Links", "official-links"]];
  const legal = ["Terms", "Privacy", "Testnet Terms", "Risks", "Support", "GitHub"];
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <div className="lock"><img src="assets/midgard-icon.png" alt="" /><span className="wm">Midgard</span></div>
          <p>A Cardano-native Layer 2 built for throughput and secured by math. Fees are paid in ADA.</p>
          <div className="chips">
            <span className="chip chip--demo"><span className="dot" />Simulated data</span>
            <span className="chip chip--testnet"><span className="dot" />Pre-alpha</span>
          </div>
        </div>
        <div className="site-footer__col">
          <h4>Explore</h4>
          <ul>{explore.map(([l, k]) => <li key={k}><a onClick={() => onNav(k)}>{l}</a></li>)}</ul>
        </div>
        <div className="site-footer__col">
          <h4>Resources</h4>
          <ul>{resources.map(([l, k]) => <li key={k}><a onClick={() => onNav(k)}>{l}</a></li>)}</ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="site-footer__legal">{legal.map((l) => <a key={l}>{l}</a>)}</div>
        <span className="meta">© 2026 Midgard · Simulated · connects to live data at launch</span>
      </div>
    </footer>
  );
}

Object.assign(window, { AmbientScene, SiteNav, SiteFooter });
