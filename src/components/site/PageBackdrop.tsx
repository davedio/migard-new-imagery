"use client";

import type { CSSProperties } from "react";

/* ============================================================
   PageBackdrop — calm painterly backdrop for preview interior pages.

   One component, four treatments so the new imagery can be used only where
   it supports the page instead of competing with the content.
   ============================================================ */

export type BackdropVariant = "soft" | "bold" | "side" | "banner";

const BASE = "/img/watercolor";

export function PageBackdrop({
  name,
  variant = "soft",
  focus = "58% 42%",
}: {
  name: string;
  variant?: BackdropVariant;
  focus?: string;
}) {
  return (
    <div
      className={`page-backdrop page-backdrop--${variant}`}
      style={{ "--backdrop-pos": focus } as CSSProperties}
      aria-hidden="true"
    >
      <picture>
        <source type="image/avif" srcSet={`${BASE}/${name}.avif`} />
        <source type="image/webp" srcSet={`${BASE}/${name}.webp`} />
        <img
          className="page-backdrop__img"
          src={`${BASE}/${name}.webp`}
          alt=""
          decoding="async"
        />
      </picture>
      <div className="page-backdrop__scrim" />
    </div>
  );
}

export default PageBackdrop;
