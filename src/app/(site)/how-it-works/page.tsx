import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";
import { NextSteps } from "@/components/site/NextSteps";
import { Term } from "@/components/site/Term";
import { Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back to Cardano.",
  openGraph: {
    title: "How Midgard Works",
    images: [{ url: "/og/how-it-works.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/how-it-works.jpg"] },
};

/* The five journey beats, restated as plain anchored text so the page works
   without the scroll ride — on phones, short viewports, reduced motion, for
   skimmers, and for search engines. */
const STEPS = [
  {
    id: "step-submit",
    num: "01",
    tag: "Off-chain · L2",
    title: "Submit",
    body: (
      <>
        A transaction enters Midgard and is validated against{" "}
        <Term k="eutxo">eUTXO</Term> rules immediately. You get a soft
        confirmation in moments, with no Cardano block wait.
      </>
    ),
  },
  {
    id: "step-sequence",
    num: "02",
    tag: "L2 operator",
    title: "Sequence",
    body: (
      <>
        The <Term k="operator">operator</Term> orders incoming transactions
        and assembles them into a Layer 2 block, fixing the order the chain
        will execute.
      </>
    ),
  },
  {
    id: "step-commit",
    num: "03",
    tag: "L1 state queue",
    title: "Commit",
    body: (
      <>
        The <Term k="batcher">batcher</Term> posts a compact{" "}
        <Term k="state-commitment">state commitment</Term> for the block to
        Cardano, where it enters the on-chain state queue for anyone to
        inspect.
      </>
    ),
  },
  {
    id: "step-watch",
    num: "04",
    tag: "Challenge window",
    title: "Watch",
    body: (
      <>
        Independent <Term k="watcher">watchers</Term> re-execute the block
        during the <Term k="challenge-window">challenge window</Term>. An
        invalid commitment can be removed by a single{" "}
        <Term k="fraud-proof">fraud proof</Term>.
      </>
    ),
  },
  {
    id: "step-settle",
    num: "05",
    tag: "L1 confirmed",
    title: "Settle",
    body: (
      <>
        No fraud and maturity ends: the block merges into confirmed state.{" "}
        <Term k="settlement">Settlement</Term> makes it as final as Cardano
        itself.
      </>
    ),
  },
];

export default function HowItWorksPage() {
  // The flagship 3D transaction journey leads the page; the anchored recap
  // below restates the five beats in plain text (mobile, short viewports,
  // reduced motion, SEO), then hands off to the rest of the protocol trio.
  return (
    <HowItWorksExperience>
      <Section
        eyebrow="The five steps"
        title="The same journey, in plain text"
        tight
      >
        <p className="body" style={{ maxWidth: "62ch" }}>
          Midgard is a Cardano-native{" "}
          <Term k="optimistic-rollup">optimistic rollup</Term>: execution
          happens on a fast Layer 2, and every result settles back to Cardano.
          Each stage below is the scroll journey above, restated.
        </p>
        <div className="hiw-steps" style={{ marginTop: 26 }}>
          {STEPS.map((s) => (
            <article className="hiw-step-card" id={s.id} key={s.id}>
              <span className="hiw-step-card__num">{s.num}</span>
              <span className="hiw-step-card__tag">{s.tag}</span>
              <h3 className="hiw-step-card__title">{s.title}</h3>
              <p className="hiw-step-card__body">{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <NextSteps
        items={[
          {
            label: "Read the security model",
            sub: "The challenge and proof design that keeps operators honest",
            href: "/security",
          },
          {
            label: "Inspect the contracts",
            sub: "Verify the on-chain addresses yourself",
            href: "/contracts",
          },
          {
            label: "Choose your path",
            sub: "Start as a user, start building, or run the protocol",
            href: "/get-started",
          },
        ]}
      />
    </HowItWorksExperience>
  );
}
