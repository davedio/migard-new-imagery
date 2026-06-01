"use client";

/* ============================================================
   sceneTokens — shared building blocks for the R3F scenes.

   Consolidates helpers that were duplicated verbatim across
   WorldTreeScene / RootworkScene / MonolithScene:
     - mulberry32   deterministic PRNG (stable geometry across reloads)
     - useGlowTexture  soft radial glow sprite
     - usePointerParallax  window-level pointer tracking for camera rigs
   Plus the shared colour palette, kept in sync with globals.css so every
   scene speaks the same green/gold language.
   ============================================================ */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** Deterministic RNG so procedural geometry looks identical every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [motionOn]);
  return ptr;
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
