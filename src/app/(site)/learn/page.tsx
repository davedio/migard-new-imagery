import type { Metadata } from "next";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { SITE_COPY } from "@/lib/siteCopy";

export const metadata: Metadata = {
  title: "Learn Midgard",
  description:
    "A plain-language map of Midgard: users, builders, protocol roles, transaction flow, and security assumptions.",
  openGraph: {
    title: "Learn Midgard",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

const audienceRows = [
  {
    label: "Users",
    body: SITE_COPY.paths[0].body,
    href: "/learn#transaction-flow",
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

const flowRows = SITE_COPY.lifecycle.map(([label, body]) => ({
  label,
  body,
}));

const securityRows = [
  {
    label: "Fast first",
    body: "Operators sequence activity quickly so apps feel responsive.",
  },
  {
    label: "Verification before settlement",
    body: "Committed state remains checkable before final Cardano L1 settlement.",
  },
  {
    label: "One honest Watcher",
    body: "One honest Watcher, out of any number, is enough to stop a bad block before it settles.",
  },
  {
    label: "Contracts and source",
    body: "Validators, reference scripts, and implementation history are published for review.",
    href: "/developers#contracts",
  },
] as const;

export default function LearnPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="tree-vista-wide" focus="58% 42%" />
      <PageHero
        compact
        tone="tree"
        label="Learn"
        title="Learn Midgard."
        sub="A plain-language map of faster UTXO execution, independent verification, and Cardano L1 settlement."
        actions={[
          { label: "See transaction flow", href: "/how-it-works", variant: "primary" },
          { label: "Read FAQ", href: "/faq", variant: "ghost" },
        ]}
      />

      <JumpChips
        items={[
          { id: "paths", label: "Paths" },
          { id: "transaction-flow", label: "Flow" },
          { id: "security-overview", label: "Security" },
          { id: "reference", label: "Reference" },
        ]}
      />

      <Section
        id="paths"
        title="Start with the path that matches you."
        lead="Midgard has one protocol path, but different readers need different entry points."
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
        id="transaction-flow"
        title="Fast execution first. Verification before final settlement."
        lead="The cinematic page shows the journey down the tree. This is the same path in plain language."
      >
        <DataRows rows={flowRows} ariaLabel="Plain-language transaction flow" />
      </Section>

      <Section
        id="security-overview"
        title="Security assumptions you can inspect."
        lead="Midgard should be read as an optimistic rollup: fast confirmations up front, public checks before final settlement."
        cols
      >
        <DataRows rows={securityRows} ariaLabel="Security assumptions" />
      </Section>

      <Section id="reference" title="Reference pages." tight cols>
        <DataRows
          ariaLabel="Learn reference pages"
          rows={[
            {
              label: "How it works",
              body: "Follow the transaction journey visually, from submit to Cardano settlement.",
              href: "/how-it-works",
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
          ]}
        />
      </Section>
    </main>
  );
}
