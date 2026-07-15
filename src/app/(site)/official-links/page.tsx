import type { Metadata } from "next";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Official Links | Midgard",
  description:
    "The canonical Midgard links: GitHub, whitepaper, contracts, Discord, and X. Verify before you trust. Midgard is pre-alpha; there is no token or sale today.",
  openGraph: {
    title: "Official Links | Midgard",
    images: [{ url: "/og/official-links.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/official-links.jpg"] },
};

/* Whitepaper lives outside OFFICIAL_LINKS for now — kept local until the
   constant is promoted alongside the domain decision. */
const whitepaper = "https://anastasia-labs.github.io/midgard/midgard.pdf";

/* The canonical-website row is deliberately omitted pending the team's
   domain decision. */
const canonicalRows = [
  {
    label: "GitHub",
    body: "The node, the contracts, and the SDK source — Anastasia-Labs/midgard.",
    meta: "↗",
    href: OFFICIAL_LINKS.github,
    external: true,
  },
  {
    label: "Whitepaper",
    body: "The full protocol design, end to end.",
    meta: "↗",
    href: whitepaper,
    external: true,
  },
  {
    label: "Contract addresses",
    body: "Verify every validator and state anchor on Cardano preprod.",
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
    body: "Register interest — the only official form.",
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
    label: "Questions",
    body: "Common questions, including how to avoid scams.",
    href: "/faq",
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
        title="Official links."
        sub="One page of canonical links, so you can tell the real Midgard from the fakes. If it is not listed here, it is not us."
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
        lead="Midgard is in pre-alpha. We will never DM you first, and we will never ask for your seed phrase or private keys. There is no Midgard token today — no sale, no airdrop — and fees are paid in ADA."
        cols
      >
        <Statement
          align="left"
          line="If a link, wallet, or token claims to be Midgard and is not listed on this page, treat it as fake."
        />
      </Section>

      <Section id="links" title="The canonical list." cols>
        <DataRows rows={canonicalRows} ariaLabel="Canonical Midgard links" />
      </Section>

      <Section id="explore" title="Keep exploring." tight cols>
        <DataRows rows={exploreRows} ariaLabel="Related Midgard pages" />
      </Section>
    </main>
  );
}
