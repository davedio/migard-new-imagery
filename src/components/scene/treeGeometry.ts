import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ============================================================
   World-tree geometry — an organic, quasi-real tree whose
   canopy is Midgard (L2) and whose roots reach down into the
   Cardano L1 "bedrock" (glowing settlement blocks at the tips).

   Built once, deterministically, on the client.

   Vertical layout (world units, +Y up):
     canopy leaves   ~ +12   activity / L2 life
     canopy fork      ~ +4.8  proof aperture (the heart)
     trunk            +4.8 → -2.5  the verified axis
     roots            -2.5 → -11   settlement reaching down
     L1 blocks        ~ -10   Cardano L1 anchors
   ============================================================ */

export const LAYOUT = {
  groundY: -2.5,
  trunkTopY: 4.8,
  rootTipY: -11,
  coreY: 4.8,
} as const;

export type Leaf = {
  pos: THREE.Vector3;
  scale: number;
  rotY: number;
  rotZ: number;
  tint: number; // 0..1 green variation
};

export type Tree = {
  /** every limb merged together (canopy + roots) — legacy single-mesh form */
  bark: THREE.BufferGeometry;
  /** canopy limbs only, merged — revealed on its own growth channel */
  canopyBark: THREE.BufferGeometry;
  /** root limbs only, merged — revealed on its own growth channel */
  rootBark: THREE.BufferGeometry;
  trunk: THREE.BufferGeometry;
  leaves: Leaf[];
  canopy: { center: THREE.Vector3; radius: number };
  l1Anchors: THREE.Vector3[];
  canopySpines: THREE.CatmullRomCurve3[];
  rootSpines: THREE.CatmullRomCurve3[];
  trunkSpine: THREE.CatmullRomCurve3;
};

const UP = new THREE.Vector3(0, 1, 0);

// deterministic RNG (mulberry32) so the tree looks identical every load
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A direction at half-angle `half` around `axis`, rotated by azimuth `az`. */
function coneDir(axis: THREE.Vector3, half: number, az: number) {
  const ref = Math.abs(axis.y) < 0.92 ? UP : new THREE.Vector3(1, 0, 0);
  const t1 = new THREE.Vector3().crossVectors(axis, ref).normalize();
  const t2 = new THREE.Vector3().crossVectors(axis, t1).normalize();
  return axis
    .clone()
    .multiplyScalar(Math.cos(half))
    .addScaledVector(t1, Math.sin(half) * Math.cos(az))
    .addScaledVector(t2, Math.sin(half) * Math.sin(az))
    .normalize();
}

/** A meandering spine from `start` heading `dir` over `length`. */
function spine(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  steps: number,
  curl: number,
  rand: () => number,
): { curve: THREE.CatmullRomCurve3; end: THREE.Vector3; endDir: THREE.Vector3 } {
  const pts: THREE.Vector3[] = [start.clone()];
  const cur = start.clone();
  const d = dir.clone().normalize();
  const seg = length / steps;
  for (let i = 0; i < steps; i++) {
    let side = new THREE.Vector3().crossVectors(d, UP);
    if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
    side.normalize();
    d.applyAxisAngle(side, (rand() - 0.5) * curl);
    d.applyAxisAngle(UP, (rand() - 0.5) * curl);
    d.normalize();
    cur.addScaledVector(d, seg);
    pts.push(cur.clone());
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  curve.curveType = "catmullrom";
  curve.tension = 0.5;
  return { curve, end: cur.clone(), endDir: d.clone() };
}

/** Reimplements TubeGeometry with a linearly tapering radius (r0 -> r1).
 *  `flareBase` (0 = off) swells the bottom ~22% into a buttressed root-flare. */
function taperedTube(
  curve: THREE.CatmullRomCurve3,
  r0: number,
  r1: number,
  tubularSegments: number,
  radialSegments: number,
  flareBase = 0,
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, P);
    let radius = THREE.MathUtils.lerp(r0, r1, t);
    if (flareBase > 0 && t < 0.22) {
      const f = 1 - t / 0.22; // 1 at the foot -> 0 at 22% up
      radius *= 1 + flareBase * f * f; // quadratic swell = organic buttress
    }
    N.copy(frames.normals[i]);
    B.copy(frames.binormals[i]);
    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);
      normal
        .set(
          cos * N.x + sin * B.x,
          cos * N.y + sin * B.y,
          cos * N.z + sin * B.z,
        )
        .normalize();
      positions.push(
        P.x + radius * normal.x,
        P.y + radius * normal.y,
        P.z + radius * normal.z,
      );
      normals.push(normal.x, normal.y, normal.z);
      // u wraps around the limb, v runs 0->1 from base to tip (used by flow + bark maps)
      uvs.push(j / radialSegments, t);
    }
  }
  for (let i = 1; i <= tubularSegments; i++) {
    for (let j = 1; j <= radialSegments; j++) {
      const a = (radialSegments + 1) * (i - 1) + (j - 1);
      const b = (radialSegments + 1) * i + (j - 1);
      const c = (radialSegments + 1) * i + j;
      const d = (radialSegments + 1) * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

type Ctx = {
  canopyTubes: THREE.BufferGeometry[];
  rootTubes: THREE.BufferGeometry[];
  leafAnchors: THREE.Vector3[];
  l1Anchors: THREE.Vector3[];
  canopySpines: THREE.CatmullRomCurve3[];
  rootSpines: THREE.CatmullRomCurve3[];
};

/** Recursive canopy limb: grows up-and-out, drops leaf clusters at the tips. */
function growBranch(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  radius: number,
  length: number,
  depth: number,
  rand: () => number,
  ctx: Ctx,
) {
  const steps = 6;
  const { curve, end, endDir } = spine(start, dir, length, steps, 0.34, rand);
  const r1 = Math.max(radius * 0.62, 0.02);
  ctx.canopyTubes.push(taperedTube(curve, radius, r1, steps * 4, depth > 2 ? 14 : 8));
  if (depth >= 2) ctx.canopySpines.push(curve);

  if (depth === 0) {
    ctx.leafAnchors.push(end.clone());
    // extra anchors along the final twig for fuller foliage
    ctx.leafAnchors.push(curve.getPointAt(0.62));
    ctx.leafAnchors.push(curve.getPointAt(0.32));
    return;
  }
  const n = depth === 3 ? 4 : depth >= 2 ? 3 : 2; // wide crown, denser near the top
  // wide spread for a broad, rounded canopy
  const half = 0.66 + (3 - depth) * 0.09;
  for (let i = 0; i < n; i++) {
    const az = (i / n) * Math.PI * 2 + rand() * 0.9;
    const cd = coneDir(endDir, half, az);
    // outer (deeper) branches arch up less so the dome rounds over instead of spiring
    cd.y += 0.16 - (3 - depth) * 0.03;
    cd.normalize();
    growBranch(end, cd, r1, length * 0.74, depth - 1, rand, ctx);
  }
}

/** Recursive root: grows down-and-out, gnarlier and WIDE, tips become L1 anchors. */
function growRoot(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  radius: number,
  length: number,
  depth: number,
  rand: () => number,
  ctx: Ctx,
) {
  const steps = 7;
  const { curve, end, endDir } = spine(start, dir, length, steps, 0.62, rand); // gnarlier
  const r1 = Math.max(radius * 0.6, 0.04);
  ctx.rootTubes.push(taperedTube(curve, radius, r1, steps * 4, depth > 1 ? 16 : 10));
  ctx.rootSpines.push(curve);

  if (depth === 0) {
    ctx.l1Anchors.push(end.clone());
    return;
  }
  const n = depth >= 2 ? 3 : 2;
  const half = 0.55 + (2 - depth) * 0.12;
  for (let i = 0; i < n; i++) {
    const az = (i / n) * Math.PI * 2 + rand() * 0.9;
    const cd = coneDir(endDir, half, az);
    // shallow & spreading wide near the trunk foot, plunging hard toward the L1 tips
    cd.y -= 0.3 + (2 - depth) * 0.55;
    cd.normalize();
    growRoot(end, cd, r1, length * 0.72, depth - 1, rand, ctx);
  }
}

export function buildTree(seed = 7): Tree {
  const rand = rng(seed);
  const ctx: Ctx = {
    canopyTubes: [],
    rootTubes: [],
    leafAnchors: [],
    l1Anchors: [],
    canopySpines: [],
    rootSpines: [],
  };

  // --- trunk: thick verified axis from ground up to the canopy fork.
  //     kept as its OWN geometry (NOT merged into the bark) so it can carry
  //     the heavy PBR bark + grooved-sap treatment with its own UVs. ---
  const base = new THREE.Vector3(0, LAYOUT.groundY, 0);
  const trunkDir = new THREE.Vector3(0, 1, 0.02);
  const trunkLen = LAYOUT.trunkTopY - LAYOUT.groundY;
  const trunk = spine(base, trunkDir, trunkLen, 7, 0.1, rand); // a touch of gnarl/lean
  // thick, characterful trunk with a buttressed flared foot (flareBase)
  const trunkGeo = taperedTube(trunk.curve, 1.5, 0.7, 56, 28, 0.85);
  // aoMap samples the 2nd UV channel (uv1); reuse the primary UVs
  trunkGeo.setAttribute("uv1", trunkGeo.getAttribute("uv").clone());
  trunkGeo.computeBoundingSphere();
  const fork = trunk.end.clone();

  // --- canopy: many limbs fanning up and WIDE from the fork ---
  const CANOPY = 10;
  for (let i = 0; i < CANOPY; i++) {
    const az = (i / CANOPY) * Math.PI * 2 + rand() * 0.5;
    const dir = coneDir(new THREE.Vector3(0, 1, 0), 0.72, az);
    growBranch(fork, dir, 0.6, 3.3, 3, rand, ctx);
  }

  // --- roots: thick buttress roots emerging from around the flared foot,
  //     spreading WIDE before plunging down to the L1 bedrock ---
  const ROOTS = 11;
  const rootFootY = LAYOUT.groundY + 0.35;
  for (let i = 0; i < ROOTS; i++) {
    const az = (i / ROOTS) * Math.PI * 2 + rand() * 0.45;
    // start almost horizontal (the wide exposed flare); children plunge from there
    const dir = coneDir(new THREE.Vector3(0, -1, 0), 1.15, az);
    const start = new THREE.Vector3(-Math.sin(az) * 0.85, rootFootY, Math.cos(az) * 0.85);
    growRoot(start, dir, 0.72, 3.6, 2, rand, ctx);
  }

  // --- scatter leaf clumps around every canopy tip (dense + wide) ---
  const leaves: Leaf[] = [];
  const cCenter = new THREE.Vector3();
  for (const a of ctx.leafAnchors) {
    const clump = 8 + Math.floor(rand() * 7);
    for (let i = 0; i < clump; i++) {
      const off = new THREE.Vector3(
        (rand() - 0.5) * 2.4,
        (rand() - 0.5) * 2.2,
        (rand() - 0.5) * 2.4,
      );
      const pos = a.clone().add(off);
      cCenter.add(pos);
      leaves.push({
        pos,
        scale: 0.18 + rand() * 0.26,
        rotY: rand() * Math.PI * 2,
        rotZ: (rand() - 0.5) * Math.PI,
        tint: rand(),
      });
    }
  }
  cCenter.multiplyScalar(1 / Math.max(leaves.length, 1));
  let cRadius = 0;
  for (const lf of leaves) cRadius = Math.max(cRadius, lf.pos.distanceTo(cCenter));

  // merge each region on its own so the growth shader can reveal canopy and
  // roots independently; also expose a combined `bark` for legacy single-mesh use.
  const canopyBark = mergeGeometries(ctx.canopyTubes, false);
  canopyBark.computeBoundingSphere();
  if (!canopyBark.getAttribute("uv1") && canopyBark.getAttribute("uv")) {
    canopyBark.setAttribute("uv1", canopyBark.getAttribute("uv").clone());
  }
  const rootBark = mergeGeometries(ctx.rootTubes, false);
  rootBark.computeBoundingSphere();
  if (!rootBark.getAttribute("uv1") && rootBark.getAttribute("uv")) {
    rootBark.setAttribute("uv1", rootBark.getAttribute("uv").clone());
  }
  const bark = mergeGeometries([...ctx.canopyTubes, ...ctx.rootTubes], false);
  bark.computeBoundingSphere();

  return {
    bark,
    canopyBark,
    rootBark,
    trunk: trunkGeo,
    leaves,
    canopy: { center: cCenter, radius: cRadius },
    l1Anchors: ctx.l1Anchors,
    canopySpines: ctx.canopySpines,
    rootSpines: ctx.rootSpines,
    trunkSpine: trunk.curve,
  };
}
