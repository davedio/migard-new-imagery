import type { Metadata } from "next";
import Link from "next/link";
import LegalDoc, { type LegalSection } from "@/components/site/LegalDoc";
import styles from "@/components/site/LegalDoc.module.css";
import PageBackdrop from "@/components/site/PageBackdrop";
import { Callout, PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Official Channels & Scam Safety | Midgard",
  description:
    "The policy record of which Midgard channels are real, what we will never do, and how to report impersonations.",
  /* Counsel draft — keep out of search indexes until publication is approved. */
  robots: { index: false, follow: false },
};

/* Source of truth: Midgard_Official_Channels_Scam_Safety_CLEAN_2026-06-11.docx
   (Website Policy Pack 2026-06-11). Text is verbatim; bracketed items are
   counsel's open decisions and stay until sign-off. The live, confirmed link
   list is /official-links — this page is the policy telling of the same
   ground and links there rather than restating current URLs. */

const contact = <a href="mailto:info@anastasialabs.com">info@anastasialabs.com</a>;

const CHANNELS = [
  {
    channel: "Website and documentation",
    address: "[TBD: canonical production URL]",
    notes: "The only official website. Verify the exact domain spelling.",
  },
  {
    channel: "GitHub",
    address: "github.com/Anastasia-Labs/midgard [confirm canonical org/repo list]",
    notes: "Source code and specifications.",
  },
  {
    channel: "X (Twitter)",
    address: "[confirm official handle(s), e.g. @... ]",
    notes: "Announcements. We never DM first.",
  },
  {
    channel: "Discord",
    address: "[confirm permanent invite URL]",
    notes: "Community discussion and community-level support.",
  },
  {
    channel: "Email",
    address: "info@anastasialabs.com [replace with dedicated routes when confirmed]",
    notes: "General, legal, privacy, and security contact for now.",
  },
] as const;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "why-this-page-exists",
    heading: "Why This Page Exists",
    paragraphs: [
      <>
        Scammers impersonate blockchain projects. This page is the single source of truth for
        which Midgard channels are real. If a website, account, message, or &lsquo;claim
        page&rsquo; is not listed here, treat it as unofficial and assume it is hostile. Bookmark
        this page and check it before acting on anything that claims to be Midgard.
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
        We will never direct-message you first. We will never ask for your seed phrase, private
        keys, passwords, or remote access to your device. We will never ask you to send funds to
        &lsquo;verify&rsquo; a wallet, &lsquo;unlock&rsquo; a reward, or &lsquo;migrate&rsquo;
        assets. We will never announce a token, airdrop, points program, or claim page through
        unofficial channels; as of the date above there is no Midgard token, and any page or
        message claiming otherwise is a scam. Official support, where available, happens only in
        the public channels listed above, never in private messages.
      </>,
    ],
  },
  {
    id: "verify-and-report",
    heading: "How to Verify and How to Report",
    paragraphs: [
      <>
        Verify by navigating to this page directly (not through links in messages) and comparing
        addresses character by character; lookalike domains and handles are the most common trick.
        If you encounter an impersonation, fake site, or scam claiming to be Midgard, report it to{" "}
        {contact} with links and screenshots, and report it on the platform where you found it. If
        you have sent funds or exposed keys to a scammer, treat the affected wallet as compromised
        immediately and move remaining assets from a clean device.
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
        title="Official Channels & Scam Safety."
        sub="The policy record of which channels are real and what we will never do."
        actions={[{ label: "See the live link list", href: "/official-links", variant: "primary" }]}
      />
      <Section tight>
        <Callout
          title="Draft for review"
          body={
            <>
              Publish only after each listed channel is verified and access-controlled. Last
              updated: June 11, 2026. The confirmed, maintained link list lives at{" "}
              <Link href="/official-links">/official-links</Link>.
            </>
          }
        />
        <LegalDoc
          meta="Midgard Labs, Inc. · Last updated: June 11, 2026"
          sections={SECTIONS}
          footnote={
            <>
              Open items: canonical URL; confirmed list of official accounts with owners and
              access controls (per the existing account-control checklist); decision on listing
              additional channels (YouTube, Telegram, Farcaster) only when actually controlled and
              monitored.
            </>
          }
        />
      </Section>
    </main>
  );
}
