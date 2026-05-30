"use client";

// "Stone + Light" trust-architecture stele for the How It Works page.
// A carved dark-basalt monolith anchored in a Cardano-L1 bedrock base. A precise
// vertical schematic rail carries verified activity DOWN through the six trust
// layers (Activity -> Batch -> Proof -> Challenge -> Settlement -> Cardano L1) as
// travelling green light; muted gold marks proof + settlement. Pure R3F (no GLB),
// reusing the world-tree's emissive + bloom language. Self-animating for now; the
// flow rate is the natural seam to bind to NetworkSnapshot later.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { RoundedBox } from "@react-three/drei";
import {
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

export type MonolithParams = {
  /** 0..1 overall activity — scales flow speed + glow. Mock/static for now. */
  activity: number;
};

/* brand palette (globals.css) */
const STONE = "#141d17";
const STONE_BEDROCK = "#0c140f";
const GREEN = new THREE.Color("#20be43");
const GREEN_BRIGHT = new THREE.Color("#3be863");
const GOLD = new THREE.Color("#b7791f");
const GOLD_BRIGHT = new THREE.Color("#e0a33c");
const PACKET_HOT = new THREE.Color("#eafff2");

/* the six trust layers, top -> bottom, matching the page's layer explainer */
const FACE_Z = 0.3; // front face of the stele (depth/2 ~ 0.28) + a hair proud
const RAIL_TOP = 2.25;
const RAIL_BOTTOM = -1.5; // terminates into the bedrock
type Layer = { name: string; y: number; gold?: boolean; side: 1 | -1 };
const LAYERS: Layer[] = [
  { name: "Activity", y: 1.95, side: -1 },
  { name: "Batch", y: 1.25, side: 1 },
  { name: "Proof", y: 0.55, side: -1, gold: true },
  { name: "Challenge", y: -0.15, side: 1 },
  { name: "Settlement", y: -0.85, side: -1, gold: true },
  { name: "Cardano L1", y: -1.45, side: 1 },
];

/* ---------- soft radial glow sprite (shared) ---------- */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);
}

/* ---------- procedural stone tooth: a value-noise bump so the basalt reads
   as carved rock rather than flat plastic (no texture asset needed) ---------- */
function useStoneBump() {
  return useMemo(() => {
    const S = 256;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(S, S);
    // a couple of octaves of cheap hashed noise
    const hash = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    const val = (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi);
      const b = hash(xi + 1, yi);
      const cc = hash(xi, yi + 1);
      const d = hash(xi + 1, yi + 1);
      return (
        a * (1 - u) * (1 - v) +
        b * u * (1 - v) +
        cc * (1 - u) * v +
        d * u * v
      );
    };
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        let n = 0;
        n += val(x / 24, y / 24) * 0.6;
        n += val(x / 9, y / 9) * 0.3;
        n += val(x / 3.5, y / 3.5) * 0.1;
        const g = Math.floor(THREE.MathUtils.clamp(n, 0, 1) * 255);
        const i = (y * S + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 4);
    t.needsUpdate = true;
    return t;
  }, []);
}

/* ---------- the carved stone: stele + recessed face panel + L1 bedrock ---------- */
function Stone({ bump }: { bump: THREE.Texture }) {
  return (
    <group>
      {/* main stele */}
      <RoundedBox args={[1.55, 4.1, 0.56]} radius={0.05} smoothness={4} position={[0, 0.45, 0]}>
        <meshStandardMaterial
          color={STONE}
          roughness={0.92}
          metalness={0.12}
          bumpMap={bump}
          bumpScale={0.04}
        />
      </RoundedBox>

      {/* recessed face panel the rail is carved into (slightly inset + darker) */}
      <RoundedBox
        args={[1.12, 3.55, 0.08]}
        radius={0.03}
        smoothness={3}
        position={[0, 0.5, 0.24]}
      >
        <meshStandardMaterial
          color={STONE_BEDROCK}
          roughness={0.78}
          metalness={0.18}
          bumpMap={bump}
          bumpScale={0.03}
        />
      </RoundedBox>

      {/* Cardano L1 bedrock the stele plants into */}
      <RoundedBox
        args={[2.5, 0.8, 1.05]}
        radius={0.06}
        smoothness={4}
        position={[0, -1.95, 0]}
      >
        <meshStandardMaterial
          color={STONE_BEDROCK}
          roughness={0.95}
          metalness={0.1}
          bumpMap={bump}
          bumpScale={0.05}
        />
      </RoundedBox>
    </group>
  );
}

/* ---------- the schematic trust rail: a precise central channel, six layer
   taps, green nodes, and muted-gold proof/settlement accents. Fine schematic
   detail (brand) — not runes. Steady base glow; packets add the motion. ---------- */
function TrustRail({ motionOn }: { motionOn: boolean }) {
  // junction-node materials we breathe each frame
  const nodeMats = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame((state) => {
    if (!motionOn) return;
    const k = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.2);
    nodeMats.current.forEach((m, i) => {
      if (!m) return;
      // gold nodes hold steadier; green nodes breathe a touch, out of phase
      const gold = m.userData.gold as boolean;
      m.emissiveIntensity = gold
        ? 2.4 + k * 0.5
        : 1.6 + (i % 2 ? k : 1 - k) * 0.8;
    });
  });

  return (
    <group position={[0, 0, FACE_Z]}>
      {/* central vertical channel */}
      <mesh position={[0, (RAIL_TOP + RAIL_BOTTOM) / 2, 0]}>
        <boxGeometry args={[0.05, RAIL_TOP - RAIL_BOTTOM, 0.03]} />
        <meshStandardMaterial
          color="#0a1f12"
          emissive={GREEN}
          emissiveIntensity={1.1}
          roughness={0.5}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {LAYERS.map((layer, i) => {
        const len = 0.34 + (i % 3) * 0.06;
        const cx = (layer.side * len) / 2;
        const col = layer.gold ? GOLD : GREEN;
        const colB = layer.gold ? GOLD_BRIGHT : GREEN_BRIGHT;
        return (
          <group key={layer.name} position={[0, layer.y, 0]}>
            {/* horizontal tap */}
            <mesh position={[cx, 0, 0]}>
              <boxGeometry args={[len, 0.04, 0.03]} />
              <meshStandardMaterial
                color="#0a1f12"
                emissive={col}
                emissiveIntensity={1.0}
                toneMapped={false}
              />
            </mesh>
            {/* junction node */}
            {layer.gold ? (
              <mesh position={[0, 0, 0.01]} rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[0.1, 0]} />
                <meshStandardMaterial
                  color="#1a1206"
                  emissive={colB}
                  emissiveIntensity={2.4}
                  metalness={0.6}
                  roughness={0.3}
                  toneMapped={false}
                  ref={(el) => {
                    if (el) {
                      el.userData.gold = true;
                      nodeMats.current[i] = el;
                    }
                  }}
                />
              </mesh>
            ) : (
              <mesh position={[0, 0, 0.01]}>
                <boxGeometry args={[0.12, 0.12, 0.05]} />
                <meshStandardMaterial
                  color="#0a1f12"
                  emissive={colB}
                  emissiveIntensity={1.6}
                  toneMapped={false}
                  ref={(el) => {
                    if (el) {
                      el.userData.gold = false;
                      nodeMats.current[i] = el;
                    }
                  }}
                />
              </mesh>
            )}
            {/* end cap on the tap */}
            <mesh position={[layer.side * len, 0, 0]}>
              <boxGeometry args={[0.07, 0.07, 0.04]} />
              <meshStandardMaterial
                color="#0a1f12"
                emissive={colB}
                emissiveIntensity={1.3}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* gold settlement seam across the bedrock top */}
      <mesh position={[0, -1.55, -0.04]}>
        <boxGeometry args={[2.1, 0.035, 0.03]} />
        <meshStandardMaterial
          color="#1a1206"
          emissive={GOLD_BRIGHT}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ---------- travelling verified-activity signal: a bright SEGMENT moving DOWN
   the rail (a living transaction path, not a decorative orb) ---------- */
function Packets({
  glow,
  speed,
  motionOn,
}: {
  glow: THREE.Texture;
  speed: number;
  motionOn: boolean;
}) {
  const COUNT = 3;
  const groups = useRef<THREE.Group[]>([]);
  const halos = useRef<THREE.Sprite[]>([]);
  const phase = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => i / COUNT),
    [],
  );
  const t = useRef(0);

  useFrame((_, dt) => {
    if (motionOn) t.current += dt * speed;
    groups.current.forEach((g, i) => {
      if (!g) return;
      g.visible = motionOn; // static fallback: rail glows, signal holds still
      const f = (t.current + phase[i]) % 1; // 0 top -> 1 bottom
      const y = RAIL_TOP - f * (RAIL_TOP - RAIL_BOTTOM);
      g.position.set(0, y, FACE_Z + 0.03);
      const halo = halos.current[i];
      if (halo) {
        const arrive = Math.pow(f, 2) * 0.22; // swells slightly toward settlement
        halo.scale.set(0.3, 0.46 + arrive, 1);
      }
    });
  });

  return (
    <>
      {phase.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) groups.current[i] = el;
          }}
        >
          <mesh>
            <boxGeometry args={[0.055, 0.3, 0.04]} />
            <meshBasicMaterial color={PACKET_HOT} toneMapped={false} />
          </mesh>
          <sprite
            scale={[0.3, 0.46, 1]}
            ref={(el) => {
              if (el) halos.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glow}
              color={GREEN_BRIGHT}
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </>
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
  const ptr = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    if (!motionOn) return;
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [motionOn]);

  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const sway = motionOn ? Math.sin(t * 0.3) * 0.05 : 0;
    const targetY = ptr.current.x * 0.32 + sway;
    const targetX = -ptr.current.y * 0.12;
    const k = 1 - Math.pow(0.005, dt);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    camera.lookAt(0, 0.3, 0);
  });
  return null;
}

function SceneContents({
  params,
  motionOn,
}: {
  params: MonolithParams;
  motionOn: boolean;
}) {
  const glow = useGlowTexture();
  const bump = useStoneBump();
  const group = useRef<THREE.Group>(null);
  const speed = 0.16 + params.activity * 0.34;

  return (
    <>
      <color attach="background" args={["#070d0a"]} />
      <fog attach="fog" args={["#070d0a", 9, 22]} />

      <ambientLight intensity={0.3} color="#8fa6b6" />
      {/* cool key from upper front */}
      <pointLight position={[3, 5, 6]} intensity={26} color="#cfead8" distance={40} />
      {/* green fill from below — the living signal washing up the stone */}
      <pointLight position={[-2.5, -2, 4]} intensity={12} color="#2fe06a" distance={26} />
      {/* warm gold rim from the side — proof/activation warmth */}
      <pointLight position={[-4, 2.5, 2]} intensity={8} color="#e0a33c" distance={24} />
      <directionalLight position={[2, 6, 8]} intensity={0.5} color="#cfe0ea" />
      {/* dim back rim to catch the carved stone silhouette against the dark */}
      <directionalLight position={[-3, 1, -5]} intensity={0.55} color="#43705a" />

      <Rig groupRef={group} motionOn={motionOn} />

      <group ref={group} position={[0, -0.1, 0]}>
        <Stone bump={bump} />
        <TrustRail motionOn={motionOn} />
        <Packets glow={glow} speed={speed} motionOn={motionOn} />
      </group>

      <EffectComposer>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.22}
          mipmapBlur
          radius={0.72}
        />
      </EffectComposer>
    </>
  );
}

export default function MonolithScene({
  params = { activity: 0.5 },
  motionOn = true,
}: {
  params?: MonolithParams;
  motionOn?: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.2, 0.5, 9], fov: 40, near: 0.1, far: 60 }}
    >
      <SceneContents params={params} motionOn={motionOn} />
    </Canvas>
  );
}
