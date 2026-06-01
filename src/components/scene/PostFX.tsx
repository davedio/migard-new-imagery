"use client";

/* ============================================================
   PostFX — shared post-processing wrapper.

   One place to declare the EffectComposer + Bloom that every R3F scene
   was re-declaring with near-identical params. Bloom is what makes the
   green sap and gold proof accents glow. Defaults match the world-tree
   hero; pass props to tune per scene. A future vignette / grain /
   chromatic-aberration pass belongs here so it lands everywhere at once.
   ============================================================ */

import { EffectComposer, Bloom } from "@react-three/postprocessing";

export type PostFXProps = {
  bloomIntensity?: number;
  luminanceThreshold?: number;
  luminanceSmoothing?: number;
  radius?: number;
};

export function PostFX({
  bloomIntensity = 0.9,
  luminanceThreshold = 0.55,
  luminanceSmoothing = 0.2,
  radius = 0.7,
}: PostFXProps) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={luminanceSmoothing}
        mipmapBlur
        radius={radius}
      />
    </EffectComposer>
  );
}
