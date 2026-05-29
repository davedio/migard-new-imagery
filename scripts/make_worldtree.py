"""
Headless Blender generator for the Midgard world-tree FORM.

Builds trunk + recursive branches + a wide radiating root fan as ONE bark mesh,
with parallel-transport tube geometry so UVs run AROUND (u) and ALONG (v) each
limb -- this is what lets the R3F groove-sap shader flow base->tip correctly.

Also writes a sidecar JSON of leaf anchors (canopy) and root tips (L1 blocks),
already converted into glTF Y-up space so R3F can place instances directly.

Run:
  /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python scripts/make_worldtree.py

Outputs:
  public/models/worldtree.glb
  public/models/worldtree.points.json
"""

import bpy
import bmesh
import math
import os
import json
import random
from mathutils import Vector, Quaternion

# ----------------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------------
SEED = 7
RADIAL = 10               # verts around each tube
HERE = os.path.dirname(os.path.realpath(__file__))
ROOT = os.path.dirname(HERE)
OUT_GLB = os.path.join(ROOT, "public", "models", "worldtree.glb")
# sidecar lives beside its consumer so it can be imported without crossing the
# src/ boundary (Next's tsconfig "include" does not cover public/)
OUT_JSON = os.path.join(ROOT, "src", "components", "scene", "worldtree.points.json")

random.seed(SEED)

# Collected in Blender space (Z-up). Converted to glTF Y-up on export.
leaf_anchors = []   # Vector at fine upper-branch tips
root_tips = []      # Vector at root ends


# ----------------------------------------------------------------------------
# Tube builder: parallel-transport frames, UV u=around / v=along (tiling)
# ----------------------------------------------------------------------------
def add_tube(bm, uv_layer, centers, radii, radial=RADIAL, v_scale=0.5):
    n = len(centers)
    if n < 2:
        return

    tangents = []
    for i in range(n):
        if i == 0:
            t = centers[1] - centers[0]
        elif i == n - 1:
            t = centers[-1] - centers[-2]
        else:
            t = centers[i + 1] - centers[i - 1]
        if t.length < 1e-8:
            t = Vector((0, 0, 1))
        tangents.append(t.normalized())

    # initial frame
    ref = Vector((0, 0, 1))
    if abs(tangents[0].dot(ref)) > 0.95:
        ref = Vector((1, 0, 0))
    prevN = (ref - tangents[0] * ref.dot(tangents[0])).normalized()
    prevT = tangents[0]

    rings = []
    accum_v = 0.0
    for i in range(n):
        T = tangents[i]
        axis = prevT.cross(T)
        if axis.length > 1e-6:
            ang = math.acos(max(-1.0, min(1.0, prevT.dot(T))))
            N = (Quaternion(axis.normalized(), ang) @ prevN).normalized()
        else:
            N = prevN
        B = T.cross(N).normalized()
        N = B.cross(T).normalized()
        prevT, prevN = T, N

        if i > 0:
            accum_v += (centers[i] - centers[i - 1]).length

        ring = []
        for j in range(radial):
            a = 2.0 * math.pi * j / radial
            off = (N * math.cos(a) + B * math.sin(a)) * radii[i]
            ring.append(bm.verts.new(centers[i] + off))
        rings.append((ring, accum_v))

    for i in range(n - 1):
        ringA, vA = rings[i]
        ringB, vB = rings[i + 1]
        for j in range(radial):
            j2 = (j + 1) % radial
            try:
                f = bm.faces.new((ringA[j], ringA[j2], ringB[j2], ringB[j]))
            except ValueError:
                continue
            f.smooth = True
            u0, u1 = j / radial, (j + 1) / radial
            uvs = [(u0, vA * v_scale), (u1, vA * v_scale),
                   (u1, vB * v_scale), (u0, vB * v_scale)]
            for loop, uv in zip(f.loops, uvs):
                loop[uv_layer].uv = uv


# ----------------------------------------------------------------------------
# Spline growth -> centers/radii, then add_tube
# ----------------------------------------------------------------------------
def grow(bm, uv_layer, start, direction, length, r0, r1, depth,
         is_root, up_bias):
    segs = max(4, int(length * 2.5))
    centers, radii = [], []
    pos = start.copy()
    d = direction.normalized()
    gnarl = 0.10 if is_root else 0.16
    for i in range(segs + 1):
        t = i / segs
        centers.append(pos.copy())
        radii.append(max(r0 * (1.0 - t) + r1 * t, 0.015))
        step = length / segs
        pos = pos + d * step
        jitter = Vector((random.uniform(-gnarl, gnarl),
                         random.uniform(-gnarl, gnarl),
                         random.uniform(-gnarl, gnarl) * 0.5))
        d = (d + jitter).normalized()
        if is_root:
            # near-horizontal flare first, then plunge
            d = (d + Vector((0, 0, -0.05 - 0.22 * t))).normalized()
        else:
            d = (d + Vector((0, 0, up_bias))).normalized()
    add_tube(bm, uv_layer, centers, radii)

    tip = centers[-1].copy()
    tip_dir = d.copy()

    if is_root:
        root_tips.append(tip)
    elif start.z > 2.0:
        # seed canopy leaves along the upper portion of this branch
        for k in range(len(centers)):
            if centers[k].z > 2.3 and random.random() < 0.5:
                leaf_anchors.append(centers[k].copy())

    if depth <= 0:
        if not is_root and tip.z > 2.0:
            leaf_anchors.append(tip)
        return

    # children
    if is_root:
        n_child = random.randint(1, 2)
        spread = 0.5
    else:
        n_child = random.randint(2, 3)
        spread = 0.7

    for _ in range(n_child):
        ax = Vector((random.uniform(-1, 1), random.uniform(-1, 1),
                     random.uniform(-1, 1))).normalized()
        ang = random.uniform(0.35, spread)
        child_dir = (Quaternion(ax, ang) @ tip_dir).normalized()
        if not is_root:
            child_dir = (child_dir + Vector((0, 0, 0.25))).normalized()
        new_len = length * random.uniform(0.6, 0.78)
        grow(bm, uv_layer,
             tip + tip_dir * (length * 0.05),
             child_dir, new_len,
             r1, r1 * 0.55,
             depth - 1, is_root, up_bias)


# ----------------------------------------------------------------------------
# Build
# ----------------------------------------------------------------------------
def build():
    # wipe scene
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m)

    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.new("UVMap")

    # --- TRUNK: thick, slightly leaning, base flare via fat first radius ---
    grow(bm, uv_layer,
         Vector((0, 0, 0.0)),
         Vector((0.06, 0.02, 1.0)),
         5.2, 0.62, 0.26, depth=3, is_root=False, up_bias=0.06)

    # --- extra main branches off the upper trunk for a broad dome ---
    n_mains = 6
    for i in range(n_mains):
        a = (i / n_mains) * 2.0 * math.pi + random.uniform(-0.2, 0.2)
        base_z = random.uniform(2.6, 4.2)
        out = Vector((math.cos(a), math.sin(a), 0.0))
        dirn = (out * 0.9 + Vector((0, 0, 0.7))).normalized()
        grow(bm, uv_layer,
             Vector((math.cos(a) * 0.25, math.sin(a) * 0.25, base_z)),
             dirn, random.uniform(2.6, 3.4), 0.22, 0.12,
             depth=3, is_root=False, up_bias=0.10)

    # --- ROOT FAN: wide radiating buttress roots ---
    n_roots = 11
    for i in range(n_roots):
        a = (i / n_roots) * 2.0 * math.pi + random.uniform(-0.12, 0.12)
        out = Vector((math.cos(a), math.sin(a), 0.0))
        dirn = (out * 1.0 + Vector((0, 0, -0.12))).normalized()
        grow(bm, uv_layer,
             Vector((math.cos(a) * 0.42, math.sin(a) * 0.42, 0.15)),
             dirn, random.uniform(4.2, 5.6), 0.34, 0.07,
             depth=2, is_root=True, up_bias=0.0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new("WorldTree")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("WorldTree", mesh)
    bpy.context.collection.objects.link(obj)

    mat = bpy.data.materials.new("Bark")
    mat.use_nodes = True
    obj.data.materials.append(mat)

    # stats
    vmin = Vector((1e9, 1e9, 1e9))
    vmax = Vector((-1e9, -1e9, -1e9))
    for v in mesh.vertices:
        for k in range(3):
            vmin[k] = min(vmin[k], v.co[k])
            vmax[k] = max(vmax[k], v.co[k])
    print("VERTS:", len(mesh.vertices), "FACES:", len(mesh.polygons))
    print("BOUNDS(Z-up) min:", tuple(round(x, 2) for x in vmin),
          "max:", tuple(round(x, 2) for x in vmax))
    print("LEAF ANCHORS:", len(leaf_anchors), "ROOT TIPS:", len(root_tips))

    return obj


def to_yup(v):
    # Blender Z-up (x,y,z) -> glTF Y-up (x, z, -y)
    return [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]


def main():
    obj = build()

    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
    )
    print("GLB WRITTEN:", OUT_GLB, os.path.getsize(OUT_GLB), "bytes")

    data = {
        "leafAnchors": [to_yup(v) for v in leaf_anchors],
        "rootTips": [to_yup(v) for v in root_tips],
    }
    with open(OUT_JSON, "w") as f:
        json.dump(data, f)
    print("JSON WRITTEN:", OUT_JSON,
          "leaves", len(data["leafAnchors"]),
          "roots", len(data["rootTips"]))


main()
