import { Section, Prose, Actions } from "./ui";
import { StackChips } from "./StackChips";
import { GitHubIcon } from "./BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   AboutFold — the About page's substantive sections (thesis, who-builds-it,
   the Cardano stack), folded onto the home page. The About route was removed;
   its hero, the testnet-status cards, and the closing band were dropped.
   ========================================================================= */

export function AboutFold() {
  return (
    <>
      <Section eyebrow="The thesis" title="Throughput, with correctness intact.">
        <Prose
          items={[
            {
              text: "The usual way to scale a chain is to leave it: move to a faster network, accept a weaker or less familiar security model, learn a foreign stack, and fragment liquidity on the way out.",
            },
            {
              text: "Midgard takes the harder route. Applications run at Layer 2 speed in a Cardano-native environment, and the trust path settles back to Cardano L1.",
              variant: "emph",
            },
            {
              text: "Scale is the goal. Correctness is the constraint that does not move.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <Section eyebrow="Who builds it" title="Built by Anastasia Labs.">
        <Prose
          items={[
            {
              text: "Midgard comes from Anastasia Labs, a team building Cardano infrastructure and open-source tooling for serious on-chain systems.",
            },
            {
              text: "The protocol is open, the implementation can be inspected, and the status page makes clear what's live, planned, and simulated.",
              variant: "dim",
            },
          ]}
        />
        <Actions
          items={[
            {
              label: "View GitHub",
              href: OFFICIAL_LINKS.github,
              variant: "ghost",
              icon: <GitHubIcon size={15} />,
            },
          ]}
        />
      </Section>

      <Section eyebrow="Built with" title="The Cardano stack, end to end.">
        <StackChips />
      </Section>
    </>
  );
}
