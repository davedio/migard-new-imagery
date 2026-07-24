import Link from "next/link";
import LegalDoc, { type LegalSection } from "@/components/site/LegalDoc";
import PageBackdrop from "@/components/site/PageBackdrop";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("terms");

/* Source of truth: Midgard_Website_Terms_of_Use_CLEAN_2026-06-11.docx
   (Website Policy Pack 2026-06-11). Text is verbatim; bracketed items are
   counsel's open decisions and stay until sign-off. */

const contact = <a href="mailto:info@midgardlabs.io">info@midgardlabs.io</a>;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who We Are and What These Terms Cover",
    paragraphs: [
      <>
        These Terms of Use (the &lsquo;Terms&rsquo;) govern access to and use of the Midgard
        website, documentation pages, launch materials, official links page, and forms that link
        to these Terms (together, the &lsquo;Site&rsquo;). The Site is operated by Midgard Labs,
        Inc. (&lsquo;Midgard Labs&rsquo;, &lsquo;we&rsquo;, &lsquo;us&rsquo;, or &lsquo;our&rsquo;).
        The canonical website address is{" "}
        <a href="https://midgardprotocol.io">midgardprotocol.io</a>. You can reach us at{" "}
        {contact} for all inquiries, including legal, privacy, and security matters.
      </>,
    ],
  },
  {
    id: "site-is-not-the-protocol",
    heading: "The Site Is Not the Protocol",
    paragraphs: [
      <>
        Midgard is an open-source, permissionless blockchain protocol designed for smart
        contracts on public blockchain infrastructure. The protocol is not part of the
        Site and is not offered as a service through the Site. We do not, through the Site or
        otherwise, custody digital assets, control user wallets, execute transactions on
        anyone&rsquo;s behalf, or have the unilateral ability to alter, reverse, or censor
        activity on public blockchains. Anyone with the requisite technical means can interact
        with public blockchain infrastructure without using the Site at all.
      </>,
      <>
        Nothing on the Site grants you any right to use the protocol, and these Terms impose no
        conditions on protocol-level activity. If we publish specific programs (for example
        testnet participation, bug bounties, or grants), those programs will carry their own
        published terms, which will govern together with these Terms. As of the date above, the
        protocol is pre-alpha software intended for test environments. Nothing on the Site is an
        invitation to commit real funds to any Midgard environment, and no page should be read as
        a statement that the protocol is production-ready, fully audited, or safe for real value
        unless that page expressly and currently says so.
      </>,
    ],
  },
  {
    id: "acceptance-and-changes",
    heading: "Acceptance and Changes",
    paragraphs: [
      <>
        By accessing or using the Site, you agree to these Terms. If you do not agree, do not use
        the Site. We may revise these Terms at any time by posting an updated version on this page
        with an updated &lsquo;Last updated&rsquo; date. Your continued use of the Site after
        changes take effect constitutes acceptance of the revised Terms.
      </>,
    ],
  },
  {
    id: "eligibility",
    heading: "Eligibility and Legal Compliance",
    paragraphs: [
      <>
        You may use the Site only if you are at least 18 years old, capable of forming a binding
        contract, and not barred from using the Site under applicable law. You represent that your
        use of the Site complies with all laws and regulations that apply to you, including
        applicable sanctions laws and regulations such as those administered by the U.S.
        Department of the Treasury&rsquo;s Office of Foreign Assets Control. You may not use the
        Site if you are located in, organized in, or a resident of a comprehensively sanctioned
        jurisdiction, or if you are listed on, or owned or controlled by persons listed on,
        applicable sanctions lists.
      </>,
    ],
  },
  {
    id: "informational-content",
    heading: "Informational Content; No Advice; No Offer",
    paragraphs: [
      <>
        The Site is provided for informational purposes. It may describe software, smart
        contracts, integrations, research, roadmaps, and third-party services that are
        experimental, under active development, available only in test environments, or subject
        to change without notice. Site content may be incomplete or out of date, and
        forward-looking statements (including roadmaps and timelines) describe intentions, not
        commitments.
      </>,
      <>
        Nothing on the Site constitutes legal, financial, investment, tax, accounting, or other
        professional advice, and nothing on the Site is an offer, solicitation, or recommendation
        to buy, sell, hold, stake, lend, or otherwise transact in any asset or financial
        product. You are solely responsible for evaluating any information on the Site before
        relying on it.
      </>,
    ],
  },
  {
    id: "no-token-promises",
    heading: "No Promises or Entitlements",
    paragraphs: [
      <>
        There is no Midgard token. The Site does not offer or promise one, and no such offer
        should be inferred. Visiting the Site, joining a mailing list, completing a form,
        connecting a wallet, testing software, or participating in community channels creates no
        entitlement of any kind. Treat any message, page, or post that promises Midgard tokens,
        airdrops, or rewards as a scam, and verify everything against our{" "}
        <Link href="/official-links">official channels page</Link>. We will never ask for your
        seed phrase, private keys, or passwords.
      </>,
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable Use",
    paragraphs: [
      <>
        You agree not to misuse the Site. Among other things, you may not: use the Site in
        violation of law or sanctions restrictions; phish, defraud, impersonate, or mislead
        others, including by creating fake claim pages or fake official links; probe, scan, or
        test the vulnerability of our systems except as authorized under our{" "}
        <Link href={OFFICIAL_LINKS.securityPolicy}>Vulnerability Disclosure Policy</Link>;
        interfere with or disrupt the Site, its infrastructure, or its security or authentication
        measures; scrape or harvest data from the Site using automated means other than ordinary
        search-engine indexing; upload malicious code; misuse the Midgard or Midgard Labs names,
        logos, or marks; or encourage or enable anyone else to do any of the foregoing. We may
        investigate violations and cooperate with law enforcement.
      </>,
    ],
  },
  {
    id: "intellectual-property",
    heading: "Intellectual Property",
    paragraphs: [
      <>
        The Site and its content (text, graphics, designs, and other materials) are protected by
        intellectual property laws, and we and our licensors retain all rights in them. We grant
        you a limited, revocable, non-exclusive, non-transferable license to access and use the
        Site for its intended informational purposes. This section does not restrict your rights
        under any open-source license: Midgard protocol code and other repositories are licensed
        under the terms stated in the applicable repositories, and those license terms govern that
        code. The Midgard and Midgard Labs names and logos are our trademarks; nothing in these
        Terms grants any license to use them, and any permitted uses will be described in our
        brand guidelines when published. Other names and logos that appear on the Site belong to
        their respective owners, and their appearance has only the meaning expressly stated on the
        relevant page; a name or logo does not by itself imply endorsement, partnership,
        production support, or integration readiness.
      </>,
      <>
        If you send us questions, comments, suggestions, or other feedback about the Site or the
        protocol, you grant us an unrestricted, perpetual, irrevocable, royalty-free right to use
        that feedback for any purpose without obligation to you.
      </>,
    ],
  },
  {
    id: "third-party-services",
    heading: "Third-Party Services and Links",
    paragraphs: [
      <>
        The Site may link to or reference third-party services such as wallets, block explorers,
        code repositories, analytics tools, community platforms, and partner websites. Third-party
        services are operated by their providers under their own terms and privacy policies. We do
        not control them, do not endorse them unless expressly stated, and are not responsible for
        their content, availability, security, or practices. Your dealings with third parties are
        solely between you and them.
      </>,
    ],
  },
  {
    id: "privacy",
    heading: "Privacy",
    paragraphs: [
      <>
        Our collection and use of information in connection with the Site are described in the
        Midgard <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/cookies">Cookie Notice</Link>. Do not submit seed
        phrases, private keys, passwords, or unnecessary personal or sensitive information through
        any Site form or contact route.
      </>,
    ],
  },
  {
    id: "disclaimers",
    heading: "Disclaimers and Assumption of Risk",
    paragraphs: [
      <>
        THE SITE IS PROVIDED ON AN &lsquo;AS IS&rsquo; AND &lsquo;AS AVAILABLE&rsquo; BASIS. TO
        THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER
        EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE
        WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR ACCURATE.
      </>,
      <>
        YOU ACKNOWLEDGE THAT CRYPTOGRAPHIC AND BLOCKCHAIN-BASED SYSTEMS CARRY SIGNIFICANT INHERENT
        RISKS, INCLUDING SOFTWARE BUGS AND VULNERABILITIES, PROTOCOL CHANGES, NETWORK CONGESTION
        AND VARIABLE FEES, IRREVERSIBLE TRANSACTIONS, LOSS OF KEYS, THIRD-PARTY SERVICE FAILURES,
        AND EXTREME ASSET VOLATILITY. IF YOU CHOOSE TO INTERACT WITH ANY BLOCKCHAIN PROTOCOL,
        INCLUDING ANY MIDGARD TEST ENVIRONMENT, YOU DO SO AT YOUR OWN RISK AND ASSUME FULL
        RESPONSIBILITY FOR THOSE RISKS. SECURITY REVIEWS, AUDITS, FORMAL METHODS, AND BUG
        BOUNTIES, WHERE REFERENCED, REDUCE BUT DO NOT ELIMINATE RISK.
      </>,
    ],
  },
  {
    id: "limitation-of-liability",
    heading: "Limitation of Liability",
    paragraphs: [
      <>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER MIDGARD LABS NOR ITS OFFICERS, DIRECTORS,
        EMPLOYEES, AGENTS, OR SERVICE PROVIDERS WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
        SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, OR FOR LOST PROFITS, LOST DATA, LOSS OF
        GOODWILL, SERVICE INTERRUPTION, OR THE COST OF SUBSTITUTE SERVICES, ARISING OUT OF OR IN
        CONNECTION WITH THESE TERMS OR THE USE OF OR INABILITY TO USE THE SITE, UNDER ANY LEGAL
        THEORY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. TO THE MAXIMUM EXTENT
        PERMITTED BY LAW, OUR TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS
        OR THE SITE WILL NOT EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (USD 100) OR THE
        AMOUNTS YOU HAVE PAID US FOR USE OF THE SITE IN THE TWELVE MONTHS BEFORE THE CLAIM AROSE.
        SOME JURISDICTIONS DO NOT ALLOW CERTAIN EXCLUSIONS OR LIMITATIONS, SO SOME OF THE ABOVE
        MAY NOT APPLY TO YOU.
      </>,
    ],
  },
  {
    id: "indemnification",
    heading: "Indemnification",
    paragraphs: [
      <>
        You will indemnify and hold harmless Midgard Labs and its officers, directors, employees,
        and agents from and against any claims, disputes, demands, liabilities, damages, losses,
        costs, and expenses (including reasonable legal fees) arising out of or in any way
        connected with your use of the Site or your violation of these Terms.
      </>,
    ],
  },
  {
    id: "suspension-and-termination",
    heading: "Suspension and Termination",
    paragraphs: [
      <>
        We may suspend, restrict, or terminate your access to the Site at any time, with or
        without notice, including where we believe you have violated these Terms or where required
        for legal or security reasons. Sections that by their nature should survive termination
        (including Sections 8, and 11 through 16) survive.
      </>,
    ],
  },
  {
    id: "governing-law",
    heading: "Governing Law and Dispute Resolution",
    paragraphs: [
      <>
        These Terms are governed by the laws of the State of Wyoming, United States, without
        regard to conflict-of-laws principles. Before either party files an arbitration, that
        party will send the other a written notice of the dispute, and the parties will attempt
        in good faith to resolve it informally for 30 days. Any dispute arising out of or
        relating to these Terms or the Site that is not resolved informally will be resolved by
        binding individual arbitration administered by the American Arbitration Association
        (&lsquo;AAA&rsquo;) under its rules then in effect, except that either party may bring
        qualifying claims in small-claims court or seek injunctive relief in court to protect
        intellectual property rights. Except where prohibited by applicable law, any claim under
        these Terms must be brought within one year after the claim arises, or it is permanently
        barred. YOU AND MIDGARD LABS EACH WAIVE THE RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN A
        CLASS OR REPRESENTATIVE ACTION.
      </>,
    ],
  },
  {
    id: "general",
    heading: "General",
    paragraphs: [
      <>
        These Terms, together with the <Link href="/privacy">Privacy Policy</Link>,{" "}
        <Link href="/cookies">Cookie Notice</Link>, and any program-specific terms we publish, are
        the entire agreement between you and
        Midgard Labs regarding the Site, and they supersede prior agreements on that subject. If
        any provision is held invalid, the remaining provisions remain in effect. Our failure to
        enforce a provision is not a waiver. You may not assign these Terms; we may assign them in
        connection with a merger, acquisition, reorganization, or sale of assets. We are not
        liable for delays or failures caused by events beyond our reasonable control. Notices may
        be provided by posting on the Site or by email where you have provided one. Section
        headings are for convenience only.
      </>,
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    paragraphs: [
      <>
        Questions about these Terms: {contact}.
      </>,
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="stone-gateway" variant="full" focus="65% 52%" mobileFocus="73% 55%" />
      <PageHero
        compact
        tone="ink"
        label="Legal"
        title="Terms of Use"
        sub="The terms that govern access to and use of the Midgard website and documentation pages."
      />
      <Section tight>
        <LegalDoc meta="Midgard Labs, Inc. · Last updated: July 2026" sections={SECTIONS} />
      </Section>
    </main>
  );
}
