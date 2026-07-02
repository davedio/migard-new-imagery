import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import FaqSections from "@/components/site/FaqSections";
import GlossaryList from "@/components/site/GlossaryList";
import JumpChips from "@/components/site/JumpChips";
import { DataRows } from "@/components/site/rhythm";
import { Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { SITE_COPY } from "@/lib/siteCopy";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "Follow a transaction through Midgard: fast execution, independent verification, and Cardano L1 settlement — plus the FAQ and protocol glossary.",
  openGraph: {
    title: "How Midgard Works",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

/* Reading-rhythm redesign (.review/card-rhythm-redesign-2026-07-02.md):
   below the experience the page reads stat strip (A) → outbound rows (D)
   → FAQ rows (D) → compare grid (E) → glossary rows (D). Stillness is
   the default — only the compare grid gets an entrance. */

/* Proof points whose fine line only restates the hero claim ("every block
   settles back to Cardano L1", "state can be challenged before it settles")
   drop out of the strip — the journey act above already tells both. */
const CUT_PROOF_POINTS = new Set(["Settlement security", "Independent verification"]);

const stripCells = [
  ...SITE_COPY.proofPoints.filter((p) => !CUT_PROOF_POINTS.has(p.k)),
  /* the old hardcoded Fees card, folded in as one honest cell */
  {
    k: "Fees",
    v: "Plain ADA",
    s: "A fraction of L1 cost, estimated — no separate gas token.",
  },
];

export default function HowItWorksPage() {
  // The flagship 3D transaction journey IS the page. FAQ and glossary live
  // here (moved from their old standalone routes); the JumpChips bar below
  // lets visitors jump straight to them.
  return (
    <HowItWorksExperience>
      <JumpChips
        items={[
          { id: "proof-metrics", label: "Proof metrics" },
          { id: "next", label: "Next steps" },
          { id: "faq", label: "Questions" },
          { id: "glossary", label: "Glossary" },
        ]}
      />

      {/* A — stat strip: the big values rendered big, no boxes */}
      <Section
        id="proof-metrics"
        title="Proof metrics."
        lead="Five indicators — estimated where forward-looking, checkable where live."
      >
        <div className={styles.strip} role="list" aria-label="Proof metrics">
          {stripCells.map((item) => (
            <div key={item.k} role="listitem" className={styles.cell}>
              <span className={styles.cellKicker}>{item.k}</span>
              <span className={styles.cellValue}>{item.v}</span>
              <span className={styles.cellFine}>{item.s}</span>
              {"href" in item && item.href ? (
                <a
                  className={styles.cellLink}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.cta} →
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      {/* D — one outbound footer: where each thread continues */}
      <Section id="next" title="Security and economics, in depth." tight>
        <DataRows
          ariaLabel="Where to go next"
          rows={[
            {
              label: "Security",
              body: "Trust path, fault proofs, responsible disclosure, and audit status.",
              href: "/developers#security",
            },
            {
              label: "Economics",
              body: "Operator and Watcher incentives, bonds, rewards, and ADA fees.",
              href: "/participate#economics",
            },
            {
              label: "GitHub",
              body: "The protocol is open — verify it yourself.",
              href: OFFICIAL_LINKS.github,
              external: true,
            },
            {
              label: "Whitepaper",
              body: "The full technical writeup ships alongside mainnet preparation, later this year.",
              meta: "estimated",
            },
          ]}
        />
      </Section>

      {/* D + E — FAQ rows, then the page's one card grid (comparison) */}
      <FaqSections />

      {/* D — glossary as a quiet flat reference block, ends the page */}
      <Section
        id="glossary"
        title="Glossary."
        lead="Short definitions for the protocol terms used across Midgard."
        tight
      >
        <GlossaryList />
      </Section>
    </HowItWorksExperience>
  );
}
