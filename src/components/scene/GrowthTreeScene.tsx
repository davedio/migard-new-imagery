"use client";

/* eslint-disable react-hooks/immutability -- Three.js textures, uniforms and instanced attributes are mutable renderer state. */

/* ============================================================
   GrowthTreeScene — the "roots that grow on scroll" hero.

   A real-3D world-tree, built procedurally from treeGeometry.ts
   (CatmullRom spines + tapered tubes whose UV.y runs base->tip).
   ONE growth scalar (0..1), driven by Framer Motion scrollYProgress
   through a ref + rAF lerp (never React state per scroll), reveals the
   structure along those base->tip UVs:

     scroll 0.00  — only the seed + trunk foot show (a stump in the dark)
     scroll →     — ROOTS spread downward into the Cardano L1 bedrock
     scroll →     — the TRUNK rises and the CANOPY reaches up & open
     scroll 1.00  — full tree, leaves lit, L1 anchors settled

   Luminous "sap" travels only along the revealed length as tasteful,
   event-based pulses. A scroll-linked camera descends from the canopy
   toward the roots, reinforcing the downward growth. Bloom via PostFX.

   The reveal is per-fragment in the bark shaders (uGrowth + a soft
   leading edge that glows as it advances) so growth reads organic, not
   like a mechanical draw-range cut.
   ============================================================ */

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { PostFX } from "./PostFX";
import { buildTree, LAYOUT, type Tree, type Leaf } from "./treeGeometry";
import { mulberry32, useGlowTexture, usePointerParallax } from "./sceneTokens";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import type { ProofStatus } from "@/lib/network";

export type GrowthParams = {
  /** fraction of a curve traversed per second by sap pulses */
  speed: number;
  proofStatus: ProofStatus;
  settled: boolean;
  /** 0..1 overall activity — feeds canopy brightness + pulse count feel */
  activity: number;
};

/* brand palette, mirrored from globals.css */
const WOOD = new THREE.Color("#241a12");
const SAP_BLUE = new THREE.Vector3(0.09, 0.5, 1.0); // Cardano-blue sap body
const SAP_CREST = new THREE.Vector3(0.62, 0.95, 1.0); // white-cyan crest
const GREEN = new THREE.Color("#20be43");
const GREEN_BRIGHT = new THREE.Color("#3be863");
const GOLD_BRIGHT = new THREE.Color("#e0a33c");

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** ease-out-back: organic settle with a touch of overshoot */
function easeOutBack(t: number, s = 1.12) {
  const x = clamp(t) - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
}

/* ----------------------------------------------------------------
   Growth schedule — maps the single 0..1 scroll progress into three
   overlapping reveal phases. Roots lead (we are descending toward the
   root of trust), canopy follows and overshoots gently.
   ---------------------------------------------------------------- */
type Growth = { root: number; trunk: number; canopy: number; lead: number };
function schedule(p: number): Growth {
  const x = clamp(p);
  // trunk foot/stump is present from the very top (floor 0.14), tops out early
  const trunk = clamp(0.14 + easeOutBack(clamp(x / 0.3), 0.6) * 0.86);
  // roots plunge across the first ~70% of the scroll
  const root = easeOutBack(clamp((x - 0.04) / 0.68), 1.18);
  // canopy reaches up across the back ~65%, finishing with the most overshoot
  const canopy = easeOutBack(clamp((x - 0.32) / 0.6), 1.5);
  // a normalized "newest growth" signal that glows brightest while moving
  const lead = Math.max(root, canopy);
  return { root, trunk, canopy, lead };
}

/* ----------------------------------------------------------------
   Tapered-tube bark material with a base->tip GROWTH reveal.

   The geometry's uv.y runs 0 (base/foot) -> 1 (tip), so discarding
   fragments above `uGrowth` reveals each limb growing outward from
   the trunk. A soft leading edge (uEdge wide) glows cyan as the front
   advances, so the newest wood reads as live, sap-charged tissue.
   ---------------------------------------------------------------- */
type BarkUniforms = {
  uTime: { value: number };
  uGrowth: { value: number };
  uEdgeGlow: { value: number };
  uSap: { value: number };
  uRepeat: { value: THREE.Vector2 };
  uSapBody: { value: THREE.Vector3 };
  uSapCrest: { value: THREE.Vector3 };
};

function makeBarkMaterial(
  maps: {
    diff: THREE.Texture;
    nor: THREE.Texture;
    rough: THREE.Texture;
    ao: THREE.Texture;
  },
  repeat: THREE.Vector2,
): { mat: THREE.MeshStandardMaterial; uniforms: BarkUniforms } {
  const uniforms: BarkUniforms = {
    uTime: { value: 0 },
    uGrowth: { value: 0 },
    uEdgeGlow: { value: 0 },
    uSap: { value: 1 },
    uRepeat: { value: repeat },
    uSapBody: { value: SAP_BLUE.clone() },
    uSapCrest: { value: SAP_CREST.clone() },
  };

  const mat = new THREE.MeshStandardMaterial({
    color: WOOD,
    map: maps.diff,
    normalMap: maps.nor,
    normalScale: new THREE.Vector2(1.05, 1.05),
    roughnessMap: maps.rough,
    roughness: 0.96,
    aoMap: maps.ao,
    aoMapIntensity: 1.05,
    metalness: 0.04,
  });

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec2 vBarkUv;",
      )
      .replace(
        "#include <uv_vertex>",
        "#include <uv_vertex>\n  vBarkUv = uv;",
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vBarkUv;
        uniform float uTime;
        uniform float uGrowth;
        uniform float uEdgeGlow;
        uniform float uSap;
        uniform vec2 uRepeat;
        uniform vec3 uSapBody;
        uniform vec3 uSapCrest;`,
      )
      // hard reveal: discard wood that hasn't grown yet (base->tip)
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        // a hair of dither on the cut so the growing tip doesn't read as a razor line
        float grow = uGrowth + 0.012 * sin(vBarkUv.x * 40.0 + uTime * 2.0);
        if (vBarkUv.y > grow) discard;`,
      )
      // emissive sap veins in the deepest bark cracks + a live leading edge
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // veins ride the recessed grain (roughness map ~ crack depth proxy)
          vec2 buv = vBarkUv * uRepeat;
          float crackProxy = texture2D(roughnessMap, buv).g;
          float crack = pow(1.0 - smoothstep(0.25, 0.6, crackProxy), 1.3);
          float along = vBarkUv.y * 2.4 - uTime * 0.22;
          float crest = pow(0.5 + 0.5 * sin(along * 6.2831), 2.6);
          float veins = crack * (0.08 + 1.0 * crest) * uSap;

          // newest growth glows: a moving front just behind the cut line
          float dist = uGrowth - vBarkUv.y;          // 0 at the front, grows toward base
          float edge = smoothstep(0.16, 0.0, dist) * step(0.0, dist);
          float front = edge * uEdgeGlow;

          vec3 sap = mix(uSapBody, uSapCrest, crest);
          totalEmissiveRadiance += sap * veins;
          totalEmissiveRadiance += mix(uSapBody, uSapCrest, 0.7) * front * 1.6;
        }`,
      );
  };

  return { mat, uniforms };
}

/* shared bark textures (1K WebP, ~1.3MB total) */
function useBarkMaps() {
  const [diff, nor, rough, ao] = useLoader(THREE.TextureLoader, [
    "/textures/bark/oak_diff_1k.webp",
    "/textures/bark/oak_nor_gl_1k.webp",
    "/textures/bark/oak_rough_1k.webp",
    "/textures/bark/oak_ao_1k.webp",
  ]);
  useMemo(() => {
    for (const t of [diff, nor, rough, ao]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    diff.colorSpace = THREE.SRGBColorSpace;
    nor.colorSpace = THREE.NoColorSpace;
    rough.colorSpace = THREE.NoColorSpace;
    ao.colorSpace = THREE.NoColorSpace;
  }, [diff, nor, rough, ao]);
  return { diff, nor, rough, ao };
}

/* ----------------------------------------------------------------
   The growing wood: trunk, roots, canopy. Each region is its own
   merged bark mesh so it can be revealed on its own growth channel.
   ---------------------------------------------------------------- */
function GrowingWood({
  tree,
  growthRef,
  motionOn,
}: {
  tree: Tree;
  growthRef: RefObject<Growth>;
  motionOn: boolean;
}) {
  const maps = useBarkMaps();

  // trunk has tight grain; roots/canopy a little stretched along the limb
  const trunkMat = useMemo(
    () => makeBarkMaterial(cloneMaps(maps, new THREE.Vector2(2.4, 1.6)), new THREE.Vector2(2.4, 1.6)),
    [maps],
  );
  const rootMat = useMemo(
    () => makeBarkMaterial(cloneMaps(maps, new THREE.Vector2(1.6, 4.5)), new THREE.Vector2(1.6, 4.5)),
    [maps],
  );
  const canopyMat = useMemo(
    () => makeBarkMaterial(cloneMaps(maps, new THREE.Vector2(1.8, 3.2)), new THREE.Vector2(1.8, 3.2)),
    [maps],
  );

  // dispose materials + their cloned textures on unmount (geometry uv1 is
  // already authored in buildTree, so no per-mesh setup is needed here)
  useEffect(
    () => () => {
      [trunkMat, rootMat, canopyMat].forEach((m) => {
        (m.mat.map as THREE.Texture | null)?.dispose();
        (m.mat.normalMap as THREE.Texture | null)?.dispose();
        (m.mat.roughnessMap as THREE.Texture | null)?.dispose();
        (m.mat.aoMap as THREE.Texture | null)?.dispose();
        m.mat.dispose();
      });
    },
    [trunkMat, rootMat, canopyMat],
  );

  const t = useRef(0);
  useFrame((_, dt) => {
    if (motionOn) t.current += dt;
    const g = growthRef.current;
    const set = (m: { uniforms: BarkUniforms }, grow: number, lead: number) => {
      m.uniforms.uTime.value = t.current;
      m.uniforms.uGrowth.value = grow;
      // edge glows while the front is advancing; quiet once a region completes
      const advancing = clamp((1 - grow) * 1.4) * lead;
      m.uniforms.uEdgeGlow.value = motionOn ? 0.35 + advancing : 0.25;
    };
    set(trunkMat, g.trunk, 0.4);
    set(rootMat, g.root, 1);
    set(canopyMat, g.canopy, 1);
  });

  return (
    <group>
      <mesh geometry={tree.trunk} material={trunkMat.mat} castShadow={false} />
      {tree.rootBark && (
        <mesh geometry={tree.rootBark} material={rootMat.mat} />
      )}
      {tree.canopyBark && (
        <mesh geometry={tree.canopyBark} material={canopyMat.mat} />
      )}
    </group>
  );
}

function cloneMaps(
  maps: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture; ao: THREE.Texture },
  repeat: THREE.Vector2,
) {
  const c = {
    diff: maps.diff.clone(),
    nor: maps.nor.clone(),
    rough: maps.rough.clone(),
    ao: maps.ao.clone(),
  };
  for (const t of [c.diff, c.nor, c.rough, c.ao]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.copy(repeat);
    t.anisotropy = 8;
    t.needsUpdate = true;
  }
  c.diff.colorSpace = THREE.SRGBColorSpace;
  c.nor.colorSpace = THREE.NoColorSpace;
  c.rough.colorSpace = THREE.NoColorSpace;
  c.ao.colorSpace = THREE.NoColorSpace;
  return c;
}

/* ----------------------------------------------------------------
   Sap pulses — bright cylinders riding each spine, but only along the
   portion that has GROWN. They emerge from the trunk and travel toward
   the freshly-revealed tips (canopy: up, roots: down).
   ---------------------------------------------------------------- */
const UP = new THREE.Vector3(0, 1, 0);
type Drop = { curve: THREE.CatmullRomCurve3; phase: number; kind: "root" | "canopy"; r: number };

function Sap({
  tree,
  growthRef,
  speed,
  motionOn,
  glow,
  activity,
}: {
  tree: Tree;
  growthRef: RefObject<Growth>;
  speed: number;
  motionOn: boolean;
  glow: THREE.Texture;
  activity: number;
}) {
  const drops = useMemo<Drop[]>(() => {
    const rand = mulberry32(99);
    const list: Drop[] = [];
    // a subset of spines carry sap so it stays tasteful, not a swarm
    const rootEvery = 2;
    const canopyEvery = 2;
    tree.rootSpines.forEach((c, i) => {
      if (i % rootEvery !== 0) return;
      list.push({ curve: c, phase: rand(), kind: "root", r: 0.07 });
    });
    tree.canopySpines.forEach((c, i) => {
      if (i % canopyEvery !== 0) return;
      list.push({ curve: c, phase: rand(), kind: "canopy", r: 0.05 });
    });
    return list;
  }, [tree]);

  const groups = useRef<(THREE.Group | null)[]>([]);
  const t = useRef(0);
  const _p = useMemo(() => new THREE.Vector3(), []);
  const _tan = useMemo(() => new THREE.Vector3(), []);
  const _q = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, dt) => {
    if (motionOn) t.current += dt * speed;
    const g = growthRef.current;
    drops.forEach((d, i) => {
      const grp = groups.current[i];
      if (!grp) return;
      const grown = d.kind === "root" ? g.root : g.canopy;
      // sap only exists where wood exists; ride 0..grown
      if (grown < 0.06) {
        grp.visible = false;
        return;
      }
      grp.visible = true;
      const f = ((t.current + d.phase) % 1) * grown; // base -> current front
      d.curve.getPointAt(clamp(f, 0, 0.999), _p);
      d.curve.getTangentAt(clamp(f, 0, 0.999), _tan);
      _q.setFromUnitVectors(UP, _tan);
      grp.position.copy(_p);
      grp.quaternion.copy(_q);
      // fade in near the trunk, fade out at the live tip
      const head = f / Math.max(grown, 1e-3);
      const a = smooth(clamp(head / 0.12)) * (1 - smooth(clamp((head - 0.86) / 0.14)));
      grp.scale.setScalar(0.7 + a * 0.5);
    });
  });

  const sapColor = activity > 0.6 ? GREEN_BRIGHT : GREEN;

  return (
    <>
      {drops.map((d, i) => (
        <group
          key={i}
          visible={false}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <mesh>
            <cylinderGeometry args={[d.r * 0.55, d.r * 0.55, 0.26, 8]} />
            <meshBasicMaterial color="#eafff6" toneMapped={false} />
          </mesh>
          <sprite scale={[d.r * 4.2, 0.42, 1]}>
            <spriteMaterial
              map={glow}
              color={d.kind === "root" ? "#5ad0ff" : sapColor}
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

/* ----------------------------------------------------------------
   Canopy leaves — instanced glowing planes that scale in as the
   canopy completes. They pop near the very end of the growth.
   ---------------------------------------------------------------- */
function useLeafTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 64);
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

function Leaves({
  leaves,
  tex,
  growthRef,
  activity,
  motionOn,
}: {
  leaves: Leaf[];
  tex: THREE.Texture;
  growthRef: RefObject<Growth>;
  activity: number;
  motionOn: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // per-leaf reveal threshold so the canopy fills in, not all at once
  const order = useMemo(() => {
    const rand = mulberry32(321);
    return leaves.map(() => 0.55 + rand() * 0.45);
  }, [leaves]);
  const baseScale = useMemo(() => leaves.map((l) => l.scale), [leaves]);

  // colour is static; matrices update with growth. Seed matrices at zero-scale
  // so leaves don't flash at the origin for the first frame before useFrame.
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const color = new THREE.Color();
    leaves.forEach((lf, i) => {
      const light = 0.34 + lf.tint * 0.14 + activity * 0.08;
      color.setHSL(0.34 - lf.tint * 0.1, 0.82, clamp(light, 0, 0.58));
      m.setColorAt(i, color);
      dummy.position.copy(lf.pos);
      dummy.rotation.set(lf.rotZ, lf.rotY, 0);
      dummy.scale.setScalar(1e-4);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [leaves, activity, dummy]);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const canopy = growthRef.current.canopy;
    const breeze = motionOn ? state.clock.elapsedTime : 0;
    leaves.forEach((lf, i) => {
      // reveal once canopy growth passes this leaf's threshold
      const k = smooth(clamp((canopy - order[i]) / 0.18));
      const s = baseScale[i] * k;
      dummy.position.copy(lf.pos);
      dummy.rotation.set(lf.rotZ, lf.rotY, 0);
      dummy.scale.setScalar(Math.max(s, 1e-4));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (group.current) {
      group.current.rotation.z = Math.sin(breeze * 0.35) * 0.018;
      group.current.rotation.x = Math.cos(breeze * 0.27) * 0.014;
    }
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
        />
      </instancedMesh>
    </group>
  );
}

/* ----------------------------------------------------------------
   Cardano L1 bedrock anchors — glowing settlement blocks at the
   deepest root tips. They ignite as the roots finish reaching them.
   ---------------------------------------------------------------- */
function L1Anchors({
  anchors,
  growthRef,
  settled,
  motionOn,
  glow,
}: {
  anchors: THREE.Vector3[];
  growthRef: RefObject<Growth>;
  settled: boolean;
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const blocks = useMemo(() => {
    const deepest = [...anchors].sort((a, b) => a.y - b.y).slice(0, 11);
    const rand = mulberry32(55);
    return deepest.map((p, i) => ({
      pos: p,
      size: 0.42 + (i % 3) * 0.14,
      bright: i % 4 === 0,
      phase: rand() * 6.28,
      // deeper tips ignite slightly later
      reveal: 0.72 + rand() * 0.24,
    }));
  }, [anchors]);

  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const sprites = useRef<THREE.Sprite[]>([]);
  const groups = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = motionOn ? state.clock.elapsedTime : 0;
    const root = growthRef.current.root;
    blocks.forEach((b, i) => {
      const k = smooth(clamp((root - b.reveal) / 0.2));
      const grp = groups.current[i];
      if (grp) {
        grp.scale.setScalar(Math.max(k, 1e-3));
        grp.visible = k > 0.01;
      }
      const m = mats.current[i];
      if (m) {
        const base = (settled ? 2.0 : 1.2) * k;
        m.emissiveIntensity = base + (motionOn ? Math.sin(t * 1.6 + b.phase) * 0.4 * k : 0);
      }
      const sp = sprites.current[i];
      if (sp) {
        (sp.material as THREE.SpriteMaterial).opacity = (settled ? 0.6 : 0.34) * k;
      }
    });
  });

  return (
    <group>
      {blocks.map((b, i) => (
        <group
          key={i}
          position={[b.pos.x, b.pos.y, b.pos.z]}
          scale={0}
          visible={false}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
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
          <sprite
            scale={[b.size * 4, b.size * 4, 1]}
            ref={(el) => {
              if (el) sprites.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glow}
              color={b.bright ? "#6fe0ff" : "#2f9cff"}
              transparent
              opacity={0.32}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/* ----------------------------------------------------------------
   Seed — a small gold ember at the trunk foot, the origin of growth.
   Brightest at the top of the page, dimming as the tree takes over.
   ---------------------------------------------------------------- */
function Seed({
  growthRef,
  motionOn,
  glow,
}: {
  growthRef: RefObject<Growth>;
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  useFrame((state) => {
    const g = growthRef.current;
    const pulse = motionOn ? 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.4) : 0.6;
    // ember fades as the canopy establishes
    const life = 1 - smooth(clamp((g.canopy - 0.2) / 0.6)) * 0.7;
    if (core.current) {
      const m = core.current.material as THREE.MeshBasicMaterial;
      m.opacity = (0.5 + pulse * 0.4) * life;
    }
    if (halo.current) {
      (halo.current.material as THREE.SpriteMaterial).opacity = (0.4 + pulse * 0.3) * life;
      const s = 1.6 + pulse * 0.3;
      halo.current.scale.set(s, s, 1);
    }
  });
  return (
    <group position={[0, LAYOUT.groundY + 0.05, 0]}>
      <mesh ref={core}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#ffd98a" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <sprite ref={halo} scale={[1.7, 1.7, 1]}>
        <spriteMaterial
          map={glow}
          color={GOLD_BRIGHT}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ----------------------------------------------------------------
   Camera rig — descends from the canopy toward the roots as the user
   scrolls, reinforcing the downward growth. Smoothed with critically-
   damped lerp; subtle pointer parallax (window-level, canvas is
   pointer-events:none). The tree is offset right so hero copy on the
   left stays clear.
   ---------------------------------------------------------------- */
type Stop = { p: number; pos: THREE.Vector3; look: THREE.Vector3 };
const STOPS: Stop[] = [
  { p: 0.0, pos: new THREE.Vector3(0.4, 4.2, 19.5), look: new THREE.Vector3(1.6, 2.4, 0) },
  { p: 0.34, pos: new THREE.Vector3(1.8, 0.6, 16.5), look: new THREE.Vector3(2.6, -0.4, 0) },
  { p: 0.7, pos: new THREE.Vector3(1.4, -4.6, 16.0), look: new THREE.Vector3(2.8, -5.4, 0) },
  { p: 1.0, pos: new THREE.Vector3(2.6, 1.4, 18.5), look: new THREE.Vector3(2.8, 0.2, 0) },
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

// a calm framing that shows the whole grown tree at once (reduced-motion)
const STATIC_POS = new THREE.Vector3(2.2, -0.6, 21);
const STATIC_LOOK = new THREE.Vector3(2.6, -1.2, 0);

function Rig({
  progressRef,
  motionOn,
}: {
  progressRef: RefObject<number>;
  motionOn: boolean;
}) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(1.6, 2.4, 0));
  const tPos = useRef(new THREE.Vector3());
  const tLook = useRef(new THREE.Vector3());
  const ptr = usePointerParallax(motionOn);

  useFrame((_, dt) => {
    if (!motionOn) {
      // single static frame: snap to the whole-tree framing, no parallax
      camera.position.copy(STATIC_POS);
      camera.lookAt(STATIC_LOOK);
      return;
    }
    sampleCam(progressRef.current ?? 0, tPos.current, tLook.current);
    tPos.current.x += ptr.current.x * 0.55;
    tPos.current.y += ptr.current.y * 0.32;
    const k = 1 - Math.pow(0.0026, dt);
    camera.position.lerp(tPos.current, k);
    look.current.lerp(tLook.current, k);
    camera.lookAt(look.current);
  });
  return null;
}

/* ----------------------------------------------------------------
   Scene assembly + growth driver
   ---------------------------------------------------------------- */
const TREE_OFFSET_X = 3.4;
const TREE_SCALE = 0.62;
const GROUP_Y = 0.2;

function SceneContents({
  params,
  progressRef,
  motionOn,
}: {
  params: GrowthParams;
  progressRef: RefObject<number>;
  motionOn: boolean;
}) {
  const tree = useMemo(() => buildTree(7), []);
  const glow = useGlowTexture();
  const leafTex = useLeafTexture();

  // single smoothed growth state, advanced every frame from the scroll ref.
  // smoothing the scroll value adds the organic "settle" lag.
  const growthRef = useRef<Growth>(
    // reduced-motion: start fully established so the one painted frame is a
    // complete, legible tree rather than a bare stump
    motionOn ? { root: 0, trunk: 0, canopy: 0, lead: 0 } : schedule(1),
  );
  const smoothedP = useRef(motionOn ? 0 : 1);

  useFrame((_, dt) => {
    // reduced motion: hold a static, fully-grown framing (no scroll reveal)
    if (!motionOn) {
      const g = schedule(1);
      growthRef.current.root = g.root;
      growthRef.current.trunk = g.trunk;
      growthRef.current.canopy = g.canopy;
      growthRef.current.lead = 0;
      return;
    }
    const target = clamp(progressRef.current ?? 0);
    // critically-damped follow so fast scrolls still feel like growth, not teleport
    const k = 1 - Math.pow(0.0009, dt);
    smoothedP.current += (target - smoothedP.current) * k;
    const g = schedule(smoothedP.current);
    growthRef.current.root = g.root;
    growthRef.current.trunk = g.trunk;
    growthRef.current.canopy = g.canopy;
    growthRef.current.lead = g.lead;
  });

  return (
    <>
      <fog attach="fog" args={["#04080c", 13, 50]} />
      <ambientLight intensity={0.4} color="#8fa6b6" />
      <Rig progressRef={progressRef} motionOn={motionOn} />

      <group position={[TREE_OFFSET_X, 0, 0]}>
        <pointLight position={[2, 5, 6]} intensity={22} color="#bfe0ff" distance={42} />
        <pointLight position={[-2, -5, 4]} intensity={16} color="#37c0ff" distance={32} />
        <pointLight position={[0, -8, 2]} intensity={11} color="#3aa0ff" distance={24} />
        <pointLight position={[-3, 3, 3]} intensity={6} color="#e0a33c" distance={22} />
        <directionalLight position={[2, 6, 10]} intensity={0.8} color="#cfe0ea" />
        <directionalLight position={[-4, 2, 6]} intensity={0.4} color="#bcc9d6" />

        <group scale={TREE_SCALE} position={[0, GROUP_Y, 0]}>
          <Suspense fallback={null}>
            <GrowingWood tree={tree} growthRef={growthRef} motionOn={motionOn} />
          </Suspense>
          <Sap
            tree={tree}
            growthRef={growthRef}
            speed={params.speed}
            motionOn={motionOn}
            glow={glow}
            activity={params.activity}
          />
          <Leaves
            leaves={tree.leaves}
            tex={leafTex}
            growthRef={growthRef}
            activity={params.activity}
            motionOn={motionOn}
          />
          <L1Anchors
            anchors={tree.l1Anchors}
            growthRef={growthRef}
            settled={params.settled}
            motionOn={motionOn}
            glow={glow}
          />
          <Seed growthRef={growthRef} motionOn={motionOn} glow={glow} />
        </group>
      </group>

      <PostFX
        bloomIntensity={0.95}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.22}
        radius={0.72}
      />
    </>
  );
}

/* ---- low-power / no-WebGL detection (mirrors AmbientDepth) ---- */
function canUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return false;
  } catch {
    return false;
  }
  const cores = navigator.hardwareConcurrency ?? 8;
  return cores > 2;
}

/* CSS-only fallback: a static brand-tinted backdrop that still reads as the
   world-tree's canopy glow above and root glow below. No canvas, no scroll
   work — used on minimal hardware / when WebGL is unavailable. */
function StaticFallback() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 78% at 64% -6%, rgba(32,190,67,0.16), transparent 56%)," +
          "radial-gradient(90% 70% at 70% 112%, rgba(58,160,255,0.12), transparent 60%)," +
          "radial-gradient(60% 50% at 72% 60%, rgba(207,154,46,0.08), transparent 70%)," +
          "#060d09",
      }}
    />
  );
}

export default function GrowthTreeScene({
  params,
  progressRef,
  motionOn,
}: {
  params: GrowthParams;
  progressRef: RefObject<number>;
  motionOn: boolean;
}) {
  const webgl = useMemo(() => canUseWebGL(), []);
  if (!webgl) return <StaticFallback />;

  return (
    <Canvas
      // continuous flow while motion is on; a single held frame under reduced
      // motion (the growth reveal pauses to a static, fully-grown tree)
      frameloop={motionOn ? "always" : "demand"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.4, 4.2, 19.5], fov: 46, near: 0.1, far: 120 }}
    >
      <SceneContents params={params} progressRef={progressRef} motionOn={motionOn} />
    </Canvas>
  );
}
