"use client";

/* ============================================================
   MistLayer — real volumetric-looking mist, home hero only.

   Take three (review 2026-07-13: sprite blobs "don't look real").
   This is a WebGL fragment-shader fog — the technique real sites
   use for living smoke:

     · 5-octave fractal noise, DOMAIN-WARPED (fbm sampled through
       fbm), advected by a slow wind — the fog curls and breathes
       like actual vapor, no repeating shapes, no blobs
     · a low-frequency bank mask carves it into drifting fog banks
       with genuinely clear air between them
     · two-tone shading: dusty grey-sage body against the pale sky,
       cream highlights inside the dense cores over the dark tree

   The WAFT is written into the noise field itself: the pointer
   leaves a short trail of disturbances (position + velocity + age);
   each one pushes the fog's sampling domain along the hand's stroke
   AND thins the density locally, decaying over ~2s — so a sweep
   visibly bends, tears, and clears the vapor, which then re-knits.
   Slow hovers barely register (velocity-driven, like the rest of
   the site's motion grammar).

   Raw WebGL (one quad, one shader) — no scene graph needed. Light
   theme + home + motion-on only; parks when hidden; self-heals
   zero-size mounts; falls back to nothing without WebGL.
   ============================================================ */

import { useEffect, useRef } from "react";
import { useMotionPref } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const TRAIL = 20; // pointer disturbance ring buffer

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
     and thin the fog locally — both decay with age */
  vec2 push = vec2(0.0);
  float thin = 0.0;
  for (int i = 0; i < ${TRAIL}; i++) {
    vec2 tp = vec2(uTrail[i].x * aspect, uTrail[i].y);
    vec2 tv = uTrail[i].zw;
    float d = distance(suv, tp);
    float infl = exp(-d * d * 55.0) * exp(-uAge[i] * 1.35);
    push += tv * infl * 0.6;
    thin += infl * min(1.0, length(tv) * 1.6);
  }

  /* fog field: wind-advected, domain-warped fbm */
  vec2 wind = vec2(uT * 0.020, uT * 0.006);
  vec2 p = suv * 2.6 + push * 2.4;
  float warp = fbm(p * 0.85 + wind * 1.7 + 11.3);
  float f = fbm(p + vec2(warp * 1.7, warp * 1.1) + wind);

  /* banks: low-frequency coverage so there is real clear air */
  float banks = smoothstep(0.42, 0.72, fbm(suv * 0.7 + wind * 0.5 + push * 0.8 + 3.7));

  float density = smoothstep(0.38, 0.82, f) * banks;
  density *= 1.0 - clamp(thin, 0.0, 0.92);

  /* two-tone: dusty grey-sage body, cream hearts in the dense cores */
  vec3 body = vec3(0.742, 0.735, 0.700);
  vec3 core = vec3(0.992, 0.980, 0.953);
  vec3 col = mix(body, core, smoothstep(0.30, 0.85, density));

  float alpha = density * 0.62;
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
        /* only real strokes disturb the fog — hover jitter is ignored */
        if (speed > 0.12) {
          const i = head % TRAIL;
          trail[i * 4] = nx;
          trail[i * 4 + 1] = ny;
          const cap = Math.min(1, speed) / Math.max(speed, 1e-4);
          trail[i * 4 + 2] = vx * cap;
          trail[i * 4 + 3] = vy * cap;
          ages[i] = 0;
          head++;
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
