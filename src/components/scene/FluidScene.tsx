"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   FluidScene — calm WebGL "mist" background for Midgard CHILD pages
   (users, builders, how-it-works, security, docs, …). NOT the home
   hero, which keeps the world-tree. Mount it via InteriorFluidBackground,
   which gates on the route.

   A domain-warped fbm fluid tinted in Midgard green/gold over deep ink,
   dimmed for text legibility. No controls, no pointer interaction.
   Colors are baked to match globals.css:
   green #20be43 / bright #3be863 / gold #e0a33c / ink #07120b.
   ============================================================ */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time, u_gravity, u_speed, u_swirl;
float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.xy;
  vec2 p=(gl_FragCoord.xy-0.5*u_res.xy)/u_res.y; p*=2.2;
  float t=u_time*0.10*u_speed;
  vec2 grav=vec2(0.0, t*u_gravity*1.5);
  float ang=u_swirl*0.6*sin(t*0.5+length(p));
  mat2 rot=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
  vec2 ps=rot*p;
  vec2 q=vec2(fbm(ps+grav), fbm(ps+vec2(5.2,1.3)-grav));
  vec2 r=vec2(fbm(ps+1.8*q+vec2(1.7,9.2)+0.15*t), fbm(ps+1.8*q+vec2(8.3,2.8)-0.12*t));
  float f=fbm(ps+1.8*r+grav);
  vec3 ink=vec3(0.020,0.055,0.035), green=vec3(0.125,0.745,0.263), gbri=vec3(0.231,0.909,0.388), gold=vec3(0.878,0.639,0.235);
  vec3 col=ink;
  col=mix(col, green*0.7, smoothstep(0.30,0.72,f));
  col=mix(col, gbri, smoothstep(0.60,0.98,f));
  float veins=pow(max(0.0,r.x*f),1.6);
  col=mix(col, gold, smoothstep(0.55,0.95,veins)*0.8);
  col+=gbri*0.06*smoothstep(0.7,1.0,f);
  float vig=smoothstep(1.25,0.25,length(uv-0.5));
  col*=mix(0.45,1.05,vig);
  gl_FragColor=vec4(col,1.0);
}`;

export default function FluidScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const gl = (cvs.getContext("webgl") ||
      cvs.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uG = gl.getUniformLocation(prog, "u_gravity");
    const uS = gl.getUniformLocation(prog, "u_speed");
    const uW = gl.getUniformLocation(prog, "u_swirl");

    // calm, dim background params (legibility for page text)
    const G = 0.6, S = 0.6, Wl = 0.45;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      gl.viewport(0, 0, cvs.width, cvs.height);
    };
    window.addEventListener("resize", resize);
    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      gl.uniform2f(uRes, cvs.width, cvs.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform1f(uG, G); gl.uniform1f(uS, S); gl.uniform1f(uW, Wl);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {/* darkening veil keeps page text legible over the mist */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,13,9,0.5), rgba(5,12,8,0.62))" }} />
    </div>
  );
}
