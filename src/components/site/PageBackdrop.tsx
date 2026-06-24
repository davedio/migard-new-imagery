"use client";

/* ============================================================
   PageBackdrop — calm painterly backdrop for preview interior pages.

   One component, four treatments so the new imagery can be used only where
   it supports the page instead of competing with the content.
   ============================================================ */

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
