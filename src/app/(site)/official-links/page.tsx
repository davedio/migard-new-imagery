import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("officialLinks");

/* The canonical-website row is deliberately omitted pending the team's
   domain decision. */
const canonicalRows = [
  {
    label: "GitHub",
    body: "The node, contracts, and SDK source: Anastasia-Labs/midgard.",
    meta: "↗",
    href: OFFICIAL_LINKS.github,
    external: true,
  },
  {
    label: "Technical specification",
    body: "The public working draft published from the official Midgard repository.",
    meta: "↗",
    href: OFFICIAL_LINKS.technicalSpec,
    external: true,
  },
  {
    label: "Preprod contracts",
    body: "The public static snapshot of contract addresses, state anchors, and genesis history.",
    href: "/developers#contracts",
  },
  {
    label: "Discord",
    body: "The official community and support server.",
    meta: "↗",
    href: OFFICIAL_LINKS.discord,
    external: true,
  },
  {
    label: "X · @midgardprotocol",
    body: "Announcements and technical milestones.",
    meta: "↗",
    href: OFFICIAL_LINKS.x,
    external: true,
  },
  {
    label: "Intake form",
    body: "Register interest through the only official form.",
    meta: "↗",
    href: OFFICIAL_LINKS.intakeForm,
    external: true,
  },
] as const;

const exploreRows = [
  {
    label: "Network status",
    body: "Every metric labeled with its real state.",
    href: "/status",
  },
  {
    label: "Security model",
    body: "Trust path, fault proofs, and disclosure route.",
    href: "/learn#security",
  },
  {
    label: "FAQs",
    body: "Common questions, including how to avoid scams.",
    href: "/learn#faq",
  },
] as const;

export default function OfficialLinksPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="rune-stones" variant="full" focus="55% 56%" mobileFocus="58% 58%" />
      <PageHero
        compact
        tone="ink"
        label="Trust & safety"
        title="Official links"
        sub="Official Midgard links. If it is not listed here, it is not us."
      />

      <JumpChips
        items={[
          { id: "verify", label: "Verify" },
          { id: "links", label: "The links" },
          { id: "explore", label: "Explore" },
        ]}
      />

      <Section
        id="verify"
        title="Verify, then trust."
        lead="Midgard is pre-alpha. We never DM first or ask for your seed phrase or private keys. There is no token, sale, or airdrop; fees are paid in ADA."
        cols
      >
        <Statement
          align="left"
          variant="supporting"
          line="Anything claiming to be Midgard but not listed here is fake."
        />
      </Section>

      <Section id="links" title="The canonical list" cols>
        <DataRows rows={canonicalRows} ariaLabel="Canonical Midgard links" />
      </Section>

      <Section id="explore" title="Keep exploring." tight cols>
        <DataRows rows={exploreRows} ariaLabel="Related Midgard pages" />
      </Section>
    </main>
  );
}
