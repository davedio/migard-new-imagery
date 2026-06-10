import { Section, Prose, Actions } from "./ui";
import { StackChips } from "./StackChips";
import { GitHubIcon } from "./BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   AboutFold — the About page's substantive sections (thesis, who-builds-it,
   the Cardano stack), folded onto the home page. The About route was removed;
   its hero, the testnet-status cards, and the closing band were dropped.
   ========================================================================= */

export function ThesisSection() {
  return (
    <Section eyebrow="The thesis" title="Scale that stays on Cardano">
      <Prose
        items={[
          {
            text: "The usual way to scale a blockchain is to leave it — move to a faster network, accept a weaker security model, learn a new stack, and split your liquidity on the way out.",
          },
          {
            text: "Midgard keeps you on Cardano. Your apps run at Layer 2 speed, and every result settles back to Cardano L1.",
            variant: "emph",
          },
        ]}
      />
    </Section>
  );
}

export function AboutFold({ showThesis = true }: { showThesis?: boolean } = {}) {
  return (
    <>
      {showThesis && <ThesisSection />}

      <Section eyebrow="Who builds it" title="Built by Anastasia Labs">
        <Prose
          items={[
            {
              text: "Midgard is built by Anastasia Labs, a team that builds Cardano infrastructure and open-source developer tooling.",
            },
            {
              text: "The protocol is open and the code can be inspected. The status page shows what's live, what's planned, and what's still simulated.",
              variant: "dim",
            },
          ]}
        />
        <Actions
          items={[
            {
              label: "Read the full story",
              href: "/about",
              variant: "ghost",
            },
            {
              label: "View GitHub",
              href: OFFICIAL_LINKS.github,
              variant: "ghost",
              icon: <GitHubIcon size={15} />,
            },
          ]}
        />
      </Section>

      <Section eyebrow="Built with" title="The Cardano stack, end to end">
        <StackChips />
      </Section>
    </>
  );
}
