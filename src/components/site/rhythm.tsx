/* ============================================================
   Rhythm primitives — the section vocabulary of the reading-
   rhythm redesign (see .review/card-rhythm-redesign-2026-07-02.md).

   Statement  one full-width display line, no box — the sentence a
              section exists to say.
   StepRail   numbered items on one connected vertical line — for
              anything sequential. The line + nodes ARE the graphic;
              no boxes. Draws in once on first view (motion-gated).
   DataRows   flat directory/table rows with hairline separators —
              reference and routing content.

   Pacing law lives in the doc: never two identical patterns
   adjacent · one loud moment per page · facts get one display
   treatment · pages end quiet · a card must earn its border.
   ============================================================ */

import Link from "next/link";
import type { ReactNode } from "react";
import { StepRailClient } from "./StepRailClient";

/* ---- Statement ---- */

export function Statement({
  kicker,
  line,
  sub,
  align = "center",
}: {
  kicker?: string;
  /** The display line itself. Keep it to ONE sentence. */
  line: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={`statement statement--${align}`}>
      {kicker ? <p className="statement__kicker">{kicker}</p> : null}
      <p className="statement__line">{line}</p>
      {sub ? <p className="statement__sub">{sub}</p> : null}
    </div>
  );
}

/* ---- StepRail ---- */

export type RailStep = {
  title: string;
  body: ReactNode;
  /** node accent; defaults to green. Use gold for verification beats,
      cobalt for settlement beats. */
  tone?: "green" | "gold" | "cobalt";
};

export function StepRail({
  steps,
  ariaLabel,
}: {
  steps: readonly RailStep[];
  ariaLabel?: string;
}) {
  return <StepRailClient steps={steps} ariaLabel={ariaLabel} />;
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
        const inner = (
          <>
            <span className="datarows__label">{r.label}</span>
            {r.body ? <span className="datarows__body">{r.body}</span> : null}
            <span className="datarows__meta">
              {r.meta ?? (r.href ? "→" : "")}
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
