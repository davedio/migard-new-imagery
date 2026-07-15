"use client";

import type { CSSProperties } from "react";
import { useTheme } from "@/lib/theme";

/* ============================================================
   PageBackdrop — full-page painterly backdrop for interior pages.
   ============================================================ */

export type BackdropVariant = "full" | "soft" | "bold" | "side" | "banner";

const PALE_DARK_BACKDROPS = new Set([
  "journey-descent",
  "journey-flow-tall",
  "signal-cairn",
  "sentinel-watch",
  "stepping-stones",
  "stone-gateway",
  "trunk-mist",
  "winding-road",
]);

export function PageBackdrop({
  name,
  variant = "full",
  focus = "58% 42%",
  mobileFocus,
  vivid = false,
}: {
  name: string;
  variant?: BackdropVariant;
  focus?: string;
  /** Portrait crop focal point. Landscape plates lose most of their width on phones. */
  mobileFocus?: string;
  /** For intrinsically pale plates (terraces, canopy washes) that would
      otherwise disappear under the legibility scrim. */
  vivid?: boolean;
}) {
  const { theme } = useTheme();
  const base = theme === "dark" ? "/dark/img/watercolor" : "/img/watercolor";
  const needsDarkWash = theme === "dark" && PALE_DARK_BACKDROPS.has(name);
  return (
    <div
      className={`page-backdrop page-backdrop--${variant}${vivid ? " page-backdrop--vivid" : ""}${needsDarkWash ? " page-backdrop--dark-pale" : ""}`}
      style={
        {
          "--backdrop-pos": focus,
          "--backdrop-pos-mobile": mobileFocus ?? focus,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <picture>
        <source type="image/avif" srcSet={`${base}/${name}.avif`} />
        <source type="image/webp" srcSet={`${base}/${name}.webp`} />
        <img
          className="page-backdrop__img"
          src={`${base}/${name}.webp`}
          alt=""
          decoding="async"
        />
      </picture>
      <div className="page-backdrop__scrim" />
    </div>
  );
}

export default PageBackdrop;
