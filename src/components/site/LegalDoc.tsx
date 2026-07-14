import type { ReactNode } from "react";
import styles from "./LegalDoc.module.css";

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs: ReactNode[];
  /** Optional non-paragraph block (e.g. a category table) rendered after the paragraphs. */
  after?: ReactNode;
};

/**
 * Long-form policy renderer for /terms and /privacy. The section text is
 * counsel-drafted and must stay verbatim — bracketed [open decisions] and the
 * draft banner are part of the document until counsel signs off.
 */
export function LegalDoc({
  meta,
  sections,
  footnote,
}: {
  /** The operator + last-updated line, e.g. "Midgard Labs, Inc. · Last updated: June 11, 2026". */
  meta: string;
  sections: readonly LegalSection[];
  /** The "open counsel items" closer from the source document. */
  footnote?: ReactNode;
}) {
  return (
    <article className={styles.doc}>
      <p className={styles.meta}>{meta}</p>
      {sections.map((s, i) => (
        <section className={styles.section} id={s.id} key={s.id}>
          <h2>
            {i + 1}. {s.heading}
          </h2>
          {s.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {s.after}
        </section>
      ))}
      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </article>
  );
}

export default LegalDoc;
