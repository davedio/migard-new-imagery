import { GLOSSARY } from "@/lib/glossary";
import styles from "./GlossaryList.module.css";

/* =========================================================================
   GlossaryList — the shared protocol glossary as a flat two-column
   definition list (rhythm pattern D: rows, hairline separators, no boxes).
   Replaces the old boxed .glossary panel grid from globals.css per the
   reading-rhythm redesign (2026-07-02). Mounted on the standalone /glossary
   page and linked from Learn.
   Server component, presentational only, no entrance animation.
   ========================================================================= */

const terms = Object.values(GLOSSARY);

export default function GlossaryList() {
  return (
    <dl className={styles.list}>
      {terms.map((item) => (
        <div className={styles.row} key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.def}</dd>
        </div>
      ))}
    </dl>
  );
}
