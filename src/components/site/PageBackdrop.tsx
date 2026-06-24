"use client";

/* ============================================================
   PageBackdrop — light-mode painterly backdrop for interior pages.

   One component, four treatments so the new imagery can be reviewed
   across a range of intensities:
     soft   — canopy floats at the top and dissolves into clean light
     bold   — full-bleed presence with a legibility wash
     side   — anchored to the right; the text column stays crisp
     banner — a header band that fades into the page

   Rendered only in light mode; dark keeps its existing backdrops
   (AmbientDepth / SecurityPageBackdrop), so no current effect is lost.
   ============================================================ */

import { useTheme } from "@/lib/theme";

export type BackdropVariant = "soft" | "bold" | "side" | "banner";

const BASE = "/img/tree";
const widthsFor = (name: string, ext: string) =>
  `${BASE}/${name}-960.${ext} 960w, ${BASE}/${name}-1440.${ext} 1440w, ${BASE}/${name}-2200.${ext} 2200w`;

export function PageBackdrop({
  name,
  variant = "soft",
}: {
  name: string;
  variant?: BackdropVariant;
}) {
  const { theme } = useTheme();
  if (theme !== "light") return null;

  return (
    <div className={`page-backdrop page-backdrop--${variant}`} aria-hidden="true">
      <picture>
        <source type="image/avif" srcSet={widthsFor(name, "avif")} sizes="100vw" />
        <source type="image/webp" srcSet={widthsFor(name, "webp")} sizes="100vw" />
        <img
          className="page-backdrop__img"
          src={`${BASE}/${name}-1440.webp`}
          alt=""
          decoding="async"
        />
      </picture>
      <div className="page-backdrop__scrim" />
    </div>
  );
}

export default PageBackdrop;
