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
}: {
  name: string;
  variant?: BackdropVariant;
  focus?: string;
}) {
  const { theme } = useTheme();
  const base = theme === "dark" ? "/dark/img/watercolor" : "/img/watercolor";
  return (
    <div
      className={`page-backdrop page-backdrop--${variant}`}
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
