"use client";

/* eslint-disable react-hooks/immutability -- Three.js uniforms, matrices, and instance buffers are mutable renderer state. */

/* ============================================================
   AmbientDepth — the single persistent ambient background canvas.

   Supersedes the raw-WebGL FluidScene: it ports the same green/gold fbm
   "mist" into an R3F fog plane, then layers instanced drifting motes with
   scroll parallax on top to give below-fold sections real depth.

   Budget guardrails (see docs/visual-enhancements):
   - ONE <Canvas frameloop="demand"> — never free-runs. A throttled 30fps
     ticker drives invalidation only while motion is on and the tab is
     visible; otherwise it renders a single frame and holds still.
   - DPR clamped to [1, 1.75] (background layer).
   - Honors the shared motion preference (useMotionPref); under reduced
     motion the fog, motes, AND parallax freeze.
   - CSS-only fallback on low-power devices / no WebGL.
   ============================================================ */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32, useGlowTexture } from "./sceneTokens";
import { useMotionPref } from "@/lib/motion";

/* ---- fog plane: fullscreen clip-space quad running the ported mist fbm ---- */
const FOG_VERT = `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FOG_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_mouseOn;
const float G = 0.7, S = 1.7, Wl = 0.5; // S = flow speed (prominent mist); dim kept for legibility
float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.xy;
  vec2 p=(gl_FragCoord.xy-0.5*u_res.xy)/u_res.y; p*=2.2;
  // cursor parts the mist: push the sample coords outward from the pointer
  vec2 toC=p-u_mouse; float infl=u_mouseOn*smoothstep(1.2,0.0,length(toC));
  p+=normalize(toC+vec2(1e-4))*infl*1.05;
  float t=u_time*0.10*S;
  vec2 grav=vec2(0.0, t*G*1.5);
  float ang=Wl*0.6*sin(t*0.5+length(p));
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
  col*=mix(0.58,1.12,vig);
  col=mix(col, ink, infl*0.88); // clear a soft pocket right under the cursor
  gl_FragColor=vec4(col,1.0);
}`;

function FogPlane({ motionOn }: { motionOn: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const uniforms = useMemo(
    () => ({
      u_res: { value: new THREE.Vector2(1, 1) },
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, -999) },
      u_mouseOn: { value: 0 },
    }),
    [],
  );
  const targetOn = useRef(0);

  // Track the cursor window-wide (the canvas is pointer-events:none) so the
  // mist can part away from it. Coords map to the shader's `p` space.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      uniforms.u_mouse.value.set(
        ((e.clientX - 0.5 * w) / h) * 2.2,
        ((0.5 * h - e.clientY) / h) * 2.2,
      );
      targetOn.current = 1;
      invalidate();
    };
    const off = () => {
      targetOn.current = 0;
      invalidate();
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) off();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("blur", off);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", off);
    };
  }, [invalidate, uniforms]);

  useFrame((state, dt) => {
    const dpr = state.viewport.dpr;
    uniforms.u_res.value.set(state.size.width * dpr, state.size.height * dpr);
    if (motionOn) uniforms.u_time.value += dt;
    // ease the clearing in/out; disabled entirely under reduced motion
    const target = motionOn ? targetOn.current : 0;
    uniforms.u_mouseOn.value +=
      (target - uniforms.u_mouseOn.value) * Math.min(1, dt * 6);
  });
  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={FOG_VERT}
        fragmentShader={FOG_FRAG}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---- instanced drifting motes with scroll parallax ---- */
type Mote = {
  x: number;
  y: number;
  z: number;
  s: number;
  speed: number;
  sway: number;
  gold: boolean;
};

function Motes({
  motionOn,
  count,
  scrollRef,
}: {
  motionOn: boolean;
  count: number;
  scrollRef: React.RefObject<number>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tex = useGlowTexture();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const motes = useMemo<Mote[]>(() => {
    const rand = mulberry32(1337);
    return Array.from({ length: count }, () => ({
      x: (rand() * 2 - 1) * 6.5,
      y: (rand() * 2 - 1) * 4.2,
      z: -rand() * 2,
      s: 0.025 + rand() * 0.07,
      speed: 0.06 + rand() * 0.15,
      sway: rand() * Math.PI * 2,
      gold: rand() < 0.16,
    }));
  }, [count]);

  // one-time per-instance tint (green canopy spores + a few gold proof motes)
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const green = new THREE.Color("#3be863");
    const gold = new THREE.Color("#e0a33c");
    motes.forEach((m, i) => mesh.setColorAt(i, m.gold ? gold : green));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [motes]);

  useFrame((state, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const py = motionOn ? scrollRef.current * 2.6 : 0; // parallax (off when reduced)
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      if (motionOn) {
        m.y += m.speed * dt;
        if (m.y > 4.4) m.y = -4.4;
      }
      const x = m.x + Math.sin(t * 0.2 + m.sway) * 0.15;
      dummy.position.set(x, m.y - py, m.z);
      dummy.scale.setScalar(m.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.5}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ---- demand-render driver: invalidate on scroll + a throttled idle tick ---- */
function Driver({ motionOn, scrollRef }: { motionOn: boolean; scrollRef: React.RefObject<number> }) {
  const invalidate = useThree((s) => s.invalidate);

  // scroll → update parallax + request a frame (works even under reduced motion)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = h > 0 ? window.scrollY / h : 0;
      invalidate();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate, scrollRef]);

  // throttled ~30fps tick while motion is on and the tab is visible
  useEffect(() => {
    invalidate(); // always paint at least one frame
    if (!motionOn) return;
    const interval = 1000 / 30;
    let raf = 0;
    let last = 0;
    let visible = !document.hidden;
    const loop = (t: number) => {
      if (!visible) return;
      if (t - last >= interval) {
        last = t;
        invalidate();
      }
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      visible = !document.hidden;
      if (visible) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [motionOn, invalidate]);

  return null;
}

/* ---- low-power / no-WebGL detection ---- */
function canUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl") || c.getContext("experimental-webgl"))) return false;
  } catch {
    return false;
  }
  // skip the WebGL ambient layer only on genuinely minimal hardware
  // (4-core laptops/phones are common and handled it fine before)
  const cores = navigator.hardwareConcurrency ?? 8;
  return cores > 2;
}

const VEIL =
  "linear-gradient(180deg, rgba(6,13,9,0.4), rgba(5,12,8,0.52))";

export default function AmbientDepth() {
  const { motionOn } = useMotionPref();
  const scrollRef = useRef(0);

  // density scales with viewport width (mobile gets fewer motes)
  const count = useMemo(() => {
    if (typeof window === "undefined") return 120;
    return Math.round(Math.max(70, Math.min(170, window.innerWidth / 11)));
  }, []);

  const webgl = useMemo(() => canUseWebGL(), []);

  // CSS-only fallback: a static green-tinted mist, no canvas
  if (!webgl) {
    return (
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(120% 90% at 50% 12%, rgba(32,190,67,0.12), transparent 60%), radial-gradient(100% 70% at 70% 100%, rgba(207,154,46,0.07), transparent 65%), #060d09",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: VEIL }} />
      </div>
    );
  }

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <FogPlane motionOn={motionOn} />
        <Motes motionOn={motionOn} count={count} scrollRef={scrollRef} />
        <Driver motionOn={motionOn} scrollRef={scrollRef} />
      </Canvas>
      {/* darkening veil keeps page text legible over the mist */}
      <div style={{ position: "absolute", inset: 0, background: VEIL }} />
    </div>
  );
}
