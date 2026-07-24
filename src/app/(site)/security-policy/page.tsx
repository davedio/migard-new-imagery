import LegalDoc, { ReviewFlag, type LegalSection } from "@/components/site/LegalDoc";
import { ExternalLinkNotice } from "@/components/site/ExternalLinkNotice";
import PageBackdrop from "@/components/site/PageBackdrop";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("securityPolicy");

/* Source of truth: Midgard_Vulnerability_Disclosure_Policy_CLEAN_2026-06-11.docx
   (Website Policy Pack 2026-06-11). Text is verbatim; bracketed items are
   counsel's open decisions and stay until sign-off. */

const contact = <a href="mailto:info@midgardlabs.io">info@midgardlabs.io</a>;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "commitment",
    heading: "Our Commitment",
    paragraphs: [
      <>
        Security research makes Midgard safer, and we welcome it. This policy explains what is in
        scope, how to report a vulnerability to us, what you can expect from us, and the rules
        that keep research safe and lawful. This policy covers good-faith security research only;
        it is not an invitation to access user data, disrupt services, or test third-party
        systems.
      </>,
    ],
  },
  {
    id: "scope",
    heading: "Scope",
    paragraphs: [
      <>
        In scope: the Midgard website and its infrastructure
        (<a href="https://midgardprotocol.io">midgardprotocol.io</a>); Midgard
        open-source repositories under the official{" "}
        <a href={OFFICIAL_LINKS.github} target="_blank" rel="noopener noreferrer">
          GitHub organization<ExternalLinkNotice />
        </a>
        ; and Midgard smart contracts and node software when deployed on test networks (preprod
        and any published testnet environments). Out of scope: third-party services we link to or rely on
        (wallets, explorers, hosting providers, community platforms), which have their own
        policies; social engineering, phishing, or physical attacks against team members or
        contributors; denial-of-service or volumetric testing against any live system; and any
        system or contract not listed as in scope. If a public testnet bug bounty launches, it
        will be published separately with its own scope, rules, and rewards, and that
        program&rsquo;s terms will govern bounty payments.
      </>,
    ],
  },
  {
    id: "how-to-report",
    heading: "How to Report",
    paragraphs: [
      <>
        Report vulnerabilities to {contact}. Include: a description of the issue and its impact; the
        affected component, address, or URL; reproduction steps or a proof of concept; and how we
        can reach you for follow-up. If the report is sensitive, ask us for a secure channel
        before sending details. Please give us a
        reasonable opportunity to remediate before any public disclosure, and coordinate
        disclosure timing with us; our default coordination window is 90 days from
        acknowledgment, extendable by agreement for complex protocol issues.
      </>,
    ],
  },
  {
    id: "what-to-expect",
    heading: "What You Can Expect From Us",
    paragraphs: [
      <>
        We will acknowledge your report within 3 business days, keep you
        informed of progress, remediate confirmed issues as quickly as severity warrants, and
        credit you in our disclosure if you want credit. This policy itself does not create a
        bounty or payment obligation; any rewards exist only under a separately published bounty
        program and its terms.
      </>,
    ],
  },
  {
    id: "safe-harbor",
    heading: "Safe Harbor and Rules",
    paragraphs: [
      <>
        <ReviewFlag>
          We will not pursue or support legal action against you for good-faith security research
          that follows this policy, and we will consider such research authorized under applicable
          anti-hacking and anti-circumvention laws to the extent we can grant that authorization.
          To stay within this safe harbor: act in good faith and avoid privacy violations, data
          destruction, and service degradation; access, copy, or retain only the minimum data
          needed to demonstrate the issue, and never access someone else&rsquo;s data deliberately; do
          not exploit a finding beyond demonstration, including extracting value from any contract
          or moving assets you do not own (testnet assets included, where doing so would distort
          the environment for others); stop and report immediately if you encounter personal data
          or real-fund exposure; do not test out-of-scope systems; and comply with applicable law.
          We cannot authorize research against third-party systems, and this safe harbor does not
          bind third parties or authorities.
        </ReviewFlag>
      </>,
    ],
  },
  {
    id: "contact-and-changes",
    heading: "Contact and Changes",
    paragraphs: [
      <>
        Security contact: {contact}. We also publish this contact in a{" "}
        <a href="/.well-known/security.txt">security.txt</a> file at the canonical domain.
        We may update this policy
        from time to time; the &lsquo;Last updated&rsquo; date will change accordingly.
      </>,
    ],
  },
];

export default function SecurityPolicyPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="tree-vista-wide" variant="full" focus="66% 54%" mobileFocus="76% 58%" />
      <PageHero
        compact
        tone="ink"
        label="Trust & safety"
        title="Vulnerability Disclosure Policy"
        sub="How to report security issues in the Midgard website, repositories, and test-network deployments."
      />
      <Section tight>
        <LegalDoc
          meta="Midgard Labs, Inc. · Last updated: July 24, 2026"
          sections={SECTIONS}
          footnote={
            <ReviewFlag>
              Open items: counsel review of the safe-harbor wording; alignment with the future
              testnet bug bounty terms when that program launches.
            </ReviewFlag>
          }
        />
      </Section>
    </main>
  );
}
