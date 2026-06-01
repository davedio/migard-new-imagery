"use client";

/**
 * LifecycleScene — Scroll-driven 3D protocol lifecycle diagram.
 *
 * Six emissive nodes (Activity → Batch → Proof → Challenge → Settlement →
 * Cardano L1) connected by tube rail, with travelling green "sap" pulses.
 * Gold tint on Proof, Settlement, and Cardano L1 nodes.
 *
 * The `activeStep` prop (0-indexed) is driven by scroll from the parent
 * ProtocolLifecycle, advancing the active node as the user scrolls.
 *
 * Canvas: orthographic, alpha, no shadow map, demand frameloop. Bloom via PostFX.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { PostFX } from "./PostFX";
import { useGlowTexture, SCENE_COLORS } from "./sceneTokens";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ── palette ──────────────────────────────────────────────────────────────────
const GREEN = new THREE.Color(SCENE_COLORS.green);
const GREEN_BRIGHT = new THREE.Color(SCENE_COLORS.greenBright);
const GOLD = new THREE.Color(SCENE_COLORS.gold);
const GOLD_BRIGHT = new THREE.Color(SCENE_COLORS.goldDeep).multiplyScalar(1.5);
const MIST = new THREE.Color(SCENE_COLORS.mist);
const IDLE = new THREE.Color("#1c2e20");

// ── stage definitions ─────────────────────────────────────────────────────────
type Stage = { label: string; gold?: boolean };
const STAGES: Stage[] = [
  { label: "Activity" },
  { label: "Batch" },
  { label: "Proof", gold: true },
  { label: "Challenge" },
  { label: "Settlement", gold: true },
  { label: "Cardano L1", gold: true },
];

const N = STAGES.length;
// Layout: nodes stacked vertically, centred
const NODE_Y: number[] = Array.from({ length: N }, (_, i) => {
  // top = 2.0, bottom = -2.0, evenly spaced
  return 2.0 - i * (4.0 / (N - 1));
});

// The vertical rail spans from just above top node to just below bottom node
const RAIL_TOP = NODE_Y[0] + 0.12;
const RAIL_BTM = NODE_Y[N - 1] - 0.12;
const RAIL_LEN = RAIL_TOP - RAIL_BTM;

// ── helpers ───────────────────────────────────────────────────────────────────

/** lerp a value t towards target with coefficient k */
function lerp(a: number, b: number, k: number) {
  return a + (b - a) * k;
}

// ── sub-components ────────────────────────────────────────────────────────────

/** Emissive vertical tube rail. */
function Rail() {
  return (
    <mesh position={[0, (RAIL_TOP + RAIL_BTM) / 2, -0.04]}>
      <boxGeometry args={[0.035, RAIL_LEN, 0.02]} />
      <meshStandardMaterial
        color="#0a1f12"
        emissive={GREEN}
        emissiveIntensity={0.7}
        roughness={0.6}
        toneMapped={false}
      />
    </mesh>
  );
}

/** "Progress" overlay on the rail — lit up to the active node. */
function RailProgress({ progressRef }: { progressRef: React.RefObject<THREE.Mesh | null> }) {
  // We drive height/position imperatively in SceneContents to avoid re-renders
  return (
    <mesh ref={progressRef} position={[0, RAIL_TOP, -0.02]}>
      <boxGeometry args={[0.054, RAIL_LEN, 0.025]} />
      <meshStandardMaterial
        color="#0b2812"
        emissive={GREEN_BRIGHT}
        emissiveIntensity={1.4}
        roughness={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Six lifecycle nodes. */
function Nodes({
  activeStep,
  motionOn,
  nodeMatsRef,
}: {
  activeStep: number;
  motionOn: boolean;
  nodeMatsRef: React.RefObject<(THREE.MeshStandardMaterial | null)[]>;
}) {
  // Breathe active node
  useFrame((state) => {
    if (!motionOn) return;
    const k = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.5);
    nodeMatsRef.current.forEach((m, i) => {
      if (!m) return;
      const stage = STAGES[i];
      const isActive = i === activeStep;
      const isComplete = i < activeStep;
      if (isActive) {
        const baseIntensity = stage.gold ? 3.2 : 2.6;
        m.emissiveIntensity = baseIntensity + k * 0.7;
      } else if (isComplete) {
        m.emissiveIntensity = stage.gold ? 1.8 : 1.1;
      } else {
        m.emissiveIntensity = 0.3;
      }
    });
  });

  return (
    <group>
      {STAGES.map((stage, i) => {
        const isActive = i === activeStep;
        const isComplete = i < activeStep;
        const emissiveColor = stage.gold
          ? isActive
            ? GOLD_BRIGHT
            : isComplete
              ? GOLD
              : IDLE
          : isActive
            ? GREEN_BRIGHT
            : isComplete
              ? GREEN
              : IDLE;
        const baseIntensity = isActive
          ? stage.gold ? 3.2 : 2.6
          : isComplete
            ? stage.gold ? 1.8 : 1.1
            : 0.3;

        return (
          <group key={stage.label} position={[0, NODE_Y[i], 0]}>
            {/* node glyph — gold stages use rotated octahedron, green use RoundedBox */}
            {stage.gold ? (
              <mesh rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[0.13, 0]} />
                <meshStandardMaterial
                  color="#1a1206"
                  emissive={emissiveColor}
                  emissiveIntensity={baseIntensity}
                  metalness={0.5}
                  roughness={0.3}
                  toneMapped={false}
                  ref={(el) => {
                    nodeMatsRef.current[i] = el;
                  }}
                />
              </mesh>
            ) : (
              <RoundedBox args={[0.18, 0.18, 0.04]} radius={0.025} smoothness={3}>
                <meshStandardMaterial
                  color="#0a1f12"
                  emissive={emissiveColor}
                  emissiveIntensity={baseIntensity}
                  roughness={0.45}
                  toneMapped={false}
                  ref={(el) => {
                    nodeMatsRef.current[i] = el;
                  }}
                />
              </RoundedBox>
            )}

            {/* active halo ring */}
            {isActive && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.24, 0.008, 6, 48]} />
                <meshStandardMaterial
                  color="#0a1f12"
                  emissive={stage.gold ? GOLD_BRIGHT : GREEN_BRIGHT}
                  emissiveIntensity={2.0}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* horizontal tap lines — alternate left / right for schematic feel */}
            <mesh position={[i % 2 === 0 ? -0.24 : 0.24, 0, -0.03]}>
              <boxGeometry args={[0.36, 0.025, 0.015]} />
              <meshStandardMaterial
                color="#0a1f12"
                emissive={isComplete || isActive ? (stage.gold ? GOLD : GREEN) : IDLE}
                emissiveIntensity={isActive ? 1.4 : isComplete ? 0.7 : 0.2}
                toneMapped={false}
              />
            </mesh>

            {/* end-cap dot on tap */}
            <mesh position={[i % 2 === 0 ? -0.42 : 0.42, 0, -0.03]}>
              <boxGeometry args={[0.055, 0.055, 0.02]} />
              <meshStandardMaterial
                color="#0a1f12"
                emissive={isComplete || isActive ? (stage.gold ? GOLD_BRIGHT : GREEN_BRIGHT) : IDLE}
                emissiveIntensity={isActive ? 1.6 : isComplete ? 0.8 : 0.2}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Travelling pulse sprites flowing DOWN the rail. */
function Pulses({
  glow,
  motionOn,
  activeStep,
}: {
  glow: THREE.Texture;
  motionOn: boolean;
  activeStep: number;
}) {
  const COUNT = 3;
  const phase = useMemo(() => Array.from({ length: COUNT }, (_, i) => i / COUNT), []);
  const t = useRef(0);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);

  // Determine active range: top of rail to bottom of active node
  // Progress fraction: pulse travels 0..1 across the entire rail
  // But we only show pulses up to the active node
  const activeProgress = activeStep / (N - 1); // 0..1

  useFrame((_, dt) => {
    if (motionOn) t.current += dt * 0.22;

    phase.forEach((ph, i) => {
      const g = groups.current[i];
      const sp = sprites.current[i];
      if (!g || !sp) return;

      // Position along active segment: pulse moves from rail top to active node
      const f = ((t.current + ph) % 1) * activeProgress; // clamp to active zone
      const y = RAIL_TOP - f * RAIL_LEN;
      g.position.setY(y);

      // determine color based on what node we're near
      const nearNodeIdx = Math.round(f * (N - 1));
      const nearStage = STAGES[Math.min(nearNodeIdx, N - 1)];
      const isGold = nearStage.gold && f > activeProgress * 0.65;
      const col = isGold ? GOLD : GREEN_BRIGHT;

      if (motionOn) {
        sp.material.color.copy(col);
        sp.material.opacity = 0.48;
      } else {
        sp.material.opacity = 0;
      }
    });
  });

  return (
    <>
      {phase.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <mesh>
            <boxGeometry args={[0.044, 0.22, 0.025]} />
            <meshBasicMaterial color={MIST} toneMapped={false} />
          </mesh>
          <sprite
            scale={[0.28, 0.38, 1]}
            ref={(el) => {
              sprites.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glow}
              color={GREEN_BRIGHT}
              transparent
              opacity={0.48}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </>
  );
}

// ── main scene ────────────────────────────────────────────────────────────────

function SceneContents({
  activeStep,
  motionOn,
  smoothActiveRef,
}: {
  activeStep: number;
  motionOn: boolean;
  smoothActiveRef: { current: number };
}) {
  const glow = useGlowTexture();
  const nodeMatsRef = useRef<(THREE.MeshStandardMaterial | null)[]>(
    Array(N).fill(null)
  );
  const railProgressRef = useRef<THREE.Mesh | null>(null);

  // Smoothly lerp the scroll progress driving the rail progress bar
  useFrame((_, dt) => {
    const target = activeStep / (N - 1);
    const k = 1 - Math.pow(0.012, dt);
    smoothActiveRef.current = lerp(smoothActiveRef.current, target, k);

    const rp = railProgressRef.current;
    if (rp) {
      const progress = smoothActiveRef.current;
      // Scale geometry along Y (anchored at RAIL_TOP), slide down by half the grown segment
      rp.scale.y = Math.max(0.001, progress);
      rp.position.y = RAIL_TOP - (RAIL_LEN * progress) / 2;
    }
  });

  return (
    <>
      <color attach="background" args={["#060d09"]} />

      {/* lighting — schematic, not dramatic */}
      <ambientLight intensity={0.28} color="#8fa6b6" />
      <pointLight position={[2, 3, 5]} intensity={14} color="#cfe6da" distance={32} />
      <pointLight position={[-2, -2, 3]} intensity={8} color="#2fe06a" distance={22} />
      <pointLight position={[3, 1, 2]} intensity={5} color="#e0a33c" distance={20} />

      <group position={[0, 0, 0]}>
        <Rail />
        <RailProgress progressRef={railProgressRef} />
        <Nodes
          activeStep={activeStep}
          motionOn={motionOn}
          nodeMatsRef={nodeMatsRef}
        />
        <Pulses glow={glow} motionOn={motionOn} activeStep={activeStep} />
      </group>

      <PostFX
        bloomIntensity={0.45}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.22}
        radius={0.65}
      />
    </>
  );
}

export type LifecycleSceneProps = {
  activeStep: number;
  motionOn?: boolean;
};

export default function LifecycleScene({
  activeStep,
  motionOn = true,
}: LifecycleSceneProps) {
  const smoothActiveRef = useRef(0);

  // Invalidate once when activeStep changes so demand frameloop catches it
  // (the actual invalidation is handled by useFrame running while in view)

  return (
    <Canvas
      orthographic
      dpr={[1, 1.8]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{
        position: [0, 0, 8],
        zoom: 88,
        near: 0.1,
        far: 60,
      }}
      frameloop="always"
    >
      <SceneContents
        activeStep={activeStep}
        motionOn={motionOn}
        smoothActiveRef={smoothActiveRef}
      />
    </Canvas>
  );
}
