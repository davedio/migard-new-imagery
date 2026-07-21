import Link from "next/link";
import LegalDoc, { type LegalSection } from "@/components/site/LegalDoc";
import styles from "@/components/site/LegalDoc.module.css";
import PageBackdrop from "@/components/site/PageBackdrop";
import { Callout, PageHero, Section } from "@/components/site/ui";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("cookies");

/* Source of truth: Midgard_Cookie_Notice_CLEAN_2026-06-11.docx
   (Website Policy Pack 2026-06-11). Text is verbatim; bracketed items are
   counsel's open decisions and stay until sign-off. */

const contact = <a href="mailto:info@anastasialabs.com">info@anastasialabs.com</a>;

const CATEGORIES = [
  {
    category: "Strictly necessary",
    purpose:
      "Core site delivery, security, load balancing, and remembering essential preferences (such as a cookie-consent choice).",
    status:
      "In use. These cannot be switched off through the Site because the Site does not work without them.",
  },
  {
    category: "Analytics",
    purpose:
      "Understanding aggregate site usage (pages visited, approximate region, referral source) to improve content.",
    status:
      "Not active. [If adopted: name the tool, e.g. a privacy-focused analytics provider, its cookie names, durations, and whether IP addresses are truncated; activate consent tooling where required before enabling.]",
  },
  {
    category: "Advertising / social",
    purpose: "Targeted advertising or cross-site tracking.",
    status: "Not used, and no plans to use.",
  },
] as const;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "what-this-covers",
    heading: "What This Notice Covers",
    paragraphs: [
      <>
        This Cookie Notice explains how the Midgard website (operated by Midgard Labs, Inc.) uses
        cookies and similar technologies such as local storage and pixels. It supplements the
        Midgard <Link href="/privacy">Privacy Policy</Link>. The canonical website address is
        [TBD: confirm final production URL before publication].
      </>,
    ],
  },
  {
    id: "current-posture",
    heading: "Our Current Posture",
    paragraphs: [
      <>
        We keep this simple and minimal. The Site currently uses only the technologies needed to
        operate and secure it. We do not use advertising cookies, and we do not sell or share
        personal information collected through cookies for cross-context behavioral advertising.
        If we adopt an analytics tool in the future, we will list it here first and, where consent
        is required in your jurisdiction, the tool will not run until you consent.
      </>,
    ],
  },
  {
    id: "categories",
    heading: "Categories We Use",
    paragraphs: [],
    after: (
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Purpose</th>
            <th scope="col">Current status</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((row) => (
            <tr key={row.category}>
              <td>{row.category}</td>
              <td>{row.purpose}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: "managing-cookies",
    heading: "Managing Cookies",
    paragraphs: [
      <>
        You can control and delete cookies through your browser settings, including blocking them
        entirely; the Site&rsquo;s informational pages will still work, though some preferences
        may not persist. Where a consent banner is shown, you can change your choice at any time
        through the cookie settings link in the footer. Because there is no common standard, the
        Site does not currently respond to &lsquo;Do Not Track&rsquo; signals; where legally
        required, we honor recognized opt-out preference signals such as the Global Privacy
        Control. [Counsel: confirm GPC posture by jurisdiction.]
      </>,
    ],
  },
  {
    id: "changes-and-contact",
    heading: "Changes and Contact",
    paragraphs: [
      <>
        We will update this Notice when our actual use of cookies changes, and the &lsquo;Last
        updated&rsquo; date will change accordingly. Questions: {contact} [replace with dedicated
        privacy route when confirmed].
      </>,
    ],
  },
];

export default function CookiesPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="canopy-light" variant="full" focus="54% 42%" mobileFocus="62% 40%" vivid />
      <PageHero
        compact
        tone="ink"
        label="Legal"
        title="Cookie Notice"
        sub="How this site uses cookies and similar technologies."
      />
      <Section tight>
        <Callout
          title="Draft for counsel review (not approved for publication)"
          body="Last updated: June 11, 2026. Bracketed items are open decisions."
        />
        <LegalDoc
          meta="Midgard Labs, Inc. · Last updated: June 11, 2026"
          sections={SECTIONS}
          footnote={
            <>
              Open items: confirm production hosting and any cookies it sets by default [Vercel
              staging behavior to be verified]; final analytics decision; consent-management
              tooling if analytics are enabled; GPC handling.
            </>
          }
        />
      </Section>
    </main>
  );
}
