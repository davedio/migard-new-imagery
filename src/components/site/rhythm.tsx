/* ============================================================
   Rhythm primitives — the section vocabulary of the reading-
   rhythm redesign (see .review/card-rhythm-redesign-2026-07-02.md).

   Statement  one full-width display line, no box — the sentence a
              section exists to say.
   DataRows   flat directory/table rows with hairline separators —
              reference and routing content.

   (Sequential content gets a bespoke structure per page: a static
   explainer grid on /learn, a concise path grid on /developers,
   EconomicsFlow on /participate — and the pipeline text is told
   ONCE, on /learn.)

   Pacing law lives in the doc: never two identical patterns
   adjacent · one loud moment per page · facts get one display
   treatment · pages end quiet · a card must earn its border.
   ============================================================ */

import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLinkNotice } from "./ExternalLinkNotice";

/* ---- Statement ---- */

export function Statement({
  kicker,
  line,
  sub,
  align = "center",
  variant = "display",
}: {
  kicker?: string;
  /** The display line itself. Keep it to ONE sentence. */
  line: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  /** Supporting copy belongs beneath a section heading, not at display size. */
  variant?: "display" | "supporting";
}) {
  return (
    <div className={`statement statement--${align} statement--${variant}`}>
      {kicker ? <p className="statement__kicker">{kicker}</p> : null}
      <p className="statement__line">{line}</p>
      {sub ? <p className="statement__sub">{sub}</p> : null}
    </div>
  );
}

/* ---- DataRows ---- */

export type DataRow = {
  label: string;
  body?: ReactNode;
  /** small mono annotation on the right (or the link arrow if href set) */
  meta?: string;
  href?: string;
  external?: boolean;
};

export function DataRows({
  rows,
  ariaLabel,
}: {
  rows: readonly DataRow[];
  ariaLabel?: string;
}) {
  return (
    <div className="datarows" role="list" aria-label={ariaLabel}>
      {rows.map((r) => {
        const meta = r.meta ?? (r.href ? "→" : "");
        const metaIsDecorative = Boolean(r.href && (meta === "→" || meta === "↗"));
        const inner = (
          <>
            <span className="datarows__label">{r.label}</span>
            {r.body ? <span className="datarows__body">{r.body}</span> : null}
            <span className="datarows__meta" aria-hidden={metaIsDecorative || undefined}>
              {meta}
            </span>
          </>
        );
        if (r.href && r.external) {
          return (
            <a
              key={r.label}
              role="listitem"
              className="datarows__row datarows__row--link"
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {inner}
              <ExternalLinkNotice />
            </a>
          );
        }
        if (r.href) {
          return (
            <Link
              key={r.label}
              role="listitem"
              className="datarows__row datarows__row--link"
              href={r.href}
            >
              {inner}
            </Link>
          );
        }
        return (
          <div key={r.label} role="listitem" className="datarows__row">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
