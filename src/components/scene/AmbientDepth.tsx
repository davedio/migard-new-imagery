"use client";

/* ============================================================
   AmbientDepth — the single persistent ambient background canvas.

   Supersedes the raw-WebGL FluidScene: it ports the same green/gold fbm
   "mist" into an R3F fog plane.

   Budget guardrails (see docs/visual-enhancements):
   - ONE <Canvas>: frameloop="always" while motion is on (continuous flow),
     "demand" (a single held frame) under reduced motion. Shader uniforms are
     driven through the material ref so the values actually reach the GPU.
   - DPR clamped to [1, 1.75] (background layer).
   - Honors the shared motion preference (useMotionPref); under reduced
     motion the fog freezes to a single still frame.
   - CSS-only fallback on low-power devices / no WebGL.
   ============================================================ */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { MOTION_SPEED } from "@/lib/motionConfig";
import { useMotionPref } from "@/lib/motion";

/* ---- fog plane: fullscreen clip-space quad running the ported mist fbm ---- */
const FOG_VERT = `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FOG_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time;
const float G = 0.55, S = 1.0, Wl = 0.5; // S = flow speed (gentle, smoke-like)
float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.xy;
  vec2 p=(gl_FragCoord.xy-0.5*u_res.xy)/u_res.y; p*=2.2;
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
  gl_FragColor=vec4(col,1.0);
}`;

function FogPlane({ motionOn }: { motionOn: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      u_res: { value: new THREE.Vector2(1, 1) },
      u_time: { value: 0 },
    }),
    [],
  );

  // Drive the MATERIAL's own uniforms via the ref — mutating the detached
  // useMemo object never reaches the shader.
  useFrame((state, dt) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    const dpr = state.viewport.dpr;
    u.u_res.value.set(state.size.width * dpr, state.size.height * dpr);
    if (motionOn) u.u_time.value += dt * MOTION_SPEED;
  });

  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={FOG_VERT}
        fragmentShader={FOG_FRAG}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* Drifting motes ("snow") removed — the ambient layer is the fog mist only. */

/* The canvas runs frameloop="always" while motion is on (continuous mist
   flow) and freezes to "demand" under reduced motion — see the <Canvas>
   below. The old demand + manual-tick driver stalled once the motes were
   removed, freezing the fog. */

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
        frameloop={motionOn ? "always" : "demand"}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <FogPlane motionOn={motionOn} />
      </Canvas>
      {/* darkening veil keeps page text legible over the mist */}
      <div style={{ position: "absolute", inset: 0, background: VEIL }} />
    </div>
  );
}
