import Link from "next/link";

/**
 * Eyebrow breadcrumb for child pages of a section, e.g.
 *
 *   <PartOf parentHref="/how-it-works" parentLabel="How it works" />
 *
 * renders "PART OF · HOW IT WORKS" as a mono micro-label link, styled like
 * the existing kickers (see "PART OF EYEBROW" in globals.css). Server
 * component, presentational only.
 */
export function PartOf({
  parentHref,
  parentLabel,
}: {
  parentHref: string;
  parentLabel: string;
}) {
  return (
    <Link className="part-of" href={parentHref}>
      <span className="part-of__k">Part of</span>
      <span className="part-of__sep" aria-hidden>
        ·
      </span>
      <span className="part-of__v">{parentLabel}</span>
    </Link>
  );
}
