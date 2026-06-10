import { useId, type ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

/**
 * Inline glossary term with a lightweight, CSS-only tooltip.
 *
 *   <Term k="eutxo">eUTXO</Term>
 *
 * - Dotted underline marks the term as defined.
 * - Tooltip shows on hover AND keyboard focus (tabIndex 0 + :focus-within CSS).
 * - `title` attribute is the native fallback; the styled tooltip span is
 *   linked via aria-describedby for screen readers.
 * - Server component, no portals, no client JS — styles live in globals.css
 *   under "TERM TOOLTIP".
 */
export function Term({ k, children }: { k: GlossaryKey; children?: ReactNode }) {
  const entry = GLOSSARY[k];
  const tipId = useId();

  return (
    <span className="term">
      <span
        className="term__target"
        tabIndex={0}
        title={entry.def}
        aria-describedby={tipId}
      >
        {children ?? entry.term}
      </span>
      <span className="term__tip" role="tooltip" id={tipId}>
        <span className="term__tip-term">{entry.term}</span>
        {entry.def}
      </span>
    </span>
  );
}
