import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import JumpChips from "@/components/site/JumpChips";
import { DataRows, Statement } from "@/components/site/rhythm";
import { Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { DEVELOPER_COPY, SITE_COPY } from "@/lib/siteCopy";
import styles from "../how-it-works/page.module.css";

export const metadata: Metadata = {
  title: "Learn Midgard",
  description:
    "Follow a transaction through Midgard, then review the user path, security assumptions, and Cardano L1 settlement model.",
  openGraph: {
    title: "Learn Midgard",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

const audienceRows = [
  {
    label: "Users",
    body: "Use apps with faster confirmations, fees in ADA, and final settlement rooted back to Cardano.",
    href: "/users",
  },
  {
    label: "Builders",
    body: SITE_COPY.paths[1].body,
    href: "/developers",
  },
  {
    label: "Protocol Roles",
    body: SITE_COPY.paths[2].body,
    href: "/participate",
  },
] as const;

const securityRows = [
  {
    label: "Cardano-rooted settlement",
    body: "Fast confirmations happen up front, but verified state settles through Cardano L1.",
  },
  {
    label: "Verification before finality",
    body: "Committed state stays public and challengeable before it becomes settled state.",
  },
  {
    label: "One honest Watcher",
    body: "One honest Watcher, out of any number, is enough to stop a bad block before it settles.",
  },
  {
    label: "Contracts in the open",
    body: "Public source with formal-methods work in progress, so claims can be checked rather than accepted on trust.",
    href: "/developers#contracts",
  },
  ...DEVELOPER_COPY.security.rows,
] as const;

const CUT_PROOF_POINTS = new Set(["Settlement security", "Independent verification"]);

const stripCells = [
  ...SITE_COPY.proofPoints.filter((p) => !CUT_PROOF_POINTS.has(p.k)),
  {
    k: "Fees",
    v: "In ADA",
    s: "A fraction of L1 cost, estimated — no separate gas token.",
  },
  {
    k: "Throughput",
    v: "Up to 300x",
    s: "Estimated design target — unbenchmarked until measured.",
  },
];

export default function LearnPage() {
  return (
    <HowItWorksExperience>
      <JumpChips
        items={[
          { id: "proof-metrics", label: "Proof metrics" },
          { id: "paths", label: "Paths" },
          { id: "security", label: "Security" },
          { id: "reference", label: "Reference" },
        ]}
      />

      <Section
        id="proof-metrics"
        title="Proof metrics."
        lead="Six indicators — estimated where forward-looking, checkable where live."
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

      <Section
        id="paths"
        title="Start with the path that matches you."
        lead="The transaction path is one protocol. The entry point depends on what you came here to do."
        cols
        aside={
          <Statement
            align="left"
            kicker="Same protocol, different jobs"
            line="Users move value, builders integrate apps, Protocol Roles keep the path checkable."
          />
        }
      >
        <DataRows rows={audienceRows} ariaLabel="Midgard reader paths" />
      </Section>

      <Section
        id="security"
        title="Security, in plain language."
        lead="Midgard should be read as an optimistic rollup: responsive execution up front, public checks before final Cardano settlement."
        cols
        aside={
          <Statement
            align="left"
            kicker="Trust path"
            line="Speed comes first, but correctness still has to pass through verification."
            sub="Operators can make the app feel fast. They do not get the final word on valid state."
          />
        }
      >
        <DataRows rows={securityRows} ariaLabel="Security assumptions" />
      </Section>

      <Section id="reference" title="Reference pages." tight cols>
        <DataRows
          ariaLabel="Learn reference pages"
          rows={[
            {
              label: "Users",
              body: "A simpler page about what normal users get from Midgard.",
              href: "/users",
            },
            {
              label: "FAQ",
              body: "Short answers about product status, security, roles, and what to check.",
              href: "/faq",
            },
            {
              label: "Glossary",
              body: "Definitions for the protocol terms used across the site.",
              href: "/glossary",
            },
            {
              label: "GitHub",
              body: "The protocol is open — inspect source, contracts, and implementation history.",
              href: OFFICIAL_LINKS.github,
              external: true,
            },
          ]}
        />
      </Section>
    </HowItWorksExperience>
  );
}
