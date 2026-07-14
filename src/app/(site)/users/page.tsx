import type { Metadata } from "next";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export const metadata: Metadata = {
  title: "Users | Midgard",
  description:
    "What users get from Midgard: faster app interactions, fees in ADA, and settlement rooted back to Cardano.",
  openGraph: {
    title: "Users | Midgard",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

const benefitRows = [
  {
    label: "Faster app feel",
    body: "Transactions can become usable in seconds while final settlement continues underneath.",
  },
  {
    label: "A clearer exit path",
    body: "Deposit once, transact as much as you like, and withdraw when you're done.",
  },
] as const;

/* The user side of network economics — /economics folded into the audience
   pages 2026-07-11; the cross-entity table lives on /learn#economics. */
const economicsRows = [
  {
    label: "What you pay",
    body: "Fees in ADA — a fraction of L1 cost, estimated.",
  },
  {
    label: "What you hold",
    body: "ADA and the Cardano wallet you already have. Nothing new to buy, bridge, or manage.",
  },
  {
    label: "Where value settles",
    body: "Every commitment lands back on Cardano after verification — the same base layer securing your L1 funds.",
  },
  {
    label: "The whole picture",
    body: "Compare what every participant pays and earns across the network.",
    href: "/learn#economics",
  },
] as const;

const simplePathRows = [
  {
    label: "Deposit",
    body: "Move funds into the Midgard path through a supported app or wallet flow.",
  },
  {
    label: "Transact",
    body: "Use the app with faster confirmations while Operators order activity.",
  },
  {
    label: "Withdraw",
    body: "Return settled value back through Cardano when you are done.",
  },
] as const;

const statusRows = [
  {
    label: "Pre-alpha testnet",
    body: "Midgard is live on Cardano preprod today. Do not treat testnet activity as mainnet use.",
  },
  {
    label: "No seed phrases",
    body: "Midgard will never ask for your seed phrase or private keys.",
  },
  {
    label: "Use official links",
    body: "Start from the official channels before testing any app, form, or community link.",
    href: OFFICIAL_LINKS.discord,
    external: true,
  },
] as const;

export default function UsersPage() {
  return (
    <main className="page-main">
      {/* The terraced "steps" — Dave's pick for this page (2026-07-11),
          inherited from the retired /economics page. */}
      <PageBackdrop name="terraces" variant="full" focus="55% 70%" vivid />
      <PageHero
        compact
        tone="moss"
        label="Users"
        title="What users get from Midgard."
        sub="A faster app experience for Cardano users, without asking you to leave ADA behind or trust a private operator database."
        actions={[
          { label: "Learn how it works", href: "/learn", variant: "primary" },
          { label: "Read FAQ", href: "/faq", variant: "ghost" },
        ]}
      />

      <JumpChips
        items={[
          { id: "benefits", label: "Benefits" },
          { id: "economics", label: "Economics" },
          { id: "path", label: "Simple path" },
          { id: "status", label: "Status" },
        ]}
      />

      <Section
        id="benefits"
        title="What changes for users."
        lead="Midgard is meant to make Cardano apps feel faster without changing the thing users already understand: value settles back to Cardano."
      >
        <DataRows rows={benefitRows} ariaLabel="User benefits" />
      </Section>

      <Section
        id="economics"
        title="What it costs you."
        lead="Pay in ADA, hold nothing new, settle back to Cardano."
      >
        <DataRows rows={economicsRows} ariaLabel="User economics" />
      </Section>

      <Section
        id="path"
        title="The simple path."
        cols
        aside={
          <Statement
            align="left"
            kicker="User path"
            line="Deposit. Transact. Withdraw."
            sub="The verification machinery stays visible for reviewers, but normal users should not have to think about it."
          />
        }
      >
        <DataRows rows={simplePathRows} ariaLabel="Simple Midgard user path" />
      </Section>

      <Section id="status" title="What to know right now." tight>
        <DataRows rows={statusRows} ariaLabel="User status and safety notes" />
      </Section>
    </main>
  );
}
