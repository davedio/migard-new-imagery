"use client";

/* ============================================================
   MistLayer — real volumetric-looking mist, home hero only.

   Take four (review 2026-07-13: "static and kinetic pops, not
   smooth"). Two real bugs, now fixed:

     1. STATIC — the noise field only ever TRANSLATED through wind
        (fbm(p + wind*t) is a fixed pattern being panned). At a slow
        wind speed that reads as a frozen photo sliding, not living
        vapor. Fixed with genuine time-domain turbulence: the domain
        warp itself is re-sampled through a second, independently-
        phased time offset, so the fog's SHAPE churns frame to frame,
        not just its position.

     2. POPS — the cursor trail recorded raw, widely-spaced pointer
        samples at full strength the instant they landed (age=0 was
        already 100% intensity), so a fast sweep looked like isolated
        hotspots snapping in and out rather than one continuous
        disturbance. Fixed two ways: (a) fast pointer moves are now
        linearly interpolated into several sub-points along the
        stroke, so the trail is a continuous rope, not scattered
        dots; (b) every disturbance fades IN over ~150ms (attack
        ramp) before it decays, so nothing snaps to full strength in
        a single frame.

   Otherwise unchanged: a low-frequency bank mask carves the field
   into drifting banks with real clear air; two-tone shading (dusty
   grey-sage body against the pale sky, cream hearts in dense cores).

   Raw WebGL (one quad, one shader) — no scene graph needed. Light
   theme + home + motion-on only; parks when hidden; self-heals
   zero-size mounts; falls back to nothing without WebGL.
   ============================================================ */

import { useEffect, useRef } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const TRAIL = 32; // pointer disturbance ring buffer (headroom for interpolated strokes)

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uT;
uniform vec4 uTrail[${TRAIL}]; /* xy = pos (uv), zw = velocity (uv/s) */
uniform float uAge[${TRAIL}];

/* ---- hash / value noise / fbm ---- */
float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8); /* rotate octaves — kills grid feel */
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.03;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 suv = vec2(uv.x * aspect, uv.y); /* aspect-true space */

  /* pointer disturbances: push the sampling domain along the stroke,
     and thin the fog locally. Each one FADES IN over ~150ms (attack)
     before its ~6s/~3s decay — nothing snaps to full strength in one
     frame, which is what read as a "pop". */
  vec2 push = vec2(0.0);
  float thin = 0.0;
  for (int i = 0; i < ${TRAIL}; i++) {
    /* the disturbance itself drifts downwind as it ages — smoke carries
       its own history */
    vec2 tp = vec2(uTrail[i].x * aspect, uTrail[i].y) + vec2(0.007, 0.002) * uAge[i];
    vec2 tv = uTrail[i].zw;
    float d = distance(suv, tp);
    float base = exp(-d * d * 34.0); /* softer than before — points blend into a rope */
    float attack = smoothstep(0.0, 0.16, uAge[i]);
    push += tv * base * attack * exp(-uAge[i] * 0.35) * 0.5;
    thin += base * attack * exp(-uAge[i] * 0.8) * min(1.0, length(tv) * 1.6);
  }

  /* fog field: wind-advected AND genuinely turbulent. Sampling a fixed
     noise pattern through wind*t alone is just a pan — it looks frozen
     at a slow speed. Feeding a second, independently-phased time offset
     back into the warp makes the SHAPE itself churn frame to frame. */
  vec2 wind = vec2(uT * 0.011, uT * 0.003); /* fog creeps, never scrolls */
  vec2 p = suv * 2.6 + push * 2.4;
  vec2 warpCoord = p * 0.85 + wind * 1.7 + 11.3;
  float warp = fbm(warpCoord + fbm(warpCoord * 0.55 + uT * 0.05) * 1.5);
  float f = fbm(p + vec2(warp * 1.7, warp * 1.1) + wind);

  /* banks: low-frequency coverage so there is real clear air; also
     given a whisper of the same time-turbulence so they don't just pan */
  float banks = smoothstep(0.38, 0.64, fbm(suv * 0.7 + wind * 0.5 + push * 0.8 + uT * 0.012 + 3.7));

  float density = smoothstep(0.33, 0.74, f) * banks;
  density *= 1.0 - clamp(thin, 0.0, 0.92);

  /* two-tone: dusty grey-sage body (clearly darker than the pale sky),
     cream hearts in the dense cores */
  vec3 body = vec3(0.706, 0.700, 0.664);
  vec3 core = vec3(0.992, 0.980, 0.953);
  vec3 col = mix(body, core, smoothstep(0.30, 0.85, density));

  float alpha = density * 0.78;
  gl_FragColor = vec4(col * alpha, alpha); /* premultiplied */
}
`;

export function MistLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOn } = useMotionPref();
  const { theme } = useTheme();
  const active = motionOn && theme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return; // no WebGL — the page simply has no mist

    /* ---- compile ---- */
    const mk = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        return null;
      }
      return sh;
    };
    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), /* fullscreen tri */
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); /* premultiplied */

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uT = gl.getUniformLocation(prog, "uT");
    const uTrail = gl.getUniformLocation(prog, "uTrail");
    const uAge = gl.getUniformLocation(prog, "uAge");

    /* fog is soft — render at reduced resolution and let CSS stretch it */
    const SCALE = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    let W = 0;
    let H = 0;
    const fit = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.max(2, Math.round(W * SCALE));
      canvas.height = Math.max(2, Math.round(H * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();

    /* ---- pointer disturbance ring buffer ---- */
    const trail = new Float32Array(TRAIL * 4);
    const ages = new Float32Array(TRAIL).fill(99);
    let head = 0;
    const write = (nx: number, ny: number, vx: number, vy: number, speed: number) => {
      const i = head % TRAIL;
      trail[i * 4] = nx;
      trail[i * 4 + 1] = ny;
      const cap = Math.min(1, speed) / Math.max(speed, 1e-4);
      trail[i * 4 + 2] = vx * cap;
      trail[i * 4 + 3] = vy * cap;
      ages[i] = 0;
      head++;
    };

    const STEP = 0.02; // normalized-space spacing between stroke samples
    const ptr = { x: -1, y: -1, t: 0 };
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const nx = e.clientX / Math.max(1, W);
      const ny = 1 - e.clientY / Math.max(1, H); /* GL y-up */
      if (ptr.x >= 0) {
        const dts = Math.max(0.008, (now - ptr.t) / 1000);
        const vx = (nx - ptr.x) / dts;
        const vy = (ny - ptr.y) / dts;
        const speed = Math.hypot(vx, vy);
        /* only real strokes disturb the fog — hover jitter is ignored.
           A fast sweep can jump a large screen distance between two
           pointermove events; LERPING sub-points along that segment
           turns the stroke into one continuous rope of disturbance
           instead of discrete dots "popping" in far apart. */
        if (speed > 0.12) {
          const dist = Math.hypot(nx - ptr.x, ny - ptr.y);
          const steps = Math.max(1, Math.min(8, Math.round(dist / STEP)));
          for (let s = 1; s <= steps; s++) {
            const f = s / steps;
            write(
              ptr.x + (nx - ptr.x) * f,
              ptr.y + (ny - ptr.y) * f,
              vx,
              vy,
              speed,
            );
          }
        }
      }
      ptr.x = nx;
      ptr.y = ny;
      ptr.t = now;
    };

    let raf = 0;
    let running = false;
    let last = performance.now();
    let t = Math.random() * 100; /* start mid-field, never identical */

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (W !== window.innerWidth || H !== window.innerHeight) fit();
      if (W === 0) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      for (let i = 0; i < TRAIL; i++) ages[i] += dt;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform4fv(uTrail, trail);
      gl.uniform1fv(uAge, ages);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(quad);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="mist-layer" aria-hidden />;
}

export default MistLayer;
