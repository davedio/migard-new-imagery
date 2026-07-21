import Link from "next/link";
import LegalDoc, { ReviewFlag, type LegalSection } from "@/components/site/LegalDoc";
import PageBackdrop from "@/components/site/PageBackdrop";
import { PageHero, Section } from "@/components/site/ui";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("privacy");

/* Source of truth: Midgard_Website_Privacy_Policy_CLEAN_2026-06-11.docx
   (Website Policy Pack 2026-06-11). Text is verbatim; bracketed items are
   counsel's open decisions and stay until sign-off. */

const contact = <a href="mailto:info@anastasialabs.com">info@anastasialabs.com</a>;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "scope",
    heading: "Scope and Who Is Responsible",
    paragraphs: [
      <>
        This Privacy Policy explains how Midgard Labs, Inc. (&lsquo;Midgard Labs&rsquo;,
        &lsquo;we&rsquo;, &lsquo;us&rsquo;, or &lsquo;our&rsquo;) collects, uses, shares, and retains
        information when you visit the Midgard website and documentation pages, subscribe to
        updates, submit a form, contact us, or report a security issue (together, the
        &lsquo;Site&rsquo;). The canonical website address is{" "}
        <ReviewFlag>[TBD: confirm final production URL before publication]</ReviewFlag>. For privacy
        questions or requests, contact {contact}{" "}
        <ReviewFlag>
          [single contact route for the staging period; replace with a dedicated privacy route when
          confirmed]
        </ReviewFlag>.
      </>,
      <>
        This Policy covers the Site only. It does not cover the Midgard protocol itself, which is
        open-source software that operates on public blockchain infrastructure we do not control,
        and it does not cover third-party services we link to, such as wallets, code repositories,
        block explorers, or community platforms, which have their own privacy policies.
      </>,
    ],
  },
  {
    id: "information-we-collect",
    heading: "Information We Collect",
    paragraphs: [
      <>
        We aim to collect little. The Site does not require an account. Depending on how you
        interact with us, we may collect: contact information you choose to provide (such as name,
        email address, organization, and social or messaging handles) when you join a mailing
        list, complete an interest or early-access form, or contact us; the content of your
        messages, form submissions, and security reports, including any attachments you include;
        technical information collected automatically when you visit the Site, such as IP address,
        browser and device type, pages viewed, referring page, approximate region, and similar log
        data; cookie and similar identifiers as described in our{" "}
        <Link href="/cookies">Cookie Notice</Link>; and wallet
        addresses or transaction identifiers only if you choose to submit them through a form or
        message (for example, in a support or testnet-feedback context).
      </>,
      <>
        Please do not submit seed phrases, private keys, passwords, government identifiers, or
        other sensitive personal information through any Site form or contact route. If you send
        them anyway, we will delete them where practicable.
      </>,
    ],
  },
  {
    id: "public-blockchain-data",
    heading: "A Note on Public Blockchain Data",
    paragraphs: [
      <>
        Blockchain data is public by design. Transactions, addresses, and smart-contract
        interactions on public networks are visible to anyone, are replicated across many systems,
        and generally cannot be altered or deleted by us or anyone else. A wallet address is
        pseudonymous, but it can become identifying when combined with other information, including
        information you submit to us. If you link a wallet address to your identity in a form or
        message, the combination becomes personal information in our hands, and this Policy applies
        to our copy of it; it does not and cannot apply to the public blockchain record itself.
      </>,
    ],
  },
  {
    id: "how-we-use-information",
    heading: "How We Use Information",
    paragraphs: [
      <>
        We use information to operate, maintain, secure, and improve the Site; respond to
        messages, requests, and security reports; send updates you have requested (you can
        unsubscribe at any time using the link in each email); administer published programs such
        as testnet interest intake; understand aggregate Site usage; prevent and investigate
        fraud, abuse, phishing, impersonation, and security incidents; comply with legal
        obligations; and establish, exercise, or defend legal claims.
      </>,
    ],
  },
  {
    id: "legal-bases",
    heading: "Legal Bases (EEA and UK Visitors)",
    paragraphs: [
      <>
        Where the EU or UK General Data Protection Regulation applies, we process personal data on
        these legal bases: consent (for example, mailing-list subscriptions and any non-essential
        cookies, which you may withdraw at any time); legitimate interests (operating and securing
        the Site, preventing abuse, responding to messages, and measuring aggregate usage in a
        privacy-respecting way); and compliance with legal obligations. Where we rely on
        legitimate interests, we balance them against your rights and expectations.
      </>,
    ],
  },
  {
    id: "how-we-share-information",
    heading: "How We Share Information",
    paragraphs: [
      <>
        We do not sell personal information, and we do not share it for cross-context behavioral
        advertising. We share information only with: service providers that help us run the Site,
        such as hosting{" "}
        <ReviewFlag>[currently Vercel for staging; confirm production hosting]</ReviewFlag>, form
        and survey tools <ReviewFlag>[currently Google Forms for intake]</ReviewFlag>, email delivery,
        and analytics if
        activated, in each case under terms that limit their use of the data; professional
        advisors such as counsel, auditors, and insurers; authorities or other parties where
        required by law, legal process, or sanctions compliance, or where reasonably necessary to
        protect the rights, safety, or security of any person or of the Site; and successor
        entities in connection with a merger, acquisition, financing, or reorganization, subject
        to appropriate protections.{" "}
        <ReviewFlag>
          [Confirm the final vendor list before publication and keep it current in this section or a
          linked subprocessor list]
        </ReviewFlag>.
      </>,
    ],
  },
  {
    id: "cookies-and-analytics",
    heading: "Cookies and Analytics",
    paragraphs: [
      <>
        The Site currently uses only the cookies and similar technologies described in our{" "}
        <Link href="/cookies">Cookie Notice</Link>. Our default posture is minimal: essential
        operation first, analytics only if and when a specific tool is adopted, and no advertising
        cookies. If a tool requiring consent is activated for your jurisdiction, the Site will
        present a consent mechanism before that tool runs. See the{" "}
        <Link href="/cookies">Cookie Notice</Link> for the current list and your choices.
      </>,
    ],
  },
  {
    id: "retention",
    heading: "Retention",
    paragraphs: [
      <>
        We keep personal information only as long as needed for the purposes described above, and
        then delete or de-identify it. As a default: mailing-list data is kept until you
        unsubscribe or the list is retired; form submissions and correspondence are kept while we
        work with you and for a reasonable period afterward; security reports are kept while
        remediation and any disclosure coordination are in progress and for record-keeping after;
        and routine technical logs are kept for a short operational window.{" "}
        <ReviewFlag>
          [Counsel and team: confirm specific retention periods per category before publication]
        </ReviewFlag>. We may retain
        information longer where required by law or to resolve disputes.
      </>,
    ],
  },
  {
    id: "international-transfers",
    heading: "International Transfers",
    paragraphs: [
      <>
        We may process and store information in countries other than the one where you live,
        including the United States, and those countries may have different data-protection rules.
        Where required, we use appropriate safeguards for cross-border transfers, such as standard
        contractual clauses.{" "}
        <ReviewFlag>[Confirm transfer mechanisms with the final vendor list]</ReviewFlag>.
      </>,
    ],
  },
  {
    id: "your-rights",
    heading: "Your Rights and Choices",
    paragraphs: [
      <>
        Depending on where you live, you may have rights to access, correct, delete, or receive a
        copy of your personal information, to object to or restrict certain processing, to
        withdraw consent, and to lodge a complaint with a supervisory authority. California
        residents have rights under the CCPA/CPRA, including the rights to know, delete, and
        correct; we do not sell or share personal information as those terms are defined there,
        and we do not use sensitive personal information beyond permitted purposes. To exercise
        any right, contact {contact} with your request; we will verify your identity to the extent
        needed and respond within the time required by applicable law. We will not discriminate
        against you for exercising your rights. Note that we cannot modify or erase data recorded
        on public blockchains.
      </>,
    ],
  },
  {
    id: "children",
    heading: "Children",
    paragraphs: [
      <>
        The Site is not directed to anyone under 18, and we do not knowingly collect personal
        information from children. If you believe a child has provided us personal information,
        contact us and we will delete it.
      </>,
    ],
  },
  {
    id: "security",
    heading: "Security",
    paragraphs: [
      <>
        We use reasonable administrative and technical measures appropriate to the nature of the
        data we hold. No method of transmission or storage is completely secure, and we cannot
        guarantee absolute security. We will never ask for your seed phrase, private keys, or
        passwords, through any channel, ever.
      </>,
    ],
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    paragraphs: [
      <>
        We may update this Policy from time to time. We will post the updated version on this page
        with an updated &lsquo;Last updated&rsquo; date, and where changes are material we will
        provide additional notice as appropriate.
      </>,
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    paragraphs: [
      <>
        Privacy questions and requests: {contact}{" "}
        <ReviewFlag>[replace with dedicated privacy route when confirmed]</ReviewFlag>.{" "}
        <ReviewFlag>
          [Add registered entity address if required by applicable law; confirm whether an EU/UK
          representative or a data protection officer is required]
        </ReviewFlag>.
      </>,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="valley" variant="full" focus="52% 54%" mobileFocus="55% 54%" />
      <PageHero
        compact
        tone="ink"
        label="Legal"
        title="Privacy Policy"
        sub="How Midgard Labs collects, uses, shares, and retains information on this site."
      />
      <Section tight>
        <LegalDoc
          meta="Midgard Labs, Inc. · Last updated: July 16, 2026"
          sections={SECTIONS}
          footnote={
            <ReviewFlag>
              Open counsel items: canonical URL; final vendor and subprocessor list (hosting,
              forms, email, analytics); retention periods per category; cross-border transfer
              mechanisms; whether GDPR/UK representative or DPO appointment is required; CCPA
              applicability review; contact-route split; registered address disclosure.
            </ReviewFlag>
          }
        />
      </Section>
    </main>
  );
}
