"use client";

/* eslint-disable react-hooks/immutability -- Three.js textures, uniforms, instanced attributes and vector refs are mutable renderer state mutated in the render loop by design. */

/* ============================================================
   JourneyScene — the FLAGSHIP "ride a transaction through Midgard"
   hero. The world-tree is fully present from the first frame; the
   JOURNEY is the camera DESCENDING canopy -> roots while a single
   transaction is born, sequenced, batched, sent down the trunk, and
   SETTLED into the Cardano L1 bedrock.

   Scroll (a smoothed 0..1 `progressRef`, fed by useSpring upstream)
   drives five overlapping beats:

     0.00  SUBMITTED · L2  — many luminous tx sparks ping around the
                            canopy: fast, lively, slightly scattered.
     ~0.25 SEQUENCED      — an operator gathers the sparks into an
                            ordered queue (a neat descending line).
     ~0.45 BATCHED        — the queue packs into one glowing block of
                            light (the batch).
     ~0.62 DESCENDING     — the batch travels DOWN the trunk, camera
                            following it toward settlement.
     ~0.86 SETTLED · L1   — the packet reaches the cobalt crystalline
                            bedrock at the roots and locks in with a
                            confirmation pulse.

   Green/gold = Midgard L2. Cobalt = Cardano L1, the root of trust.

   Heavy scene, so: instanced particles, dpr cap, frameloop paused
   under reduced motion (single composed frame), lighter on mobile,
   all GPU resources disposed on unmount. Cursor-reactive: canopy
   sparks are gently drawn toward the pointer (a "live" feel) and the
   camera carries subtle pointer parallax.
   ============================================================ */

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { MOTION_SPEED } from "@/lib/motionConfig";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { buildTree, LAYOUT, type Tree, type Leaf } from "./treeGeometry";
import { mulberry32, useGlowTexture, usePointerParallax } from "./sceneTokens";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { ProofStatus } from "@/lib/network";

export type JourneyParams = {
  /** fraction of a curve traversed per second by ambient sap pulses */
  speed: number;
  proofStatus: ProofStatus;
  settled: boolean;
  /** 0..1 overall activity — feeds canopy brightness + spark liveliness */
  activity: number;
};

/* brand palette, mirrored from globals.css */
const WOOD = new THREE.Color("#241a12");
const SAP_BLUE = new THREE.Vector3(0.09, 0.5, 1.0); // Cardano-blue sap body
const SAP_CREST = new THREE.Vector3(0.62, 0.95, 1.0); // white-cyan crest
const GREEN_BRIGHT = new THREE.Color("#3be863");
const GOLD_BRIGHT = new THREE.Color("#e0a33c");
const COBALT = new THREE.Color("#2f9cff");
const COBALT_BRIGHT = new THREE.Color("#6fe0ff");

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = THREE.MathUtils.lerp;
/** ease-in-out cubic for beat envelopes */
function easeInOut(t: number) {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/* ----------------------------------------------------------------
   Beat schedule — overlapping windows derived from one 0..1 scroll.
   Each value is a 0..1 envelope for that beat's contribution.
   ---------------------------------------------------------------- */
export type Beats = {
  p: number; // raw smoothed progress
  submit: number; // canopy sparks scattering & pinging (peaks early)
  sequence: number; // gather into an ordered queue
  batch: number; // pack the queue into one block
  descend: number; // the batch travels down the trunk
  settle: number; // confirmation at the roots
  /** index 0..4 of the dominant beat, for HUD/label sync */
  chapter: number;
};

function beatsFromProgress(p: number): Beats {
  const x = clamp(p);
  // submit: full at top, fades as sequencing takes over
  const submit = 1 - smooth(clamp((x - 0.08) / 0.2));
  // sequence: rises ~0.16, holds, releases into batch
  const sequence = smooth(clamp((x - 0.14) / 0.16)) * (1 - smooth(clamp((x - 0.42) / 0.12)));
  // batch: the moment the queue compacts
  const batch = smooth(clamp((x - 0.4) / 0.12)) * (1 - smooth(clamp((x - 0.66) / 0.12)));
  // descend: the packet's trip down the trunk
  const descend = easeInOut(clamp((x - 0.58) / 0.26));
  // settle: confirmation lock-in at the roots
  const settle = smooth(clamp((x - 0.84) / 0.14));

  let chapter = 0;
  if (x >= 0.84) chapter = 4;
  else if (x >= 0.58) chapter = 3;
  else if (x >= 0.4) chapter = 2;
  else if (x >= 0.14) chapter = 1;
  return { p: x, submit, sequence, batch, descend, settle, chapter };
}

/* ================================================================
   BARK — full tree, present from frame one. Rich PBR oak with
   emissive sap veins in the grain + a soft rim, plus a travelling
   "charge" band the batch leaves as it descends the trunk.
   ================================================================ */
type BarkUniforms = {
  uTime: { value: number };
  uSap: { value: number };
  uRepeat: { value: THREE.Vector2 };
  uSapBody: { value: THREE.Vector3 };
  uSapCrest: { value: THREE.Vector3 };
  /** 0..1 position of the descending charge along uv.y (trunk only) */
  uCharge: { value: number };
  /** strength of that charge band */
  uChargeAmt: { value: number };
  uChargeColor: { value: THREE.Vector3 };
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
    uSap: { value: 1 },
    uRepeat: { value: repeat },
    uSapBody: { value: SAP_BLUE.clone() },
    uSapCrest: { value: SAP_CREST.clone() },
    uCharge: { value: -1 },
    uChargeAmt: { value: 0 },
    uChargeColor: { value: new THREE.Vector3(0.62, 0.95, 1.0) },
  };

  const mat = new THREE.MeshStandardMaterial({
    color: WOOD,
    map: maps.diff,
    normalMap: maps.nor,
    normalScale: new THREE.Vector2(1.15, 1.15),
    roughnessMap: maps.rough,
    roughness: 0.95,
    aoMap: maps.ao,
    aoMapIntensity: 1.1,
    metalness: 0.05,
  });

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vBarkUv;\nvarying vec3 vBarkNormal;\nvarying vec3 vBarkView;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\n  vBarkUv = uv;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vBarkNormal = normalize(mat3(modelMatrix) * objectNormal);
        vBarkView = normalize(cameraPosition - (modelMatrix * vec4(transformed, 1.0)).xyz);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vBarkUv;
        varying vec3 vBarkNormal;
        varying vec3 vBarkView;
        uniform float uTime;
        uniform float uSap;
        uniform vec2 uRepeat;
        uniform vec3 uSapBody;
        uniform vec3 uSapCrest;
        uniform float uCharge;
        uniform float uChargeAmt;
        uniform vec3 uChargeColor;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // sap veins ride the recessed grain (roughness map ~ crack depth proxy)
          vec2 buv = vBarkUv * uRepeat;
          float crackProxy = texture2D(roughnessMap, buv).g;
          float crack = pow(1.0 - smoothstep(0.25, 0.62, crackProxy), 1.3);
          float along = vBarkUv.y * 2.4 - uTime * 0.2;
          float crest = pow(0.5 + 0.5 * sin(along * 6.2831), 2.6);
          float veins = crack * (0.06 + 0.9 * crest) * uSap;
          vec3 sap = mix(uSapBody, uSapCrest, crest);
          totalEmissiveRadiance += sap * veins;

          // cool rim light — catches the canopy/root silhouette out of the dark
          float rim = pow(1.0 - max(dot(vBarkNormal, vBarkView), 0.0), 2.4);
          totalEmissiveRadiance += vec3(0.10, 0.20, 0.34) * rim * 0.55;

          // travelling charge band the descending batch leaves on the trunk
          float band = smoothstep(0.085, 0.0, abs(vBarkUv.y - uCharge));
          totalEmissiveRadiance += uChargeColor * band * uChargeAmt;
        }`,
      );
  };

  return { mat, uniforms };
}

/* shared bark textures (1K WebP) */
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

/** The whole tree's bark — present always. Trunk carries the charge band. */
function Bark({
  tree,
  beatsRef,
  motionOn,
}: {
  tree: Tree;
  beatsRef: RefObject<Beats>;
  motionOn: boolean;
}) {
  const maps = useBarkMaps();

  const trunkMat = useMemo(
    () => makeBarkMaterial(cloneMaps(maps, new THREE.Vector2(2.4, 1.7)), new THREE.Vector2(2.4, 1.7)),
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
    // MOTION_SPEED applied ONCE at the frame boundary (ambient shader clock).
    if (motionOn) t.current += dt * MOTION_SPEED;
    const b = beatsRef.current;
    [trunkMat, rootMat, canopyMat].forEach((m) => {
      m.uniforms.uTime.value = t.current;
    });
    // descend beat lights a band that rides DOWN the trunk (uv.y 1->0)
    trunkMat.uniforms.uCharge.value = 1 - b.descend;
    trunkMat.uniforms.uChargeAmt.value = (b.descend > 0 && b.descend < 1 ? 1 : 0) * 2.4;
    // roots flush cobalt as settlement lands
    rootMat.uniforms.uChargeColor.value.set(0.42, 0.78, 1.0);
    rootMat.uniforms.uCharge.value = lerp(0.0, 0.85, b.descend); // front reaching down the roots
    rootMat.uniforms.uChargeAmt.value = b.settle * 2.0 + (b.descend > 0.7 ? (b.descend - 0.7) * 3.0 : 0);
  });

  return (
    <group>
      <mesh geometry={tree.trunk} material={trunkMat.mat} />
      {tree.rootBark && <mesh geometry={tree.rootBark} material={rootMat.mat} />}
      {tree.canopyBark && <mesh geometry={tree.canopyBark} material={canopyMat.mat} />}
    </group>
  );
}

/* ================================================================
   AMBIENT SAP — slow green/gold pulses riding the limbs, the tree's
   baseline "alive" signal beneath the transaction story. Instanced.
   ================================================================ */
type SapDot = { curve: THREE.CatmullRomCurve3; phase: number; kind: "root" | "canopy" };

function AmbientSap({
  tree,
  speed,
  motionOn,
  glow,
  count,
}: {
  tree: Tree;
  speed: number;
  motionOn: boolean;
  glow: THREE.Texture;
  count: number;
}) {
  const dots = useMemo<SapDot[]>(() => {
    const rand = mulberry32(99);
    const list: SapDot[] = [];
    const every = count > 26 ? 2 : 3;
    tree.canopySpines.forEach((c, i) => {
      if (i % every === 0) list.push({ curve: c, phase: rand(), kind: "canopy" });
    });
    tree.rootSpines.forEach((c, i) => {
      if (i % every === 0) list.push({ curve: c, phase: rand(), kind: "root" });
    });
    return list.slice(0, count);
  }, [tree, count]);

  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const _p = useMemo(() => new THREE.Vector3(), []);
  const t = useRef(0);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    dots.forEach((d, i) => {
      color.copy(d.kind === "root" ? COBALT : GREEN_BRIGHT);
      m.setColorAt(i, color);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dots]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    if (motionOn) t.current += dt * speed * MOTION_SPEED;
    dots.forEach((d, i) => {
      const f = (t.current + d.phase) % 1;
      d.curve.getPointAt(clamp(f, 0, 0.999), _p);
      const head = f;
      const a = smooth(clamp(head / 0.1)) * (1 - smooth(clamp((head - 0.85) / 0.15)));
      dummy.position.copy(_p);
      // larger, calmer motes — each reads as a deliberate light (was 0.04 + a*0.07)
      dummy.scale.setScalar(Math.max(0.07 + a * 0.12, 1e-3));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, dots.length]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        map={glow}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ================================================================
   THE TRANSACTION SPARKS — the narrative core. N instanced sparks
   that:
     submit  : ping around scattered canopy slots (cursor-attracted)
     sequence: ease into an ordered vertical queue near the fork
     batch   : compress to a tight cluster (the block of light)
     descend : ride the trunk spine down as that one packet
     settle  : land at a root tip / L1 anchor and lock
   One instanced mesh; per-spark target computed each frame from the
   beat envelopes. This is the "thousands of particles" RESN feel,
   perf-capped to `count`.
   ================================================================ */
function TxSparks({
  tree,
  beatsRef,
  pointerRef,
  motionOn,
  glow,
  count,
  activity,
}: {
  tree: Tree;
  beatsRef: RefObject<Beats>;
  pointerRef: RefObject<{ x: number; y: number }>;
  motionOn: boolean;
  glow: THREE.Texture;
  count: number;
  activity: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // per-spark deterministic data: a scatter home in the canopy, an order
  // slot in the queue, a phase for pinging, and a settle target at a root.
  const data = useMemo(() => {
    const rand = mulberry32(2024);
    const canopyC = tree.canopy.center;
    const anchors = [...tree.l1Anchors];
    return new Array(count).fill(0).map((_, i) => {
      // scatter home: around the canopy volume
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const rad = tree.canopy.radius * (0.45 + rand() * 0.6);
      const home = new THREE.Vector3(
        canopyC.x + rad * Math.sin(phi) * Math.cos(theta),
        canopyC.y + rad * Math.cos(phi) * 0.7 + rand() * 1.4,
        canopyC.z + rad * Math.sin(phi) * Math.sin(theta),
      );
      // ordered queue slot: a neat vertical line just above the fork
      const slot = i / Math.max(count - 1, 1);
      const queue = new THREE.Vector3(
        Math.sin(slot * 6.0) * 0.18,
        LAYOUT.trunkTopY + 2.6 - slot * 3.0,
        Math.cos(slot * 6.0) * 0.18,
      );
      // settle target: spread across the deepest L1 anchors
      const anchor = anchors.length
        ? anchors[i % anchors.length].clone().add(
            new THREE.Vector3((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.4, (rand() - 0.5) * 0.6),
          )
        : new THREE.Vector3(0, LAYOUT.rootTipY, 0);
      return {
        home,
        queue,
        anchor,
        phase: rand() * Math.PI * 2,
        freq: 0.6 + rand() * 1.1,
        amp: 0.5 + rand() * 0.8,
        wobble: rand() * Math.PI * 2,
        // each spark joins the queue at a slightly different time -> a "gathering" feel
        joinDelay: rand() * 0.4,
        scale: 0.1 + rand() * 0.08, // ~1.7x larger sparks (was 0.06 + rand()*0.05)
      };
    });
  }, [tree, count]);

  // batch centre rides the trunk spine on descend; precompute trunk samples
  const trunkAt = useMemo(() => {
    const v = new THREE.Vector3();
    return (f: number, out: THREE.Vector3) => {
      tree.trunkSpine.getPointAt(clamp(f, 0, 0.999), v);
      out.copy(v);
      return out;
    };
  }, [tree]);

  const _scatter = useMemo(() => new THREE.Vector3(), []);
  const _target = useMemo(() => new THREE.Vector3(), []);
  const _batchCenter = useMemo(() => new THREE.Vector3(), []);
  const _batchTarget = useMemo(() => new THREE.Vector3(), []);
  const _ptrWorld = useMemo(() => new THREE.Vector3(), []);
  const positions = useMemo(
    () => data.map((d) => d.home.clone()),
    [data],
  );
  const t = useRef(0);

  // colour: green/gold while on L2, shifting cobalt as it settles to L1
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    data.forEach((_, i) => {
      color.copy(i % 5 === 0 ? GOLD_BRIGHT : GREEN_BRIGHT);
      m.setColorAt(i, color);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data]);

  const _col = useMemo(() => new THREE.Color(), []);
  const _l2col = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const b = beatsRef.current;
    // MOTION_SPEED applied ONCE here — ping freqs below are sim-rad/s.
    if (motionOn) t.current += dt * MOTION_SPEED;
    const time = t.current;

    // batch centre: above the fork while batching, then down the trunk
    if (b.descend > 0) {
      trunkAt(1 - b.descend, _batchCenter);
    } else {
      _batchCenter.set(0, LAYOUT.trunkTopY + 1.0, 0);
    }

    // cursor in a loose canopy-plane world position for spark attraction
    const ptr = pointerRef.current;
    _ptrWorld.set(
      ptr.x * tree.canopy.radius * 1.1 + tree.canopy.center.x,
      ptr.y * tree.canopy.radius * 0.8 + tree.canopy.center.y + 1.0,
      tree.canopy.radius * 0.4,
    );

    const settleColShift = b.settle; // 0..1 to cobalt
    const k = 1 - Math.pow(0.0001, dt); // smoothing toward target each frame

    for (let i = 0; i < data.length; i++) {
      const d = data[i];

      // --- SUBMIT: lively ping around the scatter home, drawn to cursor ---
      const ox = Math.sin(time * d.freq + d.phase) * d.amp;
      const oy = Math.sin(time * d.freq * 0.7 + d.wobble) * d.amp * 0.7;
      const oz = Math.cos(time * d.freq * 0.9 + d.phase) * d.amp;
      _scatter.copy(d.home);
      _scatter.x += ox;
      _scatter.y += oy;
      _scatter.z += oz;
      // cursor attraction (only meaningful while submit beat is hot)
      if (motionOn && b.submit > 0.05) {
        const pull = b.submit * 0.18;
        _scatter.x = lerp(_scatter.x, _ptrWorld.x, pull * (0.4 + 0.6 * Math.sin(d.phase + time)));
        _scatter.y = lerp(_scatter.y, _ptrWorld.y, pull * 0.6);
      }

      // FORWARD-ONLY pipeline: each stage ramps 0->1 over its window and HOLDS,
      // so a spark commits home -> queue -> batch -> (rides trunk) -> anchor and
      // never reverts. Stage amounts are monotonic in raw progress b.p.
      // sequence: gather into the ordered queue (staggered by joinDelay)
      const seqAmt = smooth(
        clamp((b.p - 0.14 - d.joinDelay * 0.06) / 0.18),
      );
      // batch: compress the queue into the tight block
      const batchAmt = smooth(clamp((b.p - 0.4) / 0.12));
      // settle: lock onto the L1 anchor
      const settleAmt = smooth(clamp((b.p - 0.84) / 0.14));

      const slot = i / Math.max(data.length - 1, 1);
      const batchOffset = 0.34;
      // batch cluster target rides _batchCenter (above fork -> down the trunk)
      _batchTarget.set(
        _batchCenter.x + Math.sin(slot * 30.0) * batchOffset,
        _batchCenter.y + (slot - 0.5) * 2 * batchOffset,
        _batchCenter.z + Math.cos(slot * 30.0) * batchOffset,
      );

      // home -> queue -> batch(=packet, which is already travelling down)
      _target.lerpVectors(_scatter, d.queue, seqAmt);
      _target.lerp(_batchTarget, batchAmt);
      // -> settle onto the assigned anchor
      _target.lerp(d.anchor, settleAmt);

      // smoothed integrate (gives weighty inertia even on fast scroll)
      const p = positions[i];
      if (motionOn) {
        p.lerp(_target, k);
      } else {
        p.copy(_target);
      }

      dummy.position.copy(p);
      // scale: a touch bigger while packed (dense block), settle pop
      const s =
        d.scale *
        (1 + batchAmt * (1 - settleAmt) * 0.5 + settleAmt * 0.6 +
          (motionOn ? 0.08 * Math.sin(time * 1.4 + d.phase) : 0)); // calm shimmer (~1.0 rad/s effective; was 4)
      dummy.scale.setScalar(Math.max(s, 1e-3));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      // colour: L2 green/gold -> cobalt on settle
      _l2col.copy(i % 5 === 0 ? GOLD_BRIGHT : GREEN_BRIGHT);
      _col.copy(_l2col).lerp(COBALT_BRIGHT, settleColShift);
      m.setColorAt(i, _col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    // bump material brightness with overall activity
    (m.material as THREE.MeshBasicMaterial).opacity = 0.85 + activity * 0.15;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial
        map={glow}
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ================================================================
   BATCH CORE — a single bright crystalline cube that materialises as
   the sparks compress (batch beat), rides the trunk down (descend),
   and dissolves into the bedrock as settlement lands. The literal
   "block of light".
   ================================================================ */
function BatchCore({
  tree,
  beatsRef,
  motionOn,
  glow,
}: {
  tree: Tree;
  beatsRef: RefObject<Beats>;
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const _p = useMemo(() => new THREE.Vector3(), []);
  const t = useRef(0);

  useFrame((_, dt) => {
    if (motionOn) t.current += dt * MOTION_SPEED;
    const b = beatsRef.current;
    const g = group.current;
    if (!g) return;
    // position: above fork while batching -> down trunk on descend -> sink at settle
    if (b.descend > 0) {
      tree.trunkSpine.getPointAt(clamp(1 - b.descend, 0, 0.999), _p);
    } else {
      _p.set(0, LAYOUT.trunkTopY + 1.0, 0);
    }
    // dip below the foot into the roots as it settles
    _p.y = lerp(_p.y, LAYOUT.rootTipY * 0.45, b.settle);
    g.position.copy(_p);

    // visibility/scale: monotonic — materialises as the batch forms, holds the
    // whole descent, shrinks as it sinks into the bedrock on settle.
    const appear = smooth(clamp((b.p - 0.42) / 0.1));
    const present = clamp(appear - b.settle * 0.9);
    const s = present * 0.55;
    g.scale.setScalar(Math.max(s, 1e-4));
    g.visible = present > 0.02;
    if (core.current) {
      core.current.rotation.x = t.current * 0.6;
      core.current.rotation.y = t.current * 0.8;
      const m = core.current.material as THREE.MeshStandardMaterial;
      // green/gold while on the trunk, cobalt as it sinks to L1
      m.emissive.copy(GREEN_BRIGHT).lerp(COBALT_BRIGHT, clamp(b.descend * 0.5 + b.settle));
      m.emissiveIntensity = 2.2 + (motionOn ? Math.sin(t.current * 1.2) * 0.3 : 0); // ~0.84 rad/s effective (was 3)
    }
    if (halo.current) {
      const sm = halo.current.material as THREE.SpriteMaterial;
      sm.opacity = present * 0.7;
      sm.color.copy(GREEN_BRIGHT).lerp(COBALT_BRIGHT, clamp(b.descend * 0.5 + b.settle));
      const hs = 3.2 + (motionOn ? Math.sin(t.current * 1.0) * 0.3 : 0); // ~0.7 rad/s effective (was 2.4)
      halo.current.scale.set(hs, hs, 1);
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={core}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0a1c12"
          emissive={GREEN_BRIGHT}
          emissiveIntensity={2.2}
          metalness={0.6}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      <sprite ref={halo} scale={[3.2, 3.2, 1]}>
        <spriteMaterial
          map={glow}
          color={GREEN_BRIGHT}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ================================================================
   CANOPY LEAVES — instanced glowing planes, present always, breathing
   in the breeze. Brighten subtly with activity.
   ================================================================ */
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
      const light = 0.32 + lf.tint * 0.14 + activity * 0.08;
      color.setHSL(0.34 - lf.tint * 0.1, 0.82, clamp(light, 0, 0.56));
      m.setColorAt(i, color);
      dummy.position.copy(lf.pos);
      dummy.rotation.set(lf.rotZ, lf.rotY, 0);
      dummy.scale.setScalar(lf.scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [leaves, activity, dummy]);

  useFrame((state) => {
    if (!motionOn) return;
    const breeze = state.clock.elapsedTime * MOTION_SPEED;
    if (group.current) {
      group.current.rotation.z = Math.sin(breeze * 0.35) * 0.02;
      group.current.rotation.x = Math.cos(breeze * 0.27) * 0.015;
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

/* ================================================================
   L1 BEDROCK — cobalt crystalline settlement blocks at the deepest
   root tips. Present (dim) always; they IGNITE with a confirmation
   pulse as the packet settles (settle beat). "The root of trust."
   ================================================================ */
function L1Bedrock({
  anchors,
  beatsRef,
  settled,
  motionOn,
  glow,
}: {
  anchors: THREE.Vector3[];
  beatsRef: RefObject<Beats>;
  settled: boolean;
  motionOn: boolean;
  glow: THREE.Texture;
}) {
  const blocks = useMemo(() => {
    const deepest = [...anchors].sort((a, b) => a.y - b.y).slice(0, 12);
    const rand = mulberry32(55);
    return deepest.map((p, i) => ({
      pos: p,
      size: 0.4 + (i % 3) * 0.16,
      rot: new THREE.Euler(rand() * 6.28, rand() * 6.28, rand() * 6.28),
      bright: i % 4 === 0,
      phase: rand() * 6.28,
    }));
  }, [anchors]);

  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const sprites = useRef<THREE.Sprite[]>([]);

  useFrame((state) => {
    const t = motionOn ? state.clock.elapsedTime * MOTION_SPEED : 0;
    const b = beatsRef.current;
    // confirmation pulse: a sharp flash at settle onset, then a steady lock glow
    const flash = Math.exp(-Math.pow((b.settle - 0.6) * 4, 2)) * 1.6;
    const lock = smooth(clamp((b.settle - 0.3) / 0.5));
    blocks.forEach((bl, i) => {
      const m = mats.current[i];
      if (m) {
        const base = 0.5 + lock * (settled ? 2.2 : 1.7);
        m.emissiveIntensity = base + flash + (motionOn ? Math.sin(t * 1.2 + bl.phase) * 0.3 * lock : 0); // ~0.84 rad/s effective
      }
      const sp = sprites.current[i];
      if (sp) {
        (sp.material as THREE.SpriteMaterial).opacity = 0.16 + lock * 0.5 + flash * 0.25;
      }
    });
  });

  return (
    <group>
      {blocks.map((b, i) => (
        <group key={i} position={[b.pos.x, b.pos.y, b.pos.z]}>
          <mesh rotation={b.rot}>
            <octahedronGeometry args={[b.size, 0]} />
            <meshStandardMaterial
              ref={(el) => {
                if (el) mats.current[i] = el;
              }}
              color={b.bright ? "#0b2c3a" : "#08182a"}
              emissive={b.bright ? COBALT_BRIGHT : COBALT}
              emissiveIntensity={0.6}
              metalness={0.75}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          <sprite
            scale={[b.size * 4.2, b.size * 4.2, 1]}
            ref={(el) => {
              if (el) sprites.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glow}
              color={b.bright ? COBALT_BRIGHT : COBALT}
              transparent
              opacity={0.16}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
      {/* a broad cobalt settlement pool under the roots */}
      <mesh position={[0, LAYOUT.rootTipY + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7, 48]} />
        <SettlementPoolMaterial beatsRef={beatsRef} motionOn={motionOn} />
      </mesh>
    </group>
  );
}

/** Radial cobalt floor glow that brightens on settle. */
function SettlementPoolMaterial({
  beatsRef,
  motionOn,
}: {
  beatsRef: RefObject<Beats>;
  motionOn: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSettle: { value: 0 },
      uColor: { value: new THREE.Color(COBALT_BRIGHT) },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!mat.current) return;
    if (motionOn) uniforms.uTime.value += dt * MOTION_SPEED;
    uniforms.uSettle.value = beatsRef.current.settle;
  });
  return (
    <shaderMaterial
      ref={mat}
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform float uTime; uniform float uSettle; uniform vec3 uColor;
        void main(){
          float d = distance(vUv, vec2(0.5));
          float core = smoothstep(0.5, 0.0, d);
          float ring = smoothstep(0.04, 0.0, abs(d - (0.5 - fract(uTime*0.15)*0.5)));
          float a = core * (0.06 + uSettle*0.5) + ring * uSettle * 0.25;
          gl_FragColor = vec4(uColor, a);
        }
      `}
    />
  );
}

/* ================================================================
   CAMERA RIG — descends canopy -> roots, following the beat focus.
   Critically-damped lerp + pointer parallax. Exposes the active
   focus distance (to the dominant subject) for DepthOfField.
   ================================================================ */
type Stop = { p: number; pos: THREE.Vector3; look: THREE.Vector3 };
const STOPS: Stop[] = [
  // canopy: high, wide, looking up into the lively crown
  { p: 0.0, pos: new THREE.Vector3(0.6, 7.4, 18.5), look: new THREE.Vector3(1.8, 7.2, 0) },
  // sequence: drift down to the fork where the queue forms
  { p: 0.3, pos: new THREE.Vector3(1.6, 3.6, 15.5), look: new THREE.Vector3(2.2, 4.0, 0) },
  // batch: tight on the block of light above the fork
  { p: 0.48, pos: new THREE.Vector3(1.9, 2.2, 13.0), look: new THREE.Vector3(2.4, 2.6, 0) },
  // descend: track the packet down the trunk
  { p: 0.72, pos: new THREE.Vector3(1.6, -2.8, 13.5), look: new THREE.Vector3(2.6, -3.4, 0) },
  // settle: low, in the cobalt bedrock
  { p: 1.0, pos: new THREE.Vector3(1.8, -7.0, 14.0), look: new THREE.Vector3(2.7, -7.6, 0) },
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

// reduced-motion: a calm framing showing the whole tree + story stacked
const STATIC_POS = new THREE.Vector3(2.2, -0.4, 22);
const STATIC_LOOK = new THREE.Vector3(2.6, -0.8, 0);

function Rig({
  progressRef,
  pointerRef,
  focusRef,
  motionOn,
}: {
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  /** world-space point the camera is looking at — DOF focus target */
  focusRef: RefObject<THREE.Vector3>;
  motionOn: boolean;
}) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(1.8, 7.2, 0));
  const tPos = useRef(new THREE.Vector3());
  const tLook = useRef(new THREE.Vector3());
  // orchestrated intro: ease from a pulled-back, higher, slightly rolled frame
  // into the canopy opening over the first ~1.9s on mount.
  const intro = useRef(0);

  useFrame((_, dt) => {
    if (!motionOn) {
      camera.position.copy(STATIC_POS);
      camera.lookAt(STATIC_LOOK);
      focusRef.current.copy(STATIC_LOOK);
      return;
    }
    sampleCam(progressRef.current ?? 0, tPos.current, tLook.current);
    const ptr = pointerRef.current;
    tPos.current.x += ptr.x * 0.6;
    tPos.current.y += ptr.y * 0.34;

    // intro envelope 0->1 (eased); offsets the target while it plays
    if (intro.current < 1) intro.current = clamp(intro.current + dt / 1.9);
    const introEase = 1 - Math.pow(1 - intro.current, 3); // easeOutCubic
    const lift = (1 - introEase) * 3.2; // start higher
    const pull = (1 - introEase) * 5.0; // start further back
    tPos.current.y += lift;
    tPos.current.z += pull;
    camera.rotation.z = (1 - introEase) * 0.04; // a touch of roll, settling

    const k = 1 - Math.pow(0.0024, dt);
    camera.position.lerp(tPos.current, k);
    look.current.lerp(tLook.current, k);
    camera.lookAt(look.current);
    camera.rotation.z = (1 - introEase) * 0.04; // re-apply (lookAt resets roll)
    // DOF focuses on the camera's (smoothed) look target each frame
    focusRef.current.copy(look.current);
  });
  return null;
}

/* ================================================================
   GOD RAYS — cheap volumetric shafts: a few large additive cones
   from above the canopy, fading down. Sells the cinematic haze.
   ================================================================ */
function GodRays({ motionOn }: { motionOn: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!motionOn || !group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * MOTION_SPEED * 0.02;
  });
  const shafts = useMemo(() => {
    const rand = mulberry32(7);
    return new Array(5).fill(0).map(() => ({
      x: (rand() - 0.5) * 6,
      z: (rand() - 0.5) * 6,
      rot: (rand() - 0.5) * 0.4,
      h: 16 + rand() * 6,
      r: 0.6 + rand() * 0.8,
      op: 0.025 + rand() * 0.03,
    }));
  }, []);
  return (
    <group ref={group} position={[0, 8, 0]}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, -s.h / 2, s.z]} rotation={[0, 0, s.rot]}>
          <coneGeometry args={[s.r, s.h, 16, 1, true]} />
          <meshBasicMaterial
            color="#9fd8b0"
            transparent
            opacity={s.op}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================================================================
   POST — DOF on the active beat, tuned bloom, vignette, grain, CA.
   ================================================================ */
/** Minimal shape of the DepthOfFieldEffect bits we drive imperatively. */
type DofEffect = { target?: THREE.Vector3 };

function Post({
  focusRef,
  motionOn,
  heavy,
}: {
  focusRef: RefObject<THREE.Vector3>;
  motionOn: boolean;
  heavy: boolean;
}) {
  const dof = useRef<DofEffect | null>(null);
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0009), []);
  // a Vector3 prop enables the effect's autofocus; we keep it pointed at the
  // rig's world-space look target every frame (smoothed by the rig itself).
  const focusTarget = useMemo(() => new THREE.Vector3(2.4, 2.0, 0), []);

  useFrame(() => {
    const d = dof.current;
    if (!d || !d.target || !motionOn) return;
    // ease the DOF target toward the camera's look point for a smooth rack-focus
    d.target.lerp(focusRef.current, 0.1);
  });

  return (
    <EffectComposer multisampling={heavy ? 4 : 0}>
      <Bloom
        intensity={1.05}
        luminanceThreshold={0.42}
        luminanceSmoothing={0.22}
        mipmapBlur
        radius={0.78}
      />
      {heavy && motionOn ? (
        <DepthOfField
          ref={dof as unknown as React.Ref<never>}
          target={focusTarget}
          focusRange={3.6}
          bokehScale={3.0}
          height={480}
        />
      ) : (
        <></>
      )}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={caOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.28} darkness={0.92} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.035} />
    </EffectComposer>
  );
}

/* ================================================================
   SCENE ASSEMBLY + beat driver
   ================================================================ */
const TREE_OFFSET_X = 3.2;
const TREE_SCALE = 0.62;
const GROUP_Y = 0.2;

function SceneContents({
  params,
  progressRef,
  pointerRef,
  motionOn,
  heavy,
}: {
  params: JourneyParams;
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  motionOn: boolean;
  heavy: boolean;
}) {
  const tree = useMemo(() => buildTree(7), []);
  const glow = useGlowTexture();
  const leafTex = useLeafTexture();
  const focusRef = useRef(new THREE.Vector3(2.4, 2.0, 0));

  // reduced-motion static frame: a low progress so transaction sparks stay
  // alive in the canopy (the L2 story) while the whole tree + dim cobalt roots
  // (the L1 story) read at once. The narrative is carried by the stacked text
  // sections; the scene is a single composed, legible frame.
  const STATIC_P = 0.08;
  const beatsRef = useRef<Beats>(beatsFromProgress(motionOn ? 0 : STATIC_P));
  const smoothedP = useRef(motionOn ? 0 : STATIC_P);

  // particle budgets scale with capability
  const sparkCount = heavy ? 130 : 48; // fewer, larger sparks (was 220 / 70)
  const sapCount = heavy ? 20 : 10; // fewer, larger ambient motes (was 34 / 16)

  // dynamic lights we animate with the descent
  const keyLight = useRef<THREE.PointLight>(null);
  const fillLight = useRef<THREE.PointLight>(null);
  const cobaltLight = useRef<THREE.PointLight>(null);

  useFrame((_, dt) => {
    if (!motionOn) {
      beatsRef.current = beatsFromProgress(STATIC_P);
    } else {
      const target = clamp(progressRef.current ?? 0);
      const k = 1 - Math.pow(0.0012, dt);
      smoothedP.current += (target - smoothedP.current) * k;
      beatsRef.current = beatsFromProgress(smoothedP.current);
    }
    const b = beatsRef.current;
    // dynamic lighting: key follows the action down; cobalt swells at settle
    if (keyLight.current) {
      keyLight.current.position.y = lerp(6, -6, b.p);
      keyLight.current.intensity = 20 + b.batch * 14;
    }
    if (fillLight.current) {
      fillLight.current.intensity = 10 + b.submit * 8;
    }
    if (cobaltLight.current) {
      cobaltLight.current.intensity = 8 + b.settle * 26;
    }
  });

  return (
    <>
      <fog attach="fog" args={["#040a0e", 14, 52]} />
      <ambientLight intensity={0.38} color="#8fa6b6" />
      <Rig
        progressRef={progressRef}
        pointerRef={pointerRef}
        focusRef={focusRef}
        motionOn={motionOn}
      />

      <group position={[TREE_OFFSET_X, 0, 0]}>
        <pointLight ref={keyLight} position={[2, 5, 6]} intensity={22} color="#bfe0ff" distance={46} />
        <pointLight ref={fillLight} position={[-2, 2, 5]} intensity={12} color="#37c0ff" distance={34} />
        <pointLight ref={cobaltLight} position={[0, -8, 3]} intensity={8} color="#3aa0ff" distance={30} />
        <pointLight position={[-3, 6, 4]} intensity={7} color="#e0a33c" distance={26} />
        <directionalLight position={[2, 8, 10]} intensity={0.85} color="#cfe0ea" />
        <directionalLight position={[-4, 2, 6]} intensity={0.4} color="#bcc9d6" />

        {motionOn && <GodRays motionOn={motionOn} />}

        <group scale={TREE_SCALE} position={[0, GROUP_Y, 0]}>
          <Suspense fallback={null}>
            <Bark tree={tree} beatsRef={beatsRef} motionOn={motionOn} />
          </Suspense>
          <Leaves leaves={tree.leaves} tex={leafTex} activity={params.activity} motionOn={motionOn} />
          <AmbientSap
            tree={tree}
            speed={params.speed}
            motionOn={motionOn}
            glow={glow}
            count={sapCount}
          />
          <TxSparks
            tree={tree}
            beatsRef={beatsRef}
            pointerRef={pointerRef}
            motionOn={motionOn}
            glow={glow}
            count={sparkCount}
            activity={params.activity}
          />
          <BatchCore tree={tree} beatsRef={beatsRef} motionOn={motionOn} glow={glow} />
          <L1Bedrock
            anchors={tree.l1Anchors}
            beatsRef={beatsRef}
            settled={params.settled}
            motionOn={motionOn}
            glow={glow}
          />
        </group>
      </group>

      <Post focusRef={focusRef} motionOn={motionOn} heavy={heavy} />
    </>
  );
}

/* ---- low-power / no-WebGL detection ---- */
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

function isHeavyCapable(): boolean {
  if (typeof window === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mobile = window.matchMedia("(max-width: 820px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return cores >= 6 && !mobile && !coarse;
}

/* CSS-only fallback: static brand-tinted backdrop reading as canopy glow
   above + cobalt settlement glow below. No canvas. */
function StaticFallback() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 78% at 64% -6%, rgba(32,190,67,0.16), transparent 56%)," +
          "radial-gradient(90% 70% at 70% 112%, rgba(58,160,255,0.14), transparent 60%)," +
          "radial-gradient(60% 50% at 72% 60%, rgba(207,154,46,0.08), transparent 70%)," +
          "#050b08",
      }}
    />
  );
}

export default function JourneyScene({
  params,
  progressRef,
  pointerRef,
  motionOn,
}: {
  params: JourneyParams;
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  motionOn: boolean;
}) {
  const webgl = useMemo(() => canUseWebGL(), []);
  const heavy = useMemo(() => isHeavyCapable(), []);
  // local pointer fallback if parent doesn't drive one (e.g. reduced motion path)
  const localPtr = usePointerParallax(motionOn);
  const ptr = pointerRef ?? localPtr;

  if (!webgl) return <StaticFallback />;

  return (
    <Canvas
      frameloop={motionOn ? "always" : "demand"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.6, 7.4, 18.5], fov: 46, near: 0.1, far: 120 }}
    >
      <SceneContents
        params={params}
        progressRef={progressRef}
        pointerRef={ptr}
        motionOn={motionOn}
        heavy={heavy}
      />
    </Canvas>
  );
}
