/* ============================================================
   prng — deterministic RNG shared by every scene.

   Lives in its own three-free module so the Canvas2D backdrops
   (PhotorealBackdrop etc.) can import it WITHOUT pulling three.js into
   their route bundles; the R3F scenes keep importing it via sceneTokens,
   which re-exports it.
   ============================================================ */

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
