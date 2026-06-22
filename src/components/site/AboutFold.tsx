import { Section, Prose, Actions } from "./ui";
import { StackChips } from "./StackChips";
import { GitHubIcon } from "./BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   AboutFold — the About page's substantive sections (thesis, who-builds-it,
   the security stack), folded onto the home page. The About route was removed;
   its hero, the testnet-status cards, and the closing band were dropped.
   ========================================================================= */

export function ThesisSection() {
  return (
    <Section eyebrow="The thesis" title="Fast UTXO execution. L1-rooted security.">
      <Prose
        items={[
          {
            text: "UTXO finance should not have to choose between speed and security. Midgard gives UTXO applications faster execution with settlement anchored to L1.",
          },
          {
            text: "Security comes from mathematically verified smart contracts, fault-proof verification, and a smaller eUTXO attack surface.",
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

      <Section eyebrow="Who builds it" title="Built by Midgard Labs">
        <Prose
          items={[
            {
              text: "Midgard is built by Midgard Labs for UTXO applications that need faster execution and L1-rooted settlement.",
            },
            {
              text: "The protocol is open and the code can be inspected. Public claims should stay tied to live status, measured benchmarks, and approved protocol parameters.",
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

      <Section eyebrow="Built with" title="The starting stack">
        <StackChips />
      </Section>
    </>
  );
}
