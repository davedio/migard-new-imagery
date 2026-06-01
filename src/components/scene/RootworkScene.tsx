"use client";

// "Living Roots" trust-architecture set-piece for the How It Works page.
// Gnarled Yggdrasil-style roots descend from the canopy above, pass through six
// earthen trust layers, and plunge into a glowing Cardano-L1 bedrock slab.
// Verified activity flows DOWN the roots as green sap-light; gold marks proof,
// settlement, and L1. Pure R3F (procedural roots, no GLB) reusing the
// world-tree's oak-bark + emissive + bloom language. The flow rate is the
// natural seam to bind to NetworkSnapshot later.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { PostFX } from "./PostFX";
import { mulberry32, useGlowTexture, usePointerParallax } from "./sceneTokens";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

export type RootworkParams = {
  /** 0..1 overall activity — scales sap flow speed. Mock/static for now. */
  activity: number;
};

/* brand palette (globals.css) */
const WOOD = "#2a1f15";
const EARTH = "#15100b";
const GREEN = new THREE.Color("#20be43");
const GREEN_BRIGHT = new THREE.Color("#3be863");
const GOLD = new THREE.Color("#b7791f");
const GOLD_BRIGHT = new THREE.Color("#e0a33c");
const SAP_HOT = new THREE.Color("#eafff2");

const TOP_Y = 2.55;
const BED_Y = -1.95;
const UP = new THREE.Vector3(0, 1, 0);

/* six trust layers, top -> bottom, matching the page's layer explainer */
type Layer = { name: string; y: number; gold?: boolean };
const LAYERS: Layer[] = [
  { name: "Activity", y: 1.95 },
  { name: "Batch", y: 1.25 },
  { name: "Proof", y: 0.5, gold: true },
  { name: "Challenge", y: -0.2 },
  { name: "Settlement", y: -0.95, gold: true },
  { name: "Cardano L1", y: -1.62, gold: true },
];

type Strand = {
  curve: THREE.CatmullRomCurve3;
  radius: number;
  sapCount: number;
};

function useStrands(): Strand[] {
  return useMemo(() => {
    const rand = mulberry32(20260529);
    const strands: Strand[] = [];

    // central taproot — thick, nearly straight, gentle gnarl
    strands.push({
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, TOP_Y + 0.35, 0),
        new THREE.Vector3(0.05, 1.4, 0.03),
        new THREE.Vector3(-0.04, 0.3, -0.03),
        new THREE.Vector3(0.03, -0.8, 0.02),
        new THREE.Vector3(0, BED_Y + 0.05, 0),
      ]),
      radius: 0.17,
      sapCount: 3,
    });

    // splayed secondary roots — bulge outward mid-height, converge into bedrock
    const COUNT = 5;
    for (let i = 0; i < COUNT; i++) {
      const ang = (i / COUNT) * Math.PI * 2 + rand() * 0.7;
      const spread = 0.55 + rand() * 0.75;
      const zsquash = 0.55 + rand() * 0.25;
      const segs = 7;
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const y = THREE.MathUtils.lerp(TOP_Y + 0.1, BED_Y + 0.08, t);
        const bulge = Math.sin(t * Math.PI) * spread;
        const wob = Math.sin(t * 8 + i * 1.7) * 0.07 * (1 - t * 0.6);
        const x = Math.cos(ang) * bulge + wob;
        const z = Math.sin(ang) * bulge * zsquash + Math.cos(t * 6 + i) * 0.05;
        pts.push(new THREE.Vector3(x, y, z));
      }
      strands.push({
        curve: new THREE.CatmullRomCurve3(pts),
        radius: 0.06 + rand() * 0.045,
        sapCount: 2,
      });
    }
    return strands;
  }, []);
}

/* ---------- procedural value-noise bump for the bedrock (no texture asset) ---------- */
function useEarthBump() {
  return useMemo(() => {
    const S = 128;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(S, S);
    const hash = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n =
          hash(Math.floor(x / 4), Math.floor(y / 4)) * 0.6 + hash(x, y) * 0.4;
        const g = Math.floor(THREE.MathUtils.clamp(n, 0, 1) * 255);
        const i = (y * S + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tx = new THREE.CanvasTexture(c);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(3, 3);
    tx.needsUpdate = true;
    return tx;
  }, []);
}

/* ---------- living-wood roots: oak-bark tubes along each strand ---------- */
function Roots({ strands }: { strands: Strand[] }) {
  const tex = useTexture({
    map: "/textures/bark/oak_diff_1k.webp",
    normalMap: "/textures/bark/oak_nor_gl_1k.webp",
    roughnessMap: "/textures/bark/oak_rough_1k.webp",
  }) as unknown as {
    map: THREE.Texture;
    normalMap: THREE.Texture;
    roughnessMap: THREE.Texture;
  };

  const configuredTex = useMemo(() => {
    const cloned = {
      map: tex.map.clone(),
      normalMap: tex.normalMap.clone(),
      roughnessMap: tex.roughnessMap.clone(),
    };
    [cloned.map, cloned.normalMap, cloned.roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.4, 5);
    });
    cloned.map.colorSpace = THREE.SRGBColorSpace;
    return cloned;
  }, [tex]);

  useEffect(
    () => () => {
      configuredTex.map.dispose();
      configuredTex.normalMap.dispose();
      configuredTex.roughnessMap.dispose();
    },
    [configuredTex],
  );

  const geos = useMemo(
    () =>
      strands.map((s) => {
        const tubular = Math.max(20, Math.floor(s.curve.getLength() * 16));
        return new THREE.TubeGeometry(s.curve, tubular, s.radius, 9, false);
      }),
    [strands],
  );

  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial
            map={configuredTex.map}
            normalMap={configuredTex.normalMap}
            roughnessMap={configuredTex.roughnessMap}
            color={WOOD}
            roughness={1}
            metalness={0.05}
            normalScale={[0.7, 0.7]}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- the six trust layers as fine emissive survey rings around the
   column; gold marks proof / settlement / L1 (fine schematic detail, brand) ---------- */
function ringRadius(y: number) {
  const t = THREE.MathUtils.clamp((TOP_Y - y) / (TOP_Y - BED_Y), 0, 1);
  return 0.2 + Math.sin(t * Math.PI) * 1.15;
}

function LayerRings({ motionOn }: { motionOn: boolean }) {
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame((state) => {
    if (!motionOn) return;
    const k = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.5);
    mats.current.forEach((m, i) => {
      if (!m) return;
      const gold = m.userData.gold as boolean;
      m.emissiveIntensity = (gold ? 1.7 : 0.9) + (i % 2 ? k : 1 - k) * 0.5;
    });
  });
  return (
    <group>
      {LAYERS.map((L, i) => (
        <mesh key={L.name} position={[0, L.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ringRadius(L.y), 0.011, 8, 80]} />
          <meshStandardMaterial
            color="#0a1308"
            emissive={L.gold ? GOLD : GREEN}
            emissiveIntensity={L.gold ? 1.7 : 0.9}
            metalness={0.3}
            roughness={0.5}
            toneMapped={false}
            ref={(el) => {
              if (el) {
                el.userData.gold = !!L.gold;
                mats.current[i] = el;
              }
            }}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- verified-activity sap: bright segments travelling DOWN each root
   (a living transaction path, not a decorative orb) ---------- */
function Sap({
  strands,
  speed,
  motionOn,
  glow,
}: {
  strands: Strand[];
  speed: number;
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const drops = useMemo(() => {
    const list: { si: number; phase: number }[] = [];
    strands.forEach((s, si) => {
      for (let k = 0; k < s.sapCount; k++) {
        list.push({ si, phase: k / s.sapCount + si * 0.11 });
      }
    });
    return list;
  }, [strands]);

  const groups = useRef<(THREE.Group | null)[]>([]);
  const t = useRef(0);
  const _p = useMemo(() => new THREE.Vector3(), []);
  const _tan = useMemo(() => new THREE.Vector3(), []);
  const _q = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, dt) => {
    if (motionOn) t.current += dt * speed;
    drops.forEach((d, i) => {
      const g = groups.current[i];
      if (!g) return;
      const curve = strands[d.si].curve;
      const f = (t.current + d.phase) % 1; // 0 top -> 1 bottom
      curve.getPointAt(f, _p);
      curve.getTangentAt(f, _tan);
      _q.setFromUnitVectors(UP, _tan);
      g.position.copy(_p);
      g.quaternion.copy(_q);
    });
  });

  return (
    <>
      {drops.map((d, i) => {
        const r = strands[d.si].radius;
        return (
          <group
            key={i}
            ref={(el) => {
              groups.current[i] = el;
            }}
          >
            <mesh>
              <cylinderGeometry args={[r * 0.5, r * 0.5, 0.22, 8]} />
              <meshBasicMaterial color={SAP_HOT} toneMapped={false} />
            </mesh>
            <sprite scale={[r * 3.4, 0.34, 1]}>
              <spriteMaterial
                map={glow}
                color={GREEN_BRIGHT}
                transparent
                opacity={0.42}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        );
      })}
    </>
  );
}

/* ---------- Cardano L1 bedrock the roots plunge into ---------- */
function Bedrock({
  motionOn,
  glow,
  bump,
}: {
  motionOn: boolean;
  glow: THREE.Texture;
  bump: THREE.Texture;
}) {
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const rim = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!motionOn) return;
    const k = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.1);
    if (core.current) core.current.opacity = 0.32 + k * 0.22;
    if (rim.current) rim.current.emissiveIntensity = 1.5 + k * 0.7;
  });
  return (
    <group position={[0, BED_Y, 0]}>
      {/* L1 slab */}
      <mesh>
        <cylinderGeometry args={[1.65, 1.95, 0.55, 56]} />
        <meshStandardMaterial
          color={EARTH}
          roughness={0.97}
          metalness={0.08}
          bumpMap={bump}
          bumpScale={0.08}
        />
      </mesh>
      {/* settlement light pool where the roots enter */}
      <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.25, 56]} />
        <meshBasicMaterial
          ref={core}
          color="#0e3a1d"
          transparent
          opacity={0.4}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* gold settlement rim */}
      <mesh position={[0, 0.285, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 8, 90]} />
        <meshStandardMaterial
          ref={rim}
          color="#1a1206"
          emissive={GOLD_BRIGHT}
          emissiveIntensity={1.6}
          metalness={0.5}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      {/* soft settlement glow */}
      <sprite position={[0, 0.4, 0]} scale={[3.2, 1.5, 1]}>
        <spriteMaterial
          map={glow}
          color={GOLD}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ---------- camera parallax + slow idle sway ---------- */
function Rig({
  groupRef,
  motionOn,
}: {
  groupRef: RefObject<THREE.Group | null>;
  motionOn: boolean;
}) {
  const ptr = usePointerParallax(motionOn);
  const { camera } = useThree();
  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const time = state.clock.elapsedTime;
    const sway = motionOn ? Math.sin(time * 0.28) * 0.045 : 0;
    const targetY = ptr.current.x * 0.3 + sway;
    const targetX = -ptr.current.y * 0.1;
    const k = 1 - Math.pow(0.005, dt);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    camera.lookAt(0, 0.15, 0);
  });
  return null;
}

function SceneContents({
  params,
  motionOn,
}: {
  params: RootworkParams;
  motionOn: boolean;
}) {
  const strands = useStrands();
  const glow = useGlowTexture();
  const bump = useEarthBump();
  const group = useRef<THREE.Group>(null);
  const speed = 0.12 + params.activity * 0.3;

  return (
    <>
      <color attach="background" args={["#07110b"]} />
      <fog attach="fog" args={["#07110b", 8.5, 21]} />

      <ambientLight intensity={0.32} color="#9fb0c2" />
      {/* cool moonlight key from upper front */}
      <pointLight position={[3, 5.5, 6]} intensity={24} color="#cfe6da" distance={42} />
      {/* green underglow rising from the bedrock — the living signal */}
      <pointLight position={[-2.4, -2.2, 4]} intensity={13} color="#2fe06a" distance={26} />
      {/* warm gold side rim — proof / settlement warmth */}
      <pointLight position={[-4, 2.5, 2]} intensity={7} color="#e0a33c" distance={24} />
      <directionalLight position={[2, 6, 8]} intensity={0.45} color="#cfe0ea" />
      {/* dim back rim to catch the gnarled root silhouette against the dark */}
      <directionalLight position={[-3, 1, -5]} intensity={0.6} color="#3f6a52" />

      <Rig groupRef={group} motionOn={motionOn} />

      <group ref={group} position={[0, -0.05, 0]}>
        <Suspense fallback={null}>
          <Roots strands={strands} />
        </Suspense>
        <LayerRings motionOn={motionOn} />
        <Sap strands={strands} speed={speed} motionOn={motionOn} glow={glow} />
        <Bedrock motionOn={motionOn} glow={glow} bump={bump} />
      </group>

      <PostFX
        bloomIntensity={0.9}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.22}
        radius={0.7}
      />
    </>
  );
}

export default function RootworkScene({
  params = { activity: 0.5 },
  motionOn = true,
}: {
  params?: RootworkParams;
  motionOn?: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.15, 0.55, 9], fov: 40, near: 0.1, far: 60 }}
    >
      <SceneContents params={params} motionOn={motionOn} />
    </Canvas>
  );
}
