import type { ReactNode } from "react";
import styles from "./LegalDoc.module.css";

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs: ReactNode[];
  /** Optional non-paragraph block (e.g. a category table) rendered after the paragraphs. */
  after?: ReactNode;
};

/** Marks an unresolved policy decision for internal CEO/counsel review. */
export function ReviewFlag({ children }: { children: ReactNode }) {
  return <strong className={styles.reviewFlag}>{children}</strong>;
}

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
      <nav className={styles.toc} aria-label="On this page">
        <span className={styles.tocLabel}>On this page</span>
        <ol className={styles.tocList}>
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.content}>
        <p className={styles.meta}>{meta}</p>
        {sections.map((s, i) => (
          <section className={styles.section} id={s.id} key={s.id}>
            <h2>
              {i + 1}. {s.heading}
            </h2>
            {s.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {s.after ? <div className={styles.after}>{s.after}</div> : null}
          </section>
        ))}
        {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
      </div>
    </article>
  );
}

export default LegalDoc;
