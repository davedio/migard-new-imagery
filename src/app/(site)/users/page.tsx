import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { DataRows, Statement } from "@/components/site/rhythm";
import { PageHero, Section } from "@/components/site/ui";
import { BENCHMARK_STATUS_NOTES } from "@/lib/siteCopy";
import { createPageMetadata } from "@/lib/siteMetadata";
import styles from "./users.module.css";

export const metadata = createPageMetadata("users");

const benefitRows = [
  {
    label: "Faster app feel",
    body: "Transactions become usable in seconds while settlement continues on Cardano L1.",
  },
  {
    label: "A clearer exit path",
    body: "Deposit once, transact as much as you like, and withdraw when you're done.",
  },
] as const;

/* The user side of network economics — /economics folded into the audience
   pages 2026-07-11; the cross-entity table lives on /#economics. */
const economicsRows = [
  {
    label: "What you pay",
    body: "Fees paid in ADA, 10 to 30x lower than L1. No new fee asset is required.",
  },
  {
    label: "What you hold",
    body: "ADA for fees. No separate Midgard fee asset to buy, hold, or manage.",
  },
  {
    label: "Where value settles",
    body: "Commitments are posted to Cardano before the challenge window; verified state settles after verification.",
  },
  {
    label: "The whole picture",
    body: "Compare what every participant pays and earns across the network.",
    href: "/#economics",
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
    body: "Return settled value through Cardano when you are done.",
  },
] as const;

const statusRows = [
  {
    label: "Preprod and scam safety",
    body: "The next public phase runs on Cardano preprod; use test ADA only. There is no Midgard token. Fees are paid in ADA. Start from official links, and never share a seed phrase or private key.",
    href: "/official-links",
  },
] as const;

export default function UsersPage() {
  return (
    <main className="page-main page-main--users">
      {/* The terraced "steps" — Dave's pick for this page (2026-07-11),
          inherited from the retired /economics page. */}
      <PageBackdrop name="terraces" variant="full" focus="58% 68%" mobileFocus="63% 66%" vivid />
      <PageHero
        compact
        tone="moss"
        label="Users"
        title="Faster execution for Cardano apps"
        sub="Confirmations in seconds, fees paid directly in ADA, and settlement through Cardano L1."
        body={BENCHMARK_STATUS_NOTES.performanceCost}
        actions={[
          { label: "Learn how it works", href: "/learn", variant: "primary" },
          { label: "Read FAQs", href: "/learn#faq", variant: "ghost" },
        ]}
      />

      <JumpChips
        items={[
          { id: "applications", label: "Applications" },
          { id: "benefits", label: "Benefits" },
          { id: "economics", label: "Economics" },
          { id: "path", label: "Simple path" },
          { id: "status", label: "Status" },
        ]}
      />

      <Section id="applications" title="Applications coming to Midgard" tight>
        <div
          className={styles.applicationBoard}
          role="img"
          aria-label="Applications coming to Midgard. Coming soon."
        >
          <div className={styles.applicationTiles} aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span className={styles.applicationTile} key={index} />
            ))}
          </div>
          <p className={styles.applicationStatus}>Coming soon</p>
        </div>
      </Section>

      <Section
        id="benefits"
        title="Why it feels different"
        cols
      >
        <DataRows rows={benefitRows} ariaLabel="User benefits" />
      </Section>

      <Section
        id="economics"
        title="Fees and settlement"
        cols
      >
        <DataRows rows={economicsRows} ariaLabel="User economics" />
      </Section>

      <Section
        id="path"
        title="The simple path"
        cols
        aside={
          <Statement
            align="left"
            kicker="User path"
            line="Deposit. Transact. Withdraw."
            sub="Normal users should not need to manage the verification path."
          />
        }
      >
        <DataRows rows={simplePathRows} ariaLabel="Simple Midgard user path" />
      </Section>

      <Section id="status" title="What to know right now" tight cols>
        <DataRows rows={statusRows} ariaLabel="User status and safety notes" />
      </Section>
    </main>
  );
}
