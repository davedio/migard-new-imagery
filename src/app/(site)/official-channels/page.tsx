import Link from "next/link";
import LegalDoc, { type LegalSection } from "@/components/site/LegalDoc";
import styles from "@/components/site/LegalDoc.module.css";
import PageBackdrop from "@/components/site/PageBackdrop";
import { PageHero, Section } from "@/components/site/ui";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("officialChannels");

/* Source of truth: Midgard_Official_Channels_Scam_Safety_CLEAN_2026-06-11.docx
   (Website Policy Pack 2026-06-11). Text is verbatim; bracketed items are
   counsel's open decisions and stay until sign-off. The live, confirmed link
   list is /official-links — this page is the policy telling of the same
   ground and links there rather than restating current URLs. */

const contact = <a href="mailto:info@midgardlabs.io">info@midgardlabs.io</a>;

const CHANNELS = [
  {
    channel: "Email",
    address: "info@midgardlabs.io",
    notes: "The primary official channel — general, legal, privacy, and security contact.",
  },
  {
    channel: "Website and documentation",
    address: "midgardprotocol.io",
    notes: "The only official website. Verify the exact domain spelling.",
  },
  {
    channel: "GitHub",
    address: "github.com/Anastasia-Labs/midgard",
    notes: "Source code and specifications.",
  },
  {
    channel: "X (Twitter)",
    address: "x.com/midgardprotocol (@midgardprotocol)",
    notes: "Announcements. We never DM first.",
  },
] as const;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "why-this-page-exists",
    heading: "Why This Page Exists",
    paragraphs: [
      <>
        This page is the source of truth for Midgard channels. If a website, account, message, or
        claim page is not listed here, treat it as hostile and check before acting.
      </>,
    ],
  },
  {
    id: "official-channels",
    heading: "Official Channels",
    paragraphs: [],
    after: (
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Channel</th>
            <th scope="col">Address</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {CHANNELS.map((row) => (
            <tr key={row.channel}>
              <td>{row.channel}</td>
              <td>{row.address}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: "what-we-will-never-do",
    heading: "What We Will Never Do",
    paragraphs: [
      <>
        We never DM first or ask for seed phrases, private keys, passwords, or device access. We
        never ask you to send funds to verify a wallet, unlock a reward, or migrate assets. There
        is no Midgard token. Fees are paid in ADA, and anyone selling a Midgard token is running
        a scam. Official support occurs only in the public channels above.
      </>,
    ],
  },
  {
    id: "verify-and-report",
    heading: "How to Verify and How to Report",
    paragraphs: [
      <>
        Open this page directly and compare addresses character by character; lookalike domains
        and handles are common. Report impersonation with links and screenshots to {contact} and
        to the relevant platform. If you exposed keys or sent funds, treat the wallet as
        compromised and move remaining assets from a clean device.
      </>,
    ],
  },
];

export default function OfficialChannelsPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="trunk-runes" variant="full" focus="53% 48%" mobileFocus="54% 48%" />
      <PageHero
        compact
        tone="ink"
        label="Trust & safety"
        title="Official Channels & Scam Safety"
        sub="The policy record of which channels are real and what we will never do."
        actions={[{ label: "See the live link list", href: "/official-links", variant: "primary" }]}
      />
      <Section tight>
        <LegalDoc
          meta="Midgard Labs, Inc. · Last updated: July 2026"
          sections={SECTIONS}
          footnote={
            <>
              The confirmed, maintained link list lives at{" "}
              <Link href="/official-links">/official-links</Link>. Additional channels (Discord,
              YouTube, Telegram, Farcaster) will be listed only when actually controlled and
              monitored.
            </>
          }
        />
      </Section>
    </main>
  );
}
