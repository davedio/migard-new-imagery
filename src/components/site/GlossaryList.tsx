import { GLOSSARY } from "@/lib/glossary";

/* =========================================================================
   GlossaryList — the shared protocol glossary rendered as a tight
   definition grid (the existing .glossary / .glossary__row classes from
   globals.css). Formerly the /glossary page; now mounted as the #glossary
   anchor section on /how-it-works. Server component, presentational only.
   ========================================================================= */

const terms = Object.values(GLOSSARY);

export default function GlossaryList() {
  return (
    <dl className="glossary">
      {terms.map((item) => (
        <div className="glossary__row" key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.def}</dd>
        </div>
      ))}
    </dl>
  );
}
