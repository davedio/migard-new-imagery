"use client";

/* eslint-disable react-hooks/immutability -- Three.js textures and uniforms are mutable renderer state. */

// "three" hero fork — procedural R3F world-tree. Selected via HERO_MODE in
// Gateway.tsx; the image-background fork lives in ./StaticTreeHero.tsx.
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { PostFX } from "./PostFX";
import { mulberry32, useGlowTexture, usePointerParallax } from "./sceneTokens";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Leaf } from "./treeGeometry";
import type { ProofStatus } from "@/lib/network";
import treePoints from "./worldtree.points.json";

export type SceneParams = {
  /** fraction of a curve traversed per second by signal pulses */
  speed: number;
  proofStatus: ProofStatus;
  challengeOpen: boolean;
  settled: boolean;
  /** 0..1 overall activity, drives brightness/pulse count feel */
  activity: number;
};

const GLB_URL = "/models/worldtree.glb";

/* ---------- soft leaf-shaped cutout texture ---------- */
function useLeafTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 64);
    // a simple pointed leaf via two opposed quadratic curves
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(32, 3);
    ctx.quadraticCurveTo(61, 30, 32, 61);
    ctx.quadraticCurveTo(3, 30, 32, 3);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/* ---------- canopy leaves + L1 root tips, authored in Blender, loaded
   from the sidecar so the instances sit exactly on the GLB form ---------- */
function useTreePoints() {
  return useMemo(() => {
    const rand = mulberry32(7);
    const leaves: Leaf[] = (treePoints.leafAnchors as number[][]).map((a) => ({
      pos: new THREE.Vector3(a[0], a[1], a[2]),
      scale: 0.34 + rand() * 0.5,
      rotY: rand() * Math.PI * 2,
      rotZ: (rand() - 0.5) * Math.PI,
      tint: rand(),
    }));
    const rootTips = (treePoints.rootTips as number[][]).map(
      (a) => new THREE.Vector3(a[0], a[1], a[2]),
    );
    return { leaves, rootTips };
  }, []);
}

/* the tree is shifted right so the hero copy on the left stays clear, and
   scaled to fit the camera envelope that the scroll path was tuned for */
const TREE_OFFSET_X = 3.6;
const TREE_SCALE = 0.6;
const GROUP_Y = -0.4;

/* ---------- camera path: canopy (top) down to L1 roots (bottom) ---------- */
type Stop = { p: number; pos: THREE.Vector3; look: THREE.Vector3 };
const STOPS: Stop[] = [
  { p: 0.0, pos: new THREE.Vector3(0.6, 6.6, 19.5), look: new THREE.Vector3(1.4, 6.2, 0) },
  { p: 0.34, pos: new THREE.Vector3(2.0, 1.0, 15.5), look: new THREE.Vector3(2.8, 0.8, 0) },
  { p: 0.66, pos: new THREE.Vector3(1.6, -3.4, 15.5), look: new THREE.Vector3(3.2, -3.8, 0) },
  { p: 1.0, pos: new THREE.Vector3(3.0, -5.8, 16.5), look: new THREE.Vector3(3.6, -6.2, 0) },
];

function sampleCam(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  const x = clamp(p);
  let i = 0;
  while (i < STOPS.length - 2 && x > STOPS[i + 1].p) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const t = smooth(clamp((x - a.p) / (b.p - a.p)));
  outPos.lerpVectors(a.pos, b.pos, t);
  outLook.lerpVectors(a.look, b.look, t);
}

function Rig({
  progressRef,
  motionOn,
}: {
  progressRef: RefObject<number>;
  motionOn: boolean;
}) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(1.4, 5.4, 0));
  const tPos = useRef(new THREE.Vector3());
  const tLook = useRef(new THREE.Vector3());
  // window-level pointer tracking (canvas is pointer-events:none)
  const ptr = usePointerParallax(motionOn);

  useFrame((_, dt) => {
    sampleCam(progressRef.current ?? 0, tPos.current, tLook.current);
    if (motionOn) {
      tPos.current.x += ptr.current.x * 0.6;
      tPos.current.y += ptr.current.y * 0.35;
    }
    const k = 1 - Math.pow(0.0026, dt);
    camera.position.lerp(tPos.current, k);
    look.current.lerp(tLook.current, k);
    camera.lookAt(look.current);
  });
  return null;
}

type ShaderLike = {
  uniforms: { [k: string]: { value: unknown } };
  vertexShader: string;
  fragmentShader: string;
};

/* ---------- the world-tree FORM (Blender GLB): real bark wearing electric
   energy-veins. Scanned PBR oak bark is the substrate; luminous CYAN sap
   travels ALONG each limb through the recessed grooves of the bark itself
   (uv.y = base->tip), masked to the deepest cracks so it reads as embedded
   veins, not surface lines. "Built by nature, powered by code." ---------- */
function GlbTree({
  motionOn,
  sapStrength = 1,
}: {
  motionOn: boolean;
  sapStrength?: number;
}) {
  const { nodes } = useGLTF(GLB_URL) as unknown as {
    nodes: Record<string, THREE.Object3D>;
  };

  // compressed 1K WebP (~1.3MB total) so the hero loads fast on mobile
  const [diff, norGl, rough, ao, disp] = useLoader(THREE.TextureLoader, [
    "/textures/bark/oak_diff_1k.webp",
    "/textures/bark/oak_nor_gl_1k.webp",
    "/textures/bark/oak_rough_1k.webp",
    "/textures/bark/oak_ao_1k.webp",
    "/textures/bark/oak_disp_1k.webp",
  ]);

  const REPEAT = useMemo(() => new THREE.Vector2(2.5, 1.4), []);

  useMemo(() => {
    for (const t of [diff, norGl, rough, ao, disp]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.copy(REPEAT);
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    diff.colorSpace = THREE.SRGBColorSpace;
    norGl.colorSpace = THREE.NoColorSpace;
    rough.colorSpace = THREE.NoColorSpace;
    ao.colorSpace = THREE.NoColorSpace;
    disp.colorSpace = THREE.NoColorSpace;
  }, [diff, norGl, rough, ao, disp, REPEAT]);

  const geometry = useMemo(() => {
    const mesh = Object.values(nodes).find(
      (n): n is THREE.Mesh => (n as THREE.Mesh).isMesh,
    );
    const geo = mesh!.geometry as THREE.BufferGeometry;
    // aoMap samples the 2nd uv set; the GLB only ships one, so alias it
    if (!geo.getAttribute("uv1") && geo.getAttribute("uv")) {
      geo.setAttribute("uv1", geo.getAttribute("uv"));
    }
    return geo;
  }, [nodes]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDisp: { value: disp },
      uRepeat: { value: REPEAT },
      uSap: { value: sapStrength },
    }),
    [disp, REPEAT, sapStrength],
  );

  const onBeforeCompile = useMemo(
    () => (shader: ShaderLike) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uDisp = uniforms.uDisp;
      shader.uniforms.uRepeat = uniforms.uRepeat;
      shader.uniforms.uSap = uniforms.uSap;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vTrunkUv;")
        .replace("#include <uv_vertex>", "#include <uv_vertex>\n  vTrunkUv = uv;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec2 vTrunkUv;
          uniform float uTime;
          uniform sampler2D uDisp;
          uniform vec2 uRepeat;
          uniform float uSap;`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          {
            vec2 buv = vTrunkUv * uRepeat;
            float height = texture2D(uDisp, buv).r;            // 1 = ridge, 0 = deep crack
            // veins live ONLY in the deepest recessed cracks -> embedded, not painted on
            float crack = 1.0 - smoothstep(0.28, 0.55, height);
            crack = pow(crack, 1.4);
            float along = vTrunkUv.y * 2.2 - uTime * 0.22;     // slow pulses travel along each limb
            float crest = pow(0.5 + 0.5 * sin(along * 6.2831), 2.5);
            float glow = crack * (0.10 + 1.20 * crest) * uSap;
            // electric cyan-blue energy: deep blue body brightening to white-cyan at the crest
            vec3 sap = mix(vec3(0.08, 0.50, 1.0), vec3(0.62, 0.95, 1.0), crest);
            totalEmissiveRadiance += sap * glow;
          }`,
        );
    },
    [uniforms],
  );

  useFrame((s) => {
    if (motionOn) uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#ffffff"
        map={diff}
        normalMap={norGl}
        normalScale={[1.25, 1.25]}
        roughnessMap={rough}
        roughness={0.95}
        aoMap={ao}
        aoMapIntensity={1.1}
        metalness={0.0}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
}
useGLTF.preload(GLB_URL);

/* ---------- bioluminescent canopy: instanced glowing leaves ---------- */
function Leaves({
  leaves,
  tex,
  activity,
  motionOn,
}: {
  leaves: Leaf[];
  tex: THREE.Texture;
  activity: number;
  motionOn: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const color = new THREE.Color();
    leaves.forEach((lf, i) => {
      dummy.position.copy(lf.pos);
      dummy.rotation.set(lf.rotZ, lf.rotY, 0);
      dummy.scale.setScalar(lf.scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      // green from deep teal-green to bright lime, brighter with activity
      const light = 0.34 + lf.tint * 0.14 + activity * 0.08;
      color.setHSL(0.34 - lf.tint * 0.1, 0.8, clamp(light, 0, 0.58));
      m.setColorAt(i, color);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [leaves, dummy, activity]);

  // whole-canopy breeze
  useFrame((state) => {
    if (!motionOn || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.z = Math.sin(t * 0.35) * 0.018;
    group.current.rotation.x = Math.cos(t * 0.27) * 0.014;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, leaves.length]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={tex}
          alphaTest={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent={false}
        />
      </instancedMesh>
    </group>
  );
}

/* ---------- Cardano L1 settlement blocks at the deepest root tips ---------- */
function L1Blocks({
  anchors,
  settled,
  motionOn,
  glow,
}: {
  anchors: THREE.Vector3[];
  settled: boolean;
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const blocks = useMemo(() => {
    // the deepest tips read as the L1 bedrock layer
    const deepest = [...anchors].sort((a, b) => a.y - b.y).slice(0, 12);
    return deepest.map((p, i) => ({
      pos: p,
      size: 0.5 + (i % 3) * 0.16,
      bright: i % 4 === 0, // a few brighter accents among the field
      phase: i * 0.7,
    }));
  }, [anchors]);

  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame((state) => {
    const t = motionOn ? state.clock.elapsedTime : 0;
    blocks.forEach((b, i) => {
      const m = mats.current[i];
      if (!m) return;
      const base = settled ? 2.0 : 1.2;
      m.emissiveIntensity = base + (motionOn ? Math.sin(t * 1.6 + b.phase) * 0.4 : 0);
    });
  });

  return (
    <group>
      {blocks.map((b, i) => (
        <group key={i} position={[b.pos.x, b.pos.y, b.pos.z]}>
          <mesh rotation={[b.phase, b.phase * 1.3, 0]}>
            <boxGeometry args={[b.size, b.size, b.size]} />
            <meshStandardMaterial
              ref={(el) => {
                if (el) mats.current[i] = el;
              }}
              color={b.bright ? "#0b2c3a" : "#08182a"}
              emissive={b.bright ? "#6fe0ff" : "#2f9cff"}
              emissiveIntensity={1.5}
              metalness={0.7}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
          <sprite scale={[b.size * 4, b.size * 4, 1]}>
            <spriteMaterial
              map={glow}
              color={b.bright ? "#6fe0ff" : "#2f9cff"}
              transparent
              opacity={settled ? 0.6 : 0.32}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/* ---------- small glowing rootlet tips ---------- */
function RootGlows({
  anchors,
  motionOn,
  glow,
}: {
  anchors: THREE.Vector3[];
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const refs = useRef<THREE.Sprite[]>([]);
  useFrame((state) => {
    if (!motionOn) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((s, i) => {
      if (!s) return;
      const v = 0.2 * (0.7 + 0.5 * Math.sin(t * 2 + i));
      s.scale.set(v, v, 1);
    });
  });
  return (
    <>
      {anchors.map((p, i) => (
        <sprite
          key={i}
          position={[p.x, p.y, p.z]}
          scale={[0.2, 0.2, 1]}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <spriteMaterial
            map={glow}
            color="#5ad0ff"
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </>
  );
}

function SceneContents({
  params,
  progressRef,
  motionOn,
}: {
  params: SceneParams;
  progressRef: RefObject<number>;
  motionOn: boolean;
}) {
  const { leaves, rootTips } = useTreePoints();
  const glow = useGlowTexture();
  const leafTex = useLeafTexture();

  return (
    <>
      <fog attach="fog" args={["#04080c", 14, 52]} />
      <ambientLight intensity={0.42} color="#8fa6b6" />
      <Rig progressRef={progressRef} motionOn={motionOn} />

      {/* tree offset to the right so it doesn't fight the hero copy.
          lights live here (world scale) so the inner scale doesn't warp ranges */}
      <group position={[TREE_OFFSET_X, 0, 0]}>
        <pointLight position={[2, 5, 6]} intensity={22} color="#bfe0ff" distance={40} />
        <pointLight position={[-2, -5, 4]} intensity={16} color="#37c0ff" distance={32} />
        <pointLight position={[0, -7, 2]} intensity={10} color="#3aa0ff" distance={22} />
        <directionalLight position={[2, 6, 10]} intensity={0.8} color="#cfe0ea" />
        <directionalLight position={[-4, 2, 6]} intensity={0.4} color="#bcc9d6" />

        <group scale={TREE_SCALE} position={[0, GROUP_Y, 0]}>
          <Suspense fallback={null}>
            <GlbTree motionOn={motionOn} />
          </Suspense>
          <Leaves leaves={leaves} tex={leafTex} activity={params.activity} motionOn={motionOn} />
          <L1Blocks anchors={rootTips} settled={params.settled} motionOn={motionOn} glow={glow} />
          <RootGlows anchors={rootTips} motionOn={motionOn} glow={glow} />
        </group>
      </group>

      <PostFX />
    </>
  );
}

export default function WorldTreeScene({
  params,
  progressRef,
  motionOn,
}: {
  params: SceneParams;
  progressRef: RefObject<number>;
  motionOn: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.8, 5.4, 18.5], fov: 46, near: 0.1, far: 120 }}
    >
      <SceneContents params={params} progressRef={progressRef} motionOn={motionOn} />
    </Canvas>
  );
}
