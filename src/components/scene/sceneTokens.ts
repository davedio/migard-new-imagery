"use client";

/* ============================================================
   sceneTokens — shared building blocks for the R3F scenes.

   Consolidates helpers shared by the active R3F journey scene:
     - mulberry32   deterministic PRNG (re-exported from ./prng, which is
                    three-free so Canvas2D backdrops can share it too)
     - useGlowTexture  soft radial glow sprite
     - usePointerParallax  window-level pointer tracking for camera rigs
     - useBarkMaps / cloneBarkMaps  the shared 1K oak bark PBR set
   Plus the shared colour palette, kept in sync with globals.css so every
   scene speaks the same green/gold language.
   ============================================================ */

import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export { mulberry32 } from "./prng";

/** Soft white radial glow sprite, reused for sap points, root tips, L1 blocks. */
export function useGlowTexture() {
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

/**
 * Track the pointer in normalized device coords on the window (not the
 * canvas) so parallax works even when the canvas is pointer-events:none and
 * page content stays interactive. Returns a ref updated in place; only
 * listens while `motionOn`.
 */
export function usePointerParallax(motionOn: boolean) {
  const ptr = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!motionOn) return;
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [motionOn]);
  return ptr;
}

export type BarkMaps = {
  diff: THREE.Texture;
  nor: THREE.Texture;
  rough: THREE.Texture;
  ao: THREE.Texture;
};

function configureBarkTexture(
  texture: THREE.Texture,
  colorSpace: THREE.ColorSpace,
  repeat?: THREE.Vector2,
) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = colorSpace;
  if (repeat) texture.repeat.copy(repeat);
  texture.needsUpdate = true;
}

/**
 * Shared bark textures (1K WebP, ~1.3MB total) for the active journey scene.
 */
export function useBarkMaps(): BarkMaps {
  const [diff, nor, rough, ao] = useLoader(THREE.TextureLoader, [
    "/textures/bark/oak_diff_1k.webp",
    "/textures/bark/oak_nor_gl_1k.webp",
    "/textures/bark/oak_rough_1k.webp",
    "/textures/bark/oak_ao_1k.webp",
  ]);
  useMemo(() => {
    configureBarkTexture(diff, THREE.SRGBColorSpace);
    configureBarkTexture(nor, THREE.NoColorSpace);
    configureBarkTexture(rough, THREE.NoColorSpace);
    configureBarkTexture(ao, THREE.NoColorSpace);
  }, [diff, nor, rough, ao]);
  return { diff, nor, rough, ao };
}

/** Per-region clones of the bark set with their own repeat (verbatim move). */
export function cloneBarkMaps(maps: BarkMaps, repeat: THREE.Vector2): BarkMaps {
  const c = {
    diff: maps.diff.clone(),
    nor: maps.nor.clone(),
    rough: maps.rough.clone(),
    ao: maps.ao.clone(),
  };
  configureBarkTexture(c.diff, THREE.SRGBColorSpace, repeat);
  configureBarkTexture(c.nor, THREE.NoColorSpace, repeat);
  configureBarkTexture(c.rough, THREE.NoColorSpace, repeat);
  configureBarkTexture(c.ao, THREE.NoColorSpace, repeat);
  return c;
}

/** Core palette, mirrored from globals.css tokens (green / gold / inks). */
export const SCENE_COLORS = {
  ink: "#07120b",
  obsidian: "#050c08",
  green: "#20be43",
  greenBright: "#3be863",
  gold: "#e0a33c",
  goldDeep: "#cf9a2e",
  mist: "#d7e2d8",
} as const;
