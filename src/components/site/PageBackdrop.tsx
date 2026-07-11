"use client";

import type { CSSProperties } from "react";
import { useTheme } from "@/lib/theme";

/* ============================================================
   PageBackdrop — full-page painterly backdrop for interior pages.
   ============================================================ */

export type BackdropVariant = "full" | "soft" | "bold" | "side" | "banner";


export function PageBackdrop({
  name,
  variant = "full",
  focus = "58% 42%",
  vivid = false,
}: {
  name: string;
  variant?: BackdropVariant;
  focus?: string;
  /** For intrinsically pale plates (terraces, canopy washes) that would
      otherwise disappear under the legibility scrim. */
  vivid?: boolean;
}) {
  const { theme } = useTheme();
  const base = theme === "dark" ? "/dark/img/watercolor" : "/img/watercolor";
  return (
    <div
      className={`page-backdrop page-backdrop--${variant}${vivid ? " page-backdrop--vivid" : ""}`}
      style={{ "--backdrop-pos": focus } as CSSProperties}
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
